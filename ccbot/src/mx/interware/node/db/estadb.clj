(ns mx.interware.node.db.estadb
   (:require 
     [clojure.java.jdbc :as sql]
     [clojure.tools.logging :as log]
     [mx.interware.cbot.web.model.db :as iwdb]))

(comment {:appl "Default"
 :inst "MyGestion1"
 :inicio 123231232312
 :delta 123
 :codigo 200
 :mensaje "Mensaje todo esta bien"})

(def date-format (doto (java.text.SimpleDateFormat.) (.applyPattern "yyyy-MM-dd HH:mm:ss.SSS ZZZ")))


;;; funciones para manejo de estadistica local

(defn add-estadistica [est-map]
  (try  
    (log/debug (str "add-estadistica:" est-map))
    (let [inicio (or (:inicio est-map) (.format date-format (java.util.Date.)))
          delta (Long/parseLong (str (or (:delta est-map) "0")))
          codigo (Integer/parseInt (str (or (:codigo est-map) "0")))
          ejecucion (Integer/parseInt (str (or (:ejecucion est-map) "0")))
          mensaje (or (:mensaje est-map) "")
          appl (name (:appl est-map "UNKNOWN"))
          inst (name (:inst est-map "UNKNOWN"))
          state (name (:state est-map "UNKNOWN"))
          info {:appl appl
                :inst inst
                :state state
                :inicio (.parse date-format inicio)
                :delta delta
                :ejecucion ejecucion
                :codigo codigo
                :mensaje mensaje}]
      (log/debug info)
      (iwdb/add-row :estadistica info))
    "Ok"
    (catch Exception e
      (.printStackTrace e)
      (log/warn e "problems in ad-estadistica")
      (str "Error:" (.getMessage e)))))

(defn get-pend-ests [max-recs]
  (take max-recs (iwdb/db-read "select ID,APPL,INST,STATE,INICIO,DELTA,CODIGO,EJECUCION,MENSAJE from estadistica where enviado IS NULL order by inicio")))

(defn get-pend-store-cests [max-recs]
  (take max-recs (iwdb/db-read 
                   "select ID,APPL,INST,STATE,INICIO,DELTA,RECIBIDO,CODIGO,EJECUCION,MENSAJE,IP,SHORTN from cestadistica where concentrado IS NULL order by inicio"
                   )))


(defn mark-enviados [ids]
  (try
    (sql/with-db-transaction
      [con iwdb/db]
      (doseq [id ids]
        (sql/update! con :estadistica {:enviado (java.sql.Timestamp. (System/currentTimeMillis))} ["id=?" id])))
    :Ok
    (catch Exception e
      (log/warn e "problems at mark-enviados")
      :Error)))

(defn mark-enviados-store [ids]
  (sql/with-db-transaction
    [con iwdb/db]
    (doseq [id ids]
      (sql/update! con :cestadistica {:concentrado (java.sql.Timestamp. (System/currentTimeMillis))} ["id=?" id]))))


(defn delete-old [days-old]
  (iwdb/del-rows :estadistica 
                 "enviado is not null and enviado < ?" 
                 (java.sql.Timestamp. (- (System/currentTimeMillis) 
                                         (* 24 60 60 1000 days-old)))))


;;; funciones para manejo de estadistica remota

;;Esto es para la conexción a Oracle
(def dbRemote {:classname "org.h2.Driver"
         :subprotocol "h2"
         :subname "file:db/ccbotDB"
         })

(comment def dbRemote {:classname "oracle.jdbc.driver.OracleDriver"  ; must be in classpath
         :subprotocol "oracle"
         :subname "thin:@10.3.3.229:1521:xxx" 
         :user "robotiw"
         :password "123456"})


;ip,appl
(defn add-est-central [estadisticas]
  (log/warn (str :add-est-central " " (pr-str estadisticas)))
  (apply sql/insert! iwdb/db :cestadistica estadisticas))

      

