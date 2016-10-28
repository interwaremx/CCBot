(ns mx.interware.cbot.util
  (:import 
    (java.net URL URLConnection) 
    (java.io PrintWriter OutputStreamWriter OutputStream 
             InputStream BufferedReader InputStreamReader
             File FileWriter)
    (java.util.concurrent Future TimeUnit TimeoutException ExecutionException))
  (:require [clojure.java.io :as io]
            [clojure.tools.logging :as log]))

(do
  (println "loading " *ns*)) 

(defmacro warn-exception [fnk e & args]
  `(do
     (log/warn [~fnk (if-let [cause# (.getCause ~e)] 
                     (str (type cause#)) 
                     (str (type ~e))) (.getMessage ~e) ~@args])
     (if (log/enabled? :info)
       (.printStackTrace ~e)))
  )

(defmacro warn-exception-and-throw [fnk e & args]
  `(do
     (warn-exception ~fnk ~e ~@args)
     (throw ~e)))

(defmacro debug-info [fnk & args]
  `(log/debug [~fnk ~@args]))

(defmacro log-info [level fnk & args]
  `(log/log ~level [~fnk ~@args]))

(defn str-trunc2len [p max]
  (let [s (str p)
        l (count s)]
    (if (< l max) s (str (subs s 0 max) "..."))))

(defn contextualize [param context]
  (if (keyword? param)
    (context param param)
    param))

(defn contextualize-int [param context]
  (log/debug "contextualize-int " param " " (class param) " " context " " (class context))
  (let [val (str (contextualize param context))]
    (try
      (Integer/parseInt val)
      (catch NumberFormatException nfe
        0))))

(defn token2key [token]
  (if (= \: (first token))
    (keyword (subs token 1))
    token))

(defn convert-text2seq-of-tokens [text]
  (.split (str text) " "))

(defn convert-text2seq-of-tokens-filtering [text]
  (filter #(> (count (.trim %)) 0) (convert-text2seq-of-tokens text)))

(defn convert-seq-of-tokens2seq-of-tokens-or-keywords [tokens]
  (map #(token2key %) tokens))

(defn contextualize-seq-of-tokens [tokens context]
  (map #(contextualize % context) tokens))

(defn concat-tokens [tokens]
  (reduce #(str %1 " " %2) tokens))

(defn contextualize-text [text context]
  (let [r (concat-tokens
          (contextualize-seq-of-tokens
            (convert-seq-of-tokens2seq-of-tokens-or-keywords
              (convert-text2seq-of-tokens text))
            context))]
    (str r)))

(defn wrap-with-timeout
  {:doc "Create a function with a maximum execution time, else throws TimoutExcetion"}
  [op & millis]
  (if-let [mls (first millis)]
    (fn [context]
      (try
        (let [env (get-thread-bindings)
              env-op #(with-bindings* env op context)
              fut (future-call env-op)
              waitMillis (contextualize-int mls context)]
          (let [result (.get fut waitMillis TimeUnit/MILLISECONDS)]
            (if (isa? (type result) ExecutionException)
              (throw (.getCause result))
              result)))
        (catch TimeoutException e
          (let [name (.toString op)
                arb (.lastIndexOf name "@")
                info-str (if (neg? arb) name (subs name 0 arb))
                exception (TimeoutException. (str "Timeout@" info-str "["  mls "]ms"))]
            (warn-exception :wrap-with-timeout exception name)
            (throw exception)))))
    op))

(defn try-times-opr
  [oprf n delay]
  (fn [context]
    (let [delta-delay (contextualize-int delay context)
          max-retry (contextualize-int n context)]
      (if (> max-retry 0)
        (loop [m (dec max-retry)]
          (debug-info :try-time-opr :retry (- max-retry m) :max max-retry :retry-delay delta-delay)
          (let [result (try
                         (oprf context)
                         (catch Exception e
                           (warn-exception :try-times-opr e :retry (- max-retry m) :max max-retry)
                           (when (zero? m) (throw e))
                           (when (> delta-delay 0) (Thread/sleep delta-delay))
                           ::fail))]
            (if-not (= result ::fail)
              result
              (recur (dec m)))))
        (oprf context)))))

(defn wrap-with-catch-to-string
  {:doc "Evita que la funcion mande una excepcion convirtiendola a string"}
  [op]
  (fn [context]
    (try
      (op context)
      (catch Exception e
        (if-not (log/enabled? :info)
          (warn-exception :wrap-with-catch-to-string e (str op))
          (warn-exception :wrap-with-catch-to-string e (str op) context))
        (str (type e) ":" (.getMessage e))))))

(defn wrap-with-delay
  {:doc "Esta funcion crea una funcion que espara 'delay' ms antes de ejecutar la funcion 'f', f debe se una funcion que recibe un mapa y regresa un mapa ideal para ser enviada a un 'agent' cbot"}
  [oprf delay]
  (fn [context]
    (if (> delay 0)
      (Thread/sleep delay))
    (oprf context)))

(defmacro wwd 
  {:doc "Este macro crea una funcion que envuelve la invocacion de otra de cualquier numero de parametros despues de hacer un delay"}
  [delay fun]
  `(fn [& param#]
     (if (> ~delay 0)
       (Thread/sleep ~delay))
     (apply ~fun param#)))

(comment "destructuring")
(defn g [& {a :a b :b c :c}]
     (println a b c)
     "")


