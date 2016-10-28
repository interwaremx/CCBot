(ns mx.interware.node.db.reportedb
   (:require 
     [clojure.java.jdbc :as sql]
     [clojure.tools.logging :as log]
     [mx.interware.cbot.web.model.db :as iwdb]))

(defn get-csv-reporte [inicio termino]
  (log/debug "INICIO-FIN:" inicio "---" termino)
  (iwdb/db-read "select * from cestadistica where inicio >= ? and inicio <= ? order by inicio" inicio termino))

(defn get-reporte-fecha
 "returns 
  [i] the row(s) with execution date"
  ([fecha]
    (iwdb/db-read "select (s.cr || '/' || s.sucursal) as sucursal,
                    o.oper as operativa,
                    i.inst as instancia,
                    to_char(ce.inicio, 'DD/MM/YYYY') as fechaEjecucion,
                    ce.delta as tiempoEjecucion
                   from cestadistica ce
                    inner join sucursal s on ce.ip = s.ip
                    inner join instancia i on ce.inst = i.inst
                     inner join operativa o on i.oper = o.oper
                    where to_char(ce.inicio, 'DD/MM/YYYY') = ? order by inicio" fecha)))

(defn get-reporte-ip-fecha
  "returns [k, i] the row(s) with execution date and ip"
  ([ip, fecha]
    (iwdb/db-read "select (s.cr || '/' || s.sucursal) as sucursal,
                    o.oper as operativa,
                    i.inst as instancia,
                    to_char(ce.inicio, 'DD/MM/YYYY') as fechaEjecucion,
                    ce.delta as tiempoEjecucion
                   from cestadistica ce
                    inner join sucursal s on ce.ip = s.ip and s.ip = ?
                    inner join instancia i on ce.inst = i.inst
                     inner join operativa o on i.oper = o.oper
                    where to_char(ce.inicio, 'DD/MM/YYYY') = ? order by inicio" ip, fecha)))

(defn get-reporte-operativa-fecha
  "returns [k, i] the row(s) with execution date and operativa"
  ([operativa, fecha]
    (iwdb/db-read "select (s.cr || '/' || s.sucursal) as sucursal,
                    o.oper as operativa,
                    i.inst as instancia,
                    to_char(ce.inicio, 'DD/MM/YYYY') as fechaEjecucion,
                    ce.delta as tiempoEjecucion
                   from cestadistica ce
                    inner join sucursal s on ce.ip = s.ip
                    inner join instancia i on ce.inst = i.inst
                     inner join operativa o on i.oper = o.oper and o.oper = ?
                    where to_char(ce.inicio, 'DD/MM/YYYY') = ? order by inicio" operativa, fecha)))

(comment defn get-reporte-fecha-ip-operativa
  "returns [k, i, j] the row(s) with execution date, ip and operativa"
  ([fecha, ip, operativa]
    (iwdb/db-read "select (s.cr || '/' || s.sucursal) as sucursal,
                    o.oper as operativa,
                    i.inst as instancia,
                    to_char(ce.inicio, 'DD/MM/YYYY') as fechaEjecucion,
                    ce.delta as tiempoEjecucion
                   from cestadistica ce
                    inner join sucursal s on ce.ip = s.ip and s.ip = ?
                    inner join instancia i on ce.inst = i.inst
                     inner join operativa o on i.oper = o.oper and o.oper = ?
                    where to_char(ce.inicio, 'DD/MM/YYYY') = ? order by inicio" ip, operativa, fecha)))

(defn get-reporte-fecha-ip-operativa
  "returns [k, i, j] the row(s) with execution date, ip and operativa"
  ([fecha, ip, operativa]
    (log/debug "\n\n\nparametros:[" fecha  (= fecha  "23/10/2012") "] [" ip (= ip "10.3.3.215") "] [" operativa (= operativa "Hoy")"]")
    (let [r (iwdb/db-read (str "select (s.cr || '/' || s.suc) as sucursal,"
                               "o.oper as operativa,"
                               "i.inst as instancia,"
                               "FORMATDATETIME(ce.inicio, 'dd/MM/yyyy HH:mm:ss.SSS') as fechaEjecucion,"
                               "ce.delta as tiempoEjecucion,"
                               "ce.codigo as codigo,"
                               "ce.mensaje as mensaje "
                               "from operativa o inner join instancia i on o.oper=i.oper "
                                                 "inner join cestadistica ce on i.inst=ce.inst "
                                                 "inner join sucursal s on ce.ip=s.ip and s.ip=? "
                               "where o.oper=? and FORMATDATETIME(ce.inicio,'dd/MM/yyyy')=?")
                                  ip operativa fecha)]
      (log/debug "\n\nresultado :" r)
       r)))

(defn dispa [{:keys [operativa ip] :as m}]
  (log/debug "\n\n\n\ndispa: " m)
  [(if operativa :operativa nil) (if ip :ip nil)])
  
(defmulti get-reporte dispa)
  
(defmethod get-reporte [nil nil] [m] 
  (get-reporte-fecha (m :fechaEjecucion)))
  
(defmethod get-reporte [nil :ip] [m]
  (get-reporte-ip-fecha (m :ip) (m :fechaEjecucion)))
  
(defmethod get-reporte [:operativa nil] [m]
  (get-reporte-operativa-fecha (m :operativa) (m :fechaEjecucion)))
  
(defmethod get-reporte [:operativa :ip] [m]
  (get-reporte-fecha-ip-operativa (m :fechaEjecucion) (m :ip) (m :operativa)))


(defn get-har-reporte [inicio termino]
  (log/debug "INICIO-FIN:" inicio "---" termino)
  (iwdb/db-read "SELECT p.nombre_estado, p.inicio, p.tiempo_carga, p.carga_contenido, e.url, e.status, e.tipo_contenido, 
e.tiempo_total, e.tiempo_espera, e.tiempo_bloqueo, e.tiempo_dns, e.tiempo_recepcion, e.tiempo_conexion, e.tamanyo, e.tiempo_envio
From Paginas p 
inner join elementos_pagina e 
on p.id_pagina=e.id_pagina 
where p.inicio >= ? and p.inicio <= ? order by inicio" inicio termino))

