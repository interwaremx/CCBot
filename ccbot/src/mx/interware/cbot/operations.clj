(ns mx.interware.cbot.operations
  (:import 
    (java.net URL URLConnection Socket) 
    (java.io PrintWriter OutputStreamWriter OutputStream 
             InputStream BufferedReader InputStreamReader
             File FileWriter)
    (java.util.concurrent Future TimeUnit TimeoutException ExecutionException))
  (:require [clojure.java.io :as io]
            [clojure.pprint :as pp]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]
            [clojure.java.shell :as shell]
            [clojure.java.jdbc :as sql]
            [clojure.xml :as xml]
            [clojure.zip :as zip]
            [clj-webdriver.taxi :as t]
            [clj-http.client :as http]
            [mx.interware.cbot.globals :as CG]
            [mx.interware.cbot.util :as util]
            [mx.interware.util.taxiutil :as tutil]
            [mx.interware.util.basic :as basic]
            [mx.interware.node.service.estadistica :as stats]))

(do
  (println "loading " *ns*)
  )


(def operations ["fb-har-opr"
                 "send-stats-opr"
                 "browser-tc-opr"
                 "clojure-opr"
                 "date-time-opr"
                 "get-http-opr"
                 "get-mail-opr"
                 "human-opr"
                 "js-opr"
                 "log-opr"
                 "no-opr"
                 "os-cmd-opr"
                 "play-sound-opr"
                 "post-http-opr"
                 "print-context-opr"
                 "print-msg-opr"
                 "send-mail-opr"
                 "sleep-opr"
                 "socket-opr"
                 "sql-read-opr"
                 "switch-bad-opr"
                 "switch-good-opr"])

(defn send-stats-opr
  {:doc "Crea una operacion para envío de estadísticas de las operaciones a la central"}
  [conf]
  (fn [context]
    (log/debug "send-stats-opr.Conf: " conf "\n send-stats-opr.Context: " context " ")
    (log/warn (pr-str @CG/intern-main-params))
    (let [stats-rows2send (util/contextualize-int (:stats-rows2send conf "100") context)
          {:keys [ids-sent ids-received]} (stats/post2central (CG/central-url-base) (CG/get-url-node) (CG/get-public-str) (CG/get-port-node) stats-rows2send)]
      (log/info "send-stats-opr. Central generated ids:" ids-received)
      ;Se evalúa si la respuesta es correcta para actualizar los registros de estadística enviados.
      (when (= java.lang.Long (class ids-received))
        (stats/update-sent-stats ids-sent))
      
      ;Se eliminan los registros antiguos (de días atrás).
      (stats/clear-sent-stats (util/contextualize-int (:stats-days4clear conf "7") context))
      {:result ids-received})))

(defn sleep-opr
  {:doc "Crea una oparacion para hacer que la maquina de estados se detenga por un tiempo"
   :long-running false}
  [conf]
  (fn [context]
    (log/debug "sleep-opr " conf " " context " " (util/contextualize-int (:delta conf) context))
    (Thread/sleep (util/contextualize-int (:delta conf) context))
    {:result "sleep-opr"}))

(defn date-time-opr
  {:doc "Crea una operacion que formatea la fecha/hora actual con un formato especificado"}
  [conf]
  (fn [context]
    (let [formatter (java.text.SimpleDateFormat. (util/contextualize (:format conf) context))]
      {:result (.format formatter (java.util.Date.))})))
(defn print-msg-opr
  {:doc "Operacion para mandar un mensaje al sysout marcado con la hora en millis"
   :long-running false}
  [conf]
  (fn [context]
    {:result (util/contextualize (:msg conf) context)}))
(defn get-http-opr-old
  {:doc "Operacion para hacer que la maquina de estados obtenga el contenido de una URL por http"
   :long-running false}
  [conf]
  (fn [context]
    (let [con (. (java.net.URL. (util/contextualize (:url conf) context)) openConnection)]
    (with-open [rdr (BufferedReader. (InputStreamReader. (. con getInputStream)))]
      {:result (apply str (line-seq rdr))}))))

(defn get-http-opr
  {:doc "Operacion para hacer que la maquina de estados obtenga el contenido de una URL por http"
   :long-running false}
  [conf]
  (fn [context]
    {:result (slurp (util/contextualize (:url conf) context))}))

(defn- create-http-params [mlStr context]
  (reduce #(str %1 "&" %2) (map (fn [lin]
                    (let [[k v] (.split lin "=")
                          k (.trim k)
                          v (util/contextualize-text (.trim v) context)]
                      (str k "=" v))) (.split mlStr "\n"))))
(defn post-http-opr
  {:doc "Operacion para hacer que la maquina de estados obtenga el contenido de una URL por http"
   :long-running false}
  [conf]
  (fn [context]
    (let [url (java.net.URL. (util/contextualize (:url conf) context))
          con (doto
                (.openConnection url)
                (.setDoOutput true))]
      (with-open [out (PrintWriter. (OutputStreamWriter. (.getOutputStream con)))]
        (.print out (create-http-params (:params conf) context))
        (.flush out)) 
      (with-open [rdr (BufferedReader. (InputStreamReader. (.getInputStream con)))]
        {:result (apply str (line-seq rdr))}))))

(defn print-context-opr
  {:doc "Operacion que imprime el mapa con los resultados de los estados de la maquina"
   :long-running false}
  [conf]
  (fn [context]
    (log/debug "entrando:[" conf "]," context)
    (let [re-str (or (:filter-re conf) ".*")]
      (log/info 
        (str "contexto filtrado con:" re-str "\n"
             (into
               (sorted-map)
               (map #(vector (first %) (util/str-trunc2len (second %) 500))
                    (filter 
                      #(re-matches
                         (re-pattern (util/contextualize re-str context))
                         (name (% 0))) 
                      context)))))
      {:result (str "print-context-opr with:" re-str)})))
(defn log-opr
  {:doc "Operacion para mandar a log un mensaje con el nivel configurado en el param ':level'"
   :long-running false}
  ;; level es un keyword :debug,:warn,etc, state es un keyword de un
  ;; estado que se desea mandar al log
  [conf]
  (fn [context]
    (let [msg (util/contextualize-text (:text conf) context)]
    (log/log (:level conf) msg) ;; ojo level no se contextualiza!!
    {:result (str (:level conf) ":" msg)})))

(defn- complete-mail-params [{text :text-vec subject :subject to :to-vec passwd :passwd :as param} context]
  (assoc param
    ;text es un vector de keywords a sacar del contexto!
    :text (apply str "" (map #(str (util/contextualize-text % context) "\n") (into [] (.split (str text) "[\n]+"))))
    :to (into [] (.split (util/contextualize to context) "[\n\t ,]+"))
    :password passwd
    :subject (util/contextualize-text subject context)))

(defn send-mail-opr
  {:doc "Operación para mandar mail"
   :long-running false}
  [conf]
  (fn [context]
    (log/debug "Executing send-mail-opr \n" conf "\n" context)
    (let [result (basic/mail-it (complete-mail-params conf context))]
      {:result result})))
(defn human-opr
  {:doc "Operacion que permite la intervencion de un humano que deberá rearrancar la máquina de estados"
   :long-running true}
  [ & _]
  (fn [context]
    {:result "human-opr"}))

(def db {:classname "org.h2.Driver"
         :subprotocol "h2"
         :subname "/tmp/clojure.contrib.sql.test.db"
         :create true})
(defn sql-read-opr
  [conf]
  (fn [context]
    (sql/with-db-connection
      [con (:db conf)]
      (let [result (sql/query
                     con
                     [(util/contextualize (:query conf) context)])]
        {:result (pr-str result)}))))
(defn socket-opr
  [conf]
  (fn [context]
    (try
      (with-open [socket (Socket. (util/contextualize (:host conf) context)
                                (util/contextualize-int (:port conf) context))])
      {:result "socket-opr"}
      (catch java.net.ConnectException ce
        (log/info (str (.getName (class ce)) ":" (.getMessage ce)))
        (throw ce)))))

(defn- contextualize-subject-set [subject-vec context]
  (into #{} (doseq [subject subject-vec] (util/contextualize-text subject context))))

(defmacro ctx-all
  ([fn p1 p2 k1]
     `[(~fn (~k1 ~p1) ~p2)])
  ([fn p1 p2 k1 & ks]
     `[(ctx-all ~fn ~p1 ~p2 ~k1)
       (ctx-all ~fn ~p1 ~p2 ~(first ks) ~@(rest ks))]))
(defn get-mail-opr
  [conf]
  (fn [context]
    (let [[host port protocol email password]
          (flatten (ctx-all util/contextualize conf context
                            :host :port :protocol :email :password))]
      {:result (:subject 
                 (basic/get-mail-with-subject-matching
                   {:host host :port port :protocol protocol :email email :password password 
                    :subject-re (util/contextualize (:subject-re conf) context)}))})))

(defn str->fn [code]
  (log/info (str "creating fn for:" code))
  (let [func (load-string (if (nil? code) 
                            "(fn [ctx] \"undefined clojure code!\")" 
                            (str code)))
        func (eval func)]
    func))

(def mem-str->fn (memoize str->fn))

(defn clojure-opr
  [conf]
  (let [code (:code conf)
        func (str->fn code)]
    (fn [context]
      (log/debug "Entrando a clojure-opr, code: " (:code conf))
      (log/debug "Entrando a clojure-opr, context: " context)
      (let [result (func context)]
        (if (map? result)
          (if-not (:result result)
            (assoc result :result (str "keyword :result is missing in this map " result " clojure-opr is WRONG!"))
            result)
          {:result (str result)})))))

(defn js-opr
  [conf]
  (let [ctx (org.mozilla.javascript.Context/enter)
        scope (.initStandardObjects ctx nil)
        code (:code conf)
        func (.compileFunction ctx scope 
               (if (nil? code) 
                 "function(ctx) {return \"undefined javascript code!\";}" 
                 code) 
               "src" 1 nil)]
    (org.mozilla.javascript.Context/exit)
    (fn [context]
      (try
        (let [ctx (org.mozilla.javascript.Context/enter)
              context-str (json/json-str context)
              jsonp (org.mozilla.javascript.json.JsonParser. ctx scope)
              jscontext (.parseValue jsonp context-str)
              jscontext-arr (to-array [jscontext])
              result (.call func ctx scope scope jscontext-arr)]
          (cond
           (string? result) {:result result}
           (= (class result) org.mozilla.javascript.NativeObject)
           (let [cresult (into {} (map (fn [k] [(keyword k) (.get result k)]) (.keySet result)))]
             (if (:result cresult)
               cresult
               (str "keyword :result is missing in this map " cresult " js-opr is WRONG!")))
           :otherwise {:result (str result)}))
        (finally (org.mozilla.javascript.Context/exit)))))) 

(defn switch-good-opr [conf]
  (fn [context]
    (let [instance-status (:instance-status_ context)]
      (cond (= :good instance-status) {:result "skip"}
            :otherwise {:instance-status_ :good :result "send"}))))
(defn switch-bad-opr [conf]
  (fn [context]
    (let [instance-status (:instance-status_ context)]
      (cond (= :bad instance-status) (let [now (System/currentTimeMillis)
                                           last (:bad-timestamp_ context)
                                           delta (- now last)
                                           wait (* 60000 (util/contextualize-int (:minutes2wait conf) context))]
                                       (if (> delta wait)
                                         {:result "send"
                                          :bad-timestamp_ now}
                                         {:result "skip"}))
            :otherwise {:instance-status_ :bad
                        :result "send"
                        :bad-timestamp_ (System/currentTimeMillis)}))))

(defn play-sound-opr [conf]
  (fn [context]
    (basic/play-sound (util/contextualize (:path conf) context))
    {:result "play-sound-opr"}))

(defn os-cmd-opr [conf]
  (fn [context]
    {:result (:out (apply shell/sh (seq (.split (util/contextualize-text (:shell conf) context) " "))))}))

;; este mapa almacena el cache asociado a los uri's usados por el browser-tc-opr

;; TODO ojo la llave debe tener appl,inst,uri para poder eliminarlo cuando se apague la instancia !!

(def browser-tc-cache (atom {})) 

(defn clear-browser-tc-cache [appk instk]
  (dorun 
    (map #(swap! browser-tc-cache dissoc %) 
         (filter 
           (fn [[app inst uri]] 
             (and (= app appk) (= inst instk))) 
           (keys @browser-tc-cache)))))

(defn get-clj-cmd-list [cache [app inst uri :as app-inst-uri-arr]]
  (when (and (not cache) (@browser-tc-cache app-inst-uri-arr))
    (swap! browser-tc-cache dissoc app-inst-uri-arr))
  (let [cmd-list (or (and cache (@browser-tc-cache app-inst-uri-arr))
                     (tutil/read-selenium uri))]
    (when (and cache (not (@browser-tc-cache app-inst-uri-arr)))
      (log/info "setting list of cmd into cache @" app-inst-uri-arr)
      (pp/pprint cmd-list)
      (swap! browser-tc-cache assoc app-inst-uri-arr cmd-list))
    cmd-list))

;;este mapa contiene como llave la aplicacion,instancia y como valor el browser 'current'

(def browser-drv-map (atom {}))

(defn quit-browser [appk instk]
  (when-let [browser (@browser-drv-map [appk instk])]
    (try
      (t/quit browser)
      (catch Exception e
        (.printStackTrace e))
      (finally
        (swap! browser-drv-map dissoc [appk instk])))))

(defn get-browser-drv [browser binary-dir profile-dir drv-key-arr profile-spec]
  (when-not (= :current browser)
    (let [anterior (@browser-drv-map drv-key-arr)
          anterior? (not (nil? anterior))]
      (log/info "Creando browser:" drv-key-arr " existia anterior:" anterior?)
      (when anterior?
        (try
          (log/warn (str "Eliminando browser anterior ya que se creo uno nuevo para la misma aplicacion/instancia " drv-key-arr))
          (t/quit anterior)
          (catch Exception e
            (log/error "El browser anterior no contesta probablemente ya no existia el proceso o está sordo")))))
    
    (let [
          drv (tutil/get-driver browser binary-dir profile-dir profile-spec) ;(t/new-driver {:browser :firefox})
            ]
      (when (= browser :htmlunit)
        (.setJavascriptEnabled (:webdriver drv) true))
      (swap! browser-drv-map assoc drv-key-arr drv)))
  (@browser-drv-map drv-key-arr)) ;; puede ser nil !!

;; en los comandos type reempazar keywords en el parametro #1 para poder contextualizar el TestCase
(defn contextualize-cmds [context cmds]
  (letfn [(reemplaza [val]
            (str (util/contextualize-text val context)))]
    (reduce 
      (fn [result cmd]
        (conj result {:cmd (:cmd cmd) :par1 (reemplaza (:par1 cmd)) :par2 (reemplaza (:par2 cmd))})) ;(update-in cmd [:par2] reemplaza)))
      [(util/contextualize-text (first cmds) context)]
      (rest cmds))))
  
; Se extrae el título de la última ventana en donde operó 
(defn get-window-title [driver first-title]
  (let [last-title (try (t/title driver) (catch Exception e nil))] 
    
    (if (nil? last-title)
      (if (nil? first-title) ; Si el segundo título es nil.
        "unknown" ; Si el primer título es nil.
        first-title)
      last-title)))

(defn browser-tc-opr [conf]
  (fn [context]
    (let [{app-name :app_ inst-name :inst_} context
          drv-key-arr [app-name inst-name]
          tc-uri (util/contextualize-text (:uri conf) context)
          browser (keyword (:browser conf))
          timeout (util/contextualize-int (:timeout conf) context)
          delta (util/contextualize-int (:delta conf) context)
          cache (.equalsIgnoreCase (str (:cache conf)) "true")
          close (.equalsIgnoreCase (str (:close conf)) "true")
          start-step (util/contextualize-int (:start-step conf) context)
          stop-step (util/contextualize-int (:stop-step conf) context)
          binary-dir (util/contextualize (:binary-path conf) context)
          profile-dir (util/contextualize (:profile-path conf) context)
          cmd-list (contextualize-cmds context (get-clj-cmd-list cache [app-name inst-name tc-uri]))
          browser-drv (get-browser-drv browser binary-dir profile-dir drv-key-arr nil)]
      (if browser-drv
        (let [{:keys [title url selenium error]} (tutil/prepare-exec browser-drv timeout cmd-list)]
          (if-not error
            (let [result (tutil/exec-selenium browser-drv selenium cmd-list delta timeout start-step stop-step)]
              (when close
                (try
                  (t/quit browser-drv)
                  (finally
                    (swap! browser-drv-map dissoc drv-key-arr))))
               (if (string? result)
                (str (get-window-title browser-drv title) ";" (if url url "unknown") ";" result)
                {:result (str (get-window-title browser-drv title) ";" url) :delta result}))
            (str (get-window-title browser-drv title) ";" (if url url "unknown") ";" error)))
        "Exception, no current browser!"))))

(defn fb-har-opr [conf]
  (fn [context]
    (let [{app-name :app_ inst-name :inst_} context
          drv-key-arr [app-name inst-name]
          uri (util/contextualize-text (:uri conf) context)
          browser (keyword (:browser conf))
          timeout (util/contextualize-int (:timeout conf) context)
          delta (util/contextualize-int (:delta conf) context)
          cache (.equalsIgnoreCase (str (:cache conf)) "true")
          close true
          start-step 0
          stop-step 99
          binary-dir (util/contextualize (:binary-path conf) context)
          profile-dir (util/contextualize (:profile-path conf) context)
          cmd-list (contextualize-cmds context (get-clj-cmd-list cache [app-name inst-name uri]))
          profile-spec {:preferences
                        {:extensions.firebug.allPagesActivation "on";firebug
                         :extensions.firebug.defaultPanelName "net"
                         :extensions.firebug.net.enableSites "true"
                         :extensions.firebug.netexport.alwaysEnableAutoExport "true";net export
                         :extensions.firebug.netexport.showPreview "false"
                         :extensions.firebug.netexport.defaultLogDir (util/contextualize (:hars-dir conf) context)}}
          browser-drv (get-browser-drv browser binary-dir profile-dir drv-key-arr profile-spec)]
      (if browser-drv
        (let [{:keys [title url selenium error]} (tutil/prepare-exec browser-drv timeout cmd-list)]
          (if-not error
            (let [result (tutil/exec-selenium browser-drv selenium cmd-list delta timeout start-step stop-step)]
              (when close
                (try
                  (t/quit browser-drv)
                  (finally
                    (swap! browser-drv-map dissoc drv-key-arr))))
              (if (string? result)
                (str (get-window-title browser-drv title) ";" (if url url "unknown") ";" result)
                {:result (str (get-window-title browser-drv title) ";" url) :delta result}))
            (str (get-window-title browser-drv title) ";" (if url url "unknown") ";" error)))
        "Exception, no current browser!"))))

;; experimentales y en desarrollo

(defn entry-opr
  {:doc "Crea una oparacion que es un punto de entrada a un sobproceso"
   :long-running false}
  [conf]
  (fn [context]
    (str "entry-opr:" (System/currentTimeMillis))))

(defn exit-opr
  {:doc "Crea una oparacion de salida para un subproceso toma el valor del estado seleccionado como valor de salida del subproceso"
   :long-running false}
  [conf]
  (fn [context]
    (let [exit-state-name (str (util/contextualize (:exit-state conf) context))
          exit-state-key (keyword (if (.startsWith exit-state-name ":") (subs exit-state-name 1) exit-state-name))]
      (str (exit-state-key context)))))
