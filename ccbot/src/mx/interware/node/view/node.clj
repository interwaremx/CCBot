(ns mx.interware.node.view.node
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [clojure.tools.logging :as log]
            [clojure.data.json :as json]
            [mx.interware.cbot.web.views.common :as common]
            [mx.interware.node.core :as bcore]
            [mx.interware.node.db.nodedb :as nodedb]
            [noir.util.crypt :as crypt]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]
            [clj-http.client :as http]))

(def node-screen-head ["/css/style.css"
                             "/js/jquery-1.6.4.min.js"
                             "/js/jquery.validate.min.js"
                             "/js/jquery.blockUI.js"
                             "/js/general-validate.js"
                             "/js/node.js"])

(defn node-screen [mtd nod]
  (log/debug nod)
  [:div {:id "node-screen" :class "divCrearModifNode", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} (str (if (= mtd :put) "Modificar" "Crear") " Nodo")]
       [:div {:class "right"}]]
      [:div#div-node
       [:div {:id "divMessages" :style "color: red; display: inline;"}
        (if (nod :error) [:p (nod :error)] [:h2 ""])]
       [:form {:id "appForm" :action "/admin/node" :method :post}
        [:table {:class "tableNodeField"}
         [:tr {:height "10px"}]
         [:tr
          [:td {:class "tdFieldNode"} "URL:"]
          [:td (cond (= :put mtd)
                     (label "ip" (or (:ip nod) ""))
                     (= :post mtd) (text-field {:maxlength "100" :class "field" :style "width: 96%;"} "ip" (or (:ip nod) "")))]]
         [:tr
          [:td {:class "tdFieldNode"} "ID:"]
          [:td (text-field {:maxlength "10" :class "field" :style "width: 96%;"} "shortn" (or (:shortn nod) ""))]]
         [:tr 
          [:td {:class "tdFieldNode"} "Nombre:"]
          [:td (text-field {:maxlength "30" :class "field" :style "width: 96%;"} "name" (or (:name nod) ""))]]
         [:tr 
          [:td {:class "tdFieldNode"} "LLave Pub.:"]
          [:td (text-field {:maxlength "300" :class "field" :style "width: 96%;"} "pubkey" (or (:pubkey nod) ""))]]
         [:tr 
          [:td {:class "tdFieldNode"} "Válido:"]
          [:td (check-box {} "valid" (= "true" (:valid nod)))]]
         
         [:tr {:height "10px"}]
         [:tr 
          [:td {:align "center" :colspan "2"}
           (submit-button {:id "opSuc" :name "accion" :class "button"}
                          (if (= mtd :post) "Crear" "Modificar")) "&nbsp;"
          (submit-button {:name "accion" :class "cancel button"} "Regresar")]
          [:td 
           (if (= mtd :put)
             (let [url (java.net.URL. (:ip nod))
                   ip (.getHost url)
                   port (.getPort url)]
               [:a {:href (format "/admin/node-change-central?node-ip=%s&node-port=%s" ip port)} "Cambiar central"]))
           ]]]
        (if (= mtd :put) (hidden-field "ip" (:ip nod)) "")]]]]]])

(common/private-page [:get "/admin/node-post"] nod
 (common/layout
   node-screen-head
   (node-screen :post nod)))

(common/private-page [:get "/admin/node-put"] nod
 (common/layout
   node-screen-head
   (node-screen :put nod)))

(defn node-change-screen [{:keys [node-ip node-port error central-ip central-port] :as info}]
  (log/debug (str info))
  [:div {:id "node-screen" :class "divCrearModifNode", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Cambiar nodo de central (operaci&oacute; no reversible!)"]
       [:div {:class "right"}]]
      [:div#div-node
       [:div {:id "divMessages" :style "color: red; display: inline;"}
        (if error [:p error] [:h2 ""])]
       [:form {:id "appForm" :action "/admin/change-central-to" :method :post}
        (hidden-field "node-ip" node-ip)
        (hidden-field "node-port" node-port)
        [:table {:class "tableNodeField"}
         [:tr {:height "10px"}]
         [:tr
          [:td {:class "tdFieldNode"} "URL:"]
          [:td (label "Node" (format "http://%s:%s" node-ip node-port))]]
         [:tr
          [:td {:class "tdFieldNode"} "New central ip:"]
          [:td (text-field {:maxlength "15" :class "field" :style "width: 96%;"} "new-central-ip" (or central-ip ""))]]
         [:tr 
          [:td {:class "tdFieldNode"} "New central port:"]
          [:td (text-field {:maxlength "4" :class "field" :style "width: 96%;"} "new-central-port" (or central-port ""))]]
         [:tr {:height "10px"}]
         [:tr 
          [:td {:align "center" :colspan "2"}
           (if (or (nil? error) (not (.startsWith error "OK ")))
             (submit-button {:id "opSuc" :name "accion" :class "button"} "Cambiar nodo") 
             "&nbsp;")
           "&nbsp;"
           (submit-button {:name "accion" :class "cancel button"} "Regresar")]
          ]]]]]]]])


(common/private-page [:get "/admin/node-change-central"] {:keys [node-ip node-port msg central-ip central-port] :as info}
  (println "***** " info)
  (common/layout
    node-screen-head
    (node-change-screen info)))

(defn- do-nod-opr [opr nod-m base]
  (try
    (opr (dissoc nod-m :accion))
    "/admin/nodes"
    (catch java.lang.Exception e
      (let [url (reduce (fn [s [k v]]
                          (str s (name k) "=" (java.net.URLEncoder/encode (str v)) "&")) base (assoc nod-m :error (.getMessage e)))]
        (log/debug "***** " url)
        url))))

(common/private-page [:post "/admin/node"] {:keys [accion] :as nod-m}
 (let [nod-m (update-in nod-m [:valid] #(or % false))]
   (log/debug "POST>>> " (str nod-m))
   (cond (= "Crear" accion) (resp/redirect (do-nod-opr nodedb/add-node nod-m "/admin/node-post?"))
         (= "Modificar" accion) (resp/redirect (do-nod-opr nodedb/upd-node nod-m "/admin/node-put?"))
         :OTHERWISE
         (resp/redirect "/admin/nodes"))))

;; OJO ESTO NO FUNCIONA SI SE ESTA USANDO EL PARAMETRO url-central en el parametro de inicio del central en lugar de ip-central:port-central
;; servicio del central (tiene que estar firmado) que manda llamar a un nodo el servicio "/central2node/change-central-ip-port" no su nuevo central  
(defn change-central-to [{:keys [node-ip node-port new-central-ip new-central-port] :as info}]
  (if (and (= node-ip new-central-ip) (= node-port new-central-port))
    (throw (java.lang.Exception. (format "No es posible indicarle a un node que su central es &eacute;l mismo ip: %s:%s" node-ip node-port)))
    (let [uri (str "http://" node-ip ":" node-port "/central2node/change-central-ip-port")
          params {:form-params {:central-ip new-central-ip :central-port new-central-port}}
          dummy (println "***** calling " uri " " params)
          result (http/post uri params)]
      (throw (java.lang.Exception. (:body result))))))

(common/private-page [:post "/admin/change-central-to"] {:keys [accion node-ip node-port new-central-ip new-central-port] :as info}
  (cond 
    (= accion "Cambiar nodo") (resp/redirect (do-nod-opr change-central-to info "/admin/node-change-central?"))
    :OTHERWISE (resp/redirect "/admin/nodes")))


(common/private-page [:get "/admin/node-delete"] nod
 (log/debug "node-delete>>> " nod)
 (resp/redirect 
   (try
     (nodedb/del-node (:ip nod))
     "/admin/nodes"
     (catch java.sql.SQLException e
       (log/error "node-delete" (.getMessage e))
       (reduce (fn [s [k v]]
                 (str s (name k) "=" v "&"))
               "/admin/nodes?"
               (assoc nod :error (.getMessage e)))))))

(common/private-page [:get "/admin/get-status-img"] {:keys [ip]}
  (let [[_ {src :src title :title}] (bcore/status-image-of ip)]
    (json/json-str {:src src :title title})))

(def nodes-screen-head ["/css/style.css"
                        "/css/jquery.contextMenu.css"
                        "/js/jquery-1.6.4.min.js"
                        "/js/jquery.contextMenu.js"
                        "/js/jquery.ui.position.js"
                        "/js/general-validate.js"
                        "/js/robot-status.js"
                        "/js/nodes.js"])

(defn nodes-screen [nod]
  (log/debug "Nodes: " nod)
  [:div{:id "nodes-screen" :class "divListarNode", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Nodos"]
       [:div {:class "right" :style "margin: 1px 0 0 5px;"}
        [:input {:type "button" :id "crear-node" :value "Crear" :class "button" :onclick "document.location.href='/admin/node-post';"}]
        ]]
      [:div
       [:div {:id "divMessages" :style "color: red; display: inline;"}
        (if (nod :error) [:p (nod :error)])]
       [:table {:class "tableNodeList"}
        [:tr {:height "10px"}]
        [:tr
         [:th]
         [:th]
         [:th]
         [:th {:class "thListNode"} "URL"]
         [:th {:class "thListNode"} "ID"]
         [:th {:class "thListNode"} "Nombre"]
         [:th {:class "thListNode"} "Válidado"]
         [:th {:class "thListNode"} "Robot"]]
        (map (fn [{:keys [ip shortn name pubkey valid]}]
               [:tr
                [:td {:align "center"}
                 [:a {:title "Eliminar Nodo"
                      :onclick "return generalVal.validateOperationAndBlockScreen('eliminar nodo');"
                      :href (str "/admin/node-delete?ip=" ip)
                      :id ip} 
                  [:img {:src "/images/node/delete.png"}]]]
                [:td {:align "center"}
                 [:a {:title "Modificar Nodo"
                      :href (str "/admin/node-put?ip=" ip "&shortn=" shortn "&name=" name "&pubkey=" (java.net.URLEncoder/encode (or pubkey "")) "&valid=" (if-not valid "false" "true"))}
                  [:img {:src "/images/node/edit.png"}]]]
                [:td {:align "center"}
                 [:a {:title "Ver Configuración Nodo"
                      :href (str "/admin/node/config?ip=" ip "&shortn=" shortn "&name=" name "&pubkey=" (java.net.URLEncoder/encode pubkey) "&valid=" (if-not valid "false" "true"))}
                  [:img {:src "/images/node/config.png"}]]]
                [:td ip]
                [:td shortn] 
                [:td name]
                [:td (if valid [:img {:src "/images/node/view.png"}] [:img {:src "/images/node/stop.png"}])]
                [:td.IMGof {:align "center"} 
                 [:input {:type "hidden" :value ip}]
                 [:a {:href "#"} (bcore/status-image-of ip)]]])
             (nodedb/get-node))
        [:tr {:height "10px"}]]
       ]]]]])

(common/private-page [:get "/admin/nodes"] nod
 (common/layout
   nodes-screen-head
   (nodes-screen nod)))

