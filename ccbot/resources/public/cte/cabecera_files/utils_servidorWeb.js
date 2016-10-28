/*
 * Funcion JavaScript que envia datos plano a trav�s del servidor web
 */
var timeOutRecarga = null;
var maxTimeOutRecargar = 2000;


//Comprobamos en que navegador estamos
var ns = false;
var ie = false;

var n = navigator.appName;
if (n == 'Netscape') {
	ns = true;
} else if (n == 'Microsoft Internet Explorer') {
	ie = true;
}

var nombreArquitecturaAux = 'atcl';
try {
	if (nombreArquitectura == 'atlp') {
		nombreArquitecturaAux = nombreArquitectura;
	} else {
		nombreArquitecturaAux = 'atcl';
	}
} catch (e) {}


if (typeof servidorweb == "undefined") {
	servidorweb = this;
}

servidorweb.utils_servidorWeb_enviaPlano = function (newDatos, datosProcesados) {
	newDatos = newDatos.replace(/\+/g, "%2B");
	var parametros = "&datos=" + newDatos;
	if (datosProcesados != undefined) {
		parametros += "&datosProcesados=" + datosProcesados;
	}
	var url_base = "http://localhost:" + puertoServidorWeb + "/" + identificadorComunicacion;
	utils_servidorWeb_ejecutarPeticionAJAX(url_base, this.utils_servidorWeb_respuestaResultadoOperacion, null, "true", utils_servidorWeb_funcionError, parametros);
};


servidorweb.utils_servidorWeb_enviaPlanoXML = function (newDatos, datosProcesados, codificado) {

	var newDatos1 = utils_servidorWeb_encode64(newDatos);
	newDatos1 = newDatos1.replace(/\+/g, "%2B");
	var parametros = "&datos=" + newDatos1;
	if (codificado != undefined) {
		parametros += "&codificado=" + codificado;
	}
	if (datosProcesados != undefined) {
		parametros += "&datosProcesados=" + datosProcesados;
	}
	var url_base = "http://localhost:" + puertoServidorWeb + "/" + identificadorComunicacion;
	utils_servidorWeb_ejecutarPeticionAJAX(url_base, this.utils_servidorWeb_respuestaResultadoOperacion, null, "true", utils_servidorWeb_funcionError, parametros);
};

/*
	Funci�n que realiza
*/
servidorweb.utils_servidorWeb_enviaPlanoSinc = function (newDatos) {
	newDatos = newDatos.replace(/\+/g, "%2B");
	var parametros = "&sincrono=true&datos=" + newDatos;
	var url_base = "http://localhost:" + puertoServidorWeb + "/" + identificadorComunicacion;
	var resultado = utils_servidorWeb_ejecutarPeticionAJAX(url_base, null, null, "false", utils_servidorWeb_funcionError, parametros);
	return resultado;
};

var NUM_MAX_PARENT = 20;
/*
	Funci�n que se encarga de enviar la petici�n AJAX para ejecutar una operaci�n cuando se utiliza como medio de comunicacion el servidorWeb
*/
servidorweb.utils_servidorWeb_ejecutarOperacionNACAREscenario = function (opNACAR, parametros, escenario, tipoEjecucion, descripcion, puerto, entorno, parametrosAdicionales, servlet, ip, claveseguridad) {
	if (entorno == null || entorno == "" || entorno == "null") {

		if (utils_servidorWeb_obtenerPortal(window) == null)
			entorno = "pesado";
		else
			entorno = "ligero";
	} else {
		var entorno = entorno.toLowerCase();
	}


	if (entorno == "ligero") {
		if (opNACAR != null && opNACAR != "" && opNACAR != "null") {
			var portal = utils_servidorWeb_obtenerPortal(window);
			if (portal != null)
				portal.atpn_gt_crearTareaConDescripcionEscenario(escenario, opNACAR, descripcion, [parametros, tipoEjecucion]);
			else
				alert("No se ha ejecutado la operaci�n porque no se ha establecido comunicaci�n con el Portal");
		} else {
			var portal = utils_servidorWeb_obtenerPortal(window);
			if (portal != null)
				portal.atpn_gt_activarEscenario(escenario);
			else
				alert("No se ha ejecutado la operaci�n porque no se ha establecido comunicaci�n con el Portal");
		}
	} else {

		var archivoTXT = "";
		if (parametros != null && parametros != "null") {
			archivoTXT += "&" + parametros;
		}
		if (escenario != null && escenario != "null") {

			archivoTXT += "&escenario=" + escenario;
		}
		if (tipoEjecucion != null && tipoEjecucion != "null") {

			archivoTXT += "&tipoEjecucion=" + tipoEjecucion;
		}
		if (descripcion != null && descripcion != "null") {

			archivoTXT += "&descripcion=" + descripcion;
		}
		if (opNACAR != null && opNACAR != "" && opNACAR != "null") {

			archivoTXT += "&operacion=" + opNACAR;
		}
		if (claveseguridad != null && claveseguridad != undefined) {
			archivoTXT += "&claveseguridad=" + claveseguridad;
		}
		archivoTXT = "cabecera=CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR" + archivoTXT;
		var url = "";
		if (ip != null && ip != undefined && ip != "null") {
			url = "http://" + ip + ":" + puerto;
		} else {
			url = "http://localhost:" + puerto;
		}
		var url_base = url + "/";

		if ((servlet == null) || (servlet == undefined)) {
			url_base += "comunicacion";
		} else {
			url_base += servlet;
		}
		//Llamada a la funci�n que lanza la petici�n AJAX
		utils_servidorWeb_ejecutarPeticionAJAX(url_base, utils_servidorWeb_respuestaResultadoOperacion, "null", "true", utils_servidorWeb_funcionError, archivoTXT);
	}

};

servidorweb.utils_servidorWeb_ejecutarOperacionNACAREscenario_JSON = function (opNACAR, parametros, escenario, tipoEjecucion, descripcion, puerto, entorno, parametrosAdicionales, servlet, ip, claveseguridad, funcJsonp) {
	if (entorno == null || entorno == "" || entorno == "null") {
		if (utils_servidorWeb_obtenerPortal(window) == null)
			entorno = "pesado";
		else
			entorno = "ligero";
	} else {
		var entorno = entorno.toLowerCase();
	}


	if (entorno == "ligero") {
		if (opNACAR != null && opNACAR != "" && opNACAR != "null") {
			var portal = utils_servidorWeb_obtenerPortal(window);
			if (portal != null)
				portal.atpn_gt_crearTareaConDescripcionEscenario(escenario, opNACAR, descripcion, [parametros, tipoEjecucion], funcJsonp);
			else
				alert("No se ha ejecutado la operaci�n porque no se ha establecido comunicaci�n con el Portal");
		} else {
			var portal = utils_servidorWeb_obtenerPortal(window);
			if (portal != null)
				portal.atpn_gt_activarEscenario(escenario);
			else
				alert("No se ha ejecutado la operaci�n porque no se ha establecido comunicaci�n con el Portal");
		}
	} else {

		var archivoTXT = "";
		if (parametros != null && parametros != "null") {
			archivoTXT += "&" + parametros;
		}
		if (escenario != null && escenario != "null") {

			archivoTXT += "&escenario=" + escenario;
		}
		if (tipoEjecucion != null && tipoEjecucion != "null") {

			archivoTXT += "&tipoEjecucion=" + tipoEjecucion;
		}
		if (descripcion != null && descripcion != "null") {

			archivoTXT += "&descripcion=" + descripcion;
		}
		if (opNACAR != null && opNACAR != "" && opNACAR != "null") {

			archivoTXT += "&operacion=" + opNACAR;
		}
		if (claveseguridad != null && claveseguridad != undefined) {
			archivoTXT += "&claveseguridad=" + claveseguridad;
		}
		archivoTXT = "cabecera=CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR" + archivoTXT;
		var url = "";
		if (ip != null && ip != undefined && ip != "null") {
			url = "http://" + ip + ":" + puerto;
		} else {
			url = "http://localhost:" + puerto;
		}
		var url_base = url + "/";

		if ((servlet == null) || (servlet == undefined)) {
			url_base += "comunicacion";
		} else {
			url_base += servlet;
		}
		//Llamada a la funci�n que lanza la petici�n AJAX
		utils_servidorWeb_ejecutarPeticionAJAX(url_base, utils_servidorWeb_respuestaResultadoOperacion, "null", "true", utils_servidorWeb_funcionError, archivoTXT);
	}

};

//Debe estar en ajax.js o similar
servidorweb.utils_servidorWeb_funcionError = function (error) {
	//alert(error);
};
//Debe estar en ajax.js o similar
servidorweb.utils_servidorWeb_ejecutarPeticionAJAX = function (url, funcionRespuesta, parametros, sincAsinc, funcionError, archivoTXT) {

	var hacerPost = true;
	if (document.getElementById('frame_OPL') != null) {
		hacerPost = false;
	} else
	if (hacerPost) {
		//Obtener el objeto AJAX
		var req = utils_servidorWeb_getHTTPObject();

		try {

			if (sincAsinc == null) {
				//si el par�metro no viene informado, por defecto asincrono
				sincAsinc = true;
			}

			if ((funcionRespuesta == null) || (funcionRespuesta == undefined)) {
				//Si no se ha definido una funcion de respuesta se tratar� una petici�n sincrona en la que se devuelva directamente el resultado
				sincAsinc = false;
			}
			if (sincAsinc) {
				//Si la peticion es as�ncrona
				req.onreadystatechange = utils_servidorWeb_getReadyStateHandler(req, parametros, funcionRespuesta, funcionError);
			}


			req.open("POST", url, sincAsinc);

			req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			req.setRequestHeader("Pragma", "no-cache");
			req.setRequestHeader("Cache-Control", "no-cache");

			var valores = archivoTXT + "&hash=" + Math.random();

			req.send(valores);

			//Si la petici�n es sincrona devolvemos el resultado en el responseText de la request
			if (!sincAsinc) {
				return req.responseText;
			}
		} catch (e) {
			funcionError("Se ha producido el siguiente error: " + e.message);
			return;
		}
	}
}


// -------------------------------------------------------------------
// Funci�n que devuelve un objeto de tipo XMLHttpRequest (objeto AJAX)//
// -------------------------------------------------------------------
servidorweb.utils_servidorWeb_getHTTPObject = function () {

	var xmlhttp = false;

	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}

	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;

}


// -------------------------------------------------------------------------
// Funci�n que se llama cuando se recibe el evento de respuesta del servidor//
// -------------------------------------------------------------------------
servidorweb.utils_servidorWeb_getReadyStateHandler = function (req, control, funcionRespuesta, funcionError) {
	//Devuelve una funcion an�nima que escucha a la instancia XMLHttpRequest
	return function () {
		//Si el estado de la petici�n es COMPLETO
		if (req.readyState == 4) {
			//Se comprueba que se ha recibido una respuesta correcta
			if (req.status == 200) {

				if (funcionRespuesta == null) {
					//Si la funci�n no ha sido informada
					utils_servidorWeb_postEjecutar(control, req.responseText);
				} else {
					//Si se ha informado la funci�n
					funcionRespuesta(control, req.responseText);
				}
			} else {
				if ((req.status == 404) || (req.status == 12029)) {
					funcionError(control, req.responseText, true);
				} else if (req.responseText != "") {
					funcionError(control, req.responseText, false);
				}
			}
			req.onreadystatechange = function () {} //null produce un error de tipos en explorer 6
			req.abort();
			req = null;
		}
	}
}


// ---------------------------------------------------------------------------
// Funci�n que se ejecuta cuando no se ha especificado una funci�n por defecto//
// ---------------------------------------------------------------------------
servidorweb.utils_servidorWeb_postEjecutar = function (control, mensajeRespuesta) {
	try {
		if (utils_isComuServidorWeb()) {
			clearTimeout(timeOutRecarga);
		}
	} catch (err) {
		//alert('utils_servidorWeb_postEjecutar:'+err.message);
	}
};

// Funcion que captura la pulsacion de la tecla F5 y solicita la bajada de objetos de negocio
servidorweb.utils_servidorWeb_tratarF5 = function (puerto, entorno, ip, claveseguridad) {

	if (entorno == null || entorno == "" || entorno == "null") {

		if (utils_servidorWeb_obtenerPortal(window) == null)
			entorno = "pesado";
		else
			entorno = "ligero";
	} else {
		var entorno = entorno.toLowerCase();
	}

	if (entorno == "ligero") {
		archivoTXT = "";
		archivoTXT = "cabecera=CTE_BAJADA_OBJETOS_NEGOCIO";

		var portal = utils_servidorWeb_obtenerPortal(window);
		if (portal != null) {
			frame = utils_servidorWeb_obtenerObjetoNegocio();
			if (frame != null)
				frame = frame.location;
			portal.ejecutarPeticionAJAX(frame, utils_servidorWeb_trataEvento, "null", "true", utils_servidorWeb_funcionError, false);
		} else
			alert("No se ha realizado la bajada del objeto de negocio porque no se ha establecido comunicaci�n con el Portal");

		return false;
	} else {
		archivoTXT = "";
		archivoTXT = "cabecera=CTE_BAJADA_OBJETOS_NEGOCIO";
		var url = "";
		if (ip != null && ip != undefined && ip != "null") {
			url = "http://" + ip + ":" + puerto;
		} else {
			url = "http://localhost:" + puerto;
		}
		var url_base = url + "/comunicacion";
		if (claveseguridad != null && claveseguridad != undefined) {
			archivoTXT += "&claveseguridad=" + claveseguridad;
		}
		archivoTXT = archivoTXT.replace(/\+/g, "%2B");
		utils_servidorWeb_ejecutarPeticionAJAX(url_base, utils_servidorWeb_trataEvento, "null", "true", utils_servidorWeb_funcionError, archivoTXT);

		return false;
	}

};



// Objetos de negocio
// Funcion invocada ante la bajada de datos de objetos de negocio
servidorweb.utils_servidorWeb_trataEvento = function (control, evento) {



	if (!window.tratarBajadaObjetosNegocio) {
		return;
	}
	var elementos = evento.split("+");
	var claves1 = new Array();
	var valores1 = new Array();
	var j = 0;
	// Separamos claves y valores
	for (var i = 0; i < elementos.length; i++) {
		claves1[j] = elementos[i];
		i++;
		valores1[j] = elementos[i];
		j++;

	}

	// Llamada a la funcion que debera codificar el desarrollador
	tratarBajadaObjetosNegocio(claves1, valores1);

}


function utils_servidorWeb_respuestaResultadoOperacion(control, evento) {

	if (!window.obtenerResultadoOperacion) {
		return;
	}

	obtenerResultadoOperacion(evento);

}
// Funcion que solicita la subida de datos a objetos de negocio
servidorweb.utils_servidorWeb_subirObjetosNegocio = function (claves, valores, port, entorno, sincAsinc, ip, claveseguridad) {

	if (entorno == null || entorno == "" || entorno == "null") {

		if (utils_servidorWeb_obtenerPortal(window) == null)
			entorno = "pesado";
		else
			entorno = "ligero";
	} else {
		var entorno = entorno.toLowerCase();
	}



	if (entorno == "ligero") {
		var portal = utils_servidorWeb_obtenerPortal(window);
		if (portal != null)
			portal.atpn_gt_subirObjetosNegocio(claves, valores);
		else
			alert("No se han subido los datos al objeto de negocio porque no se ha establecido comunicaci�n con el Portal");
	} else {
		var archivoTXT = "&mensaje=";
		var puerto = port;
		// EL formato ser� clave1=*=valor1*+*clave2=*=valor2 ...
		var j = 0;
		for (var i = 0; i < claves.length; i++) {
			if (j > 0) {
				archivoTXT = archivoTXT + "+*+";
			}

			archivoTXT = archivoTXT + claves[i] + "=*=" + valores[i];
			j++;
		}

		var url_base = "";
		if (claveseguridad != null && claveseguridad != undefined) {
			archivoTXT += "&claveseguridad=" + claveseguridad;
		}
		// Usamos el conector de comunicaciones para transmitir la peticion
		archivoTXT = "cabecera=CTE_SUBIDA_OBJETOS_NEGOCIO" + archivoTXT;
		var url = "";
		if (ip != null && ip != undefined && ip != "null") {
			url = "http://" + ip + ":" + puerto;
		} else {
			url = "http://localhost:" + puerto;
		}
		url_base = url + "/comunicacion";
		archivoTXT = archivoTXT.replace(/\+/g, "%2B");
		if (sincAsinc == null || sincAsinc == undefined) {
			//Envia peticion sincrona
			utils_servidorWeb_ejecutarPeticionAJAX(url_base, null, null, false, utils_servidorWeb_funcionError, archivoTXT);
		} else {
			utils_servidorWeb_ejecutarPeticionAJAX(url_base, utils_servidorWeb_funcionRespuestaVacia, null, sincAsinc, utils_servidorWeb_funcionError, archivoTXT);
		}
	}

};

servidorweb.utils_servidorWeb_respuestaResultadoOperacion = function (control, evento) {

	if (!window.obtenerResultadoOperacion) {
		return;
	}

	obtenerResultadoOperacion(evento);

};

/**********************************************************************************
 * M�todo que se encarga de procesar la respuesta devuelta por el servidor web
 *********************************************************************************/
servidorweb.utils_servidorWeb_funcionRespuestaServidor = function (parametros, texto) {
	if (texto != "NOENVIAR") {
		if (texto.length > 0) {
			var datos = texto.split("#|#");
			var tipo = datos[0];
			var resultado = datos[1];
			switch (tipo) {
				case "RET_EJEC_LOCAL":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					tratarRetornoEjecucionLocal(resultado);
					break;
				case "EV_DISP":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					trataEvento(resultado);
					break;
				case "RET_EMUL_3270":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					tratarRetornoEmulacionLocal(resultado);
					break;
				case "CONT":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					tratarRetornoContenedor(resultado);
					break;
				case "CONTEXTO":
					//No se actualiza la peticion persistente ya que se va a modificar el document.
					documento_html = resultado;
					var cadena = "escribeDocumentoXSL()";
					setTimeout(cadena, 0);
					break;
				case "RESPUESTA_JUPITER":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					utils_servidorweb_procesarRespuestaJupiter(resultado);
					break;
				case "CIERRE_CONTROLADO_ASPA":
					utils_servidorWeb_iniciarComunicacionPersistente(parametros[0], parametros[1]);
					accionCierreControladoAspa();
					break;
			}
		} else {
			var cadena = "utils_servidorWeb_iniciarComunicacionPersistente(" + parametros[0] + "," + parametros[1] + ");";
			timeOutRecarga = setTimeout(cadena, maxTimeOutRecargar);
		}
	}
};

/****************************
 * M�todo ejecutado por el Servidor Web tras recibir un mensaje desde J�piter. Internamente a la funci�n, se realizar� una llamada 
 * a una funci�n JS aplicativa que ser� la que realice el tratamiento del mensaje "aplicacion_procesarRespuestaJupiter".
 ***************************/
servidorweb.utils_servidorweb_procesarRespuestaJupiter = function (mensaje) {

	//Se desbloquea la ventana 
	utils_servidorweb_desbloqueo();
	//Si se ha retornado respuesta, se forma el documento xml a partir de este.
	if (mensaje != undefined && mensaje != null && mensaje != "") {
		var xmlDoc = null;
		try //Internet Explorer
		{
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(mensaje);
		} catch (e) {
			try //Firefox, Mozilla, Opera, etc.
			{
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(mensaje, "text/xml");
			} catch (e) {
				alert(e.message)
			}
		}
		// Se llama al m�todo aplicativo que realiza el tratamiento de documento xml.
		if (xmlDoc != undefined && xmlDoc != null) {
			aplicacion_procesarRespuestaJupiter(xmlDoc);
		}
	}
}


/****************************
 * Realiza el envio de datos a J�piter. Es decir, deber� ser ejecutada por las aplicaciones ligeras cuando deseen enviar datos a J�piter.
 * Se enviar�n los datos del formulario NACAR formateados en un mensaje XML. Para ello, se apoyar� en la funci�n JavaScript
 * utils_servidorweb_componerContextoJupiter.
 * Adicionalmente, se dar� la posibilidadad de activar o no la tarea cuando esta reciba los datos. Por defecto no se activar�. 
 * Adem�s, se permitir� mediante un valor booleano la posibilidad de lanzar la petici�n de forma s�ncrona o, de forma as�ncrona.
 * Por defecto, la petici�n se realizar� de forma as�ncrona.      
 ***************************/
servidorweb.utils_servidorweb_envioContextoJupiter = function (activacion, sincrono) {
	var xml = utils_servidorweb_componerContextoJupiter();
	var comando = "CTE_ENVIO_DATOS_JUPITER";
	var activar = "";
	if (activacion != undefined && activacion == "true")
		activar = "<ACTIVAR_JUPITER>" + activacion + "</ACTIVAR_JUPITER>";
	// Si se trata de una petici�n s�ncrona, se realiza el bloqueo de la ventana. 
	if (sincrono != undefined && sincrono == "true")
		utils_servidorweb_bloqueo();
	utils_servidorWeb_enviaPlano(comando + activar + xml);
}

/****************************
 * Inicializa un di�logo que se mostrar� sobre la ventana con el f�n de bloquear la interacci�n con esta.
 ***************************/
servidorweb.utils_servidorweb_inicializarBloqueo = function () {
	var divBase = document.createElement("div");
	divBase.setAttribute("id", "capaTranslucida");
	with(divBase) {
		with(style) {
			backgroundColor = '#FFF';
			position = 'absolute';
			top = '0px';
			left = '0px';
			height = '100%';
			width = '100%';
			zIndex = '1000';
			display = 'block';
			opacity = '0.4';
			visibility = 'visible';
			filter = 'alpha(opacity=40)';
		}
	}
	var iframe = document.createElement("iframe");
	iframe.setAttribute("id", "iframeTranslucida");
	with(iframe) {
		with(style) {
			frameborder = '0';
			border = '0';
			margin = '0';
			top = '0px';
			left = '0px';
			height = '100%';
			width = '100%';
			visibility = 'visible';
		}
	}
	var div = document.createElement("div");
	div.setAttribute("id", "capaOpaca");
	with(div) {
		with(style) {
			position = 'absolute';
			top = '0px';
			left = '0px';
			height = '100%';
			width = '100%';
			zIndex = '1002';
			display = 'block';
			visibility = 'visible';
		}
	}
	var img = document.createElement("img");
	img.setAttribute("id", "imgCarga");
	img.setAttribute("src", "/" + nombreArquitecturaAux + "_es_web_pub/images/loadingajax.gif");
	with(img) {
		with(style) {
			position = 'absolute';
			top = '50%';
			left = '40%';
		}
	}
	div.appendChild(img);
	divBase.appendChild(iframe);
	document.body.appendChild(div);
	document.body.appendChild(divBase);
}

/****************************
 * Muestra un di�logo que bloquea la interacci�n con la aplicaci�n ligera.
 ***************************/
servidorweb.utils_servidorweb_bloqueo = function () {
	if (utils_isComuServidorWeb()) {
		var capa = document.getElementById("capaTranslucida");
		if (capa == undefined || capa == null) {
			utils_servidorweb_inicializarBloqueo();
		} else {
			capa.style.display = "block";
			capa.style.visibility = "visible";
			var capaOpaca = document.getElementById("capaOpaca");
			capaOpaca.style.display = "block";
			capaOpaca.style.visibility = "visible";
		}
	}
}

/****************************
 * Oculta el di�logo que bloquea la interacci�n con la aplicaci�n ligera.
 ***************************/
servidorweb.utils_servidorweb_desbloqueo = function () {
	var capa = document.getElementById("capaTranslucida");
	var capaOpaca = document.getElementById("capaOpaca");
	if (capa != undefined && capa != null) {
		capa.style.display = "none";
		capa.style.visibility = "hidden";
		capaOpaca.style.display = "none";
		capaOpaca.style.visibility = "hidden";
	}
}

/****************************
 * Recorrer� los campos del formulario de la aplicaci�n ligera comprobando los elementos que se corresponden con valores
 * de contexto para formar el xml de datos correspondiente.
 * Esta funci�n ser� privada a la librer�a, por lo que las aplicaciones no tendr�n que realizar su invocaci�n.       
 ***************************/
function generarContexto(formulario) {

	var numElementos = formulario.elements.length;
	var xmlContexto = "<DATOS>";
	for (i = 0; i < numElementos; i++) {
		//Cambio para compatibilidad entre Firefox e IE
		if (formulario.elements[i].getAttribute("CONTEXTO") != undefined && formulario.elements[i].getAttribute("CONTEXTO") != null) {
			//Cambio para compatibilidad entre Firefox e IE
			var tagapertura = "<" + formulario.elements[i].getAttribute("CONTEXTO") + ">";
			var contenido = formulario.elements[i].value;
			//Cambio para compatibilidad entre Firefox e IE
			var tagcierre = "</" + formulario.elements[i].getAttribute("CONTEXTO") + ">";
			xmlContexto = xmlContexto + tagapertura + contenido + tagcierre;
		}
	}
	return xmlContexto + "</DATOS>";

}


/****************************
 * Recorrer� los campos del formulario de la aplicaci�n ligera y, compondr� un mensaje XML con los datos de la aplicaci�n de la forma:
 * <FORM><ARQ><EVENTO>0x19DFAF</EVENTO><FLUJO>ATCLFLXXXXX454564654</FLUJO><VENTANA>ATAEVEXXXXX</VENTANA></ARQ>
 * <DATOS><CAMPO1>VALOR1</CAMPO1>...<CAMPOn>VALORn</CAMPOn></DATOS> 
 * Esta funci�n ser� privada a la librer�a, por lo que las aplicaciones no tendr�n que realizar su invocaci�n.       
 ***************************/
function utils_servidorweb_componerContextoJupiter() {

	var formulario = document.forms[0];
	var xmlEvento = "";
	var xmlFlujo = "";
	var xmlVentana = "";
	var xmlContexto = "";
	var xml = "";

	if (formulario.evento != undefined && formulario.evento != null && formulario.evento.value != undefined && formulario.evento.value != null) {
		xmlEvento = "<EVENTO>" + formulario.evento.value + "</EVENTO>";
	} else {
		xmlEvento = "<EVENTO></EVENTO>";
	}
	if (formulario.flujo != undefined && formulario.flujo != null && formulario.flujo.value != undefined && formulario.flujo.value != null) {
		xmlFlujo = "<FLUJO>" + formulario.flujo.value + "</FLUJO>";
	} else {
		xmlFlujo = "<FLUJO>" + "</FLUJO>";
	}
	if (formulario.ventana != undefined && formulario.ventana != null && formulario.ventana.value != undefined && formulario.ventana.value != null) {
		xmlVentana = "<VENTANA>" + formulario.ventana.value + "</VENTANA>";
	} else {
		xmlVentana = "<VENTANA>" + "</VENTANA>";
	}
	xmlContexto = generarContexto(formulario);
	xml = "<FORM>" + "<ARQ>" + xmlEvento + xmlFlujo + xmlVentana + "</ARQ>" + xmlContexto + "</FORM>";

	return xml;
}


servidorweb.utils_servidorWeb_funcionErrorXMLXSL = function (parametros, texto, notfound) {
	if (notfound) {
		var cadena = "utils_servidorWeb_iniciarComunicacionPersistente('" + parametros[0] + "','" + parametros[1] + "')";
		setTimeout(cadena, 1000);
	}
};


servidorweb.utils_servidorWeb_iniciarComunicacionPersistente = function (puerto, idPeticion) {
	var url = "http://localhost:" + puerto + "/" + idPeticion + "?tipo=persistente";
	var parametros = new Array(puerto, idPeticion);
	utils_servidorWeb_ejecutarPeticionAJAX(url, utils_servidorWeb_funcionRespuestaServidor, parametros, true, utils_servidorWeb_funcionErrorXMLXSL, null);
};


servidorweb.utils_servidorWeb_iniciaComunicacion = function () {
	try {
		if ((puertoServidorWeb > 0) && (identificadorComunicacion > 0)) {
			utils_servidorWeb_iniciarComunicacionPersistente(puertoServidorWeb, identificadorComunicacion);
		}
	} catch (err) {}
};

servidorweb.utils_servidorWeb_detenerComunicacion = function () {
	try {
		if ((puertoServidorWeb > 0) && (identificadorComunicacion > 0)) {
			clearTimeout(timeOutRecarga);
		}
	} catch (err) {}
};

/****************************
 * M�todo que se encarga de determinar si la comunicaci�n se realizar� a trav�s del servidor web, o bien a trav�s del plugin OCX
 ***************************/
servidorweb.utils_isComuServidorWeb = function () {
	var comuServidorWeb = false;

	try {
		//En primer lugar se comprueba que se ha inicializado la referencia al plugin.
		if (isComunicacionServidorWeb == true) {
			comuServidorWeb = true;
		}
	} catch (err1) {;
	}

	if (comuServidorWeb == false) {
		isComunicacionServidorWeb = false;
		identificadorComunicacion = 0;
		puertoServidorWeb = 0;
	}
	return comuServidorWeb;
};
/*************************************************************************************
 *
 *   Funciones para la sobrecarga del onload.
 *   En la Arquitectura ligera, estas funciones se encuentran en el utils.js 
 * 
 *************************************************************************************/
servidorweb.utils_servidorWeb_funcionesGeneralesAddOnLoad = function (function1, function2) {
	return function () {
		if (function1)
			function1();
		if (function2)
			function2();
	}
}

servidorweb.utils_servidorWeb_preEjecutarNACAR = function () {

	try {
		if (utils_isComuServidorWeb()) {
			//Si utilizamos el servidorWeb inicia la comunicaci�n    
			utils_servidorWeb_iniciaComunicacion();
			//Establece las funciones que se van a ejecutar en la finalizacion de la aplicacion ligera
			window.onunload = utils_servidorWeb_funcionesGeneralesAddOnLoad(utils_servidorWeb_postEjecutarNACAR, window.onunload);
		}
	} catch (err) {
		//    alert('Inicio servidor web:'+err.message);
	}
}
servidorweb.utils_servidorWeb_postEjecutarNACAR = function () {
	try {
		if (utils_isComuServidorWeb()) {
			utils_servidorWeb_detenerComunicacion();
		}
	} catch (err) {
		//alert('Fin servidor web:'+err.message);
	}
}

/****************************
 * M�todo que se encarga de determinar si la comunicaci�n se realizar� a trav�s del servidor web, o bien a trav�s del plugin OCX
 ***************************/
function utils_servidorWeb_isComuServidorWeb() {
	var comuServidorWeb = false;
	try {
		if ((puertoServidorWeb > 0) && (identificadorComunicacion > 0)) {
			comuServidorWeb = true;
			isComunicacionServidorWeb = true;
		}
	} catch (err1) {;
	}

	if (comuServidorWeb == false) {
		isComunicacionServidorWeb = false;
		identificadorComunicacion = 0;
		puertoServidorWeb = 0;
	}
	return comuServidorWeb;
}



/*Funcion de respuesta vacia utilizada para conseguir mantener el valor del par�metro sincAsinc en una petici�n AJAX, pues por defecto, 
 *si la funci�n respuesta es null o no est� definida el par�metro sincAsinc pasa a tener valor false (s�ncrno)
 */
servidorweb.utils_servidorWeb_funcionRespuestaVacia = function () {

}

function utils_servidorWeb_detenerComunicacionPersistente(puerto, idPeticion) {
	var url = "http://localhost:" + puerto + "/" + idPeticion + "?tipo=finpersistente";
	var parametros = new Array(puerto, idPeticion);
	//Se realiza una petici�n sincrona
	utils_servidorWeb_ejecutarPeticionAJAX(url, utils_servidorWeb_funcionRespuestaServidor, parametros, false, utils_servidorWeb_funcionErrorXMLXSL, null);
}

function escribeDocumentoXSL() {
	escribeDocument(documento_html);
}

utils_servidorWeb_preEjecutarNACAR();

var utils_servidorWeb_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function utils_servidorWeb_encode64(input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output + utils_servidorWeb_keyStr.charAt(enc1) + utils_servidorWeb_keyStr.charAt(enc2) +
			utils_servidorWeb_keyStr.charAt(enc3) + utils_servidorWeb_keyStr.charAt(enc4);
	} while (i < input.length);

	return output;
}

/****************************
 * Funci�n que realizar� el tratamiento del mensaje XML recibido desde Jupiter. Debera ser codificado desde la aplicaci�n.
 * Se deber�n basar en funciones de Arquitectura para realizar el tratamiento, como acceder a determinados campos de mensaje o formatearlos.
 ***************************/
servidorweb.aplicacion_procesarRespuestaJupiter = function (mensaje) {

}

/****************************
 * Funci�n que retorna la estructura de contexto asociada a una determinada clave. Por ejemplo, para la clave PAR.DATOS_SALIDA.USUARIO
 * puede devolver el c�digo de un determinado usuario, o por el contrario puede devolver la estructura asociada a �ste.
 * -USUARIO
 *      -NOMBRE
 *      -APELLIDOS
 *      -...   
 ***************************/
servidorweb.contexto_GetDatoXML = function (clave, documentoXML) {
	// Si no se informa la clave se finaliza.
	if (clave == null || documentoXML == null) {
		return;
	}

	var indice = 0;
	var i = 0;
	var parsea = new Array();
	var valorClave = null;

	//Se parsea la clave
	//Se recoge el indice del primer punto
	indice = clave.indexOf(".");
	while (indice != -1) {

		//Se recoge la parte de la clave
		parsea[i] = clave.substring(0, indice);

		//Se actualiza la clave
		clave = clave.substring(indice + 1, clave.length);

		indice = clave.indexOf(".");
		i++;
	}
	parsea[i] = clave;


	var numeroPartes = parsea.length;
	var raices = documentoXML.getElementsByTagName("contexto");

	if (raices.length > 0) {
		var raiz = raices[0];
		if (raiz.getElementsByTagName("datos")[0] != null) {
			raiz = raiz.getElementsByTagName("datos")[0];
			var indicePartes = 0;
			var nElementos = 0;
			while (indicePartes < numeroPartes) {
				nElementos = raiz.childNodes.length;
				for (i = 0; i < nElementos; i++) {
					if (raiz.childNodes.item(i).getAttribute("clave") == parsea[indicePartes] || raiz.childNodes.item(i).getAttribute("orden") == parsea[indicePartes]) {
						if (indicePartes == numeroPartes - 1) {
							if (raiz.childNodes.item(i).nodeName == "simple") {
								//El ultimo elemento es un dato simple
								valorClave = getTextFromItem(raiz.childNodes.item(i));
								indicePartes += 1;
							} else {
								//Si el ultimo elemento que ha metido no es simple
								//si no es un dato simple se devuelve el xml	
								valorClave = raiz.childNodes.item(i);
								indicePartes += 1;
							}
						} else {
							indicePartes += 1;
							raiz = raiz.childNodes.item(i);
						}
						break;
					}
				}

				if (i == nElementos) {
					valorClave = null;
					break;
				}
			} //Fin while
		}
	}
	return valorClave;
}

/****************************
 * Funci�n que transforma a un dato de tipo String la estructura de contexto XML pasada por par�metro.
 ***************************/
servidorweb.contexto_tostring = function (documentoXML) {
	var resultado = "";
	if (documentoXML != undefined && documentoXML != null) {
		if (ie) //Internet Explorer
		{
			resultado = documentoXML.xml;
		} else if (ns) {
			resultado = (new XMLSerializer()).serializeToString(documentoXML);
		}
	}
	return resultado;
}



// ----------------------------------------------------------------------------------------
// Funci�n que convierte a String la cabecera de una determinada etiqueta del documento XML//
// ----------------------------------------------------------------------------------------
servidorweb.inicioTag = function (documentoXML) {
	var atributos = "";
	var nombreNodo = documentoXML.nodeName;
	nombreNodo = nombreNodo.toString();
	for (var i = 0; i < documentoXML.attributes.length; i++) {
		var nombreAtributo = documentoXML.attributes.item(i).nodeName;
		nombreAtributo = nombreAtributo.toString();
		var valorAtributo = documentoXML.attributes.item(i).nodeValue;
		valorAtributo = valorAtributo.toString();
		if (nombreAtributo != "orden") {
			atributos = atributos + " " + nombreAtributo + '="' + valorAtributo + '"';
		} else {
			atributos = atributos + " " + nombreAtributo + '=' + valorAtributo;
		}
	}
	return "<" + nombreNodo + atributos + ">";
}

// -------------------------------------------------------------------------------------
// Funci�n que convierte a String el final de una determinada etiqueta del documento XML//
// -------------------------------------------------------------------------------------
servidorweb.finTag = function (documentoXML) {
	var nombreNodo = documentoXML.nodeName;
	return "</" + nombreNodo + ">"
}

// -------------------------------------------------------------------------------------------------------------
// Funci�n que recupera el texto de un item.
// -------------------------------------------------------------------------------------------------------------
servidorweb.getTextFromItem = function (item) {
	try { //internet explorer
		return item.text;
	} catch (e) { // mozilla
		try {
			return item.textContent;
		} catch (e2) {
			return;
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////
///FUNCIONES PROPIAS DEL PORTAL
//////////////////////////////////////////////////////////////////////////////////////////////

//Obtiene el objeto correspondiente a la ventana del Portal
function utils_servidorWeb_obtenerPortal(ventanaInicial) {

	var respuesta = 0;
	var ventana = ventanaInicial;
	var contador = 0;
	if (ventana.isEjecucionSobrePortal != null) {
		respuesta = 1;
		return ventana; //Portal recuperado
	}

	while (respuesta < 1) {
		if (contador == NUM_MAX_PARENT) {
			return null;
		} else {
			contador++;
		}
		if (ventana.parent != null) {
			if (ventana.parent.isEjecucionSobrePortal != null) {
				respuesta = 1;
				return ventana.parent; //Portal recuperado
			} else {
				if (ventana.parent.opener != null) {
					if (ventana.parent.opener.isEjecucionSobrePortal != null) {
						respuesta = 1;
						return ventana.parent.opener; //Portal recuperado
					} else {
						ventana = ventana.parent.opener;
					}
				} else {
					ventana = ventana.parent;
				}
			}
		} else {
			respuesta = 1;
			alert("No se ha recuperado la ventana del Portal");
			return null;
		}
	}
}

//Ejecuta una tarea 
function utils_servidorWeb_ejecutarTareaObjetoNegocio(nombre_tarea, url, urlDesconexion, tipo_tarea, objCliente) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_ejecutarTareaObjetoNegocio(nombre_tarea, url, urlDesconexion, tipo_tarea, objCliente);
	else
		alert("No se ha ejecutado la tarea porque no se ha establecido comunicaci�n con el Portal");
}

//Activa una tarea 
function utils_servidorWeb_activarTarea(idTarea, argumentos) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_activarTarea(idTarea, argumentos);
	else
		alert("No se ha activado la tarea porque no se ha establecido comunicaci�n con el Portal");
}
//Destruye tareas
function utils_servidorWeb_destruirTarea(idTarea, argumentos) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_destruirTareas(idTarea, argumentos);
	else
		alert("No se ha destruido la tarea porque no se ha establecido comunicaci�n con el Portal");
}
//Destruye las tareas de un escenario
function utils_servidorWeb_destruirTareasPorEscenario(codEscenario, argumentos) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_destruirTareasPorEscenario(codEscenario, argumentos);
	else
		alert("No se han destruido las tareas porque no se ha establecido comunicaci�n con el Portal");
}
//Modifica la descripci�n de una tarea
function utils_servidorWeb_modificarDescripcionAplicativa(idTarea, descripcion, argumentos) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_modificarDescripcionAplicativa(idTarea, descripcion, argumentos);
	else
		alert("No se ha modificado la descripci�n de la tarea porque no se ha establecido comunicaci�n con el Portal");

}
//Obtiene el identificador de la tarea activa
function utils_servidorWeb_getIDTareaActiva(argumentos) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_getIDTareaActiva(argumentos);
	else
		alert("No se ha obtenido el identificador de la tarea porque no se ha establecido comunicaci�n con el Portal");
}
//Obtiene el n�mero de tareas abiertas
function utils_servidorWeb_get_numero_tareas_abiertas() {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_get_numero_tareas_abiertas();
	else
		alert("No se ha obtenido el n�mero de tareas activas porque no se ha establecido comunicaci�n con el Portal");
}
//Activa un escenario
function utils_servidorWeb_activarEscenario(codEscenario) {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		portal.atpn_gt_activarEscenario(codEscenario);
	else
		alert("No se ha activado el escenario porque no se ha establecido comunicaci�n con el Portal");
}
//Devuelve el frame que contiene al objeto de negocio
function utils_servidorWeb_obtenerObjetoNegocio() {
	var portal = utils_servidorWeb_obtenerPortal(window);
	if (portal != null)
		return portal.atpn_gt_getFrameObjetoNegocio();
	else {
		alert("No se ha recuperado el objeto de negocio porque no se ha establecido comunicaci�n con el Portal");
		return null;
	}
}
//Obtiene el n�mero m�ximo de padres que se buscar�n para llegar a la ventana del portal
function utils_servidorWeb_getNumMaxParent() {
	return NUM_MAX_PARENT;
}
//Establece el n�mero m�ximo de padres que se buscar�n para llegar a la ventana del portal
function utils_servidorWeb_setNumMaxParent(numero) {
	NUM_MAX_PARENT = numero;
}



/**
 * Funci�n utilizada para utilizar el servicio de Mensajes de Arquitectura
 */
function utils_servidorWeb_EscribirMensaje(maquina, puerto, servlet, claveSeguridad, codigoMensaje, tipoMensaje, tipoDialogo, backEnd, mensaje) {

	var txURL = "http://" + maquina + ":" + puerto + "/" + servlet;

	var datosMensaje = {
		"codigoMensaje": codigoMensaje,
		"tipoMensaje": tipoMensaje,
		"tipoDialogo": tipoDialogo,
		"backEnd": backEnd,
		"mensaje": mensaje
	};
	var cadena = JSON.stringify(datosMensaje);
	txURL += '?datosMensaje=' + cadena + '&claveseguridad=' + claveSeguridad;
	var respuesta = utils_servidorWeb_ejecutarPeticionAJAX(txURL, utils_servidorWebRespuestaVacia);
}

function utils_servidorWebRespuestaVacia() {

}

// Funci�n que realiaza una llamada al serlet GUC para mostrar la ventana principal de los mensajes GUC
function utils_servidorWeb_mostrarMensajeGUCPesados(puertoServidorWeb) {
	var url_base = "http://localhost:" + puertoServidorWeb + "/mensajeGUC?";

	var cabecera = "valueCabecera=MOSTRAR_MENSAJE_GUC_PESADO";

	var resultado = utils_servidorWeb_ejecutarPeticionAJAX(url_base, null, null, "false", utils_servidorWeb_funcionErrorRespuestaGUC, cabecera);

	return resultado;
}

//Funcion que muestra un alert de error si no se ha podido mostrar la ventana principal GUC
function utils_servidorWeb_funcionErrorRespuestaGUC(mensajeError) {
	alert("Error mostrar mensaje GUC: " + mensajeError);
	return;
}