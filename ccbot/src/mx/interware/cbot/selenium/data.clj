(ns mx.interware.cbot.selenium.data
  (:require 
    [clojure.pprint :as pp]
    [clojure.tools.logging :as log]))

;;seleniums info es un mapa con dos llaves, :last-modified asociado a un log con el lastModified del archivo
;; y :seleniums asociado al mapa de selenums que está en el archivo seleniums.clj
(def seleniums-info (atom nil))
(def seleniums-file (java.io.File. "resources/seleniums.clj"))

;; NOTA IMPORTANTE, ESTE ARCHIVO DEBE ESTAR EN UTF-8 PARA QUE LOS ACENTOS FUNCIONEN!!!!!
;(def info (read-string (slurp "resources/seleniums.clj" :encoding "UTF-8")))

(defn info [k]
  (comment when @seleniums-info
    (println (.lastModified seleniums-file) (@seleniums-info :last-modified) (- (.lastModified seleniums-file) (@seleniums-info :last-modified))))
  (when (or (not @seleniums-info) (and (> (.lastModified seleniums-file) (@seleniums-info :last-modified)) 
                                       (> (- (System/currentTimeMillis) (@seleniums-info :last-modified)) 60000)))
    (log/info "Loading seleniums from " (.getAbsolutePath seleniums-file))
    (reset! seleniums-info {:last-modified (.lastModified seleniums-file)
                            :seleniums (read-string (slurp seleniums-file :encoding "UTF-8"))})
    (pp/pprint (@seleniums-info :seleniums)))
  (-> @seleniums-info :seleniums k))

