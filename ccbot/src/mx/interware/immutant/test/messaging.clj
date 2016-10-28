(ns mx.interware.immutant.test.messaging
  (:require [immutant.messaging :as msg]
            [immutant.xa :as xa]))

(def TOPIC "topic.test.one")

(defn rmsg []
  (msg/receive TOPIC :timeout 0 :client-id "FGC"))

(msg/start TOPIC :persistent true :ttl 0)

(defn pmsg [m]
  (msg/publish TOPIC m :ttl 30000))

(comment
  (do
     (Thread/sleep 60000)
     (.length (str (rmsg))))
  
  (.length (str (receive TOPIC :timeout 30000 :client-id "FELIPE")))
  
  )

(def CBOT-TOPIC "topic.app.inst")

(def error-time (+ (System/currentTimeMillis) 60000))

(def listener (atom nil))

(msg/start CBOT-TOPIC :persistent true :ttl 0)      

(defn cbot-handler [ctx]
  (println "cbot-ctx:" ctx)
  (if (= ctx :stop)
    (future 
      ;(Thread/sleep 500)
      (msg/unlisten @listener)
      (println "ya"))
    (let [ctx (assoc ctx :now (System/currentTimeMillis) :count (inc (:count ctx 0)))]
      (Thread/sleep 1000)
      (println "publicando.:" ctx)
      ;(xa/transaction
        (msg/publish CBOT-TOPIC ctx)
        (let [now (System/currentTimeMillis)
              diff (- error-time now)]
          (println diff)
          (when (and (pos? diff) (< diff 3000))
            (throw (RuntimeException. "En periodo Malo"))))
        ;)
      )))

(defn start-cbot []
  (reset! listener (msg/listen  CBOT-TOPIC cbot-handler :client-id "handler"))
  (println "ya"))

(defn init-cbot []
  (msg/publish CBOT-TOPIC {}))

(defn stop-cbot []
  (msg/publish CBOT-TOPIC :stop))

  
  
  
