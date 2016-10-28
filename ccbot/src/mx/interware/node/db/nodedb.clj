(ns mx.interware.node.db.nodedb
   (:require 
     [clojure.java.jdbc :as sql]
     [mx.interware.cbot.web.model.db :as iwdb]))

(defn add-node 
"returns {:scope_identity() 0} when ok or throws exception, 
suc-map ==> {:ip \"192.168.1.1\" :cr \"nombre del cr\" :nombre \"Insurgented 1500\"}" 
  [node-map]
  (iwdb/add-row :node node-map))

(defn get-node 
 "returns 
  [i] the row with ip or nil
  [] the sucs as a seq orderded by nombre"
  ([ip]
    (first
      (iwdb/db-read "select * from node where ip=?" ip)))
  ([]
    (iwdb/db-read "select * from node order by shortn")))


(defn del-node
  "returns number of records deleted"
  [ip]
  (first (iwdb/del-rows :node "ip = ?" ip)))

(defn upd-node
  "returns"
  [node]
  (iwdb/upd-rows :node ["ip = ?" (:ip node)] node))