(ns mx.interware.cbot.globals)

(do
  (println "loading " *ns*)
  )

;; web-info es un mapa que contriene :central-ip :central-port :central-url :node-port
(defonce web-info (atom "UNDEFINED"))

(defn clean-url [url]
  (if (re-matches #".*\/$" url)
      (subs url 0 (dec (count url)))
      url))

(defn set-web-info [ip-central port-central ip-node port-node url-central url-node public private heartbeat]
  (let [the-web-info {:ip-central ip-central :port-central port-central :ip-node ip-node :port-node port-node 
                      :public public :private private :heartbeat heartbeat}
        the-web-info (if url-central (assoc the-web-info :url-central url-central) the-web-info)
        the-web-info (if url-node 
                       (assoc the-web-info :url-node (clean-url url-node)) the-web-info)]
    (reset! web-info the-web-info)))

(defn change-central-web-info [ipcentral portcentral]
  (assert (nil? (:url-central @web-info)) "No se puede cambiar la central cuando se está usando url-central como parametro de arranque del robot de este nodo")
  (spit (java.io.File. "CENTRAL.IP") (str ipcentral))
  (spit (java.io.File. "CENTRAL.PORT") (str portcentral))
  (swap! web-info (fn [info]
                    (-> info 
                      (assoc :ip-central ipcentral :port-central portcentral)
                      (dissoc :url-central)))))

(defn get-ip-central []
  (:ip-central @web-info))

(defn get-port-central []
  (:port-central @web-info))

(defn get-ip-node []
  (:ip-node @web-info))

(defn get-url-node []
  (:url-node @web-info))

(defn get-port-node []
  (:port-node @web-info))

(defn get-url-central []
  (:url-central @web-info))

(defn get-public []
  (:public @web-info))

(defn get-private []
  (:private @web-info))

(defn central-url-base []
  (if-let [url-central (:url-central @web-info)]
    url-central
    (str "http://" (get-ip-central) ":" (get-port-central))))

(def is-central (atom false))

(defn heartbeat []
  (if-not @is-central
    (:heartbeat @web-info)
    -1))

(defn set-is-central [val]
  (reset! is-central val))

(defn is-central? []
  @is-central)

(def intern-main-params (atom nil))

(defn set-main-params [params]
  (reset! intern-main-params params))

(defn get-main-params []
  @intern-main-params)

(defn get-public-str []
  (:public @intern-main-params))

(defn set-central-public&session-uuid [central-pub-str central-pub session-uuid]
  (swap! intern-main-params assoc :central-pub-str central-pub-str :central-pub central-pub :session-uuid session-uuid))

(defn get-central-public []
  (:central-pub @intern-main-params))

(defn get-session-uuid []
  (:session-uuid @intern-main-params))

