(ns mx.interware.node.db.appldb
  (:require 
    [clojure.java.jdbc :as sql]
    [mx.interware.cbot.web.model.db :as iwdb]))


(defn get-appl 
 "returns 
  [id] the row with ip or nil
  [] the application as a seq orderded by nombre"
  ([id]
    (first
      (iwdb/db-read "select * from aplicacion where appl=?" id)))
  ([]
    (iwdb/db-read "select * from aplicacion")))

(defn add-appl
  "inserta un nuevo registro en la tabla de APLICACION"
  [appl-map] (iwdb/add-row :aplicacion appl-map))



