(ns mx.interware.node.db.develop
  (:require [clj-webdriver.taxi :as t]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.web.server :as srv]
            [mx.interware.cbot.web.model.db :as iwdb]))
; el require anterior es igual al que está definido en operations al generar el codigo de la funcion clojure embebida en la configuración del robot
; como clojure-opr


;;ejecuta?

(fn [{:keys [hora minuto dia ejecuta-hh ejecuta-mm ejecuta-dia] 
      :or {ejecuta-hh "09" ejecuta-mm "00" ejecuta-dia "Mon"}}]
  (println "dia " dia " hora " hora " minuto " minuto)
  (println ejecuta-dia " " ejecuta-hh " " ejecuta-mm)
  (println (re-matches (re-pattern ejecuta-dia) dia))
  (println  (re-matches (re-pattern ejecuta-hh) hora))
  (println (re-matches (re-pattern ejecuta-mm) minuto))

  (if (and (re-matches (re-pattern ejecuta-dia) dia) 
           (re-matches (re-pattern ejecuta-hh) hora) 
           (re-matches (re-pattern ejecuta-mm) minuto))
    "RUN"
    "SKIP"))

;; store-stats
(fn [ctx]
  (doseq [state-key [:login :hoy :mi-gestion :consulta-cliente :contratacion :ficha-cliente :logout]]
    (try
      (let [delta-or-msg (str (state-key ctx))
            [delta msg code] (if (re-matches #"[0-9]+" delta-or-msg)
                               [(Integer/parseInt delta-or-msg) "OK" "0"]
                               [0 (subs delta-or-msg 0 (min 100 (count delta-or-msg))) "1"])
            inicio (:timestamp ctx)
            appl (:app_ ctx)
            inst (:inst_ ctx)
            ejecucion (+ (java.lang.Integer/valueOf (:count ctx)) 1)]
        (mx.interware.node.db.estadb/add-estadistica 
          {:appl  appl
           :inst inst
           :state state-key
           :ejecucion ejecucion
           :inicio inicio
           :delta delta
           :codigo code
           :mensaje msg})
        {:result msg})
      (catch Exception e
        (.printStackTrace e)
        e))))

;;inc
(fn [ctx] 
  (let [count (inc (Integer/parseInt (:count ctx)))]
    (if (>= count (Integer/parseInt (:max-count ctx)))
      {:result "SKIP" :count (str count)}
      {:result "RUN" :count (str count)})))

;; send-stats
(fn [ctx]
  (let [maxrows (Integer/parseInt (or (:max-rows ctx) "10"))
        data (into [] (mx.interware.node.db.estadb/get-pend-ests maxrows))
        dummy1 (println "dummy1:" data)
        result (opr/post2central (:service-estadisticas ctx) {:vest-map-str (str data)})
        body (read-string (:body result))]
    ;body tiene un vector con los ids de CESTADISTICA de los registros que se insertaron
    (println "Body:" body " " (class body))
    ;; if body indica exito marcar registros como enviados!
    (when (= clojure.lang.PersistentVector (class body))
      (mx.interware.node.db.estadb/mark-enviados (into [] (map :id data))))
    body))

;; clear-old-stats

(fn [ctx]
  (mx.interware.node.db.estadb/delete-old (Integer/parseInt (:max-dias ctx "7"))))


;; para sacar de un oracle el siguiente id
(comment defn get-id-esta
 "returns [i] the id of the esta row"
  ([db-connection-map]
    (first
      (iwdb/db-read-from db-connection-map "select SQ_CESTADISTICA.NEXTVAL as id from dual"))))

;; concentrar estadistica en ORACLE 
(fn [ctx]
  (try
    (let [maxrows (Integer/parseInt (or (:max-store-rows ctx) "1000"))
          data (into [] (mx.interware.node.db.estadb/get-pend-store-cests maxrows))]
      (if (= 0 (count data))
        0
        (let [store-connection {:classname "oracle.jdbc.driver.OracleDriver"
                                :subprotocol "oracle"
                                :subname "thin:@150.100.152.22:1521:BMRBP001"
                                :user "dbsbrh"
                                :password "dbsbrh12"}
              next-id (fn [] "returns [i] the id of the esta row" (:id (first (mx.interware.cbot.web.model.db/db-read-from store-connection "select SQ_CD_ESTADISTICAMON.NEXTVAL as id from dual"))))
              store-table :TRH522_ESTADISTICA
              store-db-map {:id :CD_ESTADISTICA        
                            ;:shortn :TX_CR
                            :appl :CD_APLICACION       
                            :inst :NB_INSTANCIA        
                            :state :TX_ESTADO          
                            :inicio :TM_INICIO         
                            :recibido :TM_RECIBIDO     
                            :delta :NU_DELTA           
                            :ip :CD_SUCURSAL           
                            :codigo :NU_CODIGO         
                            :ejecucion :NU_EJECUCION   
                            :mensaje :TX_MENSAJE}
              
              data2store (into [] (map (fn [cest-map] 
                                         ;(println "registro:")
                                         (into {} (map (fn [k]
                                                         (println "campo " k "->" (store-db-map k) (class (cest-map k)) " " (cest-map k))
                                                         (let [valor (cond 
                                                                       (= k :id) (next-id)
                                                                       :OTHERWISE (cest-map k))]
                                                           
                                                           ;; si es k==id cambiar (cest-map k) por (next-id)
                                                           ;; si es un timestamp ?? (java.sql.Timestamp. (.getTime (:inicio cest-map)))
                                                           ;;  o en su caso (java.sql.Timestamp. (System/currentTimeMillis)) 
                                                           [(store-db-map k) valor]))
                                                       (keys store-db-map))))
                                       data))
              dummy2 (println "dummy2:" data2store)
              result (mx.interware.cbot.web.model.db/add-rows-to store-connection store-table data2store)
              ]
          (if (seq? result)
            (let [ids (into [] result)
                  cuenta (count ids)]
              (when  (> cuenta 0)
                (mx.interware.node.db.estadb/mark-enviados-store (into [] (map :id data))))
              cuenta)
            result))))
    (catch Exception e
      (.printStackTrace e)
      (str (.getName (class e)) (.getMessage e)))))

(fn [ctx]
  (let [store-connection {:classname "oracle.jdbc.driver.OracleDriver"
                            :subprotocol "oracle"
                            :subname "thin:@150.100.152.22:1521:BMRBP001"
                            :user "dbsbrh"
                            :password "dbsbrh12"}
          next-id (fn [] "returns [i] the id of the esta row" (:id (first (mx.interware.cbot.web.model.db/db-read-from store-connection "select SQ_CD_ESTADISTICAMON.NEXTVAL as id from dual"))))
          store-table :TRH522_ESTADISTICA]
    (mx.interware.cbot.web.model.db/db-read-from store-connection "select count(*) from TRH522_ESTADISTICA")))


(fn [ctx]
  (try ;^(Mon|Tue|Wed|Thu|Fri) (09|1[0-8]):[012345][05]$
    (let [store-connection {:classname "oracle.jdbc.driver.OracleDriver"
                            :subprotocol "oracle"
                            :subname "thin:@150.100.152.22:1521:BMRBP001"
                            :user "dbsbrh"
                            :password "dbsbrh12"}
          next-id (fn [] "returns [i] the id of the esta row" (:id (first (mx.interware.cbot.web.model.db/db-read-from store-connection "select SQ_CD_ESTADISTICAMON.NEXTVAL as id from dual"))))
          store-table :TRH522_ESTADISTICA
          store-db-map {:id :CD_ESTADISTICA        
                        ;:shortn :TX_CR
                        :appl :CD_APLICACION       
                        :inst :NB_INSTANCIA        
                        :state :TX_ESTADO          
                        ;:inicio :TM_INICIO         
                        ;:recibido :TM_RECIBIDO     
                        :delta :NU_DELTA           
                        :ip :CD_SUCURSAL           
                        :codigo :NU_CODIGO         
                        :ejecucion :NU_EJECUCION   
                        :mensaje :TX_MENSAJE}
          maxrows (Integer/parseInt (or (:max-store-rows ctx) "1000"))
          data (into [] (mx.interware.node.db.estadb/get-pend-store-cests maxrows)) ;todo areglar este metodo CONCENTRADO?
          dummy1 (println "dummy1:" data)
          data2store (into [] (map (fn [cest-map] 
                                     ;(println "registro:")
                                     (into {} (map (fn [k]
                                                     (println "campo " k "->" (store-db-map k) (.getName (class (cest-map k))) " " (cest-map k))
                                                     (let [valor (cond 
                                                                   (= k :id) (next-id)
                                                                   :OTHERWISE (cest-map k))]
                                                                        
                                                     ;; si es k==id cambiar (cest-map k) por (next-id)
                                                     ;; si es un timestamp ?? (java.sql.Timestamp. (.getTime (:inicio cest-map)))
                                                     ;;  o en su caso (java.sql.Timestamp. (System/currentTimeMillis)) 
                                                     [(store-db-map k) valor]))
                                                   (keys store-db-map))))
                                   data))
          result (mx.interware.cbot.web.model.db/add-rows-to store-connection store-table data2store)
          ]
      (when (and (seq? result) (> (count result) 0))
        (mx.interware.node.db.estadb/mark-enviados-store (into [] (map :id data))))
      result)
    (catch Exception e
      (.printStackTrace e)
      (str (.getName (class e)) (.getMessage e)))))


(fn [ctx]
  (try  ;^(Mon|Tue|Wed|Thu|Fri) (09|1[0-8]):[012345][05]$
    (let [store-connection {:classname "oracle.jdbc.driver.OracleDriver"
                            :subprotocol "oracle"
                            :subname "thin:@150.100.152.22:1521:BMRBP001"
                            :user "dbsbrh"
                            :password "dbsbrh12"}
          maxrows (Integer/parseInt (or (:max-store-rows ctx) "1"))
          data (into [] (mx.interware.node.db.estadb/get-pend-store-cests maxrows))]
        (reduce (fn [r s] (str r "," (:ip s))) "" data))
    (catch Exception e
      (.printStackTrace e)
      (str (.getName (class e)) (.getMessage e)))))
