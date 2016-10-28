var nombreArquitecturaAux = 'atcl';
try {
	if (nombreArquitectura == 'atlp') {
		nombreArquitecturaAux = nombreArquitectura;
	} else {
		nombreArquitecturaAux = 'atcl';
	}
} catch (e) {}


ns = (document.layers) ? true : false;
ie = (document.all) ? true : false;

if (ie) {


	var sc = document.createElement('script');
	sc.setAttribute('src', '/' + nombreArquitecturaAux + '_es_web_pub/js/base64.js');
	sc.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(sc);

	var sc = document.createElement('script');
	sc.setAttribute('src', '/' + nombreArquitecturaAux + '_es_web_pub/js/funcionesIE.js');
	sc.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(sc);

} else {

	var sc = document.createElement('script');
	sc.setAttribute('src', '/' + nombreArquitecturaAux + '_es_web_pub/js/base64.js');
	sc.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(sc);

	var sc = document.createElement('script');
	sc.setAttribute('src', '/' + nombreArquitecturaAux + '_es_web_pub/js/funcionesNS.js');
	sc.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(sc);
}


//Declaracion de variables globales
var parametros = new Array;
var operacion = null;
var usuario = null;


function setParametrosEntrada(clave, valor) {
	var dato = new Array;
	dato[0] = clave;

	dato[1] = valor;

	//Se a�ade un elemento al array de par�metros
	parametros.push(dato);

	if (clave == "OPERACION") {
		//Si se ha informado la operaci�n
		operacion = valor;

	} else if (clave == "USUARIO") {
		//Si se ha informado el usuario
		usuario = valor;
	}

}


// -----------------------------------
// Funci�n que compone el mensaje XML //
// -----------------------------------
function preEjecutar() {

	//Descompone el array de par�metros y genera el mensaje XML

	var mensaje = '<?xml version="1.0" encoding="ISO-8859-1"?>';
	mensaje += "<mensaje>";

	while (parametros.length > 0) {

		mensaje += serializaDato(parametros.pop());
	}


	mensaje += "</mensaje>";

	return mensaje;

}

// -----------------------------------
// Funci�n que compone el mensaje JSON //
// -----------------------------------
function preEjecutarJSON() {

	//Descompone el array de par�metros y genera el mensaje JSON
	var mensaje = '{';
	while (parametros.length > 0) {
		mensaje += serializaDatoJSON(parametros.pop());
		mensaje += ",";
	}
	mensaje = mensaje.slice(0, -1)
	mensaje += "}";

	return mensaje;


}

// -----------------------------------
// Funci�n que serializa un dato //
// -----------------------------------
function serializaDato(dato) {

	return "<" + dato[0] + ">" + dato[1] + "</" + dato[0] + ">";

}
// -----------------------------------
// Funci�n que serializa un dato //
// -----------------------------------
function serializaDatoJSON(dato) {

	return '\"' + dato[0] + '\":\"' + dato[1] + '\"';

}

// ---------------------------------------
// Funci�n que ejecuta la operaci�n NACAR con cierre o no de sesi�n//
// ---------------------------------------
function ejecutarOperacionNACAR(control, funcionRespuesta, aplicacionNacar, sesion, asincrono) {
	if (sesion == null || sesion == true || sesion > 2) {
		sesion = 1;
	} else if (sesion == false) {
		sesion = 0;
	}
	if (asincrono == null)
		asincrono = false;

	//Se obtiene el mensaje XML
	var mensajeXML = preEjecutar();

	//Formar la url (direcci�n del servlet canal http/Xml + mensaje XML codificado en base 64 + sesion + hash)
	if (dir_base != null) {
		var url = dir_base;
	}

	if (aplicacionNacar == null) {
		if (aplicacion != "") {
			url = url + "/" + aplicacion;
		}
	} else {
		if (aplicacionNacar != "") {
			url = url + "/" + aplicacionNacar;
		}
	}

	var url_base = url + "/servlet/ServletOperacionWebXML";
	var valores = "MENSAJE=" + escape(encode64(mensajeXML)) + "&sesion=" + sesion + "&hash=" + Math.random();

	//Obtener el objeto AJAX

	var req = getHTTPObject();

	//Realizar la petici�n AJAX

	if (operacion != null) {
		//Si se ha informado la operaci�n (obligatorio)
		req.onreadystatechange = getReadyStateHandler(req, control, funcionRespuesta);

		if (metodoFormu == "POST") {
			try {
				req.open("POST", url_base, asincrono);
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

				if (typeof (nacarContext) != "undefined") {
					req.send(valores + "&NACARCONTEXT=" + nacarContext);
				} else {
					req.send(valores);
				}
			} catch (e) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_FUNCION_ERROR') + url_base);
				return;
			}
		} else {
			try {
				if (typeof (nacarContext) != "undefined") {
					req.open("POST", url_base + "?" + valores, asincrono);
					req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					req.send("NACARCONTEXT=" + nacarContext);
				} else {
					req.open("GET", url_base + "?" + valores, asincrono);
					req.send(null);
				}
			} catch (e) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_FUNCION_ERROR') + url_base);
				return;
			}
		}
	} else {
		//NO se ha informado la operaci�n
		funcionError(literales_traducirLiteralMultiidioma('AJAX_OPER_NO_INFORMADA'));
	}
}

// ---------------------------------------
// Funci�n que ejecuta la operaci�n NACAR con cierre o no de sesi�n//
// ---------------------------------------
function ejecutarOperacionNACARJSON(control, funcionRespuesta, aplicacionNacar, sesion, asincrono, estructFormateo, funcjsonp, contextoOpJSON, estructDeformateo, operacionEjecutar, nombreRaiz) {
	if (sesion == null || sesion == true || sesion > 2) {
		sesion = 1;
	} else if (sesion == false) {
		sesion = 0;
	}
	if (asincrono == null)
		asincrono = false;

	//Se obtiene el mensaje JSON
	var mensaje = preEjecutarJSON();

	//Formar la url (direcci�n del servlet canal http/Xml + mensaje XML codificado en base 64 + sesion + hash)
	if (dir_base != null) {
		var url = dir_base;
	}

	if (aplicacionNacar == null) {
		if (aplicacion != "") {
			url = url + "/" + aplicacion;
		}
	} else {
		if (aplicacionNacar != "") {
			url = url + "/" + aplicacionNacar;
		}
	}
	var url_base = url + "/servlet/ServletOperacionWebJSON";
	var valores = "MENSAJE=" + mensaje + "&sesion=" + sesion + "&hash=" + Math.random() + "&estructFormateo=" + estructFormateo + "&funcjsonp=" + funcjsonp + "&contextoOpJSON=" + contextoOpJSON + "&estructDeformateo=" + estructDeformateo + "&operacion=" + operacionEjecutar;

	if ((nombreRaiz != undefined) && (nombreRaiz != null) && (nombreRaiz != 'null')) {
		valores = valores + "&nombreRaiz=" + nombreRaiz;
	}

	if (operacionEjecutar != null && (operacionEjecutar != undefined) && (operacionEjecutar != '')) {
		operacion = operacionEjecutar;
	}
	//Obtener el objeto AJAX
	var req = getHTTPObject();
	//Realizar la petici�n AJAX
	if ((operacion == null) && ((contextoOpJSON == null) || (contextoOpJSON == undefined) || (contextoOpJSON == ''))) {
		//NO se ha informado la operaci�n
		funcionError(literales_traducirLiteralMultiidioma('AJAX_OPER_NO_INFORMADA'));
	} else {
		//Si se ha informado la operaci�n (obligatorio)
		req.onreadystatechange = getReadyStateHandlerJSON(req, control, funcionRespuesta);

		if (metodoFormu == "POST") {
			try {
				req.open("POST", url_base, asincrono);
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				if (typeof (nacarContext) != "undefined") {
					req.send(valores + "&NACARCONTEXT=" + nacarContext);
				} else {
					req.send(valores);
				}
			} catch (e) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_FUNCION_ERROR') + url_base);
				return;
			}

		} else {
			try {
				if (typeof (nacarContext) != "undefined") {
					req.open("POST", url_base + "?" + valores, asincrono);
					req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					req.send("NACARCONTEXT=" + nacarContext);
				} else {
					req.open("GET", url_base + "?" + valores, asincrono);
					req.send(null);
				}
			} catch (e) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_FUNCION_ERROR') + url_base);
				return;
			}
		}
	}
}


// -------------------------------------------------------------------
// Funci�n que devuelve un objeto de tipo XMLHttpRequest (objeto AJAX)//
// -------------------------------------------------------------------
function getHTTPObject() {

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
function getReadyStateHandler(req, control, funcionRespuesta) {
	//Devuelve una funcion an�nima que escucha a la instancia XMLHttpRequest
	return function () {
		//Si el estado de la petici�n es COMPLETO
		if (req.readyState == 4) {
			//Se comprueba que se ha recibido una respuesta correcta
			if (req.status == 200) {
				if (funcionRespuesta == null) {
					//Si la funci�n no ha sido informada
					postEjecutar(control, req.responseXML);
				} else {
					//Si se ha informado la funci�n
					funcionRespuesta(control, req.responseXML);
				}
			} else if (req.status == 500) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_500'));
			} else if (req.status == 404) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_404'));
			} else {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_OTROS') + " " + req.status);
			}

			req.onreadystatechange = function () {} //null produce un error de tipos en explorer 6
			req.abort();
			req = null;

		}
	}
}

// -------------------------------------------------------------------------
// Funci�n que se llama cuando se recibe el evento de respuesta del servidor en formato JSON//
// -------------------------------------------------------------------------
function getReadyStateHandlerJSON(req, control, funcionRespuesta) {
	//Devuelve una funcion an�nima que escucha a la instancia XMLHttpRequest
	return function () {
		//Si el estado de la petici�n es COMPLETO
		if (req.readyState == 4) {
			//Se comprueba que se ha recibido una respuesta correcta
			if (req.status == 200) {
				if (funcionRespuesta == null) {
					//Si la funci�n no ha sido informada
					postEjecutar(control, req.responseText);
				} else {
					//Si se ha informado la funci�n
					funcionRespuesta(control, req.responseText);
				}
			} else if (req.status == 500) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_500'));
			} else if (req.status == 404) {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_404'));
			} else {
				funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_HTTP_OTROS') + " " + req.status);
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
function postEjecutar(control, mensajeRespuesta) {


}

// ------------------------------------------------------
// Funci�n que se ejecuta cuando se ha producido un error//
// ------------------------------------------------------
function funcionError(error) {
	publicarTextoEnBarraMensajePortal(error);
}


// -------------------------------------------------------------------------------------
// Funci�n que devuelve el valor de retorno de la ejecuci�n del flujo de la Arquitectura//
// -------------------------------------------------------------------------------------
function getCodigoRetorno(documentoXML) {

	if (documentoXML == null) {

		return;
	}

	var codigo = null;

	if (documentoXML.getElementsByTagName("codigo")[0] != null) {
		if (documentoXML.getElementsByTagName("codigo")[0].firstChild != null) {
			codigo = documentoXML.getElementsByTagName("codigo")[0].firstChild.nodeValue;
		}

	}

	return codigo;
}


// -------------------------------------------------------------------------------------------------------------
// Funci�n que devuelve el mensaje de error en caso de que no se haya ejecutado correctamente la Operaci�n NACAR//
// -------------------------------------------------------------------------------------------------------------
function getMensajeError(documentoXML) {

	if (documentoXML == null) {
		return;
	}

	var mensajeError = null;
	if (documentoXML.getElementsByTagName("mensaje")[0] != null) {

		if (documentoXML.getElementsByTagName("mensaje")[0].firstChild != null) {
			mensajeError = documentoXML.getElementsByTagName("mensaje")[0].firstChild.nodeValue;
		}
	}
	return mensajeError;

}


// --------------------------------------------------------
// Funci�n que devuelve el contexto XML//
// --------------------------------------------------------
function getContextoXML(documentoXML) {
	if (documentoXML == null) {
		return;
	}

	var datos = null;
	var raices = documentoXML.getElementsByTagName("contexto");
	if (raices.length > 0) {
		var raiz = raices[0];
		if (raiz.getElementsByTagName("datos")[0] != null) {
			datos = raiz.getElementsByTagName("datos")[0].firstChild;
		}
	}

	return datos;

}


// ------------------------------------------------------------------------------------------------------------
// Funci�n que devuelve el valor de una determinada clave de configuraci�n extra�da del documento XML Respuesta//
// ------------------------------------------------------------------------------------------------------------
function getDatoXML(clave, documentoXML) {

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



// --------------------------------------------------------------------
// Funci�n que devuelve el documento XML introducido en forma de String//
// --------------------------------------------------------------------
function tostring(documentoXML) {


	var i = 0;
	var resultado = "";

	try {
		resultado = inicioTag(documentoXML)

		if (documentoXML.nodeName != "simple") {
			for (i = 0; i < documentoXML.childNodes.length; i++) {

				resultado = resultado + tostring(documentoXML.childNodes.item(i));
			}

			resultado = resultado + finTag(documentoXML);

		} else {
			resultado = resultado + getTextFromItem(documentoXML.childNodes.item(0)) + finTag(documentoXML);
		}
	} catch (e) {
		resultado = documentoXML;
	}

	return resultado;
}


// ----------------------------------------------------------------------------------------
// Funci�n que convierte a String la cabecera de una determinada etiqueta del documento XML//
// ----------------------------------------------------------------------------------------
function inicioTag(documentoXML) {

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
function finTag(documentoXML) {

	var nombreNodo = documentoXML.nodeName;
	return "</" + nombreNodo + ">"

}
//Evolutivo Gestion Avanzada de Tareas

function ejecutarPeticionAJAX(url, funcionRespuesta, parametros, sincAsinc, funcionError) {
	//Obtener el objeto AJAX
	var req = getHTTPObject();

	try {
		if (sincAsinc == null) {
			//si el par�metro no viene informado, por defecto asincrono
			sincAsinc = true;
		}

		if ((funcionRespuesta == null) || (funcionRespuesta == undefined)) {
			//Si no se ha definido una funcion de respuesta se tratar� una petici�n sincrona en la que se devuelva directamente el resultado
			sincAsinc = false;
		} else {
			req.onreadystatechange = getReadyStateHandler(req, null, funcionRespuesta, funcionError);
		}

		req.open("GET", url + "&hash=" + Math.random(), sincAsinc);

		req.send(null);

		if ((funcionRespuesta == null) || (funcionRespuesta == undefined)) {
			if (req.status == 200) {
				return req.responseText;
			} else {
				return null;
			}
		}
	} catch (e) {
		try {
			funcionError(literales_traducirLiteralMultiidioma('AJAX_ERROR_PRODUCIDO') + e);
		} catch (ex) {}
		return;
	}
}


function ejecutarPeticionAJAX_MicroStrategy(url, usuario) {

	//Petici�n s�ncrona
	sincAsinc = false;
	//Obtener el objeto AJAX
	var req = getHTTPObject();

	try {
		var url_mod = '/' + nombreArquitecturaAux + '_mult_mult_jsp/PeticionMicrostrategy.jsp?url=' + encodeURIComponent(url);
		//Si el usuario no es nulo, se notifica PeticionMicrostrategy.jsp como par�metro.
		if (usuario != null && usuario != undefined) {
			url_mod = url_mod + "&usuario=" + usuario;
		}

		req.open("GET", url_mod + "&hash=" + Math.random(), sincAsinc);
		req.send(null);

		//Si la petici�n es sincrona devolvemos el resultado en el responseText de la request
		if (!sincAsinc) {
			return req.responseText;
		}
	} catch (e) {
		alert(e);
		alert("ERROR en ejecutarPeticionAJAX_MicroStrategy con la url:" + url);
		return;
	}
}