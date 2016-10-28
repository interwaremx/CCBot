(ns mx.interware.cbot.web.model.db
  (:require [clojure.java.jdbc :as sql]))

(def db-log4jdbc {:classname "com.mysql.jdbc.Driver"
         :subprotocol "log4jdbc:mysql"
         :subname "//dbLojg:16261/prueba"
         :user "user"
         :password "password"})

(def db-mysql {:classname "mx.interware.analyzer.jdbc.Driver"
         :subprotocol "iw:com.mysql.jdbc.Driver:jdbc:mysql" ;
         :subname "//dbAnalyzer:16261/prueba"
         :user ""
         :password ""})

(def db {:classname "org.h2.Driver"
         :subprotocol "h2" ;iw:com.mysql.jdbc.Driver:jdbc:
         :subname "file:./db/ccbotDB"
         })

(comment
(do
  (let [cls (Class/forName "mx.interware.analyzer.jdbc.Driver")
        cls2 (Class/forName "com.mysql.jdbc.Driver")]
    (println cls cls2)))
)

(defn docmd [db-conn-map cmds]
  (sql/with-db-transaction [con db-conn-map]
     (sql/db-do-commands con cmds)))

(defn init-db []
  (println "**** h2 init-db (creating schema)")
  (try
    (sql/with-db-transaction
      [con db]
      (let [cmds (slurp "resources/SQL/DB.DDL")] ; TODO usar metodo de immutant para obtener raiz del proyecto !
        (println cmds)
        (sql/db-do-commands con cmds)))
    (catch Exception ex
      (.printStackTrace ex)
      (.getMessage (.getNextException ex))))
  (println "h2 ready"))

(defn add-row [table row]
  (sql/with-db-connection [con db]
    (sql/insert! con table row)))

(defn add-rows-to [db table rows]
  (sql/with-db-transaction
    [con db]
    (apply sql/insert! table rows)))

(defn add-rows [table rows]
  (add-rows-to db table rows))

(defmacro del-rows [table condition & params]
  `(sql/with-db-connection
     [con# db]
     (sql/delete! con# ~table [~condition ~@params])))


(defmacro upd-rows [table where-params record]
  `(sql/with-db-connection
     [con# db]
     (sql/update! con# ~table  ~record ~where-params)))

(defn add-user [user]
  (add-row :users user))

(defn db-read-from [db query & args]
  (sql/query db (vec (cons query args))))

(defn db-read [query & args]
  (apply db-read-from db query args))

(defn get-user [userid]
  (first
    (db-read "select * from users where userid=?" userid)))

(defn get-users
 "returns [i] the row(s) with users"
  ([]
    (db-read "select * from users order by userid")))

(defn update-users-status
  "Update users status as a with-db-transaction"
  [users]
  (sql/with-db-transaction
    [con db]
    (sql/update! con :users {:active false} ["userid is not null and userid <> 'ccbot' "] )
    (let [ins-v (fn [user] (sql/update! con :users {:active true} ["userid = ?" user]))]
      (doall (map ins-v users))))
  nil)

(defn del-user
  "returns number of records deleted"
  [userid]
  (when (= userid "ccbot")
    (throw (java.sql.SQLException. "El usuario ccbot no puede ser eliminado!")))
  (first (del-rows :users "userid = ?" userid)))

(defn set-configuration-valor-to-1000 []
  (sql/with-db-connection
    [con db]
    (sql/db-do-commands db "ALTER TABLE CONFIGURACION ALTER COLUMN VALOR VARCHAR(1000);")))

(defn update-db [sql-cmd-file]
  (let [dir (java.io.File. ".")
        f (java.io.File. dir sql-cmd-file)
        cmds (slurp f)]
    (println "Ejecutando comandos contenidos en el archivo:" (.getAbsolutePath f))
    (println "Desea continuar (s/n):")
    (let [in (java.util.Scanner. (java.io.BufferedInputStream. (System/in)))]
      (let [opt (.toLowerCase (.next in))]
        (if (= "s" opt)
          (do
            (println "Ejecutando:")
            (println cmds)
            (try
              (sql/with-db-transaction
                [con db]
                (sql/db-do-commands con cmds))
              (println "Comandos ejecutados con exito!")
              (catch Exception e
                (.printStackTrace e)))
            )
          (println "Comandos NO ejecutdos!!"))))))
