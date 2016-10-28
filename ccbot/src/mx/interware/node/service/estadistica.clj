(ns mx.interware.node.service.estadistica
  (:use
    [noir.core :only [defpartial defpage]]
    [clojure.test]
  )
  (:require
    [mx.interware.cbot.web.views.common :as common]
    [clojure.data.json :as json]
    [clojure.tools.logging :as log]
    [mx.interware.util.basic :as basic]
    [mx.interware.node.db.confdb :as confdb]
    [mx.interware.node.db.estadb :as estadb]
    [mx.interware.cbot.web.model.db :as db]
    [clj-http.client :as http]))


;;demo conf {:code (fn [context] (.....))}
;; la comunicacion siempre es con la central, lo que puede cambiar el la terminacion de la url, esta se manda
;; en el parametro service, ej: service=/remote/service/estadisticas entonces la url es:
;; http://ip-central:port-central/remote/service/estadisticas  !! OJO service DEBE iniciar con '/'
(defn post2central [central-url-base url-node public-str port-node stats-rows2send]
  (log/warn (str "PUBLIC:" public-str))
  (let [url (str central-url-base "/remote/service/estadisticas")
        ; Se obtienen los registros de la base de datos
        stats (estadb/get-pend-ests stats-rows2send)
        ; Se cren los parámetros con la forma necesaria.
        params {:vest-map-str (str (into [] stats))}]
    (log/debug "post2central.URL: " url "\n post2central.Params: " params)
    ; Se obtiene la respuesta del llamado al servicio.
    (let [form-params {:form-params (assoc params :node-port port-node :public public-str)
                       :insecure? true}
          form-params (if url-node 
                        (-> form-params
                          (assoc-in [:form-params :url-node] url-node)
                          (assoc-in [:form-params :public] public-str))
                        form-params)
          dummy (log/debug "post2central.Form-params :" form-params url-node)
          response (http/post url form-params)
          ; Se obtiene ya sea el vector de ids insertados en central o el error.
          response-body (read-string (:body response))]
      {:ids-sent (into [] (map :id stats))
       :ids-received response-body})))

(defn update-sent-stats [v-ids]
  (estadb/mark-enviados v-ids))

(defn clear-sent-stats [days]
  (estadb/delete-old days))

(defn get-short-name&pubkey [ip]
  (let [result (db/db-read "select * from node where ip=?" ip)]
    (if result
      (let [{:keys [shortn pubkey]} (first result)]
        [shortn pubkey])
      ["UNKNOWN" nil])))

; cambiamos node-port por url-node.
; antes el nodo mandaba al central el node-port explicitamente y la ip del nodo
; venia implicita en el request, ahora de forma explicita el nodo pone su url completa http://...
; y como en el central el nodo esta registrado con esa url ya no se manipula tanta cosa, lo
; malo es que facilmente un node puede decirle al central que es OTRO!!!, para evitar eso, el nodo
; mandará además un UUID que se auto asigna el nodo al arrancar por primera vez y este UUID también
; se registra en el central para validar la identidad del nodo !!
(common/iw-defpage
  [:post "/remote/service/estadisticas"] req ;{:keys [remote-addr vest-map-str node-port url-node public :as all]}
  (log/warn (str "0) " (pr-str req)))
  (let [{:keys [remote-addr vest-map-str node-port url-node public :as all]} req]

    (log/debug (str "1) " vest-map-str))

    (log/debug (str "2) " (if url-node url-node (str "http://" remote-addr ":" node-port))))

    (log/warn (str "3) " (pr-str all)))

    (try
      (let [vest-map (read-string vest-map-str)
            url (or url-node (str "http://" remote-addr ":" node-port))
            [shortn pubkey] (get-short-name&pubkey url)
            dummy (assert (= pubkey public) (str pubkey " not= " public))
            vrec (into [] (map (fn [est-map]
                                 (dissoc
                                   (assoc
                                     est-map :ip url
                                             :recibido (java.sql.Timestamp. (System/currentTimeMillis))
                                             :shortn shortn
                                             ;;poner el shortn de nodo para que las estadisticas no tengan relacion!!
                                             )
                                   :id :enviado))
                               vest-map))
            dummy (println (pr-str vrec))
            regs-inserted (into [] (estadb/add-est-central vrec))
            num-regs-inserted (count regs-inserted)]
        (str num-regs-inserted))
      (catch java.sql.SQLException sqle
        (.printStackTrace sqle)
        (let [result (str "\"" (.getName (class sqle)) " message:" (.getMessage sqle) " sql-state:" (.getSQLState sqle) " error-code:" (.getErrorCode sqle) "\"")]
          (log/debug "7)" result)
          result))
      (catch Exception e
        (.printStackTrace e)
        (str "\"" (.getName (class e)) "> " (.getMessage e) "\"")))))


