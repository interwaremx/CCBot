(ns mx.interware.node.service.node
  (:use
    [noir.core :only [defpartial defpage]]
    [clojure.test]
  )
  (:require
    [mx.interware.cbot.store :as store]
    [mx.interware.cbot.core :as core]
    [mx.interware.node.core :as bcore]
    [mx.interware.cbot.web.views.common :as common]
    [clojure.data :as data]
    [clojure.data.json :as json]
    [clojure.tools.logging :as log]
    [mx.interware.util.basic :as basic]
    [mx.interware.node.db.confdb :as confdb]
    [mx.interware.node.db.nodedb :as nodedb]
    [clj-http.client :as http]))

(do
  (println "loading " *ns*)
  )

(common/private-page [:get "/service/node"] []
  (json/json-str (nodedb/get-node)))

(common/private-page [:get "/clj/service/node"] []
  {:status 202
   :headers {"Content-Type" "application/clojure; charset=utf-8"}
   :body (pr-str (nodedb/get-node))})
(defn get-conf-central []
  (let [cbot-info (deref mx.interware.cbot.store/app-store)
        node-conf (:node-conf cbot-info)
        configuration (:configuration cbot-info)
        result {:node node-conf
                :appls (into {} (map (fn [[appid conf]]
                                       {appid {:parameters  (or (:parameters conf) {})
                                               :instances (into {} (map (fn [[inst conf-inst]]
                                                                          {inst (:param-map (or conf-inst {}))})
                                                                        (:instances conf)))}}) 
                                     configuration))}]
    result))

(defn- tropicalize-conf [remote-addr conf]
  (let [conf-vec (confdb/get-all-conf remote-addr)]
    (reduce (fn [result {:keys [ip appl inst campo valor]}]
              (cond 
                (and inst appl)
                (assoc-in result [:appls (keyword appl) :instances (keyword inst) (keyword campo)] valor)
                appl
                (assoc-in result [:appls (keyword appl) :parameters (keyword campo)] valor)
                :OTHERWISE
                (assoc-in result [:node (keyword campo)] valor)))
            conf
            conf-vec)))

(defn get-conf [remote-addr]
  (tropicalize-conf remote-addr (get-conf-central)))

;ESTE PARECE QUE NO SE USA PARA NADA!!!  REMOVED
(comment common/private-page [:get "/remote/service/node/get-conf"] {:keys [remote-addr]}
  (let [result (get-conf remote-addr)]
    (json/json-str result)))

;ESTE PARECE QUE NO SE USA PARA NADA!!! REMOVED
(comment common/private-page [:get "/service/node/get-conf"] {:keys [ip]}
  (let [result (get-conf ip)]
    (json/json-str result)))

;ESTE PARECE QUE NO SE USA PARA NADA!!! REMOVED
(comment common/private-page [:get "/clj/service/node/get-conf"] {:keys [ip]}
  (let [result (get-conf ip)]
    (str result)))

(defn set-conf [remote-addr new-conf]
  (let [central-conf (get-conf-central)
        diferencia (data/diff new-conf central-conf)
        dummy (log/debug "central-conf:" central-conf)
        dummy (log/debug "new-conf:" new-conf)
        dummy (log/debug "diferencia:" diferencia)
        fdiff (first diferencia)
        dummy (log/debug "first-diferencia:" fdiff)]
  (confdb/set-conf-for remote-addr fdiff)))

(common/private-page [:post "/service/node/set-conf"] {:keys [ip appls node]}
  (let [conf {:appls appls :node node}]
    (log/debug "set-conf:" conf " to ip:" ip)
    (try
      (set-conf ip conf)
      (json/json-str {:result "OK"})
      (catch Exception e
        (log/error e "Error at /service/node/set-conf")
        {:status 500 :headers {"content-type" "plain/text; charset=iso-8859-1"}
         :body "Se ha generado un error al persistir la configuración del nodo"}))))

(defn print-conf [ip]
  (doseq [r (mx.interware.cbot.web.model.db/db-read "select * from configuracion where ip=?" ip)] 
    (log/info r)))

(defn reset-conf2default [ip]
  (set-conf ip (get-conf-central)))

(defn test-set-conf []
  (let [ip "10.3.3.199"
        cc (get-conf-central)]
    (set-conf 
      ip
      (-> cc 
        (assoc-in [:node :password] "PATO LOCO") 
        (assoc-in [:appls :Default :parameters :clase] "Object") 
        (assoc-in [:appls :Default :instances :uno :delta] "353")))
    (println)
    (println)
    (clojure.pprint/pprint (get-conf ip))
    (println)
    (print-conf ip)))

(comment
(deftest addition
  (is (= 4 (+ 2 2)))
  (is (= 7 (+ 3 4))))

(deftest subtraction
  (is (= 1 (- 4 3)))
  (is (= 3 (- 7 4))))

(deftest arithmetic
  (addition)
  (subtraction))
)


(comment

(defn- tropicaliza [remote-addr conf & pars]
  (let [[appl inst] pars
        conf-of-addr (create-map-from-confDB remote-addr appl inst)]
    (into conf conf-of-addr)))


(defn OLDget-conf [remote-addr]
  (let [cbot-info (deref mx.interware.cbot.store/app-store)
        node-conf (tropicaliza remote-addr (:node-conf cbot-info))
        configuration (:configuration cbot-info)
        
        result {:node node-conf
                :appls (into {} (map (fn [[appid conf]]
                                       {appid {:parameters  (tropicaliza remote-addr (:parameters conf) appid) 
                                               :instances (into {} (map (fn [[inst conf-inst]]
                                                                          {inst (tropicaliza remote-addr (:param-map conf-inst) appid inst)})
                                                                        (:instances conf)))}}) 
                                     configuration))}]
    result))

(defn OLDtropicalize-conf [remote-addr {:keys [node appls]}]
  {:node (tropicaliza remote-addr node)
   :appls (into {} (map (fn [[appid conf]]
                          {appid {:parameters  (tropicaliza remote-addr (or (:parameters conf) {}) appid)
                                  :instances (into {} (map (fn [[inst conf-inst]]
                                                             {inst (tropicaliza remote-addr (or conf-inst {}) appid inst)})
                                                           (:instances conf)))}})
                        appls))})

  )


(comment
(common/private-page "/admin/get-nodes" []
  (services/get-nodes :json))

(common/private-page "/clj/admin/get-nodes" []
  (services/get-nodes :clojure))

(common/private-page [:post "/services/node"] nod
  (log/debug nod)
  (db/add-node nod))

(common/private-page [:post "/clj/service/node"] nod
  (services/get-nodes :clojure))



  )


