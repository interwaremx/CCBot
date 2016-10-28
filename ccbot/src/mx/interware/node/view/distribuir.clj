(ns mx.interware.node.view.distribuir
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [mx.interware.cbot.web.views.common :as common]
            [mx.interware.node.db.appldb :as appldb]
            [mx.interware.node.core :as bcore]
            [mx.interware.node.db.nodedb :as nodedb]
            [mx.interware.cbot.store :as store]
            [noir.util.crypt :as crypt]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]))

(def distribuir-screen-head ["/css/style.css"
                             "/css/jquery.contextMenu.css"
                             "/js/jquery-1.6.4.min.js"
                             "/js/jquery.blockUI.js"
                             "/js/jquery.contextMenu.js"
                             "/js/jquery.ui.position.js"
                             "/js/general-validate.js"
                             "/js/robot-status.js"
                             "/js/distribuir.js"])

(defn distribuir-body []
  [:div {:id "app-screen" :class "divDistribuir", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Distribuir Aplicaciones"]
       [:div {:class "right"}]]
      [:div#div-distribuir
       [:div {:id "divMessages" :style "color: red; display: inline;"}]
       [:table {:class "tableNodeField"}
        [:tr {:valign "top"}
         [:td {:width "45%"}
          [:div {:class "box-head"}
           [:div {:class "left" :style "margin: 3px 0 0 2px;"}
            [:input {:type "checkbox" :id "chkApps"}]]
           [:h2 "&nbsp;Aplicaciones"]]
          [:div {:style "overflow-y: auto; overflow-x: hidden;"}
           [:table {:class "tableNodeList"}
            (map (fn [app]
                   [:tr
                    [:td 
                     [:input.chkapps {:type "checkbox" :id (name app) :value (name app)}]]
                    [:td (name app)]])
                 (store/get-app-names))]]]
         [:td {:width "5%"}]
         [:td {:width="50%"}
          [:div {:class "box-head"}
           [:div {:class "left" :style "margin: 3px 0 0 2px;"}
            [:input {:type "checkbox" :id "chkNodes"}]]
           [:h2 "&nbsp;Nodos"]]
          [:div {:style "overflow-y: auto; overflow-x: hidden;"}
            [:table {:class "tableNodeList"}
             (map (fn [mapa]
                    [:tr
                     [:td {:align "center"}
                      [:input.chknodes {:type "checkbox" :value (:ip mapa)}]]
                     [:td (:shortn mapa) "/" (:name mapa)]
                     [:td.IMGof {:align "center"} 
                      [:input {:type "hidden" :value (:ip mapa)}]
                      [:a {:href "#"} (bcore/status-image-of (:ip mapa))]]]) 
                  (nodedb/get-node))]]]]
        [:tr
         [:td {:colspan "3" :align "center"}
          [:input {:type "button" :id "distribuir" :value "Distribuir" :class "button"}] "&nbsp;"
          [:input {:type "button" :id "info-btn" :value "Información" :class "button"}]]
         ]
        [:tr 
         [:table {:id "info-tbl"}]]
        ]]]]]])
           
(common/private-page [:get "/admin/distribuir"] []
  (common/layout 
    distribuir-screen-head 
    (distribuir-body)))
