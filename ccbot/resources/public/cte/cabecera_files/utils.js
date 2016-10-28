/*
 *	NOMBRE		utils
 *
 *	LENGUAJE	Javascript
 *
 *	DESCRIPCION	Libreria de funciones javascript/jsp usadas
 *
 *	AUTOR		Jaime Pascual Gallego Gomez
 *
 *	@Copyright (c) BBVA NACAR 2000
 *
 *	ULTIMA		16/10/2002
 *	MODIFICACION
 */

var nombreArquitecturaAux = 'atcl';
try{
   if(nombreArquitectura=='atlp')
   {
       nombreArquitecturaAux = nombreArquitectura;
   }
   else{
      nombreArquitecturaAux = 'atcl';
   }
}catch(e){
}

//Comprobamos en que navegador estamos
var ns=false;
var ie=false;


var n=navigator.appName;

if (n=='Netscape'){
	ns=true;
}else if(n=='Microsoft Internet Explorer'){
	ie=true;
}

setTimeout(cambiaPluginIE8, 3000);
	
/*Si nos encontramos en IE8 Standard se añade al plugin un style
   para que funcionen los botones de los mensajes dojo*/
function cambiaPluginIE8(){
if (document!=undefined && document!=null){
if (document.documentMode!=undefined && document.documentMode!=null){
  if (document.documentMode==8){
    //Se obtiene una referencia al tag del plugin
    var objPlugin = document.getElementById("PlugIn");
    
    if (objPlugin!=undefined && objPlugin!=null && objPlugin!=""){
      //Se añade el style para que funcione correctamente los botones del mensaje dojo
      objPlugin.setAttribute("style","behavior:url(#default#VML)");
      }
    }

 }
}
}

// Indica que el formulario se puede enviar. Cuando se envia el formulario su valor es false y el formulario no se puede enviar
// nuevamente
enviarFormulario = true;

// Variable para JetForm
var timeout;

var timeLocal=-1;
var emuladorPesado = false;
// Variable en la que se almacena el flujoID desde el que se ha realizado la llamada al mensaje Dojo
var flujoIDOrigenMensajeDojo=null;
//Variable en la que se almacena el flujoID de una ventana emergente desplegable si este tiene otra en ella
var flujoIDPadreMensajeDojo=null;
//Variable que indica si se está lanzando un mensaje error desde un frame hijo
var mensajeEnHijo=false;
// Variable en la que se almacena el estilo del document antes de realizar la llamada al mensaje Dojo
var estiloOriginalMensajeDojo=null;
// Variable en la que se almacena el flujoID del origen del Mensaje
var origenMensaje=null;
// Variable en la que se almacena la url invocada en el Mensaje
var urlInvocada=null;
// Variable que contiene el valor de retorno de una ventana modal invocada desde internet explorer
var resultadoVModal=null;
// Variable que contiene el valor del frame que ha invocado a la ventana modal FF
var frameInvocadorVentanaModalFF = null;

try{
	var flecha_o = new Image();
	flecha_o.src = "/"+nombreArquitecturaAux+"_es_web_pub/images/FlechaArriba.jpg";
	var flecha_m = new Image();
	flecha_m.src = "/"+nombreArquitecturaAux+"_es_web_pub/images/FlechaAbajo.jpg";
} catch(e){}
	
function isEnviarFormulario() {
	enviarFormulario=false;
	clearTimeout(timeout);
	timeout = setTimeout(resetFlagEnviarFormulario, 3000);
	if (self.frames.length > 0) {
		rebuildForm(document);
		return false;
	}
	else {
		return true;
	}
}

function setEnviarFormulario(newBoolean) {
	enviarFormulario = newBoolean;
}

function onFormularioSubmit() {
	if(!enviarFormulario) {
		return false;
	}
	setEnviarFormulario(false);
}

function mostrarErrores(arrayErrores) {
	if(arrayErrores) {
		for(var i=0; i<arrayErrores.length; i++) {
			alert(arrayErrores[i])
		}
	}
}

function redirecciona(){
	document.forms[0].evento.value=218107907
	document.forms[0].target="_top";
	document.forms[0].submit();
}

function controlSesion(){
	if(CTE_TIMEOUT && CTE_TIMEOUT>=1) {
		window.setTimeout('redirecciona()', CTE_TIMEOUT*1000);
	}
}

function refrescarTabla(formulario, destino, evento, columnas, contextoFilaSeleccionada, nombreLista) {
	var html = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"></head>';
	html += '<body onLoad=\'document.forms[0].submit();\'>';
	html += '<script LANGUAGE="javascript"></script>';
	html += '<FORM NAME="formularioRefrescar" action="' + destino +'" method="POST" target="">';

	var elementos = formulario.elements;
	var cuerpoLista = '';
	var fila = '';
	var flujo = '';
	var ventana = '';
	var sAux = '';

	for(var i=0; i<elementos.length; i++) {
		if (elementos[i].name != 'rb'+nombreLista) {
			if (elementos[i].name == 'cuerpoLista'+nombreLista) {
				cuerpoLista = elementos[i].value;
				if (fila != '') break;
			} else if (elementos[i].name == 'fila'+nombreLista) {
				fila = elementos[i].value;
				if (cuerpoLista != '') break;
			} else if(elementos[i].name == 'flujo') {
				flujo = elementos[i].value;
			} else if(elementos[i].name == 'ventana') {
				ventana = elementos[i].value;
			}
		}
	}

	html += '<input type="hidden" name="evento" value="' + evento + '"/>';
	html += '<input type="hidden" name="flujo" value="' + flujo + '"/>';
	html += '<input type="hidden" name="ventana" value="' + ventana + '"/>';

	for(var i=0; i<elementos.length; i++) {
		for (var x=0; x<columnas.length; x++) {
			if (elementos[i].name == columnas[x]) {
				sAux = elementos[i].name;
				if(sAux != nombreLista) {
					sAux = sAux.replace(nombreLista, "");
				}
				html += '<input type="hidden" name="';
				html += cuerpoLista;
				html += '.';
				html += fila;
				html += '.';
				html += sAux;
				html += '" value="';
				html += elementos[i].value;
				html += '"/>';
				break;
			}
		}
	}
	html += '<input type="hidden" name="';
 	html += contextoFilaSeleccionada;
 	html += '" value="' + fila + '"/>';
	html += '</form>';
	html += '</body></html>';
	document.write(html);
	document.close();
}

//Funcion que deshabilita un campo de texto. El parametro objeto debe ser un puntero al control
function deshabilitaTF(objeto){
	if (ns) {
		if (objeto.disabled!=true) {
			objeto.lastOnfocus=objeto.onfocus
			objeto.lastOnblur=objeto.onblur
			objeto.onblur=""
			objeto.onfocus=objeto.blur;
		}
	}
	objeto.disabled=true;
}

//Funcion que habilita un campo de texto previamente deshabilitado. El parametro objeto debe ser un puntero al control
function habilitaTF(objeto){
	if (ns) {

		if (objeto.disabled){

			objeto.onfocus=objeto.lastOnfocus
			objeto.onblur=objeto.lastOnblur
		}
	}
	objeto.disabled=false;
}

//Esta funcion es llamada por el onclick de los botones de tipo submit.
function anulaEnvio(){
	document.forms[0].lastOnsubmit=document.forms[0].onsubmit
	document.forms[0].onsubmit=anula
}

//Funcion que se le asigna al formulario principal para que no se envie momentaneamente
function anula(){
	this.onsubmit=this.lastOnsubmit
	return false
}

//Funcion que deshabilita un boton. El parametro objeto debe ser un puntero al control
function deshabilitaBT(object){
	if (ns) {
		if (object.disabled!=true) {
			object.lastOnclick=object.onclick
			if (object.type=="submit")
			{
				object.onclick=anulaEnvio

			}
			else object.onclick=""
		}
	}
	object.disabled=true;
}

function habilitaBT(object){
	if (ns) {
		if (object.disabled){
			object.onclick=object.lastOnclick
		}
	}
	object.disabled=false;
}

// Funcion que marca la fila seleccionada en la tabla editable en Internet Explorer
function seleccionFilas(nombreLista, estilosPijama, estiloSeleccionado, fila, filaInicial, filaFinal) {
	var referencia = "";
	var nombre = "";
	var puntero;
	var layerAux;
	var filasSeleccionadas;
	// Se marcan como seleccionadas todas las filas seleccionadas
	filasSeleccionadas = getArrayFilasSeleccionadas(nombreLista,filaInicial,filaFinal);
	if (filasSeleccionadas.length > 1){
		for (var i = filaInicial; i < filaFinal; i++) {
			if(document.getElementById) {
				referencia = nombreLista+"fila"+i;
				puntero = document.getElementById(referencia);
			} else {
				referencia = "document.all."+nombreLista+"fila"+i;
				puntero = eval(referencia);
			}

			// Flag que indica si esta fila ha sido seleccionada
			var esSeleccionada = false;
			// Recorre el array de filas seleccionadas
			for (var j = 0; j< filasSeleccionadas.length; j++) {
				// Si la fila actual es seleccionada cambia el flag
				if(i == filasSeleccionadas[j]){
					esSeleccionada=true;
				}
			}
			// Las filas seleccionadas poseen un estilo diferente
			if(esSeleccionada){
				cambiarEstilo(puntero, estiloSeleccionado);
			}else {
				insertarEstiloPijama(puntero, i, estilosPijama);
			}
		}
	} else {

		for (var i = filaInicial; i < filaFinal; i++) {
			if(document.getElementById) {
				referencia = nombreLista+"fila"+i;
				puntero = document.getElementById(referencia);
			} else {
				referencia = "document.all."+nombreLista+"fila"+i;
				puntero = eval(referencia);
			}
			if(i == fila){
				if(puntero.className != estiloSeleccionado){
					cambiarEstilo(puntero, estiloSeleccionado);
				}else {
					insertarEstiloPijama(puntero, i, estilosPijama);
				}
			} else {
				var objeto = eval("document.forms[0]."+nombreLista+"_FILA"+i);
				if (objeto != null && objeto.checked)
					cambiarEstilo(puntero, estiloSeleccionado);
				else
					insertarEstiloPijama(puntero, i, estilosPijama);
			}
		}
	}

}

function cambiarEstilo(object, nuevoEstilo) {
	object.className = nuevoEstilo;
}

function insertarEstiloPijama(object, fila, estilosPijama) {
	if (estilosPijama != null) {
		if (fila % 2 == 0) {
	        // fila par
			cambiarEstilo(object, estilosPijama[0]);
		} else {
	        // fila impar
			cambiarEstilo(object, estilosPijama[1]);
		}
	}
}

function actualizarFilasSeleccionadas(nombreTabla, filaInicial, filaFinal) {
	var puntero = eval("document.forms[0]."+nombreTabla+"_CONTEXTO_FILAS_SELECCIONADAS");
	var sAux = "";
	var contador = 0;
	var objeto;

	for (var i = filaInicial; i < filaFinal; i++) {
		// Caso Checkboxes
		objeto = eval("document.forms[0]."+nombreTabla+"_FILA"+i);
		// Caso Radiobuttons
		if(objeto==null) {
			objeto = eval("document.forms[0].rb"+nombreTabla);
			if(objeto != null){
				if ((filaFinal - filaInicial) != 1)
					objeto = objeto[i-filaInicial];
			}
		}
		if(objeto != null && objeto.checked) {
			sAux += contador+"<sp=>"+i+"<sp0>";
			contador++;
		}
	}
	if(contador==0) {
		sAux = "0<sp=>-1";
	}
	puntero.value = sAux;
}

function getArrayFilasSeleccionadas(nombreTabla, filaInicial, filaFinal) {
	var arAux = new Array();
	var contador = 0;
	for (var i = filaInicial; i < filaFinal; i++) {
		// Caso Checkboxes
		var objeto = eval("document.forms[0]."+nombreTabla+"_FILA"+i);
		// Caso Radiobuttons
		if(objeto==null) {
			objeto = eval("document.forms[0].rb"+nombreTabla);
			if (objeto != null){
				if ((filaFinal - filaInicial) != 1)
					objeto = objeto[i-filaInicial];
			}
		}
		if(objeto != null && objeto.checked) {
			arAux[contador++] = i;
		}
	}
	return arAux;
}

// Esta funcion construye una URL a partir de las propiedades del accionador eReport Nacar
// las ctes estan definidas en funciones_arquitectura.jsp
function abreVentana(rutaPlantilla,params){
	if (rutaPlantilla!=""){
		if (params!=""){
			if (CFGREPORTUSER == "")
				URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT+"&"+params;
			else
				if (CFGREPORTPASSWORD == "")
					URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT+"&"+params+"&UserID="+CFGREPORTUSER;
				else
					URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT+"&"+params+"&UserID="+CFGREPORTUSER+"&Password="+CFGREPORTPASSWORD;
		}
		else{
			if (CFGREPORTUSER == "")
				URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT;
			else
				if (CFGREPORTPASSWORD == "")
					URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT+"&UserID="+CFGREPORTUSER;
				else
					URL=CFGREPORTACWEB+rutaPlantilla+CFGREPORTEXT+"&UserID="+CFGREPORTUSER+"&Password="+CFGREPORTPASSWORD;
		}
	}
	else {
		if (CFGREPORTUSER=="" || CFGREPORTPASSWORD == "")
			URL=CFGREPORTACADMIN;
		else
			URL=CFGREPORTACADMIN+"/filesfoldersmanager.jsp"+"?UserID="+CFGREPORTUSER+"&Password="+CFGREPORTPASSWORD;

	}
	window.open(URL);
}

//Funcion que devuelve el string del formulario
// Se introducen comillas simples en los datos para que se envien bien las cadenas con espacios
function construyeTrozoForm(numCompF,formAct,claveFr){
	var contador = 0;
	var clave = "";
	var valor = "";
	var component;
	var tmpComponents = "";

	for (contador = 0; contador < numCompF; contador++) {
		component = formAct.elements[contador];
		clave = component.name;
		valor = component.value;
		if (claveFr == "") {
			tmpComponents = tmpComponents + "<input type=hidden name='" + clave + "' value='" + valor +"'>";
		}
		else {
			tmpComponents = tmpComponents + "<input type=hidden name='" + claveFr + "." + clave + "' value='" + valor +"'>";
		}
	}
	return tmpComponents;
}

//Funcion que reconstruye el formulario de una pagina que contiene un control de negocio. Recupera el action
//del formulario principal y realiza el submit del formulario reconstruido.
function rebuildForm(pagina) {
	// Obtenemos el numero de componentes de la pagina actual.
	var numFormularios = pagina.forms.length
	var numCompForm = pagina.forms[0].length;
	var numCompFormSecundarios = 0;
	var compNegocio = pagina.getElementsByTagName("controlnegocio");

	if (self.frames.length > 0) {
			// Referencia al formulario de la pagina
			var formPrincipal = pagina.forms[0];
			// Recuperamos el action del formulario principal
			var actionFormPrincipal = formPrincipal.action;
			// Definimos la variable en la que vamos a escribir el resultado de la concatenacion de todos los componentes de la pagina
			var nuevoFormulario = "<form name=Prueba method=POST action= " + actionFormPrincipal + ">";
			// Recorremos los componentes del formulario y reescribimos el document de la pagina con campos ocultos.
			var contadorFormularios = 0;
			nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,formPrincipal,"")

			if (numFormularios > 1) {
				var nombreFormulario = "";
				var nombreComponente = "";
				var formularioSecundario;
				for (contadorFormularios = 1; contadorFormularios < numFormularios; contadorFormularios++) {
					formularioSecundario = pagina.forms[contadorFormularios];
					numCompForm = formularioSecundario.length;
					nombreFormulario = formularioSecundario.name;
					nombreComponente = formPrincipal.elements[nombreFormulario].value;
					nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,nombreFormulario,nombreComponente)
				}
			}
			// Recorremos cada uno de los frames internos de la pagina principal y anyadimos al nuevo formulario los componentes de estos frames
			//alert("Empezamos a recorrer frames...");
			var contadorInterno = 0;
			var numElemFrame = 0;
			var claveFrame = "";
			var formActual;
			var numFormFrames = 0;
			var contadorFormFrames = 0;
			for (contador = 0; contador < compNegocio.length; contador++) {
				numFormFrames = self.frames[contador].document.forms.length;
				if (numFormFrames > 0) {
					for (contadorFormFrames = 0; contadorFormFrames < numFormFrames; contadorFormFrames++) {
						claveFrame = compNegocio[contador].getAttribute("name");
						formActual = self.frames[claveFrame].document.forms[contadorFormFrames];
						numCompForm = formActual.length;
						numCompFormSecundarios = formActual.length;
						nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,formActual,claveFrame)
					}
				}
			}
			// Cerramos el tag del formulario
			nuevoFormulario = nuevoFormulario + "</form>";

			// Escribimos el formulario en el document.
			// Modificado para solucionar un problema en Netscape con XSL
			// no funciona el document.write al usar XSLs
			var elBody = document.getElementsByTagName("BODY")[0];
			var nuevoCustomForm = document.createElement("CUSTOMFORM");
			nuevoCustomForm.innerHTML = nuevoFormulario;
			elBody.appendChild(nuevoCustomForm);
			document.forms["Prueba"].submit();

		}
		else {

		}

  }

//Funcion que reconstruye el formulario de una pagina que contiene un control de negocio. Recupera el action del formulario
//principal y realiza el submit del formulario reconstruido.
function submitAndRebuildForm() {
	// Obtenemos el numero de componentes de la pagina actual.
	var numFormularios = document.forms.length
	var numCompForm = document.forms[0].length;
	var numCompFormSecundarios = 0;
	var compNegocio = document.getElementsByTagName("controlnegocio");
	if (self.frames.length > 0) {
		try{
			// Referencia al formulario de la pagina
			var formPrincipal = document.forms[0];
			// Recuperamos el action del formulario principal
			var actionFormPrincipal = formPrincipal.action;
			// Definimos la variable en la que vamos a escribir el resultado de la concatenacion de todos los componentes de la pagina
			var nuevoFormulario = "<form name=Prueba method=POST action= " + actionFormPrincipal + ">";
			// Recorremos los componentes del formulario y reescribimos el document de la pagina con campos ocultos.
			var contadorFormularios = 0;
			nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,formPrincipal,"")

			if (numFormularios > 1) {
				var nombreFormulario = "";
				var nombreComponente = "";
				var formularioSecundario;
				for (contadorFormularios = 1; contadorFormularios < numFormularios; contadorFormularios++) {
					formularioSecundario = document.forms[contadorFormularios];
					numCompForm = formularioSecundario.length;
					nombreFormulario = formularioSecundario.name;
					nombreComponente = formPrincipal.elements[nombreFormulario].value;
					nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,nombreFormulario,nombreComponente)
				}
			}

			// Recorremos cada uno de los frames internos de la pagina principal y anyadimos al nuevo formulario los componentes de estos frames
			var contadorInterno = 0;
			var numElemFrame = 0;
			var claveFrame = "";
			var formActual;
			var numFormFrames = 0;
			var contadorFormFrames = 0;
			for (contador = 0; contador < compNegocio.length; contador++) {
				numFormFrames = self.frames[contador].document.forms.length;
				if (numFormFrames > 0) {
					for (contadorFormFrames = 0; contadorFormFrames < numFormFrames; contadorFormFrames++) {
						claveFrame = compNegocio[contador].getAttribute("name");
						formActual = self.frames[claveFrame].document.forms[contadorFormFrames];
						numCompForm = formActual.length;
						numCompFormSecundarios = formActual.length;
						nuevoFormulario = nuevoFormulario + construyeTrozoForm(numCompForm,formActual,claveFrame)
					}
				}
			}
			// Cerramos el tag del formulario
			nuevoFormulario = nuevoFormulario + "</form>";
			// Escribimos el formulario en el document.
			// Modificado para solucionar un problema en Netscape con XSL
			//   no funciona el document.write al usar XSLs
			var elBody = document.getElementsByTagName("BODY")[0];
			var nuevoCustomForm = document.createElement("CUSTOMFORM");
			nuevoCustomForm.innerHTML = nuevoFormulario;
			elBody.appendChild(nuevoCustomForm);
			document.forms["Prueba"].submit();
		}catch(err){
			document.forms[0].submit();
		}
	}
	else {
		document.forms[0].submit();
	}
}

// Funcion para JetForm
function resetFlagEnviarFormulario() {
	enviarFormulario=true;
}

// Funcion para el Servicio de Mensajes
//Muestra una caja de mensaje diferenciando si el explorador es internet explorer (ie) o Netscape
function mostrarMensajes(tipoMensajes, arrayMensajes) {
	if (tipoMensajes == 0) {
		if(ie) {
			mostrarMensajeIE(arrayMensajes);
		}
		else {
			//En caso contrario es NetScape Navigator.
			mostrarMensajeNN(arrayMensajes);
		}
	}
	else if (tipoMensajes == 1) {
		mostrarErrores(arrayMensajes);
	}
}

// Funcion para el Servicio de Mensajes
//Obtiene el frame del contenedor a partir de su flujoId
//Poner try catch para controlar la definicion de variables
function obtenerContenedor(flujoId)
{
   var contenedor =null;
   var contenedora=false;
   var urlsDesconexionAux;
   var documento;
   var ventanasEmergentes_IdentificadoresAux=null;
   //variable para almacenar el nombre de la ventana padre
   var nombrePadre=null;
   try {
      //Se comprueba si se está lanzando el mensaje de error desde el contenedor o desde la página contenedora
      if (urlsDesconexion!=undefined && urlsDesconexion!=null){
        //Estoy en la pagina contenedora
        contenedora=true;
        urlsDesconexionAux=urlsDesconexion;
          documento=document;
        }else{
          //Estoy en el contenedor, luego tengo que tomar los datos de la página contenedora
          contenedora=false;
          urlsDesconexionAux=parent.urlsDesconexion;
          documento=parent.document;
        }
     }catch (err){
        try{
          contenedora=false;
          urlsDesconexionAux=parent.urlsDesconexion;
          documento=parent.document;
        }catch (err2){
          //Distinto dirbase
          urlsDesconexionAux=null;
        }
     }


    if (urlsDesconexionAux != undefined && urlsDesconexionAux!=null)
    {
  	   for (var i=0 ; i<urlsDesconexionAux.length ; i++){
  		  //identificador del contenedor
  		    var iden_conte = 'frame_'+urlsDesconexionAux[i][0];
  		    //se obtiene el frame del contenedor

  		    var frame = null;
  		    if (documento.getElementById(iden_conte).contentWindow)
  	    	{
  	        frame = documento.getElementById(iden_conte).contentWindow;
  	    	} else
  	    	{
  	        // IE
  	        frame = documento.frames[iden_conte].window;
  	    	}
  		    //var frame = getFrameContenedor(iden_conte);

  				//se recupera el flujo
  		    var idflujo = null;
  		    try{
  			   idflujo = frame.document.forms[0].flujo.value;
  		    }catch (err){
  			   idflujo = null;
  		    }
  		    if (idflujo!=null && flujoId==idflujo)
  		    {
  		    	contenedor=frame;
  		    	break;
  				}
  		}
  	}
  	if (contenedor!=null){
  	 return contenedor;
    }

    try{
      if (parent.parent.ventanasEmergentes_Identificadores!=undefined && parent.parent.ventanasEmergentes_Identificadores!=null && parent.parent.ventanasEmergentes_Identificadores.length>0)
      {
      		ventanasEmergentes_IdentificadoresAux=parent.parent.ventanasEmergentes_Identificadores;
        	documento=parent.parent.document;
					nombrePadre=parent.name;

      }
      else if (parent.ventanasEmergentes_Identificadores!=undefined && parent.ventanasEmergentes_Identificadores!=null && parent.ventanasEmergentes_Identificadores.length>0)
       	{
 	       	ventanasEmergentes_IdentificadoresAux=parent.ventanasEmergentes_Identificadores;
        	documento=parent.document;
        }
      	else {
        	ventanasEmergentes_IdentificadoresAux=ventanasEmergentes_Identificadores;
        	documento=document;
        }
   }catch (err){
      try{
				//recogemos los identificadores que tenga la ventana
        ventanasEmergentes_IdentificadoresAux=parent.ventanasEmergentes_Identificadores;
        documento=parent.document;
      }catch (err2){
        //Distinto dirbase
        ventanasEmergentes_IdentificadoresAux=null;
      }
   }

    if (ventanasEmergentes_IdentificadoresAux != undefined && ventanasEmergentes_IdentificadoresAux!=null)
   {
  	   for (var i=0 ; i<ventanasEmergentes_IdentificadoresAux.length ; i++){
		  //identificador del contenedor
  		    var iden_conte = 'iframeinterno_'+ventanasEmergentes_IdentificadoresAux[i];
		    //se obtiene el frame del contenedor
  		    try{
		    var frame = null;
		    if (documento.getElementById(iden_conte).contentWindow)
	    	{
	        frame = documento.getElementById(iden_conte).contentWindow;
	    	} else
	    	{
	        // IE
	        frame = documento.frames[iden_conte].window;
	    	}
    	    }catch (err){
            frame=null;
          }

				//se recupera el flujo
		    var idflujo = null;
		    try{
			   idflujo = frame.document.forms[0].flujo.value;
		    }catch (err){
			   idflujo = null;
		    }
		    if (idflujo!=null && flujoId==idflujo)
		    {
		    	contenedor=frame;
		    	break;
				}
					else if (iden_conte==nombrePadre){
						contenedor=frame;
  		    	break;
			}
		}
	}
	return contenedor;
}

// Funcion para el Servicio de Mensajes
//Obtiene el id del frame del contenedor a partir de su flujoId
function obtenerIDContenedor(flujoId)
{
   var contenedorID =null;

   var contenedora=false;
   var urlsDesconexionAux;
   var documento;
   var nombrePadre=null;

   try {
      //Se comprueba si se está en la página contenedora o en el contenedor
      if (urlsDesconexion!=undefined && urlsDesconexion!=undefined){
        contenedora=true;
        urlsDesconexionAux=urlsDesconexion;
          documento=document;
        }else{
          contenedora=false;
          urlsDesconexionAux=parent.urlsDesconexion;
          documento=parent.document;
        }
     }catch (err){
        try{
          contenedora=false;
          urlsDesconexionAux=parent.urlsDesconexion;
          documento=parent.document;
        }catch (err2){
          //Distinto dirbase
          urlsDesconexionAux=null;
        }
     }

     if (urlsDesconexionAux != undefined && urlsDesconexionAux!=null)
     {
  	   for (var i=0 ; i<urlsDesconexionAux.length ; i++){
  		  //identificador del contenedor
  		    var iden_conte = 'frame_'+urlsDesconexionAux[i][0];
  		    //se obtiene el frame del contenedor

  		    var window = null;
  		    var frame = null;
  			  if (documento.getElementById(iden_conte).contentWindow)
  	    	{
  	        window = documento.getElementById(iden_conte).contentWindow;
  	    	} else
  	    	{
  	        // IE
  	        window = documento.frames[iden_conte].window;
  	    	}

  				//se recupera el flujo
  		    var idflujo = null;
  		    try{
  			   idflujo = window.document.forms[0].flujo.value;
  		    }catch (err){
  			   idflujo = null;
  		    }
  		    if (idflujo!=null && flujoId==idflujo)
  		    {
  		    	contenedorID=urlsDesconexionAux[i][0];
  		    	break;
  				}
  		}
  	}
  	if (contenedorID!=null){
  	 return contenedorID;
    }

    try{
      if (parent.parent.ventanasEmergentes_Identificadores!=undefined && parent.parent.ventanasEmergentes_Identificadores!=null && parent.parent.ventanasEmergentes_Identificadores.length>0){
        	ventanasEmergentes_IdentificadoresAux=parent.parent.ventanasEmergentes_Identificadores;
        	documento=parent.parent.document;
					nombrePadre=parent.name;
      }else{
       	if (parent.ventanasEmergentes_Identificadores!=undefined && parent.ventanasEmergentes_Identificadores!=null && parent.ventanasEmergentes_Identificadores.length>0)
       	{
 	       	ventanasEmergentes_IdentificadoresAux=parent.ventanasEmergentes_Identificadores;
        	documento=parent.document;
        }
      	else{
      		ventanasEmergentes_IdentificadoresAux=ventanasEmergentes_Identificadores;
        	documento=document;
        }
      }
   }catch (err){
      try{
				//recogemos los identificadores que tenga la ventana
        ventanasEmergentes_IdentificadoresAux=parent.ventanasEmergentes_Identificadores;
        documento=parent.document;
      }catch (err2){
        //Distinto dominio
        ventanasEmergentes_IdentificadoresAux=null;
      }
    }


     if (ventanasEmergentes_IdentificadoresAux != undefined && ventanasEmergentes_IdentificadoresAux!=null)
   {
  	   for (var i=0 ; i<ventanasEmergentes_IdentificadoresAux.length ; i++){
		  //identificador del contenedor
  		    var iden_conte = 'iframeinterno_'+ventanasEmergentes_IdentificadoresAux[i];
		    //se obtiene el frame del contenedor

		    var window = null;
		    var frame = null;
  		    try{
			  if (documento.getElementById(iden_conte).contentWindow)
	    	{
	        window = documento.getElementById(iden_conte).contentWindow;
	    	} else
	    	{
	        // IE
	        window = documento.frames[iden_conte].window;
	    	}
    		  }catch (err){
            window=null;
          }
				//se recupera el flujo
		    var idflujo = null;
		    try{
			   idflujo = window.document.forms[0].flujo.value;
		    }catch (err){
			   idflujo = null;
		    }
		    if (idflujo!=null && flujoId==idflujo)
		    {
  		    	contenedorID=ventanasEmergentes_IdentificadoresAux[i];
		    	break;
  			}else if(iden_conte==nombrePadre){
						contenedorID=ventanasEmergentes_IdentificadoresAux[i];
  		    	break;
			}
		}
	}
	return contenedorID;
}

// Muestra una caja de mensaje modal en internet explorer.
function mostrarMensajeIE (paramMensaje) {
	var flagModifAlto=false;
	var variableRetorno = paramMensaje;
	var ancho;
	var alto;
	if (paramMensaje[4] == 'false'){
		// Formato de mensajes antiguo
		ancho = (screen.width)/3;
	}
	else{
		//Formato de mensajes nuevo
	  if (paramMensaje[2] == 'null' || paramMensaje[2] == 0 || paramMensaje[2] == undefined){
	  	// No viene informado el ancho
	    ancho = (screen.width)/2.5;
	  }
	  else{
	  	// El ancho de la ventana será el informado
	  	ancho = paramMensaje[2];
	  }
  }

	if (paramMensaje[4] == 'false'){
		// Formato de mensajes antiguo
		alto = (screen.height)/4;
	}
	else{
		//Formato de mensajes nuevo
	  if (paramMensaje[3] == 'null' || paramMensaje[3] == 0 || paramMensaje[3] == undefined){
	  	// No viene informado el ancho
	    alto = (screen.height)/3.3;
	  }
	  else{
	  	// El ancho de la ventana será el informado
	  	alto = paramMensaje[3];
	  }
  }

	//pasamos los valores de ancho, alto y mensaje origen a la ventana modal.
	var myObject = new Object();
	myObject.ancho = (ancho*0.08);
	myObject.alto = (alto*0.03);
	myObject.mensOrigen=paramMensaje[1];
	//var ancho = screen.width;
	//var alto = screen.height;
//	myObject.ancho = ancho;
//	myObject.alto = alto;

	if(paramMensaje[5] != null && paramMensaje[5] != "" && paramMensaje[5].toLowerCase() == "true")
	{

		//ancho y alto de mensajes Dojo definidos en configuración
	    if (paramMensaje[8] == 'true'){
		  //Formato de mensajes nuevo
	      if (paramMensaje[9] != 0){
	  	    ancho = paramMensaje[9];
	      }
	      if (paramMensaje[10] != 0){
	  	    alto = paramMensaje[10];
			flagModifAlto=true;
	      }
        }


		try{
			if(paramMensaje[6] != null && paramMensaje[6] != "" )
			{
				var frame = obtenerContenedor(paramMensaje[6]);
				var frameId =obtenerIDContenedor(paramMensaje[6]);

	       if (frame != null){
				//Recogemos el Id del flujo del frame obtenido
				var idFrame = frame.document.forms[0].flujo.value;
				//Comprobamos si es el mismo idFlujo que ha lanzado la petición
				if (idFrame!=paramMensaje[1]){
					try{
							//Si el frame en el que nos encontramos tiene frames hijos
							//buscamos cual es el frame desde el que se lanzo la petición
							if (frame.ventanasEmergentes_Identificadores.length>0){
								for (var i=0 ; i<frame.ventanasEmergentes_Identificadores.length ; i++){

									if (i==frame.ventanasEmergentes_Identificadores[i])
									{
												//recuperamos el id del frame hijo
												var frameId2=frame.ventanasEmergentes_Identificadores[i];
												//formamos su nombre completo
												var nombreCompleto='iframeinterno_'+frameId2;

												try{

													if (frame.document.getElementById(nombreCompleto).contentWindow)
													{
															//recuperamos el contenido del frama hijo encontrado
															frameN2 = frame.document.getElementById(nombreCompleto).contentWindow;
															//obtenemos su flujoId
															paramMensaje[7]=frameN2.document.forms[0].flujo.value;
													} else
													{
													// IE
														//recuperamos el contenido del frama hijo encontrado
														frameN2 = frame.document.frames[nombreCompleto].window;
														//obtenemos su flujoId
														paramMensaje[7]=frame.document.forms[0].flujo.value;
													}
												}catch (err){
													frameN2=null;
												}
												//Si el flujoId obtenido es igual al que lanzo la petición es que hemos encontrado el frame
												//hijo que lanzo la petición
												if (paramMensaje[7]==paramMensaje[1]){
													//se comprueba si hay que mostrar el mensaje error a nivel del padre
													if(frame!= null && frameId2!= null && frame.mostrarMensajesContenedor!=undefined && frame.mostrarMensajesContenedor[frameId2]!= undefined && frame.mostrarMensajesContenedor[frameId2]!= null && frame.mostrarMensajesContenedor[frameId2]!=true){
														//recuperamos el flujoId del frame padre
														paramMensaje[7]=frame.document.forms[0].flujo.value;
														//mostramos el mensaje error a nivel del padre
														parent.parent.mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
														break;
													}else{
														mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
														break;
													}
											}
											}
									}
								}

					}catch(error){
				if (frame!= null && frameId!= null && parent.mostrarMensajesContenedor!=undefined && parent.mostrarMensajesContenedor[frameId]!= undefined && parent.mostrarMensajesContenedor[frameId]!= null && parent.mostrarMensajesContenedor[frameId]!=true)
				{
						    	parent.mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
						}
						else {
							mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
						}
					}
				}else if (frame!= null && frameId!= null && parent.mostrarMensajesContenedor!=undefined && parent.mostrarMensajesContenedor[frameId]!= undefined && parent.mostrarMensajesContenedor[frameId]!= null && parent.mostrarMensajesContenedor[frameId]!=true)
						{
		    	parent.mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);

				}
				else {
					mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
				}
			}else{
				mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);}

      }
			else{
				mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto);
			}
		}catch (err){
			alert( literales_traducirLiteralMultiidioma('UTILS_ERROR_DOJO')+ err);
		  }
	}
	else
	{
	  informarServletGUCVentanaModal(true);
		myReturnValue = window.showModalDialog(paramMensaje[0], myObject, "center:yes;status:no;help:no; dialogHeight:"+alto+"px; dialogWidth:"+ancho+"px");
    informarServletGUCVentanaModal(false);
		if (myReturnValue) {
			//En paramMensaje[1] viaja el flujo origen del mensaje
			enviaFormularioMensajes(document, myReturnValue, paramMensaje[1]);
		} else if(myReturnValue == '') {
			mostrarMensajeIE(variableRetorno);
		}
	}
}
/**
 * Funcion que informa a través del servlet de mensaje GUC
 * si se va mostrar una ventana modal con showModalDialog o se a cerrado
 */
function informarServletGUCVentanaModal(ismostrarVentanaModal){
	//Se comprueba que está activo el servidor web
	if (utils_isComuServidorWeb()){
		var	url_base="http://localhost:"+puertoServidorWeb+"/mensajeGUC?";

		 var cabecera = "valueCabecera=MOSTRAR_VENTANA_MODAL&isMostrarVentanaModal="+ismostrarVentanaModal;

		utils_servidorWeb_ejecutarPeticionAJAX(url_base,null,null,"false",utils_servidorWeb_funcionErrorRespuestaGUC,cabecera);
	}
}

function mostrarMensajeDojo(paramMensaje,ancho,alto){
	mostrarMensajeDojo(paramMensaje,ancho,alto,false);
}

function mostrarMensajeDojo(paramMensaje,ancho,alto,flagModifAlto){
	setTimeout("mostrarMensajeDojo2('"+paramMensaje+"',"+ancho+","+alto+","+flagModifAlto+")",100);
}
function esperar(tiempoPausa)
{
	var inicio = new Date().getTime(); 
	while (new Date().getTime() < inicio + tiempoPausa);
}


function mostrarMensajePesado(paramMensaje){
	
	paramMensaje=paramMensaje.split(",");

	origenMensaje=paramMensaje[1];

	var parametros=obtenerParametrosMensaje(paramMensaje);

	var urlPeticionFlujoId = null;
	// se crea la url para recuperar el flujoId
	urlPeticionFlujoId = paramMensaje[0].substring(0,paramMensaje[0].indexOf("&evento="));
	urlPeticionFlujoId = urlPeticionFlujoId + "&evento=0xAD001008";
	var literal="";
		
	literal= ejecutarPeticionAJAX(urlPeticionFlujoId,null,null,false);
	

  invocarCreacionMensajePesado(literal,parametros[0],parametros[1],parametros[2],parametros[3]);

   
}

function obtenerParametrosMensaje(paramMensaje){
	var parametros=new Array();
	//Ancho
	if(paramMensaje[2]!=undefined && paramMensaje[2]!=""){
		parametros[0]=paramMensaje[2];
	}
	//Alto
	if(paramMensaje[3]!=undefined && paramMensaje[3]!=""){
		parametros[1]=paramMensaje[3];
	}


	if (paramMensaje[4] == 'false'){
		// Formato de mensajes antiguo
		parametros[0]=  (screen.width)/3;
	}else{
			//Formato de mensajes nuevo
		  if (paramMensaje[2] == 'null' || paramMensaje[2] == 0 || paramMensaje[2] == undefined){
			// No viene informado el ancho
			parametros[0]=  (screen.width)/2.5;
		  }
		  else{
			// El ancho de la ventana será el informado
			parametros[0] = paramMensaje[2];
		  }
	 }

	if (paramMensaje[4] == 'false'){
		// Formato de mensajes antiguo
		parametros[1] = (screen.height)/4;
	}
	else{
		  //Formato de mensajes nuevo
		  if (paramMensaje[3] == 'null' || paramMensaje[3] == 0 || paramMensaje[3] == undefined){
		  // No viene informado el ancho
				parametros[1] = (screen.height)/3.3;
		  }
		  else{
			// El ancho de la ventana será el informado
				parametros[1] = paramMensaje[3];
		  }
	  }

	if(paramMensaje[5] != null && paramMensaje[5] != "" && paramMensaje[5].toLowerCase() == "true")
	{

		//ancho y alto de mensajes Dojo definidos en configuración
	    if (paramMensaje[8] == 'true'){
		  //Formato de mensajes nuevo
	      if (paramMensaje[9] != 0){
	  	    parametros[0] = paramMensaje[9];
	      }
	      if (paramMensaje[10] != 0){
	  	    parametros[1] = paramMensaje[10];
	      }
        }
	}

	var nombreVentana=obtenerNombreVentanaMensaje(paramMensaje[0])
	ventanaMensajeLigeroPesado=nombreVentana;
	var tipoDialogo=obtenerTipoVentana(nombreVentana);

	parametros[2]=tipoDialogo[0];

	parametros[3]=tipoDialogo[1];

	return parametros;
}

function obtenerTipoVentana(ventana){
	var tipoDialogo=new Array();
	var tipo="";
	if(ventana.indexOf("109") != -1){
			var posTipo = ventana.indexOf("109");
			tipo=ventana.substring(posTipo+3);
	}
	
	var literal="";
	var botones="";
	if(tipo!="" && tipo.length==2)
	{
		literal=tipo.substring(0,1);
		botones=tipo.substring(1);
	}
	if(literal!="" && literal.length>0){
		if(literal==0)
		{
			tipoDialogo[0]="0";
		}
		if(literal==1)
		{
			tipoDialogo[0]="1";
		}
		if(literal==3)
		{
			tipoDialogo[0]=	"3";	
		}
		if(literal==4)
		{
			tipoDialogo[0]=	"1";	
		}
	}
	if(botones!="" && botones.length>0){
		if(botones==0)
		{
			tipoDialogo[1]="-1";
		}
		if(botones==1)
		{
			tipoDialogo[1]="0";
		}
		if(botones==2)
		{
			tipoDialogo[1]=	"1";	
		}
		if(botones==3)
		{
			tipoDialogo[1]=	"2";	
		}
	}

	return tipoDialogo;
}

function obtenerNombreVentanaMensaje(url){
	var tokenizer = url.split("&");
	var toklower = "";
	var ventana = "";
	for(var contador = 0;contador<tokenizer.length;contador++){
		toklower = tokenizer[contador].toLowerCase();
		if(toklower.indexOf("ventana") != -1){
			var ventana = toklower.substring(8);
		}	
	}
	return ventana;
}

function invocarCreacionMensajePesado(literal,ancho,alto,tipoMensaje,tipoDialogo){
		
	var codOper="MENSLIGP";
	var parametros="PAR_INICIO.LITERAL="+literal+"&PAR_INICIO.ANCHO="+ancho+"&PAR_INICIO.ALTO="+alto+"&PAR_INICIO.TIPO_MENSAJE="+tipoMensaje+"&PAR_INICIO.TIPO_DIALOGO="+tipoDialogo+"&mensajeModal=true";
	ejecutarOperacionNACAREscenarioContenedoresPesados(codOper, parametros, null, null,null,puertoServidorWeb,claveseguridadSWL,mensaje_contenedoresPesados);
}

function ejecutarOperacionNACAREscenarioContenedoresPesados(opNACAR, parametros, escenario, tipoEjecucion,descripcion,puerto,claveSeguridad,funcionRespuesta) {
	var archivoTXT="";
	 
	if(parametros != null && parametros!="null") 
	{
		archivoTXT += "&"+parametros;
	}
	if(escenario != null && escenario!="null") {

		archivoTXT += "&escenario="+escenario;
	}
	if(tipoEjecucion != null && tipoEjecucion!="null") {

		archivoTXT += "&tipoEjecucion="+tipoEjecucion;
	}
	if(descripcion != null && descripcion!="null") {

		archivoTXT += "&descripcion="+descripcion;
	}

	if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
		
		archivoTXT += "&operacion="+opNACAR;
	}
	
	if(claveSeguridad != null && claveSeguridad !="" && claveSeguridad!="null") {
		
		archivoTXT += "&claveseguridad="+claveSeguridad;
	}
	
	archivoTXT ="cabecera=CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoTXT;
	var	url="http://localhost:"+puerto;
	var url_base=url+"/comunicacion";
	
	//Llamada a la función que lanza la petición AJAX
	utils_servidorWeb_ejecutarPeticionAJAX(url_base,funcionRespuesta,"null",true,utils_servidorWeb_funcionError,archivoTXT);
	
};

var intervaloComprobacionMPL=null;

function mensaje_contenedoresPesados(control,evento){
	var cadena='esperandoRespuestaMensajeLigeroPesado()';
	intervaloComprobacionMPL=setInterval(cadena,1000);
}

function esperandoRespuestaMensajeLigeroPesado(){
	
	var	url_base="http://localhost:"+puertoServidorWeb+"/contXsl";
	var datos="&datos=OBTENER_PULSACION_MENSAJE_PL";
	utils_servidorWeb_ejecutarPeticionAJAX(url_base,utils_mensajeLigeroPesado_pulsacion,null,true,utils_funcionErrorMensajeLigero,datos);
}

function utils_funcionErrorMensajeLigero(control,evento){

}

var ventanaMensajeLigeroPesado="";

function utils_mensajeLigeroPesado_pulsacion(control,evento){
	var resultado=evento;
	if(resultado!=undefined && resultado!=null && resultado!="SIN_FINALIZAR" && resultado!="")
	{
		clearInterval(intervaloComprobacionMPL);
		document.forms[0].evento.value=resultado;
		
		var eventoM = document.createElement('input');
		eventoM.setAttribute("type", "hidden");
		eventoM.setAttribute("name", "evento");
		eventoM.setAttribute("id","evento");
		eventoM.setAttribute("value",resultado);

		var ventanaM = document.createElement('input');
		ventanaM.setAttribute("type", "hidden");
		ventanaM.setAttribute("name", "ventana");
		ventanaM.setAttribute("id","ventana");
		ventanaM.setAttribute("value",ventanaMensajeLigeroPesado);

		var flujoM = document.createElement('input');
		flujoM.setAttribute("type", "hidden");
		flujoM.setAttribute("name", "flujo");
		flujoM.setAttribute("id","flujo");
		flujoM.setAttribute("value",document.getElementById("flujo").value);



		enviaFormularioMensajesCP(document, eventoM, ventanaM, flujoM , origenMensaje)

	}
}

function construyeTrozoFormCP(numCompF,formAct,documento, nuevoFormulario){
	var contador = 0;
	var clave = "";
	var valor = "";
	var component;
	var tmpComponents = "";

	for (contador = 0; contador < numCompF; contador++) {
		component = formAct.elements[contador];
		clave = component.name;
		valor = component.value;
		
		var nuevoInput = document.createElement('input');
		nuevoInput.setAttribute("type", "hidden");
		nuevoInput.setAttribute("name",clave);
		nuevoInput.setAttribute("id",clave);
		nuevoInput.setAttribute("value",valor);
		nuevoFormulario.appendChild(nuevoInput);
	
	}
	return nuevoFormulario;
}

// Funcion para el Servicio de Mensajes
function enviaFormularioMensajesCP(paginaActual, evento, ventana, flujo, flujoOrigenMensaje) {
	// Referencia al formulario de la pagina
	var formPrincipal = paginaActual.forms[0];
	// Recuperamos el action del formulario principal
	var actionFormPrincipal = formPrincipal.action;
	// Definimos la variable en la que vamos a escribir el resultado de la concatenacion de todos los componentes de la pagina

	var nuevoFormulario = document.createElement('form');
    nuevoFormulario.setAttribute("method", "POST");
	nuevoFormulario.setAttribute("action", actionFormPrincipal);
    nuevoFormulario.setAttribute("name", "Mensaje");
    nuevoFormulario.setAttribute("id","Mensaje");
    
	var nuevoInput = document.createElement('input');
    nuevoInput.setAttribute("type", "hidden");
    nuevoInput.setAttribute("name", "origenMensaje");
    nuevoInput.setAttribute("id","origenMensaje");
    nuevoInput.setAttribute("value",flujoOrigenMensaje);

	var documento=document;

	var numComp = document.forms[0].length;

	nuevoFormulario.appendChild(nuevoInput);


	nuevoFormulario.appendChild(evento);
	nuevoFormulario.appendChild(ventana);
	nuevoFormulario.appendChild(flujo);

	documento.appendChild(nuevoFormulario);

	paginaActual.close();
	paginaActual.forms["Mensaje"].submit();
}

function mostrarMensajeDojo2(paramMensaje,ancho,alto,flagModifAlto){
	
	if(typeof("VMODAL_CONTP")!=undefined && VMODAL_CONTP!=undefined && (VMODAL_CONTP==true || VMODAL_CONTP=="true")){
		mostrarMensajePesado(paramMensaje);
	}else{
	paramMensaje=paramMensaje.split(",");
	var linke=document.createElement("link")
	linke.rel="stylesheet";
	linke.type="text/css";

	if (ie==true) nav="IE";
	else nav="NS";

	estilo="Nacar" + nav + "1024" + "v" + paramMensaje[12];

	linke.href=paramMensaje[11] + estilo + ".css";

	var estilotundra=document.createElement("link");
	estilotundra.rel="stylesheet";
	estilotundra.type="text/css";
	estilotundra.href="/"+nombreArquitecturaAux+"_es_web_pub/js/dojo/dijit/themes/tundra/tundra.css";
	var estiloMDojo=document.createElement("link");
	estiloMDojo.rel="stylesheet";
	estiloMDojo.type="text/css";
	estiloMDojo.href="/"+nombreArquitecturaAux+"_es_web_pub/estilos/mensajesDojo.css";
	a=document.getElementsByTagName("HTML");
	b=a[0].getElementsByTagName("HEAD");

	b[0].appendChild(linke);
	try{
		if (paramMensaje[7]!='null'){
			//almaceno el flujoId del padre del frame que lanzo la petición
			flujoIDOrigenMensajeDojo=paramMensaje[7];
			//almaceno el flujoId del frame que lanzo la petición
			flujoIDPadreMensajeDojo=paramMensaje[6];
			//variable que indica que se ha realizado la petición desde un frame hijo
			mensajeEnHijo=true;
		}
		else{
			// Se inicializa la varible con el flujoID del que ha hecho la petición Dojo.
			flujoIDOrigenMensajeDojo=paramMensaje[6];
		}
	}catch(error){
	// Se inicializa la varible con el flujoID del que ha hecho la petición Dojo.
	flujoIDOrigenMensajeDojo=paramMensaje[6];
	}
	// Se almacena el valor de estilo para restaurarlo en caso de ser necesario.
	estiloOriginalMensajeDojo=document.body.className;
	// Se inicializa la varible con el flujoID del origen del mensaje
	origenMensaje=paramMensaje[1];

	dojo.require("dojo.dnd.Source");
	dojo.require("dijit.Dialog");

	b[0].appendChild(estilotundra);
  cambiarEstilo(document.body,"tundra");
	b[0].appendChild(estiloMDojo);

	var oDialog = new dijit.Dialog(
	{id: "Dialog1", href: paramMensaje[0]});

	dojo.addOnLoad(function() {
      dojo.connect(oDialog.domNode, 'onkeypress', function (evt) {
		/******MODIFICADO PARA CONTROLAR FIREFOX******/
        //key = evt.keyCode;
		key = (ns) ? evt.which : window.event.keyCode;
		/******FIN MODIFICACION******/
        if(key == dojo.keys.ESCAPE) {
                dojo.stopEvent(evt);
        }
      });
   });

	oDialog.preload = false;
	oDialog.toggle = "fade";
	oDialog.windowState = "normal";
	oDialog.cacheContent =	false;
	oDialog.refreshOnShow = true;
	oDialog.hasShadow = true;
	oDialog.executeScripts = true;
	oDialog.resizable = false;
  oDialog.domNode.style.width = ancho+"px";

  if(ns || flagModifAlto)
  	oDialog.domNode.style.height = alto+"px";
	
	var aspa = true;
	var migradas = new Array();
	migradas[0] = "atclve10900";
	migradas[1] = "atclve10910";
	migradas[2] = "atclve10911";
	migradas[3] = "atclve10912";
	migradas[4] = "atclve10913";
	migradas[5] = "atclve10920";
	migradas[6] = "atclve10921";
	migradas[7] = "atclve10922";
	migradas[8] = "atclve10923";
	migradas[9] = "atclve10930";
	migradas[10] = "atclve10931";
	migradas[11] = "atclve10932";
	migradas[12] = "atclve10933";
	migradas[13] = "kgcrve00055";
	migradas[14] = "atclve10970";
	if (paramMensaje != null && paramMensaje != ""){
		var tokenizer = paramMensaje[0].split("&");
		var toklower = "";
		for(var contador = 0;contador<tokenizer.length;contador++){
			toklower = tokenizer[contador].toLowerCase();
			if(toklower.indexOf("ventana") != -1){
				var ventana = toklower.substring(8);
				for(var cont = 0; cont<migradas.length;cont++){
					if(ventana == migradas[cont]){
						aspa = false;
						break;
					}
				}
			}
			if(!aspa)break;
		}
	}
	if(!aspa){
		oDialog.titleBar.style.display='none';
		oDialog.closeButtonNode.style.display='none';
		oDialog.titleNode.style.display='none';
	}
	oDialog._moveable = new dojo.dnd.Moveable(oDialog.domNode, { handle: oDialog.containerNode });


	oDialog.parseOnLoad=false;
	oDialog.onLoad=function(){		
		cambiarEstilo(document.body,"sinborde");


    if (ie==false)
             	cambiarEstilo(document.body,"firefox sinborde");
	  if(document.getElementById("detalles"))
        document.getElementById("detalles").innerHTML=literales_traducirLiteralMultiidioma('UTILS_MENSAJE_ORIGEN')	+paramMensaje[1]+'</br>'+ document.getElementById("detalles").innerHTML;
		
		var botonDefecto;

		
		if(this.domNode.getElementsByTagName("FORM")[0].BotonDefecto){			
			if(this.domNode.getElementsByTagName("FORM")[0].BotonDefecto.value != "-1"){
					botonDefecto=this.domNode.getElementsByTagName("FORM")[0].elements[this.domNode.getElementsByTagName("FORM")[0].BotonDefecto.value];
			}
		}	
		


		var elements=this.domNode.getElementsByTagName("*");
		var inputs=elements.length;		
		var found=false;
		var focusableInit;		
		for(var i=0;i<inputs;i++){
			if(!found && (elements[i].tagName == "A" || ( elements[i].tagName=="INPUT" && elements[i].type != "hidden") )){
				focusableInit=elements[i];
				found=true;
			}
			if(elements[i].type=="button"){
							botonInicial=this.domNode.getElementsByTagName("FORM")[0].elements[i];
							break;
			}
		}

		if(!aspa){
			oDialog.titleBar=focusableInit;			
		}

	//damos tiempo para pintado en rto q es mas lento
		if(botonDefecto){						
			setTimeout(dojo.hitch(this, function(){
				dijit.focus(botonDefecto);
			}), 150);			
		}
		else{
			setTimeout(dojo.hitch(this, function(){
				dijit.focus(botonInicial);
			}), 150);			
		}


	}
		oDialog.uninitialize=function(){  //arregla bug dojo				
						dojo.forEach(oDialog._modalconnects, dojo.disconnect);
						oDialog._modalconnects = [];				
						this.inherited("uninitialize",arguments);
		}

	oDialog.startup();
	oDialog.show();
	}
}

// Funcion para el Servicio de Mensajes
// Muestra una caja de mensaje modal en Netscape Navigator.
function mostrarMensajeNN (paramMensaje) {
	var variableRetorno = paramMensaje;
	var frameN2;
	myReturnValue = null;
  var ancho, alto;
	if (paramMensaje[9] == 0 || paramMensaje[5] == 'false'){
		ancho = (screen.width)/3;
	}
	else{
		ancho = paramMensaje[9];
	}
	if (paramMensaje[10] == 0 || paramMensaje[5] == 'false'){
		alto = (screen.height)/4;
	}
	else{
		alto  = paramMensaje[10];
	}
	var cordx = (screen.height - alto) / 2;
	var cordy = (screen.width - ancho) / 2;

	if(paramMensaje[5] != null && paramMensaje[5] != "" && paramMensaje[5].toLowerCase() == "true")
	{
		try{
			if(paramMensaje[6] != null && paramMensaje[6] != "" )
			{
				var frame = obtenerContenedor(paramMensaje[6]);
				var frameId =obtenerIDContenedor(paramMensaje[6]);

				 if (frame != null){
				//Recogemos el Id del flujo del frame obtenido
				var idFrame = frame.document.forms[0].flujo.value;
				//Comprobamos si es el mismo idFlujo que ha lanzado la petición
				if (idFrame!=paramMensaje[1]){
					try{
							//Si el frame en el que nos encontramos tiene frames hijos
							//buscamos cual es el frame desde el que se lanzo la petición
							if (frame.ventanasEmergentes_Identificadores.length>0){
								for (var i=0 ; i<frame.ventanasEmergentes_Identificadores.length ; i++){

									if (i==frame.ventanasEmergentes_Identificadores[i])
									{
												//recuperamos el id del frame hijo
												var frameId2=frame.ventanasEmergentes_Identificadores[i];
												//formamos su nombre completo
												var nombreCompleto='iframeinterno_'+frameId2;
												try{

													if (frame.document.getElementById(nombreCompleto).contentWindow)
													{
															//recuperamos el contenido del frama hijo encontrado
															frameN2 = frame.document.getElementById(nombreCompleto).contentWindow;
															//obtenemos su flujoId
															paramMensaje[7]=frameN2.document.forms[0].flujo.value;
													} else
													{
														// IE
														//recuperamos el contenido del frama hijo encontrado
														frameN2 = frame.document.frames[nombreCompleto].window;
														//obtenemos su flujoId
														paramMensaje[7]=frame.document.forms[0].flujo.value;
													}
												}catch (err){
													frameN2=null;
												}
												//Si el flujoId obtenido es igual al que lanzo la petición es que hemos encontrado el frame
												//hijo que lanzo la petición
												if (paramMensaje[7]==paramMensaje[1]){
													//se comprueba si hay que mostrar el mensaje error a nivel del padre
													if(frame!= null && frameId2!= null && frame.mostrarMensajesContenedor!=undefined && frame.mostrarMensajesContenedor[frameId2]!= undefined && frame.mostrarMensajesContenedor[frameId2]!= null && frame.mostrarMensajesContenedor[frameId2]!=true){
														//recuperamos el flujoId del frame padre
														paramMensaje[7]=frame.document.forms[0].flujo.value;
														//mostramos el mensaje error a nivel del padre
														parent.parent.mostrarMensajeDojo(paramMensaje,ancho,alto);
														break;
													}else{
														mostrarMensajeDojo(paramMensaje,ancho,alto);
														break;
													}
											}
											}
									}
								}

					}catch(error){
				if (frame!= null && frameId!= null && parent.mostrarMensajesContenedor!=undefined && parent.mostrarMensajesContenedor[frameId]!= undefined && parent.mostrarMensajesContenedor[frameId]!= null && parent.mostrarMensajesContenedor[frameId]!=true)
				{
				    	parent.mostrarMensajeDojo(paramMensaje,ancho,alto);
				}
				else{
					mostrarMensajeDojo(paramMensaje,ancho,alto);
						}
				}
				}else if (frame!= null && frameId!= null && parent.mostrarMensajesContenedor!=undefined && parent.mostrarMensajesContenedor[frameId]!= undefined && parent.mostrarMensajesContenedor[frameId]!= null && parent.mostrarMensajesContenedor[frameId]!=true)
						{
						    	parent.mostrarMensajeDojo(paramMensaje,ancho,alto);
						}
						else {
								mostrarMensajeDojo(paramMensaje,ancho,alto);
						}
			}else{	mostrarMensajeDojo(paramMensaje,ancho,alto);}
      }
			else{
				mostrarMensajeDojo(paramMensaje,ancho,alto);
			}
		}catch (err){
			alert( literales_traducirLiteralMultiidioma('UTILS_ERROR_DOJO')+ err);
		  }
	}
	else
	{
		if (typeof(nacarContext) == "undefined"){
			nacarContext = "";
		}
		
  	
	var padre = null;
  var flujoId = null;

  //Se obtiene el padre para mostrar la ventana en el frame adecuado
  if (this != parent){
    padre = obtenerIframePadre();
    flujoId = document.forms[0].flujo.value;
  }
    
 	if (padre != undefined && padre != null && padre !=""){
 	    padre.setFrameInvocadorVentanaModalFF(this);
      padre.crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",true,paramMensaje[0],ancho,alto,paramMensaje[1],variableRetorno,"MostrarMensaje","",flujoId,nacarContext);
  }else{
      crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",true,paramMensaje[0],ancho,alto,paramMensaje[1],variableRetorno,"MostrarMensaje","",flujoId,nacarContext);
  }
  }
	
}

/*
* Función que se ejecuta cuando se cierra la ventana modal invocada con window.showModalDialog
*/
function mostrarResVentanaModalShow(valorRetornado,variableRetorno){
	if (valorRetornado) {
			//En paramMensaje[1] viaja el flujo origen del mensaje
			enviaFormularioMensajes(document, valorRetornado, paramMensaje[1]);
		} else if(valorRetornado == '') { 
			mostrarMensajeNN(variableRetorno);
		}
	

}

// Funcion para el Servicio de Mensajes
// Funcion que debe ser llamada al cerrar una caja de mensaje de arquitectura. LLeva a cabo el envio del formulario
function terminar() {
	if(document.forms[0].evento.value) {
		var numComp = document.forms[0].length;
		var nuevoForm = construyeTrozoForm(numComp, document.forms[0], '');
		if(ie) {
			returnValue = nuevoForm;
		} else {
			asignarRespuestaVentanaModal(nuevoForm);
		}
	} else {
		if(ie) {
			returnValue = '';
		} else {
			asignarRespuestaVentanaModal("");
		}
	}
}

// Funcion para el Servicio de Mensajes (Dojo)
// Funcion que debe ser llamada al cerrar una caja de mensaje de arquitectura. LLeva a cabo el envio del formulario
function fin(doc)
{
	var miFlujoId=null;
	var documento = document;
	var frame2 = null;

	if (flujoIDOrigenMensajeDojo!=null && flujoIDOrigenMensajeDojo!="null")
	{
		var frame = obtenerContenedor(flujoIDOrigenMensajeDojo);
		var frameId =obtenerIDContenedor(flujoIDOrigenMensajeDojo);

		//Comprobamos si ha lanzado el mensaje un frame hijo
		if (mensajeEnHijo==true){

				mensajeEnHijo=false;
				//si el frame tiene hijos
				if (frame.ventanasEmergentes_Identificadores.length>0){
					//recogemos el frame padre para comprobar de que frame hay que actualizar cuando se cierre el mensaje error
				for (var i=0 ; i<frame.ventanasEmergentes_Identificadores.length ; i++){

						if (i==frame.ventanasEmergentes_Identificadores[i])
						{
							var frameId2='iframeinterno_'+frame.ventanasEmergentes_Identificadores[i];

							try{

								if (frame.document.getElementById(frameId2).contentWindow)
								{
									frame2 = frame.document.getElementById(frameId2).contentWindow;
									//recogemos el flujoId del frame obtenido
									miFlujoId=frame2.document.forms[0].flujo.value;
								} else
								{
								// IE
									frame2 = frame.document.frames[frameId2].window;
									//recogemos el flujoId del frame obtenido
									miFlujoId=frame2.document.forms[0].flujo.value;
								}
								//si el flujo obtenido es igual al que lanzo el mensaje
								if (miFlujoId==flujoIDPadreMensajeDojo){
									//no busco en los siguientes frames hijos
									break;
								}
							}catch (err){
								frame2=null;
							}
						}
					}
				}
		}
		if (frame!= null && frameId!= null)
    {
		var mostrarMensajesContenedorAux;
		try{
		  //Se comprueba si se está en la página contenedora o en el contendor
      if (mostrarMensajesContenedor!=undefined && mostrarMensajesContenedor[frameId]!= undefined && mostrarMensajesContenedor[frameId]!= null && mostrarMensajesContenedor[frameId]!=true){
         mostrarMensajesContenedorAux=mostrarMensajesContenedor;
      }else{
         mostrarMensajesContenedorAux=parent.mostrarMensajesContenedor;
      }
    }catch (err){
      mostrarMensajesContenedorAux=parent.mostrarMensajesContenedor;
    }

  	if (frame2!=null && frame2!=undefined)
		{
			documento = frame2.document;
  		}else if (mostrarMensajesContenedorAux!=undefined && mostrarMensajesContenedorAux[frameId]!= undefined && mostrarMensajesContenedorAux[frameId]!= null && mostrarMensajesContenedorAux[frameId]!=true)
		{
  			documento = frame.document;
  		}
  	}
	}
	if(document.forms[0].evento.value || doc.evento.value) {
		if(document.forms[0].evento.value != '')
			doc.evento.value = document.forms[0].evento.value;

		var numComp = doc.length;
		var nuevoForm = construyeTrozoForm(numComp, doc, '');
		var dij = dijit.byId('Dialog1');
		//dij.hide();
		dij.destroy();
		enviaFormularioMensajes(documento, nuevoForm, origenMensaje);
		if (estiloOriginalMensajeDojo!=null)
		{
			cambiarEstilo(document.body, estiloOriginalMensajeDojo);
		}
	}else{
		var dij = dijit.byId('Dialog1');
		dij.hide();
	}
}

// Funcion para el Servicio de Mensajes
function enviaFormularioMensajes(paginaActual, camposAEnviar, flujoOrigenMensaje) {
	// Referencia al formulario de la pagina
	var formPrincipal = paginaActual.forms[0];
	// Recuperamos el action del formulario principal
	var actionFormPrincipal = formPrincipal.action;
	// Definimos la variable en la que vamos a escribir el resultado de la concatenacion de todos los componentes de la pagina
	var nuevoFormulario = "<form name=Mensaje method=POST action= " + actionFormPrincipal + ">";
	// Anyadimos en un campo oculto con el nombre origenMensaje el nombre del flujo que ha originado el mensaje
	nuevoFormulario = nuevoFormulario + "<input type=hidden name=origenMensaje value=" + flujoOrigenMensaje+ ">";
	//Reescribimos el document de la pagina con campos ocultos.
	nuevoFormulario = nuevoFormulario + camposAEnviar;
	// Cerramos el tag del formulario
	nuevoFormulario = nuevoFormulario + "</form>";
	// Escribimos el formulario en el document.
	paginaActual.write(nuevoFormulario);
	paginaActual.close();
	paginaActual.forms["Mensaje"].submit();
}

//Optimizacion de descarga
//Funcion que se encarga de generar las combos dinamicamente
function cargaComboJSP(valores) {
	var cadena = "";
	var selectedPuesto = false;
	if (valores[0][0] != "")
		cadena +="<option value=''>" + valores[0][0];
	for (i=1; i<valores.length; i++){
		cadena +="<option value="+ valores[i][0];
		if(!selectedPuesto){
			if (valores[0][1] == valores[i][0]){
				cadena += " selected"
				selectedPuesto = true;
			}
		}
		cadena += ">" + valores[i][1]+"</option>";
	}
return cadena;
}

// Funcion que se encarga de generar las combos dinamicamente con dos parametros.
// Utilizada en XSL para no utilizar document.write
function cargaCombo(valores, idCombo) {
	if(document.getElementsByTagName) {
		var selectedPuesto = false;
		var mycombo = document.getElementsByTagName("SELECT").item(idCombo);
		var myoption = null;
		if (valores[0][0] != "") {
			myoption = document.createElement("OPTION");
			myoption.value = "";
			myoption.innerHTML = valores[0][0];
			mycombo.appendChild(myoption);
		}
		for(var i=1; i<valores.length; i++) {
			myoption = document.createElement("OPTION");
			myoption.value = valores[i][0];
			myoption.innerHTML = valores[i][1];
			if(!selectedPuesto){
				if (valores[0][1] == valores[i][0]){
					myoption.selected = true;
					selectedPuesto = true;
				}
			}
			mycombo.appendChild(myoption);
		}
	}
}

function controlOrdenacion(nombreTabla, claveOrdenacion, columna, evento, sentido, gif){
	var cadena = "";
	cadena += "<INPUT TYPE=\"image\" onClick=\"javascript:document.forms[0].";
	cadena += nombreTabla + claveOrdenacion;
	cadena += ".value='";
	cadena += columna;
	cadena += sentido;
	cadena += "';document.forms[0].evento.value='";
	cadena += evento;
	cadena += "';\" src=\"";
	cadena += gif;
	cadena += "\"/>";

	return cadena;
}
//FORMATO
//CTAGS FASE II: Función que inserta las celdas de datos en caso de informarse el atributo funcionformato.
//				 Esta función sólo se llama en caso de utilizarse las CTAGS.

function insertarCeldaDatosFormateados(nombre, fila, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, valor, seleccion,funcionFormato)
{

	//<script language="javascript">document.write(insertarCeldaDatos("TABLA_PRUEBA","0", "", "", "", "", "", "D#10000", "false"));</script>
	var cadena = "";
	if(seleccion == "true"){
		cadena += "\n<A HREF=\"javascript: ";
	}
	cadena += insertarEventoSeleccionFila(eventoSeleccionFila, nombre, fila);
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);

	if(seleccion == "true"){
		cadena += "\" onmouseover=\"window.status='';return true;\">";
	}

	cadena += insertarValorConFormato(valor,funcionFormato);

	if(seleccion == "true"){
		cadena += "\n</A>";
	}
	return cadena;
}

function insertarCeldaDatos(nombre, fila, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, valor, seleccion){
	var cadena = "";
	if(seleccion == "true"){
		cadena += "\n<A HREF=\"javascript: ";
	}
	cadena += insertarEventoSeleccionFila(eventoSeleccionFila, nombre, fila);
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);

	if(seleccion == "true"){
		cadena += "\" onmouseover=\"window.status='';return true;\">";
	}
	cadena += insertarValor(valor);

	if(seleccion == "true"){
		cadena += "\n</A>";
	}
	return cadena;
}

function insertarControlHTML(tipoControl, nombre, fila, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, deseleccionFila,opSegmentacion,funcionseleccion){
	var cadena = "";
	cadena += "\n<center><INPUT TYPE=\"";
	cadena += tipoControl;
	cadena += "\" NAME=\"";
	if(tipoControl == "radio"){
		cadena += "rb" + nombre;
	}else if (tipoControl == "checkbox"){
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" ID=\"";
	if(tipoControl == "radio"){
		cadena += "rb" + nombre;
	}else if (tipoControl == "checkbox"){
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" VALUE=\"\" ";
	cadena += "onclick=\"";

	if(funcionseleccion !=null && funcionseleccion!=undefined && funcionseleccion != ""){
	cadena +=funcionseleccion+"("+fila+");";
	}
	if (tipoControl == "checkbox"){
		cadena += nombre + "LanzarMS=false;";
		cadena += "if (" + nombre + "MultiSeleccionMasiva && " +  nombre + "ComprobarCK) compruebaEstadoCK('"+ nombre + "CKMS');";
	}
	cadena += insertarEventoSeleccionFila(eventoSeleccionFila, nombre, fila);
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);
	cadena += insertarDeseleccionFila(deseleccionFila, nombre);
	if (tipoControl == "checkbox"){
		cadena += nombre + "LanzarMS=true;";
	}
	//antes de las dobles comillas puedo insertar una funcion javascript más

	if(opSegmentacion !=null && opSegmentacion!=undefined && opSegmentacion.length > 0){
		if(opSegmentacion[0] == "seg_ed_interna_clave")
			cadena += "habilitarEdicionFilaPrincipal('"+nombre+"','"+fila+"','"+opSegmentacion[2]+"','"+opSegmentacion[1]+"','"+opSegmentacion[4]+"')";
		else
			if(opSegmentacion[0] == "seg_ed_externa_clave")
				cadena += "habilitarEdicionExternaFilaPrincipal('"+nombre+"','"+fila+"','"+opSegmentacion[2]+"','"+opSegmentacion[1]+"','"+opSegmentacion[3]+"','"+opSegmentacion[4]+"')";

	}
	cadena += "\"></center>";

	return cadena;
}

function insertarEventoSeleccionFila(eventoSeleccionFila, nombre, fila){
	var cadena = "";

	if (eventoSeleccionFila != "")
	{
		valores = eventoSeleccionFila.split("ç");

		if (valores[1].indexOf("&#39;") != -1)
			valores[1] = valores[1].replace(/\&#39;/g,"\\&#39;");

		cadena += "if (!" + valores[0] + "(";
		cadena += fila + "," + valores[1];
		cadena += ")) { this.checked=false;";
		//resetearCamposEdicion
		if (valores[2] != "")
		{
			valores1 = valores[2].split("#");
			for (i=0; i<valores1.length; i++)
			{
				cadena += nombre + valores1[i] + ".value='';";
				if(i == 0){
					cadena += "fila" + nombre + ".value='';";
				}
			}
		}
		// fin resetearCamposEdicion
		cadena += "return; }";
	}
	return cadena
}

// CTAGS Fase II -> añadido parámetro edicionenfilaprotegida
// Anyadido parámetros filaspaginacion  segmentacion o Fix Ed-fila. No debe estar opSegmentacion
// Anyadido parámetro función selección para resaltado de fila
function insertarControlHTMLEdicionFila(tipoControl, nombre, fila, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, deseleccionFila, edicionEnFila, edicionEnFilaProtegida,filaspaginacion,funcionseleccion){
	var cadena = "";
	cadena += "\n<center><INPUT TYPE=\"";
	cadena += tipoControl;
	cadena += "\" NAME=\"";
	if(tipoControl == "radio"){
		cadena += "rb" + nombre;
	}else if (tipoControl == "checkbox"){
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" ID=\"";
	if(tipoControl == "radio"){
		cadena += "rb" + nombre;
	}else if (tipoControl == "checkbox"){
		cadena += nombre + "_FILA" + fila;
	}
	cadena += "\" VALUE=\"\" ";
	cadena += "onclick=\"";
	//anyadido para resaltado de fila
	if(funcionseleccion != undefined && funcionseleccion !=null && funcionseleccion != ""){
	cadena +=funcionseleccion+"("+fila+");";
	}
	if (tipoControl == "checkbox"){
		cadena += nombre + "LanzarMS=false;";
		cadena += "if (" + nombre + "MultiSeleccionMasiva && " +  nombre + "ComprobarCK) compruebaEstadoCK('"+ nombre + "CKMS');";
	}
	cadena += insertarEventoSeleccionFilaEdicionFila(eventoSeleccionFila, nombre, fila, edicionEnFila, edicionEnFilaProtegida, tipoControl,filaspaginacion);
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);
	cadena += insertarDeseleccionFila(deseleccionFila, nombre);
	if (tipoControl == "checkbox"){
		cadena += nombre + "LanzarMS=true;";
	}
	cadena += "\"></center>";

	return cadena;
}

// CTAGS Fase II --> desproteger fila seleccionada + no hay campos de edicion
// Anyadido parámetros filaspaginacion  para segmentacion
function insertarEventoSeleccionFilaEdicionFila(eventoSeleccionFila, nombre, fila, edicionEnFila, edicionEnFilaProtegida, tipoControl,filaspaginacion){
	var cadena = "";
	//alert(edicionEnFilaProtegida);
	//alert("eventoSeleccionFila: " + eventoSeleccionFila);
	if (eventoSeleccionFila != "")
	{
		valores = eventoSeleccionFila.split("ç");

		if (valores[1].indexOf("&#39;") != -1)
			valores[1] = valores[1].replace(/\&#39;/g,"\\&#39;");

		cadena += "if (!" + valores[0] + "(";
		cadena += fila + "," + valores[1];
		cadena += ")) { this.checked=false;";
		//resetearCamposEdicion
		// CTAGS Fase II --> desproteger fila seleccionada + no hay campos de edicion
		if(!edicionEnFila)
		{
			if (valores[2] != "")
			{
				valores1 = valores[2].split("#");
				for (i=0; i<valores1.length; i++)
				{
					cadena += "try{"+nombre + valores1[i] + ".value='';}catch(e){;}";
					if(i == 0){
						cadena += "fila" + nombre + ".value='';";
					}
				}
			}
			cadena += "return; } else{ fila"+nombre+".value='"+fila+"';}";
		}
		else
		{
			cadena += "return; }"
			if(tipoControl=="radio")
			{

				// Ejecutamos la desprotección de celda e informamos el número de fila en
				// el input filaNOMBRETABLA para que se ejecute el onClick del botón de refresco.
				cadena += " else {";
				if(edicionEnFilaProtegida == true)
				{
					cadena+="desprotegerFilaSeleccionada('"+nombre+"', "+fila+","+filaspaginacion+");";
				}
				cadena += "fila"+nombre+".value='"+fila+"';}";
			}
		}
		// fin resetearCamposEdicion

	}
	else
	{
		// CTAGS Fase II:
		// si no hay evento de seleccionedicion y la edicion es en fila protegida,
		// hay que enganchar la función de desproteger la fila seleccionada.
		if(edicionEnFila&&edicionEnFilaProtegida)
		{
			if(tipoControl=="radio")
			{
				cadena += "desprotegerFilaSeleccionada('"+nombre+"', "+fila+","+filaspaginacion+");fila"+nombre+".value='"+fila+"';";

			}
		}
	}
	return cadena;
}

function 	informarCamposEdicion(camposEdicion, nombre, fila){
	var cadena = "";
	//FIX PARA QUE SALGAN LOS RADIOS EN LA PAGINACION filasPorPagina
	var filasPorPagina = eval(nombre + "DATOS").length;
	if (camposEdicion != ""){
		valores = camposEdicion.split("#");
		for (j=0; j<valores.length; j++){
			// FIX Columna libre HTML
			// No se insertan valores de edicion
			if(valores[j]=='COLUMNA$LIBREHTML')
				continue;
			cadena += "document.forms[0]." + nombre + valores[j] + ".value='";
			cadena += insertarValordeArray(nombre,fila%filasPorPagina,j - 1) + "';";
			if(j == 0){
				cadena += "document.forms[0].fila" + nombre + ".value='" + fila + "';";

			}
		}
	}
	return cadena;
}

function 	informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila){
	var cadena = "";
	if(columnaSeleccionEdicion != ""){
		valores5 = columnaSeleccionEdicion.split("#");
		cadena += "document.forms[0]." + nombre;
		cadena += valores5[0] + ".value='" + fila + "'; ";
		valores6 = valores5[1].split("-");
			cadena += valores6[0] + "('" + nombre + "', " + valores6[1] + ", " + valores6[2] + ");";
		if (valores5[2] != null){
			valores7 = valores5[2].split("-");
				cadena += valores7[0] + "(getArrayFilasSeleccionadas('" + nombre + "', " + valores7[1] + ", " + valores7[2] + "));";
		}
	}
	return cadena;
}

function 	insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre){
	var cadena = "";
	if (funcionSeleccionFilas != ""){
		valores8 = funcionSeleccionFilas.split("-");
		cadena += "seleccionFilas('" + nombre + "', new Array('" + valores8[0] + "', '" + valores8[1] + "'), '";
		cadena += valores8[2] + "', " + valores8[3] + ", " + valores8[4] + ", " + valores8[5] + ");";
	}
	return cadena;
}

function 	insertarSeleccionCelda(seleccionCelda, nombre, fila){
	var cadena = "";
	if (seleccionCelda != ""){
		valores9 = seleccionCelda.split("#",2);


		longitud = valores9[0].length + valores9[1].length + 1;


		if (seleccionCelda.length > longitud){

			valores9[2] = seleccionCelda.substring(longitud + 1 );

		}
		if(valores9[0] != ""){
			valores10 = valores9[2].split("-");
			cadena += "document.forms[0]." + nombre + ".value='";

			if (valores10[0].indexOf("&#39;") != -1){

				cadena += valores10[0].replace("&#39;","\\&#39;") + "';";
			} else {
				cadena +=valores10[0] + "';";
			}

			cadena += "document.forms[0].evento.value='" + valores9[0] + "';";
			cadena += "document.forms[0]." + nombre + valores10[1] + ".value='" + fila + "';submitAndRebuildForm();";
		}else if (valores9[1] != null){
			cadena += valores9[1] + "(" + nombre + "DATOS[";
			if(valores9[0] != "")
				cadena += valores9[3];
			else
				cadena += valores9[2];
			cadena += "], " + fila + ");"
		}
	}
	return cadena;
}

function insertarDeseleccionFila(deseleccionFila, nombre){
	var cadena ="";
	if (deseleccionFila != ""){
		cadena += "if(!this.checked) {";
		cadena += "document.forms[0]." + nombre + deseleccionFila + ".value=''; "
		cadena += "}";
	}
	return cadena;
}

function insertarValor(valor){
	var cadena = "";

	valores00 = valor.substring(0,1);

	valores01 = valor.substring(2,valor.length);


	if(valores00 == "I")
		cadena += "<img src=\"" + valores01 + "\" alt=\"\" border=\"0\" width=\"12\" height=\"15\">";
	else if (valores00 == "D")
		cadena += valores01;

	return cadena;
}

//FORMATO
//CTAGS FASE II: Función para el formateo por campos. Esta función inserta el valor
//				 en la tabla una vez ha pasado por la función de formateo.
function insertarValorConFormato(valor,funcionFormato){
	var cadena = "";

	valores00 = valor.substring(0,1);

	valores01 = valor.substring(2,valor.length);


	if(valores00 == "I")
		cadena += "<img src=\"" + valores01 + "\" alt=\"\" border=\"0\" width=\"12\" height=\"15\">";
	else if (valores00 == "D")
	{
		var func = funcionFormato+"('"+valores01+"')";

		if (funcionFormato!=null)
			valores01 = eval(func);

		cadena += valores01;
	}

	return cadena;
}

// Funcion que establece como cursor del raton un reloj de arena
function habilitaReloj(elemento){
	elemento.style.cursor="wait";
}

// Funcion que establece como cursor el establecido por defecto (una flecha)
function deshabilitaReloj(elemento){
	elemento.style.cursor="auto";
}

// Objetos de negocio
// Funcion invocada por el plugin ante la bajada de datos de objetos de negocio
// devuelve false si se ha producido algun error, y true si se ha tratado el evento correctamente.
function trataEvento(evento) {
        if (!window.tratarBajadaObjetosNegocio)
	{
		return false;
	}
        var elementos = evento.split("+");
	var claves = new Array();
	var valores = new Array();
	var j=0;
	// Separamos claves y valores
	for (var i=0;i<elementos.length ;i++ )
	{
		claves[j] = elementos[i];
		i++;
		valores[j] = elementos[i];
		j++;
	}
	// Llamada a la funcion que debera codificar el desarrollador
	return tratarBajadaObjetosNegocio(claves, valores);
	// Si la funcion no esta presente, se sale sin hacer nada
}

// Manda mensaje a Arquitectura para que compruebe la bajada del objeto de negocio
function comprobarBajadaON ()
{
	if (utils_isComuServidorWeb()){
		utils_servidorWeb_enviaPlano("CTE_COMPROBAR_BAJADA_OBJETOS_NEGOCIO");
	}else if (window.PlugIn){
	        PlugIn.enviaPlano("CTE_COMPROBAR_BAJADA_OBJETOS_NEGOCIO");
	}
}

// Funcion que captura la pulsacion de la tecla F5 y solicita la bajada de objetos de negocio
function tratarF5()
{
	if (ie)
	{
		if(event.keyCode == 116) {
			// Eliminanos el codigo de tecla para evitar el refresco del navegador
			event.keyCode = 0;
			// Enviamos la solicitud a traves del conector de comunicaciones
			if (utils_isComuServidorWeb()){
				utils_servidorWeb_enviaPlano("CTE_BAJADA_OBJETOS_NEGOCIO");
			}else if (window.PlugIn){
				  PlugIn.enviaPlano("CTE_BAJADA_OBJETOS_NEGOCIO");
			}

			return false;
		}
	}

}

// Funcion que solicita la subida de datos a objetos de negocio
function subirObjetosNegocio(claves, valores) {
  if (utils_isComuServidorWeb()){
			//Si utilizamos el servidor Web
			var mensaje="";
			// EL formato serà clave1=*=valor1*+*clave2=*=valor2 ...
			var j=0;
			for(var i=0;i<claves.length;i++)
			{
				if (j>0)
					{
						mensaje = mensaje + "+*+";
					}
					mensaje = mensaje + claves[i] + "=*=" + valores[i]
					j++;
			}
			mensaje=mensaje.replace(/&/g,"%26");
			utils_servidorWeb_enviaPlano("CTE_SUBIDA_OBJETOS_NEGOCIO"+mensaje,"true");

		}else if (window.PlugIn){
			//Si no utilizamos el servidor Web pero utilizamos el PlugIn
		var mensaje="";
		// EL formato serà clave1=*=valor1*+*clave2=*=valor2 ...
		for(var i=0;i<claves.length;i++)
		{
			if (i>0)
			{
				mensaje = mensaje + "+*+";
			}
			mensaje = mensaje + claves[i] + "=*=" + valores[i]
		}
		mensaje=mensaje.replace(/&/g,"%26");
		// Usamos el conector de comunicaciones para transmitir la peticion
	        PlugIn.enviaPlano("CTE_SUBIDA_OBJETOS_NEGOCIO"+mensaje);
	}
	else
	{
	  var isATPI=false;

	  //Se comprueba que se realiza la ejecución sobre el portal ATPI o ATPN
	  try{
      isATPI=window.top.isEjecucionSobrePortal;

    }catch (err){
      isATPI=false;
    }

	  //Se comprueba si se está ejecutando sobre el portal ATPN o sobre ATPI
		if (isATPI==true){
  		  //Estamos en ATPI
        top.atpn_gt_subirObjetosNegocio(claves, valores);
  	}else{
		  //Estamos sobre ATPN
		if (window.top.Fprincipal.objetoNegocio == true)
		{
			window.top.Fprincipal.subidaObjetoLigero(claves, valores);
		}
    }
	}
}

// Captura de la tecla F5. Se deshabilita la accion de la tecla F5 para garantizar el funcionamiento correcto del portal Nacar
document.onkeydown=comprobarTecla;
function comprobarTecla(evento) {

  var entro = false;

	if (evento == null){
    evento = window.event;
  }


	/*****MODIFICO PARA COMPATIBILIDAD MOZILLA*****/
			if (ie)
			{
		    if (evento && evento.keyCode == '116' && !evento.ctrlKey) {

				  evento.keyCode = 0;
				  entro = true;
			   }
			}else if (ns){
			    if (evento && evento.which == '116' && !evento.ctrlKey) {

				    entro = true;
			   }

      }
			/*****FIN MODIFICACION PARA COMPATIBILIDAD MOZILLA*****/
			if (entro == true){
        return false;
		  }

	if(isdefined('controlTeclas'))
		return controlTeclas(evento);
}

function isdefined(variable)
{
    return (typeof(window[variable]) == "undefined")?  false: true;
}

function multiSeleccionMasiva(id, arrayIds) {

	var objCKMS = document.getElementById(id);
	var marcar = objCKMS.checked;
	var i = 0;
	for (i=0;i<arrayIds.length;i++){
		var objCK = document.getElementById(arrayIds[i]);
		if (!marcar) {
			if (objCK.checked)
				objCK.click();
		} else if (!objCK.checked)
			objCK.click();
	}
}

function compruebaEstadoCK(id) {
	var objCKMS = document.getElementById(id);
	if (objCKMS.checked) {
		objCKMS.click();
	}
}

//Evolutivo para la Apertura de PDF's sin la caja de dialogo Abrir/Guardar
function comprobarFormulario(){
	if(enviar ==true){
		enviar=false;
		document.forms[0].target="ventanaForm";
		window.open('', 'ventanaForm', 'toolbar=no,resizable=yes');
		document.forms[0].submit();
	}else{
		document.forms[0].target="_self";
	}
}

function botonImprimirFormulario(){
	enviar = true;
}

// Constructor del panel contenedor de pestanas
// elemento : Elemento que representa el panel de pestanas
function PanelPestanas( elemento) {
	this.element = elemento;
	this.element.tabPane = this;
	this.element.className = this.classNameTag + " " + this.element.className;
	this.pages = [];
	this.selectedIndex = null;
	// Crea el tab-row para anadirlo al panel
	this.tabRow = document.createElement("div");
	this.tabRow.className = "tab-row";
	// Inserta el tab-row como primer nodo hijo
	elemento.insertBefore(this.tabRow, elemento.firstChild);
	this.selectedIndex = 0;
	// Obtiene todos los nodos hijos del panel
	var hijos = elemento.childNodes;
	// Anade todos los hijos al panel de pestanas
	for (var i = 0; i < hijos.length; i++) {
		// Debe hacer la comprobacion para no anadir el tab-row
		if (hijos[i].nodeType == 1 && hijos[i].className.indexOf("tab-page")!=-1) {
			this.addPestana(hijos[i]);
        }
	}
}

// Constructor de una pestana
// elemento      : Representa la nueva pestana
// incidePanel   : Indice de la pestana en el array del panel de pestanas
function Pestana( elemento,indicePanel ) {
	// Inicializa los valores de la pestana
	this.element = elemento;
    this.element.tabPage = this;
    this.index = indicePanel;

	// Busca el elemento tab en los hijos de la pestana
    var hijos = elemento.childNodes;
    for (var i = 0; i < hijos.length; i++) {
	if (hijos[i].nodeType == 1 && hijos[i].className.indexOf("tab")!=-1 && hijos[i].className.indexOf("tab-")==-1) {
 			this.tab = hijos[i];
            break;
		}
    }
};

PanelPestanas.prototype.classNameTag = "PanelPestanas";

// Establece la pestana seleccionada mediante su indice
// indiceNuevo: Indice que se desea seleccionar
PanelPestanas.prototype.setIndiceSeleccionado = function (indiceNuevo){
  if(this.pages[indiceNuevo].tab.className!='tab disabled'){
	var indiceAntiguo=this.selectedIndex;
	// Si la pestana no estaba seleccionada
	if (indiceAntiguo != indiceNuevo) {
		if (indiceAntiguo != null && this.pages[indiceAntiguo] != null )
			this.pages[indiceAntiguo].hide();
		this.selectedIndex = indiceNuevo;
		this.pages[indiceNuevo].show();
	}
 }
};

// Anade una pestana al panel
PanelPestanas.prototype.addPestana = function ( nuevaPestana ) {
	// Calcula el numero de pestanas actual del panel
	var numPaginas = this.pages.length;
	// Instancia la nueva pestana
	var pestana = new Pestana( nuevaPestana, numPaginas );
	// Asigna la nueva pestana al array del panel
	this.pages[numPaginas]=pestana;
	// Asigna el panel al que pertenece la pestana
	pestana.tabPane = this;
	// Anade la nueva pestana
	this.tabRow.appendChild( pestana.tab );
	// Hace visible la pestana si es necesario
	if ( numPaginas == this.selectedIndex )
		pestana.show();
	else
		pestana.hide();

	return pestana;
};

// Muestra la pestana que se selecciona
// Cambia el nombre de la clase y cambia el estilo.
Pestana.prototype.show = function () {
	this.tab.className= 'tab selected';
	this.element.style.display = "block";
};

// Oculta la pestana que deja de estar seleccionada.
// Cambia el nombre de la clase y cambia el estilo.
Pestana.prototype.hide = function () {
    this.tab.className= 'tab';
 	this.element.style.display = "none";
};

Pestana.prototype.pestanaEnabled = function () {
    this.tab.className= 'tab';
};

Pestana.prototype.pestanaDisabled = function () {
    this.tab.className= 'tab disabled';
};

// Crea el panel de pestanas y las pestanas al cargarse
// la pagina
function creaPestanas() {

	/**ADAPTADO PARA MOZILLA**/
	if (ie)
	{
		all = document.all;
	}
	else if (ns)
	{
		all = document.forms[0];
	}
	/**FIN ADAPTACION**/

	var numElementos = all.length;
	var nombreClase, elemento;
	var parentTabPane;

	for ( var i = 0; i < numElementos; i++ ) {
		elemento = all[i];
		nombreClase = elemento.className;
		if ( nombreClase.indexOf('tab-pane')!=-1 && !elemento.tabPane ){
			new PanelPestanas( elemento );
		} else if (nombreClase.indexOf('tab-page')!=-1 &&
		          !elemento.tabPage &&
				   elemento.parentNode.className.indexOf('tab-pane')!=-1) {
			elemento.parentNode.tabPane.addPestana(elemento);
		}
	}
}

//Función para detectar la resolución de la pantalla:
//devuelve true si es 1024x768, false en caso contrario
function isR1024x768(){
	var R1024x768= "1024x768";
	var R800x600= "800x600";
	var sep = "x";
	var hz=window.screen.height;
	var wz=window.screen.width;
	var ResCal =wz + sep + hz;

	if(R1024x768 == ResCal )
		return true;
	else
		return false;
}

// Evolutivo Nuevo Puesto Gestor Fase II
// Funcion que gestiona el cambio de escenario para la funcionalidad
// de pagina de inicio del escritorio pesado.
function actualizarEscenario(contexto) {
	var evento;
	var escenario;

	if(contexto==null || contexto.indexOf("\\0")<1) {
		return;
	}
	evento = contexto.substring(0, contexto.indexOf("\\0"));
	escenario = contexto.substring(contexto.indexOf("\\0")+2, contexto.length);
	document.forms[0].evento.value = evento;
	var formPagina = document.forms[0];
	var campoEscenario = document.createElement("input");
	campoEscenario.name = "PAR_ESCRITORIO_ESCENARIO_SELECCIONADO";
	campoEscenario.type = "hidden";
	campoEscenario.value = escenario;
	formPagina.appendChild(campoEscenario);
	formPagina.submit();
}

//Inserta el valor desde el array de datos (Ev. Caracteres Especiales II)
function insertarValordeArray(nombre,fila,columna) {
	var cadena = "";
	mivariable = eval(nombre + "DATOS");
	var dato=mivariable[fila][columna];
	if (dato != undefined && dato.indexOf("&#39;") != -1)
			dato = dato.replace(/\&#39;/g,"\\&#39;");
	return dato;
}

// Ev. Nuevo Puesto Gestor Fase III
// Ejecuta una operacion en el puesto cliente pasando el contexto de entrada para la operacion
function ejecutarOperacionLocal() {
	  if (utils_isComuServidorWeb()){
		     utils_servidorWeb_enviaPlano(document.forms[0].SRVPRESENTACION_CONTEXTO_ENTRADA.value);
	  }else{
		   document.PlugIn.enviaPlano(document.forms[0].SRVPRESENTACION_CONTEXTO_ENTRADA.value);
	}
}

// Trata el retorno de la operacion ejecutado en el puesto cliente, creando un formulario y envia el resultado
function tratarRetornoEjecucionLocal(retornoEjecucion) {
	if (checkTime()) {
		document.forms[0].SRVPRESENTACION_CONTEXTO_SALIDA.value = retornoEjecucion;
		window.document.forms[0].evento.value='0x1121000';
		window.document.forms[0].submit();
	}
}

// Evolutivo ejecucion Urls Externas

/**
Funcion que invoca una la creación de una ventana modal
*/
function lanzarVentanaModal(sURL, argumentos, sPropiedades){	
	var valorRetorno="";
	if(ie)
	{
		lanzarVentanaModalIE(sURL, argumentos, sPropiedades,true);
	}else{
		lanzarVentanaModalFF(sURL, argumentos, sPropiedades);
	}
	return valorRetorno;
}


function DisconnectWModal(sURL){
	var req=getHTTPObject();
	
	try{
    req.open("GET",sURL+"&hash="+Math.random(),false);
		req.send(null);

	}catch (e){
		
	}	
}

function getHTTPObject() {

	var xmlhttp=false;

	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}

	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;

}

//Función que crea la ventana modal para internet explorer
function lanzarVentanaModalIE(sURL, argumentos, sPropiedades, activar){
	var ObjPortal= new Object();

	if (activar==true){
		try{
			if((utils_IsEjecucionPortal())||(utils_isComuServidorWeb())||(window.PlugIn && window.PlugIn.IdComm!=0))
				ObjPortal=window;
			else
				ObjPortal=dialogArguments[4];
		}catch(err){
				ObjPortal=null;
		}
	}else{
		ObjPortal=null;
	}

	if (typeof(nacarContext) == "undefined"){
			nacarContext = "";
		}

	if (argumentos != undefined)
		var vArgumentos = new Array (sURL, argumentos,"", nacarContext, ObjPortal);
	else
		var vArgumentos = new Array (sURL, "", "", nacarContext, ObjPortal);

	if (sPropiedades != undefined)
	{
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog("/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00000.html",vArgumentos, sPropiedades);
		informarServletGUCVentanaModal(false);
	}
	else {
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog("/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00000.html",vArgumentos);
    informarServletGUCVentanaModal(false);
	}

	if ((valorRetorno!=null)&&(ObjPortal!=null)){
		
		if(valorRetorno[0]!=""){			
				DisconnectWModal(valorRetorno[0]); //peticion de desconexion
		}
		
		resultadoVModal=valorRetorno[1];
		if (argumentos != undefined && argumentos!=null){
		if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
			eval(argumentos[100]);
			}
		}
		return valorRetorno[1];
	}else{
		resultadoVModal=valorRetorno[1];
		if (argumentos != undefined && argumentos!=null){
		if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
			eval(argumentos[100]);
			}
		}
		return valorRetorno[1];
	}
}	

// Evolutivo ejecucion Urls Externas

/**
Funcion que lanza una ventana modal para Firefox
*/
function lanzarVentanaModalFF(sURL, argumentos, sPropiedades){
	var funcionRespuesta="";
	if (argumentos != undefined){
		var vArgumentos = new Array (sURL, argumentos);	
		if (argumentos != undefined && argumentos!=null){
				if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
					funcionRespuesta=argumentos[100];
				}
			}
	}else{
		var vArgumentos = new Array (sURL);
	if (typeof(nacarContext) == "undefined"){
			nacarContext = "";
		}
	}
	var padre = null;
  var flujoId = null;

  //Se obtiene el padre para mostrar la ventana en el frame adecuado
  if (this != parent){
    padre = obtenerIframePadre();
    flujoId = document.forms[0].flujo.value;
  }
   
  var ventanaModalStr = "VentanaModal";
  //Si se ha informado el argumento 101, estamos en una ventana modal de MicroStrategy
  if(argumentos[101]!=undefined && argumentos[101]!=null && argumentos[101]!=""){
		ventanaModalStr=argumentos[101];
	}  
	
	if (sPropiedades != undefined)
	{
			var newAncho=trataPropiedadAnchoVentanaModalFF(sPropiedades);
			var newAlto=trataPropiedadAltoVentanaModalFF(sPropiedades);
			if (padre != undefined && padre != null && padre != ""){
			  padre.setFrameInvocadorVentanaModalFF(this);
        padre.crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",false,sURL,newAncho,newAlto,argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }else{
        crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",false,sURL,newAncho,newAlto,argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }		
	}
	else {
	    if (padre != undefined && padre != null && padre != ""){
	     padre.setFrameInvocadorVentanaModalFF(this);
	     padre.crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",false,sURL,"0","0",argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
	    }else{
        crearVentanaModalConvencionalFirefox("","/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",false,sURL,"0","0",argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }
	}
}
/**
 * Función que obtiene el padre, si existe, del frame desde el que se lanzo una ventana modal.
 */ 
function obtenerIframePadre(){
	var padre = null;

  //Se obtiene el padre para mostrar la ventana en el frame adecuado
  if (this != parent){

    var final = false;
    var i = 0;
    
    while (final!=true){
      if (i==0){
       try{
         if (utils_IsEjecucionPortal()){
         
             //Si existe MAX_ANCHO_PORTAL, el padre es el front del portal
            var front = parent.fr_cabecera.MAX_ANCHO_PORTAL;
          
            if (front != undefined && front != null && front != ""){
           
              final = true;
              break;
            }
          }
        }catch(error){
        }
        
        if (final == false){
          padre = this.parent;
          i++;
        }
      }
      //if (padre == padre.parent && !utils_IsEjecucionPortal()){
      if (padre == padre.parent){
        final = true;
      }else if (utils_IsEjecucionPortal()){
        //Si existe MAX_ANCHO_PORTAL, el padre es el front del portal
        var front = padre.parent.fr_cabecera.MAX_ANCHO_PORTAL;
        if (front != undefined && front != null && front != ""){
            final = true;
        }
      }
      if (final==false){
        padre = padre.parent;
      }
    }
  }
  return padre;
}

/*
	* Funcion que comprueba si estoy en firefox 2 o en otro navegador
	*/
	function utils_isNavegadorFirefox2()
	{
		if(window.isNavegadorFF2=="undefined" || window.isNavegadorFF2==undefined || window.isNavegadorFF2=="null" || window.isNavegadorFF2==null){
			//alert("Voy a comprobar el navegador por primera vez");
			var agente=navigator.userAgent;
			if(agente.indexOf("Firefox/")!=-1){
				var version=agente.substring(agente.indexOf("Firefox/")+"Firefox/".length,agente.indexOf("Firefox/")+"Firefox/".length+1);
				if(version!=null && version!=undefined && version=='2'){
					window.isNavegadorFF2=true;
					return true;
				}else{
					window.isNavegadorFF2=false;
					return false;
				}
			}else{
				if(agente.indexOf("BonEcho/")!=-1){
					var versionLinux=agente.substring(agente.indexOf("BonEcho/")+"BonEcho/".length,agente.indexOf("BonEcho/")+"BonEcho/".length+1);
					if(versionLinux!=null && versionLinux!=undefined && versionLinux=='2'){
						window.isNavegadorFF2=true;
						return true;
					}else{
						window.isNavegadorFF2=false;
						return false;
					}
				}else{
					if(agente.indexOf("rv:")!=-1){
						var versionWindows=agente.substring(agente.indexOf("rv:")+"rv:".length,agente.indexOf("rv:")+"rv:".length+3);
						if(versionWindows!=null && versionWindows!=undefined && versionWindows=='1.8'){
							window.isNavegadorFF2=true;
							return true;
						}else{
							window.isNavegadorFF2=false;
							return false;
						}
					}else{
						window.isNavegadorFF2=false;
						return false;
					}
				}
			}
		}else{
			//alert("La variable esta inicializada, devuelvo:"+window.isNavegadorFF2);
			if(window.isNavegadorFF2==true)
			{
				return true;
			}else{
				//alert("es false");
				return false;
			}
			//return window.isNavegadorFF2;
		}
	}
	
/*
*Funcion que reemplaza todas las aparaciones de "busca" por "reemplaza" en la cadena "text"
*/
function replaceAll( text, busca, reemplaza ){  
	while (text.toString().indexOf(busca) != -1){ 
		text = text.toString().replace(busca,reemplaza); 
	}  
	return text;
}

function checkTime() {

	var ret = true;
	if (timeLocal == -1) {
		timeLocal = new Date().getTime();
	} else {
		var current = new Date().getTime();
		if (current - timeLocal < 1500) {
			timeLocal = -1;
			ret = false;
		}
	}
	return ret;
}

/**
* Determina si está definido el plugin OCX.
*/
function isNavegadorEmbebido(){
	if(window.PlugIn && window.PlugIn.IdComm && window.PlugIn.IdComm!=0){
		return true;
	}else{
		return false;
	}
}

function ejecutarOperacionNACAREscenario(opNACAR, parametros, tipo, escenario, tipoEjecucion,descripcion) {
  if (utils_isComuServidorWeb()){
		   if (tipo==null){
	       tipo="CTE_TIPO_NAV";
			 }

			var archivoXML = "";

			archivoXML +="<datosContenedor>"
						+"<tipo>"
						+tipo
						+"</tipo>";
			if(parametros != null) {
				archivoXML +="<parametros>"+parametros+"</parametros>";
			}
			if(escenario != null) {
				archivoXML +="<escenario>"+escenario+"</escenario>";
			}
			if(tipoEjecucion != null) {
				archivoXML +="<tipoEjecucion>"+tipoEjecucion+"</tipoEjecucion>";
			}
			if(descripcion != null && descripcion!="null" && descripcion!=undefined) {
				archivoXML +="<descripcion>"+descripcion+"</descripcion>";
			}
			if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
				archivoXML +="<operacion>"+opNACAR+"</operacion>";
			}
			archivoXML += "</datosContenedor>";
			utils_servidorWeb_enviaPlanoXML("CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoXML,"true","true");

  }else if (isNavegadorEmbebido()){
	    if (tipo==null){
	       tipo="CTE_TIPO_NAV";
      }

			var archivoXML = "";

			archivoXML += "<datosContenedor>"
						+"<tipo>"
						+tipo
						+"</tipo>";
			if(parametros != null) {
				archivoXML += "<parametros>"	+parametros	+"</parametros>";
			}
			if(escenario != null) {
				archivoXML += "<escenario>"	+escenario	+"</escenario>";
			}
			if(tipoEjecucion != null) {
				archivoXML += "<tipoEjecucion>"	+tipoEjecucion	+"</tipoEjecucion>";
			}
		if(descripcion != null && descripcion!="null" && descripcion!=undefined) {
			archivoXML += "<descripcion>"	+ descripcion	+"</descripcion>";
		}
			if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
				archivoXML += "<operacion>"		+opNACAR	+"</operacion>";
			}
			archivoXML += "</datosContenedor>";
			window.PlugIn.enviaPlano("CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoXML);
  }else if (isEjecucionPortal()){
      if ((opNACAR!=null)&&(opNACAR!="")&&(opNACAR!="null")){
        top.atpn_gt_crearTareaConDescripcionEscenario(escenario, opNACAR,descripcion,[parametros,tipoEjecucion]);
      }else if((escenario!=null)&&(escenario!="")){
		//Si se ha definido escenario y no operación, activamos el escenario
		top.atpn_gt_activarEscenario(escenario);
	  }
	  else{
        alert(literales_traducirLiteralMultiidioma('UTILS_INFORM_OPER_ESCE'));
      }
  }else{
    alert(literales_traducirLiteralMultiidioma('UTILS_NO_OPER_FUERA'));
  }
}



function ejecutarOperacionNACAREscenario_JSON(opNACAR, parametros, tipo, escenario, tipoEjecucion,descripcion,funcJsonp) {
  if (utils_isComuServidorWeb()){
		   if (tipo==null){
	       tipo="CTE_TIPO_NAV";
			 }

			var archivoXML = "";

			archivoXML +="<datosContenedor>"
						+"<tipo>"
						+tipo
						+"</tipo>";
			if(parametros != null) {
				archivoXML +="<parametros>"+parametros+"</parametros>";
			}
			if(escenario != null) {
				archivoXML +="<escenario>"+escenario+"</escenario>";
			}
			if(tipoEjecucion != null) {
				archivoXML +="<tipoEjecucion>"+tipoEjecucion+"</tipoEjecucion>";
			}
			if(descripcion != null && descripcion!="null" && descripcion!=undefined) {
				archivoXML +="<descripcion>"+descripcion+"</descripcion>";
			}
			if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
				archivoXML +="<operacion>"+opNACAR+"</operacion>";
			}
			archivoXML += "</datosContenedor>";
			utils_servidorWeb_enviaPlanoXML("CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoXML,"true","true");

  }else if (isNavegadorEmbebido()){
	    if (tipo==null){
	       tipo="CTE_TIPO_NAV";
      }

			var archivoXML = "";

			archivoXML += "<datosContenedor>"
						+"<tipo>"
						+tipo
						+"</tipo>";
			if(parametros != null) {
				archivoXML += "<parametros>"	+parametros	+"</parametros>";
			}
			if(escenario != null) {
				archivoXML += "<escenario>"	+escenario	+"</escenario>";
			}
			if(tipoEjecucion != null) {
				archivoXML += "<tipoEjecucion>"	+tipoEjecucion	+"</tipoEjecucion>";
			}
		if(descripcion != null && descripcion!="null" && descripcion!=undefined) {
			archivoXML += "<descripcion>"	+ descripcion	+"</descripcion>";
		}
			if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
				archivoXML += "<operacion>"		+opNACAR	+"</operacion>";
			}
			archivoXML += "</datosContenedor>";
			window.PlugIn.enviaPlano("CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoXML);
  }else if (isEjecucionPortal()){
      if ((opNACAR!=null)&&(opNACAR!="")&&(opNACAR!="null")){
        top.atpn_gt_crearTareaConDescripcionEscenario(escenario, opNACAR,descripcion,[parametros,tipoEjecucion],funcJsonp);
      }else if((escenario!=null)&&(escenario!="")){
		//Si se ha definido escenario y no operación, activamos el escenario
		top.atpn_gt_activarEscenario(escenario);
	  }
	  else{
        alert(literales_traducirLiteralMultiidioma('UTILS_INFORM_OPER_ESCE'));
      }
  }else{
    alert(literales_traducirLiteralMultiidioma('UTILS_NO_OPER_FUERA'));
  }
}
//Función que devuelve un valor booleano en función de si la aplicación se ejecuta en el Portal o no.
function isEjecucionPortal(){
  try{
  return top.isEjecucionSobrePortal;
  }catch (err){}
  return false;
}

function ejecutarEscenarioNACAR(escenario,tipo)
{
	//Llamamos a la funcion sin indicar operación Nacar, de esta manera, ejecutar escenario
	//El parámetro tipoEjecucion lo ponemos a 0 que es el valor por defecto(funcionamiento sin backHistory)
	ejecutarOperacionNACAREscenario(null,null,tipo,escenario,"0",null)
}

/**
Funcion que invoca una la creación de una ventana modal con título
*/
function lanzarVentanaModalTitulo(sURL, argumentos, sPropiedades,sTitulo,sScroll){	
	var valorRetorno="";
	
	if(ie)
	{
		lanzarVentanaModalTituloIE(sURL, argumentos, sPropiedades,sTitulo,sScroll,true);
	}else{
		lanzarVentanaModalTituloFF(sURL, argumentos, sPropiedades,sTitulo,sScroll);
	}
	return valorRetorno;
}

// Evolutivo lanzar url externa con título
function lanzarVentanaModalTituloIE(sURL, argumentos, sPropiedades, sTitulo, sScroll, activar){
	var ObjPortal= new Object();
	var urlArq="/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00000.html";
	if(sScroll != undefined && sScroll==true)
		urlArq="/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00002.html";

	if (activar==true){
		try{
			if((utils_IsEjecucionPortal())||(utils_isComuServidorWeb())||(window.PlugIn && window.PlugIn.IdComm!=0))
				ObjPortal=window;
			else
				ObjPortal=dialogArguments[4];
		}catch(err){
				ObjPortal=null;
		}
	}else{
		ObjPortal=null;
	}

	if (typeof(nacarContext) == "undefined"){
		nacarContext = "";
	}

	if (argumentos != undefined)
	  if(sTitulo!=undefined)
		  var vArgumentos = new Array (sURL, argumentos,sTitulo,nacarContext,ObjPortal);
		else
			var vArgumentos = new Array (sURL, argumentos,"",nacarContext,ObjPortal);
	else
		if (sTitulo!=undefined)
		  var vArgumentos = new Array (sURL,"",sTitulo,nacarContext,ObjPortal);
		else
			var vArgumentos = new Array (sURL,"","",nacarContext,ObjPortal);


	if (sPropiedades != undefined)
	{
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog(urlArq,vArgumentos, sPropiedades);
		
		 informarServletGUCVentanaModal(false);
	}
	else {
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog(urlArq,vArgumentos);
		
		informarServletGUCVentanaModal(false);
	}

	if ((valorRetorno!=null)&&(ObjPortal!=null)){
		
		if(valorRetorno[0]!=""){			
				DisconnectWModal(valorRetorno[0]); //peticion de desconexion
		}
		
		resultadoVModal=valorRetorno[1];
		if (argumentos != undefined && argumentos!=null){
		if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
			eval(argumentos[100]);
			}
		}
		return valorRetorno[1];
	}else{
		resultadoVModal=valorRetorno[1];
		if (argumentos != undefined && argumentos!=null){
		if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
			eval(argumentos[100]);
			}
		}
		return valorRetorno[1];
	}
}	

// Evolutivo lanzar url externa con título

/**
Funcion que invoca una ventana modal con título en FireFox
*/
function lanzarVentanaModalTituloFF(sURL, argumentos, sPropiedades,sTitulo,sScroll){
	//Variable globales para informar los parámetros a la ventana modal
	var funcionRespuesta="";
	if (argumentos != undefined){
	  if(sTitulo!=undefined) {
		    var vArgumentos = new Array (sURL, argumentos,sTitulo);	
		}else {
			var vArgumentos = new Array (sURL, argumentos);	
		}
		if (argumentos != undefined && argumentos!=null){
				if(argumentos[100]!=undefined && argumentos[100]!=null && argumentos[100]!=""){
					funcionRespuesta=argumentos[100];
				}
			}
	}else{
		if (sTitulo!=undefined){
			var vArgumentos = new Array (sURL,"",sTitulo);
		 }else{
			var vArgumentos = new Array (sURL);
		}
	}		
	if (typeof(nacarContext) == "undefined"){
			nacarContext = "";
	}	
	var padre = null;
  var flujoId = null;

  //Se obtiene el padre para mostrar la ventana en el frame adecuado
  if (this != parent){
    padre = obtenerIframePadre();
    flujoId = document.forms[0].flujo.value;
  }
  var ventanaModalStr = "VentanaModal"
  
  if (argumentos!=null){
  //Si se ha informado el argumento 101, estamos en una ventana modal de MicroStrategy
  if(argumentos[101]!=undefined && argumentos[101]!=null && argumentos[101]!=""){
		ventanaModalStr=argumentos[101];
	} 
  }
  
	if (sPropiedades != undefined)
	{
			var newAncho=trataPropiedadAnchoVentanaModalFF(sPropiedades);
			var newAlto=trataPropiedadAltoVentanaModalFF(sPropiedades);
			if (padre != undefined && padre != null && padre !=""){
        padre.setFrameInvocadorVentanaModalFF(this);
        padre.crearVentanaModalConvencionalFirefox(sTitulo,"/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",sScroll,sURL,newAncho,newAlto,argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }else{
        crearVentanaModalConvencionalFirefox(sTitulo,"/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",sScroll,sURL,newAncho,newAlto,argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }
	}
	else {
	   if (padre != undefined && padre != null && padre !=""){
	      padre.setFrameInvocadorVentanaModalFF(this);
		    padre.crearVentanaModalConvencionalFirefox(sTitulo,"/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",sScroll,sURL,"0","0",argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
		  }else{
        crearVentanaModalConvencionalFirefox(sTitulo,"/atcl_es_web_pub/images/cerrar.gif",literales_traducirLiteralMultiidioma('CERRAR_MODAL'),"0",sScroll,sURL,"0","0",argumentos,"",ventanaModalStr,""+funcionRespuesta,flujoId,nacarContext);
      }
	}
}	

/*
* Función encargada de obtener el dato que indica el ancho de la ventana modal
*/
function trataPropiedadAltoVentanaModalFF(propiedades){
	var propiedadIndividual;
	propiedadIndividual=buscarPropiedad("dialogHeight",propiedades);
	if(propiedadIndividual=="")
	{
		propiedadIndividual=0;
	}
	return propiedadIndividual;
}

/*
* Función encargada de obtener el dato que indica el alto de la ventana modal
*/
function trataPropiedadAnchoVentanaModalFF(propiedades){
	var propiedadIndividual;
	propiedadIndividual=buscarPropiedad("dialogWidth",propiedades);
	if(propiedadIndividual==""){
		propiedadIndividual=0;
	}
	return propiedadIndividual;
}

/*
* Función encargada de comprobar si existe la propiedad "textoProp" en la cadena "cadenaPropiedades" 
* y en caso afirmativo devolver la cadena '"valorSustitucion"=valor'
*/
function buscarPropiedad(textoProp,cadenaPropiedades){
	var traduccion="";
	if(cadenaPropiedades.indexOf(textoProp)!=-1)
	{
		//la propiedad existe
		var longitudCadena=cadenaPropiedades.length;
		var propiedad=cadenaPropiedades;
		var posPropiedad=propiedad.indexOf(textoProp)+textoProp.length;
		var textoRestante=propiedad.substring(posPropiedad,cadenaPropiedades.length);
		if(textoRestante.indexOf(";")!=-1)
		{
			traduccion=textoRestante.substring(1,textoRestante.indexOf(";")).toLowerCase();
		}else{
			traduccion=textoRestante.substring(1,textoRestante.length).toLowerCase();
		}
		return parseInt(traduccion);
	}
	return traduccion;
}

//anyadido arrayOpSeg para segmentacion
function insertarCeldaDatosEditable(nombre, fila, columna, eventoSeleccionFila, camposEdicion, columnaSeleccionEdicion, funcionSeleccionFilas, seleccionCelda, valor, seleccion, arrayValoresEdicion, protegida,arrayOpsSeg){

	var cadena = "";
	 //arrayOpsSeg 0 = readOnlySecundarias, 1= posicionClaveSegmentacion, 2= filaspagina en paginacion
	// CTAGS FASE II OJO: para las celdas de datos no tiene sentido introducir la función de desbloqueo de filas
	// ni tampoco el tipo de control.
	cadena += insertarEventoSeleccionFila(eventoSeleccionFila, nombre, fila, false, false, "");
	cadena += informarCamposEdicion(camposEdicion, nombre, fila);
	cadena += informarColumnaSeleccionEdicion(columnaSeleccionEdicion, nombre, fila);
	cadena += insertarFuncionSeleccionFilas(funcionSeleccionFilas, nombre);
	cadena += insertarSeleccionCelda(seleccionCelda, nombre, fila);

	try{
		if(arrayValoresEdicion.length != 0)
		{
			cadena += "<select name=\""+nombre+"_"+columna+"_"+fila+"\"";
			if (protegida == true)
				cadena += " disabled=\"true\"";
			if (arrayOpsSeg != null &&  arrayOpsSeg != undefined  && arrayOpsSeg[0] == "readonlysecundarias"){


				cadena+=" onchange=\"cambiarClaveListasSiPrincipal('"+nombre+"','"+fila+"','"+arrayOpsSeg[1]+"','"+columna+"','"+arrayOpsSeg[2]+"');\"";

			}
			cadena += ">";
			for (var i = 0; i <arrayValoresEdicion.length; i++)
			{
				cadena += "<option value=\""+arrayValoresEdicion[i]+"\"";
				if(insertarValor(valor)==arrayValoresEdicion[i])
					cadena += " selected=\"selected\"";
				cadena += ">"+arrayValoresEdicion[i]+"</option>";
			}
			cadena += "</select>";
		}
		else
		{
			cadena += "<input type=\"text\" name=\""+nombre+"_"+columna+"_"+fila+"\" value=\""+insertarValor(valor)+"\"";
			if (protegida == true)
				cadena += " disabled=\"true\"";
			if (arrayOpsSeg != null &&  arrayOpsSeg != undefined  && arrayOpsSeg[0] == "readonlysecundarias"){
				cadena += " readOnly=\"true\"";
				cadena+=" onfocus=\"habilitarEscrituraSiPrincipal('"+nombre+"','"+fila+"','"+arrayOpsSeg[1]+"','"+columna+"','"+arrayOpsSeg[2]+"');\"";
				cadena+=" onchange=\"cambiarClaveEdicionEnFila('"+nombre+"','"+fila+"','"+arrayOpsSeg[1]+"','"+columna+"','"+arrayOpsSeg[2]+"');\"";

			}
			cadena += " />";
		}
	}
	catch(e){
		alert(literales_traducirLiteralMultiidioma('UTILS_ERROR_INSERTAR_CELDA') + e.message + literales_traducirLiteralMultiidioma('UTILS_ERROR_INSERTAR_CELDA2'));
	}

	return cadena;
}

//////////////////
// TABLA EDITABLE FASE II: edición en filas protegida
//////////////////
function desprotegerFilaSeleccionada(nombreTabla, numFilaSeleccionada,filaspaginacion)
{
	var filas = document.getElementById('TABLA_'+nombreTabla).rows;

	//ACTUALIZACIÓN POR AGRUPACIONES
	var numFilas = filas.length;
	var filasFiltradas = new Array();
	var contador =0;
	for(var i=0; i<numFilas; i++){
		if((filas[i].id.search(/filaContenedora/))==-1){
			filasFiltradas[contador] = filas[i];
			contador++;
		}
	}
	filas = new Array();
	filas = filasFiltradas;
	//FIN ACTUALIZACIÓN POR AGRUPACIONES
	var primeraFilaDatos = 0;
	var nombrePrimeraFila = nombreTabla+'fila';
	if(filaspaginacion==undefined || filaspaginacion==null ||filaspaginacion <=0){
		filaspaginacion= Number.MAX_VALUE;

	}
	for (primeraFilaDatos = 0; primeraFilaDatos < filas.length; primeraFilaDatos++)
	{

		if (filas[primeraFilaDatos].id.indexOf(nombrePrimeraFila) == 0)
		{
			break;
		}
	}
	//alert("Primera fila datos: "+primeraFilaDatos+"; ultima fila +1: " + filas.length);
	// Proteccion javascript;
	if(primeraFilaDatos >= filas.length)
		primeraFilaDatos =0;
//	alert("Primera fila:" + primeraFilaDatos + "; fila seleccionada:" + numFilaSeleccionada);
	var celdasPorFila = filas[primeraFilaDatos].cells; // Columnas
	// ToDo -comprobar: el array incluye la cabecera. Si el usuario incluye varias filas de cabecera,
	//     hay que ajustar el siguiente bucle mediante el valor de PRIMERA_FILA_DATOS.
	var PRIMERA_FILA_DATOS = primeraFilaDatos;
	var debugHabilitados = 0;
	var debugDeshabilitados = 0;
	for (var i = PRIMERA_FILA_DATOS; i < filas.length; i++)
	{
		var selects = filas[i].getElementsByTagName('select');
		var inputs = filas[i].getElementsByTagName('input');

		if( (selects != undefined) && (selects != null) )
		{
			for (var j = 0; j < selects.length; j++)
			{
				if(i-PRIMERA_FILA_DATOS == (numFilaSeleccionada%filaspaginacion))
				{
					selects[j].disabled = false;
					//alert("desprotegido select " + j + " de fila " + i);
				}
				else
					selects[j].disabled = true;
			}
		}
		if((inputs != undefined)&& (inputs != null) )
		{
			for (var j = 0; j < inputs.length; j++)
			// El radiobutton es un input
			{
				if(i-PRIMERA_FILA_DATOS == (numFilaSeleccionada%(filaspaginacion)))
				{
					// Esto previene un comportamiento
					// errático del formulario con las celdas de
					// datos en edición en fila protegida con
					// respecto a la desprotegida.
					//
					// NO BORRAR la siguiente línea!
					filas[i].disabled == false;
					if(inputs[j].type=="text")
					{
						inputs[j].disabled = false;
						//alert(inputs[j].name);
						//debugHabilitados ++;
						//alert("desprotegido input " + j + " de fila " + i);
					}
				}
				else
				{
					// NUNCA debemos deshabilitar los radiobutton,
					// NI los checkboxes,
					// NI los botones,
					// NI los hidden
					// equilicuá: sólo los tipo text ;-)
					if(inputs[j].type=="text")
					{
						inputs[j].disabled = true;
						debugDeshabilitados++;
					}
				}
			}
		}
	}
	// alert("Deshabilitados "+debugDeshabilitados+" campos; habilitados "+debugHabilitados+".");
	// Para ejecutar el resto de las operaciones de selección, debemos
	// devolver true.
	// Si devolvemos false, la selección no se lleva a cabo.

	return true;
}

//Evolutivo Gestión Avanzada de Tareas

//Función que devuelve un valor booleano en función de si la aplicación se ejecuta en el Portal o no.
function utils_IsEjecucionPortal(){
	return top.CTE_TAREAS_IS_EJECUCION_SOBRE_PORTAL;
}


/*Función invocada en el onload del formulario de una página con FRAMES.
  Recuperará de la página los FRAMES que contiene y para cada uno obtendrá
  el identificador*/
function utils_IniciarPaginaFrames(){

    if(utils_IsEjecucionPortal())
	{
		for (var i = 0; i < window.frames.length; i++)
		{
			var iframe = window.frames[i];
    		//se recupera el flujo
			 var flujo = null;
			 try{
				flujo=iframe.document.forms[0].flujo.value;
			 }catch (err){
				flujo=null;
			 }

			 //Se recupera la instancia
			 var instancia=null;
			 try{
				instancia=iframe.location.href;
			 }catch (err){
				instancia=null;
			 }

			//SI no se puede recuperar la instancia, es porque cuelga de distinto dirbase
			//por lo que no se intentará desconectar ni la instancia ni el flujo
			if (instancia!=null)
			{
				utils_ActualizarTareaActual(instancia,flujo);
			}
		}
	}else
	{
		var iframe = null;
		for (var i = 0; i < window.frames.length; i++)
		{
			var frame = window.frames[i];

			 //Se recupera la instancia
			 var instancia=null;
			 try{
				instancia=frame.location.href;
			 }catch (err){
				instancia=null;
			 }

			 if(instancia != null){
				if(i == (window.frames.length-1))
				 {
					if(iframe==null){
					  iframe = instancia;
					}else{
					  iframe = iframe + instancia;
					}
				 }
				 else
				 {
					if(iframe==null)
					{
						iframe= instancia;
						iframe= iframe + "*|";
					}else
					{
						iframe= iframe + instancia;
						iframe= iframe + "*|";

					}
				 }
			 }
		}
		utils_ActualizarTareaActual(iframe,null);
	}

}

/* Función que usarán las aplicaciones cuando quieran informar al gestor de tareas la instancia-flujo
   en tiempo de ejecución*/
function utils_ActualizarTareaActual(instancia_url, idFlujo){

  // invocamos a la funcion que hace que nos devuelve de la instancia
  // la maquina:puerto

	//si estamos en el Portal
	if(utils_IsEjecucionPortal()){
	    var instancia = utils_recuperar_instancia_de_url(instancia_url);
	  if(instancia != null){
		if(window.frameElement.id =='FopHome'){
		  top.atpn_gt_actualizar_gestor_tareas_avanzado(instancia,idFlujo,true);
		}
		else{
			top.atpn_gt_actualizar_gestor_tareas_avanzado(instancia,idFlujo,false);
		}
		}
	}
	else
	{
		if (utils_isComuServidorWeb()){
				if(idFlujo==null)
					{
						utils_servidorWeb_enviaPlano("CTE_NAVEGADOR_INFORMAR_SUBTAREAS"+instancia_url);
					}else{
						instancia_url=instancia_url+"*|"+idFlujo+"*";
						utils_servidorWeb_enviaPlano("CTE_NAVEGADOR_INFORMAR_SUBTAREAS"+instancia_url);
					}
			}else{
				  
			      if(window.PlugIn && typeof(window.PlugIn.enviaPlano) != "undefined" && window.PlugIn.IdComm!=0)
			    	{
		        		if(idFlujo==null)
		        		{
		        		    window.PlugIn.enviaPlano("CTE_NAVEGADOR_INFORMAR_SUBTAREAS"+instancia_url);
		        		}else{

		        			  instancia_url=instancia_url+"*|"+idFlujo+"*";
		        		    window.PlugIn.enviaPlano("CTE_NAVEGADOR_INFORMAR_SUBTAREAS"+instancia_url);
		        		}
				}
		      }
	}
}

//Función invocada por el unload del formulario de una página con FRAMES o cuando la aplicación lo encuentre oportuno.
function utils_Desconexion(){
	if(utils_IsEjecucionPortal()){
		top.atpn_gt_eliminarSubTareasTareaActual();
	}
	else
	{
		alert(literales_traducirLiteralMultiidioma('UTILS_DESCONEX_ESCR_PES'));
	}
}

/*
Recuperamos la instancia en funcion de la URL.
*/
function utils_recuperar_instancia_de_url(url)
{
	// se obtiene el servidor y aplicacion web:
	// http[s]://servidor[:puerto]/Junction-WebSeal/aplicacion_web/...
	// También se tratan otros distintos formatos
	var url_aux = "";
	try{
      url_aux = ""+ url +"";
     }catch (err){
      url_aux = url.href;
     }

	var rc = null;

	if (url_aux != null && url_aux != ""){
	 var tienePalabraServlet = false;
	 var posi_servlet = url_aux.indexOf("/servlet/");
	 if(posi_servlet > -1){
      rc = url_aux.substring(0,posi_servlet)
   }
  }
// Si la url no indica el protocolo ni el host, se añade
  if ((rc!=null)&&(rc.search("/")==0)){
      rc=document.location.protocol +"//"+document.location.host+rc;
  }
  //si no tiene la palabra servlet, se devuelve null, porque no podrá ser usado como instancia.
	return rc;
}

function utils_cierre_Ventana()
{
	utils_cierre_Ventana_Aplicacion();
	utils_cierre_Dojo();
}

function utils_cierre_Dojo()
{
		document.write("");
		document.close();
}

function utils_cierre_Ventana_Aplicacion()
{}

function escribePluginOCX(){
		document.write('<OBJECT ID="PlugIn" WIDTH="0" HEIGHT="0" HSPACE="0" VSPACE="0" CLASSID="CLSID:E3C2C239-F164-4808-BB48-FC77AFD35E48">');
		document.write('<param name="IdComm" value="{$idpeticionpesada}"/>');
		document.write('</OBJECT>');
}

function comprobarEmulacionLocal() {
	if (emuladorPesado)
		setTimeout(ejecutarEmulacionLocal, 750);
}

// Ev. Web3270
// Ejecuta una operacion en el puesto cliente pasando el contexto de entrada para la operacion
function ejecutarEmulacionLocal() {
	//Comprobamos que medio de comunicación con la arquitectura pesada debemos utilizar
	if (utils_isComuServidorWeb()){
		//Utilizamos el Servidor Web
		utils_servidorWeb_enviaPlano(document.forms[0].SRVPRESENTACION_CONTEXTO_ENTRADA.value);
	}else{
		//Utilizamos el PlugIn
		document.PlugIn.enviaPlano(document.forms[0].SRVPRESENTACION_CONTEXTO_ENTRADA.value);
	}
}

// Trata el retorno de la operacion 3270 ejecutado en el puesto cliente, creando un formulario y envia el resultado
function tratarRetornoEmulacionLocal(retornoEjecucion) {
	document.forms[0].SRVPRESENTACION_CONTEXTO_SALIDA.value = retornoEjecucion;
	window.document.forms[0].evento.value='0x0E003270';
	window.document.forms[0].submit();
}

function caracteresEspecialesTratamiento(origen){
var i;
caracteres = new Array (" ","\"","\#", "\(", "\)", "\+", "\,",  ";", "<",  ">",  "@", "[", "]", "^", "'", "{", "|", "}", "~" );

codigos = new Array ("%20", "%22","%23","%28", "%29", "%2B", "%2C",  "%3B", "%3C",  "%3E", "%40", "%5B",  "%5D", "%5E", "%60", "%7B", "%7C", "%7D", "%7E");
for(i = 0; i < caracteres.length ;i++){
carac="/\\"+caracteres[i]+"/g";
carac= eval(carac);
var cod=codigos[i];
      origen=new String(origen.replace(carac,cod));
	}
return origen;
}


//Redirecciona a una URL agregando a la petición los datos obtenidos del escritorio pesado
function lanzarURLDatosPesados(url){
    	url = caracteresEspecialesTratamiento(url);
  var nuevaUrl = url + "&TAREA_LIGERA=true&" + "NACARCONTEXT" + "=" + nacarContext;
	window.location=nuevaUrl;
}

/****************************
 * Método que se encarga de determinar si la comunicación se realizará a través del servidor web, o bien a través del plugin OCX
 ***************************/
function utils_isComuServidorWeb(){
  var comuServidorWeb=false;
  try{
      //En primer lugar se comprueba que se ha inicializado la referencia al plugin.
      if (isComunicacionServidorWeb==true){
        comuServidorWeb=true;
      }
  }catch (err1){;}

  if (comuServidorWeb==false){
    isComunicacionServidorWeb=false;
    identificadorComunicacion=0;
    puertoServidorWeb=0;
  }
  return comuServidorWeb;
}

//ACTUALIZACIÓN POR AGRUPACIONES
/***
*Funciones para la inserción de datos de la tabla con agrupaciones.
****/
function insertarCeldaDatosAgrupados(dato)
{
	var cadena = "";

	cadena+= dato;

	return cadena;
}

/**************MENSAJE DE ERROR DOJO*************************
*Metodo que muestra u oculta el elemento idMostrarOcultar, Cambia el icono del Mostrar detalles-Ocultar detalles y
*cambia el codigo HTML del componente que recibe como segundo parametro.
****************************************/
function Mostrar_Ocultar(idMostrarOcultar, compCambiarHtml, idImgFlecha){
	 var componente=document.getElementById(idMostrarOcultar);
	 var imagenFlecha=document.getElementById(idImgFlecha);
   if (	componente.style.display == "") {
		compCambiarHtml.innerHTML=literales_traducirLiteralMultiidioma('UTILS_MOSTRAR_DETALLES')+' &nbsp';
		componente.style.display= "none";
     	imagenFlecha.src=flecha_m.src;

   } else {
     compCambiarHtml.innerHTML=literales_traducirLiteralMultiidioma('UTILS_OCULTAR_DETALLES')+' &nbsp';
     componente.style.display= "";
     imagenFlecha.src=flecha_o.src;
   }
}

function crearMensajeCierre(mensaje){
	if(utils_isComuServidorWeb()){
		puerto=puertoServidorWeb;
		var archivoTXT="&mensaje="+mensaje;
		var	url="http://localhost:"+ puerto;
		url_base= url +"/comunicacion";
		var url_base="";
		// Usamos el conector de comunicaciones para transmitir la peticion
		archivoTXT ="cabecera=CTE_MENSAJE_CONFIRMACION"+archivoTXT;
		var	url="http://localhost:"+ puerto;
		url_base= url +"/comunicacion";
		utils_servidorWeb_ejecutarPeticionAJAX(url_base,null,"null","true",utils_servidorWeb_funcionError,archivoTXT);
	}
	else{
		var archivoTXT = "CTE_MENSAJE_CONFIRMACIONmensaje=*=" + mensaje;
		PlugIn.EnviaPlano(archivoTXT);
	}
}

function anularMensajeCierre(){
	if(utils_isComuServidorWeb()){
		var archivoTXT="&mensaje=";
		var	url="http://localhost:"+ puerto;
		url_base= url +"/comunicacion";
		var url_base="";
		// Usamos el conector de comunicaciones para transmitir la peticion
		archivoTXT ="cabecera=CTE_MENSAJE_CONFIRMACION"+archivoTXT;
		var	url="http://localhost:"+ puerto;
		url_base= url +"/comunicacion";
		utils_servidorWeb_ejecutarPeticionAJAX(url_base,null,"null","true",utils_servidorWeb_funcionError,archivoTXT);
	}
	else{
		var archivoTXT = "CTE_MENSAJE_CONFIRMACIONmensaje=*=";
		PlugIn.EnviaPlano(archivoTXT);
	}
}

/**
* Función que activa la ventana modal
*/
function utils_activarVentana(url,id,ObjPortal,nacCtx,invocador){
	
	var capaOculta= document.getElementById("McapaOculta_"+id);
	
	//Comprobamos si se va a mostrar un mensaje que la capa oculta sea transparente
	if (invocador!=undefined && invocador!=null && invocador!="" && invocador=="MostrarMensaje")
	{
		capaOculta.style.opacity=0;
	}
	//Ahora que esta visible obtenemos la altura de la capa oculta
	capaOculta.style.display="block";
	
	//Mostramos la ventana emergente con z-index:901 para que se muestre por encima de la capa bloqueadora
	var frame= document.getElementById("frameconvencional_"+id);
	
	//Obtenemos el iframe interno, asignamos su contenido y lo mostramos
	var urlDesplegable=url+"&VMODAL_FF=true";
	
	var div = document.getElementById("frameinterno_" + id).innerHTML;
	div=replaceTexto(div,"javascript:\'\';",urlDesplegable);
	document.getElementById("frameinterno_" + id).innerHTML = div;
	
	frame.style.zIndex=101;	
	//Evitamos que se muestre el frame entero
	
	//frame.style.visibility="visible";
	frame.style.display="block";	

  
  // Gestión del Foco en ventanas modales
  
  // Se inserta el evento onFocus en la ventana padre. La función despacharFocoAVentanaModalFF() será
  //la primera que se ejecuta en el momento que la ventana padre obtenga el foco
  if (this.addEventListener) { // Mozilla, Netscape, Firefox
    this.addEventListener("focus", function(){despacharFocoAVentanaModalFF(id)}, true);
  }
  else { //IE
    this.attachEvent("onfocus", function(){despacharFocoAVentanaModalFF(id)});
  }
  
  // El frame interno reclama el foco y se le asigna
  var frameInt = document.getElementById("iframeinterno_" + id);
  if(frameInt != null && frameInt != undefined){
    if(frameInt.contentWindow != null && frameInt.contentWindow != undefined){
      //La ventana contenida en el frame Interno reclama el foco
      frameInt.contentWindow.focus();
    }
    else{
      //el frame Interno reclama el foco
      frameInt.focus();
    }
  }
  
	if (invocador!=undefined && invocador!=null && invocador!=""){
		if (invocador!="MostrarMensaje")
		{
			//alert(invocador);
			setTimeout(function(){gestionTareaModalesFF(ObjPortal,id);},1000);
		}
	}
	
}

function replaceTexto(texto,s1,s2){
	return texto.split(s1).join(s2);
}

/*
*  Funcion ejecutada cuando se cierra la ventana modal y que ejecuta en el caso de que la ventana haya sido creada desde la función mostrarMensajeNN
*  el código ejecutado cuando se recibe el resultado de la ventana modal
*  Esta función solo se invoca cuando el navegador es FireFox.
*/
function mostrarResVentanaModal(variableRetorno,invocador){
	
	if(invocador=="MostrarMensaje"){
		var documento = document;						
		var variableRetornoAux=new Array();
		if (variableRetorno == undefined)
		{
			// Si la variable de retorno viene undefined se puede recalcular para el caso de mensajes utilizando el valor de los parámetros de mensajes
			variableRetorno = urlInvocada + "," + origenMensaje;
		}
		if (variableRetorno!=null && variableRetorno!="")
		{
			variableRetornoAux=variableRetorno.split(",");
			var myValorRetornado=undefined;
			//Recuperamos el valor de la ventana modal, si es firefox2 y el resultado devuelto en myReturnValue es distinto de la cadena vacia actualizo el valor
			//de la variable myReturnValue
			if(document.getElementById("myValorRetornado").value!=""){
				myValorRetornado=document.getElementById("myValorRetornado").value;
			}
			//Se comprueba si se ha definido algún valor de retorno para la ventana que invocó a la ventana modal
			if(myValorRetornado) {
					//En el caso de que la variable esté definida
					if(frameInvocadorVentanaModalFF!=null){
						documento=frameInvocadorVentanaModalFF.document;
					}
					enviaFormularioMensajes(documento, myValorRetornado, variableRetornoAux[1]);
			} else if(myValorRetornado==undefined || myValorRetornado == ''){
					//La variable está vacia
					mostrarMensajeNN(variableRetornoAux);
			}
		}
		
	}
}

function crearVentanaModalConvencionalFirefox(titulo,iconoCerrar,literalCerrar,id,scroll,url,newAncho,newAlto,parametros,variableRetorno,invocador,funcionRespuesta,flujoId,nacarC){
	// Se inicializa la varible con el flujoID del origen del mensaje
	origenMensaje=parametros;
	// Se inicializa la varible con la url invocada
	urlInvocada=url;	
				
    if(document.getElementById("myValorRetornado")!=undefined && document.getElementById("myValorRetornado")!=null){	
			document.getElementById("myValorRetornado").value="";
		}
		var id=parseInt(id);
		
		if(utils_isNavegadorFirefox2()){
			do{
				if(document.getElementById("frameinterno_"+id)!=undefined)
				{
					id=id+1;
				}
			}while(document.getElementById("frameinterno_"+id)!=undefined);
		}
		
		var cadena = '';
		
		//Se recupera el objeto body, bien directamente del document o del Formulario
    var objetoBody = null;
    if(document.body != null && document.body != undefined){
      objetoBody = document.body;
    }
    else if(document.forms[0] != null && document.forms[0]!= undefined){
      objetoBody = document.forms[0].parentNode;
    } 
		
    var scrollWidth = 0;
    if(objetoBody != null && objetoBody != undefined){
		  scrollWidth = objetoBody.scrollWidth / 2;
		}
		else{
       scrollWidth = screen.width / 2;
    }
    
    var ancho = (screen.width)/3;
		var alto = (screen.height)/4;
		
    var factorCorreccion = 0;
		
		if (newAlto!=undefined && newAlto!=null && newAlto!=0 && newAlto!="0"){
			alto=newAlto;
		}
		else{
		  //Si no se han definido un alto, se añaden 2 píxeles para centrar la ventana
      factorCorreccion = 2;
    }
	
		if (newAncho!=undefined && newAncho!=null && newAncho!=0 && newAncho!="0"){
			ancho=newAncho;
		}
		if (typeof(nacarContext) == "undefined"){
			nacarContext = "";
		}
		nacarContext=nacarC;
		
		var ObjPortal= new Object();
		try{
			if((utils_IsEjecucionPortal())||(utils_isComuServidorWeb())||(window.PlugIn && window.PlugIn.IdComm!=0))
				ObjPortal=window;
			ObjPortal=window;
		}catch(err){
				ObjPortal=null;
		}
		if(parametros==undefined || parametros==null || parametros=="null")
		{
			parametros="";
		}
		
		//Se calcula el tamaño del frame interno. En el alto, se descuenta el tamaño de la cabecera.
		var altoFrameInterno=alto-24+factorCorreccion;
		var anchoFrameInterno=ancho;
		
		var idFrame = obtenerIDContenedor(flujoId);
		var posicionLeft=scrollWidth-(ancho/2);
		/*Creamos la cadena con que generará la ventana modal*/
			
    //<input type=hidden name="myValorRetornado" id="myValorRetornado" value="">
		var objINPUTValorRetornado = document.createElement('input');
    objINPUTValorRetornado.setAttribute("type", "hidden");
    objINPUTValorRetornado.setAttribute("name", "myValorRetornado");
    objINPUTValorRetornado.setAttribute("id","myValorRetornado");
    objINPUTValorRetornado.setAttribute("value","");
        
    //<input type=hidden name="invocador" id="invocador" value='+invocador+'>
    var objINPUTInvocador = document.createElement('input');
    objINPUTInvocador.setAttribute("type", "hidden");
    objINPUTInvocador.setAttribute("name", "invocador");
    objINPUTInvocador.setAttribute("id","invocador");
    objINPUTInvocador.setAttribute("value",invocador);
        
    //<input type=hidden name="parametrosVModal" id="parametrosVModal" value="'+parametros+'">
    var objINPUTParametros = document.createElement('input');
    objINPUTParametros.setAttribute("type", "hidden");
    objINPUTParametros.setAttribute("name", "parametrosVModal");
    objINPUTParametros.setAttribute("id","parametrosVModal");
    objINPUTParametros.setAttribute("value",parametros);
    
    //<input type=hidden name="myNacarContext" id="myNacarContext" value="'+nacarContext+'">
    var objINPUTNacarContext = document.createElement('input');
    objINPUTNacarContext.setAttribute("type", "hidden");
    objINPUTNacarContext.setAttribute("name", "myNacarContext");
    objINPUTNacarContext.setAttribute("id","myNacarContext");
    objINPUTNacarContext.setAttribute("value",nacarContext);
    
		//<div id="frameconvencional_'+id+'" style="BORDER:2px solid #036EFF;POSITION:absolute;align:center;valign:center;display:none;width:'+ancho+'px;height:'+alto+'px;top:90px;left:'+posicionLeft+'px;opacity:1;filter:alpha(opacity=100);">
		var objDIVFrameConvencional = document.createElement('div');
		objDIVFrameConvencional.setAttribute("id","frameconvencional_"+id);
    var estilo = "BORDER:2px solid #036EFF; POSITION:absolute; align:center; valign:center; display:none; width:"+ancho+"px; height:"+alto+"px; top:90px; left:"+posicionLeft+"px; opacity:1; filter:alpha(opacity=100);";
    objDIVFrameConvencional.setAttribute("style", estilo);
    
    //<div id="framecabecera_'+id+'" style="20px;width:100%;">
    var objDIVFrameCabecera = document.createElement('div');
		objDIVFrameCabecera.setAttribute("id","framecabecera_"+id);
    objDIVFrameCabecera.setAttribute("style", "20px;width:100%;");
    
    
    //<table id="cabecera_'+id+'" height="20px" width="100%" cellspacing="0" cellpading="0" border="0" style="background-color:#036EFF;background-position:bottom left;font:bold 100% arial;color:white;font-size:12px;padding:2px 0px 2px 0px;margin:0px 0px 0px 0px;">'
    var objTABLECabecera = document.createElement('table');
		objTABLECabecera.setAttribute("id","cabecera_"+id);
		objTABLECabecera.setAttribute("height","20px");
		objTABLECabecera.setAttribute("width","100%");
		objTABLECabecera.setAttribute("cellspacing","0");
		objTABLECabecera.setAttribute("cellpading","0%");
		objTABLECabecera.setAttribute("border","0");
    objTABLECabecera.setAttribute("style", "background-color:#036EFF; background-position:bottom left; font:bold 100% arial; color:white; font-size:12px; padding:2px 0px 2px 0px; margin:0px 0px 0px 0px;");
    
    //<tr>
    var objTRCabecera = document.createElement('tr');
    
    //<td width="5px">
    var objTD1Cabecera = document.createElement('td');
    objTD1Cabecera.setAttribute("width","5px");
    
    objTRCabecera.appendChild(objTD1Cabecera);
    
    //<td align="left" width="50%" >
    var objTD2Cabecera = document.createElement('td');
    objTD2Cabecera.setAttribute("align","left");
    objTD2Cabecera.setAttribute("width","50%");
  
    //<label id="lTitulo" name="lTitulo">'+titulo+'</label>
    var objLabelTitulo = document.createElement('label');
    objLabelTitulo.setAttribute("id","lTitulo");
    objLabelTitulo.setAttribute("name","lTitulo");
    
    var tituloMensaje = document.createTextNode(titulo);
    objLabelTitulo.appendChild(tituloMensaje);

    objTD2Cabecera.appendChild(objLabelTitulo);
    objTRCabecera.appendChild(objTD2Cabecera);
    
    //<td align="right" width="50%">
    var objTD3Cabecera = document.createElement('td');
    objTD3Cabecera.setAttribute("align","right");
    objTD3Cabecera.setAttribute("width","50%");
    
    //<a href="javascript:cerrarVentanaModalFF(\''+id+'\',\''+variableRetorno+'\',\''+invocador+'\',\''+funcionRespuesta+'\',\''+idFrame+'\');" id=accionCerrar name=accionCerrar >
    var objAAccionCerrar = document.createElement('a');
    var funcionCerrarVentanaModal = "javascript:cerrarVentanaModalFF(\'"+id+"\',\'"+variableRetorno+"\',\'"+invocador+"\',\'"+funcionRespuesta+"\',\'"+idFrame+"\');";
    objAAccionCerrar.setAttribute("href",funcionCerrarVentanaModal);
    objAAccionCerrar.setAttribute("id","accionCerrar");
    objAAccionCerrar.setAttribute("name","accionCerrar");
    
    //<IMG title="'+literalCerrar+'" src="'+iconoCerrar+'" border="0">
    var objIMGCerrar = document.createElement('img');
    objIMGCerrar.setAttribute("title",literalCerrar);
    objIMGCerrar.setAttribute("src",iconoCerrar);
    objIMGCerrar.setAttribute("border","0");
    
    objAAccionCerrar.appendChild(objIMGCerrar);
    objTD3Cabecera.appendChild(objAAccionCerrar);
    objTRCabecera.appendChild(objTD3Cabecera);
    
    //<td align="right" width="50%">
    var objTD4Cabecera = document.createElement('td');
    objTD4Cabecera.setAttribute("align","right");
    objTD4Cabecera.setAttribute("width","50%");
    
    objAAccionCerrar.appendChild(objIMGCerrar);
    objTD4Cabecera.appendChild(objAAccionCerrar);
    objTRCabecera.appendChild(objTD4Cabecera);
    
    //<td width="5px">
    var objTD5Cabecera = document.createElement('td');
    objTD5Cabecera.setAttribute("width","5%");
    
    objTRCabecera.appendChild(objTD5Cabecera);
    
    objTABLECabecera.appendChild(objTRCabecera);
    
    objDIVFrameCabecera.appendChild(objTABLECabecera);
    
    //<div id="frameinterno_'+id+'" style="height:100%;width:100%;overflow:auto">'
    var objDIVFrameInterno = document.createElement('div');
		objDIVFrameInterno.setAttribute("id","frameinterno_"+id);
    objDIVFrameInterno.setAttribute("style", "height:100%; width:100%; overflow:auto");
    
    //<NOBR>
    var objNOBR = document.createElement('nobr');
	
	  //<IFRAME registrado="0" height="'+altoFrameInterno+'" width="'+anchoFrameInterno+'" name="iframeinterno_'+id+'" id="iframeinterno_'+id+'" src="javascript:\'\';"';		
		var objIFRAMEInterno = document.createElement('iframe');
		objIFRAMEInterno.setAttribute("registrado","0");
    objIFRAMEInterno.setAttribute("height", altoFrameInterno);
    objIFRAMEInterno.setAttribute("width", anchoFrameInterno);
    objIFRAMEInterno.setAttribute("name", "iframeinterno_"+id);
    objIFRAMEInterno.setAttribute("id", "iframeinterno_"+id);
    objIFRAMEInterno.setAttribute("src", "javascript:\'\';");
    if (scroll==false)
		{
					objIFRAMEInterno.setAttribute("scrolling", "no");
		}
		objIFRAMEInterno.setAttribute("frameborder", "0");
    	 
	  objNOBR.appendChild(objIFRAMEInterno);
	  
	  objDIVFrameInterno.appendChild(objNOBR);
	
	  objDIVFrameConvencional.appendChild(objDIVFrameCabecera);
	  objDIVFrameConvencional.appendChild(objDIVFrameInterno);
    
	  objetoBody.appendChild(objDIVFrameConvencional);
	  objetoBody.appendChild(objINPUTInvocador);
    objetoBody.appendChild(objINPUTParametros);
    objetoBody.appendChild(objINPUTNacarContext);
    objetoBody.appendChild(objINPUTValorRetornado);
    /*Final de la creación de la cadena con que generará la ventana modal*/

    //Se crea la capa oculta
		cadena=utils_crearCapaOculta(id);
		if (typeof(ventanasEmergentes_Identificadores) != "undefined"){
			ventanasEmergentes_Identificadores[id]=id;
		}
		if (typeof(mostrarMensajesContenedor) != "undefined"){
			mostrarMensajesContenedor[id]=true;
		}
	
		utils_activarVentana(url,id,ObjPortal,nacarContext,invocador);

}

//Funcion que comprueba si la ventana modal tiene datos para enviar al cerrarse
function cerrarVentanaModalFF(id, datos, invocador,funcionRespuesta,idFrame){
  var recuperadoFrameVentanaModal = false;
  //Se envia al frame datos.
	if (invocador!=undefined && invocador!=null && invocador!="")
	{
    //Se recupera el frame que invocó a la ventana Modal (en caso de existir)
    
    var frame = getFrameInvocadorVentanaModalFF();
    if(frame != null)
    {
      recuperadoFrameVentanaModal = true;
    }
     
		if (invocador=="MostrarMensaje")
		{
			if (document.getElementById("myValorRetornado").value!=undefined && document.getElementById("myValorRetornado").value!=null)
			{
				if (document.getElementById("myValorRetornado").value!="")
				{
					utils_cerrarVentanaModalConvencional(id);
					mostrarResVentanaModal(datos,invocador)
					eval(funcionRespuesta);
				}
			}
		}
		else if (invocador=="VentanaModal" || invocador=="VentanaModalMicroStrategy")
		{
			utils_cerrarVentanaModalConvencional(id);
			mostrarResVentanaModal(datos,invocador)
			
			if (frame != undefined && frame != null && frame != ""){
          frame.eval(funcionRespuesta);
      }else{
			eval(funcionRespuesta);
      }
		}
	}
	else{
		utils_cerrarVentanaModalConvencional(id);
		mostrarResVentanaModal(datos,invocador)
		//funcionRespuesta();
		window[funcionRespuesta];
	}
	if(recuperadoFrameVentanaModal == true){
    //se limpia el frame invocador de Ventanas Modales FF
    setFrameInvocadorVentanaModalFF(null);
  }
}
//Función que actualiza el nacarContext de la ventana
function actualizarNacarC(nacCtx){
	if (typeof(nacarContext) != "undefined"){
		nacarContext=nacCtx
	}
}

//Funcion que informa la creacion de la ventana modal de FF a la gestion de tareas
function gestionTareaModalesFF(ObjPortal,id){
	var frame2 = null;
	if(utils_isNavegadorFirefox2())
	{
			frame2 =document.getElementById('iframeinterno_'+id).contentWindow;
	}else{
			if (document.getElementById('iframeinterno_'+id).contentWindow)
			{
				frame2 =document.getElementById('iframeinterno_'+id).contentWindow;
			} else 
			{
				frame2 = document.frames['iframeinterno_'+id].window;
			}
	}
		
	VentanasModales_InformarInstanciaModalFF(ObjPortal,frame2);
}

/*
*  Función ejecutada para ocultar y eliminar la ventana modal, está función es ejecutada cuando se cierra la ventana modal
*/
function utils_cerrarVentanaModalConvencional(id)
{
	
	var frame2=null;
	if(utils_isNavegadorFirefox2())
	{
		frame2 =document.getElementById('iframeinterno_'+id).contentWindow;
	}else{
		if (document.getElementById('iframeinterno_'+id).contentWindow)
		{
			frame2 =document.getElementById('iframeinterno_'+id).contentWindow;
		} else 
		{
		
			frame2 = document.frames['frameinterno_'+id].window;
		}
	}

	llamador = document.getElementById("invocador").value;
	
	if (llamador!=undefined && llamador!=null && llamador!="" && llamador!="MostrarMensaje" && llamador!="VentanaModalMicroStrategy")
	{
		utils_ventanaModal_lanzarUrlDesconexion(window,frame2);
	}

	
		
	//Ocultamos la capa bloqueadora
	var capaOculta= document.getElementById("McapaOculta_"+id);
	
	var ventanaEmergente= document.getElementById("frameconvencional_"+id);
	ventanaEmergente.style.zIndex=0;
	//Evitamos que se muestre el frame entero
	ventanaEmergente.style.overflow="hidden";

	 var frameinterno= document.getElementById('frameinterno_'+id);
	  //Asignamos la url de desconexion al iframe una vez se ha replegado
	  setTimeout(function(){frameinterno.src="about:blank";},500);
	  //Esperamos a que se termine de replegar la ventana emergente para hacerla invisible
	  setTimeout(function(){ventanaEmergente.style.display='none';},400);
	  setTimeout(function(){capaOculta.style.display="none";},450);
	
	 var framecabecera= document.getElementById('framecabecera_'+id);


  //Se recupera el objeto body, bien directamente del document o del Formulario
  var objetoBody = null;
  if(document.body != null && document.body != undefined){
    objetoBody = document.body;
  }
  else if(document.forms[0] != null && document.forms[0]!= undefined){
    objetoBody = document.forms[0].parentNode;
  }

	//Se elimina el html generado para crear la ventana modal
	if (ventanaEmergente!=undefined && ventanaEmergente!=null)
	{
		if (frameinterno!=undefined && frameinterno!=null)
		{
			ventanaEmergente.removeChild(frameinterno);
		}
		
		if (framecabecera!=undefined && framecabecera!=null)
		{
				ventanaEmergente.removeChild(framecabecera);
		}

    if(objetoBody != null){
		  objetoBody.removeChild(ventanaEmergente);
		}
		
	}

	if (capaOculta!=undefined && capaOculta!=null)
	{
    if(objetoBody != null){
		  objetoBody.removeChild(capaOculta);
		}
	}

}

/**
* Función que crea la cadena que generará la capa que bloquea el resto de la ventana.
*/
function utils_crearCapaOculta(id)
{

	//Establecemos opacity(firefox) y filters.alpha.opacity(IE) a 0.4 para que se transparente lo existente
  	if(document.body != null && document.body != undefined){
      objetoBody = document.body;
    }
    
    var objDIVFrameCapaOculta = document.createElement('div');
		objDIVFrameCapaOculta.setAttribute("id","McapaOculta_"+id);
    objDIVFrameCapaOculta.setAttribute("style", "z-index:100; position:absolute; left:0px; top:0px; display:none; height:100%; width:100%; background-color:#000000; opacity:0.4; filter:alpha(opacity=40)");
    
    objetoBody.appendChild(objDIVFrameCapaOculta);
}

// Método que informa al gestor de la nueva instancia y tarea que se está ejecutando.
function VentanasModales_InformarInstanciaModalFF(Portal,iframe){
		//Informamos al gestor de tareas de la instancia y el flujo
			//se obtiene la instancia
		var instancia=null;
		try{
			instancia = iframe.location;
		}catch (err){
			instancia = null;
		   idflujo = null;
		}
		
		//Informamos una vez se ha creado la tarea
		setTimeout(function(){
	   //Si no se puede recuperar la instancia, es porque cuelga de distinto dirbase
	   //por lo que no se intentará desconectar ni la instancia ni el flujo
		if (instancia!=null)
		{

      try{
        //se recupera el flujo
        var miFlujoId=null;
        if(iframe != null && iframe!=undefined && 
          iframe.document != null && iframe.document!=undefined &&
          iframe.document.forms[0] != null && iframe.document.forms[0]!=undefined && 
          iframe.document.forms[0].flujo != null && iframe.document.forms[0].flujo!=undefined ){
          miFlujoId=iframe.document.forms[0].flujo.value;
        }
        var idflujo = null;
        try{
          idflujo = miFlujoId;
        }catch (err){
         idflujo = null;
        }
			   
        //La variable Portal se crea en cada ventana modal
	//y recibe como valor el objeto padre de la ventana del Portal
				Portal.utils_ActualizarTareaActual(instancia,idflujo);

			}catch (err){

			}
		}
		},1000);

}

// Método que informa al gestor de la nueva instancia y tarea que se está ejecutando.
function VentanasModales_InformarInstancia(Portal){

		//Informamos al gestor de tareas de la instancia y el flujo
			//se obtiene la instancia
		var instancia=null;
		try{
			instancia = window.location;
		}catch (err){
			instancia = null;
		}

		//Informamos una vez se ha creado la tarea
		setTimeout(function(){
	   //Si no se puede recuperar la instancia, es porque cuelga de distinto dirbase
	   //por lo que no se intentará desconectar ni la instancia ni el flujo
		if (instancia!=null)
		{

    try{
      //se recupera el flujo
      var miFlujoId=null;
      if(document != null && document!=undefined &&
        document.forms[0] != null && document.forms[0]!=undefined && 
        document.forms[0].flujo != null && document.forms[0].flujo!=undefined ){
        miFlujoId=document.forms[0].flujo.value;
      }
      var idflujo = null;
      try{
        idflujo = miFlujoId;
      }catch (err){
        idflujo = null;
      }
			
				//La variable Portal se crea en cada ventana modal
				//y recibe como valor el objeto padre de la ventana del Portal

				Portal.utils_ActualizarTareaActual(instancia,idflujo);

			}catch (err){

			}
		}
		},1000);
}


function utils_ventanaModal_lanzarUrlDesconexion(Portal,iframe){
	var miFlujoId = null;
	if(iframe != null && iframe!=undefined && 
      iframe.document != null && iframe.document!=undefined &&
      iframe.document.forms[0] != null && iframe.document.forms[0]!=undefined && 
      iframe.document.forms[0].flujo != null && iframe.document.forms[0].flujo!=undefined ){
        miFlujoId=iframe.document.forms[0].flujo.value;
  }

	var urlDesconexion = "";
	
	if (miFlujoId!=null &&  miFlujoId != undefined){
		var url_aux = "";
		url_aux = String(iframe.location);
		if (url_aux != null && url_aux != ""){
			var posi_servlet = url_aux.indexOf("/servlet/");
			if(posi_servlet > -1){
				urlDesconexion = url_aux.substring(0,posi_servlet+9);
			}
			urlDesconexion+="web?evento=0xd001006&flujo=" + miFlujoId;
		}
	}
	try{
  	if(urlDesconexion!="" && urlDesconexion!=null && urlDesconexion!=undefined){
  			ejecutarPeticionAJAX(urlDesconexion,funcion_vacia_defecto,null,false);
  	}
	}catch(err){
			loadScript('/'+nombreArquitecturaAux+'_es_web_pub/js/ajax.js');
			if(urlDesconexion!="" && urlDesconexion!=null && urlDesconexion!=undefined){
			 setTimeout("ejecutarPeticionAJAX(\'"+urlDesconexion+"\',"+funcion_vacia_defecto+",null,false)",4000);
			}
		}
}

//Funciones para la obtención y asignación de parámetros en las ventanas modales

//Función que devuelve los parámetros pasados a la ventana modal.
function obtenerParametrosModal(){
	if(ie)
	{
		return dialogArguments[1];
	}else{
		var parametros=new Array();
		if(parent.document.getElementById("parametrosVModal").value!=undefined && parent.document.getElementById("parametrosVModal").value!=null && parent.document.getElementById("parametrosVModal").value!="")
		{
			parametros=(parent.document.getElementById("parametrosVModal").value).split(",");
		}
		return parametros;
	}

}

//Función que obtiene el nacarContext en la ventana modal
function obtenerNacarContextModal(){
	if(ie){
		return dialogArguments[3];
	}else{
		return parent.document.getElementById("myNacarContext").value;
	}
}

//Función que asigna la respuesta que va a devolver la ventana modal
function asignarRespuestaVentanaModal(respuesta){
	if(ie){
			parent.window.returnValue=respuesta;

	}else{
		if (parent!=undefined)
		{
			if (parent.document.getElementById("myValorRetornado")!=undefined && parent.document.getElementById("myValorRetornado")!=null)
			{
				parent.document.getElementById("myValorRetornado").value=respuesta
			}

		}		
	}
}

function obtenerResultadoAsignadoVentanaModal(){
	if(ie){
		return resultadoVModal;
	}else{
		var padre = null;
  
  	//Se obtiene el padre para mostrar la ventana en el frame adecuado
    if (this != parent){
      padre = obtenerIframePadre();
    }
  
		var parametros=new Array();
		if (padre != undefined && padre != null && padre != ""){
    	if(padre.document.getElementById("myValorRetornado").value!=undefined && padre.document.getElementById("myValorRetornado").value!=null && padre.document.getElementById("myValorRetornado").value!="")
		  {
			   parametros=(padre.document.getElementById("myValorRetornado").value).split(",");
		  }
    }else{
		if(document.getElementById("myValorRetornado").value!=undefined && document.getElementById("myValorRetornado").value!=null && document.getElementById("myValorRetornado").value!="")
		{
			parametros=(document.getElementById("myValorRetornado").value).split(",");
		}
    }
		return parametros;
	}
}

function loadScript(url){
            var script = document.createElement("script")
            script.type = "text/javascript";
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);          
}

// Evolución para validar si una serie de operaciones pesadas están autorizadas
// Genera una mensaje a partir del array de operaciones que recibe la función como parámetro.
// Utiliza también un nuevo tipo de mensaje para comunicarse con el plugin o el servidor web local.
function isOperacionPermitidaEscritorio(arrayOperaciones) {

  var mensaje="";
  var retorno="";
	if(isEjecucionPortal()){
		if(arrayOperaciones != null && arrayOperaciones.length > 0){		
			var resultados=top.atpn_gt_isOperacionesPermitidas(arrayOperaciones);
			var result=new Array();
			for (var i=0;i<arrayOperaciones.length;i++){
				result[i] = new Array(arrayOperaciones[i],resultados[i]);	
			}			
			return result;
	  }
		
	}
	else if(isNavegadorEmbebido() || utils_isComuServidorWeb()){
	  if(arrayOperaciones != null && arrayOperaciones.length > 0){
	    // El formato será operacion1*+*operacion2*+*operacion3 ...
	    for (var i=0;i<arrayOperaciones.length;i++){
	      if (i > 0){
		  	  mensaje = mensaje + "*+*";
		    }
		  	mensaje = mensaje + arrayOperaciones[i];
		  }
		  mensaje = "CTE_COMPRUEBA_OPERACIONES_PESADAS" + mensaje;
		  
	    if (utils_isComuServidorWeb()){
	      // Utiliza el servidor Web Local para ejecutar la petición sobre la arquitectura.
		    retorno=utils_servidorWeb_enviaPlanoSinc(mensaje);    
		  }else if (isNavegadorEmbebido()){
		  		// Utiliza el plugin para ejecutar la petición sobre la arquitectura
		  		retorno = PlugIn.enviaPlanoSinc(mensaje);	  				
		  } else {
	      // no de ejecuta dentro del escritorio.
	      alert(literales_traducirLiteralMultiidioma('UTILS_NO_OPER_FUERA'));
	    }
		  // Trata el mensaje recuperado
		  return trataMensajeOperaciones(retorno);
		}
	}else{
		alert(literales_traducirLiteralMultiidioma('UTILS_NO_OPER_FUERA'));
	}
}

// Trata el resultado obtenido a través de la invocación a la arquitectura. Recibe un mensaje
// que se traduce en un array de dos dimensiones en el que se incluye tanto la columna con las
// operaciones que se consultaron y otra columna con los valores booleanos que especifican si las
// operaciones están autorizadas o no.
function trataMensajeOperaciones(mensaje){
	var resultado="";
	if (mensaje != null && mensaje != ""){
		// El formato del mensaje es el siguiente operacion1*=*autorizado1*+*operacion2*=*autorizado2 ...
		 resultado = new Array()
		var tokenizer = mensaje.split("*+*");
		var toklower = "";
		for(var contador = 0;contador<tokenizer.length;contador++){
			// Obtiene bloque a bloque
			toklower = tokenizer[contador].toLowerCase();
			var tokenizer2 = toklower.split("*=*");
			// Obtiene la clave y el valor
			resultado[contador] = new Array(tokenizer2[0],tokenizer2[1]);	
		}
	}
	return resultado;
}

//Publica el texto en la barra de mensajes del portal escenia o escritorio pesado
function publicarTextoEnBarraMensajePortal(texto){
	if(utils_IsEjecucionPortal()){
		top.atpn_gt_publicarAreaMensajes(texto);

	} else if (utils_isComuServidorWeb()){
		utils_servidorWeb_enviaPlano("CTE_PUBLICAR_MENSAJE_EN_ESCRITORIO_NACAR20"+ "_" + texto);

	} else if (isNavegadorEmbebido()) {
		window.PlugIn.enviaPlano("CTE_PUBLICAR_MENSAJE_EN_ESCRITORIO_NACAR20"+ "_" + texto);

	} else {
		alert(texto);
	}
}

/*Funcion que cierra la ventana cuando se muestra un mensaje de arquitectura mostrado en una ventana de arquitectura
Diferencia por navegador dado que si el navegador es FireFox la función window.close() no tiene sentido pues se utiliza 
una solución por capas javaScript
*/
function cerrarVentanaArquitectura(){
	if(ie){
		window.close();
	}else{
		formulario = parent.frames['iframeinterno_0'].window.document.forms[0];
		myValorRetornado=construyeTrozoForm(formulario.length, formulario, '');
		asignarRespuestaVentanaModal(myValorRetornado);
		// Reconstruye el valor de myValorRetornado a partir de los datos del formulario
		parent.mostrarResVentanaModal(parent.variableRetorno,"MostrarMensaje")
		if(parent.frameInvocadorVentanaModalFF!=null)
			parent.utils_lanzarProcesoCerrarVentanaModal(null,null);
		
	}
}
// Devuelve los datos de operaciones permitidas para el usuario. Los datos se pueden devolver de dos maneras posibles,
// en función del parametro bSoloListaOps.
// - Si bSoloListaOps es false se devuelve un array que contiene parejas [operacion,permitida] con el id de la operacion y si esta o no permitida.
// - Si bSoloListaOps es true se devuelve un array que contiene las operaciones permitidas.
function listarOperacionesPermitidas(arrayOperaciones, bSoloListaOps)
	{
		var resultados = isOperacionPermitidaEscritorio(arrayOperaciones);
		if(resultados!= undefined)
		{
		  if(bSoloListaOps)
  		{
  			// Tratar datos y devolver array de operaciones
  			var opsValidas = new Array();
  			var j=0;
  			for (i=0;i<resultados.length;i++){
  				if(resultados[i][1]=="true")
  				{
  					opsValidas[j]=resultados[i][0];
  					j++;
  				}
  			}
  			return opsValidas;
  		}
  		else
  		{
  			return resultados;
  		}
    }
    else
    {
      resultados = new Array();
      return resultados;
    }
	}

function funcion_vacia_defecto(){}

//Activación/desactivación del cierre controlado desde pulsación de Aspa del escritorio pesado
function activarCierreControladoAspa(activar){

	if(utils_IsEjecucionPortal())//no aplica a portales ligeros
		return;

	//valores validos: 'true' y 'false'
	if(activar == null || activar == undefined || (activar != "true" && activar != "false")){
		alert(literales_traducirLiteralMultiidioma('ASPA_VALOR_PARAM_NO_PERMITIDO'));
		return;
	}
		
	var mensaje= "CTE_ACTIVAR_CIERRE_CONTROLADO_ASPA"+"="+activar;	  

	//envío de la petición asincrona y sin esperar respuesta
	if (utils_isComuServidorWeb()){//servidor web local
		utils_servidorWeb_enviaPlano(mensaje);    
	}else if (isNavegadorEmbebido()){//plugin ocx
  		PlugIn.enviaPlano(mensaje);	  				
	}	

}

//Implementación del cierre controlado desde pulsación de Aspa del escritorio pesado
function accionCierreControladoAspa(){
	if(parent!=null){
		parent.accionCierreControladoAspa();
	}
}

/**
Funcion que invoca una la creación de una ventana modal con paso de parametros por Get
*/
function lanzarVentanaModalGet(sURL, argumentos, sPropiedades){	
	var valorRetorno="";
	if(ie) {
			lanzarVentanaModalIEGet(sURL, argumentos, sPropiedades);
	}
	return valorRetorno;
}

//Función que crea la ventana modal para internet explorer con paso de parametros por Get
function lanzarVentanaModalIEGet(sURL, argumentos, sPropiedades){
	if (argumentos != undefined)
		var vArgumentos = new Array (sURL, argumentos);	
	else
		var vArgumentos = new Array (sURL);
	
	if (sPropiedades != undefined) {
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog("/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00003.html",vArgumentos, sPropiedades);
    informarServletGUCVentanaModal(false);
	}	else {
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog("/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00003.html",vArgumentos);
    informarServletGUCVentanaModal(false);
	}
	
	return valorRetorno;
}

/**
Funcion que invoca una la creación de una ventana modal con título y con paso de parametros vía get
*/
function lanzarVentanaModalTituloGet(sURL, argumentos, sPropiedades,sTitulo,sScroll){	
	var valorRetorno="";
	if(ie)
	{
		lanzarVentanaModalTituloIEGet(sURL, argumentos, sPropiedades,sTitulo,sScroll);
	}
	return valorRetorno;
}

// Función que crea la ventana modal con titulo para internet explorer con paso de parametros vía Get
function lanzarVentanaModalTituloIEGet(sURL, argumentos, sPropiedades, sTitulo, sScroll){
	var urlArq="/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00003.html";
	if(sScroll != undefined && sScroll==true){
		urlArq="/"+nombreArquitecturaAux+"_mult_mult_pub/ATCLVE00004.html";
	}

	if (argumentos != undefined)
	  if(sTitulo!=undefined)
		  var vArgumentos = new Array (sURL, argumentos,sTitulo);
		else
			var vArgumentos = new Array (sURL, argumentos,"");
	else
		if (sTitulo!=undefined)
		  var vArgumentos = new Array (sURL,"",sTitulo);
		else
			var vArgumentos = new Array (sURL);

	if (sPropiedades != undefined)
	{
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog(urlArq,vArgumentos, sPropiedades);
		informarServletGUCVentanaModal(false);
	}
	else {
	  informarServletGUCVentanaModal(true);
		valorRetorno = window.showModalDialog(urlArq,vArgumentos);
    informarServletGUCVentanaModal(false);
	}

	return valorRetorno;
}

// Función que despacha el foco a la ventana modal.
function despacharFocoAVentanaModalFF(id){
  //Se recupera el IFRAME que contiene la ventana modal y se le asigna el foco
  var iframeInt = document.getElementById("iframeinterno_"+id);
  if(iframeInt!=null && iframeInt!=undefined){
    if(iframeInt.contentWindow != null && iframeInt.contentWindow != undefined){
       iframeInt.contentWindow.focus();
    }
    else{
       iframeInt.focus();
    }
  }
}


function cerrarVentanaModalArquitectura(respuesta){
	var esEscenarioOperativo=getParameter("VMODAL_CP");
	if(typeof(esEscenarioOperativo)!="undefined" && (esEscenarioOperativo=="true" || esEscenarioOperativo==true)){
		cerrarVentanaModalContenedoresPesados(respuesta);
	}else{
		if(ie){
			window.close();
		}else{
			parent.utils_cerrarVentanaModalConvencional("0");
		}
	}
}

//Ventanas modales ligeras contenedores pesados
function cerrarVentanaModalContenedoresPesados(respuesta){
	var identificador=getParameter("Identificador_modal");
	var identificadorCont=getParameter("identContenedor");
	var puertoS=getParameter("PUERTO");
	utils_peticionCierreVMContenedorPesado(identificadorCont,respuesta,puertoS);
}
function getParameter(parameter){
	// Obtiene la cadena completa de URL
	var url = location.href;
	/* Obtiene la posicion donde se encuentra el signo ?, ahi es donde empiezan los parametros */
	var index = url.indexOf("?");
	/* Obtiene la posicion donde termina el nombre del parametro e inicia el signo = */
	index = url.indexOf(parameter,index) + parameter.length;
	var resultado="";
	/* Verifica que efectivamente el valor en la posicion actual es el signo = */ 
	if (url.charAt(index) == "="){
		// Obtiene el valor del parametro
		var result = url.indexOf("&",index);
		if (result == -1){
			result=url.length;
			}
		// Despliega el valor del parametro
		alert(url.substring(index + 1,result));
		resultado=url.substring(index + 1,result);
	}
	return resultado;
} 
function asignarRespuestaVentanaModalContenedoresPesados(respuesta){
	var identificador=getParameter("identContenedor");
	var puertoS=getParameter("puertoS");
	var	url_base="http://localhost:"+puertoS+"/contXsl";
    var datos="&datos=ASIGNANDO_RESULTADO_MODAL&idenContenedor="+identificador+"_aspa";
	var respuesta="&respuesta="+respuesta;
	//Ejecutamos petición para comprobar si la operacion es ligera o pesada
	var resultado = utils_servidorWeb_ejecutarPeticionAJAX(url_base,null,null,"false",utils_servidorWeb_funcionError,datos+respuesta);
}
function utils_peticionCierreVMContenedorPesado(identificador,respuesta,puertoS){
	var idC=identificador;
	var	url_base="http://localhost:"+puertoS+"/contXsl";
    var datos="&datos=QUITAR_GLASS&idenContenedor="+idC;
	var respuesta="&respuestaVMContendor="+respuesta;
	//Ejecutamos petición para comprobar si la operacion es ligera o pesada
	var resultado = utils_servidorWeb_ejecutarPeticionAJAX(url_base,null,null,"false",utils_servidorWeb_funcionError,datos+respuesta);	
}

function obtenerParametrosModalCP(){
	var parametrosModal=getParameter("parametrosModal");
	return parametrosModal;
}


//Se establace el frame que ha invocado a la ventana modal FF
function setFrameInvocadorVentanaModalFF(frameAux){
  frameInvocadorVentanaModalFF = frameAux;
}

//Se recupera el frame que ha invocado a la ventana modal FF
function getFrameInvocadorVentanaModalFF(){
  return frameInvocadorVentanaModalFF;
}

//Funcion que cierra la ventana modal y devuelve los parametros	
function utils_lanzarProcesoCerrarVentanaModal(parametros,funcionRespuesta){
  	if(ie) {
  	   window.close();
  	}else{
         //Se obtiene el id
      var id=0;
      var salir=false;
    		
    	if(utils_isNavegadorFirefox2()){
    		do{
    			if(document.getElementById("frameinterno_"+id)==null || document.getElementById("frameinterno_"+id)==undefined)
    		  {
    				id=id+1;
    		  }else{
            salir=true;
          }
    	   }while(salir==false);
    	}
    	
    	//Si se han pasado parametros se asigna el ressultado
    	if (parametros!=null && parametros!=undefined && parametros.length>0){
        asignarRespuestaVentanaModal(parametros);
      }
    
      //Se cierra la ventana
      utils_cerrarVentanaModalConvencional(id);
    
      var recuperadoFrameVentanaModal = false;
      
      //Se recupera el frame que invocó a la ventana Modal (en caso de existir)
      var frame = getFrameInvocadorVentanaModalFF();
      if(frame != null)
      {
        recuperadoFrameVentanaModal = true;
      }
    
      //Si hay función de respuesta se ejecuta para obtener los parametros de la ventana modal desde la ventana padre
      if (funcionRespuesta!=null && funcionRespuesta!=undefined){
        	if (frame != undefined && frame != null && frame != ""){
            frame.eval(funcionRespuesta);
          }else{
            eval(funcionRespuesta);
          }
      }
      
      if(recuperadoFrameVentanaModal == true){
        //se limpia el frame invocador de Ventanas Modales FF
        setFrameInvocadorVentanaModalFF(null);
      }
    }
}
/**
 * Ejecuta la petición de Login a MicroStrategy, retornando el sessionState de la sesión abierta 
 */ 
function ejecutarPeticionMS_login(usuario,servidor,servlet,proyecto){
  //Se codifica el proyecto
  if(proyecto != null && proyecto != undefined){  
    proyecto =escape(proyecto);
  }
   
  var cabeceraServlet = "?taskId=getSessionState&taskEnv=xml&taskContentType=xml&server=";
  var cabeceraProyecto = "&project=";
  var modoAutenticacion = "&authMode=64";
  
  var url = servlet+ cabeceraServlet + servidor + cabeceraProyecto + proyecto + modoAutenticacion; 
  
  var retorno = ejecutarPeticionAJAX_MicroStrategy(url,usuario);
  
  //Se recupera el sessionState que viene en la etiqueta <max-state> 
  if(retorno != null && retorno != undefined){
    var posInicio =  retorno.indexOf("<max-state>")+"<max-state>".length;
    var posFin = retorno.indexOf("</max-state>");
    if(posInicio != -1 && posFin != -1){
      retorno = retorno.substring(posInicio,posFin);
    }
    else{
      retorno = null;
    }
  }
    
  return retorno;

}


/**
 * Ejecuta la petición de ReportExecute en una ventana modal 
 */ 
function ejecutarVentanaModalPeticionMS_reportExecute(servletPeticion,servidor,proyecto,sessionState,parametrosReport,parametros,sPropiedades){
  
  //Se codifica el proyecto
  if(proyecto != null && proyecto != undefined){  
    proyecto = escape(proyecto);
  }
  
  var cabeceraServlet = "?server=";
  var cabeceraProyecto = "&project=";
	var cabeceraSessionSatate = "&usrSmgr=";			
  
  var sURL = servletPeticion+ cabeceraServlet + servidor + cabeceraProyecto + proyecto + parametrosReport + cabeceraSessionSatate + sessionState; 
    
  parametros[101] = "VentanaModalMicroStrategy";
  var retorno = lanzarVentanaModal(sURL, parametros, sPropiedades)
    
  return retorno;

}

/**
 * Ejecuta la petición de Logout a MicroStrategy, retornando el sessionState de la sesión abierta 
 */ 
function ejecutarPeticionMS_logout(servlet,sesion){
  
    //Se codifica la sesion
  if(sesion != null && sesion != undefined){  
    sesion =escape(sesion);
  }
  
  var cabeceraServlet = "?taskId=logout&taskEnv=xml&taskContentType=xml&sessionState=";
  var url = servlet + cabeceraServlet + sesion; 
  
  //Se invoca a la url, sin especificar el usuario
  var retorno = ejecutarPeticionAJAX_MicroStrategy(url,null);
    
  return retorno;

}

/* Control MOMT (Múltiples Operaciones en la Misma Tarea). Lanza la ejecución de una nueva operación ligera conservando la tarea */
function ejecutarOperacionMismoNavegador(opNACARP, opNACARL, parametros, descripcion) {
  
	if(utils_IsEjecucionPortal()){
		if(opNACARL != null && opNACARL !="" && opNACARL!="null") {
			
			try{//FIX: si no está subida la versión de ATPI que incluye este Ev, no se hace nada
			top.atpn_gt_controlMOMT(opNACARL,parametros,descripcion);
			}catch(e){}
			
		}else{
		
			alert(literales_traducirLiteralMultiidioma('UTILS_INFORM_OPER'));
		
		}
	}else{

		var swl = utils_isComuServidorWeb();
		var ocx = isNavegadorEmbebido();
	
		if(!swl && !ocx){
	
			alert(literales_traducirLiteralMultiidioma('UTILS_NO_OPER_FUERA'));
			return;
		
		}
	
		if(opNACARP != null && opNACARP !="" && opNACARP!="null") {
	
			var archivoXML = "";
			archivoXML +="<datosOperacion>"

			if(parametros != null) {
				archivoXML +="<parametros>"+parametros+"</parametros>";
			}
			if(descripcion != null && descripcion!="null" && descripcion!=undefined) {
				archivoXML +="<descripcion>"+descripcion+"</descripcion>";
			}
		
			archivoXML +="<operacion>"+opNACARP+"</operacion>";
		
			archivoXML += "</datosOperacion>";
  
		  	if (swl){

				utils_servidorWeb_enviaPlanoXML("CTE_OPERACIONES_EJECUCION_OPERACION_NAVEGADOR"+archivoXML,"true","true");

  			}else if (ocx){

				PlugIn.enviaPlano("CTE_OPERACIONES_EJECUCION_OPERACION_NAVEGADOR"+archivoXML);
  	
			}

		}else{

			alert(literales_traducirLiteralMultiidioma('UTILS_INFORM_OPER'));
			return;
	
		}
	}
  	
}
