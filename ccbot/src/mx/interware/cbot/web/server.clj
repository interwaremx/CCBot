(ns mx.interware.cbot.web.server
  (:require [noir.server :as server]
            [noir.statuses :as status]
            [noir.util.crypt :as crypt]
            [ring.middleware.file :as file]
            ;[ring.middleware.file-info :as finfo]
            [clojure.tools.logging :as log]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.shell :as shell]
            [mx.interware.cbot.globals :as CG]
            [mx.interware.util.basic :as basic]
            [mx.interware.util.crypt :as iwcrypt]
            [mx.interware.cbot.store :as store]
            [mx.interware.cbot.core :as core]
            [mx.interware.cbot.web.views.common :as common]
            [mx.interware.cbot.web.views.services :as services]
            [mx.interware.cbot.web.views.cbothtml :as cbothtml]
            [mx.interware.cbot.web.model.db :as db]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.harutils :as haru]
            [buddy.core.keys :as ks]
            [buddy.core.dsa :as dsa]
            [clojure.data.codec.base64 :as b64]

            )
  (:gen-class)
  )

(do
  (println "loading " *ns*)
  )


(def route-help
  {#(.startsWith % "/central2node/") :central2node
   #(.startsWith % "/remote/") :remote
   #(= % "/remote-node/login") :login
   #(#{"/admin/get-rts-of" "/admin/set-rts-of"} % ) :getORset-rts-of
   #(= % "/admin/reporte-get") :reporte-get
   #(= % "/admin/reporte-har") :reporte-har
   #(re-matches #".*/reporte/[a-zA-Z0-9\-_]+$" %) :reporte})

(defn router [get-ip-server-central handler request]
  (log/debug "serving:" (:uri request))
  (log/debug "request: " request)
  (if-let [r (first (filter identity (map (fn [[fun k]] (if (fun (:uri request)) k)) route-help)))]
    r
    :default))

(defmulti hrequest router :default :default)

;las peticiones :central2node son las que el central invoca hacia el nodo para para preguntarle cosas
; o inyectarle configuraciones por eso el nodo solo las recibe si vienen del central configurado en el nodo
; estas peticiones no estan en un segmento privado ya que en el nodo nadie está firmado !!!
(defmethod hrequest :central2node [get-ip-server-central handler request]
  (log/debug (str "central2node request:" request))
  (log/debug (str "central2node > ip-central: " (get-ip-server-central) " remote-addr: " (:remote-addr request)))
  (if (= (:remote-addr request) (get-ip-server-central))
    (handler request)
    {:status 403 :body "Petición inválida"}))

;los /remote son servicios que el central prove a los nodos, por ahora el central saca del request
;la ip del nodo para dicernir si viene de alguno de sus nodos!!! 
; esto se cambio a que opcionalmente el nodo manda node-url = http://nombre-del-nodo:puerto/uuid-del-nodo
; este parametro node-url es el identificador de la base de datos del central con el que el
; central valida que es una peticion de alguno de sus nodos
(defmethod hrequest :remote [get-ip-server-central handler request]
  ; validamos que o biene el puerto del nodo y entonces aumentamos al request la ip del remote-addr
  ; o en el request biene el node-url uno o el otro, si bienen los dos gana el node-url
  (if (get-in request [:params :node-url])
    (handler request)
    (handler (assoc-in request [:params :remote-addr] (:remote-addr request)))))

(defmethod hrequest :login [get-ip-server-central handler request]
  (let [request (assoc-in request [:params :remote-addr] (:remote-addr request))]
    (handler request)))

(defmethod hrequest :getORset-rts-of [get-ip-server-central handler request]
  (let [resp (handler request)]
    (log/debug resp)
    resp))

(defmethod hrequest :reporte-get [get-ip-server-central handler request]
  (let [response (handler (assoc-in request [:params :remote-addr] (:remote-addr request)))
        response (assoc-in response [:headers "Content-Disposition:"] "attachment; filename=\"reporte.csv\"")]
    response))

(defmethod hrequest :reporte [get-ip-server-central handler request]
  (let [uri (:uri request)
        last-slash (.lastIndexOf uri "/")
        fname (subs uri (inc last-slash))
        response (handler request)
        response (assoc-in response [:headers "Content-Disposition:"] (str "attachment; filename=\"" fname ".csv\""))]
    response))

(defmethod hrequest :default [get-ip-server-central handler request]
  (let [response (handler request)]
    (log/debug "http code:" (:status response))
    response))

(defn extract-host-ip [get-ip-server-central handler]
  (partial hrequest get-ip-server-central handler))

(defn dame-token []
  (.hashCode (str (java.util.Date. (* (quot (System/currentTimeMillis) 1000) 1000)))))

;; esta funcion se usara luego para cerrar las comunicaciones que no sean ssl !!!
(defn remove-non-ssl-connectors [server]
  (doseq [c (.getConnectors server)]
    (when-not (or (nil? c) (instance? org.mortbay.jetty.security.SslSocketConnector c))
      (.removeConnector server c)
  ))
  server)

(defn get-ccbot-pass []
  (let [f-pas (java.io.File. "../../CCBOT.PASS")]
    (println (.getCanonicalPath f-pas) " " (.exists f-pas))
    (if (.exists f-pas)
      (do
        (let [pass (.replaceAll (slurp f-pas) "\n" "")]
          (.delete f-pas)
          pass))
      (let [in (java.util.Scanner. (java.io.BufferedInputStream. (System/in)))]
          (println "Por favor digite el password del usuario ccbot :")
          (.next in)))))

(defn validator [vence]
  (Thread/sleep 60000)
  (try
    (if (.after (java.util.Date.) vence)
      (throw (java.lang.Exception. "Problemas graves por favor comuniquese a InterWare de México, su licencia expiró"))
      (future-call (partial validator vence)))
    (catch Exception e
      (.printStackTrace e)
      (System/exit 0))))

(def BACK-DOOR (atom false))

(defn no-registrada? "Indica si info no es igual a lic-info o si no está en lic-info dependiendo si lic-info es string o set"
  [lic-info info]
  (cond
    (set? lic-info)
    (not (lic-info info))

    (string? lic-info)
    (not= lic-info (str info))

    :OTHERWISE
    true))

(defn valida [ip-central port-central host-address]
  (try
    (let [conf (read-string (slurp "KEYS/conf-pub.edn"))
          pub-key (ks/public-key
                    (io/as-file (:pub-key conf)))
          datos-licencia (read-string (slurp "datos-licencia.edn"))
          firma-leida (slurp "firma-licencia")
          firma-bytes (b64/decode (.getBytes firma-leida "UTF-8"))]
      (println "Validando licencia:" firma-leida)
      (println datos-licencia)
      (when-not @BACK-DOOR
        (if (or (no-registrada? (:host-address datos-licencia) host-address)
                (no-registrada? (:central-ip datos-licencia) ip-central)
                (no-registrada? (:port-central datos-licencia) port-central))
          (throw (java.lang.Exception. (str
                                         "Problemas graves por favor comuniquese a InterWare de México, su info es: "
                                         host-address "," ip-central "," port-central "," (pr-str datos-licencia)))))
        (if-not (dsa/verify (pr-str datos-licencia) firma-bytes {:key pub-key :alg :rsassa-pss+sha256})
          (throw (java.lang.Exception. (str
                                         "Problemas graves por favor comuniquese a InterWare de México, Firma incorrecta:"
                                         host-address "," ip-central "," port-central "," (pr-str datos-licencia)))))
        (future-call (partial validator (:vence datos-licencia)))))
    (catch Exception e
      (.printStackTrace e)
      (System/exit 0))))

(defn main [& m]
  (println m)
  (let [params (reduce (fn [p [k v]]
                         (assoc p (keyword k) v))
                       {}
                       (partition 2 m))
        port-node (:-port params "8050")
        host-address (-> (java.net.InetAddress/getLocalHost) (.getHostAddress))
        ip-central (:-central params)
        port-central (:-port-central params)
        url-central (:-url-central params)
        url-node (:-url-node params)
        require-pkgs (:-require-pkgs params)
        use-running (:-use-running params "true")
        back-door (:-use-iw params)
        node-heartbeat (java.lang.Integer/parseInt (:-node-heartbeat params "-1"))]
    (println "host-address:" host-address)
    (println "central-ip:" ip-central)
    (when back-door
      (let [cal (java.util.Calendar/getInstance)
            anio (.get cal java.util.Calendar/YEAR)
            mes (.get cal java.util.Calendar/MONTH)
            h (.hashCode (str anio mes))
            ]
        (when (= (str h) back-door)
          (println "Using special security token " h)
          (reset! BACK-DOOR true))))
    (let [node-file (java.io.File. "NODE.ID")]
      (when-not (.exists node-file)
        (spit node-file (str 
                          (let [[pub priv _] (iwcrypt/create-key-pair)]
                            {:public pub :private priv }))))
      (let [{:keys [public private]} (read-string (slurp node-file))
            ]
        (log/info (str "ip del equipo: " host-address))
        (log/info (str "iniciando nodo con PUBLIC:" public))
        (log/info "Si esta usando -url-node = http://nombre-del-nodo:puerto, se debe")
        (log/info "registrar en el central este nodo de la siguiente manera:")
        (log/info (str " http://nombre-del-nodo:puerto aumentando el campo"))
        (log/info (str " PUBKEY a la base de datos con valor:"))
        (log/info (str " " public))
        
        (log/info "si este es un nodo central debe configurarse sin")
        (log/info "-url-node ni -url-central, y debe ser con -central y -port-central")
        (log/info "además si se usa -url-central esta será usada para que el")
        (log/info "nodo se comunique al central y no se deberá usar -central y -port-central")
        (CG/set-main-params (assoc params :public public :private private :heartbeat node-heartbeat))
        
        
        (when-not (or (and ip-central port-central (not url-central)) (and url-central (not ip-central) (not port-central)))
          (log/error "El parametro -central y -port-central deben ser definidos con la ip y puerto del nodo central o url-central debe estar definido (o ip puerto o url)!")
          (System/exit 0))
        (log/debug "ip-central:" ip-central " host-address:" host-address " url-central:" url-central " " (if (:-token params) (dame-token) ""))
        (CG/set-web-info ip-central port-central host-address port-node  url-central url-node 
                         (iwcrypt/str->public public) (iwcrypt/str->private private) node-heartbeat)
        (CG/set-is-central (and (= ip-central host-address) (= port-central port-node)))
        (log/debug "main params:" params)
        (log/debug "Web Info set to:" @CG/web-info)
        (log/debug "use-running :" use-running (.equalsIgnoreCase "true" use-running))
        (when-not (.equalsIgnoreCase "true" use-running)
          (let [running-dir (java.io.File. "./running")]
            (log/debug "use-running :" (.getCanonicalPath running-dir)) 
            (when (.exists running-dir)
              (let [runs (into [] (filter #(re-matches #"app.*id$" (.getName %)) (seq (.listFiles running-dir))))]
                (log/debug "use-running :" runs) 
                (doseq [f runs]
                  (log/debug (str "deleting file " (.getCanonicalPath f) (.delete f))))))))
        (when require-pkgs
          (doseq [pkg (into [] (.split require-pkgs ","))]
            (let [cmd (str "(require '" pkg ")")]
              (log/info (str "Requiring package: " cmd))
              (load-string cmd))))
        
        (store/boot-store)    
        (when (or (= "true" (:-createdb params "false")) (not (.exists (java.io.File. "db/ccbotDB.mv.db"))))
          (log/info "Creando base de datos H2")
          (db/init-db)
          (when (CG/is-central?)
            (let [pas (get-ccbot-pass)]
              (log/info (str "Insertando administrado inicial para central, user: ccbot, pasword: ***** "))
              (db/add-user {:userid "ccbot" :pass (crypt/encrypt pas) :active true}))))
        (when (:-updatedb params)
          (db/update-db (:-updatedb params)))
        (log/info "Starting server..")
        (server/add-middleware file/wrap-file "resources/public")        
        (server/add-middleware (partial extract-host-ip CG/get-ip-central)) ; casa: "10.3.3.199", valle : "192.168.1.6"
        (server/load-views-ns 'mx.interware.cbot.web.views
                              'mx.interware.node.view
                              'mx.interware.node.service
                              'mx.interware.cbot.selenium)
        
        (status/set-page! 404 "Pagina no encontrada!")
        
        ;si es nodo inicia la conversacion permanente con el central cada heartbeat minutos
        ;iniciando con la identificacion del nodo con el central!
        (log/info "is-central? " (CG/is-central?) " url-node:" (CG/get-url-node))
        (log/info "heart-beat :" (CG/heartbeat))
        (cond (and (not (CG/is-central?)) (CG/get-private) (CG/get-url-node))
              (future-call services/node-login)
              (not (CG/is-central?))
              (do
                 (log/info "Iniciando proceso HEART BEAT para atracción de configuraciones (x ip)")
                 (future-call services/node-lookup-confs)))
        
        (let [mode (keyword (:-mode params "dev"))
              port (Integer. port-node)]
          (log/info "Starting web server http->" port " https->" (+ 1000 port))
          (server/start port {:mode mode
                              :jetty-options {:configurator (fn [server] server) ;remove-non-ssl-connectors
                                               :ssl? true
                                               :ssl-port (+ 1000 port)
                                               :keystore "resources/security/iwrobot.jks"
                                               :key-password "1qaz2wsx"}
                              :ns 'mx.interware.cbot.web}))
          (let [dir (io/file "./running")]
            (when-not (.exists dir)
              (.mkdirs dir))
            (core/load-running-apps)
            (doseq [[appk instk] (keys @core/running-map)]
              (try
                (log/info (str "Starting: " appk ", " instk))
                (core/apply-cmd appk instk "start")
                (catch Exception e
                  (log/error (str "Error starting " appk ", " instk " ->" (.getName (class e)) " :" (.getMessage e)))))))))))

(defn -main [& m]
  (apply main m))
        
(defn main-immutant [& m]
  (println m)
  (let [params (reduce (fn [p [k v]]
                         (assoc p (keyword k) v))
                       {}
                       (partition 2 m))
        app-base (:-app-base params)
        port-node (:-port params "8050")
        host-address (-> (java.net.InetAddress/getLocalHost) (.getHostAddress))
        ip-central (:-central params)
        port-central (:-port-central params)
        url-central (:-url-central params)
        require-pkgs (:-require-pkgs params)
        use-running (:-use-running params "true")]
    (CG/set-main-params params)
    (when-not (or (and ip-central port-central (not url-central)) (and url-central (not ip-central) (not port-central)))
      (log/error "El parametro -central y -port-central deben ser definidos con la ip y puerto del nodo central o url-central debe estar definido (o ip puerto o url)!")
      (System/exit 0))
    (log/debug "ip-central:" ip-central " host-address:" host-address " url-central:" url-central " " (if (:-token params) (dame-token) ""))
    (CG/set-web-info ip-central port-central host-address port-node  url-central)
    (CG/set-is-central (and (= ip-central host-address) (= port-central port-node)))
    (log/debug "main params:" params)
    (log/debug "Server Port set to:" @CG/web-info)
    (log/debug "use-running :" use-running (.equalsIgnoreCase "true" use-running))
    (when-not (.equalsIgnoreCase "true" use-running)
      (let [running-dir (java.io.File. "./running")]
        (log/debug "use-running :" (.getCanonicalPath running-dir)) 
        (when (.exists running-dir)
          (let [runs (into [] (filter #(re-matches #"app.*id$" (.getName %)) (seq (.listFiles running-dir))))]
            (log/debug "use-running :" runs) 
            (doseq [f runs]
              (log/debug (str "deleting file " (.getCanonicalPath f) (.delete f))))))))
    (when require-pkgs
      (doseq [pkg (into [] (.split require-pkgs ","))]
        (let [cmd (str "(require '" pkg ")")]
          (log/info (str "Requiring package: " cmd))
          (load-string cmd))))
    
    (store/boot-store)    
    (when (or (= "true" (:-createdb params "false")) (not (.exists (java.io.File. "db/ccbotDB.mv.db"))))
      (log/info "Creando base de datos H2")
      (db/init-db)
      (when (CG/is-central?)
        (let [pas (get-ccbot-pass)]
          (log/info (str "Insertando administrado inicial para central, user: ccbot, pasword: ***** "))
          (db/add-user {:userid "ccbot" :pass (crypt/encrypt pas) :active true}))))
    (when (:-updatedb params)
      (db/update-db (:-updatedb params)))
    (log/info "Starting server..")
    (server/add-middleware file/wrap-file "resources/public")
  
    (server/add-middleware (partial extract-host-ip CG/get-ip-central))
    (server/load-views (java.io.File. app-base "src/mx/interware/cbot/web/views")
                       (java.io.File. app-base "src/mx/interware/node/view")
                       (java.io.File. app-base "src/mx/interware/node/service")
                       (java.io.File. app-base "src/mx/interware/cbot/selenium"))
  
    (status/set-page! 404 "Pagina no encontrada!")
    (comment 
      (let [dir (io/file "./running")]
        (when-not (.exists dir)
          (.mkdirs dir))
        (core/load-running-apps)
        (doseq [[appk instk] (keys @core/running-map)]
          (try
            (log/info (str "Starting: " appk ", " instk))
            (core/apply-cmd appk instk "start")
            (catch Exception e
              (log/error (str "Error starting " appk ", " instk " ->" (.getName (class e)) " :" (.getMessage e))))))))))




(defn qsort [[pivot & tail]]
  (when pivot
    (lazy-cat
      (qsort (filter #(< % pivot) tail))
      [pivot]
      (qsort (filter #(>= % pivot) tail)))))

(defmethod hrequest :reporte-har [get-ip-server-central handler request]
  (let [response (handler (assoc-in request [:params :remote-addr] (:remote-addr request)))
        response (assoc-in response [:headers "Content-Disposition:"] "attachment; filename=\"reporte-har.csv\"")]
    response))