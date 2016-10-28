(ns mx.interware.cbot.web.starter
  ;(:import (mx.interware.iwcfdi ValidacionException PACException ComunicacionException))    
  (:require [mx.interware.cbot.web.server :as server]
            [mx.interware.util.basic :as basic]
            ;[mx.interware.iwcfdi.cancelacion]
            ;[mx.interware.iwcfdi.util-cfd :as UC]
            ))
 
(do
  (println "loading " *ns*)
  ;(basic/config-log4j)
  )

(comment
  -Djavax.net.ssl.trustStore=/keys/pv.jks 
  -Djavax.net.ssl.trustStorePassword=password
  
  )

(let [ip (-> (java.net.InetAddress/getLocalHost) (.getHostAddress))]
  (println "Initializing IWRobot for development")
  (println "fixing central IP to:" ip)
  
  (java.lang.System/setProperty "javax.net.debugx" "all")
  (java.lang.System/setProperty "com.sun.xml.internal.ws.transport.http.client.HttpTransportPipe.dumpx" "true")
  
  
  (server/main "-central" (str ip) 
               "-port" "8050" 
               "-port-central" "8050" 
               "-updatedb-xx" "TESTSQL.SQL"  
               "-use-running" "false"
               "-mod" "dev"))


