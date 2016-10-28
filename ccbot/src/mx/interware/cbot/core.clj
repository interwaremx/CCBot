(ns mx.interware.cbot.core 
  (:gen-class)
  (:import 
    (java.net URL URLConnection) 
    (java.io PrintWriter OutputStreamWriter OutputStream 
             InputStream BufferedReader InputStreamReader
             File FileWriter)
    (java.util UUID)
    (java.util.concurrent Future TimeUnit TimeoutException ExecutionException LinkedBlockingQueue))
    
  (:require [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [clojure.zip :as zip]
            [mx.interware.cbot.store :as store]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.web.model.db :as db]
            [mx.interware.cbot.operations :as opr]
            [mx.interware.cbot.util :as util]
            [mx.interware.util.basic :as basic]
            ;[clj-webdriver.taxi :as t]
            ))
;;ya en git2
(do
  (println "loading " *ns*))

(declare exec-cbot)

(defprotocol StateP
  (execute [state context])
  (get-next [state context result])
  (is-long-running? [state])
  (get-coord [state])
  (send2log [state t0 delta result current context]))

(defrecord State [id opr next-func coord logit]
  StateP
  (execute [state context]
           (util/debug-info :State.execute)
           (opr (assoc context :state-name_ id)))
  (get-next [state context result]
            (if (nil? next-func)
              nil
              (next-func context result)))
  (is-long-running? [state]
                    (let [a (str (class opr))]
                      (.matches a ".*human_opr.*")))
  (get-coord [state] coord)
  
  (send2log [state t0 delta result current {:keys [app_ inst_] :as context}]
    (let [result (str result)
          mensaje (if (> (.length result) 300)
                    (.substring result 0 300)
                    result)
          code (.contains result "Exception")
          mensaje (if (and code (not (.contains mensaje "Exception")))
                    (str (subs mensaje 0 (- (.length mensaje) 12)) "...Exception") 
                    mensaje)
          r {:appl (name app_)
             :inst (name inst_)
             :state (name current)
             :inicio (java.sql.Timestamp. t0)
             :delta delta
             :codigo (if code "1" "0")
             :ejecucion 1
             :mensaje mensaje}]
      (db/add-row :estadistica r))))

(defn- frx [n frac]
  (int (- n (* frac (Math/floor (double (/ n frac)))))))

(defn rds [n frac]
  (Math/floor (double (/ n frac))))

(def FRONTERA (* 1000 3600 24 365 10)) ;diez anos!!

;se quitó para evitar posibles problemas de concurrencia
;(def formato-fecha (java.text.SimpleDateFormat. "yyyy-MM-dd HH:mm:ss.SSS"))

(defn- to-zz [i len]
  (let [istr (str i)]
    (str (subs "0000000000000" 0 (- len (.length istr))) istr)))

(defn- format-delta [delta]
  (if (> FRONTERA delta)
    (let [milis (to-zz (frx delta 1000) 3) 
          resto (rds delta 1000)
          secs (to-zz (frx resto 60) 2) 
          resto (rds resto 60)
          mins (to-zz (frx resto 60) 2) 
          resto (rds resto 60)
          hras (to-zz (frx resto 24) 2) 
          dias (int (Math/floor (rds resto 24)))]
      (str dias " " hras ":" mins ":" secs "." milis))
    (.format (java.text.SimpleDateFormat. "yyyy-MM-dd HH:mm:ss.SSS") delta)))

(defn store-stats [{max-len :max-len info :info :as stats} state val now delta]
  (let [result (conj info {:state (:id state) :result (str "<![CDATA[" (util/str-trunc2len val 150) "]]>") :when (format-delta now) :delta (format-delta delta)})]
    (if (> (count result) max-len)
      (assoc stats :info (butlast result))
      (assoc stats :info result))))

(defprotocol CbotP
  "Protocol for a CBOT"
  (exec [cbot])
  (resume [cbot response])
  (start [cbot])
  (stop [cbot])
  (get-exec [cbot])
  (create-with-id-and-context [cbot id instance-context])
  (is-template? [cbot]))

(defn- result2map [current result]
  (if (map? result)
    (assoc (dissoc result :result) current (:result result))
    {current result}))

(comment
      (into {} (assoc (dissoc result :result) current (:result result)))
)

(defn get-cbot-value [cbot d-uuid d-timeout]
  (let [{uuid :uuid semaphore :semaphore} @cbot]
    (when (= (str uuid) d-uuid) ; El siguiente codigo pordia ser un receive de un topico del cbot con timeout !
      (log/debug "timeout:" d-timeout " semaphore queue length:" (.getQueueLength semaphore))
      (let [acquired? (.tryAcquire semaphore d-timeout TimeUnit/MILLISECONDS)]
        (log/debug "value acquired? " acquired?)))
    (let [result @cbot]
      result)))

(defn- delta-human [label]
  (if-let [prefix (re-find #".*-opr@" label)]
    (try
      (let [at (Long/parseLong (subs label (.length prefix)))]
        (- (System/currentTimeMillis) at))
      (catch NumberFormatException e
        (System/currentTimeMillis)))    
    (System/currentTimeMillis)))

(defrecord Cbot-template [id template? current stop? awaiting?
                          states state-values state-count
                          last-ended exec-func stats app-id]
  CbotP  
  (is-template? [cbot]
                template?)
  (create-with-id-and-context [cbot id instance-context]
    (if template?
      (let [agte (agent (assoc cbot  :template? false
                          :id id
                          :state-values (assoc 
                                          (if (nil? instance-context) 
                                            (:state-values cbot) 
                                            (into (:state-values cbot) (:param-map instance-context))) 
                                          :inst_ id)
                          :stats (agent {:max-len stats
                                         :info (list)})
                          :uuid (UUID/randomUUID)
                          :semaphore (java.util.concurrent.Semaphore. 0 true)))]
        agte)
      (util/warn-exception-and-throw
       :Cbot-template.create-with-id-and-context
       (RuntimeException. "Only templates should be cloned !")
       :id id)))
  (stop [cbot]
        (if stop?
          (throw (java.lang.RuntimeException. (str "Cbot:" id " is stopped!")))
          (assoc cbot :stop? true)))
  (start [cbot]
        (if-not stop?
          (throw (java.lang.RuntimeException. (str "Cbot:" id " is running!")))
          (assoc cbot :stop? false)))
  (exec [cbot]
        (util/debug-info :Cbot-template.exec :current current :stop? stop? :keyword? (keyword? current) (keys states))
        (assert (and current states))
        (let [state (states current)
              now (. System currentTimeMillis)]
          (util/debug-info :Cbot-template.exec :state state :current current)
          (if (and (not stop?) (not awaiting?))
            (let [t0 (System/currentTimeMillis)
                  opr-result (execute state state-values)
                  delta (if (and (map? opr-result) (:delta opr-result))
                          (:delta opr-result)
                          (- (System/currentTimeMillis) t0))
                  new-state-vals (into state-values (assoc (result2map current opr-result) (keyword (str (name current) "_delta")) delta))
                  next-state (get-next 
                               state
                               new-state-vals
                               (if (map? opr-result)
                                 (:result opr-result) 
                                 opr-result))
                  uuid (UUID/randomUUID)]
              (when (= "true" (:logit state))
                (send2log state
                          t0
                          delta
                          (if (map? opr-result)
                            (:result opr-result) 
                            opr-result)
                          current
                          new-state-vals))
              (util/debug-info :Cbot-template.exec1 :opr-result opr-result :delta delta :next-state next-state)
              (util/debug-info :Cbot-template.exec2 :new-state-vals new-state-vals)
              
              (send-off
               stats store-stats state (current new-state-vals) now delta)
              (if (or (is-long-running? state) (nil? next-state)) 
                (do
                  (if (nil? next-state)
                    (util/log-info
                     :info :Cbot-template.exec :id id :current current :msg
                     "State dosen't have a satisfying exit rule, send 'resume' with name of next state to continue!")
                    (util/log-info :info :Cbot-template.exec :id id :current current :msg "Awaiting restart for long-running operation"))
                  (assoc cbot
                         :state-values new-state-vals
	                       :awaiting? true
    	                   :last-ended now
                         :uuid uuid))
                (do
                  (assoc cbot
                         :state-values new-state-vals
	                       :current next-state
	                       :last-ended now
	                       :state-count (inc state-count)
                         :uuid uuid))))
            cbot)))
  (resume [cbot response]
          (assert (and current states))
          (let [state (states current)
                now (. System currentTimeMillis)
                long-running? (is-long-running? state)]
            (if (and response awaiting? (not stop?))
              (let [started-at (current state-values)
                    new-state-vals (assoc state-values current response)
                    next-current (get-next state new-state-vals response)
                    uuid (UUID/randomUUID)]
                (send-off stats store-stats state (current new-state-vals) now (delta-human started-at))
                (if (nil? next-current)
                  (let [next-state (keyword response)]
                    (if (next-state states)
                      (assoc cbot
                        :state-values new-state-vals
                        :current next-state
                        :awaiting? false
		                    :last-ended now
	     	                :state-count (inc state-count)
                        :uuid uuid)
                      (do
                        (util/log-info :error :Cbot-template.resume
                                       :id id :current current
                                       :msg (str "State " next-state " dosen't exists!!"))
                        cbot)))
                  (assoc cbot
                    :state-values new-state-vals
                    :current next-current
                    :awaiting? false
	                  :last-ended now
		                :state-count (inc state-count)
                    :uuid uuid)))
              (throw
                (RuntimeException.
                  (str "illegal state "
                       (when (nil? response) "[response missing] ")
                       (when-not awaiting? "[cbot is not waiting] ")
                       (when-not long-running? "[current operation is not long-running]")))))))
  (get-exec [cbot]
            (if exec-func
              exec-func
              exec-cbot)))

(defn- unlock-waiting-threads [d-cbot]
  (send-off d-cbot (fn [cbot] ; el siguiente codigo podria ser la pubicacion en un topico de cambio de estado
                        (if-let [semaphore (:semaphore cbot)]
                          (let [q-len (.getQueueLength semaphore)]
                            (log/debug "releasing " q-len " waiting threads from queue of " (:id cbot) (:stop? cbot) (:awaiting? cbot))
                            (.release semaphore q-len)))
                        cbot)))

(defn- exec-cbot [cbot]
  (try
    (let [next-cbot (exec cbot)
          send? (and (not (:stop? next-cbot)) (not (:awaiting? next-cbot)))]
      (unlock-waiting-threads *agent*)
      (if send?
        (send-off *agent* (get-exec next-cbot)))
      next-cbot)
    (catch Exception e
      (log/error e)
      (util/warn-exception :exec-cbot e :id (:id cbot) :current (:current cbot))
      cbot)))

(defn- resume-cbot [cbot result]
  (try
    (let [next-cbot (resume cbot result)
          send? (and (not (:stop? next-cbot)) (not (:awaiting? next-cbot)))]
      (unlock-waiting-threads *agent*)
      (if send?
        (send-off *agent* (get-exec next-cbot)))
      next-cbot)
    (catch Exception e
      (util/warn-exception :resume-cbot e :id (:id cbot)
                           :current (:current cbot) :result result)
      cbot)))

(defn- stop-cbot [cbot]
  (try
    (let [next-cbot (stop cbot)]
      (log/debug "stop-cbot !!! " (:stop? next-cbot) (:stop? cbot))
      ;;clearing opr caches
      (let [appk (:app-id cbot)
            instk (:id cbot)]
        (.gc (java.lang.Runtime/getRuntime))
        (log/info (str "clearing chaches for " [(:app-id cbot) (:id cbot)]))
        (opr/clear-browser-tc-cache appk instk)
        (opr/quit-browser appk instk))
      
      (unlock-waiting-threads *agent*)
      (util/log-info :info :stop-cbot :msg "cbot stoped !" :id (:id cbot))
      next-cbot)
    (catch RuntimeException re
      (when-not (re-matches #"^Cbot:.* is stopped!$" (.getMessage re))
        (util/warn-exception :stop-cbot re :id (:id cbot) :current (:current cbot)))
      cbot)
    (catch Exception e
      (util/warn-exception :stop-cbot e :id (:id cbot) :current (:current cbot))
      cbot)))

(defn- start-cbot [cbot]
  (try
    (let [next-cbot (start cbot)]
      (unlock-waiting-threads *agent*)      
      (util/log-info :info :start-cbot :id (:id next-cbot)
                     :current (:current next-cbot) :msg "cbot started !!!!")
      (if (not (.awaiting? next-cbot))
        (send-off *agent* (get-exec next-cbot)))
      next-cbot)
    (catch Exception e
      (util/warn-exception :start-cbot e :id (:id cbot) :current (:current cbot))
      cbot)))

(defn re-flow [vec-rule]
  (fn [context value]
    (log/debug (str "re-flow :" vec-rule " value:" value))
    (let [selection 
          (or
            (some
              (fn [par]
                (println "par: " (pr-str par))
                (let [mask (bit-or java.util.regex.Pattern/DOTALL
                                   java.util.regex.Pattern/MULTILINE)
                      pattern (java.util.regex.Pattern/compile (str (util/contextualize (second par) context)) mask) ;(str (second par))
                      ]
                  (log/debug (str "re-flow (1):[" (second par) "] value [" value "] -> p:" pattern ))
                  (if (re-matches pattern (str value))
                    (first par))))
                (partition 2 vec-rule))
            (last vec-rule))]
      (log/debug (str "re-flow next state:" selection))
      selection)))

(defn state-name-flow [kname]
  (fn [_ _]
    (log/debug (str "state-name-flow next state:" kname))
    kname))

(defn cbot-start [cbot-agent]
  (send-off cbot-agent start-cbot)
  (str "Comando inicio enviado a " (.id @cbot-agent)))

(defn cbot-running? [cbot-agent]
  (and (not (:stop? @cbot-agent)) (not (:awaiting? @cbot-agent))))

(defn cbot-stop [cbot-agent]
  (send-off cbot-agent stop-cbot)
  (str "Comando detener enviado a " (.id @cbot-agent)))

(defn cbot-stop-if-at [cbot-agent statek]
  (while (and (cbot-running? cbot-agent) (not= :start (:current @cbot-agent)))
    (Thread/sleep 100))
  (cbot-stop cbot-agent))
  

(defn cbot-resume [cbot-agent external-response]
  (send-off cbot-agent resume-cbot external-response)
  (str "Comando continuar enviado a " (.id @cbot-agent) " con respuesta externa :" external-response))

(defn create-cbot-template [id current states inter-state-delay context stats]
  (Cbot-template.
   id true current true false states context 0 0
   (if (> inter-state-delay 0)
     (fn [cbot]
       (if-not (or (:stop? cbot) (:waiting? cbot)) (Thread/sleep inter-state-delay))
       (exec-cbot cbot))
     #'exec-cbot)
   stats id))

(comment (#'util/wrap-with-delay #'exec-cbot inter-state-delay))

(defn build-cbot-factory [id inter-state-delay parameters instances states starting-state stats]
  (let [template (create-cbot-template
                  id starting-state states inter-state-delay parameters stats)]
    (fn [instance-id]
      (if (nil? instance-id)
        (into [] (keys instances))
        (let [instance-context (instance-id instances)]
          (if (nil? instance-context)
            (util/log-info :warn :build-cbot-factory :msg (str "Instance:" instance-id " non existent in " id " cbot factory valid " (keys instances))))
          (create-with-id-and-context template instance-id instance-context))))))

(defn opr-dispatch [opr-name timeout retry-count retry-delay conf]
  opr-name)

(defmulti opr-factory opr-dispatch :default "no-opr")

(defmethod opr-factory "sleep-opr" [opr-name timeout retry-count retry-delay conf]
  (opr/sleep-opr conf))

(defmethod opr-factory "switch-bad-opr" [opr-name timeout retry-count retry-delay conf]
  (opr/switch-bad-opr conf))

(defmethod opr-factory "print-msg-opr" [opr-name timeout retry-count retry-delay conf]
  (opr/print-msg-opr conf))

(defn- fix-number [n]
  (cond
   (nil? n) nil
   (number? n) n
   (keyword? n) n
   (and (string? n) (re-matches #"[0-9]+" n)) (Long/parseLong n)
   (and (string? n) (zero? (count (.trim n)))) nil
   (string? n) n     
   :otherwise 0))

(defn- wrap-opr [opr timeout retry-count retry-delay conf]
  (let [timeout timeout
        retry-count (fix-number retry-count)
        retry-delay (fix-number retry-delay)
        f1 (if (not= (str timeout) "0")
             (util/wrap-with-timeout (opr conf) timeout)
             (opr conf)) 
        f2 (if (and retry-count retry-delay)
             (util/try-times-opr f1 retry-count retry-delay)
             f1)]
    (util/wrap-with-catch-to-string f2)))

(defmethod opr-factory "print-context-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/print-context-opr 0 0 0 conf))

(defmethod opr-factory "get-http-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/get-http-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "post-http-opr" [opr-name timeout retry-count retry-delay conf]  
  (wrap-opr opr/post-http-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "log-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/log-opr 0 0 0 conf))

(defmethod opr-factory "send-mail-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/send-mail-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "human-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/human-opr 0 0 0 conf))

(defmethod opr-factory "switch-good-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/switch-good-opr 0 0 0 conf))

(defmethod opr-factory "socket-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/socket-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "get-mail-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/get-mail-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "sql-read-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/sql-read-opr timeout retry-count retry-delay conf))

(defmethod opr-factory "clojure-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/clojure-opr 0 0 0 conf))

(defmethod opr-factory "js-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/js-opr 0 0 0 conf))

(defmethod opr-factory "date-time-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/date-time-opr 0 0 0 conf))

(defmethod opr-factory "play-sound-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/play-sound-opr 0 10 1000 conf))

(defmethod opr-factory "os-cmd-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/os-cmd-opr 0 0 0 conf))

(defmethod opr-factory "send-stats-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/send-stats-opr 0 0 0 conf))

(defmethod opr-factory "fb-har-opr" [opr-name timeout retry-count retry-delay conf]
  (let [xtimeout (cond (nil? timeout) "300000" ; 5 min
                       (= 0 (.length (.trim (str timeout)))) "300000"
                       (re-matches #"[0-9]+" (str timeout)) (str timeout)
                       :OTHERWISE "300000")
        xtimeout (java.lang.Integer/parseInt xtimeout)]
    (wrap-opr opr/fb-har-opr xtimeout 0 0 conf)))

(defmethod opr-factory "browser-tc-opr" [opr-name timeout retry-count retry-delay conf]
  (let [xtimeout (cond (nil? timeout) "300000" ; 5 min
                       (= 0 (.length (.trim (str timeout)))) "300000"
                       (re-matches #"[0-9]+" (str timeout)) (str timeout)
                       :OTHERWISE "300000")
        xtimeout (java.lang.Integer/parseInt xtimeout)]
    (wrap-opr opr/browser-tc-opr xtimeout 0 0 conf))) ;TODO a lo mejor se debe capturar este timeout!!! FGC

(defmethod opr-factory "entry-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/entry-opr 0 0 0 conf))

(defmethod opr-factory "exit-opr" [opr-name timeout retry-count retry-delay conf]
  (wrap-opr opr/exit-opr 0 0 0 conf))

(comment (defmethod opr-factory "subprocess-opr" [opr-name timeout retry-count retry-delay conf]
  (opr/subprocess-opr conf))) 

(defn flow-factory [v]
  (cond (= 0 (count v)) nil
        (= 1 (count v)) (state-name-flow (first v))
        :otherwise (re-flow v)))

(defn state-factory [state-id {{opr-name :opr
                                timeout :timeout
                                retry-count :retry-count
                                retry-delay :retry-delay
                                conf :conf
                                logit :logit :as conf-map} :conf-map
                               {connect-vec :connect x :x y :y :as flow} :flow}]
  (log/debug (str "state-id:"  state-id " opr-name:" opr-name))
  (try
    (State. state-id (opr-factory opr-name timeout retry-count retry-delay conf) (flow-factory connect-vec) {:x x :y y} logit)
    (catch Exception e
      (log/error "Problems creating state:" state-id " conf:" conf "\n" (.getClass e) (.getMessage e))
      (throw e))))
      
  

(def app-ctrl (ref {}))

;; Este ref tiene los cbot ya creados, si no existen, se crean y se
;; meten a este ref !!, la llave es :app:instance como str
(def cbot-ctrl (ref {}))

(defn apps []
  (store/get-app-names))

(defn- transform-str [s]
  (if (string? s)
    (cond
     (re-matches #":[A-Za-z0-9\?\-\_\#\+\/\*]+" s) (keyword (subs s 1))
     (re-matches #"[0-9]+" s) (Long/parseLong s)
     :otherwise s)
    s))

(defn- transform2run [info]
  (cond
   (map? info) (into {} (map (fn [[k v]] {k (transform2run v)}) info))
   (vector? info) (into [] (map (fn [v] (transform2run v)) info))
   :otherwise (transform-str info)))

(defn create-app-manager [app-key]
  (if-let [app (store/get-app app-key)]
    (let [app-params (:parameters app)
          node-params (store/get-node-conf)
          app-params (into node-params app-params)
          {interstate-delay :interstate-delay
           stats :stats-cache-len
           parameters :parameters
           instances :instances
           pre-states :states} (assoc-in (assoc app :parameters app-params) [:parameters :app_] app-key) 
          ;(assoc-in (update-in app [:parameters] into (store/get-node-conf)) [:parameters :app_] app-key) 
           states (into {}
                       (map (fn [info]
                              (log/debug "INFO:" info)
                              (let [info-k (keyword (subs (info :key) 1))
                                    run-info (transform2run info)]
                                [info-k (state-factory info-k run-info)]))
                            pre-states))]
      {:key app-key
       :interstate-delay interstate-delay
       :parameters parameters
       :instances instances
       :states states
       :first (keyword (subs (:key (first pre-states)) 1))
       :cbot-factory (build-cbot-factory app-key
                                         (Integer/parseInt interstate-delay)
                                         parameters
                                         instances
                                         states
                                         (keyword (subs (:key (first pre-states)) 1)) 
                                         (if stats (fix-number stats) 100))})))

(defn get-app-manager [app-key]
  (if-let [factory (app-key @app-ctrl)]
    factory
    (if-let [factory2 (create-app-manager app-key)]
      (dosync   
       (alter app-ctrl #(assoc % app-key factory2))
       factory2))))

(defn get-cbot [app-key inst-key]
  (dosync
    (let [k (str app-key inst-key)]
      (if-let [cbot (@cbot-ctrl k)]
        cbot
        (if-let [factory (:cbot-factory (get-app-manager app-key))]
          (let [cbot (factory inst-key)]
            (alter cbot-ctrl assoc k cbot)
            cbot))))))


(defn stop-and-remove-old-app [app-key]
  (doseq [[appinst-k cbot] (filter #(.startsWith (str (% 0)) (str app-key ":")) @cbot-ctrl)]
    (log/info "stop-and-remove-old-app stopping " appinst-k)
    (cbot-stop cbot)
    (dosync (alter cbot-ctrl dissoc appinst-k)))
  (log/info "removing from app-ctrl app-key:" app-key "\n" @app-ctrl)
  (dosync (alter app-ctrl dissoc app-key)))

(defmulti apply-cmd (fn [_ _ cmd & params] cmd))

;; en este mapa se colocan como llava un vector [appk instk] y como valor un file temporal
;; alpacenado en el subdirectorio running con un solo renglon con [appk instk] que podrá ser leido con
;; slurp y read-string
(def running-map (atom {}))

(def running-dir (io/file "./running"))

(defn is-running? [appk instk]
  (@running-map [appk instk]))

(defn mark-as-running [appk instk]
  (when-let [file (is-running? appk instk)]
    (.delete file))
  (let [file (java.io.File/createTempFile "app" "id" running-dir)]
    (comment with-open [pw (java.io.PrintWriter. (java.io.FileWriter. file))]
      (.print pw (str [appk instk])))
    (spit file (str [appk instk]) :encoding "UTF-8")
    (swap! running-map assoc [appk instk] file)))

(defn mark-as-not-running [appk instk]
  (when-let [file (is-running? appk instk)]
    (if (.exists file) 
      (.delete file)))
  (swap! running-map dissoc [appk instk]))

(defn load-running-apps []
  (doseq [f (filter (fn [file] (and (.isFile file) (re-matches #"^app[0-9]+id$" (.getName file)))) (.listFiles running-dir))]
    (let [s (slurp f :encoding "UTF-8")
          k (read-string s)]
      (log/info (str "starting " k)) 
      (swap! running-map assoc k f))))

(defmethod apply-cmd "start" [app-k inst-k cmd & _]
  (mark-as-running app-k inst-k)
  (let [cbot (get-cbot app-k inst-k)]
    (cbot-start cbot)))

(defmethod apply-cmd "stop" [app-k inst-k cmd & _]
  (mark-as-not-running app-k inst-k)
  (let [cbot (get-cbot app-k inst-k)]
    (cbot-stop cbot)))


;;
(defmethod apply-cmd "status" [app-k inst-k cmd & param]
  (if (and param app-k inst-k)
    (if-let [cbot (get-cbot app-k inst-k)]
      (let [{uuid :uuid timeout :timeout} (first param)
            cbot-value (get-cbot-value (get-cbot app-k inst-k) uuid timeout)]
        cbot-value)
      {:cbot-msg (str "No cbot for " app-k " application and " inst-k)})
    {:cbot-msg "Application key or instance key missing!"}))

(defn state-coord [app-k state]
  (let [mgr (get-app-manager app-k)]
    (get-coord ((:states mgr) state))))

(defmethod apply-cmd "current-pos" [app-k inst-k cmd & param]
  (if (and param app-k inst-k)
    (if-let [cbot (get-cbot app-k inst-k)]
      (let [{uuid :uuid timeout :timeout} (first param)
            cbot-value (get-cbot-value (get-cbot app-k inst-k) uuid timeout)
            current (:current cbot-value)
            result (state-coord app-k current)]
        (if result
          (assoc result
            :app (name app-k)
            :inst (name inst-k)
            :uuid (str (:uuid cbot-value))
            :request-uuid uuid
            :id (:id cbot-value)
            :current (:current cbot-value)
            :stop? (:stop? cbot-value)
            :awaiting? (:awaiting? cbot-value)
            :state-count (:state-count cbot-value)
            :last-ended (:last-ended cbot-value)
            :stats @(:stats cbot-value)
            :status (:instance-status_ (:state-values cbot-value))) 
          {:cbot-msg (str "No state " current " in application " app-k) }))
      {:cbot-msg (str "No cbot for " app-k " application and " inst-k)})
    {:cbot-msg "Application key or instance key missing!"}))

(defmethod apply-cmd "resume" [app-k inst-k cmd & param]
  (if (and param app-k inst-k)
    (if-let [cbot (get-cbot app-k inst-k)]
      (let [{msg :msg} (first param)
            result (cbot-resume cbot msg)]
        result)
      {:cbot-msg (str "No cbot for " app-k " application and " inst-k)})
    {:cbot-msg "Application key or instance key missing!"}))

(defn stop-at-and-remove-old-and-restart [app-key statek]
  (let [restart-apps (reduce (fn [result [appinst-k cbot]]
                               (log/info "stop-at-remove-old-and-restart stopping " appinst-k)
                               (let [is-run? (cbot-running? cbot)]
                                 (when is-run?
                                   (cbot-stop-if-at cbot statek))
                                 (dosync (alter cbot-ctrl dissoc appinst-k))
                                 (if is-run?
                                   (conj result appinst-k)
                                   result)))
                             nil
                             (filter #(.startsWith (str (% 0)) (str app-key ":")) @cbot-ctrl))]
    (log/info "removing from app-ctrl app-key:" app-key "\n" @app-ctrl)
    (dosync (alter app-ctrl dissoc app-key))
    (doseq [appinstk restart-apps]
      (let [[_ app inst] (into [] (.split appinstk ":"))
            instk (keyword inst)]
        (apply-cmd app-key instk "start")))))

(defn config-log4j []
  (let [logf (java.io.File. "./log4j.xml")
        exist-log? (.exists logf)  
        logf-path (.getAbsolutePath logf)]
    (if exist-log?
      (do
        (println "Configuring log4j with file:" logf-path)
        (org.apache.log4j.xml.DOMConfigurator/configureAndWatch logf-path 60000)
        )
      (do
        (println "file:" logf-path " does not exist, doing basic configuration for log4j")
        (org.apache.log4j.BasicConfigurator/configure)
        ))))

(defn limpiaK [k]
  (let [n (.replaceAll (name k) "[ @!\"&<>]" "_")]
    (keyword n)))
        

(defn limpia [m]
  (cond (map? m) (reduce (fn [r [k v]] (assoc r k v)) {} 
                         (map (fn [k]
                                 [(limpiaK k) (limpia (m k))]) (keys m)))
        (vector? m) (into [] (map (fn [e] (limpia e)) m))
        :OTHERWISE m))

(defn get-runtime-status []
  (reduce
    (fn [result [app inst status]]
      (update-in result [app] #(into [] (conj % inst))))
    {}
    (filter
      (fn [[_ _ status]]
        (= :RUNNING status))
      (map (fn [par]
             (let [app-inst (.key par)
                   [_ application instance] (.split app-inst ":")
                   stop? (-> par .val deref :stop?)]
               [(keyword application) (keyword instance) (if stop? :STOPPED :RUNNING)]))
         @cbot-ctrl))))

;status-map ::== {:prueba [:uno :dos], :App1 [:UNO]}
(defn set-runtime-status [status-map-param]
  (let [status-map (limpia status-map-param)]
    (log/debug (str "\n@@@ 0) " status-map))
    (let [cbot-ids2start (into #{} 
                               (mapcat 
                                 (fn [[app insts]]
                                   (into [] (map (fn [inst]
                                                   (str app inst))
                                                 insts)))
                                 status-map))]
      ;apaga todas las que no esten en el set
      (log/debug (str "\n@@@ 1) " cbot-ids2start))
      (doseq [[id cbot] @cbot-ctrl] ;; filtrar solo las aplicaciones indicadas
        (log/debug (str "\n@@@ 2) " id))
        (let [inst-id id
              [_ app-name inst-name] (.split inst-id ":")
              dummy (log/debug (str "**** " app-name "  " inst-name " -- "))
              app (keyword app-name)
              inst (keyword inst-name)]
          (log/debug (str "\n@@@ 3) " app inst (if (app status-map) "SI ESTA" "NO ESTA")))
          (if (app status-map) ;; esta app está entre las que llegaron
            (if-not (cbot-ids2start inst-id)
              (if-let [cbot (get-cbot app inst)]
                (if-not (:stop? @cbot) ; antes decia (cbot-stop cbot) pero para que borre el archivo de auto start ahora usamos la siguiente linea
                  (apply-cmd app inst "stop")))))))
      ;prende las de el set que no este ya predidas
      (doseq [inst-id cbot-ids2start]
        (let [[_ app-name inst-name] (.split inst-id ":")
              dummy (log/debug (str "\n@@@ 4) " inst-id " " app-name " " inst-name))
              app (keyword app-name)
              inst (keyword inst-name)
              dummy (log/debug (str "\n@@@ 5) " app " " inst))
              cbot (@cbot-ctrl inst-id)]
          (if (or (nil? cbot) (:stop? @cbot))
            (if-let [cbot (get-cbot app inst)]
              (if (:stop? @cbot) ; antes decia (cbot-start cbot) pero para que escriba el archivo de auto start ahora usamos la siguiente linea
                (apply-cmd app inst "start"))))))
      (into [] cbot-ids2start))))

(defn -mainx [& args]
  (println "Iniciando el CBOT-P")
  (log/info "Ya está configurado el log4j")
  ;(start-cbot cbot) 
  )

