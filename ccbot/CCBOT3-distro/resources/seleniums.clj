{:hoy-prod
 {:cmds
  [{:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}],
  :title "hoy",
  :url "https://eco.intranet.com.mx/"},
 :mi-gestion-completa
 {:cmds 
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}
   {:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "link=Mi Gestión", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=contenedor720", :cmd :waitForElementPresent}
   {:p1 "id=contenedor35", :cmd :waitForElementPresent}
   {:p1 "id=contenedor355", :cmd :waitForElementPresent}
   {:p1 "id=GraficaAjax", :cmd :waitForElementPresent}
   {:p1 "id=EMTContenedor", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :click}],
  :title "mi-gestion-completa",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :contratacion-prod
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-contratacion", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Contratación", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fprincipal", :cmd :selectFrame}
   {:p1 "id=cmb_Familia", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}],
  :title "contratacion",
  :url "https://eco.intranet.com.mx/"},
 :logout
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :clickAndWait}],
  :title "logout",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :consulta-cliente-completa
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}
   {:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 "81281108", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :click}],
  :title "consulta-cliente-completa",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :login
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}],
  :title "login",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :contratacion-completa
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}
   {:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 "81281108", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Contratación", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fprincipal", :cmd :selectFrame}
   {:p1 "id=cmb_Familia", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :click}],
  :title "contratacion-completa",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :login-prod
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}],
  :title "login",
  :url "https://eco.intranet.com.mx/"},
 :logout-prod
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :clickAndWait}],
  :title "logout",
  :url "https://eco.intranet.com.mx/"},
 :hoy-completa
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}
   {:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :click}],
  :title "hoy-completa",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :contratacion
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-contratacion", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Contratación", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fprincipal", :cmd :selectFrame}
   {:p1 "id=cmb_Familia", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}],
  :title "contratacion",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :ficha-cliente-prod
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-ficha-cliente", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Ficha Cliente", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab2", :cmd :waitForElementPresent}],
  :title "ficha-cliente",
  :url "https://eco.intranet.com.mx/"},
 :hoy
 {:cmds
  [{:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}],
  :title "hoy",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :mi-gestion
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "link=Mi Gestión", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=contenedor720", :cmd :waitForElementPresent}
   {:p1 "id=contenedor35", :cmd :waitForElementPresent}
   {:p1 "id=contenedor355", :cmd :waitForElementPresent}
   {:p1 "id=GraficaAjax", :cmd :waitForElementPresent}
   {:p1 "id=EMTContenedor", :cmd :waitForElementPresent}],
  :title "mi-gestion",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :mi-gestion-prod
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "link=Mi Gestión", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=contenedor720", :cmd :waitForElementPresent}
   {:p1 "id=contenedor35", :cmd :waitForElementPresent}
   {:p1 "id=contenedor355", :cmd :waitForElementPresent}
   {:p1 "id=GraficaAjax", :cmd :waitForElementPresent}
   {:p1 "id=EMTContenedor", :cmd :waitForElementPresent}],
  :title "mi-gestion",
  :url "https://eco.intranet.com.mx/"},
 :consulta-cliente-prod
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-consulta-cliente", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}],
  :title "consulta-cliente",
  :url "https://eco.intranet.com.mx/"},
 :consulta-cliente
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-consulta-cliente", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}],
  :title "consulta-cliente",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :ficha-cliente-completa
 {:cmds
  [{:p1 "/sinecd_mx_web/sinecd_mx_web/PortalLogon", :cmd :open}
   {:p1 "name=username", :p2 ":login-username", :cmd :type}
   {:p1 "name=password", :p2 ":login-password", :cmd :type}
   {:p1 "name=entrar", :cmd :clickAndWait}
   {:p1 "name=instancia", :cmd :selectWindow}
   {:p1 "id=btnKeonMensaje1", :cmd :waitForElementPresent}
   {:p1 "id=btnKeonMensaje1", :cmd :click}
   {:p1 "id=hdCOD_PERFIL_GESTOR_E", :cmd :waitForElementPresent}
   {:p1 "id=hdCr", :cmd :waitForElementPresent}
   {:p1 "id=tabCitas", :cmd :waitForElementPresent}
   {:p1 "id=hdNopags", :cmd :waitForElementPresent}
   {:p1 "id=hdBanco", :cmd :waitForElementPresent}
   {:p1 "id=hdMasDatos", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 "81281108", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Ficha Cliente", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab2", :cmd :waitForElementPresent}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "FESTADO", :cmd :selectFrame}
   {:p1 "link=Salir", :cmd :click}],
  :title "ficha-cliente-completa",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :ficha-cliente
 {:cmds
  [{:p1 "relative=top", :cmd :selectFrame}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "cambiarCriterioBusqueda(8); ocultarLista(0);",
    :cmd :runScript}
   {:p1 "id=captura0", :p2 ":cliente-ficha-cliente", :cmd :type}
   {:p1 "id=Boton", :cmd :click}
   {:p1 "30000", :cmd :waitForPageToLoad}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab1", :cmd :waitForElementPresent}
   {:p1 "Fcabecera", :cmd :selectFrame}
   {:p1 "ObjetosNegocio", :cmd :selectFrame}
   {:p1 "link=Ficha Cliente", :cmd :click}
   {:p1 "relative=top", :cmd :selectFrame}
   {:p1 "id=hdIDCUAPU", :cmd :waitForElementPresent}
   {:p1 "id=HDIMP_ACTIVO", :cmd :waitForElementPresent}
   {:p1 "id=hdNumfila", :cmd :waitForElementPresent}
   {:p1 "id=hdCodError", :cmd :waitForElementPresent}
   {:p1 "id=tab2", :cmd :waitForElementPresent}],
  :title "ficha-cliente",
  :url "https://ecoc.intranet.com.mx:7443/"},
 :test-interware
 {:cmds
  [{:p1 "id=UIPortalApplication", :cmd :waitForElementPresent}],
  :title "test",
  :url "http://www.interware.com.mx/"}}