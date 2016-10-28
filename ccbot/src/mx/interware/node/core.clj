(ns mx.interware.node.core)

(do
  (println "loading " *ns*)
  )

(def node-status (agent {}))

(defn log-success [data millis msg]
  (assoc data :current :RUNNING :last millis :msg msg :last-exception ""))

(defn log-exception [data millis excep msg]
  (assoc data :current :STOPPED :last millis :last-exception excep :msg msg))

(defn- intern-log-event 
  ([node-status ip millis exception msg]    
    (update-in node-status [ip] log-exception millis exception msg))
  ([node-status ip millis msg]
    (update-in node-status [ip] log-success millis msg)))

(defn log-event 
  ([ip msg]
    (send node-status intern-log-event ip (System/currentTimeMillis) msg))
  ([ip exception msg]
    (send node-status intern-log-event ip (System/currentTimeMillis) exception msg)))

(defn status-of [ip]
  (let [result (if-let [status (@node-status ip)]
                 status
                 {:current :UNKNOWN :last (System/currentTimeMillis) :msg "Desconocido" :last-exception ""})]
    result))

(def img-map
  {:RUNNING "/images/robot-start.gif"
   :STOPPED "/images/robot-stop.gif"
   :UNKNOWN "/images/robot-waiting.gif"})



(defn status-image-of [ip]
  (let [{:keys [current last last-exception msg]} (status-of ip)
        sdf (java.text.SimpleDateFormat. "dd/MM/yyyy HH:mm:ss")
        last (java.util.Date. last)
        last (.format sdf last)]
    [:img {:src (current img-map) :title (str msg ":" last " " last-exception)}]))
