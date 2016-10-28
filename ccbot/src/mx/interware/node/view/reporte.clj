(ns mx.interware.node.view.reporte
  (:use [noir.core]
        hiccup.core hiccup.form)
  (:require [clojure.tools.logging :as log]
            [mx.interware.cbot.web.views.common :as common]
            [mx.interware.node.db.reportedb :as reportedb]
            [noir.session :as session]
            [noir.response :as resp]
            [hiccup.element :as helem]))

(def reporte-screen-head ["/css/style.css"
                          "/css/jquery-ui-1.8.16.custom.css"
                          "/js/jquery-1.6.4.min.js"
                          "/js/jquery.validate.min.js"
                          "/js/jquery-ui-1.8.16.custom.min.js"
                          "/js/general-validate.js"
                          "/js/reporte.js"])

(defn reporte-screen [rep]
  (log/debug rep)
  [:div {:id "reporte-screen" :class "divReporte", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Reporte de Ejecución"]
       [:div {:class "right"}]]
      [:div#div-reporte
       [:div {:id "divMessages" :style "color: red; display: inline;"}
        (if (rep :error) [:p (rep :error)])]
       [:form#appForm {:action "/admin/reporte-get" :method :get}
        [:table {:class "tableNodeField"}
         [:tr {:height "10px"}]
         [:tr 
          [:td {:class "tdFieldNode"} "Fecha Inicio:"]
          [:td [:input {:type "text" :maxlength "10" :id "fechaInicio" :name "fechaInicio" :readonly "true" :class "field"}]]]
         [:tr 
          [:td {:class "tdFieldNode"} "Fecha T&eacute;rmino:"]
          [:td [:input {:type "text" :maxlength "10" :id "fechaTermino" :name "fechaTermino" :readonly "true" :disabled "true" :class "field"}]]]
         [:tr {:height "10px"}]
         [:tr
          [:td {:colspan "2" :align "center"} (submit-button {:name "opReporte" :id "opReporte" :class "button"} "Consultar")]]]]
        ]]]]])

(common/private-page [:get "/admin/reporte"] rep
 (common/layout
   reporte-screen-head
   (reporte-screen rep)))


(common/private-page [:get "/admin/reporte-get"] {:keys [fechaInicio fechaTermino] :as rep}
  (try
    (let [sdf (java.text.SimpleDateFormat. "dd/MM/yyyy")
          sdf2 (java.text.SimpleDateFormat. "HH:mm:ss.SSS")
          inicio (java.sql.Timestamp. (.getTime (.parse sdf fechaInicio (java.text.ParsePosition. 0))))
          termino (java.sql.Timestamp. (.getTime (.parse sdf fechaTermino (java.text.ParsePosition. 0))))
          vec-map (reportedb/get-csv-reporte inicio termino)
          stringfy (fn [k m] (str "\"" (-> (k m) str (.replaceAll "\n|\r|\t" " ")) "\"")) 
          reporte (reduce (fn [buffer map]
                            (reduce (fn [buffer func]
                                      (doto buffer (.append (func map)) (.append ",")))
                                    buffer
                                    [(partial stringfy :ip)
                                     (partial stringfy :shortn)
                                     (partial stringfy :appl)
                                     (partial stringfy :inst)
                                     (partial stringfy :state)
                                     :ejecucion
                                     #(.format sdf (:inicio %))
                                     #(.format sdf2 (:inicio %))
                                     :delta 
                                     :codigo 
                                     (partial stringfy :mensaje)
                                     #(.format sdf (:recibido %))
                                     #(.format sdf2 (:recibido %))])
                            (.append buffer "\n"))
                          (java.lang.StringBuilder. "Nodo,CR,Aplicación,Instancia,Estado,Número-Ejecución,Fecha-Inicio,Hora-Inicio,Tiempo-Ejecución(Milisegundos),Código,Mensaje,Fecha-Recibido,Hora-Recibido\n")
                          vec-map)
          ]
      (resp/content-type "text/csv" (java.io.ByteArrayInputStream. (.getBytes (.toString reporte)))))  
    (catch Exception e
      (log/error e "problems at /admin/get-reporte")
      (resp/redirect (reduce (fn [result [k v]]
                               (str result k "=" v "&")) 
                             "/admin/reporte?" 
                             (assoc rep "error" (.getMessage e)))))))

(defn reporte-har [rep]
  (log/debug rep)
  [:div {:id "reporte-screen" :class "divReporte", :style "display: true;"}
   [:div {:height "100%" :width "100%"}
    [:div {:height "100%" :width "100%"}
     [:div {:class "box"}
      [:div {:class "box-head"}
       [:h2 {:class "left"} "Reporte de Datos de Archivos HAR"]
       [:div {:class "right"}]]
      [:div#div-reporte
       [:div {:id "divMessages" :style "color: red; display: inline;"}
        (if (rep :error) [:p (rep :error)])]
       [:form#appForm {:action "/admin/reporte-har" :method :get}
        [:table {:class "tableNodeField"}
         [:tr {:height "10px"}]
         [:tr 
          [:td {:class "tdFieldNode"} "Fecha Inicio:"]
          [:td [:input {:type "text" :maxlength "10" :id "fechaInicio" :name "fechaInicio" :readonly "true" :class "field"}]]]
         [:tr 
          [:td {:class "tdFieldNode"} "Fecha T&eacute;rmino:"]
          [:td [:input {:type "text" :maxlength "10" :id "fechaTermino" :name "fechaTermino" :readonly "true" :disabled "true" :class "field"}]]]
         [:tr {:height "10px"}]
         [:tr
          [:td {:colspan "2" :align "center"} (submit-button {:name "opReporte" :id "opReporte" :class "button"} "Consultar")]]]]
        ]]]]])

(common/private-page [:get "/admin/reporte-hars"] rep
 (common/layout
   reporte-screen-head
   (reporte-har rep)))


(common/private-page [:get "/admin/reporte-har"] {:keys [fechaInicio fechaTermino] :as rep}
  (try
    (let [sdf (java.text.SimpleDateFormat. "dd/MM/yyyy")
          sdf2 (java.text.SimpleDateFormat. "HH:mm:ss.SSS")
          inicio (java.sql.Timestamp. (.getTime (.parse sdf fechaInicio (java.text.ParsePosition. 0))))
          termino (java.sql.Timestamp. (.getTime (.parse sdf fechaTermino (java.text.ParsePosition. 0))))
          vec-map (reportedb/get-har-reporte inicio termino)
          stringfy (fn [k m] (str "\"" (-> (k m) str (.replaceAll "\n|\r|\t" " ")) "\"")) 
          reporte (reduce (fn [buffer map]
                            (reduce (fn [buffer func]
                                      (doto buffer (.append (func map)) (.append ",")))
                                    buffer
                                    [(partial stringfy :nombre_estado)
                                      #(.format sdf (:inicio %))
                                      #(.format sdf2 (:inicio %))
                                     :tiempo_carga
                                     :carga_contenido
                                     (partial stringfy :url)
                                     :status
                                     (partial stringfy :tipo_contenido)
                                     :tiempo_total
                                     :tiempo_espera
                                     :tiempo_bloqueo
                                     :tiempo_dns
                                     :tiempo_recepcion
                                     :tiempo_conexion
                                     :tamanyo
                                     :tiempo_envio])
                            (.append buffer "\n"))
                          (java.lang.StringBuilder. "Nombre Estado, Fecha Inicio, Hora Inicio, Tiempo carga,Carga contenido,url,status, Tipo contenido, Tiempo total, Tiempo espera, Tiempo bloqueo, Tiempo dns, Tiempo recepcion, Tiempo conexion, Tamaño, Tiempo envio\n")
                          vec-map)
          ]
      (resp/content-type "text/csv" (java.io.ByteArrayInputStream. (.getBytes (.toString reporte)))))  
    (catch Exception e
      (log/error e "problems at /admin/reporte-har")
      (resp/redirect (reduce (fn [result [k v]]
                               (str result k "=" v "&")) 
                             "/admin/reporte-hars?" 
                             (assoc rep (str "error " fechaInicio) (.getMessage e) ))))))
