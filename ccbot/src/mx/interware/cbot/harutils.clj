(ns mx.interware.cbot.harutils
  (:require
    [mx.interware.cbot.web.model.db :as db]
    [clojure.data.json   :as json]
    [clojure.java.jdbc   :as sql]))


;;  Modificaciones para leer el har
;;  get-entries: a partir de una ruta de un archivo har, 
;;  regresa las entries para obtener los tiempos de descarga de cada elemento. 
(defn get-page-data [path]
  (let [data (slurp path)
        m (json/read-json data)
        all-entries (-> m :log :entries)
        pages (first (-> m :log :pages))
        page-data {:inicio (-> pages :startedDateTime)
                   :carga_contenido (-> pages :pageTimings :onContentLoad)
                   :tiempo_carga (-> pages :pageTimings :onLoad)}
        entries all-entries
        ]
    {:page-data page-data :entries entries}
    )
  )

(defn timed-data [data]
  (let [t-data {(-> data :page-data :inicio) data}]
    t-data))
    
(defn get-har-files [har-directory]
  (let [dir (java.io.File. har-directory)
        archivos (.list dir)]
    (into () archivos)))

(defn del-file [file-name]
  (let [archivo (java.io.File. file-name)]
    (.delete archivo)))

(defn files-date [file]
  {(.lastModified file) (.getName file)})


(defn rename-1-file [file-name directory]
  (let [new-name (.substring file-name (+ 1 (.indexOf file-name "+")))
        f-name (str directory new-name)
        ext (.substring (.lastIndexOf f-name ".") f-name)
        archivo (java.io.File. f-name)
        old-file (java.io.File. (str directory file-name))
        ]
    (if (.exists archivo)
      (let [archivo (java.io.File. (str f-name "_1" ext))]
        (.renameTo old-file archivo))
      (.renameTo old-file archivo))
    ))




(defn rename-files [list-files directory]
  (let [dirs (repeat (count list-files) directory)]
    (map rename-1-file list-files dirs)))
        


(defn get-relevant-data [entry id_pagina]
  (let [response (-> entry :response)
        timings (-> entry :timings)
        url (-> entry :request :url)
        status (-> response :status)
        body-size (-> response :bodySize)
        content-type (-> response :content :mimeType)
        total-time (-> entry :time)
        time-blocked (-> timings :blocked)
        time-dns (-> timings :dns)
        time-connect (-> timings :connect)
        time-send (-> timings :send)
        time-receive (-> timings :receive)
        time-wait (-> timings :wait)
        relevant-data {:id_elem_pagina nil
                       :id_pagina id_pagina
                       :url url
                       :status status
                       :tamanyo body-size
                       :tipo_contenido content-type
                       :tiempo_total total-time
                       :tiempo_bloqueo time-blocked
                       :tiempo_dns time-dns
                       :tiempo_conexion time-connect
                       :tiempo_envio time-send
                       :tiempo_recepcion time-receive
                       :tiempo_espera time-wait}]
    relevant-data
    ))

(defn get-id [insert-result]
  (first (vals insert-result)))


(defn insert-page-data [page-data estado]
  (try
    (sql/with-db-transaction
      [con db/db]
      (let [id_pagina (sql/insert! :paginas (into {} (conj (-> page-data :page-data) [:nombre_estado estado] [:id_pagina nil])))
            id (get-id id_pagina)
            entries (-> page-data :entries)
            elems (map get-relevant-data entries (repeat (count entries) id))
            id_elems (apply sql/insert! con :elementos_pagina elems)
            ]
        [id_elems id_pagina]))
        (catch Exception ex
          (.printStackTrace ex))))

(def directory "har/")

(defn save-hars-to-db [directory, estados]
  (let [files-path (map (fn [file-name] (str directory file-name)) (get-har-files directory))
        page-data-list (map get-page-data files-path)
        timed-page-data (sort-by key (into {} (map timed-data page-data-list)))       
        ] 
    (doall (map insert-page-data (vals timed-page-data) estados))
    (map del-file files-path))
  )