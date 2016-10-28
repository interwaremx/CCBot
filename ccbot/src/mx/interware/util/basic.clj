(ns mx.interware.util.basic
  (:import 
    (java.net URL URLConnection) 
    (java.io PrintWriter OutputStreamWriter OutputStream 
             InputStream BufferedReader InputStreamReader
             File FileWriter)
    (java.util.concurrent Future TimeUnit TimeoutException ExecutionException)
    (javax.mail Flags Flags$Flag Folder Message Session Store)
    (java.util Properties))
  (:require [clojure.java.io :as io]
            [clojure.tools.logging :as log]))

(do
  (println "loading " *ns*)) 

(defn to-long [n]
  (try
    (Long/parseLong (str n))
    (catch NumberFormatException e 0)))

(defn try-times*
  "Executes thunk. If an exception is thrown, will retry. At most n retries
  are done. If still some exception is thrown it is bubbled upwards in
  the call chain."
  [n delay thunk]
  (loop [n n]
    (if-let [result (try
                      (thunk)
                      (catch Exception e
                        (when (zero? n)
                          (throw e))
                        (when (> delay 0)
                          (Thread/sleep delay))))]
      result
      (recur (dec n)))))

(defmacro try-times
  "Executes body. If an exception is thrown, will retry. At most n retries
  are done. If still some exception is thrown it is bubbled upwards in
  the call chain."
  [n & body]
  `(try-times* ~n 0 (fn [] ~@body)))

(defmacro try-times-with-delay
  [n delay & body]
  `(try-times* ~n ~delay (fn [] ~@body)))

(defmacro with-catch-to-str [& form]
  `(try
     ~@form
     (catch Exception e#
       (log/error e#)
       (str (-> e# .getClass .getName) ":" (.getMessage e#)))))

(defn config-log4j 
  ([log-file-path]
    (let [logf (java.io.File. log-file-path)
          exist-log? (.exists logf)  
          logf-path (.getAbsolutePath logf)]
      (if exist-log?
        (do
          (println "Configuring log4j with file:" logf-path)
          (org.apache.log4j.xml.DOMConfigurator/configureAndWatch logf-path 60000))
        (do
          (println "file:" logf-path " does not exist, doing basic configuration for log4j")
          (org.apache.log4j.BasicConfigurator/configure)))))
  ([]
    (config-log4j "./log4j.xml")))

(defn create-mail-properties [host port ssl]
  (let [props (doto (java.util.Properties.)
                (.put "mail.smtp.host" host)
                (.put "mail.smtp.port" (str port))
                (.put "mail.smtp.socketFactory.port"  (str port))
                (.put "mail.smtp.auth" "true"))]
    (if (.equalsIgnoreCase (str ssl) "true")
      (doto props
        (.put "mail.smtp.socketFactory.class" "javax.net.ssl.SSLSocketFactory")))
    props))

(defn create-password-authenticator [user password]
  (proxy [javax.mail.Authenticator] []
    (getPasswordAuthentication []
                               (javax.mail.PasswordAuthentication.
                                user (str password)))))

(defn create-mail-sesion [host port ssl user password]
  (javax.mail.Session/getInstance
   (create-mail-properties host port ssl)
   (create-password-authenticator user password)))

(defn create-mime-message [host port ssl user password  subject text to-coll]
  (let [msg (doto (javax.mail.internet.MimeMessage. (create-mail-sesion host port ssl user password))
              (.setFrom (javax.mail.internet.InternetAddress. user))
              (.setSubject subject)
              (.setText text))]
    (doseq [to to-coll]
      (.addRecipients msg
                      (javax.mail.Message$RecipientType/TO)
                      (javax.mail.internet.InternetAddress/parse to)))
    msg))

(defn mail-it
  "\n\nFunction to send mail\nEj: (mail-it {:host \"smtp.gmail.com\" :port \"465\" :ssl \"true\"\n              :user \"fgerard@interware.com.mx\" :password \"*****\"\n              :to [\"fgerard@interware.com.mx\" \"otro@gmail.com\"]\n              :subject \"texto del subject\" :text \"texto mensaje\"})" 
  [{host :host port :port ssl :ssl password :password user :user
    to-coll :to subject :subject text :text :as mail}]
  (with-catch-to-str
    (log/debug "mail-it:  " (assoc mail :password "**********"))
    (javax.mail.Transport/send
     (create-mime-message host port ssl user password subject text to-coll))
    "Mail sent"))

(defn mail
  "\n\nFunction to send mail\nEj: (mail :host \"smtp.gmail.com\" :port \"465\" :ssl \"true\"\n          :user \"fgerard@interware.com.mx\" :password \"*****\"\n          :to [\"fgerard@interware.com.mx\" \"otro@gmail.com\"]\n          :subject \"texto del subject\" :text \"texto mensaje\")" 
  [& m]
  (mail-it (apply hash-map m)))

(defn- peel-reply [subject]
  (if (.startsWith subject "Re: ")
    (subs subject 4)
    subject))

(defn arr-to-str [sep arr]
  (reduce
   (fn [a b]
     (let [addr (str (.getAddress b))]
       (str (if (nil? a) addr (str a sep addr))))) nil arr))

(defn content2str [content]
  (subs (str ":" content) 1))

(defn extract-message-from-folder [folder idx]
  (let [msg (.getMessage folder idx)
        subject (.getSubject msg)]
    {:from (arr-to-str "," (.getFrom msg))
     :subject subject
     :content (content2str (.getContent msg)) 
     :msg msg})) 

(comment
  (def conf {:host "pop.gmail.com" :port 995 :protocol "pop3s" :email "fgerard@interware.com.mx"
             :password "*****" :debug false :cond-fn (fn [m] (.contains (:subject m) "UBM")) :folder "INBOX"})
  (get-mail conf))

(defn get-msg-match 
  ([folder cond-fn deleting]
  (loop [msgcount (.getMessageCount folder)
         n msgcount
         mmap (extract-message-from-folder folder n)]
    (log/debug (str n ") " (:subject mmap) (keys mmap)))
    (if (cond-fn mmap)
      (do
        (log/debug (str "se encontro:" (:subject mmap)))
        (if deleting (.setFlag (:msg mmap) Flags$Flag/DELETED true))
        (dissoc mmap :msg))
      (if (or (= n 1) (> (- msgcount n) 10))
        nil
        (recur msgcount (dec n) (extract-message-from-folder folder (dec n)))))))
  ([folder cond-fn]
    (get-msg-match false)))
    
(defn create-pop3-session 
  ([debuging]
  (let [session (Session/getInstance (Properties.) nil)]
    (.setDebug session debuging)
    session))
  ([]
  (create-pop3-session false)))

(defn get-pop3-store [session protocol host port email password]
  (println "1." host (class host))
  (println "2." port (class port))
  (println "3." email (class email))
  (println "4." session)
  (println "5." protocol (class protocol))
  (println "6." (.getStore session protocol))
  (doto (.getStore session protocol) (.connect host (Integer/parseInt (str port)) email password)))

(defn open-folder 
  ([store folder-name rw]
    (doto (.getFolder store folder-name) (.open (if rw Folder/READ_WRITE Folder/READ_ONLY))))
  ([store folder-name]
    (open-folder store folder-name false)))

(defn get-mail
  [{host :host port :port protocol :protocol email :email password :password folder-name :folder
    cond-fn :cond-fn debug :debug :or {debug false folder-name "inbox" protocol "pop3s"} :as pp}]
  (with-open [store (get-pop3-store 
                      (create-pop3-session debug) protocol host port email password)]
    (let [folder (open-folder store folder-name true)]
      (try
        (get-msg-match folder cond-fn true)
        (finally
           (.close folder true))))))

(defn get-mail-with-subject-matching 
  [{host :host port :port protocol :protocol email :email password :password folder-name :folder
    subject-re :subject-re debug :debug :or {debug false folder "INBOX" protocol "pop3s"} :as params}]
    (println "params:" params)
    (get-mail (assoc params :cond-fn (fn [m] (re-matches (re-pattern subject-re) (:subject m))))))

(defn get-mail-with-subject-in-set
  [host port protocol email password  subject-set]
  (get-mail {:host host :port port :protocol protocol
             :email email :password password 
             :cond-fn (fn [m] (subject-set (:subject m)))}))

(defn copy-bytes [input output buff-size]
  (let [buffer (make-array Byte/TYPE buff-size)]
    (loop []
      (let [size (.read input buffer)]
        (when (pos? size)
          (.write output buffer 0 size)
          (recur))))))

(defn get-audio-stream [file-path]
  (let [sound-file (java.io.File. file-path)]
    (javax.sound.sampled.AudioSystem/getAudioInputStream sound-file)))

(defn get-and-open-source-line [audio-stream]
  (let [audio-format (.getFormat audio-stream)
        info (javax.sound.sampled.DataLine$Info.
              (Class/forName "javax.sound.sampled.SourceDataLine") audio-format)]
    (doto (javax.sound.sampled.AudioSystem/getLine info) (.open audio-format) (.start))))

(defn play-soundOLD [file-path]
  (with-open [audio-stream (get-audio-stream file-path)
              source-line (get-and-open-source-line audio-stream) ]
    (copy-bytes audio-stream source-line 1024)
    (.drain source-line)))

(defn play-sound [file-path]
  (let [stream (javax.sound.sampled.AudioSystem/getAudioInputStream (java.io.File. file-path))
        format (.getFormat stream)
        info (javax.sound.sampled.DataLine$Info. javax.sound.sampled.Clip format)
        clip (javax.sound.sampled.AudioSystem/getLine info)]
    (.addLineListener clip (reify javax.sound.sampled.LineListener
                             (^void update [this ^javax.sound.sampled.LineEvent event]
                               (when (= javax.sound.sampled.LineEvent$Type/STOP (.getType event))
                                 (.close clip)))))
    (doto clip (.open stream) .start)))

(config-log4j)

