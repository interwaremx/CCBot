(ns mx.interware.immutant.test.daemon
  (:require [immutant.daemons :as dae]
            [immutant.messaging :as msg]))


(defn start-cbot [q-name t-name init-state state]
  (msg/publish q-name :start))

(defn stop-cbot [q-name t-name init-state state]
  (msg/publish q-name :stop))

(defn cbot-ctrl [cbot-name init-state]
  (let [state (atom init-state)
        q-name (str "queue." (name cbot-name))
        t-name (str "topic." (name cbot-name))]
    (msg/start q-name :persistent false :ttl 30000)
    (msg/start t-name :persistent false :ttl 30000)
    (msg/listen 
      q-name 
      (fn state-transition [cmd]
        (println "cmd " cmd " state:" @state)
        (cond 
          (= :start cmd) (do
                           (swap! state assoc :n (inc (:n @state 0)) :running? true)
                           (msg/publish t-name @state)
                           (msg/publish q-name :continue))
          (= :stop cmd) (do
                          (swap! state assoc :running? false)
                          (println @state " stopped!"))
          (= :continue cmd) (do
                              (Thread/sleep 1000)                       
                              (swap! state assoc :n (inc (:n @state 0)))
                              (msg/publish t-name @state)
                              (if (:running? @state)
                                (msg/publish q-name :continue)))))
      :client-id q-name)
    (dae/daemonize 
      "app.inst" 
      (partial start-cbot q-name t-name init-state state) 
      (partial stop-cbot q-name t-name init-state state) 
      :singleton true)))

(def primaria-uno (cbot-ctrl "primaria-uno" {}))