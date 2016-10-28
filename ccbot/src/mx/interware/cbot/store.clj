(ns mx.interware.cbot.store
  (:require [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [clojure.pprint :as pp]))

(do
  (println "loading " *ns*))

(def date-format (java.text.SimpleDateFormat. "yyyy-MM-dd HH:mm:ss.SSS"))

(def STORE-VERSIONS (range 1 10))
(def STORE-FILE-NAME "app-store3.clj")
(def STORE-FILE-NAME-BAK 
  (into [] (map (fn [n] (str STORE-FILE-NAME "." n)) STORE-VERSIONS)))

(def STORE-FILE (java.io.File. STORE-FILE-NAME))
(def STORE-FILE-BAK (into [] (map #(java.io.File. %) STORE-FILE-NAME-BAK)))

(defprotocol store
  (version [this])
  (updated [this])
  (raw-updated [this])
  (inc-version [this])
  (configuration [this])
  (node-conf [this])
  (rm [this id]))
 
(defrecord app-store-rec [version last-updated configuration node-conf]
  store
  (version [this] version)
  (inc-version [this] (assoc this :version (inc version) :last-updated (System/currentTimeMillis)))
  (updated [this] (.format date-format last-updated))
  (raw-updated [this] last-updated)
  (configuration [this] configuration)
  (node-conf [this] node-conf)
  (rm [this id] (assoc this :configuration (dissoc configuration id))))

(def app-store (ref (app-store-rec. 0 (System/currentTimeMillis) (sorted-map) (sorted-map))))

;borra el más viejo y recorre los nombres de los archivos .n es el más viejo (n=9)
(defn- backup-files []
  (reduce
    (fn [f1 f2]
      (when (.exists f1)
        (.delete f1))
      (when (.exists f2)
        (.renameTo f2 f1))
      f2)
    (reverse (cons STORE-FILE STORE-FILE-BAK))))

;ejemplos de pars:
; :node-conf <node-conf>
; :app-upd {:appk <app-key> :conf <conf>}
; :app-rm {:appk <app-key>}
(defn- agent-save [& pars]
  (locking app-store
    (dosync 
      (log/info (str "saving application configuration to " (.getAbsolutePath STORE-FILE)))
      (alter app-store #(inc-version %))
      (if pars
        (let [opts (reduce (fn [m [k v]] (assoc m k v)) {} (partition 2 pars))]
          (log/debug "opts4 agent-save:" opts)
          (doseq [[k v] opts] 
            (cond 
              (= k :node-conf) (alter app-store #(assoc % :node-conf v))
              (= k :app-upd) (alter app-store #(assoc-in % [:configuration (:appk v)] (:conf v)))
              (= k :app-rm) (alter app-store #(rm % (:appk v)))))))
      (backup-files)
      (when (log/enabled? :debug)
        (pp/pprint @app-store))
      (try
        (with-open [ostream (java.io.PrintWriter. (java.io.OutputStreamWriter. (java.io.FileOutputStream. STORE-FILE-NAME) "UTF-8"))]
          (pp/pprint (into {} @app-store) ostream))
        (catch Exception e
          (.printStackTrace e))))
    @app-store))

(comment defn app-store-save []
  (log/info (str "saving application configuration to " (.getAbsolutePath STORE-FILE)))
  (dosync
   (alter app-store #(inc-version %))
   (with-open [ostream (java.io.PrintWriter. (java.io.OutputStreamWriter. (java.io.FileOutputStream. STORE-FILE-NAME) "UTF-8"))]
     (pp/pprint (into {} @app-store) ostream))))

(defn app-store-save []
  (agent-save)) 

(defn get-app-names []
  (into [] (keys (configuration @app-store))))

(defn get-configuration []
  (configuration @app-store))

(defn get-app [id]
  (assert (keyword? id))
  (log/debug "get-app " id " " (configuration @app-store))
  ((configuration @app-store) id))

(defn get-node-conf [] 
  (node-conf @app-store))

(comment defn set-node-conf-and-app [node-conf appk app-conf]
  (assert (keyword? appk))
  (dosync
    (alter app-store #(assoc % :node-conf node-conf))
    (alter app-store #(assoc-in % [:configuration appk] app-conf))
    (app-store-save)))

(defn set-node-conf-and-app [node-conf appk app-conf]
  (assert (keyword? appk))
  (agent-save :node-conf node-conf :app-upd {:appk appk :conf app-conf}))

(comment defn set-node-conf [conf]
  (dosync
    (alter app-store #(assoc % :node-conf conf))
    (app-store-save)))

(defn set-node-conf [node-conf]
  (agent-save :node-conf node-conf))

(comment defn set-app [id conf]
  (assert (keyword? id))
  (dosync
   (alter app-store #(assoc-in % [:configuration id] conf))
   (app-store-save)))

(defn set-app [id conf]
  (assert (keyword? id))
  (agent-save :app-upd {:appk id :conf conf}))

(comment defn set-apps [apps-vec]
  (log/debug apps-vec)
  (dosync
   (doseq [app-id-conf apps-vec]
     (alter app-store #(assoc-in % [:configuration  (app-id-conf 0)] (app-id-conf 1))))
   (app-store-save)))

(comment defn rm-app [id]
  (assert (keyword? id))
  (dosync
   (alter app-store (fn [store] (rm store id)))
   (app-store-save)))

(defn rm-app [id]
  (assert (keyword? id))
  (agent-save :app-rm {:appk id}))

(comment defn read-lines [istream]
  ((fn seq-lines [istream]
     (let [line (.readLine istream)]
       (if-not line
         nil
         (lazy-seq (cons line (seq-lines istream))))))
   istream))

(defn app-store-load []
  (dosync
    (let [{:keys [version last-updated configuration node-conf]} (read-string (slurp STORE-FILE :encoding "UTF-8"))]
       (log/debug (str "loading :" store))
       (log/debug configuration)
       (ref-set app-store
                (app-store-rec. version 
                                last-updated 
                                configuration 
                                node-conf)))))

(comment defn app-store-load []
  (let [{:keys [version last-updated configuration node-conf]} (read-string (slurp STORE-FILE :encoding "UTF-8"))]
    (log/debug (str "loading :" store))
    (log/debug configuration)
    (send app-store (fn [store]
                      (app-store-rec. version 
                                      last-updated 
                                      configuration 
                                      node-conf)))))

(defn get-apps []
  (configuration @app-store))

(defn boot-store []
  (if-not (.exists STORE-FILE)
    (app-store-save)
    (app-store-load)))

(defn save-store-new-format [name new-app-store-val]
  (dosync
   (ref-set app-store new-app-store-val)
   (with-open [ostream (java.io.PrintWriter. (java.io.FileWriter. STORE-FILE-NAME))]
     (.println ostream (:version @app-store))
     (.println ostream (:last-updated @app-store))
     (.println ostream (:node-conf @app-store))
     (doseq [app (:configuration @app-store)]
       (.println ostream app)))))

(defn first-app-store-load []
  (reduce (fn [apps app-name]
            (let [app-str (slurp (str app-name ".clj"))
                  app (load-string app-str)]
              (assoc apps (keyword app-name) app)))
          {}
          ["Contratacion" "LoginCargaHoy" "MiGestion" "FichaCliente" "LoginHoy"]))

(defn creat-first-big-app []
  (let [app-store (app-store-rec. 0 0 (first-app-store-load) {:password "secreto", :userid "felipe"})
        app-store (inc-version app-store)]
    (save-store-new-format "app-store.clj" app-store)))
