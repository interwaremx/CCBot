/**A�ADIDO PARA LA COMPATIBILIDAD CON MOZILLA**/
//Indica en que navegador nos encontramos
var navegador = navigator.appName
var nombreArquitecturaAux = 'atcl';
try {
	if (nombreArquitectura == 'atlp') {
		nombreArquitecturaAux = nombreArquitectura;
	} else {
		nombreArquitecturaAux = 'atcl';
	}
} catch (e) {}





//Funcion que guarda la informaci�n del formulario para enviarla

function enviarFormularioNacar(identificadorFormulario, evento) {
	document.forms[identificadorFormulario].evento.value = evento;
}

//Dado un identificador de un campo oculto extrae su valor.

function getDatoOculto(identificador) {
	return document.getElementById(identificador).value;
}

//Dado un identificador de un campo oculto y el valor deseado, introduce ese valor en el campo.

function setDatoOculto(identificador, valor) {
	document.getElementById(identificador).value = valor;
}

////////////////////////////////
//ACCIONADOR  /////////////
////////////////////////////////

function getTextoAccionador(identificador) {

	if (navegador == 'Microsoft Internet Explorer') {
		if (document.getElementById(identificador).type == 'image') {
			return document.getElementById(identificador).alt;
		} else {
			return document.getElementById(identificador).value;
		}
	} else if (navegador == 'Netscape') {

		if (document.getElementsByName(identificador)[0].type == 'image') {
			return document.getElementsByName(identificador)[0].alt;
		} else {
			return document.getElementsByName(identificador)[0].value;
		}

	}



}

function setTextoAccionador(identificador, valor) {


	if (navegador == 'Microsoft Internet Explorer') {

		if (document.getElementById(identificador).type == 'image') {
			document.getElementById(identificador).alt = valor;
		} else {
			document.getElementById(identificador).value = valor;
		}
	} else if (navegador == 'Netscape') {

		if (document.getElementsByName(identificador)[0].type == 'image') {
			document.getElementsByName(identificador)[0].alt = valor;
		} else {
			document.getElementsByName(identificador)[0].value = valor;
		}

	}
}

function getTipoAccionador(identificador) {
	// CAMBIO MOZILLA
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).type;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].type;
	}

}

function getEstiloAccionador(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).className;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].className;
	}
}

function setEstiloAccionador(identificador, valor) {


	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).className = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].className = valor;


	}

}

function getProtegidoAccionador(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).disabled;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].disabled;
	}

}

function setProtegidoAccionador(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {

		if (valor == 'true') {

			document.getElementById(identificador).disabled = true;
		} else {

			document.getElementById(identificador).disabled = false;
		}
	} else if (navegador == 'Netscape') {

		if (valor == 'true') {

			document.getElementsByName(identificador)[0].disabled = true;
		} else {

			document.getElementsByName(identificador)[0].disabled = false;
		}

	}

}

function getAltoAccionador(identificador) {

	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).height;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].height;
	}
}

function getAnchoAccionador(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).width;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].width;
	}
}

////////////////////////////////
//CAMPO DE TEXTO //////////
////////////////////////////////

function getAnchoCt(identificador)

{
	var _valor;
	if (navegador == 'Microsoft Internet Explorer') {
		_valor = document.getElementById(identificador).size;

	} else if (navegador == 'Netscape') {
		_valor = document.getElementsByName(identificador)[0].size;
	}
	return _valor;
}


function setAnchoCt(identificador, nuevo_valor) {

	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).size = nuevo_valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].size = nuevo_valor;
	}
}


function getRequeridoCt(identificador) {
	var _valor;
	if (navegador == 'Microsoft Internet Explorer') {
		_valor = document.getElementById(identificador).requerido;
	} else if (navegador == 'Netscape') {
		_valor = document.getElementsByName(identificador)[0].requerido;
	}
	return _valor;
}

function getTextoCt(identificador) {
	var _valor;
	if (navegador == 'Microsoft Internet Explorer') {
		_valor = document.getElementById(identificador).value;
	} else if (navegador == 'Netscape') {
		_valor = document.getElementsByName(identificador)[0].value;
	}
	return _valor;
}

function setTextoCt(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).value = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].value = valor;
	}
}

function getSoloLecturaCt(identificador) {
	var valor;
	if (navegador == 'Microsoft Internet Explorer') {
		valor = document.getElementById(identificador).readOnly;
	} else if (navegador == 'Netscape') {
		valor = document.getElementsByName(identificador)[0].readOnly;
	}
	return valor;
}

function getEstiloCt(identificador) {
	var valor;
	if (navegador == 'Microsoft Internet Explorer') {
		valor = document.getElementById(identificador).className;
	} else if (navegador == 'Netscape') {
		valor = document.getElementsByName(identificador)[0].className;
	}
	return valor;
}

function setEstiloCt(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).className = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].className = valor;
	}
}


function setSoloLecturaCt(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).readOnly = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].readOnly = valor;
	}
}

function getDesactivadoCt(identificador) {
	var valor;
	if (navegador == 'Microsoft Internet Explorer') {
		valor = document.getElementById(identificador).disabled;

	} else if (navegador == 'Netscape') {
		valor = document.getElementsByName(identificador)[0].disabled;
	}
	return valor;

}

function setDesactivadoCt(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).disabled = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].disabled = valor;
	}

}

////////////////////////////////
//LISTA DESPLEGABLE ////////////
////////////////////////////////

// da valor al atributo editable .PROBADO
function getEditableLista(identificador) {

	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).editable;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].editable;
	}
}

// devuelve el valor del atributo estilo. PROBADO
function getEstiloLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).className;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].className;
	}
}
// da valor al atributo estilo de la lista desplegable.PROBADO
function setEstiloLista(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).estilo = valor;
		document.getElementById(identificador).className = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].estilo = valor;
		document.getElementsByName(identificador)[0].className = valor;
	}
}

//cuerpo 

// devuelve codigo y descripciones en un array .PROBADO
function getCuerpoLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		var comboBox = document.getElementById(identificador)
		var longitud = document.getElementById(identificador).length
	} else if (navegador == 'Netscape') {
		var comboBox = document.getElementsByName(identificador)[0]
		var longitud = document.getElementsByName(identificador)[0].length
	}

	cuerpo = new Array();
	cuerpo[0] = new Array(); // guarda el texto de un option
	cuerpo[1] = new Array(); // guarda el valor de un option

	// Llenado 
	for (var contador = 0; contador < comboBox.length; contador++) {
		// obtiene los valores de comboBox
		if (navegador == 'Microsoft Internet Explorer') {
			var valor = document.getElementById(identificador).options[contador].value
			var texto = document.getElementById(identificador).options[contador].text
		} else if (navegador == 'Netscape') {
			var valor = document.getElementsByName(identificador)[0].options[contador].value
			var texto = document.getElementsByName(identificador)[0].options[contador].text
		}

		//insertamos en el cuerpo
		cuerpo[0][contador] = texto
		cuerpo[1][contador] = valor


	}

	return cuerpo;
}

// devuelve el codigo del cuerpo de una lista desplegable .PROBADA
function getClavesLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		var comboBox = document.getElementById(identificador)
	} else if (navegador == 'Netscape') {
		var comboBox = document.getElementsByName(identificador)[0]
	}
	codigoLista = new Array();
	codigoLista[0] = new Array()

	for (var contador = 0; contador < comboBox.length; contador++) {
		// obtiene los valores de comboBox
		if (navegador == 'Microsoft Internet Explorer') {
			var valor = document.getElementById(identificador).options[contador].value
		} else if (navegador == 'Netscape') {
			var valor = document.getElementsByName(identificador)[0].options[contador].value
		}
		//insertamos en el cuerpo
		codigoLista[0][contador] = valor

	}
	return codigoLista;

}
// devuelve la descripcion del cuerpo de una lista desplegable .PROBADA
function getTextoLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		var comboBox = document.getElementById(identificador)
	} else if (navegador == 'Netscape') {
		var comboBox = document.getElementsByName(identificador)[0]
	}
	descripcionLista = new Array();
	descripcionLista[0] = new Array()

	for (var contador = 0; contador < comboBox.length; contador++) {
		// obtiene los valores de comboBox
		if (navegador == 'Microsoft Internet Explorer') {
			var descripcion = document.getElementById(identificador).options[contador].text
		} else if (navegador == 'Netscape') {
			var descripcion = document.getElementsByName(identificador)[0].options[contador].text
		}
		//insertamos en el cuerpo
		descripcionLista[0][contador] = descripcion

	}
	return descripcionLista;
}
// devuelve el numero de opciones del cuerpo de la lista desplegable. PROBADO
function getNumeroOpciones(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		var numOpciones = document.getElementById(identificador).length
	} else if (navegador == 'Netscape') {
		var numOpciones = document.getElementsByName(identificador)[0].length
	}
	return numOpciones
}


// get y set de seleccionado. PROBADA
// devuelve el codigo y la descripcion de la opcion seleccionada en en cuerpo de la lista desplegable
function getSeleccionadoLista(identificador) {
	valor = new Array();
	valor[0] = new Array(); // guarda el texto del option seleccionado
	valor[1] = new Array(); // guarda el valor del option seleccionado
	//var indice = document.getElementById(identificador).selectedIndex
	valor[0] = getTextoSeleccionado(identificador)
	valor[1] = getClaveSeleccionado(identificador)
	return valor
}

// actualiza el valor del codigo de la opcion seleccionada . PROBADA
function setSeleccionadoLista(identificador, valor) {
	var indice;
	if (navegador == 'Microsoft Internet Explorer') {
		indice = document.getElementById(identificador).selectedIndex
		document.getElementById(identificador).options[indice].value = valor
	} else if (navegador == 'Netscape') {
		indice = document.getElementsByName(identificador)[0].selectedIndex
		document.getElementsByName(identificador)[0].options[indice].value = valor
	}
}
// devuelve el codigo de la opcion seleccionada de la lista desplegable.PROBADO
function getClaveSeleccionado(identificador) {
	/***MODICACION MOZILLA***/
	/*Introducci�n del control de valores fuera del rango 220109*/
	var indice, valor;
	if (navegador == 'Microsoft Internet Explorer') {
		indice = document.getElementById(identificador).selectedIndex
		if (indice != -1)
			valor = document.getElementById(identificador).options[indice].value
	} else if (navegador == 'Netscape') {
		indice = document.getElementsByName(identificador)[0].selectedIndex
		if (indice != -1)
			valor = document.getElementsByName(identificador)[0].options[indice].value
	}
	return valor

	//devuelve la descripcion de la opcion seleccionada de la lista desplegable.  PROBADA
}

// devuelve el codigo de la opcion seleccionada de la lista desplegable, y permite informar un valor
// para los casos en los que se est� fuera de rango, sin haber seleccionado ning�n valor del combo
function getClaveSeleccionadoValorSinSeleccion(identificador, valorSinSeleccion) {
	var indice, valor;
	if (navegador == 'Microsoft Internet Explorer') {
		indice = document.getElementById(identificador).selectedIndex
		if (indice != -1) {
			valor = document.getElementById(identificador).options[indice].value
			return valor
		}
	} else if (navegador == 'Netscape') {
		indice = document.getElementsByName(identificador)[0].selectedIndex
		if (indice != -1) {
			valor = document.getElementsByName(identificador)[0].options[indice].value
			return valor
		}
	}
	return valorSinSeleccion
}

function getTextoSeleccionado(identificador) {
	var indice, valor;
	if (navegador == 'Microsoft Internet Explorer') {
		indice = document.getElementById(identificador).selectedIndex
		valor = document.getElementById(identificador).options[indice].text
	} else if (navegador == 'Netscape') {
		indice = document.getElementsByName(identificador)[0].selectedIndex
		valor = document.getElementsByName(identificador)[0].options[indice].text
	}

	return valor
}


// permitir� confirmar si el texto mostrado en el combo se corresponde con el c�digo o la descripci�n de las opciones de la lista.PROBADA
function isTextoCodigo(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).mostrarcodigo;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].mostrarcodigo;
	}
}
//permitir� confirmar si la clave de las opciones se corresponde con el c�digo o la descripci�n de las opciones de la lista.PROBADA
function isClaveCodigo(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).enviarcodigo;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].enviarcodigo;
	}
}
//devuelve si el campo es requerido.PROBADA
function getRequeridoLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).requerido;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].requerido;
	}
}
// da valor al atributo requerido PROBADA
function setRequeridoLista(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).requerido = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].requerido = valor;
	}
}
//devuelve si la lista esta protegida o no lo esta .PROBADA
function getProtegidoLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).disabled;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].disabled;
	}
}
// da valor al atributo protegido de la lista desplegable. PROBADA
function setProtegidoLista(identificador, valor) {
	if (navegador == 'Microsoft Internet Explorer') {
		document.getElementById(identificador).protegido = valor;
		document.getElementById(identificador).disabled = valor;
	} else if (navegador == 'Netscape') {
		document.getElementsByName(identificador)[0].protegido = valor;
		document.getElementsByName(identificador)[0].disabled = valor;
	}
}

// devuelve si la lista es protegida o no lo es. PROBADA.
function getEditableLista(identificador) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(identificador).editable;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(identificador)[0].editable;
	}
}



// ComboBox editable

function isIE(evento) {
	if (evento.which)
		return false;
	else
		return true;
}

function getKeyCode(evento) {
	if (evento.which) {
		return evento.which; //Netscape
	} else {
		return evento.keyCode; //Internet Explorer
	}
}

function callback(combo, evento) {
	// Procesamos el caracter s�lo si estamos en la opci�n editable
	if (combo.options.selectedIndex == 0) {
		var keycode = getKeyCode(evento);

		var char = '';

		if ((keycode == 32)) {

			/**
			 * Firefox ignora los espacios, Internet Explorer no. 
			 *
			 * Este c�digo no funciona correctamente (por refinar, 
			 * aunque no parece viable conseguir m�s de un espacio 
			 * seguido con Firefox)
			 *
			 * W3C HTML 4 specification says:
			 *
			 * "User agents may ignore leading and trailing white space
			 * in CDATA attribute values (e.g., " myval " may be
			 * interpreted as "myval"). Authors should not declare attribute
			 * values with leading or trailing white space."
			 */

			// Vaciamos el char y memorizamos en el objeto (combo) que hubo un espacio.
			char = '';

			if ((combo.espacio == undefined) || (combo.espacio == null))
				combo.espacio = 0;
			combo.espacio++;

		} else if ((keycode > 47 && keycode < 59) || (keycode > 62 && keycode < 127) || (keycode > 159 && keycode <= 255)) {
			combo.editando = true;
			char = String.fromCharCode(keycode);

			var espacios = "";
			while (combo.espacio > 0) {
				espacios = " " + espacios;
				combo.espacio--;
			}
			char = espacios + char;
			if (combo.espacio == undefined) {
				// Undefined
				this.espacio = 0;
			}

			combo.options[0].text = combo.options[0].text + char;
			combo.options[0].value = combo.options[0].text;
		}
	}
	char = "";
}

function callback_editando(combo, evento) {

	if (combo.editando == true) {
		combo.options[0].selected = true;
	}
	combo.editando = false;
}

function callback_borrado(combo, evento) {
	var keycode = getKeyCode(evento);

	var char = '';

	if (combo.options.selectedIndex == 0) {
		// Backspace
		if ((keycode == 8) || (keycode == 127)) {
			// ABORTAR El "atr�s" del navegador para Internet Explorer.
			if (isIE(evento)) {
				event.keyCode = '';
				window.event.keyCode = '';
			}
			// Borrar un caracter.
			if ((combo.options[0].text.length > 0)) {
				combo.options[0].text = combo.options[0].text.substring(0, combo.options[0].text.length - 1);
				combo.options[0].value = combo.options[0].text;
			}
		}
		// Suprimir
		else if ((keycode == 46)) {
			combo.options[0].text = '';
			combo.options[0].value = '';
		}
	}
}

function debug(valor, id) {
	if (navegador == 'Microsoft Internet Explorer') {
		if ((document.getElementById(id) != undefined) && (document.getElementById(id) != null))
			document.getElementById(id).value = valor;
		else
			alert(valor);
	} else if (navegador == 'Netscape') {
		if ((document.getElementsByName(id)[0] != undefined) && (document.getElementsByName(id)[0] != null))
			document.getElementsByName(id)[0].value = valor;
		else
			alert(valor);
	}
}

//Fin de ComboBox Editable




////////////////////////////////
//BOTON RADIO Y GRUPO //////////
////////////////////////////////


function getSeleccionadoRadio(identificador) {

	return document.getElementById(identificador).checked;


}

function setSeleccionadoRadio(identificador, valor) {

	document.getElementById(identificador).checked = valor;

}

function getEstiloRadio(identificador) {

	return document.getElementById(identificador).className;


}

function setEstiloRadio(identificador, valor) {

	document.getElementById(identificador).className = valor;

}

function getValorRadio(identificador) {

	return document.getElementById(identificador).value;


}

function setValorRadio(identificador, valor) {

	document.getElementById(identificador).value = valor;

}

function getProtegidoRadio(identificador) {
	return document.getElementById(identificador).disabled;

}

function setProtegidoRadio(identificador, valor) {


	document.getElementById(identificador).disabled = valor;

}

function getEstiloRBG(identificador) {

	return document.getElementById(identificador + "_RBG").className;


}

function setEstiloRBG(identificador, valor) {

	var grupo = document.getElementsByName(identificador);
	document.getElementById(identificador + "_RBG").className = valor;
	for (i = 0; i < grupo.length; i++) {

		grupo[i].className = valor;
	}
}

function getProtegidoRBG(identificador) {
	var a = document.getElementsByName(identificador);
	return a[0].disabled;

}

function setProtegidoRBG(identificador, valor) {


	var grupo = document.getElementsByName(identificador);
	document.getElementById(identificador + "_RBG").protegido = valor;
	for (i = 0; i < grupo.length; i++) {

		grupo[i].disabled = valor;
	}


}

function getSeleccionadoRBG(identificador) {
	var grupo = document.getElementsByName(identificador);

	for (i = 0; i < grupo.length; i++) {

		if (grupo[i].checked) {

			return grupo[i].id;
		}

	}
	return null;

}

function setSeleccionadoRBG(identificador, boton) {
	if (getSeleccionadoRBG(identificador) != null)
		document.getElementById(getSeleccionadoRBG(identificador)).checked = false;
	document.getElementById(boton).checked = true;




}


function getValorSeleccionadoRBG(identificador) {


	var grupo = document.getElementsByName(identificador);

	for (i = 0; i < grupo.length; i++) {

		if (grupo[i].checked) {

			return grupo[i].value;
		}

	}
	return null;

}


function getRequeridoRBG(identificador) {

	return document.getElementById(identificador + "_RBG").requerido;


}

function setRequeridoRBG(identificador, valor) {

	document.getElementById(identificador + "_RBG").requerido = valor;


}


////////////////////////////////
//TABLA EDITABLE NACAR /////////
////////////////////////////////
////////////////////////// NO BASADA EN IDENTIFICADORES /////////////////////////////
function getCeldaRAW(idtable, row, col) {
	// CUIDADIN, INCLUYE LA CABECERA
	var table = document.getElementById(idtable);
	var filas = table.rows;
	var celdas = filas[row].cells;
	return celdas[col];
}

function getDatoCeldaRAW(idtable, row, col) {
	var celda = getCeldaRAW(idtable, row, col);
	return celda.innerHTML;
}

function setDatoCeldaRAW(idtable, row, col, data) {
	var celda = getCeldaRAW(idtable, row, col);
	celda.innerHTML = data;
}
////////////////////////// NO BASADA EN IDENTIFICADORES /////////////////////////////

function getOperacionEdicionTE(idTabla) {
	if (navegador == 'Microsoft Internet Explorer') {
		return document.getElementById(idTabla + 'operacionedicion').value;
	} else if (navegador == 'Netscape') {
		return document.getElementsByName(idTabla + 'operacionedicion').value;
	}
}

function setOperacionEdicionTE(idTabla, valor) {
	document.getElementsByName(idTabla + 'operacionedicion').value = valor;
}

function getArrayTE(idTabla) {
	return eval(idTabla + "DATOS");
}

function getDatoArrayTE(idTabla, row, col) {
	return (getArrayTE(idTabla)[row][col]);
}

function setFilaAnadirTE(idTabla, valor) {
	document.getElementsByName(idTabla + 'size').value = valor;
}

var eventoAlta = -1;
var eventoBaja = -1;
var eventoModificacion = -1;

function addFilaNuevaTE(form, idTabla) {
	var arrayTabla = getArrayTE(idTabla);
	var tam = arrayTabla.length;
	setFilaAnadirTE(idTabla, tam);
	setOperacionEdicionTE(idTabla, 'ALTA');
	document.forms[form].evento.value = eventoAlta;
}

function eliminarFilaTE(form, idTabla) {
	var arrayTabla = getArrayTE(idTabla);
	var tam = arrayTabla.length;
	setFilaAnadirTE(idTabla, tam);
	setOperacionEdicionTE(idTabla, 'BAJA');
	document.forms[form].evento.value = eventoBaja;
}


function modificarFilaTE(form, idTabla) {
	setOperacionEdicionTE(idTabla, 'MODIFICACION');
	document.forms[form].evento.value = eventoModificacion;
}

function ver() {
	alert(document.getElementById('TABLA_PRUEBA_FILA_SELECCIONADA').value);
	alert(document.getElementById('TABLA_PRUEBAsize').value);
}

function html_entity_decode(str) {
	var ta = document.createElement("textarea");
	ta.innerHTML = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return ta.value;
}

//Esta funci�n en principio no va a ser necesaria. Utilizar setColumnaSeleccionEdicion(ZXXXXXXXXZ).

function seleccionEdicionExternaTE(idTabla) {
	var grupo = document.getElementsByName('rb' + idTabla);
	var encontrado = false;
	for (i = 0;
		(i < grupo.length) && !encontrado; i++) {
		if (grupo[i].checked) {
			document.getElementById(idTabla + '_FILA_SELECCIONADA').value = i;
			encontrado = true;
		}
	}
}

//RECUPERACI�N DE ATRIBUTOS DE LA TABLA EDITABLE

function getAnchoTabla(identificador) {
	return document.getElementById(identificador).width;

}

function getEspacioEntreCeldasTabla(identificador) {
	return document.getElementById(identificador).cellspacing;

}

function getEspacioInteriorCeldasTabla(identificador) {
	return document.getElementById(identificador).cellpadding;

}

function getEstiloTabla(identificador) {
	return document.getElementById(identificador).className;

}

function setEstiloTabla(identificador, valor) {
	document.getElementById(identificador).className = estilo;

}

function actualizarSeleccionMultiple(identificador) {
	var arrayTabla = getArrayTE(identificador);
	var long = arrayTabla.length;
	actualizarFilasSeleccionadas(identificador, 0, long);

}
/////////////////////////////////
//RECUPERACI�N DE DATOS OCULTOS//
/////////////////////////////////

//Recuperaci�n del array de datos ocultos
function getArrayOcultosTE(idTabla) {
	return eval(idTabla + "DATOSOCULTOS");
}

//Recuperaci�n del array con los nombres de los campos ocultos
function getArrayNombresOcultosTE(idTabla) {
	return eval(idTabla + "NOMBRESOCULTOS");
}

//Recuperaci�n de un dato (seg�n fila y columna) del array de datos ocultos
function getDatoOcultoArrayTE(idTabla, row, col) {
	return (getArrayOcultosTE(idTabla)[row][col]);
}

//Recuperaci�n de un nombre (seg�n columna) del array de datos ocultos
function getNombreOcultoArrayTE(idTabla, col) {
	return (getArrayNombresOcultosTE(idTabla)[col]);
}

//Recuperaci�n de la posici�n de un nombre del array de datos ocultos
function getPosicionOcultoArrayTE(idTabla, nombre) {
	var posicion = -1;
	nombresOcultos = new Array();
	nombresOcultos = getArrayNombresOcultosTE(idTabla);
	for (var i = 0; i < nombresOcultos.length; i++) {
		if (nombresOcultos[i] == nombre) {
			posicion = i;
			break;
		}
	}
	return posicion;
} // FIN RECUPERACI�N DATOS OCULTOS
// CTAGS Fase II -> a�adido par�metro edicionenfilaprotegida
function insertarControlHTMLEdicionFila(tipoControl, nombre, fila, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, deseleccionFila, edicionEnFila, edicionEnFilaProtegida) {
	var cadena = "";
	cadena += "\n<center><INPUT TYPE=\"";
	cadena += tipoControl;
	cadena += "\" NAME=\"";
	if (tipoControl == "radio") {
		cadena += "rb" + nombre;
	} else if (tipoControl == "checkbox") {
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" ID=\"";
	if (tipoControl == "radio") {
		cadena += "rb" + nombre;
	} else if (tipoControl == "checkbox") {
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" VALUE=\"\" ";
	cadena += "onclick=\"";
	if (tipoControl == "checkbox") {
		cadena += nombre + "LanzarMS=false;";
		cadena += "if (" + nombre + "MultiSeleccionMasiva && " + nombre + "ComprobarCK) compruebaEstadoCK('" + nombre + "CKMS');";
	}
	cadena += insertarEventoSeleccionFilaEdicionFila(eventoSeleccionFila, nombre, fila, edicionEnFila, edicionEnFilaProtegida, tipoControl);
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);
	cadena += insertarDeseleccionFila(deseleccionFila, nombre);
	if (tipoControl == "checkbox") {
		cadena += nombre + "LanzarMS=true;";
	}
	cadena += "\"></center>";

	return cadena;
}

// CTAGS Fase II --> desproteger fila seleccionada + no hay campos de edicion
function insertarEventoSeleccionFilaEdicionFila(eventoSeleccionFila, nombre, fila, edicionEnFila, edicionEnFilaProtegida, tipoControl) {
	var cadena = "";
	if (eventoSeleccionFila != "") {
		valores = eventoSeleccionFila.split("�");

		if (valores[1].indexOf("&#39;") != -1)
			valores[1] = valores[1].replace(/\&#39;/g, "\\&#39;");

		cadena += "if (!" + valores[0] + "(";
		cadena += fila + "," + valores[1];
		cadena += ")) { this.checked=false;";
		//resetearCamposEdicion
		// CTAGS Fase II --> desproteger fila seleccionada + no hay campos de edicion
		if (!edicionEnFila) {
			if (valores[2] != "") {
				valores1 = valores[2].split("#");
				for (i = 0; i < valores1.length; i++) {
					cadena += "try{" + nombre + valores1[i] + ".value='';}catch(e){;}";
					if (i == 0) {
						cadena += "fila" + nombre + ".value='';";
					}
				}
			}
			cadena += "return; } else{ fila" + nombre + ".value='" + fila + "';}";
		} else {
			cadena += "return; }"
			if (tipoControl == "radio") {

				// Ejecutamos la desprotecci�n de celda e informamos el n�mero de fila en
				// el input filaNOMBRETABLA para que se ejecute el onClick del bot�n de refresco.
				cadena += " else {";
				if (edicionEnFilaProtegida == true) {
					cadena += "desprotegerFilaSeleccionada('" + nombre + "', " + fila + ");";
				}
				cadena += "fila" + nombre + ".value='" + fila + "';}";
			}
		}
		// fin resetearCamposEdicion

	} else {
		// CTAGS Fase II:
		// si no hay evento de seleccionedicion y la edicion es en fila protegida, 
		// hay que enganchar la funci�n de desproteger la fila seleccionada.
		if (edicionEnFila && edicionEnFilaProtegida) {
			if (tipoControl == "radio") {
				cadena += "desprotegerFilaSeleccionada('" + nombre + "', " + fila + ");fila" + nombre + ".value='" + fila + "';";

			}
		}
	}
	return cadena;
}
// FILTRADO


function trim(s) {
	s = s.replace(/\s+/gi, ' '); //sacar espacios repetidos dejando solo uno
	s = s.replace(/^\s+|\s+$/gi, ''); //sacar espacios blanco principio y final


	return s;
}

function filtrado(columna, filtro, nombreTabla) {

	if ((filtro == undefined) || (filtro == null)) return;
	if ((columna == undefined) || (columna == null)) return;

	// Si no se especifica filtro el efecto es el mismo que
	// si se especifica '*': todas las celdas cumplen el filtro.
	if (filtro == '') filtro = '*';

	// Se detecta la primera fila de datos de la tabla editable
	var filas = document.getElementById('TABLA_' + nombreTabla).rows;
	var primeraFilaDatos = 0;
	for (primeraFilaDatos = 0; primeraFilaDatos < filas.length; primeraFilaDatos++) {
		if (filas[primeraFilaDatos].id.indexOf(nombreTabla + 'fila') == 0) {
			break;
		}
	}
	// Proteccion javascript;
	if (primeraFilaDatos >= filas.length)
		primeraFilaDatos = 0;
	// Tenemos que filtrar solo las filas a partir de primeraFilaDatos,
	// y nunca filtrar filas del pie: ver "(*)".

	// Resto de inicializaciones
	var lenFiltro = filtro.length;
	var lenValor = 0;
	var lenTabla = filas.length;
	var i = 0;
	var char = 0;
	var charFiltro = 0;
	var fila = null;
	var celdas = null;
	var valor = null;
	var cumpleFiltro = true;
	for (i = primeraFilaDatos; i < lenTabla; i++) {
		fila = filas[i];

		// (*) Evitamos filtrar las filas del pie
		// en base al id que tienen todas las filas de datos.
		// No filtrar implica pasar a la siguiente iteraci�n del 
		// bucle, por lo que pueda pasar...
		if ((fila.id != undefined) && (fila.id != null)) {
			if (fila.id.search(nombreTabla + 'fila') < 0) {
				continue;
			}
		} else {
			// Si la fila no tiene id, no es de datos y por eso
			// no se filtra.
			continue;
		}

		celdas = fila.cells;
		if (celdas[columna].getElementsByTagName("select") != undefined && celdas[columna].getElementsByTagName("select") != null && celdas[columna].getElementsByTagName("select").length != 0) {
			valor = '';
			if (document.all) {
				valor = celdas[columna].getElementsByTagName("select")[0].options[celdas[columna].getElementsByTagName("select")[0].selectedIndex].value;
			} else {
				valor = celdas[columna].getElementsByTagName("select")[0].options[celdas[columna].getElementsByTagName("select")[0].selectedIndex].value;
			}
		} else {
			if (document.all) {
				valor = celdas[columna].innerText;
			} else {
				// Firefox
				valor = celdas[columna].childNodes.item(1).textContent;
			}
			if (valor == '') {
				valor = celdas[columna].getElementsByTagName("input")[0].value;
			}
		}

		valor = trim(valor);
		lenValor = valor.length;

		////////////////////// FILTRADO //////////////////////
		for (char = 0, charFiltro = 0;
			(char < lenValor) && (charFiltro < lenFiltro); char++, charFiltro++) {
			// Si el filtro tiene comod�n de 1 caracter, 
			// el caracter cumple; se pasa al siguiente caracter
			// tanto en el filtro como en la celda.
			if (filtro.charAt(charFiltro) == '?') {
				cumpleFiltro = true;
				continue;
			}

			// Si el filtro tiene comod�n de 1 � n caracteres,				
			if (filtro.charAt(charFiltro) == '*') {
				//Si el comod�n es el �ltimo, se cumple el filtro
				if (charFiltro + 1 >= lenFiltro) {
					cumpleFiltro = true;
					char = lenValor;
					charFiltro = lenFiltro;
					break;
				}

				while (filtro.charAt(charFiltro) == '*' || filtro.charAt(charFiltro) == '?') {
					charFiltro++;
					char++;
				}

				// Si no, se busca en la celda el siguiente caracter
				// al comod�n, desde la posici�n actual en la celda
				// (search devuelve la primera ocurrencia).
				if ((char < lenValor) && (charFiltro < lenFiltro)) {
					var res = valor.substring(char).indexOf(filtro.charAt(charFiltro));
					if (res < 0) {
						// Si no se encuentra, el filtro no se cumple.
						cumpleFiltro = false;
						break;
					} else {
						char += res;

					}
				}
				// Si se encuentra o si estamos fuera del filtro o el valor, 
				// la posici�n en la celda se queda
				// modificada a la posici�n del car�cter encontrado
				// tras el avance del comod�n, y la posici�n en el filtro 
				// tambi�n.
				// El filtro se cumple.
				if (char < lenValor)
					cumpleFiltro = true;
				continue;
			}
			// Si es un caracter normal, se compara.
			if (filtro.charAt(charFiltro) != valor.charAt(char)) {

				cumpleFiltro = false;
				break;
			}
			// Si en esta iteraci�n estamos aqu�, es que el filtro se
			// cumple
			cumpleFiltro = true;
		}

		// Si se ha terminado el bucle pero no se han analizado
		// el filtro y la celda completamente, es que el filtro
		// no se ha cumplido.
		if ((char < lenValor) || (charFiltro < lenFiltro)) {

			cumpleFiltro = false;
		}

		//////////////////////////////////////////////////////

		// Si la fila cumple el filtro se muestra; si no, no.
		var selects = fila.getElementsByTagName("select");
		if (cumpleFiltro) {
			//fila.style.display='block';
			fila.style.display = '';
			var j = 0;
			if (selects != undefined && selects != null) {
				for (j = 0; j < selects.length; j++) {
					selects[j].style.display = 'block';
				}
			}
		} else {
			fila.style.display = 'none';
			var j = 0;
			if (selects != undefined && selects != null) {
				for (j = 0; j < selects.length; j++) {
					selects[j].style.display = 'none';
				}
			}
		}
	}
}

function ParametrosDialogo(mensaje, textoOk, textoCancelar, ancho, alto) {
	this.mensaje = mensaje;
	this.textoOk = textoOk;
	this.textoCancelar = textoCancelar;
	this.ancho = ancho;
	this.alto = alto;
	this.toString = mensaje + ';' + textoOk + ';' + textoCancelar + ';' + ancho + ';' + alto;
}

function popupFiltrar(columna, mensaje, textoOk, textoCancelar, ancho, alto, nombreTabla) {
	var filtro = undefined; //prompt(mensaje,"*");
	var parametros = new ParametrosDialogo(mensaje, textoOk, textoCancelar, ancho, alto);

	if (document.all) {
		// TODO: nota!!! Corregir el URL del dialogoFiltro.html seg�n indique el ANS.
		filtro = window.showModalDialog('/' + nombreArquitecturaAux + '_es_web_pub/dialogoFiltro.html', parametros, 'center:yes;resizable:no;scroll:no;status:false;location:false');
	} else {
		// Firefox: showModalDialog no est� implementado 
		// del mismo modo (no funciona bien)
		filtro = prompt(mensaje, "");
	}
	if ((filtro != undefined) && (filtro != null)) {
		filtrado(columna, filtro, nombreTabla);
	}

}

// FIN FILTRADO



function cambiaText(boton) {
	var bot = document.getElementById(boton);
	if (bot.value == "+ ") {
		bot.value = "-";
	} else {
		bot.value = "+ ";
	}
}

function escondeSelects() {

	if (!window.attachEvent) return false;
	var selects = document.getElementsByTagName("select");

	for (var i = 0; i < selects.length; i++) {

		if (selects[i].style.display == "none")
			selects[i].style.display = "block";
		else
			selects[i].style.display = "none";
	}
}


function escondeSelect(nombreTabla, columna, fila) {

	if (!window.attachEvent) return false;
	var selects = document.getElementsByTagName("select");

	for (var i = 0; i < selects.length; i++) {
		if (selects[i].name == nombreTabla + "_" + columna + "_" + fila) {
			if (selects[i].style.display == "none")
				selects[i].style.display = "block";
			else
				selects[i].style.display = "none";
		}
	}
}

function clickSegmento(nombreTabla, filaPrincipal, posColumnaClave, columnaClave, filaspaginacion) {


	var arrayT = getArrayTE(nombreTabla);

	if (filaspaginacion <= 0) {
		filaspaginacion = Number.MAX_VALUE;

	}

	var valorPrincipal = getDatoArrayTE(nombreTabla, (filaPrincipal % filaspaginacion), posColumnaClave);


	seguir = true;
	i = (filaPrincipal % filaspaginacion);
	var codigoControl = filaPrincipal;
	i++;
	codigoControl++;

	while (seguir && i < arrayT.length) {
		var valorSecundario = getDatoArrayTE(nombreTabla, i, posColumnaClave);
		if (valorPrincipal == valorSecundario) {
			var fila = document.getElementById(nombreTabla + "fila" + codigoControl);
			escondeSelect(nombreTabla, columnaClave, codigoControl);
			if (fila.style.display == "none") {
				fila.style.display = '';
			} else {
				fila.style.display = "none";
			}
			i++;
			codigoControl++;
		} else {
			seguir = false;
		}
	}
}


function esFilaPrincipalSegmento(nombreTabla, fila, posColumnaClave, filaspaginacion) {


	if (filaspaginacion <= 0) {

		filaspaginacion = Number.MAX_VALUE;

	}

	if ((fila % filaspaginacion) == 0) {
		return true;
	} else {
		var valorActual = getDatoArrayTE(nombreTabla, (fila % filaspaginacion), posColumnaClave);
		var valorAnterior = getDatoArrayTE(nombreTabla, (fila % filaspaginacion) - 1, posColumnaClave);
		if (valorActual != valorAnterior)
			return true;
		else
			return false;

	}

}


function habilitarEdicionFilaPrincipal(nombreTabla, fila, posColumnaClave, columnaClave, filaspaginacion) {


	var campoTextoEdicion = document.getElementsByName(nombreTabla + columnaClave);

	if (esFilaPrincipalSegmento(nombreTabla, fila, posColumnaClave, filaspaginacion)) {


		campoTextoEdicion[0].readOnly = false;
	} else {
		campoTextoEdicion[0].readOnly = true;

	}
}

function habilitarEdicionExternaFilaPrincipal(nombreTabla, fila, posColumnaClave, columnaClave, campoExterno, filaspaginacion) {


	var campoTextoEdicion = document.getElementsByName(campoExterno);

	if (esFilaPrincipalSegmento(nombreTabla, fila, posColumnaClave, filaspaginacion)) {

		campoTextoEdicion[0].disabled = false;
		campoTextoEdicion[0].readOnly = false;

	} else {
		campoTextoEdicion[0].readOnly = true;
		campoTextoEdicion[0].disabled = true;

	}
}


function habilitarEscrituraSiPrincipal(nombreTabla, fila, posColumnaClave, columnaClave, filaspaginacion) {

	var campoTextoEdicion = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + fila);

	if (esFilaPrincipalSegmento(nombreTabla, fila, posColumnaClave, filaspaginacion)) {


		campoTextoEdicion[0].readOnly = false;
	} else {

		campoTextoEdicion[0].readOnly = true;
	}
}


function cambiarClaveEdicionEnFila(nombreTabla, filaPrincipal, posColumnaClave, columnaClave, filaspaginacion) {


	if (filaspaginacion <= 0) {

		filaspaginacion = Number.MAX_VALUE;

	}

	var valorPrincipal = getDatoArrayTE(nombreTabla, (filaPrincipal % filaspaginacion), posColumnaClave);
	var arrayT = getArrayTE(nombreTabla);
	seguir = true;
	i = (filaPrincipal % filaspaginacion);
	var codcampo = filaPrincipal;
	var campoTextoPrincipal = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codcampo);
	i++;
	codcampo++;

	while (seguir && i < arrayT.length) {

		var valorSecundario = getDatoArrayTE(nombreTabla, i, posColumnaClave);


		if (valorPrincipal == valorSecundario) {

			var campoTexto = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codcampo);

			campoTexto[0].value = campoTextoPrincipal[0].value;



			i++;
			codcampo++;


		} else {
			seguir = false;
		}


	}

}

function cambiarClaveEdicionEnFilaListas(nombreTabla, filaPrincipal, posColumnaClave, columnaClave, filaspaginacion) {

	if (filaspaginacion <= 0) {

		filaspaginacion = Number.MAX_VALUE;

	}


	var valorPrincipal = getDatoArrayTE(nombreTabla, (filaPrincipal % filaspaginacion), posColumnaClave);
	var arrayT = getArrayTE(nombreTabla);
	seguir = true;
	i = (filaPrincipal % filaspaginacion);
	var codelem = filaPrincipal
	var listaPrincipal = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codelem);
	i++;
	codelem++;

	while (seguir && i < arrayT.length) {

		var valorSecundario = getDatoArrayTE(nombreTabla, i, posColumnaClave);


		if (valorPrincipal == valorSecundario) {

			var listaSecundaria = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codelem);

			if (listaSecundaria.length > 0 && listaPrincipal.length > 0) {

				listaSecundaria[0].selectedIndex = listaPrincipal[0].selectedIndex;

			}



			i++;
			codelem++;


		} else {
			seguir = false;
		}


	}

}

function habilitarCamposClaveEnvio(nombreTabla, columnaClave, filaspaginacion) {


	if (filaspaginacion <= 0) {

		filaspaginacion = Number.MAX_VALUE;

	}
	var arrayT = getArrayTE(nombreTabla);
	var seleccionada = document.getElementsByName(nombreTabla + "_FILA_SELECCIONADA");
	i = (seleccionada.value % filaspaginacion);
	codelem = seleccionada.value;
	var campoPrincipal = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codelem);


	if (campoPrincipal.length > 0) {

		i++;
		codelem++;
		seguir = true;

		while (i < arrayT.length && seguir) {

			var campoTexto = document.getElementsByName(nombreTabla + "_" + columnaClave + "_" + codelem);
			if (campoTexto.length > 0) {

				if (campoTexto[0].value == campoPrincipal[0].value) {
					campoTexto[0].disabled = false;
				} else {
					seguir = false;
				}
			}
			i++;
			codelem++;
		}
	}
}

function cambiarClaveListasSiPrincipal(nombreTabla, fila, posClaveSeg, columna, filaspaginacion) {

	if (filaspaginacion <= 0) {

		filaspaginacion = Number.MAX_VALUE;

	}

	if (esFilaPrincipalSegmento(nombreTabla, fila, posClaveSeg, filaspaginacion)) {


		cambiarClaveEdicionEnFilaListas(nombreTabla, fila, posClaveSeg, columna, filaspaginacion);



	} else {

		var lista = document.getElementsByName(nombreTabla + "_" + columna + "_" + fila);
		if (lista.length > 0) {

			var textoAnterior = getTextoSeleccionado(nombreTabla + "_" + columna + "_" + (fila - 1));

			var i = 0;
			if (lista.length > 0) {

				while (i < lista[0].options.length) {
					if (lista[0].options[i].text == textoAnterior) {
						lista[0].options[i].selected = true;
					}
					i++;

				}
			}

		}


	}



}
//****************************************
//	CODIGO DE RESALTADO AUTOMATICO DE FILAS
//****************************************

//para guardar los estilos de las filas
var arrayEstilos;


function devolverTamannoTabla(nombretabla, arrayTabla) {

	var numRegPorPag = 0

	if (document.getElementById(nombretabla + '_CONTEXTO_PAGINACION_FILAS_POR_PAGINA') == null || document.getElementById(nombretabla + '_CONTEXTO_PAGINACION_FILAS_POR_PAGINA').value == 0) {
		numRegPorPag = arrayTabla.length;
	} else {
		numRegPorPag = document.getElementById(nombretabla + '_CONTEXTO_PAGINACION_FILAS_POR_PAGINA').value;
	}

	return numRegPorPag;

}


function resaltarFilaRadio(nombretabla, fila, color) {

	var arrayTabla = getArrayTE(nombretabla);
	var numRegPorPag = devolverTamannoTabla(nombretabla, arrayTabla);
	var filasPorPagina = arrayTabla.length;
	var paginaActual = Math.floor(fila / numRegPorPag);
	var primerIndice = paginaActual * numRegPorPag;
	var ultimoIndice = primerIndice + filasPorPagina;

	var i;

	if (arrayEstilos == null) {
		arrayEstilos = new Array();

		for (i = primerIndice; i < ultimoIndice; i++) {

			//almacenamos los estilos
			arrayEstilos[i % filasPorPagina] = document.getElementsByName(nombretabla + "fila" + i)[0].style.backgroundColor;
		}
	}

	for (i = primerIndice; i < ultimoIndice; i++) {

		//recomponemos los estilos
		document.getElementsByName(nombretabla + "fila" + i)[0].style.backgroundColor = arrayEstilos[i % filasPorPagina];
	}

	document.getElementsByName(nombretabla + "fila" + fila)[0].style.backgroundColor = color
}


function resaltarFilaCheck(nombretabla, fila, color) {

	var arrayTabla = getArrayTE(nombretabla);
	var numRegPorPag = devolverTamannoTabla(nombretabla, arrayTabla);
	var filasPorPagina = arrayTabla.length;
	var paginaActual = Math.floor(fila / numRegPorPag);
	var primerIndice = paginaActual * numRegPorPag;
	var ultimoIndice = primerIndice + filasPorPagina;

	var i;

	if (arrayEstilos == null) {
		arrayEstilos = new Array();

		for (i = primerIndice; i < ultimoIndice; i++) {

			//almacenamos los estilos
			arrayEstilos[i % filasPorPagina] = document.getElementsByName(nombretabla + "fila" + i)[0].style.backgroundColor;
		}
	}


	if (document.getElementsByName(nombretabla + "fila" + fila)[0].style.backgroundColor != arrayEstilos[fila % filasPorPagina]) {

		document.getElementsByName(nombretabla + "fila" + fila)[0].style.backgroundColor = arrayEstilos[fila % filasPorPagina];

	} else {

		document.getElementsByName(nombretabla + "fila" + fila)[0].style.backgroundColor = color;

	}


}

function resaltarFila(nombretabla, fila, color) {

	if (document.activeElement.type == 'radio') {

		resaltarFilaRadio(nombretabla, fila, color);
	} else {
		resaltarFilaCheck(nombretabla, fila, color);

	}


}


//****************************************
//	FIN CODIGO DE RESALTADO AUTOMATICO DE FILAS
//****************************************




//****************************************
//	CODIGO DE RESALTADO AUTOMATICO DE FILAS  CON ESTILOS
//****************************************



function resaltarFilaRadioEstilo(nombretabla, fila, estilo) {

	var arrayTabla = getArrayTE(nombretabla);
	var numRegPorPag = devolverTamannoTabla(nombretabla, arrayTabla);
	var filasPorPagina = arrayTabla.length;
	var paginaActual = Math.floor(fila / numRegPorPag);
	var primerIndice = paginaActual * numRegPorPag;
	var ultimoIndice = primerIndice + filasPorPagina;

	var i;

	if (arrayEstilos == null) {
		arrayEstilos = new Array();

		for (i = primerIndice; i < ultimoIndice; i++) {

			//almacenamos los estilos
			arrayEstilos[i % filasPorPagina] = document.getElementsByName(nombretabla + "fila" + i)[0].className;
		}
	}

	for (i = primerIndice; i < ultimoIndice; i++) {

		//recomponemos los estilos

		document.getElementsByName(nombretabla + "fila" + i)[0].className = arrayEstilos[i % filasPorPagina];
	}

	document.getElementsByName(nombretabla + "fila" + fila)[0].className = estilo;
}


function resaltarFilaCheckEstilo(nombretabla, fila, estilo) {

	var arrayTabla = getArrayTE(nombretabla);
	var numRegPorPag = devolverTamannoTabla(nombretabla, arrayTabla);
	var filasPorPagina = arrayTabla.length;
	var paginaActual = Math.floor(fila / numRegPorPag);
	var primerIndice = paginaActual * numRegPorPag;
	var ultimoIndice = primerIndice + filasPorPagina;


	var i;

	if (arrayEstilos == null) {
		arrayEstilos = new Array();

		for (i = primerIndice; i < ultimoIndice; i++) {

			//almacenamos los estilos
			arrayEstilos[i % filasPorPagina] = document.getElementsByName(nombretabla + "fila" + i)[0].className;
		}
	}


	if (document.getElementsByName(nombretabla + "fila" + fila)[0].className != arrayEstilos[fila % filasPorPagina]) {


		document.getElementsByName(nombretabla + "fila" + fila)[0].className = arrayEstilos[fila % filasPorPagina];

	} else {

		document.getElementsByName(nombretabla + "fila" + fila)[0].className = estilo;

	}


}

function resaltarFilaEstilo(nombretabla, fila, estilo) {

	if (document.activeElement.type == 'radio') {

		resaltarFilaRadioEstilo(nombretabla, fila, estilo);
	} else {

		resaltarFilaCheckEstilo(nombretabla, fila, estilo);

	}


}
// Funci�n para renombrar el bot�n PDF
function textobotonpdf(texto) {
	document.forms[0].botonPDF.value = texto;
}
// Funci�n para renombrar el bot�n Excel
function textobotonexcel(texto) {
	document.forms[0].botonExcel.value = texto;
}