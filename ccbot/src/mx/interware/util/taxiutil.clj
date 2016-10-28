(ns mx.interware.util.taxiutil  
  (:require [clojure.pprint :as pp]
            [clojure.xml :as xml]
            [clojure.string :as str]
            [clojure.tools.logging :as log]
            [clj-webdriver.taxi :as t]
            [clj-webdriver.element :as e]
            ;Se incluye código para inicialización de firefox driver incluyendo utilizando binary & profile.
            [clj-webdriver.driver :as d]
            [clj-webdriver.core :as c]
            [clj-webdriver.firefox :as f]
            [clojure.java.io :as io])
  (:import [org.openqa.selenium.firefox FirefoxDriver]
           [org.openqa.selenium.firefox FirefoxProfile]
           [org.openqa.selenium.firefox FirefoxBinary]))

(do
  (println "loading " *ns*))

(def cmd->taxi {:open "t/to"
                :type "t/input-text"
                :clickAndWait "t/click"
                :click "t/click"
                :select "t/select-by-value"})

;Se incluye código para inicialización de firefox driver incluyendo utilizando binary & profile. 

(defn new-webdriver-iw*
  "Return a Selenium-WebDriver WebDriver instance, optionally configured to leverage a custom FirefoxProfile."
  ([browser-spec]
     (let [{:keys [browser binary profile] :or {browser :firefox
                                                binary nil
                                                profile nil}} browser-spec]
       (if binary
         (if profile
           (FirefoxDriver. binary profile)
           (FirefoxDriver. binary (FirefoxProfile.)))
         (if profile
           (FirefoxDriver. profile)
           (.newInstance (c/webdriver-drivers (keyword browser))))))))

(defn new-driver-iw
  "Start a new Driver instance. The `browser-spec` can include `:browser`, `:binary`, `:profile` and `:cache-spec` keys.

   The `:browser` can be one of `:firefox`, `:ie`, `:chrome` or `:htmlunit`.
   The `:binary` should be an instance of FirefoxBinary you wish to use.
   The `:profile` should be an instance of FirefoxProfile you wish to use.
   The `:cache-spec` can contain `:strategy`, `:args`, `:include` and/or `:exclude keys. See documentation on caching for more details."
  ([browser-spec]
     (let [{:keys [browser binary profile cache-spec] :or {browser :firefox
                                                    binary nil
                                                    profile nil
                                                    cache-spec {}}} browser-spec]
       (d/init-driver {:webdriver (new-webdriver-iw* {:browser browser
                                                 :binary binary
                                                 :profile profile})
                     :cache-spec cache-spec}))))

(defn new-binary-iw
  "Create an instance of `FirefoxBinary`"
  ([] (FirefoxBinary.))
  ([binary-dir] (try 
                  (FirefoxBinary. (io/file binary-dir))
                  (catch Exception e
                    (log/error "No se ha podido crear el objeto FirefoxBinary. " (.getMessage e))
                    nil))))

(defn get-profile-extensions [profile-dir]
  "Get all the profile extensions."
  (let [ext-dir (.replaceAll (str profile-dir "/extensions/") "//" "/")
        ext-files (.list (io/file ext-dir))
        extensions (map (fn [ext-file]
                          (str ext-dir ext-file))
                        ext-files)]
    extensions))

(defn new-profile-iw
  "Create an instance of `FirefoxProfile` loading automatically the extensions from the profile and preferences defined in profile-spec manually.
   The `profile-spec` can include `:preferences` key.

   The `:preferences` are the user preferences for the profile."
  ([] (FirefoxProfile.))
  ([profile-dir] (let [profile (try 
                                 (FirefoxProfile. (io/file profile-dir))
                                 (catch Exception e
                                   (log/error "No se ha podido crear el objeto FirefoxBinary. " (.getMessage e))
                                   nil))]
                   (when profile
                     (when-let [extensions (get-profile-extensions profile-dir)]
                       (map (fn [extension]
                              (f/enable-extension profile extension))
                            extensions)))
                   profile))
  ([profile-dir profile-spec] (let [profile (try 
                                               (FirefoxProfile. (io/file profile-dir))
                                               (catch Exception e
                                                 (log/error "No se ha podido crear el objeto FirefoxBinary. " (.getMessage e))
                                                 nil))]
                                 (when profile
                                   (when-let [extensions (get-profile-extensions profile-dir)]
                                     (map (fn [extension]
                                            (f/enable-extension profile extension))
                                          extensions))
                                   (when-let [preferences (:preferences profile-spec)]
                                     (f/set-preferences profile preferences)))
                                 profile)))

(defn get-driver [browser binary-dir profile-dir profile-spec]

  (let [driver (new-driver-iw {:browser browser
                               :binary (if (not (= binary-dir ""))
                                         (new-binary-iw binary-dir)
                                         nil)
                               :profile (if (not (= profile-dir ""))
                                          (if profile-spec
                                            (new-profile-iw profile-dir profile-spec)
                                            (new-profile-iw profile-dir))
                                          nil)})]
    driver))
  
(def param-pattern #"([a-z]+)=(.*)")

(defn param-pattern-selector [drv param-type param-val]
  param-type)

(defmulti param-builder-fun param-pattern-selector)

(defmethod param-builder-fun :id [drv param-type param-val]
  ;(str "#" param-val)
  (let [q {:xpath (str "//*[@id='" param-val "']")}]
    (log/debug (str "*** id q:" q))
    (t/find-element drv q)))

(defmethod param-builder-fun :link [drv param-type param-val]
  (t/find-element drv {:xpath (str "//a[text()='" param-val "']")}))

(defmethod param-builder-fun :css [drv param-type param-val]
  (.replaceAll param-val "\"" "'"))

(defmethod param-builder-fun :xpath [drv param-type param-val]
  (t/find-element drv {:xpath param-val}))

(defmethod param-builder-fun :label [drv param-type param-val]
  param-val)

(defmethod param-builder-fun :name [drv param-type param-val]
  (str "[name=" (.replaceAll param-val "\"" "'") "]"))

(defmethod param-builder-fun :dom [drv param-type param-val]
  (log/debug (str "executinf script !!! " param-val))
  (let [e (t/execute-script drv param-val)]
    (log/debug (str "regreso: " e))
    e))

(defmethod param-builder-fun :default [drv param-type param-val]
  (cond (.startsWith param-val "document")
        (param-builder-fun :dom param-val)
        (.startsWith param-val "//")
        (param-builder-fun drv :xpath param-val)
        :OTHERWISE
        (param-builder-fun drv :id param-val)))

(defn param-builder [drv param]
  (let [mtchv (re-matches param-pattern param)]
    (if (vector? mtchv)
      (let [[_ param-type param-val] mtchv]
        (param-builder-fun drv (keyword param-type) param-val))
      (param-builder-fun drv :default param))))

(defn handle-open [base p]
  (let [p (.replaceAll p "\"" "")
        base (if (and (.endsWith base "/") (.startsWith p "/"))
               (str base (subs p 1))
               (str base p))]
    (str "\"" base "\"")))

(defn emit-taxi [base {:keys [cmd par1 par2]}]
  (let [taxi (cmd cmd->taxi)
        param [par1 par2]
        taxi-cmd (reduce 
                   (fn [s p]
                     (str s " " (if (= cmd :open) (handle-open base p) p)))
                   (str " swd " taxi) 
                   (map param-builder (filter identity param)))]
    (str taxi-cmd ")")))

(defn leetrio [trio]
     (let [[e1 e2 e3] (:content trio)
           cmd (keyword (-> e1 :content first))
           par1 (-> e2 :content first)
           par2 (-> e3 :content first)]
       {:cmd cmd :par1 par1 :par2 par2}))

(defn read-selenium [file-uri]
  (log/debug "reading selenium tc:" file-uri)
  (let [xml (slurp file-uri :encoding "UTF-8")
        xml (let [i (.indexOf xml "<!DOCTYPE")
                  j (.indexOf xml ">" i)]
              (if (>= i 0)
                (str (subs xml 0 i) (subs xml (inc j)))
                xml))
        xml-is (java.io.ByteArrayInputStream. (.getBytes xml "UTF-8"))
        src (try (xml/parse xml-is) (catch Exception e (.printStackTrace e) (log/error e)))
        dummy (when (log/enabled? :debug)
                (pp/pprint src))
        base (-> src :content first :content second :attrs :href)
        tc-name (-> src :content first :content rest second :content first)
        cmds (-> src :content second :content first :content second :content)
        dummy (log/debug (str "base:" base " tc-name:" tc-name " cmds:" cmds))
        cmdsM (reduce 
                (fn [result trio]
                  (conj result (leetrio trio)))
                [base]
                cmds)]
    cmdsM))

(defn taxi-selector [selenium drv timeout base cmd]
  (cmd :cmd))

(defmulti exec-taxi taxi-selector)

(defmethod exec-taxi :open [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.open selenium (str (java.net.URL. (java.net.URL. base) par1))))

(defmethod exec-taxi :type [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.type selenium par1 par2))

(defmethod exec-taxi :submit [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.sumbit selenium par1 par2))


(defmethod exec-taxi :clickAndWait [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.click selenium par1)
  (.waitForPageToLoad selenium "60000"))

(defmethod exec-taxi :click [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.click selenium par1))

(defmethod exec-taxi :focus [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.focus selenium par1))

(defmethod exec-taxi :select [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.select selenium par1 par2))

(defmethod exec-taxi :waitForVisible [selenium drv timeout base {:keys [cmd par1 par2]}]
  (t/wait-until drv 
                (fn [_]
                  (t/visible? drv (param-builder drv par1)))
                timeout
                1000))

(defmethod exec-taxi :waitForText [selenium drv timeout base {:keys [cmd par1 par2]}]
  (try
    (t/wait-until drv 
                  (fn [_] 
                    (let [html (t/html drv (param-builder drv par1))]
                      (log/info "@@@ " html)
                      (log/info ";;; " par2)
                      (re-matches 
                        (re-pattern (str ".*" par2 ".*"))
                        html))) 
                  timeout 
                  1000)
    (catch Exception e
      (log/warn e)
      (throw (java.util.concurrent.TimeoutException. (str "Timeout waiting for text:" par1 "[" par2 "]"))))))


(defmethod exec-taxi :waitForElementPresent [selenium drv timeout base {:keys [cmd par1 par2]}]
  (let [;p (param-builder drv par1)
        t (+ (System/currentTimeMillis) timeout)]
    (log/debug (str "Esperando1 " par1 " " (.isElementPresent selenium par1)))
    (while (and (< (System/currentTimeMillis) t) (not (.isElementPresent selenium par1)))
      (log/debug (str "Esperando2 " par1))
      (Thread/sleep 1000))
    (when-not (.isElementPresent selenium par1)
      (throw (java.util.concurrent.TimeoutException. (str "Timeout waiting for element:" par1))))))

(defmethod exec-taxi :waitForPageToLoad [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.waitForPageToLoad selenium par1))
;  (t/page-source drv))

(defmethod exec-taxi :waitForPopUp [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.waitForPopUp selenium par1 (str timeout)))

(defmethod exec-taxi :selectWindow [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.selectWindow selenium par1))
(defmethod exec-taxi :selectFrame [selenium drv timeout base {:keys [cmd par1 par2]}]
  (if (= "relative=top" par1)
    (t/switch-to-default drv)
    (do
      (.selectFrame selenium par1)
      (comment let [q (str "[name=" (.replaceAll par1 "\"" "'") "]")
            e  (t/element drv q)
            ]
        (println "?????? " q)
        (println "...... " e)
        (t/switch-to-frame drv e)))))

(defmethod exec-taxi :openWindow [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.openWindow selenium par1 par2))

(defmethod exec-taxi :highlight [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.highlight selenium par1))

(defmethod exec-taxi :mouseOver [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.mouseOver selenium par1))

(defmethod exec-taxi :runScript [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.runScript selenium par1))

(defmethod exec-taxi :sendKeys [selenium drv timeout base {:keys [cmd par1 par2]}]
  (.type selenium par1 par2))

(defmethod exec-taxi :sleep [selenium drv timeout base {:keys [cmd par1 par2]}]
  (println :sleep (pr-str par1 par2))
  (Thread/sleep (Integer/parseInt par1)))

(defn prepare-exec [drv timeout [base & cmds]]
  (try
    (t/implicit-wait drv timeout)
    (.setScriptTimeout (.. (:webdriver drv) manage timeouts) timeout java.util.concurrent.TimeUnit/MILLISECONDS)
    (let [selenium (com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium. (:webdriver drv) base)] ;org.openqa.selenium.WebDriverBackedSelenium
      (when-not (= (java.lang.System/getProperty "selenium.no.drv.to.base") "true")
        (t/to drv base))
      (let [params-exec {:selenium selenium
                         :title (t/title drv)
                         :url (t/current-url drv)}]
        params-exec))
    (catch Exception e
      (when (log/enabled? :debug)
        (.printStackTrace e))
      {:error (str e)})))

(defn exec-selenium [drv selenium [base & cmds] delta timeout start-step stop-step]
  (try
    (let [execer (partial exec-taxi selenium drv timeout base)]
      (reduce
        (fn [delta-tot [cmd step]]
          (Thread/sleep delta) 
          (log/info (str cmd))
          (let [t0 (System/currentTimeMillis)]
            (try
              (log/debug "timeout === " timeout)
              (let [ftr (future (execer cmd))
                    result (deref ftr (+ timeout 300000) :TIMEOUT)]
                (when (= :TIMEOUT result)
                  (log/info "TIMEOUT+20000: Killing browser !")
                  (t/quit drv)))
              (catch java.util.concurrent.ExecutionException e
                (log/info e)
                (throw (.getCause e)))
              (catch Exception e
                (log/info e)
                (throw (Exception. (str cmd ":" e)) e)))
            
            (if (and (>= step start-step) (<= step stop-step)) 
              (+ delta-tot (- (System/currentTimeMillis) t0))
              delta-tot)))
        0
        (map (fn [cmd i] [cmd i]) cmds (range 0 (count cmds)))))
    (catch Exception e
      (when (log/enabled? :debug)
        (.printStackTrace e))
      (str e))))

(defn prueba []
  (let [wd (org.openqa.selenium.firefox.FirefoxDriver.)
        mgr (.manage wd)
        opt (.timeouts mgr)
        baseUrl  "http://publib.boulder.ibm.com/"
        swd (com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium. wd baseUrl)] ;org.openqa.selenium.WebDriverBackedSelenium
    (try
    (.implicitlyWait opt 15000 java.util.concurrent.TimeUnit/MILLISECONDS)
    (.pageLoadTimeout opt 15000 java.util.concurrent.TimeUnit/MILLISECONDS)
    (.setScriptTimeout opt 15000 java.util.concurrent.TimeUnit/MILLISECONDS)
    (.setTimeout swd "15000")
    (.open swd "/infocenter/dzichelp/v2r2/index.jsp?topic=%2Fcom.ibm.db2z10.doc%2Fsrc%2Falltoc%2Fdb2z_10_prodhome.htm")
    (Thread/sleep 5000)
    (Thread/sleep 1000) (println 1)
    (.selectFrame swd "HelpFrame")
    (Thread/sleep 1000) (println 2)
		(.selectFrame swd "NavFrame")
    (Thread/sleep 1000) (println 3)
		(.selectFrame swd "ViewsFrame")
    (Thread/sleep 1000) (println 4)
		(.selectFrame swd "toc")
    (Thread/sleep 1000) (println 5)
		(.selectFrame swd "tocViewFrame")
    (Thread/sleep 1000) (println 6)
		(.click swd "id=/com.ibm.db2.doc/db2alltoc.xml")
    (Thread/sleep 4000) (println 7)
    (.waitForFrameToLoad swd "relative=up" "3000")
		(.selectFrame swd "relative=top")
    (Thread/sleep 1000) (println 8)
		(.selectFrame swd "HelpFrame")
    (Thread/sleep 1000) (println 9)
    (Thread/sleep 1000) (println 10)
    (Thread/sleep 1000) (println 11)
		(.selectFrame swd "ContentFrame")
    (Thread/sleep 1000) (println 12)
		(.selectFrame swd "ContentViewFrame")
    (Thread/sleep 1000) (println 13)
		(.click swd "xpath=//div[@id='footlinks']/a[2]/strong")
    (Thread/sleep 1000) (println 14)
		(.waitForPageToLoad swd "30000")
    (Thread/sleep 1000) (println 15)
		(.click swd "link=Copyright and trademark information")
    (Thread/sleep 1000) (println 16)
    (.quit wd)
    (Thread/sleep 1000) (println 17)
    (catch Exception e
      (.printStackTrace e)))))

(defn test-timeout [limit]
  (let [deltas [300 500 200 700 800 900 900 700 300 500]]
    (some #(= :TIMEOUT (deref (future (println %) (Thread/sleep %) %) limit :TIMEOUT)) deltas)))

;;waitForElementPresent
(comment let [p (param-builder drv par1)]
    (try
      (t/wait-until drv 
                    (fn [_]
                      (t/present? drv p))
                    timeout
                  1000)
      (catch Exception e
        (log/warn e)
        (throw (java.util.concurrent.TimeoutException. (str "Timeout waiting for element:" par1))))))

