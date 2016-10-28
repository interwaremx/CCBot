(ns mx.interware.cbot.selenium.factory
  (:use 
    [hiccup.page :only [html5 html4 xhtml]])
  (:require 
    [mx.interware.cbot.selenium.data :as data]
    [mx.interware.cbot.web.views.common :as common]))
(defn create-tc [{:keys [url title cmds]}]
  (xhtml 
   [:head   
    [:meta {:http-equiv "Content-Type" :content "text/html; charset=UTF-8"} ""]
    [:link {:rel "selenium.base" :href url} ""]
    [:title title]]
   [:body
    [:table {:cellpadding "1" :cellspacing "1" :border "1"}
     [:thead
      [:tr
       [:td {:rowspan "1" :colspan "3"} title]]]
     (reduce 
       (fn [rows {:keys [cmd p1 p2]}]
         (conj rows [:tr [:td (name cmd)] [:td (when p1 p1)] [:td (when p2 p2)]]))
       [:tbody]
       cmds)]]))

(common/iw-defpage "/selenium-data/:TC" {:keys [TC]}
  (let [r (create-tc (data/info (keyword TC)))]
    r))
