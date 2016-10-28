var literales_arrayLiteralesMultiidioma = new Array();
var literales_arrayLiteralesCastellano = new Array();
var literales_arrayLiteralesEuskera = new Array();
var literales_arrayLiteralesCatalan = new Array();
var literales_arrayLiteralesIngles = new Array();
var literales_arrayLiterales_en_gb = new Array();


//Definici�n de literales por locale
/*
		CASTELLANO
*/
//Literales del fichero utils.js en castellano		
literales_arrayLiteralesCastellano['UTILS_ERROR_DOJO'] = "Error al mostrar Mensaje Dojo";
literales_arrayLiteralesCastellano['CERRAR_MODAL'] = "Cerrar";
literales_arrayLiteralesCastellano['UTILS_MENSAJE_ORIGEN'] = "Mensaje origen: ";
literales_arrayLiteralesCastellano['UTILS_INFORM_OPER_ESCE'] = "Debe informar una operacion o un escenario a ejecutar";
literales_arrayLiteralesCastellano['UTILS_INFORM_OPER'] = "Debe informar una operacion a ejecutar";
literales_arrayLiteralesCastellano['UTILS_NO_OPER_FUERA'] = "No se permite realizar la ejecuci�n de una operaci�n NACAR \ndesde fuera del navegador Embebido";
literales_arrayLiteralesCastellano['UTILS_ERROR_INSERTAR_CELDA'] = "Error al insertar celda datos para la edici�n en fila: \n\"";
literales_arrayLiteralesCastellano['UTILS_ERROR_INSERTAR_CELDA2'] = "\"";
literales_arrayLiteralesCastellano['UTILS_DESCONEX_ESCR_PES'] = "utils_Desconexion para el escritorio pesado";
literales_arrayLiteralesCastellano['UTILS_MOSTRAR_DETALLES'] = "Mostrar detalles";
literales_arrayLiteralesCastellano['UTILS_OCULTAR_DETALLES'] = "Ocultar detalles";
//Literales del fichero utils_servidorweb.js en Castellano
literales_arrayLiteralesCastellano['UTSERV_NO_EJEC_OPER_COMU_PORTAL'] = "No se ha ejecutado la operaci�n porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_ERROR_AJAX'] = "Se ha producido el siguiente error: ";
literales_arrayLiteralesCastellano['UTSERV_NO_BAJADA_COMU_PORTAL'] = "No se ha realizado la bajada del objeto de negocio porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_SUBIDA_COMU_PORTAL'] = "No se han subido los datos al objeto de negocio porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_VENTANA_PORTAL'] = "No se ha recuperado la ventana del Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_TAREA_COMU_PORTAL'] = "No se ha ejecutado la tarea porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_ACTIVAR_TAREA_COMU_PORTAL'] = "No se ha activado la tarea porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_DESTRUIR_TAREA'] = "No se ha destruido la tarea porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_DESTRUIR_TAREAS'] = "No se han destruido las tareas porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_MODIF_DESC_COMU_PORTAL'] = "No se ha modificado la descripci�n de la tarea porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_ID_TAREA_COMU_PORTAL'] = "No se ha obtenido el identificador de la tarea porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_OBTENC_TAREAS_ACTIVAS'] = "No se ha obtenido el n�mero de tareas activas porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_ACT_ESCENARIO'] = "No se ha activado el escenario porque no se ha establecido comunicaci�n con el Portal";
literales_arrayLiteralesCastellano['UTSERV_NO_REC_OBJNEG'] = "No se ha recuperado el objeto de negocio porque no se ha establecido comunicaci�n con el Portal";
//Literales del fichero contenedores.js en Castellano
literales_arrayLiteralesCastellano['CONTE_VER_MAS'] = "Ver m�s";
literales_arrayLiteralesCastellano['CONTE_SIGUIENTE'] = "Siguiente";
literales_arrayLiteralesCastellano['CONTE_MINIMIZAR_RESTAURAR'] = "Minimizar/Restaurar contenedor";
literales_arrayLiteralesCastellano['CONTE_REFRESCAR'] = "Refrescar";
literales_arrayLiteralesCastellano['CONTE_CERRAR_CONTENEDOR'] = "Cerrar contenedor";
literales_arrayLiteralesCastellano['CONTE_INFORME_OPERACION'] = "Debe informar una operacion o un escenario a ejecutar";
literales_arrayLiteralesCastellano['CONTE_SIN_PERMISOS'] = "Sin permisos para ejecutar la operacion solicitada";
//Literales del fichero digitalizacion.js en Castellano
literales_arrayLiteralesCastellano['DIGI_FORMATO_NO_SOPORTADO'] = "Formato de imagen no soportado.";
literales_arrayLiteralesCastellano['DIGI_ERROR_ALIMENTADOR'] = "Se ha producido un error al tratar con el alimentador del esc�ner.";
literales_arrayLiteralesCastellano['DIGI_SELECCION_ESCANER'] = "No se ha podido seleccionar el esc�ner. Compruebe si est� apagado.";
literales_arrayLiteralesCastellano['DIGI_NUM_PAG_SUPERIOR'] = "Se ha especificado un n�mero superior de p�ginas a las que existen en el alimentador.";
literales_arrayLiteralesCastellano['DIGI_ESCANEO_CANCELADO'] = "Se ha cancelado el proceso de escaneo de la informaci�n.";
literales_arrayLiteralesCastellano['DIGI_FIN_DIGITALIZACION'] = "La digitalizaci�n ha concluido correctamente";
literales_arrayLiteralesCastellano['DIGI_ERROR_ESCANEO'] = "Error en el proceso de escaneo";
literales_arrayLiteralesCastellano['DIGI_FORMATO_NO_SOPORTADO_2'] = "Formato de imagen no soportado";
literales_arrayLiteralesCastellano['DIGI_FIN_DIGITALIZACION_2'] = "La digitalizaci�n ha concluido correctamente.";
literales_arrayLiteralesCastellano['DIGI_SIN_CHEQUES'] = "Dispositivo sin cheques.";
literales_arrayLiteralesCastellano['DIGI_ERROR_ALIMENTADOR_LS100'] = "Se ha producido un error al tratar con el alimentador del lector de cheques LS100.";
literales_arrayLiteralesCastellano['DIGI_LECTURA_CHEQUE_BANDA_OK'] = "Proceso de lectura de cheque y banda magn�tica ejecutado correctamente.";
literales_arrayLiteralesCastellano['DIGI_LECTURA_CHEQUE_OK'] = "Proceso de lectura de cheques ejecutada correctamente.";
literales_arrayLiteralesCastellano['DIGI_LECTURA_BANDA_OK'] = "Proceso de lectura de banda magn�tica ejecutado correctamente.";
literales_arrayLiteralesCastellano['DIGI_CANCELADO_USUARIO'] = "Cancelado por el usuario.";
literales_arrayLiteralesCastellano['DIGI_CHEQUE_BANDA'] = "leer banda y cheque";
//Literales del fichero ajax.js en Castellano
literales_arrayLiteralesCastellano['AJAX_FUNCION_ERROR'] = "Error al acceder a: ";
literales_arrayLiteralesCastellano['AJAX_OPER_NO_INFORMADA'] = "Operaci�n no informada";
literales_arrayLiteralesCastellano['AJAX_ERROR_PRODUCIDO'] = "Se ha producido el siguiente error: ";
//Literales del fichero funciones.xsl en castellano
literales_arrayLiteralesCastellano['LITERAL_RANGO'] = "Rango p�ginas";

literales_arrayLiteralesCastellano['AJAX_ERROR_HTTP_500'] = "HTTP 500 - Se ha producido un error interno en el servidor";
literales_arrayLiteralesCastellano['AJAX_ERROR_HTTP_404'] = "HTTP 404 - El servidor no encuentra el recurso solicitado";
literales_arrayLiteralesCastellano['AJAX_ERROR_HTTP_OTROS'] = "La petici�n ha devuelto un c�digo HTTP";
//literales del ev. cierre controlado de aspa
literales_arrayLiteralesCastellano['ASPA_VALOR_PARAM_NO_PERMITIDO'] = "Error: La funci�n javascript 'activarCierreControladoAspa' s�lo puede recibir los valores 'true' o 'false'";

/*
		CASTELLANO (en_GB)
*/
//Literales del fichero utils.js en en_gb		
literales_arrayLiterales_en_gb['UTILS_ERROR_DOJO'] = "Error showing Dojo Message";
literales_arrayLiterales_en_gb['CERRAR_MODAL'] = "Close";
literales_arrayLiterales_en_gb['UTILS_MENSAJE_ORIGEN'] = "source Message: ";
literales_arrayLiterales_en_gb['UTILS_INFORM_OPER_ESCE'] = "You must report a operation or a scenario";
literales_arrayLiterales_en_gb['UTILS_INFORM_OPER'] = "You must report an operation";
literales_arrayLiterales_en_gb['UTILS_NO_OPER_FUERA'] = "Is not allowed the execution of a NACAR operation \n from outside the embeded browser";
literales_arrayLiterales_en_gb['UTILS_ERROR_INSERTAR_CELDA'] = "Error inserting data for editing cell in row: \n\"";
literales_arrayLiterales_en_gb['UTILS_ERROR_INSERTAR_CELDA2'] = "\"";
literales_arrayLiterales_en_gb['UTILS_DESCONEX_ESCR_PES'] = "utils_Disconnection for heavy desktop";
literales_arrayLiterales_en_gb['UTILS_MOSTRAR_DETALLES'] = "show details";
literales_arrayLiterales_en_gb['UTILS_OCULTAR_DETALLES'] = "Hide Details";
//Literales del fichero utils_servidorweb.js en en_gb
literales_arrayLiterales_en_gb['UTSERV_NO_EJEC_OPER_COMU_PORTAL'] = "Not execute the operation because no communication has been established with the Portal";
literales_arrayLiterales_en_gb['UTSERV_ERROR_AJAX'] = "It has produced the following error: ";
literales_arrayLiterales_en_gb['UTSERV_NO_BAJADA_COMU_PORTAL'] = "There has been no downloaded the business object because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_SUBIDA_COMU_PORTAL'] = "No data were uploaded to the business object because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_VENTANA_PORTAL'] = "It has not recovered the Site window";
literales_arrayLiterales_en_gb['UTSERV_NO_TAREA_COMU_PORTAL'] = "Not execute the task because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_ACTIVAR_TAREA_COMU_PORTAL'] = "No task has been activated because no communication has been established with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_DESTRUIR_TAREA'] = "No task has been destroyed because it has not established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_DESTRUIR_TAREAS'] = "No tasks have been destroyed because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_MODIF_DESC_COMU_PORTAL'] = "No change the description of the task because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_ID_TAREA_COMU_PORTAL'] = "It hasnot obtained the ID of the task because it has established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_OBTENC_TAREAS_ACTIVAS'] = "It has not obtained the number of active tasks because they have established communication with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_ACT_ESCENARIO'] = "Not active stage because no communication has been established with the Portal";
literales_arrayLiterales_en_gb['UTSERV_NO_REC_OBJNEG'] = "Not recovered because the business object is not established communication with the Portal";
//Literales del fichero contenedores.js en en_gb
literales_arrayLiterales_en_gb['CONTE_VER_MAS'] = "See more";
literales_arrayLiterales_en_gb['CONTE_SIGUIENTE'] = "Next";
literales_arrayLiterales_en_gb['CONTE_MINIMIZAR_RESTAURAR'] = "Minimize / Restore container";
literales_arrayLiterales_en_gb['CONTE_REFRESCAR'] = "Refresh";
literales_arrayLiterales_en_gb['CONTE_CERRAR_CONTENEDOR'] = "Close container";
literales_arrayLiterales_en_gb['CONTE_INFORME_OPERACION'] = "You must report a transaction or a scenario to run";
literales_arrayLiterales_en_gb['CONTE_SIN_PERMISOS'] = "No permissions to execute the requested operation";
//Literales del fichero digitalizacion.js en en_gb
literales_arrayLiterales_en_gb['DIGI_FORMATO_NO_SOPORTADO'] = "Unsupported Image Format.";
literales_arrayLiterales_en_gb['DIGI_ERROR_ALIMENTADOR'] = "There was an error when trying to feed the scanner.";
literales_arrayLiterales_en_gb['DIGI_SELECCION_ESCANER'] = "Unable to select the scanner. Check if it's off.";
literales_arrayLiterales_en_gb['DIGI_NUM_PAG_SUPERIOR'] = "You specified a higher number of pages that exist in the feeder.";
literales_arrayLiterales_en_gb['DIGI_ESCANEO_CANCELADO'] = "It has canceled the scan process information.";
literales_arrayLiterales_en_gb['DIGI_FIN_DIGITALIZACION'] = "Digitization has been completed correctly";
literales_arrayLiterales_en_gb['DIGI_ERROR_ESCANEO'] = "Error in the scanning process";
literales_arrayLiterales_en_gb['DIGI_FORMATO_NO_SOPORTADO_2'] = "Unsupported Image Format";
literales_arrayLiterales_en_gb['DIGI_FIN_DIGITALIZACION_2'] = "Digitization has been completed correctly.";
literales_arrayLiterales_en_gb['DIGI_SIN_CHEQUES'] = "Device without checks.";
literales_arrayLiterales_en_gb['DIGI_ERROR_ALIMENTADOR_LS100'] = "There was an error in dealing with the LS100 feed reader checks.";
literales_arrayLiterales_en_gb['DIGI_LECTURA_CHEQUE_BANDA_OK'] = "Process of reading magnetic stripe check and properly executed.";
literales_arrayLiterales_en_gb['DIGI_LECTURA_CHEQUE_OK'] = "Cheks Reading process executed sucessfuly.";
literales_arrayLiterales_en_gb['DIGI_LECTURA_BANDA_OK'] = "Read swipe card process properly executed.";
literales_arrayLiterales_en_gb['DIGI_CANCELADO_USUARIO'] = "User abort.";
literales_arrayLiterales_en_gb['DIGI_CHEQUE_BANDA'] = "read band and check";
//Literales del fichero ajax.js en en_gb
literales_arrayLiterales_en_gb['AJAX_FUNCION_ERROR'] = "Error accessing: ";
literales_arrayLiterales_en_gb['AJAX_OPER_NO_INFORMADA'] = "Operation not reported";
literales_arrayLiterales_en_gb['AJAX_ERROR_PRODUCIDO'] = "It has produced the following error: ";
//Literales del fichero funciones.xsl en castellano
literales_arrayLiterales_en_gb['LITERAL_RANGO'] = "Page rank";


/*****************************************************/
/****      PORTAL ATPI                            ****/
/*****************************************************/
/*
		CASTELLANO
*/
//Literales del fichero AtpiAnadirFavoritos.js en Castellano		
literales_arrayLiteralesCastellano['ATPI_ANADIR_FAVORITO'] = "Se va a a�adir un nuevo Favorito a la combo de Mis Accesos, �Desea realizar la operaci�n?";
literales_arrayLiteralesCastellano['ATPI_NO_EXISTE_TAREA_ACTIVA'] = "Error: No existe una tarea activa";
literales_arrayLiteralesCastellano['ATPI_RESPUESTA_ERROR'] = "MensajeErrorAnadirAcceso:";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_0'] = "El servicio de gestion de favoritos retorna el c�digo {0} que corresponde a Inserci�n realizada correctamente.";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_10'] = "El servicio de gestion de favoritos retorna el c�digo {10} que corresponde a Los campos de entrada contienen caracteres inv�lidos ( # < > � � \ % )";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_20'] = "El servicio de gestion de favoritos retorna el c�digo {20} que corresponde a El campo COD_USURIO no est� informado en la entrada";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_21'] = "El servicio de gestion de favoritos retorna el c�digo {21} que corresponde a El campo XTI_ORIGEN no est� informado en la entrada";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_30'] = "El servicio de gestion de favoritos retorna el c�digo {30} que corresponde a Falta campos de entrada DES_OPESEGU_OPERACION";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_40'] = "El servicio de gestion de favoritos retorna el c�digo {40} que corresponde a COD_CARPKDAP  err�neo, no existe";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_50'] = "El servicio de gestion de favoritos retorna el c�digo {50} que corresponde a DES_OPESEGU_MENU err�neo, no existe";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_60'] = "El servicio de gestion de favoritos retorna el c�digo {60} que corresponde a DES_OPESEGU_OPERACION err�neo, no existe";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_70'] = "El servicio de gestion de favoritos retorna el c�digo {70} que corresponde a COD_USUARIO  supera la longitud m�xima permitida";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_71'] = "El servicio de gestion de favoritos retorna el c�digo {71} que corresponde a DES_OPESEGU_OPERACION  supera la longitud m�xima permitida";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_72'] = "El servicio de gestion de favoritos retorna el c�digo {72} que corresponde a DES_OPESEGU_MENU  supera la longitud m�xima permitida";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_73'] = "El servicio de gestion de favoritos retorna el c�digo {73} que corresponde a XTI_ORIGEN  supera la longitud m�xima permitida";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_100'] = "El servicio de gestion de favoritos retorna el c�digo {100} que corresponde a El registro ya existe en la base de datos";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_200'] = "El servicio de gestion de favoritos retorna el c�digo {200} que corresponde a No se ha podido realizar la inserci�n en la Base de Datos";
literales_arrayLiteralesCastellano['ATPI_RETORNO_FAVORITO_1'] = "La respuesta obtenida ante la petici�n de a�adir favoritos es incorrecta. No se a�adir� al conjunto de favoritos.";

//Literales del fichero atpiAreaAccesos.js en Castellano	
literales_arrayLiteralesCastellano['ATPI_MAX_FAVORITOS'] = "Se ha alcanzado el n�mero m�ximo de favoritos. No se pueden a�adir m�s favoritos.";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_0'] = "El servicio de gestion de favoritos retorna el c�digo {0} que corresponde a Consulta realizada correctamente";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_10'] = "El servicio de gestion de favoritos retorna el c�digo {10} que corresponde a El campo COD_USURIO no est� informado en la entrada";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_11'] = "El servicio de gestion de favoritos retorna el c�digo {11} que corresponde a El campo XTI_ORIGEN no est� informado en la entrada";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_12'] = "El servicio de gestion de favoritos retorna el c�digo {12} que corresponde a El campo IDIOMA no est� informado en la entrada";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_200'] = "El servicio de gestion de favoritos retorna el c�digo {200} que corresponde a No se ha podido realizar la consulta en la Base de Datos";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_300'] = "El servicio de gestion de favoritos retorna el c�digo {300} que corresponde a El usuario no tiene favoritos";
literales_arrayLiteralesCastellano['ATPI_RET_FAVORITOS_1'] = "El servicio de gestion de favoritos retorna el c�digo {300} que corresponde a El usuario no tiene favoritos";

//Literales del fichero atpiAreaMensajes.js en Castellano		
literales_arrayLiteralesCastellano['ATPI_SUSCRIBIR'] = "Suscripciones:";
literales_arrayLiteralesCastellano['ATPI_PUBLICAR'] = "Publicar";

//Literales del fichero AtpiCalendario.js en Castellano	
literales_arrayLiteralesCastellano['ATPI_MES_1'] = "Enero";
literales_arrayLiteralesCastellano['ATPI_MES_2'] = "Febrero";
literales_arrayLiteralesCastellano['ATPI_MES_3'] = "Marzo";
literales_arrayLiteralesCastellano['ATPI_MES_4'] = "Abril";
literales_arrayLiteralesCastellano['ATPI_MES_5'] = "Mayo";
literales_arrayLiteralesCastellano['ATPI_MES_6'] = "Junio";
literales_arrayLiteralesCastellano['ATPI_MES_7'] = "Julio";
literales_arrayLiteralesCastellano['ATPI_MES_8'] = "Agosto";
literales_arrayLiteralesCastellano['ATPI_MES_9'] = "Septiembre";
literales_arrayLiteralesCastellano['ATPI_MES_10'] = "Octubre";
literales_arrayLiteralesCastellano['ATPI_MES_11'] = "Noviembre";
literales_arrayLiteralesCastellano['ATPI_MES_12'] = "Diciembre";
literales_arrayLiteralesCastellano['ATPI_DIA_1'] = "domingo";
literales_arrayLiteralesCastellano['ATPI_DIA_2'] = "lunes";
literales_arrayLiteralesCastellano['ATPI_DIA_3'] = "martes";
literales_arrayLiteralesCastellano['ATPI_DIA_4'] = "mi�rcoles";
literales_arrayLiteralesCastellano['ATPI_DIA_5'] = "jueves";
literales_arrayLiteralesCastellano['ATPI_DIA_6'] = "viernes";
literales_arrayLiteralesCastellano['ATPI_DIA_7'] = "s�bado";
literales_arrayLiteralesCastellano['ATPI_SEPARADOR_DE'] = "  de  ";
literales_arrayLiteralesCastellano['ATPI_LITERALES_VARIABLES'] = new Array("{0}", "{1}", "{2}", "{3}");
literales_arrayLiteralesCastellano['ATPI_FORMATO_FECHA'] = "dd/mm/yyyy";
literales_arrayLiteralesCastellano['ATPI_FORMATO_FECHA_TOOLTIP'] = "{0}, {3} de {1} de {2}";

//Literales del fichero AtpiControlUrlParam.js en Castellano			
literales_arrayLiteralesCastellano['ATPI_ERROR'] = "ERROR..   ";
literales_arrayLiteralesCastellano['ATPI_NUM_PARAMS'] = "nNumeroParametros=";
literales_arrayLiteralesCastellano['ATPI_PARAMS_ENVIADOS'] = "par�metros enviados es";
literales_arrayLiteralesCastellano['ATPI_NO_COINCIDEN'] = " NO COINCIDEN";

//Literales del fichero AtpiGestorTareas_C.js en Castellano
literales_arrayLiteralesCastellano['ATPI_MENSAJE_CIERRE_TAREA'] = "Para abrir una nueva tarea se cerrar� la tarea n�mero @NUMERO@ ( @TAREA@ ) , �est� seguro?";
literales_arrayLiteralesCastellano['ATPI_MENSAJE_PAG_NO_PAGE'] = "Pagina de No Page";

//Literales del fichero AtpiGestorTareas_P.js en Castellano		
literales_arrayLiteralesCastellano['ATPI_CERRAR_TAREA_ACTIVA'] = "Cerrar Tarea Activa";
literales_arrayLiteralesCastellano['ATPI_ERROR_URL'] = "Error: la URL ";
literales_arrayLiteralesCastellano['ATPI_RECIBIDA_NO_VALIDA'] = " recibida no es valida";
literales_arrayLiteralesCastellano['ATPI_CLAVE_URL'] = "Clave URL: ";
literales_arrayLiteralesCastellano['ATPI_DESCONEXION'] = "Desconexi&oacute;n en proceso...";
literales_arrayLiteralesCastellano['ATPI_CERRANDO_TAREA'] = "cerrando tarea...";

//Literales del fichero AtpiPresentacionTareas.js en Castellano
literales_arrayLiteralesCastellano['ATPI_TAREA_PREFIJO'] = "Tarea: ";
literales_arrayLiteralesCastellano['ATPI_TAREA_SUFIJO'] = " Tareas";

//Literales del fichero AtpiPseudocodigo.js en Castellano
literales_arrayLiteralesCastellano['ATPI_ACCCESO_PSEUDO'] = "Acceso por c&oacute;digo";

//Literales del fichero AtpiValidacionEsceSel.js en Castellano
literales_arrayLiteralesCastellano['ATPI_ESCENARIO_ACTIVO'] = "El escenario que intenta seleccionar ya est� activo.";

//Literales del fichero botonesOWA.js en Castellano
literales_arrayLiteralesCastellano['ATPI_ERROR_OWA'] = "MensajeErrorOWA:";

//Literales del fichero depurador.js en Castellano	
literales_arrayLiteralesCastellano['ATPI_VENTANA_DEP'] = "Ventana de depuracion";
literales_arrayLiteralesCastellano['ATPI_NUEVA_DEP'] = "---------NUEVA DEPURACI�N------------";

//Literales del fichero multiidioma.js en Castellano			
literales_arrayLiteralesCastellano['ATPI_CERRAR_IDIOMA'] = "Si cambia de idioma se cerrar�n todas las tareas abiertas. �Seguro que desea cambiar el idioma?";
literales_arrayLiteralesCastellano['ATPI_CAMBIAR_IDIOMA'] = "�Seguro que desea cambiar el idioma?";

//Literales del fichero objCliente.js y objCliente_AGS.js en Castellano		
literales_arrayLiteralesCastellano['ATPI_OPERACION'] = "La operaci�n requiere de un ";
literales_arrayLiteralesCastellano['ATPI_OPERACION_OBJ'] = "La operaci�n requiere de objeto de negocio cliente, pero no est� disponible en el escenario";
literales_arrayLiteralesCastellano['ATPI_ESCENARIO_NO_OBJ'] = "El escenario no tiene objeto de negocio cliente.";

//Literales del fichero objetoCliente.js		
literales_arrayLiteralesCastellano['ATPI_ESCENARIO'] = "El escenario no contiene objeto de negocio cliente";

//Literales del fichero objetoNegocioNacar20.js
literales_arrayLiteralesCastellano['ATPI_SIN_PERMISOS'] = "Sin permisos para ejecutar la operacion";
literales_arrayLiteralesCastellano['ATPI_OP_NO_AUT'] = "Operacion no autorizada";

//Literales del fichero pestanas.js en Castellano			
literales_arrayLiteralesCastellano['ATPI_ACCESOS_RAPIDOS'] = "Accesos R\u00e1pidos";
literales_arrayLiteralesCastellano['ATPI_XML_MAL_FORMADO'] = "Xml mal formado";


/*
		en_gb
*/
//Literales del fichero AtpiAnadirFavoritos.js en en_gb		
literales_arrayLiterales_en_gb['ATPI_ANADIR_FAVORITO'] = "It will add a new bookmark to the combo of My Access, Do you want to perform the operation?";
literales_arrayLiterales_en_gb['ATPI_NO_EXISTE_TAREA_ACTIVA'] = "Error: There is no active task";
literales_arrayLiterales_en_gb['ATPI_RESPUESTA_ERROR'] = "MenssageErrorAddAccess:";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_0'] = "The bookmark management service returns the code {0} que corresponde a Inserci�n realizada correctamente.";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_10'] = "The bookmark management service returns the code {10} corresponding to input fields contain invalid characters ( # < > � � \ % )";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_20'] = "The bookmark management service returns the code {20} corresponding to COD_USURIO field is not reported in the entry";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_21'] = "The bookmark management service returns the code {21} corresponding to XTI_ORIGEN field is not reported in the entry";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_30'] = "The bookmark management service returns the code {30} corresponding to missing input fields DES_OPESEGU_OPERACION";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_40'] = "The bookmark management service returns the code {40} corresponding to COD_CARPKDAP wrong, No exist";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_50'] = "The bookmark management service returns the code {50} corresponding to DES_OPESEGU_MENU wrong, No exist";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_60'] = "The bookmark management service returns the code {60} corresponding to DES_OPESEGU_OPERACION  wrong, No exist";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_70'] = "The bookmark management service returns the code {70} corresponding to COD_USUARIO exceed the maximum length allowed";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_71'] = "The bookmark management service returns the code {71} corresponding to DES_OPESEGU_OPERACION exceeds the maximum length allowed";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_72'] = "The bookmark management service returns the code {72} corresponding to DES_OPESEGU_MENU exceeds the maximum length allowed";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_73'] = "The bookmark management service returns the code {73} corresponding to XTI_ORIGEN  exceeds the maximum length allowed";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_100'] = "The bookmark management service returns the code {100} corresponding to The record already exists in the database";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_200'] = "The bookmark management service returns the code {200} corresponding to Unable to perform the insertion in the Database";
literales_arrayLiterales_en_gb['ATPI_RETORNO_FAVORITO_1'] = "The response to the request to add favorites is incorrect. It is added to the set of bookmarks.";

//Literales del fichero atpiAreaAccesos.js en en_gb	
literales_arrayLiterales_en_gb['ATPI_MAX_FAVORITOS'] = "It has reached the maximum number of bookmarks. You can not add more bookmarks.";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_0'] = "The bookmark management service returns the code {0} que corresponde a Query executed OK";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_10'] = "The bookmark management service returns the code {10} corresponding to COD_USURIO field not filled";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_11'] = "The bookmark management service returns the code {11} corresponding to XTI_ORIGEN field not filled";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_12'] = "The bookmark management service returns the code {12} corresponding to IDIOMA field not filled";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_200'] = "The bookmark management service returns the code {200} corresponding to Unable to perform the query in the Database";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_300'] = "The bookmark management service returns the code {300} corresponding to The user has no bookmarks";
literales_arrayLiterales_en_gb['ATPI_RET_FAVORITOS_1'] = "The bookmark management service returns the code {300} corresponding to The user has no bookmarks";

//Literales del fichero atpiAreaMensajes.js en en_gb		
literales_arrayLiterales_en_gb['ATPI_SUSCRIBIR'] = "Subscriptions:";
literales_arrayLiterales_en_gb['ATPI_PUBLICAR'] = "Publish";

//Literales del fichero AtpiCalendario.js en en_gb	
literales_arrayLiterales_en_gb['ATPI_MES_1'] = "January";
literales_arrayLiterales_en_gb['ATPI_MES_2'] = "February";
literales_arrayLiterales_en_gb['ATPI_MES_3'] = "March";
literales_arrayLiterales_en_gb['ATPI_MES_4'] = "April";
literales_arrayLiterales_en_gb['ATPI_MES_5'] = "May";
literales_arrayLiterales_en_gb['ATPI_MES_6'] = "June";
literales_arrayLiterales_en_gb['ATPI_MES_7'] = "July";
literales_arrayLiterales_en_gb['ATPI_MES_8'] = "August";
literales_arrayLiterales_en_gb['ATPI_MES_9'] = "September";
literales_arrayLiterales_en_gb['ATPI_MES_10'] = "October";
literales_arrayLiterales_en_gb['ATPI_MES_11'] = "November";
literales_arrayLiterales_en_gb['ATPI_MES_12'] = "December";
literales_arrayLiterales_en_gb['ATPI_DIA_1'] = "sunday";
literales_arrayLiterales_en_gb['ATPI_DIA_2'] = "monday";
literales_arrayLiterales_en_gb['ATPI_DIA_3'] = "tuesday";
literales_arrayLiterales_en_gb['ATPI_DIA_4'] = "wednesday";
literales_arrayLiterales_en_gb['ATPI_DIA_5'] = "thursday";
literales_arrayLiterales_en_gb['ATPI_DIA_6'] = "friday";
literales_arrayLiterales_en_gb['ATPI_DIA_7'] = "saturday";
literales_arrayLiterales_en_gb['ATPI_SEPARADOR_DE'] = "  of  ";

//Literales del fichero AtpiControlUrlParam.js en Castellano			
literales_arrayLiterales_en_gb['ATPI_ERROR'] = "ERROR..   ";
literales_arrayLiterales_en_gb['ATPI_NUM_PARAMS'] = "nParamNumber=";
literales_arrayLiterales_en_gb['ATPI_PARAMS_ENVIADOS'] = "send parameters are";
literales_arrayLiterales_en_gb['ATPI_NO_COINCIDEN'] = " NOT AGREE";

//Literales del fichero AtpiGestorTareas_C.js en Castellano
literales_arrayLiterales_en_gb['ATPI_MENSAJE_CIERRE_TAREA'] = "To open a new task will close the task number @NUMERO@ ( @TAREA@ ) , are you sure?";
literales_arrayLiterales_en_gb['ATPI_MENSAJE_PAG_NO_PAGE'] = "No Page, page";

//Literales del fichero AtpiGestorTareas_P.js en Castellano		
literales_arrayLiterales_en_gb['ATPI_CERRAR_TAREA_ACTIVA'] = "close active task";
literales_arrayLiterales_en_gb['ATPI_ERROR_URL'] = "Error: the URL ";
literales_arrayLiterales_en_gb['ATPI_RECIBIDA_NO_VALIDA'] = " received is not valid";
literales_arrayLiterales_en_gb['ATPI_CLAVE_URL'] = "URL Password: ";
literales_arrayLiterales_en_gb['ATPI_DESCONEXION'] = "Disconnecting...";
literales_arrayLiterales_en_gb['ATPI_CERRANDO_TAREA'] = "closing tasks...";

//Literales del fichero AtpiPresentacionTareas.js en en_gb
literales_arrayLiterales_en_gb['ATPI_TAREA_PREFIJO'] = "Task: ";
literales_arrayLiterales_en_gb['ATPI_TAREA_SUFIJO'] = " Tasks";

//Literales del fichero AtpiPseudocodigo.js en en_gb
literales_arrayLiterales_en_gb['ATPI_ACCCESO_PSEUDO'] = "Code Access";

//Literales del fichero AtpiValidacionEsceSel.js en en_gb
literales_arrayLiterales_en_gb['ATPI_ESCENARIO_ACTIVO'] = "The selected scenario is already active.";

//Literales del fichero botonesOWA.js en en_gb
literales_arrayLiterales_en_gb['ATPI_ERROR_OWA'] = "OWAErrorMenssage:";

//Literales del fichero depurador.js en en_gb	
literales_arrayLiterales_en_gb['ATPI_VENTANA_DEP'] = "Debug window";
literales_arrayLiterales_en_gb['ATPI_NUEVA_DEP'] = "---------NEW DEBUG------------";

//Literales del fichero multiidioma.js en en_gb			
literales_arrayLiterales_en_gb['ATPI_CERRAR_IDIOMA'] = "If you change your language will close all the tasks. Are you sure you want to change the language?";
literales_arrayLiterales_en_gb['ATPI_CAMBIAR_IDIOMA'] = "Are you sure you want to change the language?";

//Literales del fichero objCliente.js y objCliente_AGS.js en Castellano		
literales_arrayLiterales_en_gb['ATPI_OPERACION'] = "The operation requires a ";
literales_arrayLiterales_en_gb['ATPI_OPERACION_OBJ'] = "The operation requires a customer business object, but is not available on stage";
literales_arrayLiterales_en_gb['ATPI_ESCENARIO_NO_OBJ'] = "The stage has no business to customer.";

//Literales del fichero objetoCliente.js		
literales_arrayLiterales_en_gb['ATPI_ESCENARIO'] = "The stage has no business to customer";

//Literales del fichero objetoNegocioNacar20.js
literales_arrayLiterales_en_gb['ATPI_SIN_PERMISOS'] = "No permissions to run the operation";
literales_arrayLiterales_en_gb['ATPI_OP_NO_AUT'] = "Unauthorized Operation";

//Literales del fichero pestanas.js en Castellano			
literales_arrayLiterales_en_gb['ATPI_ACCESOS_RAPIDOS'] = "Shortcuts";
literales_arrayLiterales_en_gb['ATPI_XML_MAL_FORMADO'] = "Malformed xml";

// Mensajes en otros IDIOMAS

//Literales del fichero AtpiCalendario.js en Euskera
literales_arrayLiteralesEuskera['ATPI_MES_1'] = "Urtarril";
literales_arrayLiteralesEuskera['ATPI_MES_2'] = "Otsail";
literales_arrayLiteralesEuskera['ATPI_MES_3'] = "Martxo";
literales_arrayLiteralesEuskera['ATPI_MES_4'] = "Apiril";
literales_arrayLiteralesEuskera['ATPI_MES_5'] = "Maiatz";
literales_arrayLiteralesEuskera['ATPI_MES_6'] = "Ekain";
literales_arrayLiteralesEuskera['ATPI_MES_7'] = "Uztail";
literales_arrayLiteralesEuskera['ATPI_MES_8'] = "Abuztu";
literales_arrayLiteralesEuskera['ATPI_MES_9'] = "Irail";
literales_arrayLiteralesEuskera['ATPI_MES_10'] = "Urri";
literales_arrayLiteralesEuskera['ATPI_MES_11'] = "Azaro";
literales_arrayLiteralesEuskera['ATPI_MES_12'] = "Abendu";
literales_arrayLiteralesEuskera['ATPI_DIA_1'] = "igande";
literales_arrayLiteralesEuskera['ATPI_DIA_2'] = "astelehen";
literales_arrayLiteralesEuskera['ATPI_DIA_3'] = "astearte";
literales_arrayLiteralesEuskera['ATPI_DIA_4'] = "asteazken";
literales_arrayLiteralesEuskera['ATPI_DIA_5'] = "ostegun";
literales_arrayLiteralesEuskera['ATPI_DIA_6'] = "ostiral";
literales_arrayLiteralesEuskera['ATPI_DIA_7'] = "larunbat";
literales_arrayLiteralesEuskera['ATPI_LITERALES_VARIABLES'] = new Array("{0}", "{1}", "{2}", "{3}");
literales_arrayLiteralesEuskera['ATPI_FORMATO_FECHA'] = "dd/mm/yyyy";
literales_arrayLiteralesEuskera['ATPI_FORMATO_FECHA_TOOLTIP'] = "{0}, {2}-ko {1} {3}-a";

//Literales del fichero AtpiCalendario.js en Catal�n
literales_arrayLiteralesCatalan['ATPI_MES_1'] = "gener";
literales_arrayLiteralesCatalan['ATPI_MES_2'] = "febrer";
literales_arrayLiteralesCatalan['ATPI_MES_3'] = "mar�";
literales_arrayLiteralesCatalan['ATPI_MES_4'] = "abril";
literales_arrayLiteralesCatalan['ATPI_MES_5'] = "maig";
literales_arrayLiteralesCatalan['ATPI_MES_6'] = "juny";
literales_arrayLiteralesCatalan['ATPI_MES_7'] = "juliol";
literales_arrayLiteralesCatalan['ATPI_MES_8'] = "agost";
literales_arrayLiteralesCatalan['ATPI_MES_9'] = "setembre";
literales_arrayLiteralesCatalan['ATPI_MES_10'] = "octubre";
literales_arrayLiteralesCatalan['ATPI_MES_11'] = "novembre";
literales_arrayLiteralesCatalan['ATPI_MES_12'] = "desembre";
literales_arrayLiteralesCatalan['ATPI_DIA_1'] = "diumenge";
literales_arrayLiteralesCatalan['ATPI_DIA_2'] = "dilluns";
literales_arrayLiteralesCatalan['ATPI_DIA_3'] = "dimarts";
literales_arrayLiteralesCatalan['ATPI_DIA_4'] = "dimecres";
literales_arrayLiteralesCatalan['ATPI_DIA_5'] = "dijous";
literales_arrayLiteralesCatalan['ATPI_DIA_6'] = "divendres";
literales_arrayLiteralesCatalan['ATPI_DIA_7'] = "dissabte";
literales_arrayLiteralesCatalan['ATPI_LITERALES_VARIABLES'] = new Array("{0}", "{1}", "{2}", "{3}");
literales_arrayLiteralesCatalan['ATPI_FORMATO_FECHA'] = "dd/mm/yyyy";
literales_arrayLiteralesCatalan['ATPI_FORMATO_FECHA_TOOLTIP'] = "{0}, {3} / {1} / {2}";

//Literales del fichero AtpiCalendario.js en Ingl�s
literales_arrayLiteralesIngles['ATPI_MES_1'] = "January";
literales_arrayLiteralesIngles['ATPI_MES_2'] = "February";
literales_arrayLiteralesIngles['ATPI_MES_3'] = "March";
literales_arrayLiteralesIngles['ATPI_MES_4'] = "April";
literales_arrayLiteralesIngles['ATPI_MES_5'] = "May";
literales_arrayLiteralesIngles['ATPI_MES_6'] = "June";
literales_arrayLiteralesIngles['ATPI_MES_7'] = "July";
literales_arrayLiteralesIngles['ATPI_MES_8'] = "August";
literales_arrayLiteralesIngles['ATPI_MES_9'] = "September";
literales_arrayLiteralesIngles['ATPI_MES_10'] = "October";
literales_arrayLiteralesIngles['ATPI_MES_11'] = "November";
literales_arrayLiteralesIngles['ATPI_MES_12'] = "December";
literales_arrayLiteralesIngles['ATPI_DIA_1'] = "Sunday";
literales_arrayLiteralesIngles['ATPI_DIA_2'] = "Monday";
literales_arrayLiteralesIngles['ATPI_DIA_3'] = "Tuesday";
literales_arrayLiteralesIngles['ATPI_DIA_4'] = "Wednesday";
literales_arrayLiteralesIngles['ATPI_DIA_5'] = "Thursday";
literales_arrayLiteralesIngles['ATPI_DIA_6'] = "Friday";
literales_arrayLiteralesIngles['ATPI_DIA_7'] = "Saturday";
literales_arrayLiteralesIngles['ATPI_LITERALES_VARIABLES'] = new Array("{0}", "{1}", "{2}", "{3}");
literales_arrayLiteralesIngles['ATPI_FORMATO_FECHA'] = "mm/dd/yyyy";
literales_arrayLiteralesIngles['ATPI_FORMATO_FECHA_TOOLTIP'] = "{0}, {1} {3}, {2}";
//Se a�ade el array de literales asociados al locale es_ES
literales_arrayLiteralesMultiidioma['es_ES'] = literales_arrayLiteralesCastellano;
literales_arrayLiteralesMultiidioma['eu_ES'] = literales_arrayLiteralesEuskera;
literales_arrayLiteralesMultiidioma['ca_ES'] = literales_arrayLiteralesCatalan;
literales_arrayLiteralesMultiidioma['en_US'] = literales_arrayLiterales_en_gb;
literales_arrayLiteralesMultiidioma['en_GB'] = literales_arrayLiterales_en_gb;

/***************************************************************************
 *    Funci�n encargada de devolver el literal seg�n el locale, �ste locale *
 *    es introducido desde arquitectura en una variable javascript. En caso *
 *    que el locale no est� definido se devolver� el literal en el locale   *
 *    es_ES. En el caso de que el locale sea "undefined" o null tambi�n se  *
 *    devuelve el locale es_ES                                              *
 ****************************************************************************/
function literales_traducirLiteralMultiidioma(clave) {

	if (locale_Arquitectura != undefined && locale_Arquitectura != null) {
		var arrayLiteralesMultiidioma = literales_arrayLiteralesMultiidioma[locale_Arquitectura];
		if (arrayLiteralesMultiidioma == undefined) {
			arrayLiteralesMultiidioma = literales_arrayLiteralesMultiidioma[localeDefecto_Arquitectura];
		}
	} else {
		var arrayLiteralesMultiidioma = literales_arrayLiteralesMultiidioma[localeDefecto_Arquitectura];
	}
	return arrayLiteralesMultiidioma[clave];
}