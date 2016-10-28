(ns mx.interware.node.cbot.helper
   (:require
    [clojure.data.json :as json]
    [clojure.tools.logging :as log]
    [mx.interware.node.db.confdb :as confdb]
    [mx.interware.node.db.estadb :as estadb]
    [clj-http.client :as http]))

;esta funcion no jala ni se usa !! REMOVED
(comment defn send-pending-stats [ctx]
  (let [maxrows (Integer/parseInt (or (:max-rows ctx) "10"))
        data (into [] (mx.interware.node.db.estadb/get-pend-ests maxrows))
        ;dummy1 (println "dummy1:" data)
        result (clj-http.client/post (str (:central-url-base) "/remote/service/estadisticas")
                                     {:form-params  {:vest-map-str (str data)}
                                      :insecure? true})
        body (read-string (:body result))]
    ;body tiene un vector con los ids de CESTADISTICA de los registros que se insertaron
    (log/debug "Body:" body " " (class body))
    ;; if body indica exito marcar registros como enviados!
    (when (= clojure.lang.PersistentVector (class body))
      (mx.interware.node.db.estadb/mark-enviados (into [] (map :id data))))
    body))

(defn clear-old-stats [ctx]
  (mx.interware.node.db.estadb/delete-old (Integer/parseInt (:max-dias ctx "7"))))

(defn ejecuta? [{:keys [hora minuto dia ejecuta-hh ejecuta-mm ejecuta-dia] :or {ejecuta-hh "XX"
                                                                                ejecuta-mm "XX"}}]
  (if (and (= dia ejecuta-dia) 
             (re-matches (re-pattern ejecuta-hh) hora) 
             (re-matches (re-pattern ejecuta-mm) minuto))
    "RUN"
    "SKIP"))