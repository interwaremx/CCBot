(defproject ccbot "3.2.2"
            :description "IWRobot clojure/javascript immutant version"
            :dependencies [[org.clojure/clojure "1.7.0"]
                           [noir "1.3.0-beta3"]
                           [org.clojure/tools.logging "0.3.1"]
                           [org.clojure/java.jdbc "0.4.2"]
                           [org.clojure/data.json "[0.1.2,)"]
                           [javax.mail/mail "[1.4.1,)", :exclusions [javax.activation/activation]]
                           [log4j "[1.2.16,)"]
                           [hiccup "1.0.5"]
                           [com.h2database/h2 "1.4.188"]
                           [ring-basic-authentication "0.0.1"]

                           [clj-webdriver "0.7.2"]
                           [org.seleniumhq.selenium/selenium-java "2.48.2"]
                           ;[net.info9/clj-webdriver "0.7.5"]

                           [jayq "2.5.4"]
                           [hiccups "[0.1.1,)"]
                           [org.clojure/clojurescript "[0.0-1424,)"]
                           ;[clj-http "0.5.5"]
                           ;[mysql/mysql-connector-java "[5.1.6,)"]
                           ;[rhino "[1.5R4,)"]
                           ;[com.oracle/ojdbc6 "11.2.0.3"]
                           ; para el iwcfd
                           [org.clojure/data.codec "0.1.0"]
                           ;
                           ;[iwcfdi/iwcfdi "1.0.0"]
                           [commons-digester/commons-digester "1.6"]
                           [xml-apis/xml-apis "[1.4.0,)"]
                           [commons-ssl/commons-ssl "1.0.0"]
                           ;[interfactura/interfactura "1.0.0"]
                           ;[mx.interware/wspacs "1.0.1"]
                           [org.clojure/data.csv "0.1.2"]

                           ;[buddy "0.7.2"]
                           [buddy/buddy-core "0.8.2"]
                           [org.clojure/data.codec "0.1.0"]
                           [clj-time "0.11.0"]
                           ]
            :aot [mx.interware.cbot.core
                  mx.interware.cbot.web.server
                  mx.interware.cbot.web.views.users
                  ]
             :uberjar {:aot :all}
;;            :main  mx.interware.cbot.web.server
;            :plugins [[lein-cljsbuild "0.3.2"]]
;            :source-paths ["src" "cljssrc"]
;            :jar-exclusions [#"(?:^|/)CVS/"]
            :immutant {:resolve-dependecies true
;                       ;:lein-profiles [:dev :clj15]
;                       ;:swank-port 4242
;                       :nrepl-port 4343
;                       ;:init 'my.app/init
                       :context-path "/"
;                       ;:virtual-host "192.168.1.7";"foo.host"
                       }
;            :cljsbuild {:builds 
;                        [{; The path to the top-level ClojureScript source directory:
;                          :source-paths ["cljssrc/mx/interware/cljs/"]
;                          ; The standard ClojureScript compiler options:
;                          ; (See the ClojureScript compiler documentation for details.)
;                          :compiler {:output-to "resources/public/js/ccbot3.js"  ; default: target/cljsbuild-main.js
;                                     :optimizations :whitespace
;                                     ;:pretty-print true
;                                     }}]}
            )


