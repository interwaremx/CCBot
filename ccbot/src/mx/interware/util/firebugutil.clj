(ns mx.interware.util.firebugutil
  (:require [clojure.data.json :as json]))

(def file (java.io.File. "/tmp/HARS/maps.google.com+2014-01-09+18-42-29.har"))

(defn readit []
  (let [data (slurp file)]
    (json/read-json data)))

