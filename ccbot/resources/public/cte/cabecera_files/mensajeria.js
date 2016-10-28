/****************************** mensajeria.js ******************************
 *																		   *
 * Esta librer�a se encargar� de manejar todo el intercambio de datos      *
 * o mensajes entre contenedores. Ser� incluida dentro de contenedores.js, *
 * librer�a definida en la cabecera de la p�gina web de la aplicaci�n      *
 * contenedora.															   *
 *																		   *
 ****************************** mensajeria.js ******************************/
var suscripciones=new Array();
var CTE_CONTENEDORES_PAGINA_CONTENEDORA=false;

/** Funci�n suscribirContenedor(canal)
 * 
 * Suscribe un contenedor a un canal de informaci�n.
 * 
 ********************PARAMETROS********************
 * canal: String con el nombre del canal. 
 */
function suscribirContenedor(canal) {
	try{
		objeto=parent.dojo.subscribe(canal, procesarDatos);
		suscripciones[suscripciones.length]=objeto;
	}catch(err){
		
	}
}

/** Funci�n suscribirContenedor(canal)
 * 
 * Suscribe un contenedor a un canal de informaci�n.
 * 
 ********************PARAMETROS********************
 * canal: String con el nombre del canal. 
 */
function suscribirContenedorMensaje(canal) {
	try{
		objeto=parent.dojo.subscribe(canal, procesarDatosMensaje);
		suscripciones[suscripciones.length]=objeto;
	}catch(err){
		
	}
}

/** Funci�n suscribirPagina(canal)
 * 
 * Suscribe la p�gina principal a un canal de informaci�n.
 *
 ********************PARAMETROS********************
 * canal: String con el nombre del canal.
 */
function suscribirPagina(canal) {
	suscripciones[suscripciones.length]=dojo.subscribe(canal, procesarDatos);
}

function darBajaSuscripciones(canal){

	if (canal==null){
		//Da de baja todas las suscripciones
		for (var i=0;i<suscripciones.length;i++){
			parent.dojo.unsubscribe(suscripciones[i]);
		}
		suscripciones=new Array();
	}else{
		var i=0;
		while (i<suscripciones.length){
			var canalTmp=suscripciones[i][0];
			if (canal==canalTmp){
			  if (parent.dojo==undefined){
          //Se trata de la p�gina padre
          dojo.unsubscribe(suscripciones[i]);
        }else{
				  parent.dojo.unsubscribe(suscripciones[i]);
				}
				suscripciones.splice(i,1);
				break;
			}
			i++;
		}	
	}
}
/** Funci�n procesarDatos(datos)
 * 
 * Procesa los datos recibidos desde otro contenedor o canal de comunicaciones.
 *
 ********************PARAMETROS********************
 * datos: String con los datos recibidos.
 */
function procesarDatos(origen, datos){
	
}

/** Funci�n publicarDatosCanal(canal,datosEnvio)
 * 
 * Publica los datos deseados en un canal de informaci�n.
 *
 ********************PARAMETROS********************
 * canal: String con el nombre del canal. 
 * datosEnvio: String con los datos a enviar.
 */
function publicarDatosCanal(canal, origen, datosEnvio) {
	var publicado=false;
  try{
	  if ((CTE_CONTENEDORES_PAGINA_CONTENEDORA!=undefined) && (CTE_CONTENEDORES_PAGINA_CONTENEDORA==true))
    {
		dojo.publish(canal, [origen, datosEnvio]);
		}else {
    		parent.dojo.publish(canal, [origen, datosEnvio]);
    }
	}catch (err){
		try{	
  			parent.dojo.publish(canal, [origen, datosEnvio]);
		}catch (err2){}
	}
	
}


function getFrameContenedor(identi){
	var frame = null;
	try{
		frame= getIFrameWindow('frame_'+identi);
	}catch(err){
		try{
			frame = parent.getIFrameWindow('frame_'+identi);
		}catch (err2){}
	}
	return frame;
}
/** Funci�n envioDatosContenedor(origen, destino, datos)
 * 
 * Env�a informaci�n desde un contenedor origen a
 * otro contenedor destino.
 *
 ********************PARAMETROS********************
 * origen: Id del contenedor origen. 
 * destino: Id del contenedor destino.
 * datos: String con los datos a enviar.
 */
function enviarDatosContenedor(origen, destino, datos) {
	var frame = getFrameContenedor(destino);
	
	if (frame!=null){
		try{
			frame.procesarDatos(origen,datos);
		}catch(err){}
	}
}

/**
* Funci�n que se encarga de inicializar el contenedor y que se lanzar� desde el onload de la p�gina contenedor
*/
function inicializarContenedor(){
  if (parent.isGenerado!=undefined && !parent.isGenerado(this)){
      suscribirBajadaObjetoNegocio();				
			inicializarSubscripciones();
	}
}

/*
* Funci�n que deber�n implementar los desarrolladores en caso de que quieran suscribirse al inicio
*/
function inicializarSubscripciones(){
	
}

/**
* Funci�n encargada de procesar los datos recibidos por el canal de suscripci�n de mensaje.
*/
function procesarDatosMensaje(datos){
	
    preEjecutarDatosMensaje(datos);
	var idFrame=window.frameElement.id;
	var identificador=idFrame.substr(6);
	parent.actualizaMensaje(identificador,datos);
	
	postEjecutarDatosMensaje(datos);
}

function preEjecutarDatosMensaje(datos){

}

function postEjecutarDatosMensaje(datos){
}
/********************************************
 *		Funciones para el objeto de negocio		*
 *******************************************/

/**
 * Funci�n utilizada para que la p�gina principal se suscriba a la subida al objeto de negocio
 */
function suscribirSubidaObjetoNegocio() {
	suscripciones[suscripciones.length]=dojo.subscribe("subirObjetoNegocio", subirObjetosNegocio);
}

/**
 * Funci�n utilizada para publicar datos para el objeto de negocio desde los contenedores a la p�gina principal
 */
function publicarSubidaObjetoNegocio(claves, valores) {
	parent.dojo.publish("subirObjetoNegocio", [claves, valores]);
}

/**
 * Funci�n utilizada para que los contenedores se suscriban a la bajada de objeto de negocio
 */
function suscribirBajadaObjetoNegocio() {
	suscripciones[suscripciones.length]=parent.dojo.subscribe("bajarObjetoNegocio", tratarBajadaObjetosNegocio);
}

/**
 * Funci�n utilizada para publicar datos para el objeto de negocio desde la p�gina principal a los contenedores
 */
function publicarBajadaObjetoNegocio(claves, valores) {
	parent.dojo.publish("bajarObjetoNegocio", [claves, valores]);
}
/**
 * Funci�n utilizada para que la p�gina principal se suscriba Ejecutar operaci�nNACAR en un Escenario
 */
function suscribirEjecutaOpNACAREsce()	 {
	suscripciones[suscripciones.length]=dojo.subscribe("subirEjecutarOperacionNACAREscenario", ejecutarOperacionNACAREscenario);
}

function publicarEjecutaOpNACAREsce(operacion, parametros, tipo, escenario) {
	parent.dojo.publish("subirEjecutarOperacionNACAREscenario", [operacion, parametros, tipo, escenario]);
}

/**
 * Funci�n que captura la pulsacion de la tecla F5 y solicita la bajada de objetos de negocio
 */
function tratarF5() {
	if(event.keyCode == 116) {
		event.keyCode = 0;

		//Comprobamos si la comunicacion se realiza a trav�s del servidorWeb o a trav�s el plugin
		if (utils_isComuServidorWeb()){
			//utilizamos servidorWeb
			utils_servidorWeb_enviaPlano("CTE_BAJADA_OBJETOS_NEGOCIO");
		}else if (parent.isNavegadorEmbebido()){
			//utilizamos plugin
			parent.PlugIn.enviaPlano("CTE_BAJADA_OBJETOS_NEGOCIO");
		 }
		return false;
	}
}

/**
 * Funcion que solicita la subida de datos a objetos de negocio
 */
function subirObjetosNegocio(claves, valores) {
  
	  if (utils_isComuServidorWeb()){
			//Si utilizamos el servidor Web
			var mensaje="";
			// El formato ser� clave1=*=valor1$*$clave2=*=valor2 ...
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
			utils_servidorWeb_enviaPlano("CTE_SUBIDA_OBJETOS_NEGOCIO"+mensaje,"true");
	  }else if (isNavegadorEmbebido())
	  {
		var mensaje="";
		// El formato ser� clave1=*=valor1+*+clave2=*=valor2 ...
	    	for(var i=0;i<claves.length;i++) {
	    		if (i>0)
	    			mensaje = mensaje + "+*+";
	    		
	    		mensaje = mensaje + claves[i] + "=*=" + valores[i]
	    	}
	    
	    	// Usamos el conector de comunicaciones para transmitir la peticion
	    	if (parent.isNavegadorEmbebido())
	    		parent.PlugIn.enviaPlano("CTE_SUBIDA_OBJETOS_NEGOCIO" + mensaje);
	  }else{
	      //Se comprueba si es un contenedor o la p�gina contenedora
	      try{
	        //En el caso de ser ATPI sube los datos al objeto de negocio.
	        top.atpn_gt_subirObjetosNegocio(claves, valores);
	      }catch (err){}
	  }
}

/**
 * Funci�n encargada de realizar el tratamiento del evento de retorno del plugin de comunicaci�nes
 */
function trataEvento(evento) {
	var elementos = evento.split("+");
	var claves = new Array();
	var valores = new Array();
	var j=0;

	// Separamos claves y valores
	for (var i=0;i<elementos.length ;i++ ) {
		claves[j] = elementos[i];
		i++;
		valores[j] = elementos[i];
		j++;
	}

	publicarBajadaObjetoNegocio(claves, valores);
}

/*Este m�todo debe ser sobrescrito por la aplicaci�n*/
function tratarBajadaObjetosNegocio (){
	
}

/********************************************
 *		Funciones para almacenar datos utilizando un separador		*
 *******************************************/

var mensaje=new Array();
var SeparadorMensaje="";


/** Funci�n inicializarMensaje(separador)
 *
 * Inicializa el arreglo de datos a cero y captura el valor que se
 * asigna a la variable separador.
 *
 ******************************PARAMETROS******************************
 * separador: El identificador �nico de separaci�n de datos ingresados.
 *
 */

function inicializarMensaje(separador){
	mensaje=new Array();
	SeparadorMensaje=separador;
}


/** Funci�n inicializarObtencionMensaje(mensaje, separador)
 *
 * Funci�n que se encarga de inicializar el mensaje recibiendo dos 
 * par�metros.
 *
 ******************************PARAMETROS******************************
 * mensaje: El identificador �nico de todos los datos ingresados
 * separador: El identificador �nico para tener conocimiento con que 
 * caracter estan siendo separados los archivos ingresados.
 */


function inicializarObtencionMensaje(mensaje,separador){
  inicializarMensaje(separador);
  var miCadena = mensaje;
	var miArray = miCadena.split(separador); 
	for (var i = 0; i < miArray.length; i++){
      setValorMensaje(miArray[i]);
	}
}

/** Funci�n getValorMensaje(i)
 *
 * Captura el valor de un arreglo en la posici�n i, y devuelve el contenido
 * de ese arreglo en dicha posici�n.
 *
******************************PARAMETROS******************************
 * i: Es el �ndice correspondiente al arreglo del mensaje.
 */

function getValorMensaje(i){
	return mensaje[i];
}

/** Funci�n setValorMensaje(nvalor)
 *
 * A�ade datos al array.
 *
******************************PARAMETROS******************************
 * nvalor: Es el dato que se a�ade al arreglo.
 */

function setValorMensaje(nvalor){
	mensaje[mensaje.length]=nvalor;
}

/** Funci�n getNumValores()
 *
 * Muestra el n�mero de datos que se ha ingresado en el arreglo.
 * 
 */

function getNumValores(){
	return mensaje.length;
}

/** Funci�n volcarMensaje()
 *
 * Captura todos los datos ingresados separados por un caracter.
 *
 */

function volcarMensaje(){
  var cadena="";
  for (var i=0;i<mensaje.length;i++){
    cadena+=getValorMensaje(i);
    if (i<mensaje.length-1){
      cadena+=SeparadorMensaje;
    }
  }
  return cadena;
}

/** Funci�n solicitarComprobacionOperaciones(stOperaciones,formActual,canal)
 * 
 * Consulta qu� operaciones de una lista est�n permitidas,
 * mediante una publicacion en el canal indicado
 *
 ********************PARAMETROS********************
 * stOperaciones: Lista de operaciones a comprobar
 * formActual: Formulario de la ventana desde la que
 * se hace la consulta.
 * canal: Canal en el que se publicar�n las operaciones.
 */
function solicitarComprobacionOperaciones(stOperaciones,formActual,canal)
{
	publicarDatosCanal(canal,formActual,stOperaciones);
}


/** Funci�n comprobarListaOperaciones(origen, formActual, canal, lista)
 * 
 * Comprueba qu� operaciones de la lista recibida est�n permitidas,
 * y publica un mensaje en el canal correspondiente para informar
 * a la ventana del contenedor  
 *
 ********************PARAMETROS********************
 * origen: Formulario de origen.
 * formActual: Formulario de la ventana marco desde la que
 * se hace la llamada.
 * canal: Canal en el que se publicar�n las operaciones permitidas.
 * lista: Lista de operaciones permitidas.
 */
function comprobarListaOperaciones(origen,formActual,canal,lista)
{
  if(origen != formActual)
	{
		var arrayOperaciones;
    if((lista!= null)&&(lista!=''))
		{
      arrayOperaciones = lista.split(',');
    }
    else
    {
      arrayOperaciones = new Array();
    }
		var bSoloListaOps=true;
		var strOperacionesPermitidas = listarOperacionesPermitidas(arrayOperaciones, bSoloListaOps);
		publicarDatosCanal(canal,formActual,strOperacionesPermitidas);
	}
}
