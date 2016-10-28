(ns mx.interware.cbot.web.views.services
  (:use
    [mx.interware.cbot.web.views.common :as common]
    [noir.content.getting-started]
    [noir.core :only [defpartial defpage]]
    [hiccup.page :only [include-css include-js html5]])
  (:require
    [clojure.data.json :as json]
    [clojure.tools.logging :as log]
    [clojure.java.shell :as sh]
    [mx.interware.util.basic :as basic]
    [mx.interware.util.crypt :as crypt]
    [mx.interware.cbot.globals :as CG]
    [mx.interware.cbot.store :as store]
    [mx.interware.cbot.core :as core]
    [mx.interware.cbot.operations :as opr]
    [mx.interware.node.core :as bcore]
    [mx.interware.cbot.web.model.services :as services]
    [mx.interware.cbot.web.model.db :as db]
    [mx.interware.node.db.confdb :as confdb]
    [mx.interware.node.db.nodedb :as nodedb]
    [noir.response :as resp]
    [clojure.data.codec.base64 :as base64]
    [clj-http.client :as http]))

(do
  (println "loading " *ns*)
  )

(defonce DONE (json/json-str "done"))
(defonce OK (json/json-str "ok"))
(defonce ERROR (json/json-str "error"))


(common/iw-defpage "/apps" []
  (services/app-names :json))

(private-page "/clj/apps" []
  (services/app-names :clojure))

(common/iw-defpage "/apps/:app-name" {:keys [app-name]}
  (services/app-instances :json app-name))

(private-page "/clj/apps/:app-name" {:keys [app-name]}
  (services/app-instances :clojure app-name))

(common/iw-defpage "/conf/:app-name" {:keys [app-name]}
  (services/app-conf :json app-name))

(private-page "/clj/conf/:app-name" {:keys [app-name]}
  (services/app-conf :clojure app-name))

(common/iw-defpage "/apps/:app-name/:inst-name" {:keys [app-name inst-name cmd uuid timeout msg]}
  (services/send-cmd app-name inst-name cmd {:uuid uuid
                                          :timeout (basic/to-long timeout)
                                          :msg msg} :json))

(private-page "/clj/apps/:app-name/:inst-name" {:keys [app-name inst-name cmd uuid timeout msg]}
  (services/send-cmd app-name inst-name cmd {:uuid uuid
                                             :timeout (basic/to-long timeout)
                                             :msg msg} :clojure))

(common/iw-defpage [:post "/apps/:app-name/:inst-name"] {:keys [app-name inst-name cmd uuid timeout msg]}
  (services/send-cmd app-name inst-name cmd {:uuid uuid
                                             :timeout (basic/to-long timeout)
                                             :msg msg} :json))

(private-page [:post "/clj/apps/:app-name/:inst-name"] {:keys [app-name inst-name cmd uuid timeout msg]}
  (services/send-cmd app-name inst-name cmd {:uuid uuid
                                             :timeout (basic/to-long timeout)
                                             :msg msg} :clojure))

(private-page "/operations" []
  (services/get-operations :json))

(private-page "/clj/operations" []
  (services/get-operations :clojure))

(private-page [:post "/store/save/:app-name"] {:keys [app-name conf]}
  (log/info (str "/store/save/ " app-name " \n" conf))
  (services/app-save-conf :json app-name conf))

(private-page [:post "/clj/store/save/:app-name"] {:keys [app-name conf]}
  (log/info (str "/clj/store/save/ " app-name " \n" conf))
  (services/app-save-conf :clojure app-name conf))

(private-page "/store/remove/:app-name" {:keys [app-name]}
  (services/app-remove :json app-name))

(private-page "/clj/store/remove/:app-name" {:keys [app-name]}
  (services/app-remove :clojure app-name))

(private-page [:post "/store/set-node-conf"] {:keys [parameters]}
  (services/set-node-conf :json parameters))

(private-page [:post "/clj/store/set-node-conf"] {:keys [parameters]}
  (services/set-node-conf :clojure parameters))

(private-page [:get "/store/get-node-conf"] {}
  (services/get-node-conf :json))

(private-page [:get "/clj/store/get-node-conf"] {}
  (services/get-node-conf :clojure))

(private-page "/log" []
  (html5 (services/report-log)))

;(common/private-page "/admin/get-runtime-status" []
(common/iw-defpage "/central2node/get-runtime-status" []
  (services/get-runtime-status :json))

;(common/private-page "/clj/admin/get-runtime-status" []
(common/iw-defpage "/central2node/clj/get-runtime-status" []
   (services/get-runtime-status :clojure))

(common/iw-defpage [:post "/central2node/set-runtime-status"] mapa
  (let [[k v] (first mapa)
        v (into [] (filter #(not= % :-) (map #(keyword %) (read-string v))))
        mapa {k v}]
    (services/set-runtime-status :json mapa)))

(common/iw-defpage "/central2node/clj/set-runtime-status" {:keys [status]}
  (let [status (read-string status)]                   
    (services/set-runtime-status :clojure status)))

(common/iw-defpage [:post "/central2node/change-central-ip-port"] {:keys [central-ip central-port]}
  (try
    (CG/change-central-web-info central-ip central-port)
    {:status 200
     :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
     :body (format "OK node @ %s:%s, central-ip & port changed to %s:%s" (CG/get-ip-node) (CG/get-port-node) central-ip central-port)}
    (catch Exception e
      {:status 500
       :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
       :body (.getMessage e)})))


(common/private-page [:get "/admin/get-rts-of"] {:keys [ip]}                   
  (let [base (str ip)
        uri (str base "/central2node/get-runtime-status")]  ;;añadir token para que el nodo sepa que es su central!!
    (try
      (binding [clj-http.core/*cookie-store* (clj-http.cookies/cookie-store)]
        ;(http/post (str base "/login") {:form-params {:userid "admin" :pass "123456"}})
        (let [result (:body (http/get uri))]
          (bcore/log-event ip (str "succes of invocation " uri " !"))
          (json/json-str result)))
      (catch Exception e
        (bcore/log-event ip e (str "failure of invocation " uri " !"))
        {:status 500
         :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
         :body (str "Error:" (.getMessage e) " ")}))))

;{:apps {:default [:inst1 :inst3]}
; :ips [ip1 ip2 ip3]}

; :form-params {ips[] [10.3.3.199 10.3.3.215], apps[Default][] [dos uno]},

;(common/private-page [:post "/admin/set-rts-of"] {:keys [apps ips]}
(common/private-page [:post "/admin/set-rts-of"] {:keys [apps ips]}
  (log/debug "iniciando set-rts-of " apps ips)
  (let [resp (reduce
               (fn [r r-i]
                 (if (and (map? r-i) (= 500 (:status r-i)))
                   (conj r (str "Error connecting " (:ip r-i) ":" (:body r-i)))
                   r))
               []
               (pmap (fn [ip]
                      (let [uri (str ip "/central2node/set-runtime-status")]
                        (try
                          (let [result (:body (http/post uri {:form-params
                                                              (into {} (map (fn [[k v]]
                                                                              {k (str v)})
                                                                            apps))}))]
                            (bcore/log-event ip (str "succes of invocation " uri))
                            result)
                          (catch Exception e 
                            (bcore/log-event ip e (str "failure of invocation " uri))
                            {:status 500
                             :ip ip
                             :body (.getMessage e)}))))
                    ips))]
    (if (> (count resp) 0)
      {:status 500
       :headers {"Content-Type" "text/json; charset=ISO-8859-1"}
       :body (json/json-str resp)}
      DONE)))

(defn create-map-from-confDB [remote-addr appk instk]
  (into {} (map (fn [{:keys [campo valor]}]
                  {(keyword campo) valor})
                (if (not (nil? instk))
                  (confdb/get-conf remote-addr (name appk) (name instk))
                  (if (not (nil? appk))
                    (confdb/get-conf remote-addr (name appk))
                    (confdb/get-conf remote-addr))))))


(defn refine-conf-for [ip appk app-conf]
  (log/debug "refine-conf-for (1) ip:" ip " app-conf:" app-conf)
  (let [cbot-info (deref mx.interware.cbot.store/app-store)
        node-conf (into (or (:node-conf cbot-info) {}) (create-map-from-confDB ip nil nil))
        parameters (into (or (:parameters app-conf) {}) (create-map-from-confDB ip appk,nil))
        new-app-conf (reduce (fn [app-conf [instk inst-conf]]
                               (update-in app-conf [:instances instk :param-map] into (create-map-from-confDB ip appk instk))) 
                             (assoc app-conf :parameters parameters) (or (app-conf :instances) {}))]
    (log/debug "refine-conf-for (1) ip:" ip " new-app-conf:" new-app-conf)
    {:node-conf node-conf :app-conf new-app-conf}))

;; En el atom siguiente se almacenan las aplicaciones que no pudieron ser entregadas por la central a los nodos, la idea es que
;; los nodos puedan posteriormete (proactivamente) venir al central a recoger su configuracion
;; el atom contiene como llave la url del nodo y asociado las aplicaciones ya personalizadas para el nodo,
;; cuando el nodo la recoge se elimina del mapa, si se genera una nueva distribucion antes que el nodo la recoga, se ensima.

(def pending-apps (atom {}))

(common/private-page [:post "/admin/synch-send-app-to"] {:keys [apps ips]}
  (log/debug "synch-send-app-to: " apps " " ips)
  (let [tmp-pending-apps (atom nil)
        resp (reduce
               (fn [r r-i]
                 (if (and (map? r-i) (= 500 (:status r-i)))
                   (conj r (str "Error connecting " (:ip r-i) ":" (:body r-i)))
                   r))
               []
               (for [app apps ip ips] 
                 (let [uri (str ip "/central2node/set-app-conf")]
                   (log/debug "for send-app-to: " app " " ip " " uri)
                   (let [appk (keyword app)
                         app-info (appk (store/get-configuration))
                         refined-app-info (str (refine-conf-for ip appk app-info))]
                     (try
                       ;(throw (Exception. "de mentis"))
                       (let [result (http/post uri {:headers {"content-type" "text/html; charset=UTF-8"}
                                                    :form-params 
                                                    {:appl app 
                                                     :conf refined-app-info}})]
                         (bcore/log-event ip (str "app:" app " sent to " uri "!"))
                         result)
                       (catch Exception e 
                         (bcore/log-event ip e (str "app:" app " NOT sent to " uri "!"))
                         (swap! tmp-pending-apps assoc-in [ip appk] refined-app-info)
                         {:status 500
                          :ip ip
                          :app app
                          :body (.getMessage e)}))))))]
    (when @tmp-pending-apps
      (swap! pending-apps into @tmp-pending-apps))
    (if (> (count resp) 0)
      {:status 500
       :headers {"Content-Type" "text/json; charset=ISO-8859-1"}
       :body (json/json-str resp)}
      DONE)))
;nueva manera asyncrona
;hacemos el for que crea los pending apps y los mandamos a un agente que los procesa de uno en uno reciclandose los que no sean posibles un numero de 3 veces

; contiene la lista de los ultimos 100 actualizados
(def app-sender (agent {:total 0 :lista nil}))

(common/private-page [:post "/admin/asynch-send-app-to"] {:keys [apps ips]}
  (log/debug "asynch-send-app-to: " apps " " ips)
  (if-not (await-for 5000 app-sender)
    (json/json-str (format "Por el momento se están mandando aplicaciones a los nodos, por favor intente más tarde, se han procesado %d/%d" (count (:lista @app-sender)) (:total @app-sender)))
    (do
      (send app-sender (fn [old]
                         (println "Reseteando app-sender datos anteriores:" (str old))
                         {:total (* (count apps) (count ips)) :lista nil}))
      (dorun (for [app apps ip ips] 
               (let [uri (str ip "/central2node/set-app-conf")
                     appk (keyword app)
                     app-info (appk (store/get-configuration))
                     refined-app-info (str (refine-conf-for ip appk app-info))]
                 (send app-sender (fn [{:keys [total lista] :as info} uri params]
                                    ;(println "***** DURMIENDO " uri params)
                                    ;(Thread/sleep 10000)
                                    (let [sdf (java.text.SimpleDateFormat. "yyyy-MM-dd HH:mm:ss.SSS")
                                          lst lista] ;(if (> (count lst) 100) (butlast lst) lst)]
                                      (try 
                                        (let [result (http/post uri params)]
                                          (if (= 500 (:status result))
                                            (do
                                              (swap! pending-apps assoc-in [ip appk] refined-app-info)
                                              (assoc info :lista (-> lst (conj (format "%s %s Err: %s" (.format sdf (java.util.Date.)) uri (str (:body result)))))))
                                            (assoc info :lista (-> lst (conj (format "%s %s OK" (.format sdf (java.util.Date.)) uri))))))
                                        (catch Exception e
                                          (swap! pending-apps assoc-in [ip appk] refined-app-info)
                                          (assoc info :lista (-> lst (conj (format "%s %s Err: %s" (.format sdf (java.util.Date.)) uri (.getMessage e)))))))))
                       uri {:headers {"content-type" "text/html; charset=UTF-8"}
                            :form-params {:appl app 
                                          :conf refined-app-info}}))))
      (json/json-str "El proceso de envío de aplicaciones iniciado!"))))

(common/private-page [:post "/admin/asynch-send-app-to-info"] []
  (json/json-str @app-sender))                     

(defn exists-ip&public [ip public]
  (if-not public
    (let [r (db/db-read "select * from node where ip=? and pubkey is null" ip)]
      (log/debug "r=" r)
      r)
    (let [r2 (db/db-read "select * from node where ip=? and pubkey=?" ip public)]
      (log/debug "r2=" r2)
      r2)))
    

(def current-nodes (atom {}))

(defn create-secure-token [central-pub node-priv session-uuid]
  (let [token (str session-uuid "~" (System/currentTimeMillis))]
    (crypt/encrypt-asymetric
      (crypt/encrypt-asymetric
        token
        node-priv)
      central-pub)))

(defn validate-secure-token [central-priv node-url node-pub token]
  (when-let [{:keys [pubkey uuid]} (@current-nodes node-url)]
    (try
      (log/debug "validate-secure-token :" central-priv node-url node-pub token)
      (let [uncrypt-token (crypt/decrypt-asymetric
                              token central-priv)
            dummy (println " uncrypt-token 1)" uncrypt-token)
            uncrypt-token (crypt/decrypt-asymetric 
                            uncrypt-token
                            node-pub)
            dummy (println " uncrypt-token 2)" uncrypt-token)
            tilde (.indexOf uncrypt-token "~")]
        (log/debug "uncrypt-token :" uncrypt-token uuid (= (str uuid) (subs uncrypt-token 0 tilde)))
        (when (> tilde 0)
          (= (str uuid) (subs uncrypt-token 0 tilde))))
      (catch Throwable t
        (log/debug "Invalid secure token: " (.getMessage t))))))

(defn valid-url-nodeOrIP [url-node remote-addr port token]
  (if url-node
    (let [{:keys [pubkey session-uuid]} (@current-nodes url-node)
          valid? (validate-secure-token (CG/get-private) url-node (crypt/str->public pubkey) token)]
      (if valid? url-node))
    (str "http://" remote-addr ":" port)))
  
;; definir servicio no protegido que inicia con /remote/... para verificar que sea de uno de nuestros nodos
(common/iw-defpage [:post "/remote/node-lookup-confs"] {:keys [port remote-addr url-node token]} ;; como es remote viene la ip del node en el request y con eso dicernimos que mandar
  (log/debug "node-lookup-confs " (or url-node (str "http://" remote-addr ":" port)))
  (log/debug "pending-apps: " pending-apps)
  (log/debug "token: " token)
  (if-let [uri (valid-url-nodeOrIP url-node remote-addr port token)]
    (let [dummy (log/debug "Valid uri:" uri)
          app-confs (@pending-apps uri)
          dummy (log/debug "app-confs:" app-confs)
          ;dummy (log/debug "exists :" (exists-ip&public uri public))
          ]
      (bcore/log-event uri "Heartbeat received")
      (if (and app-confs) ;(exists-ip&public uri public))
        (do
          (swap! pending-apps dissoc uri)
          (str app-confs))
        (json/json-str "NONE")))
    (json/json-str "NONE")))


(defn remote-params [& {:as extras}]
  (let [params {:port (CG/get-port-node)}
        params (if-let [url-node (CG/get-url-node)] 
                 (assoc params 
                        :url-node url-node
                        :token (create-secure-token 
                                 (CG/get-central-public) 
                                 (CG/get-private) 
                                 (CG/get-session-uuid)))
                 params)]
    (into params extras)))

;; invocar esta funcion periodicamente desde los nodos para ver si tienen configuraciones pendientes de envio
;; para el CFD se usa CFD-synch con un clojure operation
(defn node-lookup-confs []
  ;; invocar servicio en central para obtener confs de aplicaciones
  (log/debug "node-lookup-confs " (CG/heartbeat))
  (when (> (CG/heartbeat) 0)
    (try
      (Thread/sleep (CG/heartbeat))
      (let [;uri (str (CG/central-url-base) "/remote/node-lookup-confs?port=" (CG/get-port-node))
            params (remote-params)
            dummy (log/debug (str "LLendo por configuraciones a:/remote/node-lookup-confs params:" params))
            result (http/post (str (CG/central-url-base) "/remote/node-lookup-confs")
                              {;:headers {"content-type" "text/html; charset=UTF-8"}
                               :insecure? true
                               :form-params params})
            body (read-string (:body result))]
        (log/debug (str "configuraciones: " body))
        (if (not= body "NONE")
          (future
            (doseq [[appk conf-str] body]
              (let [conf (read-string conf-str)]
                (log/info "after lookup, configuring :" appk)
                (store/set-node-conf-and-app (:node-conf conf) appk (:app-conf conf))
                (core/stop-at-and-remove-old-and-restart appk :start)))
            (future-call node-lookup-confs))
          (future-call node-lookup-confs)))
      (catch Exception e
        (.printStackTrace e)
        (log/warn "Problemas de comunicación con el nodo central: " (.getMessage e))
        (future-call node-lookup-confs))))
  DONE)

(common/private-page [:post "/admin/send-app-to-new"] {:keys [apps ips]}
  (log/debug "send-app-to: " apps " " ips)
  (let [info-to-send (reduce 
                       (fn [result [uri http-app]]
                         (update-in result [uri] conj http-app))
                       {}
                       (for [ip ips app apps] 
                         (let [uri (str ip "/central2node/set-app-conf-new")
                               appk (keyword app)
                               app-info (appk (store/get-configuration))
                               result [uri {:appl app 
                                            :conf (str (refine-conf-for ip appk app-info))}]]
                           result)))]
    (reduce 
      (fn [errs [uri apps]]
        (let [result (http/post uri {:headers {"content-type" "text/html; charset=UTF-8"}
                                     :form-params {:apps apps}})] ; apps es una lista de mapas con {:appl app :conf the-conf}
          (if-not (= result DONE)
            (conj errs (str "Error connecting to " uri))
            errs)))
      []
      info-to-send)))


(common/private-page [:get "/admin/get-rts-of"] {:keys [ip appl timeout]}
  (let [uri (str ip "/central2node/clj/get-runtime-status")]
    (try
      (let [timeout (if timeout (Integer/parseInt (str timeout)) 30000)
            result (http/get uri {:socket-timeout timeout :conn-timeout timeout})
            mapa (read-string (:body result))]
        (log/debug "get-runtime-status result for :" uri " is " mapa " -> " appl)
        (bcore/log-event ip (str "succes of invocation " uri))
        (json/json-str (if appl (mapa (keyword appl)) mapa)))
      (catch Exception e 
        (bcore/log-event ip e (str "failure of invocation " uri))
        (log/warn "Error de comunicación con:" ip " " (.getClass e) "->" (.getMessage e))
        ;(.printStackTrace e)
        {:status 500
         :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
         :body (str "Error:" (.getMessage e) " ")}))))

(common/iw-defpage [:post "/central2node/set-app-conf-new"] {:keys [apps]} ; TODO FGC terminar esto
  ;(log/debug "\n\n@@@@@@ " conf)
  (let [apps (read-string apps) ; lista de mapas {:appl app :conf conf}
        ]
    ;(store/set-node-conf-and-app (:node-conf conf) appk (:app-conf conf))
    ;(core/stop-and-remove-old-app appk)
    DONE))

(common/iw-defpage [:post "/central2node/set-app-conf"] {:keys [appl conf]}
  ;(log/debug "\n\n@@@@@@ " conf)
  (let [conf (read-string conf)
        appk (keyword appl)]
    ;(store/set-node-conf (:node-conf conf))
    ;(store/set-app appk (:app-conf conf))
    (store/set-node-conf-and-app (:node-conf conf) appk (:app-conf conf))
    (core/stop-and-remove-old-app appk)
    DONE))

(comment common/private-page [get "/admin/create-db"] []
  (db/init-db))

(common/private-page [get "/admin/send-distro"] {:keys [ip]}
  (let [ip (subs ip (+ 2 (.indexOf ip "//")))
        ip (subs ip 0 (.indexOf ip ":"))]
    (if (= 0 (:exit (sh/sh "scp" "CCBOT3-distro.tgz" (str "cbotnode@" ip ":./"))))
      (sh/sh "ssh" (str "cbotnode@" ip) (str "cd .;tar -xvzf CCBOT3-distro.tgz")))))

(common/private-page [get "/admin/remote-start"] {url :ip}
  (let [ip (subs url (+ 2 (.indexOf url "//")))
        ip (subs ip 0 (.indexOf ip ":"))]
    (log/info "Starting " ip " using ssh")
    (let [result (sh/sh "ssh" (str "cbotnode@"ip) (str "cd CCBOT3-distro/;./start.sh >> ccbot.out &"))]
      (when (and (= (:exit result) 0) (= "" (:err result "")))
        (bcore/log-event url (str "ssh start succesful sent to " ip))
        (Thread/sleep 9000))
      (json/json-str result))))

(common/private-page [get "/admin/remote-stop"] {:keys [ip]}
  (log/info "Stopping " ip )
  (let [uri (str ip "/central2node/stop-ccbot")]
    (try
      (let [timeout 30000
            result (http/get uri {:socket-timeout timeout :conn-timeout timeout})
            mapa (read-string (:body result))]
        (bcore/log-event ip (Exception. "") (str "stop cbot sent to " uri))
        (json/json-str "OK"))
      (catch Exception e 
        (bcore/log-event ip e (str "failure of invocation " uri))
        (log/warn "Error de comunicación con:" ip " " (.getClass e) "->" (.getMessage e))
        {:status 500
         :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
         :body (str "Error:" (.getMessage e) " ")}))))

(common/iw-defpage [get "/central2node/stop-ccbot"] {}
  (log/warn "APAGANDO CCBOT en 5s, bye!")
  (future 
    (Thread/sleep 5000)
    (System/exit 0))
  "OK")

;(sh/sh "ssh" "192.168.1.184" "cd ccbot-distro-1.0.0; java -cp lib/ccbot-0.3.0-SNAPSHOT-standalone.jar mx.interware.cbot.web.server -central 192.168.1.248")


;clj/admin/get-runtime-status
(common/iw-defpage [:post "/proxy"] {:keys [base url params]}
  (log/debug "proxy " base " " url " -" params "- >>>>" (class params))
  (if params
    (let [params (into {} (map (fn [[k v]] [(name k) v]) params))
          result (http/post (str base url) {:basic-auth ["cbot" "iw"]
                                            :form-params params})]
      (log/debug params)
      (log/debug (:body result))
      (log/debug (class (:body result)))
      (:body result)
      )
    (let [result (http/get (str base url) {:basic-auth ["cbot" "iw"]})]
      (log/debug (:body result))
      (log/debug (class (:body result)))
      (:body result)
      )))


(defn node-login []
  ; esta funcionalidad solo se usa si estamos usando url-node
  ; ya que si es por IP el central le puede hablar al nodo y viceversa
  (Thread/sleep 10000)
  (log/debug "node-login :" (CG/get-url-node))
  (when-let [url-node (CG/get-url-node)]
    ; fabicar token inicial de identificacion:
    (try 
      (let [central (CG/central-url-base)
            public-str (CG/get-public-str)
            token (str url-node "~" (System/currentTimeMillis))
            dummy (log/debug "TOKEN1: " token " " url-node)
            token (crypt/encrypt-asymetric token (CG/get-private))
            dummy (log/debug "TOKEN2: " token)
            dummy (log/debug "invoking " (str central "/remote-node/login") token)
            token4node (:body (http/post (str central "/remote-node/login") 
                                         {:form-params {:url-node url-node :token token :pubkey public-str}
                                          :insecure? true}))
            [central-pub-str uuid] (read-string (crypt/decrypt-asymetric token4node (CG/get-private)))
            central-pub (crypt/str->public central-pub-str)
            uuid (crypt/decrypt-asymetric uuid central-pub)]
        (log/debug (str "Central public: " central-pub-str " UUID:" uuid))
        (CG/set-central-public&session-uuid central-pub-str central-pub uuid)
        (log/debug (str "intern-main-params " @CG/intern-main-params))
        (log/info "Iniciando proceso HEART BEAT para atracción de configuraciones (x url)")
        (future-call node-lookup-confs)
        "OK")
        (catch Exception e
          (.printStackTrace e)
          (println "\n\nNo existe información apropiada en el central para iniciar este nodo")
          (println "Central:" (CG/central-url-base))
          (println "Este nodo:" url-node)
          (println "Llave pub:" (CG/get-public-str))
          (println "Terminando proceso!")
          (System/exit 0)))))

(defn get-node-createORupdate 
 "returns all nodes"
  ([ip pubkey]
    (let [node (nodedb/get-node ip)]
      (cond (and node (:valid node) (= pubkey (:pubkey node))) 
            (do
              (log/debug "Nodo existe y es valido")
              node) ; existe y es valido
            
            node 
            (do
              (log/debug "nodo existe pero alguna cosa cambiada " node)
              (nodedb/upd-node (assoc node :pubkey pubkey :valid false))
              nil) ;existe pero no es valido (o no está válidado)
            
            :OTHERWISE 
            (do ; no existe -> lo damos de alta no válido
              (log/debug "Nodo no existe, se da de alta automaticamente")
              (nodedb/add-node {:ip ip :pubkey pubkey :shortn "UNKNOWN" :name "UNKNOWN" :valid false})
              nil)))))

(defn set-node-new-uuid [url pubkey]
  (let [uuid (java.util.UUID/randomUUID)]
    (swap! current-nodes assoc url {:uuid uuid :pubkey pubkey})
    (str uuid)))

(common/iw-defpage [:post "/remote-node/login"] {:keys [port remote-addr url-node token pubkey]} ;; como es remote viene la ip del node en el request y con eso dicernimos que mandar
  (log/debug "node-login " url-node)
  (try
    (log/debug (str "1) " url-node))
    (if-let [{:keys [pubkey]} (get-node-createORupdate url-node pubkey)]
      (do
        (log/debug (str "public: " pubkey "  token: " token))
        (log/debug (str "get-private:" (CG/get-private)))
        (let [node-public (crypt/str->public pubkey)
              TOKEN (crypt/decrypt-asymetric token node-public)
              tilde (.indexOf TOKEN "~")
              dummy (assert (= url-node (subs TOKEN 0 tilde)) "TOKEN INCORRECTO")
              uuid (set-node-new-uuid url-node pubkey)
              token4node (str [(CG/get-public-str) (crypt/encrypt-asymetric uuid (CG/get-private))])
              dummy (log/debug "token4node " token4node)
              token4node (crypt/encrypt-asymetric
                           token4node
                           node-public)]
          (bcore/log-event url-node "/remote-node/login successful")
          {:status 200 :body token4node}))
      (let [mensaje (str "TOKEN INVÁLIDO (cliente " url-node " existe y es válido? )")]
        (bcore/log-event url-node (Exception. mensaje) (str "/remote-node/login " mensaje))
        {:status 404 :body mensaje}))
    (catch Throwable e
      (bcore/log-event url-node e "/remote-node/login")
      {:status 404 :body (str "TOKEN INVALIDO con exception " (.getMessage e))})))

(comment
(defn authenticated? [usr pas]
  (and (= usr "cbot") (= pas "iw")))

(defn boot []
  (log/debug "booting cbot routes")
  (store/boot-store)
  (jetty/run-jetty #'app {:port 8088 :mode :dev}))
)