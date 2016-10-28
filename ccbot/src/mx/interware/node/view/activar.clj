(ns mx.interware.node.view.activar
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [mx.interware.cbot.web.views.common :as common]
            [mx.interware.node.db.appldb :as appldb]
            [mx.interware.node.db.nodedb :as nodedb]
            [mx.interware.node.core :as bcore]
            [mx.interware.cbot.store :as store]
            [noir.util.crypt :as crypt]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]))

(def activar-screen-head ["/css/style.css"
                          "/css/jquery.contextMenu.css"
                          "/js/jquery-1.6.4.min.js"
                          "/js/jquery.blockUI.js"
                          "/js/jquery.contextMenu.js"
                          "/js/jquery.ui.position.js"
                          "/js/general-validate.js"
                          "/js/robot-status.js"
                          "/js/activar.js"])

(defn activar-body []
  [:div {:id "app-screen" :class "divActivar", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Activar/Desactivar Instancias"]
       [:div {:class "right"}]]
      [:div#div-activar
       [:div {:id "divMessages" :style "color: red; display: inline;"}]
       [:table {:class "tableNodeField"}
        [:tr
         [:td {:colspan "3" :align "center"}
          [:form#aplicacion {:action "/service/aplicacion" :method "GET"}
          [:font {:size "2" :style "font-weight: bold;"} "Seleccione una aplicaci&oacute;n: "]
          [:select#appl {:class "field"}
           [:option {:value "" } " Seleccione... "]
           (map (fn [app]
                  [:option {:value (name app)} (name app)]) (store/get-app-names))]]]]
        [:tr {:height "10px"}]
        [:tr {:valign "top"}
         [:td {:width "40%"}
          [:div {:class "box-head"}
           [:div {:class "left" :style "margin: 3px 0 0 2px;"}
            [:input {:type "checkbox" :id "chkInstancias"}]]
            [:h2 "&nbsp;Instancias"]]
          [:div {:style "overflow-y: auto; overflow-x: hidden;"}
           [:table#instancias-tr {:class "tableNodeList"}
            ]]]
         [:td {:width "5%"}]
         [:td {:width="55%"}
          [:div {:class "box-head"}
           [:div {:class "left" :style "margin: 3px 0 0 2px;"}
            [:input {:type "checkbox" :id "chkNodes"}]]
           [:h2 "&nbsp;Nodos"]]
          [:div {:style "overflow-y: auto; overflow-x: hidden;"}
            [:table  {:class "tableNodeList"}
              (map (fn [mapa] 
              [:tr
               [:td {:align "center"}
                [:input.chknodes {:type "checkbox" :value (:ip mapa)}]]
               [:td (:shortn mapa) "/" (:name mapa)]
               [:td {:align "center"}
                [:a {:href "#" :class "hrefConfig" :id (:ip mapa) :title "Ver Estado Actual"}
                 [:img {:src "/images/node/info.png"}]]]
               [:td.IMGof {:align "center"} 
                 [:input {:type "hidden" :value (:ip mapa)}]
                 [:a {:href "#"} (bcore/status-image-of (:ip mapa))]]]) (nodedb/get-node))]]]]
              [:tr
               [:td {:colspan "3" :align "center"}
                [:input {:type "button" :id "actualizar" :value "Actualizar" :class "button"}]]]]]]]]])
           
(common/private-page [:get "/admin/activar"] []
  (common/layout 
    activar-screen-head 
    (activar-body)))
