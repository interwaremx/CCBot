(ns mx.interware.node.view.confignode 
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [clojure.tools.logging :as log]
            [mx.interware.cbot.web.views.common :as common]
            [mx.interware.node.db.appldb :as appldb]
            ;[mx.interware.node.db.nodedb :as nodedb]
            [mx.interware.node.service.node :as node]
            [mx.interware.cbot.store :as store]
            [noir.util.crypt :as crypt]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]))

(def confignode-screen-head ["/css/style.css"
                                 "/js/jquery-1.6.4.min.js"
                                 "/js/jquery.blockUI.js"
                                 "/js/general-validate.js"
                                 "/js/config-node.js"])

(defn param->tag [map inicio nombres]
  (reduce (fn [result [k v]]
            (conj result
                  [:tr {:class "trNode"}
                   [:td {:align "right" :width "25%"} (str (name k) ":")]
                   [:td {:width "75%"} 
                    [:input {:class (str (:tipo nombres) " requiredx field") 
                             :maxlength "200"
                             :id (str (:appl nombres) (if (:inst nombres)  (str "|" (:inst nombres))) "|" (name k))
                             :type "text" :value (str v) :style "width: 97%;"
                             :title "Valor específico para este nodo o blanco para reestablecer default"}]]]))
          inicio
          (filter (fn[[k _]] (not= k :-)) map)))

(defn instance->tag [inst-map tag appl-name]
  (reduce (fn [result [instk params]]
            (conj result
                  [:table {:class "tableNodeField"}
                   [:tr
                    [:td {:width "15%"} instk]
                    [:td {:width "85%"} (param->tag params [:table {:class "tableNodeList tInstancia"}
                                                            [:tr 
                                                             [:th {:class "thListNode"} "Par&aacute;metro"]
                                                             [:th {:class "thListNode"} "Valor"]]] {:tipo "inst" :appl (name appl-name) :inst (name instk)})]]]))
          tag
          inst-map))

(defn confignode-screen-body [ip dname shortn]
  (log/debug ip " nombre " dname " shortn " shortn)
  [:div {:id "app-screen" :class "shell divConfiguracionNode", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Resumen de Configuraci&oacute;n"]
       [:div {:class "right"}]]
      [:div
       [:div {:id "divMessages" :style "color: red; display: inline;"}]
       [:table {:class "tableNodeField"}
        [:tr
         [:th {:align "left" :class "tNode"}
          [:p {:style "border-style: solid; border-color: #BDBBBB;"} ip " / " dname " / " shortn]
          [:input {:type "hidden" :id "ip" :value ip}]]]
         (let [config-map (node/get-conf ip)]
           (log/debug (str "config-map:" config-map))
           (into [:tr
                  [:td
                   (param->tag (:node config-map)
                               [:table {:class "tableNodeList tNode"}
                                [:tr 
                                 [:th {:class "thListNode"} "Par&aacute;metro"]
                                 [:th {:class "thListNode"} "Valor"]]]
                               {:tipo "node"})]]
                 (map (fn [[appl-name info]]
                        (into [:tr
                               [:td
                                [:table {:width "100%"}
                                 [:tr
                                  [:th {:align "left" :class "tAplicacion"}
                                   [:p {:style "border-style: solid; border-color: #87BDE1;"} (name appl-name)]]]
                                 [:tr
                                  [:td
                                   (param->tag (:parameters info)
                                               [:table {:class "tableNodeList tAplicacion"}
                                                [:tr 
                                                 [:th {:class "thListNode"} "Par&aacute;metro"]
                                                 [:th {:class "thListNode"} "Valor"]]]
                                               {:tipo "appl" :appl (name appl-name)})]]
                                 [:tr
                                  [:td
                                   [:table {:width "100%" :style "border-style:solid;"}
                                    [:tr
                                     [:th {:align "left" :class "tInstancia"}
                                      [:p {:style "border-style: solid; border-color: #E3E7F4;"} "Instancias"]]]
                                    [:tr
                                  (instance->tag (:instances info) [:td] appl-name)]]]]]]]
                              (:instances info)))
                      (:appls config-map))))
        [:tr
         [:td {:align "center" :colspan "2"}
          [:input {:align "right" :type "button" :value "Guardar" :id "guardar" :class "button"}] "&nbsp;"
          [:input {:align "right" :type "button" :value "Resetear" :id "resetear" :class "button"}] "&nbsp;"
          [:input {:align "right" :onclick "document.location.href='/admin/nodes';" :type "button" :value "Regresar" :class "button"}]]]]]]]]])

(common/private-page [:get "/admin/node/config"] {:keys [ip name shortn]}
  (common/layout 
    confignode-screen-head 
    (confignode-screen-body ip name shortn)))

