(ns mx.interware.cbot.web.views.common
  (:use [noir.core :only [defpartial]]
        hiccup.element 
        hiccup.form
        [hiccup.page :only [include-css include-js html5]])
  (:require [noir.session :as session]
            [mx.interware.cbot.globals :as CG]))

(defn to-head [name]
  (cond (.endsWith name ".css") (include-css name)
        (.endsWith name ".js") (include-js name)
        :OTHERWISE (str "ERROR " name " NO TERMINA CON .css O .js")))

(defn create-includes [names]
  (map to-head names))

(def k->inc {:style  "/css/style.css"
             :jq  "/js/jquery-1.6.4.min.js"
             :jqui-css  "/css/jquery-ui-1.8.16.custom.css"
             :jqui  "/js/jquery-ui-1.8.16.custom.min.js"
             :jqv  "/js/jquery.validate.min.js"
             :raphael  "/js/raphael.js"
             :cbot2  "/js/cbot2.js"
             :cbotview  "/js/cbotview.js"
             :application  "/js/application.js"
             :node-conf  "/js/node-conf.js"
             :ccbot  "/js/ccbot.js"
             :signup "/js/signup.js"
             :gen-val "/js/general-validate.js"
             :b-ui "/js/jquery.blockUI.js"
             })

(def page-content-head
[:head
 [:title "e-Robot"]
 ])


(defn login-form []
  (form-to [:post "/login"]
           [:table {:style "padding: 0;" :align "rigth" :width "40%"}
            [:tr
             [:td {:class "tdFieldNode" :style "color: white;"} "Usuario:"]
             [:td 
              (text-field {:id "uid" :placeholder "Usuario" :class "field" :maxlength "40" :style "width: 95%;"} "userid")]
             [:td
              [:input {:id "IniciarSesion" :value "Iniciar Sesión" :type"submit" :class "button-link"}]]]
            [:tr
             [:td {:class "tdFieldNode" :style "color: white;"} "Password:"]
             [:td 
              (password-field {:id "pas" :placeholder "Contraseña" :class "field" :maxlength "100" :style "width: 95%;"} "pass")]
             [:td (link-to {:class "linkMenu"} "/signup" "Crear Usuario")]]]
           ))

(defn build-includes [head-list]
  (into page-content-head (create-includes head-list)))

;; en el siguiente atomo se puede almacenar un menu a ser desplegado en un nodo NO central
(def node-menu (atom ""))

(def extra-menu (atom ""))

(def copyright 
  (atom "© 2011, 2012, 2013, 2014 InterWare de México S.A. de C.V. / eRobot v3.1.16"))

(defpartial layout [head-list & content]
  (html5
    (build-includes head-list)
    [:body
     [:div#header {:class "topx" :style "display: block;"}
      [:div {:class "shell2"}
       [:div#top2
        [:table {:width "100%" :height "100%" :cellspacing "1px"}
          [:tr 
           [:td  {:align "center" :width "15%"}
            [:table
             [:tr
              [:td 
               [:a {:href "/"}
                [:img {:alt "e-robot", :width "100",:src "/images/logo-e-Robot.png",:height "25px"}]]]]
            ]]
           [:td {:align "center" :width "85%"}
            (if (CG/is-central?)
              (cond 
                (= "ccbot" (session/get :user))
                [:table 
                 [:tr {:rowspan "2"}
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/node"} "Par&aacute;metros Nodos"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/applications"} "Par&aacute;metros Aplicaciones"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/cbot"} "Diagrama"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/nodes"} "Nodos"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/distribuir"} "Distribuir Aplicaciones"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/activar"} "Activar/Desactivar Instancias"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/reporte"} "Reporte Tiempos"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/reporte-hars"} "Reporte Tiempos Har"]]
                  [:td {:style "padding: 3px; color:white;"} "|" [:a.linkMenu {:href "/admin/users"} "Usuarios"]]
                  ]
                 @extra-menu]
                
                (session/get :user)
                @node-menu
                
                :OTHERWISE
                [:div {:align "right" :style "padding-right: 30px;"} (login-form)])
              @node-menu)]]]
        
        (if-let [user (session/get :user)]
          [:div.user
           [:table
            [:tr {:height "5px"}]
            [:tr 
             [:td {:align "left" :style "color: #C0C2C4; padding: 2px;" :title "Usuario Activo"} (session/get :user)]]
            [:tr
             [:td {:style "padding: 3px; color:white;"} (form-to [:post "/logout"] "|" [:input {:id "Salir" :value "Salir" :type "submit" :class "button-link"}])]]]])
        
        ]]]
     [:div {:height "100px;"} "&nbsp;"] ;FGC
     [:div.centerx {:style "display: block;"} content]
     [:div "&nbsp;"]
     [:div#footer {:class "bottomx" :style "display: block;"}
      [:div
       {:class "shell"}
       [:span
        {:class "left"}
        @copyright]
       [:span
        {:class "right"}
        "Design by "
        [:a {:href "http://www.interware.com.mx"} "interware.com.mx"]]]]]))

(defn- fixPath [s]
  (comment if (.startsWith s "/")
    (subs s 1)
    s)
  s)
  

(defmacro iw-defpage [path params & content]
  (let [path (cond (string? path) (fixPath path)
                   (vector? path) (let [[mtd p] path]
                                    [mtd (fixPath p)]))]
    `(noir.core/defpage
       ~path
       ~params
       ~@content)))

(defmacro private-page [path params & content]
  `(iw-defpage 
     ~path
     ~params
     (if (session/get :user)
      (do ~@content)
      (noir.response/redirect "/"))))
