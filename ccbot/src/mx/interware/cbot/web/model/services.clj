(ns mx.interware.cbot.web.model.services
  (:require [clojure.tools.logging :as log]
            [clojure.data.json :as json]
            [mx.interware.cbot.core :as core]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.store :as store]
            [mx.interware.cbot.web.model.db :as db]))

(do
  (println "loading " *ns*)
  ) 

(defn to-s [format s]
  (cond (= format :json) (json/json-str s) 
        (= format :clojure) (str s)
        :OTHERWISE (str "Format " format " not implemented, valid values [:json :clojure]")))

(defn app-names [format]
  (let [result (store/get-app-names)]
    (to-s format result)))
                 
(defn app-instances [format app]
  (log/debug "app-instances -> " app)
  (let [{factory :cbot-factory} (core/get-app-manager (keyword app))
        inst-ks (into [] (factory nil))]
    (to-s format inst-ks)))

(defn app-conf [format app]
  (let [result (store/get-app (keyword app))]
    (to-s format result)))

(defn app-save-conf [format app conf]
  (log/debug "app-save-conf (1) " app "\n" conf)
  (let [appk (core/limpiaK app)
        states-map (:states conf)
        states (into [] (for [i (range (count states-map))] (states-map (str i))))
        conf (assoc conf :states states)
        conf (core/limpia conf)]
    (log/debug "app-save-conf (2) " app "\n" conf)
    (store/set-app appk conf)
    (core/stop-and-remove-old-app appk)
    (to-s format {:result "ok"})))

(defn app-remove [format app]
  (let [appk (keyword app)]
    (store/rm-app appk)
    (core/stop-and-remove-old-app appk)
    (to-s format {:result "ok"})))

(defn get-operations [format]
  (let [result opr/operations]
    (to-s format result)))

(defn set-node-conf [format parameters]
  (log/debug "set-node-conf " parameters)
  (let [result (store/set-node-conf parameters)]
    (to-s format result)))

(defn get-node-conf [format]
  (let [result (store/get-node-conf)]
    (to-s format result)))
    
(defn- key2str [info]
  (cond
   (map? info) (into {} (map (fn [[k v]] {k (key2str v)}) info))
   (vector? info) (into [] (map (fn [v] (key2str v)) info))
   :otherwise (if (keyword? info) (str info) info)))

(defn send-cmd [app-name inst-name cmd params format]
  (let [result (core/apply-cmd (keyword app-name) (keyword inst-name) cmd params)]
      (log/debug (str "RESULT:" result))
      (cond
        (= cmd "start") (to-s format result)
        (= cmd "stop") (to-s format result)
        (= cmd "status") (do 
                           (log/debug (:state-values result))
                           (to-s format (:state-values result)))
        (= cmd "current-pos") (if (= :json format)
                                (json/json-str (key2str result))
                                (str (assoc-in result [:stats :info]  (into [] (-> result :stats :info)))))
        (= cmd "resume") (to-s format result))))

(defn get-runtime-status [format]
  (let [result (core/get-runtime-status)]
    (to-s format result)))

(defn set-runtime-status [format status-map]
  (let [result (core/set-runtime-status status-map)]
    (to-s format result)))

(defn report-log []
  [:h1 "Loge service not implementes!"])
