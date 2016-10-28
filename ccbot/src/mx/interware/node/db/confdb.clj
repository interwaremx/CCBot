(ns mx.interware.node.db.confdb
  (:require 
    [clojure.java.jdbc :as sql]
    [mx.interware.cbot.web.model.db :as iwdb]))

(defn add-conf 
"returns {:scope_identity() No} when ok or throws exception, 
conf-map ==> {:ip \"192.168.1.1\" :appl \"aplicacion\" :inst \"instancia\" :campo \"delta\" :valor \"1000\"}" 
  ([conf-map] {:pre [(not (nil? (:ip conf-map)))]}
  (iwdb/add-row :configuracion conf-map))
  ([ip appl inst campo-valor-map]
    (doseq [[campo valor] campo-valor-map]
      (add-conf {:ip ip :appl appl :inst inst :campo campo :valor valor}))))

(defn get-all-conf 
  "trae una seq con todos los registros de una remote-addr (sucursal) [remote-addr]"
  [remote-addr]
  (iwdb/db-read "select * from configuracion where ip=?" remote-addr))

(defn get-conf
 "[ip] the rows with ip=ip and appl=null and inst=null
  [ip appl] the rows with ip=ip and appl=appl and inst=null
  [ip appl inst] the rows with ip=ip and appl=appl and inst=inst"
  ([ip] {:pre [(not (nil? ip))]}
    (iwdb/db-read "select * from configuracion where ip=? and appl is null and inst is null" ip))
  ([ip appl] {:pre [(and (not (nil? ip)) (not (nil? appl)))]}
    (iwdb/db-read "select * from configuracion where ip=? and appl=? and inst is null" ip appl))
  ([ip appl inst] {:pre [(and (not (nil? ip)) (not (nil? appl)) (not (nil? inst)))]}
    (iwdb/db-read "select * from configuracion where ip=? and appl=? and inst=?" ip appl inst)))

(defn del-conf 
 "returns number of records deleted
  [ip] the rows with ip=ip and appl=null and inst=null
  [ip appl] the rows with ip=ip and appl=appl and inst=null
  [ip appl inst] the rows with ip=ip and appl=appl and inst=inst"
  ([ip] {:pre [(not nil? ip)]}
    (first (iwdb/del-rows :configuracion "ip=? and appl is null and inst is null" ip)))
  ([ip appl] {:pre [(and (not (nil? ip)) (not (nil? appl)))]}
    (first (iwdb/del-rows :configuracion "ip=? and appl=? and inst is null" ip appl)))
  ([ip appl inst] {:pre [(and (not nil? ip) (not (nil? appl)) (not (nil? inst)))]}
    (first (iwdb/del-rows :configuracion "ip=? and appl=? and inst=?" ip appl inst))))

(defn- insert-conf 
"returns {:scope_identity() No} when ok or throws exception, 
conf-map ==> {:ip \"192.168.1.1\" :appl \"aplicacion\" :inst \"instancia\" :campo \"delta\" :valor \"1000\"}" 
  ([conf-map] {:pre [(not (nil? (:ip conf-map)))]}
  (sql/insert! iwdb/db :configuracion conf-map))
  ([ip appl inst campo-valor-map]
    ;(println ip appl inst campo-valor-map)
    (doseq [[campo valor] (filter #(let [v (val %)]
                                     (and v (> (count (.trim (str v))) 0))) campo-valor-map)]
      (insert-conf {:ip ip :appl (if appl (name appl) nil) :inst (if inst (name inst) nil) :campo (name campo) :valor (name valor)}))))


(defn set-conf-for
  "removes all records for configuratios ip=remote-addr, then writes records contained in conf
   with structur:
   {:node {:campo1 \"valor1\" :campo2 \"valor2\"}
    :appls {:appk1 {:parameters {:campo1 \"valor1\" :campo2 \"valor2\"}}
            :instances {:instk1 {:campo1 \"valor1\" :campo2 \"valor2\"}
                        :instk2 :campo1 \"valor1\" :campo2 \"valor2\"}}}"
  [remote-addr conf]
  ;(clojure.pprint/pprint conf)
  (iwdb/del-rows :configuracion "ip=?" remote-addr)
  (when conf
    (insert-conf remote-addr nil nil (:node conf))
    (doseq [[appk app-conf] (:appls conf)]
      (insert-conf remote-addr appk nil (:parameters app-conf))
      (doseq [[instk inst-conf] (:instances app-conf)]
        (insert-conf remote-addr appk instk inst-conf)))))
      
      
      