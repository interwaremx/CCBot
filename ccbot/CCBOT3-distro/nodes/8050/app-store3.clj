{:version 4,
 :last-updated 1477690057770,
 :configuration
 {:Prueba
  {:states
   [{:conf-map {:opr "sleep-opr", :conf {:delta "3000"}},
     :key ":start",
     :flow {:y "100", :connect [":OS"], :x "100"}}
    {:conf-map
     {:retry-count "0",
      :logit "true",
      :conf {:shell "ls"},
      :timeout "0",
      :retry-delay "0",
      :opr "os-cmd-opr"},
     :flow {:connect [":SLEEP"], :x "241", :y "15"},
     :key ":OS"}
    {:flow {:y "95", :x "339", :connect [":start"]},
     :conf-map
     {:opr "sleep-opr", :logit "false", :conf {:delta "1000"}},
     :key ":SLEEP"}],
   :interstate-delay "1000",
   :instances {:Probando {:param-map {:- "-"}}},
   :stats-cache-len "100",
   :parameters {:- "-"}}},
 :node-conf {}}
