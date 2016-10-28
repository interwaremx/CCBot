(ns mx.interware.cbot.web.views.cbothtml
   (:use 
     [mx.interware.cbot.web.views.common :as common]
     [noir.content.getting-started]
     [noir.core :only [defpartial defpage]]
     [hiccup.page :only [include-css include-js html5]])
   (:require
     [noir.response :as resp]
     [noir.content.getting-started]))

(def robot-screen-head [(:jq k->inc) (:style k->inc) (:raphael k->inc) (:jqui-css k->inc) 
                        (:jqui k->inc) (:cbot2 k->inc)
                        ])

(def robot-screen-head-view [(:jq k->inc) (:style k->inc) (:raphael k->inc) (:jqui-css k->inc) 
                             (:jqui k->inc) (:cbotview k->inc)])

(defn robot-screen [admin?]
  [:div#robot-screen
   {:class "shell", :style "display: true;"}
   [:div#main
    [:div#content2
     [:div#state-diagram-box
      {:class "box"}
      [:div
       {:class "box-head"}
       [:h2 {:class "left"} "Diagrama de Estados"]
       [:div#thump
        {:class "right", :style "position:relative; display:inherit"}
        [:img#thumb-up
         {:style "position:relative; display:inherit; padding-top:5px",
          :src "images/thumb-up.png"}]
        [:img#thumb-down
         {:style "position:relative; display:none; padding-top:5px",
          :src "images/thumb.png"}]]
       [:div {:class "right"}]]
      [:div#states {:style "position:relative;"}]
      [:div {:class "buttons"}]]
     [:div#status-box
      {:class "box"}
      [:div {:class "box-head"} [:h2 "Estado"]]
      [:div
       {:class "table"}
       [:table
        {:border "0",
         :width "100%",
         :class "status",
         :cellpadding "0",
         :cellspacing "0"}
        [:tr
         [:th {:with "9%"} "Estadox"]
          [:th {:with "61%"} "Resultado"]
          [:th {:with "16%"} "Cuando"]
          [:th {:with "13%"} "Delta"]]
        [:tr
          [:td {:class "status", :id "status.state.0"} "Estado"]
          [:td {:class "status", :id "status.resut.0"} "Resutado"]
          [:td {:class "status", :id "status.when.0"} "Cuando"]
          [:td {:class "status", :id "status.delta.0"} "Delta"]]
         [:tr
          {:class "odd"}
          [:td {:class "status", :id "status.state.1"} "Estado"]
          [:td {:class "status", :id "status.resut.1"} "Resultado"]
          [:td {:class "status", :id "status.when.1"} "Cuando"]
          [:td {:class "status", :id "status.delta.1"} "Delta"]]
         [:tr
          [:td {:class "status", :id "status.state.2"} "Estado"]
          [:td {:class "status", :id "status.resut.2"} "Resutado"]
          [:td {:class "status", :id "status.when.2"} "Cuando"]
          [:td {:class "status", :id "status.delta.2"} "Delta"]]
         [:tr
          {:class "odd"}
          [:td {:class "status", :id "status.state.3"} "Estado"]
          [:td {:class "status", :id "status.resut.3"} "Resultado"]
          [:td {:class "status", :id "status.when.3"} "Cuando"]
          [:td {:class "status", :id "status.delta.3"} "Delta"]]
         [:tr
          [:td {:class "status", :id "status.state.4"} "Estado"]
          [:td {:class "status", :id "status.resut.4"} "Resultado"]
          [:td {:class "status", :id "status.when.4"} "Cuando"]
          [:td {:class "status", :id "status.delta.4"} "Delta"]]
         [:tr
          {:class "odd"}
          [:td {:class "status", :id "status.state.5"} "Estado"]
          [:td {:class "status", :id "status.resut.5"} "Resultado"]
          [:td {:class "status", :id "status.when.5"} "Cuando"]
          [:td {:class "status", :id "status.delta.5"} "Delta"]]
         [:tr
          [:td {:class "status", :id "status.state.6"} "Estado"]
          [:td {:class "status", :id "status.resut.6"} "Resultado"]
          [:td {:class "status", :id "status.when.6"} "Cuando"]
          [:td {:class "status", :id "status.delta.6"} "Delta"]]
         [:tr
          {:class "odd"}
          [:td {:class "status", :id "status.state.7"} "Estado"]
          [:td {:class "status", :id "status.resut.7"} "Resultado"]
          [:td {:class "status", :id "status.when.7"} "Cuando"]
          [:td {:class "status", :id "status.delta.7"} "Delta"]]
         [:tr
          [:td {:class "status", :id "status.state.8"} "Estado"]
          [:td {:class "status", :id "status.resut.8"} "Resultado"]
          [:td {:class "status", :id "status.when.8"} "Cuando"]
          [:td {:class "status", :id "status.delta.8"} "Delta"]]
         [:tr
          {:class "odd"}
          [:td {:class "status", :id "status.state.9"} "Estado"]
          [:td {:class "status", :id "status.resut.9"} "Resultado"]
          [:td {:class "status", :id "status.when.9"} "Cuando"]
          [:td {:class "status", :id "status.delta.9"} "Delta"]]
         ]]
      [:div {:class "buttons"}]]]
    [:div#sidebar
     [:div#control-center-box {:class "box"}
      [:div {:class "box-head"} [:h2 "Panel de Control"]]
      [:div {:class "box-content"}
       [:div {:class "swich" :style "display:block;"}
        ;[:h4 [:a {:href "/node"} "Node configuration"]]
        ;[:h4 [:a {:href "/applications"} "Applications"]]
        [:h4 "Aplicaciones"]
        [:select#applications
         {:class "field"}
         [:option#application {:value ""} "Application1"]
         [:option#application {:value ""} "Application2"]]
        [:h4 "Instancias"]
        [:select#instances {:class "field"}]]
       [:div {:class "cl"} "&nbsp;"]
       [:input#start-monitor-button 
        {:class "button", :type "button", 
         :style (if admin? "display:true;" "display:none;"), :value "Iniciar-Monitor"}]
       [:input#stop-monitor-button
        {:class "button", :type "button", 
         :style (if admin? "display:true;" "display:none;"), :value "Detener-Monitor"}]
       [:div#start-stop
        {:class "swich"
         :style (if (or true admin?) "display:true;" "display:none;")}
        [:input#start-button
         {:class "button",
          :style "display:inherit",
          :type "button",
          :value "Iniciar"}]
        [:input#stop-button
         {:class "button",
          :style "display:none",
          :type "button",
          :value "Detener"}]]
       [:p#result-str]
       [:br]
       [:div {:class "cl"} "&nbsp;"]
       [:div#resume
        {:class "resume", :style "display:inherit"}
        [:p "Respuesta"]
        [:input#resume-msg {:name "resume-msg", :type "text"}]
        [:input#resume-button
         {:class "button", :type "button", :value "Continuar"}]]
       [:div {:class "cl"} "&nbsp;"]]]
     [:div {:class "box ", :style (if admin? "display:true;" "display:none;")}
      [:div {:class "box-head" :style "display:block;"} [:h2 "Captura de Estado"]]
      [:div#state-create
       {:class "box-content", :style "display:inherit"}
       [:select#operations {:class "field"}]
       [:div {:class "cl"} "&nbsp;"]
       [:input#state-name {:class "field", :type "text"}]
       [:div {:class "cl"} "&nbsp;"]
       [:table
        [:tr
         [:td
          [:input#add-state
           {:name "add-state", :type "button", :value "Agregar" :class "button"}] "&nbsp;" 
          [:input#save-states
           {:name "save-states", :type "button", :value "Guardar" :class "button"}]]]]]]]]])

(def app-screen-head [(:jq k->inc) (:style k->inc) (:raphael k->inc) (:gen-val k->inc) (:application k->inc) (:b-ui k->inc) ]) ;(:lt_ws k->inc)

(def app-screen
  [:div {:id "app-screen" :class "shell divParametrosAplicacionesx", :style "display: true;"}
   [:div#main 
    [:div#content-app
     [:div#applications-box {:class "boxx" :margin-bottom "100px;"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Par&aacute;metros de Aplicaciones"]
       [:div {:class "right"}]]
      [:div
       [:div {:id "divMessages" :style "color: red; display: inline;"}]
       [:form#appForm 
        [:table {:class "tableNodeField"}
         [:tr
          [:td {:class "tdFieldNode"}
           "Aplicaciones: &nbsp;"]
          [:td
           [:select#applications {:class "field"}
            [:option#application {:value ""} "Application1"]
            [:option#application {:value ""} "Application2"]]]]
         [:tr {:class "app-info tAplicacion"}
          [:td {:class "tdFieldNode"} "Nombre:"]
          [:td {:width "70%"} [:input#app-name {:type "text", :value "" :class "field required cljkeyword" :style "width: 97%;"}]]]
         [:tr {:class "app-info tAplicacion"}
          [:td {:class "tdFieldNode"} "Interstate-delay:"]
          [:td [:input#interstate-delay {:type "text", :value "" :class "field required integer" :style "width: 97%;"}]]]
         [:tr {:class "app-info tAplicacion"}
          [:td {:class "tdFieldNode"} "Stats-cache-len:"]
          [:td [:input#stats-cache-len {:type "text", :value "" :class "field required integer" :style "width: 97%;"}]]]
         [:tr {:height "10px"}]]
        [:div {:class "app-info"}
         [:table#parameters {:class "tableNodeList tAplicacion"}
          [:tr
           [:th {:width "5%"}]
           [:th {:class "thListNode" :width "30%"} "Par&aacute;metro"]
           [:th {:class "thListNode" :width "65%"} "Valor"]]]
         [:br]
         [:div {:align "center"}
          [:input#add-p-btn {:class "button", :type "button", :value "Agregar Par&aacute;metro"}]]
         [:br]
         [:br]
         [:table#instances {:class "tableNodeField" :style "border-style:solid;"}
          [:tr 
           [:th {:colspan "3" :class "tInstancia"} "Instancias"]
           ;[:th {:class "tInstancia"}"Par&aacute;metros"]
           ]]
         [:br]
         [:div {:align "center"}
          [:input#add-i-btn {:class "button", :type "button", :value "Agregar Instancia"}]]
         [:br]]
        [:br]
        [:table {:class "tableNodeField" :align "center"}
         [:tr
          [:td {:colspan "2" :align "center"}
           [:input#create-app {:class "button", :type "button", :value "Guardar"}] "&nbsp;"
           [:input#remove-app {:class "button", :type "button", :value "Eliminar"}] "&nbsp;"
           [:input#cancel {:class "button", :type "button", :value "Cancelar"}]]]]]
       ;[:a {:href "/cbot"} "return to main"]
       ]]]]])

(def node-screen-head [(:jq k->inc) (:style k->inc) (:raphael k->inc) (:node-conf k->inc) (:gen-val k->inc) (:b-ui k->inc)])

(def node-screen
  [:div {:id "app-screen" :class "shell divParametrosNodos", :style "display: true;"}
   [:div#main
    [:div#content-app
     [:div#node-box {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Par&aacute;metros de Nodos"]
       [:div {:class "right"}]]
      [:div
       [:div {:id "divMessages" :style "color: red; display: inline;"}]
       [:form#appForm
        [:table#parameters {:class "tableNodeList"}
         [:tr {:height "10px"}]
         [:tr
          [:th {:width "3%"}]
          [:th {:width "33%" :class "thListNode"} "Par&aacute;metro"]
          [:th {:width "65%" :class "thListNode"} "Valor"]]]
        [:table {:class "tableNodeField"}
         [:tr {:height "10px"}]
         [:tr
          [:td {:align "center"}
           [:input#add-p-btn {:class "button", :type "button", :value "Agregar"}] "&nbsp;"
           [:input#save-node-conf {:class "button", :type "button", :value "Guardar"}] "&nbsp;"
           [:input#cancel {:class "button", :type "button", :value "Cancelar"}]]]]
       ;[:a {:href "/cbot"} "return to main"]
        ]]]]]])


(def dialogs
 [:div
 [:div#arrowDialog
  {:style "display:none;"}
  [:h3 "Rule"]
  [:form#regexpForm
   "RegExp"
   [:input#regexp {:type "text", :value ".*"}]
   [:input#arrowStateName {:value= "", :type "hidden"}]
   [:input#arrowOtherStateName {:type "hidden", :value ""}]
   [:input#arrowCnctIdx {:type "hidden", :value ""}]]
  [:br]]
 
 [:div#send-stats-oprDialog
  {:style "display:none;"}
  [:h3 "Send Stats Operation"]
  [:form
   [:table
    [:tr
     [:td "Estad&iacute;sticas a enviar (número de filas)"]
     [:td [:input#stats-rows2send
       {:size "10", :max-length "3", :type "text", :value "20"}]]]
    [:tr
     [:td "D&iacute;as para borrado (para respaldo)"]
     [:td [:input#stats-days4clear
           {:size "10", :max-length "2", :type "text", :value "7"}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
  
 [:div#sql-read-oprDialog
  {:style "display:none;"}
  [:h3 "SQL read operation"]
  [:form#sql-read-form
   [:table
    [:tr
     [:td "Driver Classname"] [:td [:input {:type "text" :id "classname" :value "org.h2.Driver"}]]]
    [:tr
     [:td "Subprotocol"] [:td [:input {:type "text" :id "subprotocol" :value "h2"}]]]
    [:tr
     [:td "Subname"] [:td [:input {:type "text" :id "subname" :value "/test/testDB"}]]]
    [:tr
     [:td "User"] [:td [:input {:type "text" :id "user" :value ""}]]]
    [:tr
     [:td "Password"] [:td [:input {:type "password" :id "password" :value ""}]]]
    [:tr 
     [:td "Query"] [:td [:input {:type "text" :style "width:250px;" :id "query" :value "select count(*) from estados"}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value ""}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value ""}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
  [:br]
  [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#get-mail-oprDialog
  {:style "display:none;"}
  [:h3 "Get mail operation"]
  [:form#get-mail-form
   [:table
    [:tr
     [:td "Host"] [:td [:input {:type "text" :id "host" :value "pop.gmail.com"}]]]
    [:tr
     [:td "Port"] [:td [:input {:type "text" :id "port" :value "995"}]]]
    [:tr
     [:td "Protocol"] [:td [:input {:type "text" :id "protocol" :value "pop3s"}]]]
    [:tr
     [:td "E-Mail"] [:td [:input {:type "text" :id "email" :value ""}]]]
    [:tr
     [:td "Password"] [:td [:input {:type "password" :id "password" :value ""}]]]
    [:tr
     [:td "Subject RE"] [:td [:input {:type "text" :id "subject-re" :value ".*"}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value ""}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value ""}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
  [:br]
  [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#sleep-oprDialog
  {:style "display:none;"}
  [:h3 "Sleep operation"]
  [:form
   "Delta"
   [:input#delta {:type "text", :value "1000"}]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#socket-oprDialog
  {:style "display:none;"}
  [:h3 "Socket operation"]
  [:form
   [:table
    [:tr [:td "Host"] [:td [:input#host {:type "text", :value ""}]]]
    [:tr [:td "Puerto"] [:td [:input#port {:type "text", :value ""}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value ""}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value ""}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]

 [:div#os-cmd-oprDialog
  {:style "display:none;"}
  [:h3 "OS Command operation"]
  [:form
   [:table
    [:tr
     [:td "Shell"]
     [:td [:input#shell {:type "text", :value "ls"}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value ""}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value ""}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#browser-tc-oprDialog
  {:style "display:none;"}
  [:h3 "Browser TC operation"]
  [:form
   [:table {:class "dialogTable"}
    [:tr
     [:td {:class "dialogNodeLbl"} "Browser"]
     [:td 
      [:select#browser
       {:class "field"}
       [:option {:value ":current"} "current"]
       [:option {:value ":firefox"} "Firefox"]
       ]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Delta"]
     [:td [:input#delta {:type "text", :value "1000"}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Timeout"]
     [:td [:input#timeout {:type "text", :value "60000"}]]]    
    [:tr
     [:td {:class "dialogNodeLbl"} "Use cache"]
     [:td [:input#cache {:type "checkbox"}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Close"]
     [:td [:input#close {:type "checkbox"}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "URI"]
     [:td [:input#uri {:size "70" :type "text", :value ""}]]]
    [:tr
     [:td {:class "dialogNodeLbl"}]
     [:td [:input#loadchrono {:type "button" :value "Load URI into combos"}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Start chrono"]
     [:td 
      [:select#startchrono
       {:class "field"}
       [:option {:value "0-first" :selected "true"} "0-first"]
       (map (fn [i] [:option {:value (str i "-step")} (str i "-step")]) (range 1 99))
       [:option {:value "99-last"} "99-last"]
       ]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Stop chrono"]
     [:td
      [:select#stopchrono
       {:class "field"}
       [:option {:value "0-first"} "0-first"]
       (map (fn [i] [:option {:value (str i "-step")} (str i "-step")]) (range 1 99))
       [:option {:value "99-last" :selected "true"} "99-last"]
       ]]]
    [:tr {:class "ffOption hide-info"}
     [:td {:class "dialogNodeLbl"}] "Binary path"
     [:td [:input#binary-path {:size "70" :type "text" :value ""}]]]
    [:tr {:class "ffOption hide-info"}
     [:td {:class "dialogNodeLbl"}] "Profile path"
     [:td [:input#profile-path {:size "70" :type "text" :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#fb-har-oprDialog
  {:style "display:none;"}
  [:h3 "Firebug Har Operation"]
  [:form
   [:table {:class "dialogTable"}
    [:tr
     [:td {:class "dialogNodeLbl"} "Browser"]
     [:td 
      [:select#browser {:class "field"}
       [:option {:value ":firefox"} "Firefox"]
       ]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Delta"]
     [:td [:input#delta {:type "text", :value "10000"}]]] ; Se refiere al tiempo de espera entre operaciones.
    [:tr
     [:td {:class "dialogNodeLbl"} "Timeout"]
     [:td [:input#timeout {:type "text", :value "60000"}]]] ; Se refiere al tiempo antes de terminar la prueba por espera.
    [:tr
     [:td {:class "dialogNodeLbl"} "Use cache"]
     [:td [:input#cache {:type "checkbox"}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "URI"]
     [:td [:input#uriHAR {:size "70" :type "text", :value ""}]]]
    [:tr
     [:td {:class "dialogNodeLbl"} "Har's directory"]
     [:td [:input#hars-dir {:size "70" :type "text", :value ""}]]]
    [:tr {:class "ffOption hide-info"}
     [:td {:class "dialogNodeLbl"}] "Binary path"
     [:td [:input#binary-path {:size "70" :type "text" :value ""}]]]
    [:tr {:class "ffOption hide-info"}
     [:td {:class "dialogNodeLbl"}] "Profile path"
     [:td [:input#profile-path {:size "70" :type "text" :value ""}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#human-oprDialog
  {:style "display:none;"}
  [:h3 "Human operation"]
  [:form
   "Sin informaci&oacute;n adicional"
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#switch-good-oprDialog
  {:style "display:none;"}
  [:h3 "Switch good operation"]
  [:form "Sin informaci&oacute;n adicional" [:intput#state-name {:type "hidden"}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#switch-bad-oprDialog
  {:style "display:none;"}
  [:h3 "Switch bad operation"]
  [:form
   "Minutos de espera"
   [:input#minutes2wait {:type "text", :value "15"}]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#date-time-oprDialog
  {:style "display:none;"}
  [:h3 "Date-time operation"]
  [:form
   "Formato ej:HH:mm:ss"
   [:input#format {:type "text", :value "HH:mm:ss"}]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#log-oprDialog
  {:style "display:none;"}
  [:h3 "Log operation"]
  [:form
   [:table
    [:tr
     [:td "Nivel"]
     [:td
      [:select#log-levels
       {:class "field"}
       [:option {:value ":trace"} "Trace"]
       [:option {:value ":debug"} "Debug"]
       [:option {:value ":info"} "Info"]
       [:option {:value ":warn"} "Warn"]
       [:option {:value ":error"} "Error"]
       [:option {:value ":fatal"} "Fatal"]]]]
    [:tr [:td "Mensaje"] [:td [:input#text {:type "text"}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#print-msg-oprDialog
  {:style "display:none;"}
  [:h3 "Print msg operation"]
  [:form
   "Mensaje"
   [:input#msg {:type "text", :value ""}]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#print-context-oprDialog
  {:style "display:none;"}
  [:h3 "Print context operation"]
  [:form
   "Context name filter(RE)"
   [:input#filter-re {:type "text", :value ".*"}]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#clojure-oprDialog
  {:style "display:none;"}
  [:h3 "Clojure operation"]
  [:form
   [:table {:width "600px"}
    [:tr [:td {:width "5%"} "C&oacute;digo"] [:td {:width "95%"} [:textarea#code {:rows "20", :cols "80" :width "100%"}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#js-oprDialog
  {:style "display:none;"}
  [:h3 "Javascript operation"]
  [:form
   [:table
    [:tr [:td "C&oacute;digo"] [:td [:textarea#code {:rows "20", :cols "80"}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#play-sound-oprDialog
  {:style "display:none;"}
  [:h3 "Play sound operation"]
  [:form
   [:table
    [:tr
     [:td "Directorio"]
     [:td
      [:input#path
       {:type "text", :value "resources/public/sound/housprob.wav"}]]]]
   [:intput#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#get-http-oprDialog
  {:style "display:none;"}
  [:h3 "GET http operation"]
  [:form
   [:table
    [:tr
     [:td "URL"]
     [:td [:input#url {:type "text", :value "http://"}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value "5000"}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value "3"}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value "3000"}]]]]
   [:input#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#post-http-oprDialog
  {:style "display:none;"}
  [:h3 "POST http operation"]
  [:form
   [:table
    [:tr
     [:td "URL"]
     [:td [:input#url {:size "80", :type "text", :value "http://"}]]]
    [:tr
     [:td "Params"]
     [:td
      [:table#http-post-params
       {:border "1", :width "300pt"}
       [:tr [:th {:width "30%"} "Name"] [:th {:width "70%"} "Value"]]
       [:tr
        [:td
         {:colspan "2"}
         [:textarea#params {:rows "20", :cols "60"}]]]]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value "5000"}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value "3"}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value "3000"}]]]]
   [:input#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]
 
 [:div#send-mail-oprDialog
  {:style "display:none;"}
  [:h3 "Send mail operation"]
  [:form
   [:table
    [:tr
     [:td "Host"]
     [:td
      [:input#host
       {:size "30", :type "text", :value "smtp.gmail.com"}]]]
    [:tr
     [:td "Puerto"]
     [:td [:input#port {:size= "5", :type "text", :value "993"}]]]
    [:tr [:td "SSL"] [:td [:input#ssl {:type "checkbox"}]]]
    [:tr
     [:td "Usuario"]
     [:td [:input#user {:size "30", :type "text", :value ""}]]]
    [:tr
     [:td "Password"]
     [:td [:input#password {:size "30", :type "password", :value ""}]]]
    [:tr [:td "To"] [:td [:textarea#to-vec {:rows= "5", :cols "50"}]]]
    [:tr
     [:td "Subject"]
     [:td [:input#subject {:size "80", :type "text", :value ""}]]]
    [:tr
     [:td "Body"]
     [:td [:textarea#text-vec {:rows "5", :cols "50"}]]]
    [:tr
     [:td "Timeout"]
     [:td [:input#timeout {:type "text", :value ""}]]]
    [:tr
     [:td "Retry count"]
     [:td [:input#retry-count {:type "text", :value "3"}]]]
    [:tr
     [:td "Retry delay"]
     [:td [:input#retry-delay {:type "text", :value "3000"}]]]]
   [:input#state-name {:type "hidden", :value ""}]
   [:br]
   [:input {:type "checkbox" :id "logit"}] "Log it?"]]])

(common/private-page "/cbot" []
  (common/layout
    robot-screen-head
    (robot-screen true)
    dialogs))

(common/iw-defpage "/viewcbot" []
  (common/layout
    robot-screen-head-view
    (robot-screen false)
    dialogs))

(common/private-page "/applications" []
  (common/layout
    app-screen-head
    app-screen))

(common/private-page "/node" []
  (common/layout
    node-screen-head
    node-screen))
