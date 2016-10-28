(ns mx.interware.cljs.cbot
  (:require-macros [hiccups.core :as hiccups])
  (:require  
    [cljs.reader :as reader]
    [jayq.core :as jq]
    [jayq.util :as jqu]
    [hiccups.runtime :as hiccupsrt]
    ))

(def testv (atom nil))

(defn test [e]
  (js/alert "Le picaste al save!"))

;(jq/document-ready
(.ready (jq/$ js/document)
  (fn []
    ;(.click (jq/$ "#save-states") test)
    (js/alert "ClojureScript running!")
    ))
