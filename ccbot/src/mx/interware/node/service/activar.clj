(ns mx.interware.node.service.activar
  (:use
    [mx.interware.cbot.web.views.common :as common]
    [noir.content.getting-started]
    [noir.core :only [defpartial defpage]]
    [hiccup.page :only [include-css include-js html5]])
  (:require
    [clojure.tools.logging :as log]
    [mx.interware.cbot.core :as core]
    [clojure.data.json :as json]
    [mx.interware.node.db.instdb :as instdb]
    [noir.response :as resp]))

(common/private-page [:get "/service/activar"] activar
  (log/debug activar)
  ;(println (json/json-str {:instancias (instdb/get-instancia (:appl activar))}))
  ;(json/json-str {:instancias (instdb/get-instancia (:appl activar))})
  (let [{factory :cbot-factory} (core/get-app-manager (keyword (:appl activar)))
        inst-ks (into [] (factory nil))]
    (json/json-str inst-ks)))