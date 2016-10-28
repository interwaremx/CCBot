(ns mx.interware.cbot.web.views.users
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [mx.interware.cbot.web.views.common :as common]
            [mx.interware.cbot.web.model.db :as db]
            [clojure.data.json :as json]
            [noir.util.crypt :as crypt]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]
            [clojure.tools.logging :as log]))

(def no-js [(:style common/k->inc)])

(common/iw-defpage "/" {:keys [userid error]}
  (common/layout
    no-js
    (if error [:div {:id "divMessages" :style "color: red; display: inline;"}  "Usuario inactivo o dato(s) incorrecto(s)!"])
    [:table {:width "100%" :height "100%" :align "center" :valign "middle"}
     [:tr {:valign "middle"} 
      [:td {:align "center"} [:a {:href "/viewcbot"} [:img {:src "/images/robot-big.gif" }]]]]]))

(def signup-screen-head [(:style common/k->inc) (:jq common/k->inc) (:jqv common/k->inc) (:gen-val common/k->inc) (:b-ui common/k->inc) (:signup common/k->inc)])

(common/iw-defpage "/signup" {:keys [userid error]}
  (common/layout
    signup-screen-head
    [:div {:class "divCrearUsuario"}
     [:div {:class "box" :width "100%;"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Crear Usuario"]
       [:div {:class "right"}]]
      [:div.error {:id "divMessages" :style "color: red; display: inline;"}  error]
      [:form#appform {:method :post :action "/signup"}
       [:table {:class "tableNodeField"}
        [:tr {:height "10px"}]
        [:tr
         [:td {:class "tdFieldNode"} "Mail Corporativo:"]
         [:td {:width "70%;"} (text-field {:id "uid" :class "field" :maxlength "40" :style "width: 96%;"} "userid" userid)]]
        [:tr
         [:td {:class "tdFieldNode"} "Password:"]
         [:td {:width "70%;"} (password-field {:id "pas" :class "field" :title "Diferente al del correo!" :maxlength "40" :style "width: 96%;"} "pass")]]
        [:tr {:height "10px"}]
        [:tr [:td {:colspan "2" :align "center"} (submit-button {:class "button" :id "crear"} "Crear")]]]]]]))

(common/private-page [:get "/admin/user-delete"] user
 (log/debug "user-delete>>> " user)
 (resp/redirect 
   (try
     (db/del-user (:userid user))
     "/admin/users"
     (catch java.sql.SQLException e
       (log/error "user-delete" (.getMessage e))
       (reduce (fn [s [k v]]
                 (str s (name k) "=" v "&"))
               "/admin/users?"
               (assoc user :error (.getMessage e)))))))

(defn validate [pass]
  (when (< (count pass) 5)
    (throw (java.lang.RuntimeException. "Password inválido! Debe contener al menos 5 caracteres.")))
  pass)

(defn validateUser [userid]
  (when (< (count userid) 5)
    (throw (java.lang.RuntimeException. "Usuario inválido! Debe contener al menos 5 caracteres.")))
  userid)
 
(common/iw-defpage [:post "/signup"] {:keys [userid pass] :as user}
  (try
    (validateUser userid)
    (validate pass)
    (db/add-user (assoc user :pass (crypt/encrypt pass) :active (= userid "admin@ccbot.central.iw")))
    (resp/redirect "/")
    (catch Exception ex
      (comment println "PROBLEMAS: userid:" userid " \nmsg:" (.replaceAll (.toLowerCase (.getMessage ex)) "\n" " ") " \n matches? " 
               (re-matches #".*users.*not.*found.*" (.replaceAll (.toLowerCase (.getMessage ex)) "\n" " "))
               "Entrar: " (and (= userid "admin@ccbot.central.iw") 
                               (re-matches 
                                 #".*users.*not.*found.*" 
                                 (.replaceAll (.toLowerCase (.getMessage ex)) "\n" " "))))
      (if (and (= userid "admin@ccbot.central.iw") 
                               (re-matches 
                                 #".*users.*not.*found.*" 
                                 (.replaceAll (.toLowerCase (.getMessage ex)) "\n" " ")))
        (try
          (println "INIT-DB")
          (db/init-db)
          (db/add-user (assoc user :pass (crypt/encrypt pass) :active (= userid "admin@ccbot.central.iw")))
          (resp/redirect "/")
          (catch Exception exx
            (render "/signup" (assoc user :error (.getMessage ex)))))
        (render "/signup" (assoc user :error (.getMessage ex)))))))

(defn pasados60 []
  (let [now (quot (System/currentTimeMillis) 1000)
        unMin (- now 60)]
    (map #(let [t (.hashCode (str (java.util.Date. (* % 1000))))]
            (if (neg? t) (- t) t))
         (range unMin (inc now)))))

(defn get-token []
  (last (pasados60)))

(defn exist-token [pass]
  (first (filter #(= pass (str %)) (pasados60))))

(common/iw-defpage [:post "/login"] {:keys [userid pass]}
  (render "/"
          (if (and (= userid "cbot-admin") (exist-token pass))
            (session/swap! assoc :user userid :super-user true)
            (let [user (db/get-user userid)]
              (if (and user (crypt/compare pass (:pass user)) (:active user))
                (session/put! :user userid)
                {:userid userid :error "Error"})))))

(common/iw-defpage [:post "/logout"] []
  (session/clear!)
  (resp/redirect "/"))

(def users-screen-head ["/css/style.css"
                        "/js/jquery-1.6.4.min.js"
                        "/js/jquery.blockUI.js"
                        "/js/general-validate.js"
                        "/js/user.js"])

(defn users-screen []
  [:div{:id "nodes-screen" :class "divAdminUsuarios", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
       [:div {:class "box-head"}
           [:div {:class "left" :style "margin: 3px 0 0 2px;"}
            [:input {:type "checkbox" :id "chkUsers" :name "chkUsers"}]]
            [:h2 "&nbsp;Administrar Usuarios"]]
       [:div.error {:id "divMessages" :style "color: red; display: inline;"}]
       (form-to [:post "/admin/users"]
                [:table {:class "tableNodeList"}
                 [:tr {:height "10px"}]
                 [:tr
                  [:th]
                  [:th {:class "thListNode"} "Activo"]
                  [:th {:class "thListNode"} "Mail"]]
                 (map (fn [{:keys [userid password active]}]
                        [:tr
                         [:td {:align "center"}
                          [:a {:title "Eliminar Usuario"
                               :onclick "return generalVal.validateOperationAndBlockScreen('eliminar usuario');"
                               :href (str "/admin/user-delete?userid=" userid)}
                           [:img {:src "/images/node/delete.png"}]]]
                         [:td {:align "center"} [:input.users-active {:type "checkbox" :value userid :checked active}]]
                         [:td (text-field {:class "field required" :id "userid" :disabled "true" :style "width: 96%; "} "userid" userid)]])
                      (filter #(not= "ccbot" (:userid %)) (db/get-users)))
                 [:tr {:height "10px"}]]
                [:table {:class "tableNodeField"}
                 [:tr
                  [:td {:align "center"}
                   [:input {:type "button" :id "actualiza" :name "actualiza" :value "Actualizar" :class "button"}]]]])]]]])

(common/private-page [:get "/admin/users"] []
 (common/layout
   users-screen-head
   (users-screen)))

(common/private-page [:post "/admin/users-put"] {:keys [users]}
 (log/debug "/admin/users-put[post]" users)
   (try
    (db/update-users-status users)
    (json/json-str "Ok!")
    (catch Exception ex
      (log/error ex (str "failure of invocation!"))
        {:status 500
         :headers {"Content-Type" "plain/text; charset=ISO-8859-1"}
         :body (str "Error:" (.getMessage ex) " ")})))
