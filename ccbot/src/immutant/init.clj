(ns immutant.init
  (:use ;[mx.interware.cbot.web.server]
        [noir.core :only [defpartial]]
        hiccup.element 
        hiccup.form
        [hiccup.page :only [include-css include-js html5]])
  (:require [immutant.messaging :as messaging]
            [immutant.web :as web]
            [immutant.util :as util]
            [immutant.web.session :as immutant-session]
            [noir.server :as server]
            [noir.statuses :as status]
            [clojure.tools.logging :as log]
            [mx.interware.cbot.globals :as CG]
            [mx.interware.util.basic :as basic]
            [mx.interware.cbot.store :as store]
            [mx.interware.cbot.web.views.common :as common]
            [mx.interware.cbot.web.views.services :as services]
            [mx.interware.cbot.web.views.cbothtml :as cbothtml]
            [mx.interware.cbot.web.model.db :as db]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.web.views.users :as user]
            [noir.util.crypt :as crypt]
            [ring.middleware.file :as file]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.shell :as shell]
            [mx.interware.cbot.core :as core]
            ))

(do
  (println "loading " *ns*)
  (println "cargando immutant.init")
  )

;(use 'mx.interware.cbot.web.server)

;; This file will be loaded when the application is deployed to Immutant, and
;; can be used to start services your app needs. Examples:

;; To start a Noir app:
(defn init-immutant [& m]
  (let [params (reduce (fn [p [k v]]
                         (assoc p (keyword k) v))
                       {}
                       (partition 2 m))
        port (:-port params "8050")
        host-address (-> (java.net.InetAddress/getLocalHost) (.getHostAddress))
        ip-central (:-central params "10.3.3.199")]
    (log/debug "ip-central:" ip-central " host-address:" host-address " " (if (:-token params) (dame-token) ""))
    (reset! CG/is-central? (= ip-central host-address))
    (log/debug "main params:" params )
    (reset! opr/PORT port)
    (log/debug "Server Port set to:" (opr/getServerPort))
    (basic/config-log4j)
    (store/boot-store)
    (when (= "true" (:-createdb params "false"))
      (log/debug "Creando base de datos H2")
      (db/init-db))
    (server/add-middleware (partial extract-host-ip ip-central)) ; casa: "10.3.3.199", valle : "192.168.1.6"
    
    ;(server/load-views 
    ;  (util/app-relative "src/mx/interware/cbot/web/views")
      ;(util/app-relative "src/mx/interware/node/view")
      ;(util/app-relative "src/mx/interware/node/service")
      ;(util/app-relative "src/mx/interware/cbot/selenium")
    ;  )

    (comment server/load-views-ns 'mx.interware.cbot.web.views
                          'mx.interware.node.view
                          'mx.interware.node.service)
  
    (status/set-page! 404 "Página no encontrada!")
    (web/start 
      "/" 
      (server/gen-handler {:mode :dev 
                           :ns 'mx.interware.cbot.web
                           :session-store (immutant-session/servlet-store)
                           }) 
      :reload true)))

(let [addr (java.net.InetAddress/getLocalHost)
      ip (. addr getHostAddress)]
  (println "Setting central ip to:" ip)
  (init-immutant "-central" ip))

(comment ns immutant.init
  ;(:use ccbot3.core)
  
  ;(:require [immutant.messaging :as messaging]
  ;          [immutant.web :as web]
  ;          [immutant.util :as util])
  )

;; This file will be loaded when the application is deployed to Immutant, and
;; can be used to start services your app needs. Examples:


;; Web endpoints need a context-path and ring handler function. The context
;; path given here is a sub-path to the global context-path for the app
;; if any.

; (web/start "/" my-ring-handler)
; (web/start "/foo" a-different-ring-handler)

;; To start a Noir app:
; (server/load-views (util/app-relative "src//views"))
; (web/start "/" (server/gen-handler {:mode :dev :ns 'ccbot3}))


;; Messaging allows for starting (and stopping) destinations (queues & topics)
;; and listening for messages on a destination.

; (messaging/start "/queue/a-queue")
; (messaging/listen "/queue/a-queue" #(println "received: " %))
