(ns mx.interware.node.db.instdb
  (:require 
    [clojure.java.jdbc :as sql]
    [mx.interware.cbot.web.model.db :as iwdb]))

(defn get-instancia
  ([appl id]
    (first
      (iwdb/db-read "select * from instancia where appl=? and id=?" appl id)))
  ([appl] 
    (iwdb/db-read "select * from instancia where appl=?" appl)))