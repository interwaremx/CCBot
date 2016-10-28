// JavaScript Document
/*INICIO LOGGING*/
//Script para log en consola, a evolucionar :-)
//ponerB=false para no mandar alerts
//if (typeof console=="undefined"){console={log:function(A){var B=false;if(B){alert(A);}}}}
/*FIN LOGGING*/
var numclie = sector = segmento = '';
var CLIENTE_SELECIONADO = new Array(12);
var GESTOR_SELECIONADO = new Array();
var DATOS_NACAR_1 = new Array();
var TDD = "";
var CLAVES = new Array('NOMBRE', 'APEPAT', 'APMAT', 'RFC', 'HOMOCLAVE', 'NUMERO_CLIENTE', 'NUMERO_CONTRATO', 'SECTOR', 'DES_SECTOR', 'SEGMENTO', 'DES_SEGMENTO');
var busqueda;
var paginaActual;
var lanzarFicha = '';
var gestorSeleccionado = false;
var indicadorCalificado = false;
/*** Funciones heredadas de NFMXEscritorio.js *************************/
function validarNumero(valor) {
	var exprNumeros = new RegExp(/^\d+$/);
	return exprNumeros.test(valor);
}

function validarRFC(cadena) {
	//La expresion pudo quedar mejor, pero no se dejo el espacio en blanco:(
	//exprRFC= '^([A-Z]|[a-z]|\s){1})(([A-Z]|[a-z]){3})([0-9]{2})(0[1-9]|1[012])([012][1-9]|3[01])';
	//var exprRFCHomoClave = new RegExp('^(([A-Z]|[a-z]|\s){1})(([A-Z]|[a-z]){3})([0-9]{6})((([A-Z]|[a-z]|[0-9]){3}))');
	var exprRFC;
	if (cadena.length == 10)
		exprRFC = '^(([A-Z]|[a-z]){4})([0-9]{2})(0[1-9]|1[012])([012][1-9]|[1-3][01])';
	else if (cadena.length == 9)
		exprRFC = '^(([A-Z]|[a-z]){3})([0-9]{2})(0[1-9]|1[012])([012][1-9]|3[01])';
	else if (cadena.length == 13)
		exprRFC = '^(([A-Z]|[a-z]){4})([0-9]{2})(0[1-9]|1[012])([012][1-9]|3[01])((([A-Z]|[a-z]|[0-9]){3}))';
	else if (cadena.length == 12)
		exprRFC = '^(([A-Z]|[a-z]){3})([0-9]{2})(0[1-9]|1[012])([012][1-9]|3[01])((([A-Z]|[a-z]|[0-9]){3}))';
	else
		return false;
	var expresion = new RegExp(exprRFC);
	return expresion.test(cadena);
}
/********************************************************************/
String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, "");
};

function envioNacar(control, funcion, aplicacionNacar, cargaAscincrona, param1, param2) {
	var pagina = param2 != null ? param2 : '1';
	//console.log('Pagina= '+pagina);
	document.getElementById('cargaBusqueda').className = 'mostrarCarga';
	busqueda = param1;
	setParametrosEntrada("OPERACION", "NUFR0113");
	setParametrosEntrada("LOCALE", "es_ES");
	metodoFormu = "GET";
	setParametrosEntrada("PAR_INICIO.NFMX_BUSQUEDA_PANTALLA", param1);
	setParametrosEntrada("PAR_INICIO.PAGINA_ACTUAL", pagina);
	paginaActual = pagina;
	limpiarBusqueda();
	ejecutarOperacionNACAR(control, miFuncion, '../', false, cargaAscincrona); //importante el false en sesion para entorno!!!
	if (!cargaAscincrona) {}
}

/******************************************
 *	Se crea el arreglo con los resultados *
 *	de la busqueda en el siguiente orden  *
 *	DATOS_NACAR[0]=NFMX_IND_PROS		  *
 *	DATOS_NACAR[1]=NFMX_NOMBRE			  *
 *	DATOS_NACAR[2]=NFMX_APEPAT			  *
 *	DATOS_NACAR[3]=NFMX_APEMAT			  *
 *	DATOS_NACAR[4]=NFMX_RFC			      *
 *	DATOS_NACAR[5]=NFMX_HOMOCLAVE		  *
 *	DATOS_NACAR[6]=NFMX_NUMERO_CLIENTE	  *
 *	DATOS_NACAR[7]=NFMX_DOMICILIO_1		  *
 *	DATOS_NACAR[8]=NFMX_NUMCTA  		  * 
 *	DATOS_NACAR[9]=NFMX_SECTOR			  *
 *	DATOS_NACAR[10]=NFMX_DES_SECTOR		  *
 *	DATOS_NACAR[11]=NFMX_SEGMENTO		  *
 *	DATOS_NACAR[12]=NFMX_DES_SEGMENTO	  *
 *	DATOS_NACAR[13]=NFMX_IREALPAT		  *
 *	DATOS_NACAR[14]=NFMX_IND1			  *
 *	DATOS_NACAR[15]=NFMX_PEYCLIE
 *	DATOS_NACAR[16]=NFMX_INDPRE		  *
 ******************************************/
function miFuncion(control, mensajeRespuesta) {
	var tipoBuscado = busqueda.substring(0, 1);
	//console.log('tipo Buscado='+tipoBuscado)
	var datosContexto = getContextoXML(mensajeRespuesta);
	var lista0 = getDatoXML('NFMX_AVISO', mensajeRespuesta);
	//Devuelve todos los datos del contexto
	var aviso = '';
	if (lista0 != null)
		aviso = tostring(lista0).trim();
	//console.log(aviso);    

	try {
		var lista = getDatoXML('NFMX_DATOS_NACAR', mensajeRespuesta);
		var NFMX_APEMAT = NFMX_NOMBRE = NFMX_NUMERO_CLIENTE = NFMX_DOMICILIO_1 = NFMX_RFC = NFMX_HOMOCLAVE = NFMX_APEPAT = '';
		var NFMX_NUMCTA = NFMX_SECTOR = NFMX_SEGMENTO = NFMX_DES_SECTOR = NFMX_DES_SEGMENTO = NFMX_IND_PROS = '';
		var NFMX_IREALPAT = '',
			NFMX_IND1 = '',
			NFMX_PEYCLIE = '',
			NFMX_INDPRE = '';
		var DATOS_NACAR = new Array();
		var k = 0;
		if (tostring(lista) != null) {
			$(lista).find('simple').each(function () {
				var campo = $(this).attr('clave');
				var valor = $(this).text();
				//alert("valor= "+valor);  
				valor = valor.trim();
				switch (campo) {
					case 'NFMX_APEMAT':
						NFMX_APEMAT = valor;
						break;
					case 'NFMX_IND_PROS':
						NFMX_IND_PROS = valor;
						break;
					case 'NFMX_NOMBRE':
						NFMX_NOMBRE = valor;
						break;
					case 'NFMX_NUMERO_CLIENTE':
						NFMX_NUMERO_CLIENTE = valor;
						break;
					case 'NFMX_DOMICILIO_1':
						NFMX_DOMICILIO_1 = valor;
						break;
					case 'NFMX_RFC':
						NFMX_RFC = valor;
						break;
					case 'NFMX_HOMOCLAVE':
						NFMX_HOMOCLAVE = valor;
						break;
					case 'NFMX_APEPAT':
						NFMX_APEPAT = valor;
						break;
					case 'NFMX_SECTOR':
						NFMX_SECTOR = valor;
						break;
					case 'NFMX_DES_SECTOR':
						NFMX_DES_SECTOR = valor;
						break;
					case 'NFMX_DES_SEGMENTO':
						NFMX_DES_SEGMENTO = valor;
						break;
					case 'NFMX_NUMCTA':
						NFMX_NUMCTA = valor;
						break;
					case 'NFMX_IREALPAT':
						NFMX_IREALPAT = valor;
						break;
					case 'NFMX_IND1':
						NFMX_IND1 = valor;
						break;
					case 'NFMX_PEYCLIE':
						NFMX_PEYCLIE = valor;
						break;
					case 'NFMX_INDPRE':
						NFMX_INDPRE = valor;
						break;
					case 'NFMX_SEGMENTO':
						NFMX_SEGMENTO = valor;
						/*DATOS_NACAR[k]= new Array(NFMX_IND_PROS,NFMX_NOMBRE,NFMX_APEPAT,NFMX_APEMAT,NFMX_RFC,NFMX_HOMOCLAVE,  	                                                  NFMX_NUMERO_CLIENTE,NFMX_DOMICILIO_1,NFMX_NUMCTA,NFMX_SECTOR,NFMX_DES_SECTOR,			                                                  NFMX_SEGMENTO,NFMX_DES_SEGMENTO);					   
					    k++;
						*/
						DATOS_NACAR[k] = new Array(NFMX_IND_PROS, NFMX_NOMBRE, NFMX_APEPAT, NFMX_APEMAT, NFMX_RFC, NFMX_HOMOCLAVE, NFMX_NUMERO_CLIENTE, NFMX_DOMICILIO_1, NFMX_NUMCTA, NFMX_SECTOR, NFMX_DES_SECTOR, NFMX_SEGMENTO, NFMX_DES_SEGMENTO, NFMX_IREALPAT, NFMX_IND1, NFMX_PEYCLIE, NFMX_INDPRE);
						k++;
						break;

					case 'NFMX_CONSEC':

						break;
				}
				/* DATOS_NACAR[k]= new Array(NFMX_IND_PROS,NFMX_NOMBRE,NFMX_APEPAT,NFMX_APEMAT,NFMX_RFC,NFMX_HOMOCLAVE,  	                                                  NFMX_NUMERO_CLIENTE,NFMX_DOMICILIO_1,NFMX_NUMCTA,NFMX_SECTOR,NFMX_DES_SECTOR,			                                                  NFMX_SEGMENTO,NFMX_DES_SEGMENTO,NFMX_IREALPAT,NFMX_IND1,NFMX_PEYCLIE,NFMX_INDPRE); */

				DATOS_NACAR_1 = DATOS_NACAR;
				// k++;				   
			});

			if (DATOS_NACAR_1.length == 1) {

				if ((tipoBuscado != '5') && (tipoBuscado != '6')) {
					clienteCalificado(0);
					if (!indicadorCalificado) {

						if (DATOS_NACAR_1[0][0] == 'P') {
							top.mantenimientoP(0);
						} else
							slectclient(0);
						indicadorCalificado = false;
					}
				} else {
					pintarBusqueda(aviso);
				}
			} else {
				pintarBusqueda(aviso);
			}
		} else if (getDatoXML('NFMX_GESTORES', mensajeRespuesta) != null) {
			var lista = getDatoXML('NFMX_GESTORES', mensajeRespuesta);
			if (tostring(lista) != null) {
				var NFMX_NOMBRE = NFMX_GESTOR = NFMX_DESCPERF = NFMX_TOTCTES = NFMX_USUARIO = '';
				$(lista).find('simple').each(function () {
					var campo = $(this).attr('clave');
					var valor = $(this).text();
					//alert("valor= "+valor);  
					valor = valor.trim();
					switch (campo) {
						case 'NFMX_NOMBRE':
							NFMX_NOMBRE = valor;
							break;
						case 'NFMX_GESTOR':
							NFMX_GESTOR = valor;
							break;
						case 'NFMX_DESCPERF':
							NFMX_DESCPERF = valor;
							break;
						case 'NFMX_TOTCTES':
							NFMX_TOTCTES = valor;
							break;
						case 'NFMX_USUARIO':
							NFMX_USUARIO = valor;
							DATOS_NACAR[k] = new Array(NFMX_GESTOR, NFMX_NOMBRE, NFMX_DESCPERF, NFMX_TOTCTES, NFMX_USUARIO);
							k++;
							break;
						case 'NFMX_CONSEC':
							break;
					}
					DATOS_NACAR_1 = DATOS_NACAR;
				});
				muestraGestores();
			};
		} else {
			document.getElementById('cargaBusqueda').className = 'ocultarCarga';
			if (aviso != '')
				var msg = '<div class="MsjInnerInfo">' + aviso + '</div>';
			else
				var msg = '<div class="MsjInnerInfo">NO HAY CLIENTES A MOSTRAR</div>';
			var respuestaBusqueda = "<table cellpadding=\"3\" cellspacing=\"3\"style=\"margin-left: 12%; margin-top: 5%; vertical-align:middle; background-color:#fff;\">";
			respuestaBusqueda += "<tr><td><div>";
			respuestaBusqueda += "<table width=\"800px\" style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";
			respuestaBusqueda += "<tr class=\"fondo-gris\">";
			respuestaBusqueda += "<td colspan=\"29\" class=\"derecha\" style=\"cursor:pointer; font-size:11pt; font-weight:bold;\"><a onclick=\"javascript:ocultarbusqueda()\" class=\"enlace-habilitado\" style=\"text-decoration: none;\">X<\/a><\/td><\/tr>";
			respuestaBusqueda += '<tr><td>' + msg + '<\/td><\/tr>';
			respuestaBusqueda += "<\/table><\/div><\/td><\/tr>";
			respuestaBusqueda += "<tr><td>";
			respuestaBusqueda += "<div class=\"DivBotonera\" style=\"position:inherit;\">";
			respuestaBusqueda += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">";
			respuestaBusqueda += "<tr><td class=\"alinearDer\">";
			respuestaBusqueda += "<hr class=\"separadorBotonera\">";
			respuestaBusqueda += " <input type=\"button\" title=\"Cerrar Busqueda\" onclick=\"javascript:ocultarbusqueda()\" onmouseout=\"this.className='Boton BotonMargenDer'\" onmouseover=\"this.className='BotonHover BotonMargenDer'\" class=\"Boton BotonMargenDer\" value=\"Cerrar\" id=\"btn_cerrar\">";
			respuestaBusqueda += "<\/td><\/tr><\/table></div><\/td><\/tr><\/table>";

			top.buscar(respuestaBusqueda);
		}
	} catch (err) {
		alert(err);
		document.getElementById('cargaBusqueda').className = 'ocultarCarga';
		var msg = '<div class="MsjInnerInfo">NO HAY CLIENTES A MOSTRAR</div>';
		var respuestaBusqueda = "<table cellpadding=\"3\" cellspacing=\"3\"style=\"margin-left: 12%; margin-top: 5%; vertical-align:middle; background-color:#fff;\">";
		respuestaBusqueda += "<tr><td><div>";
		respuestaBusqueda += "<table width=\"800px\" style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";
		respuestaBusqueda += "<tr class=\"fondo-gris\">";
		respuestaBusqueda += "<td colspan=\"29\" class=\"derecha\" style=\"cursor:pointer; font-size:11pt; font-weight:bold;\"><a onclick=\"javascript:ocultarbusqueda()\" class=\"enlace-habilitado\" style=\"text-decoration: none;\">X<\/a><\/td><\/tr>";
		respuestaBusqueda += '<tr><td>' + msg + '<\/td><\/tr>';
		respuestaBusqueda += "<\/table><\/div><\/td><\/tr>";
		respuestaBusqueda += "<tr><td>";
		respuestaBusqueda += "<div class=\"DivBotonera\" style=\"position:inherit;\">";
		respuestaBusqueda += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">";
		respuestaBusqueda += "<tr><td class=\"alinearDer\">";
		respuestaBusqueda += "<hr class=\"separadorBotonera\">";
		respuestaBusqueda += " <input type=\"button\" title=\"Cerrar Busqueda\" onclick=\"javascript:ocultarbusqueda()\" onmouseout=\"this.className='Boton BotonMargenDer'\" onmouseover=\"this.className='BotonHover BotonMargenDer'\" class=\"Boton BotonMargenDer\" value=\"Cerrar\" id=\"btn_cerrar\">";
		respuestaBusqueda += "<\/td><\/tr><\/table></div><\/td><\/tr><\/table>";

		top.buscar(respuestaBusqueda);
	}
}


function pintarBusqueda(aviso) {
	var tipoBuscado = busqueda.substring(0, 1);
	var des, desCorta;
	//console.log(tipoBuscado);
	var clase;
	var respuestaBusqueda = "<table cellpadding=\"3\" cellspacing=\"3\"style=\"margin-left: 12%; margin-top: 5%; vertical-align:middle; background-color:#fff;\">";
	respuestaBusqueda += "<tr><td><div><table width=\"800px\"style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";
	respuestaBusqueda += "<tr class=\"fondo-gris\">";
	respuestaBusqueda += "<td colspan=\"9\" class=\"derecha\" style=\"cursor:pointer; font-size:11pt; font-weight:bold;\">";
	respuestaBusqueda += "<a onclick=\"javascript:ocultarbusqueda()\" class=\"enlace-habilitado\" title=\"Cerrar Busqueda\" style=\"text-decoration: none;\">X<\/a>";
	respuestaBusqueda += "<\/td><\/tr>";
	respuestaBusqueda += "<tr><td colspan=\"9\"><div class=\"MsjInnerInfo\">" + aviso + "<\/div><\/td><\/tr><\/table>";
	respuestaBusqueda += "<div style=\"height:350px; overflow:auto;\">";
	respuestaBusqueda += "<table width=\"100%\" style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";
	respuestaBusqueda += "<tr class=\"fondo-gris\">";
	respuestaBusqueda += "<td class=\"subrayado\"><b>M<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Nombres(s)<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Apellido Paterno<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Apellido Materno<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>RFC<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Homoclave<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b># Cliente<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Domicilio B&aacute;sico<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Acciones<\/b><\/td><\/tr>";

	for (i = 0; i < DATOS_NACAR_1.length; i++) {
		if (i % 2 != 0) {
			clase = "gris-par";
		} else {
			clase = "gris-impar";
		}
		respuestaBusqueda += "<tr class=\"";
		respuestaBusqueda += clase;
		respuestaBusqueda += "\">";
		for (j = 0; j < 8; j++) {
			respuestaBusqueda += "<td style=\"padding-left: 5px;\"><b>";

			if (DATOS_NACAR_1[i][j].trim().length > 15) {
				var des = "";
				var desCorta = "";
				des = DATOS_NACAR_1[i][j].trim();
				desCorta = des.substring(0, 15);
				/*console.log(desCorta);
				console.log(des);*/
				respuestaBusqueda += desCorta + '<img title="' + des + '" src="/keon_mult_mult_pub/images/derecha.gif">';
			} else {
				respuestaBusqueda += DATOS_NACAR_1[i][j].trim();
			}
			//respuestaBusqueda += DATOS_NACAR_1[i][j];
			respuestaBusqueda += "<\/b><\/td>";
		}
		if (DATOS_NACAR_1[i][0] == 'C') {
			respuestaBusqueda += "<td style=\"text-align:center;\">";
			respuestaBusqueda += "<a href=\"\#\" onclick=\"slectclient(" + i + ")\" >";
			respuestaBusqueda += "<img title=\"Ficha Cliente\" src=\"\/keon_mult_mult_pub\/images\/ECBIFichaC.gif\" \/>";
			respuestaBusqueda += "<\/a><\/td><\/tr>";
		} else if (DATOS_NACAR_1[i][0] == 'P') {
			respuestaBusqueda += "<td style=\"text-align:center;\">";
			respuestaBusqueda += "<a href=\"\#\" onclick=\"mantenimientoP(" + i + ")\" >";
			respuestaBusqueda += "<img title=\"Mantenimiento Prospecto\" src=\"\/keon_mult_mult_pub\/images\/ECBIFichaC.gif\" \/>";
			respuestaBusqueda += "<\/a><\/td><\/tr>";

		} else if ((DATOS_NACAR_1[i][0] == 'X') ||
			(DATOS_NACAR_1[i][0] == 'F') ||
			(DATOS_NACAR_1[i][0] == '8') ||
			(DATOS_NACAR_1[i][0] == '9') ||
			(DATOS_NACAR_1[i][0] == 'Y') ||
			(DATOS_NACAR_1[i][0] == 'Z') ||
			(DATOS_NACAR_1[i][14] == '8') ||
			(DATOS_NACAR_1[i][14] == '9') ||
			(DATOS_NACAR_1[i][13] == '9')
		) {
			respuestaBusqueda += "<td style=\"text-align:center;\">";
			respuestaBusqueda += "<a href=\"\#\" onclick=\"clienteCalificado(" + i + ")\" >";
			respuestaBusqueda += "<img title=\"Ficha Cliente\" src=\"\/keon_mult_mult_pub\/images\/ECBIFichaC.gif\" \/>";
			respuestaBusqueda += "<\/a><\/td><\/tr>";
		}
	}
	respuestaBusqueda += "<\/table><\/div>";
	respuestaBusqueda += "<table width=\"100%\" style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";

	if (tipoBuscado == 5 || tipoBuscado == 6) {
		respuestaBusqueda += "<tr class=\"TablaMantenimiento\">";
		respuestaBusqueda += "<td align=\"left\" style=\"padding-top:10px\">";
		respuestaBusqueda += " <input type=\"button\" onclick=\"contratar('C');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105 BotonMargenIzq\" value=\"Cliente\" id=\"btn_NuevoCliente\" title=\"Nuevo Cliente\">";
		respuestaBusqueda += "<input type=\"button\" onclick=\"contratar('P');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105 BotonMargenIzq\" value=\"Cliente/Prospecto\" id=\"btn_NuevoProspecto\" title=\"Nuevo Cliente/Prospecto\">";
		respuestaBusqueda += "<\/td>";
	}
	if (tipoBuscado == 5 || tipoBuscado == 6 || tipoBuscado == 7) {
		respuestaBusqueda += "<td align=\"right\"  style=\"padding-top:10px\">";
		if (aviso == 'EXISTEN MAS DATOS' || paginaActual > 1)
			respuestaBusqueda += " <input type=\"button\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar('inicio');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105 BotonMargenIzq\" value=\"Inicio\" id=\"btn_Inicio\" title=\"Inicio\">";
		if (aviso == 'NO EXISTEN MAS PERSONAS' && paginaActual == 1)
			respuestaBusqueda += " <input type=\"button\" disabled=\"disabled\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar(true);\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105Disabled BotonMargenIzq\" value=\"Inicio\" id=\"btn_Inicio\" title=\"Inicio\">";
		if (paginaActual > 1)
			respuestaBusqueda += "<input type=\"button\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar('atras');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105 BotonMargenIzq\" value=\"Anterior\" id=\"btn_Siguiente\" title=\"Anterior\">";
		if (paginaActual == 1)
			respuestaBusqueda += "<input type=\"button\" disabled=\"disabled\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar('atras');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105Disabled BotonMargenIzq\" value=\"Anterior\" id=\"btn_Siguiente\" title=\"Anterior\">";
		if (aviso == 'EXISTEN MAS DATOS')
			respuestaBusqueda += "<input type=\"button\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar('siguiente');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105 BotonMargenIzq\" value=\"Siguiente\" id=\"btn_Siguiente\" title=\"Siguiente\">";
		if (aviso == 'NO EXISTEN MAS PERSONAS')
			respuestaBusqueda += "<input type=\"button\" disabled=\"disabled\" onclick=\"javaScript:var objetoNegocio = atpn_gt_getFrameObjetoNegocio();objetoNegocio.paginar('siguiente');\" onmouseout=\"this.className='BotonMantenimiento105 BotonMargenIzq'\" onmouseover=\"this.className='BotonMantenimiento105Hover BotonMargenIzq'\" class=\"BotonMantenimiento105Disabled BotonMargenIzq\" value=\"Siguiente\" id=\"btn_Siguiente\" title=\"Siguiente\">";
		respuestaBusqueda += "<\/td>";

	}
	respuestaBusqueda += "<\/tr>";


	respuestaBusqueda += "<tr><td colspan=\"2\">";
	respuestaBusqueda += "<div class=\"DivBotonera\" style=\"position:inherit;\">";
	respuestaBusqueda += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">";
	respuestaBusqueda += "<tr><td class=\"alinearDer\">";
	respuestaBusqueda += "<hr class=\"separadorBotonera\">";
	respuestaBusqueda += " <input type=\"button\" title=\"Cerrar Busqueda\" onclick=\"javascript:ocultarbusqueda()\" onmouseout=\"this.className='Boton BotonMargenDer'\" onmouseover=\"this.className='BotonHover BotonMargenDer'\" class=\"Boton BotonMargenDer\" value=\"Cerrar\" id=\"btn_cerrar\">";
	respuestaBusqueda += "<\/td><\/tr><\/table></div><\/td><\/tr>";

	respuestaBusqueda += "<\/table><\/div><\/td><\/tr><\/table>";
	top.buscar(respuestaBusqueda);
	top.keonFinPeticion();
}

function muestraGestores() {
	var clase;
	var respuestaBusqueda = "<table cellpadding=\"3\" cellspacing=\"3\"style=\"margin-left: 12%; margin-top: 5%; vertical-align:middle; background-color:#fff;\">";
	respuestaBusqueda += "<tr><td><div>";
	respuestaBusqueda += "<table width=\"800px\ style=\"background-color:#fff;\" cellpadding=\"1\" cellspacing=\"1\">";
	respuestaBusqueda += "<tr class=\"fondo-gris\">";
	respuestaBusqueda += "<td colspan=\"9\" class=\"derecha\" style=\"cursor:pointer; font-size:11pt; font-weight:bold;\">";
	respuestaBusqueda += "<a onclick=\"javascript:ocultarbusqueda()\" class=\"enlace-habilitado\" style=\"text-decoration: none;\">X<\/a><\/td><\/tr>";
	respuestaBusqueda += "<tr class=\"fondo-gris\">";
	respuestaBusqueda += "<td class=\"subrayado\"><b>U.G<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Nombres<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Perfil<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Total Clientes<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Usuario<\/b><\/td>";
	respuestaBusqueda += "<td class=\"subrayado\"><b>Acciones<\/b><\/td><\/tr>";

	for (i = 0; i < DATOS_NACAR_1.length; i++) {
		if (i % 2 != 0) {
			clase = "gris-par";

		} else {
			clase = "gris-impar";

		}
		respuestaBusqueda += "<tr class=\"";
		respuestaBusqueda += clase;
		respuestaBusqueda += "\">";
		for (j = 0; j < 5; j++) {
			respuestaBusqueda += "<td style=\"padding-left: 5px;\"><b>";
			respuestaBusqueda += DATOS_NACAR_1[i][j].trim();
			respuestaBusqueda += "<\/b><\/td>";
		}
		respuestaBusqueda += "<td style=\"text-align:center;\">";
		respuestaBusqueda += "<a href=\"\#\" onclick=\"slectGestor('";
		//respuestaBusqueda +=DATOS_NACAR_1[i][1]+"','"+DATOS_NACAR_1[i][2];
		respuestaBusqueda += i;
		respuestaBusqueda += "')\" >";
		respuestaBusqueda += "<img src=\"\/keon_mult_mult_pub\/images\/ECBIInformacion.gif\" \/><\/a><\/td><\/tr>";

	}

	respuestaBusqueda += "<tr><td colspan=\"6\">";
	respuestaBusqueda += "<div class=\"DivBotonera\" style=\"position:inherit;\">";
	respuestaBusqueda += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">";
	respuestaBusqueda += "<tr><td class=\"alinearDer\">";
	respuestaBusqueda += "<hr class=\"separadorBotonera\">";
	respuestaBusqueda += " <input type=\"button\" title=\"Cerrar Busqueda\" onclick=\"javascript:ocultarbusqueda()\" onmouseout=\"this.className='Boton BotonMargenDer'\" onmouseover=\"this.className='BotonHover BotonMargenDer'\" class=\"Boton BotonMargenDer\" value=\"Cerrar\" id=\"btn_cerrar\">";
	respuestaBusqueda += "<\/td><\/tr><\/table></div><\/td><\/tr>";

	respuestaBusqueda += "<\/table><\/div><\/td><\/tr><\/table>";
	top.buscar(respuestaBusqueda);
}

function slectclient(indice) {
	document.getElementById('cargaBusqueda').className = 'ocultarCarga';
	var ccc = DATOS_NACAR_1[indice][8] != '' ? true : false;
	var cliente = '';
	if (ccc) {

		cliente = DATOS_NACAR_1[indice][8] + "--" + DATOS_NACAR_1[indice][6] + "--" + DATOS_NACAR_1[indice][1] + " " + DATOS_NACAR_1[indice][2] + " " + DATOS_NACAR_1[indice][3];


		if (TDD != '') {
			cliente = DATOS_NACAR_1[indice][6] + "--" + DATOS_NACAR_1[indice][1] + " " + DATOS_NACAR_1[indice][2] + " " + DATOS_NACAR_1[indice][3];
			valorMostrado[0] = TDD + '--' + cliente;

		} else
			valorMostrado[0] = cliente;
		subirDatos(DATOS_NACAR_1[indice]);
		DATOS_NACAR_1 = new Array();
		ocultarCapturas();
		switch (lanzarFicha)

		{
			case 'N':
				break;
			case 'S':
				mover_Posicion();
				break;
			default:
				mover_Posicion();
				break;

		}
		lanzarFicha = '';
		limpiarBusqueda();
	} else {
		cliente = DATOS_NACAR_1[indice][6] + "--" + DATOS_NACAR_1[indice][1] + " " + DATOS_NACAR_1[indice][2] + " " + DATOS_NACAR_1[indice][3];
		numclie = DATOS_NACAR_1[indice][6];
		sector = DATOS_NACAR_1[indice][9];
		segmento = DATOS_NACAR_1[indice][11];
		recuperaDatos(null, miFuncion, null, true, numclie, sector, segmento);
		if (TDD != '') {
			cliente = DATOS_NACAR_1[indice][6] + "--" + DATOS_NACAR_1[indice][1] + " " + DATOS_NACAR_1[indice][2] + " " + DATOS_NACAR_1[indice][3];
			valorMostrado[0] = TDD + '--' + cliente;
		} else
			valorMostrado[0] = cliente;
		subirDatos(DATOS_NACAR_1[indice]);
		DATOS_NACAR_1 = new Array();
		ocultarCapturas();
		limpiarBusqueda();

		switch (lanzarFicha)

		{
			case 'N':
				break;
			case 'S':
				var listaParametros = 'DATOS_ENTRADA.NUMERO_CLIENTE=' + CLIENTE_SELECIONADO[5];
				parent.ejecutarOperacionNACAREscenario('FC000000', listaParametros, 'CTE_TIPO_NAV', null, '1');
				break;
			default:
				mover_fichaEECC();
				break;

		}
		lanzarFicha = '';
	}

}

/******************************************
 *	Se crea el arreglo con los datos del  *
 *   gestor sleleccionado en el siguiente  *
 *    orden                                *
 *			                              *
 *	GESTOR_SELECIONADO[0]=NOMBRE	      *
 *	GESTOR_SELECIONADO[1]=GESTOR	      *
 *	GESTOR_SELECIONADO[2]=DESCPERF        *
 *	GESTOR_SELECIONADO[3]=TOTCTES	      *
 *	GESTOR_SELECIONADO[4]=USUARIO         *
 *   GESTOR_SELECIONADO[5]=CR              *
 ******************************************/

function slectGestor(gestor) {

	document.getElementById('cargaBusqueda').className = 'ocultarCarga';
	valorMostrado[1] = DATOS_NACAR_1[gestor][0] + " -- " + DATOS_NACAR_1[gestor][1];
	GESTOR_SELECIONADO = new Array(DATOS_NACAR_1[gestor][0], DATOS_NACAR_1[gestor][1], DATOS_NACAR_1[gestor][2], DATOS_NACAR_1[gestor][3], DATOS_NACAR_1[gestor][4]);
	GESTOR_SELECIONADO[5] = CR_Buscado;
	//console.log(GESTOR_SELECIONADO);
	DATOS_NACAR_1 = new Array();

	ocultarCapturas(1);
	limpiarBusqueda();
	gestorSeleccionado = true;
}

function mostarbusqueda() {
	var div_busqueda = top.document.getElementById("resBuscar");
	div_busqueda.style.display = "block";
	div_busqueda.style.visibility = "visible";
}

/******************************************
 *	Se crea el arreglo con los el cliente *
 *	slelecciobado  en el siguiente orden  *
 *			                                      *
 *	CLIENTE_SELECIONADO[0]=NFMX_NOMBRE			  *
 *	CLIENTE_SELECIONADO[1]=NFMX_APEPAT			  *
 *	CLIENTE_SELECIONADO[2]=NFMX_APEMAT			  *
 *	CLIENTE_SELECIONADO[3]=NFMX_RFC			      *
 *	CLIENTE_SELECIONADO[4]=NFMX_HOMOCLAVE		  *
 *	CLIENTE_SELECIONADO[5]=NFMX_NUMERO_CLIENTE	  *
 *		                                          *
 *	CLIENTE_SELECIONADO[6]=NUMERO_CONTRATO 		  * 
 *	CLIENTE_SELECIONADO[7]=NFMX_SECTOR			  *
 *	CLIENTE_SELECIONADO[8]=NFMX_DES_SECTOR		  *
 *	CLIENTE_SELECIONADO[9]=NFMX_SEGMENTO		  *
 *	CLIENTE_SELECIONADO[10]=NFMX_DES_SEGMENTO	  *
 *	CLIENTE_SELECIONADO[11]=NFMX_NUMERO_TDD		  *
 ******************************************/
function subirDatos(datosNacar) {
	if (datosNacar[10] != '') {
		CLIENTE_SELECIONADO = new Array(datosNacar[1], datosNacar[2], datosNacar[3], datosNacar[4], datosNacar[5], datosNacar[6], datosNacar[8], datosNacar[9], datosNacar[10], datosNacar[11], datosNacar[12], datosNacar[13], datosNacar[14], datosNacar[15], datosNacar[16]);

		subirObNeg();
	} else {
		CLIENTE_SELECIONADO = new Array(datosNacar[1], datosNacar[2], datosNacar[3], datosNacar[4], datosNacar[5], datosNacar[6], datosNacar[8], datosNacar[9], datosNacar[10], datosNacar[11], datosNacar[12], datosNacar[13], datosNacar[14], datosNacar[15], datosNacar[16]);
		// alert('NDPRE'+CLIENTE_SELECIONADO[14]);
	}
}

function recuperaDatos(control, funcion, aplicacionNacar, cargaAscincrona, numclie, sector, segmento) {
	setParametrosEntrada("OPERACION", "NUFR0114");
	setParametrosEntrada("LOCALE", "es_ES");
	metodoFormu = "GET";
	setParametrosEntrada("PAR_INICIO.NFMX_NUMERO_CLIENTE", numclie);
	setParametrosEntrada("PAR_INICIO.NFMX_SECTOR", sector);
	setParametrosEntrada("PAR_INICIO.NFMX_SEGMENTO", segmento);
	ejecutarOperacionNACAR(control, getDatosBas, '../', false, cargaAscincrona); //importante el false en sesion para entorno!!!	
}

function getDatosBas(control, mensajeRespuesta) {
	var lista = getDatoXML('datos', mensajeRespuesta);
	$(mensajeRespuesta).find('simple').each(function () {
		var campo = $(this).attr('clave');
		var valor = $(this).text();
		if (campo == 'NFMX_DES_SECTOR')
			CLIENTE_SELECIONADO[8] = valor.trim();
		if (campo == 'NFMX_DES_SEGMENTO')
			CLIENTE_SELECIONADO[10] = valor.trim();
	});
	///alert(CLIENTE_SELECIONADO);
	subirObNeg();
}


function numeroTarjeta(input) {
	TDD = input;
	//console.log("Copio a TDD: "+TDD);  
}

function hayTarjetaSeleccionada(mostrarMensaje, mensajePersonalizado) {
	//console.log('dato ObNeg= '+TDD);
	if (TDD != '' && TDD != null && TDD != undefined) {
		return true;
	} else {
		if (mostrarMensaje) {
			if (!mensajePersonalizado)
				mensajePersonalizado = "Debe tener un n&uacute;mero de tarjeta seleccionado<br/><br/>Para acceder a esta opci�n seleccione un n&uacute;mero de tarjeta desde la llave de b�squeda de Producto";
			try {
				//parent.alertaExt('Error', mensajePersonalizado, 3);
				top.keonMensaje('error', 'Error al acceder a opci�n', mensajePersonalizado, 'cerrar', 'void(0)');
			} catch (err) {
				alert(mensajePersonalizado);
			}
		}
	}
	return false;
}

function hayContratoSeleccionado(mostrarMensaje, mensajePersonalizado) {
	//console.log('dato ObNeg= '+CLIENTE_SELECIONADO[6]);
	if (CLIENTE_SELECIONADO[6] != '' && CLIENTE_SELECIONADO[6] != null && CLIENTE_SELECIONADO[6] != undefined) {
		return true;
	} else {
		if (mostrarMensaje) {
			if (!mensajePersonalizado)
				mensajePersonalizado = "Debe tener un contrato seleccionado<br/><br/>Para acceder a esta opci�n seleccione un contrato desde la ficha 'Operar'";
			try {
				//parent.alertaExt('Error', mensajePersonalizado, 3);
				top.keonMensaje('error', 'Error al acceder a opci�n', mensajePersonalizado, 'cerrar', 'void(0)');
			} catch (err) {
				alert(mensajePersonalizado);
			}
		}
	}
	return false;
}


function hayGestorSeleccionado(mostrarMensaje, mensajePersonalizado) {
	if (GESTOR_SELECIONADO[0] != null) {
		return true;
	} else {
		if (mostrarMensaje) {
			if (!mensajePersonalizado)
				mensajePersonalizado = "Debe tener un gestor seleccionado<br/><br/>Para acceder a esta opci�n seleccione un gestor del listado en la opci�n 'UG'";
			try {
				//parent.alertaExt('Error', mensajePersonalizado, 3);
				top.keonMensaje('error', 'Error al acceder a opci�n', mensajePersonalizado, 'cerrar', 'void(0)');
			} catch (err) {
				alert(mensajePersonalizado);
			}
		}

	}
	return false;
}


function hayClienteSeleccionado(mostrarMensaje, mensajePersonalizado) {
	if (valorMostrado[0] != "No hay Cliente Seleccionado")
		return true;
	else {
		if (mostrarMensaje) {
			if (!mensajePersonalizado)
				mensajePersonalizado = "Debe tener un cliente seleccionado<br/><br/>Para acceder a esta opci�n seleccione un cliente desde cualquiera de las llaves de b�squeda";
			try {
				//parent.alertaExt('Error', mensajePersonalizado, 3);
				top.keonMensaje('error', 'Error al acceder a opci�n', mensajePersonalizado, 'cerrar', 'void(0)');
			} catch (err) {
				alert(mensajePersonalizado);
			}
		}
	}
	return false;
}

function lanzarOperacionPrincipal(parametro) {
	//top.frames['FPrincipal'].location.href="procesar.jsp";
	top.frames['Fprincipal'].location.href = parametro;
}

function mover_fichaEECC() {
	if (hayClienteSeleccionado(true)) {
		parent.seleccionarPestanya(2);
		var listaParametros = 'DATOS_ENTRADA.NUMERO_CLIENTE=' + CLIENTE_SELECIONADO[5];
		parent.ejecutarOperacionNACAREscenario('FC000000', listaParametros, 'CTE_TIPO_NAV', null, '1');
	}
}

function mover_Posicion() {
	if (hayClienteSeleccionado(true)) {
		parent.seleccionarPestanya(2);
		parent.ejecutarOperacionNACAREscenario('FC000025', cargarParametros(), 'CTE_TIPO_NAV', null, '1');
	}
}

function mover_fichaEECC2() {
	if (hayClienteSeleccionado(true)) {
		parent.seleccionarPestanya(2);
		lanzarOperacionPrincipal("https://150.250.250.207:4443/ecinxd_mx_web/servlet/ServletOperacionWeb?OPERACION=FC000001&LOCALE=es_ES&DATOS_ENTRADA.COD_CCLIEN=" + CLIENTE_SELECIONADO[5]);
		try {
			//			keonEnvioPeticion();
		} catch (err) {
			//console.log(err); // VER INICIO
		}
	}
}


function mover_fichaEECC3() {
	if (hayClienteSeleccionado(true)) {
		parent.seleccionarPestanya(2);
		lanzarOperacionPrincipal("https://150.250.250.207:4443/ecinxd_mx_web/ecinxd_mx_web/servlet/web?flujo=KEENFL40501&LOCALE=es_ES&DATOS_ENTRADA.NUMCTE=" + CLIENTE_SELECIONADO[5]);
		try {
			//			keonEnvioPeticion();
		} catch (err) {
			//console.log(err); // VER INICIO
		}
	}
}


function moverContrata() {
	if (hayClienteSeleccionado(true)) {
		parent.seleccionarPestanya(2);
		parent.ejecutarOperacionNACAREscenario('FC000024', cargarParametros(), 'CTE_TIPO_NAV', null, '1');
		/*		lanzarOperacionPrincipal("https://150.250.250.207:4443/ecinxd_mx_web/ecinxd_mx_web/servlet/web?flujo=NCMXFL10000&LOCALE=es_ES&DATOS_ENTRADA.NUMCTE="+cargarParametros());*/

		try {} catch (err) {
			//console.log(err); // VER INICIO
		}
	}

}

function mover_cuadro() {
	parent.seleccionarPestanya(3);
	parent.ejecutarOperacionNACAREscenario('FC000029', '', 'CTE_TIPO_NAV', null, '1');
}

function mover_actividad() {
	parent.seleccionarPestanya(3);
	parent.ejecutarOperacionNACAREscenario('FC000027', cargarParametrosGestor(), 'CTE_TIPO_NAV', null, '1');
}

function mover_matriz() {
	parent.seleccionarPestanya(3);
	parent.ejecutarOperacionNACAREscenario('FC000028', cargarParametrosGestor(), 'CTE_TIPO_NAV', null, '1');
}



function mover_operar() {
	if (hayClienteSeleccionado(true)) {
		var listaParametros = 'DATOS_ENTRADA.NUMCLIE=' + CLIENTE_SELECIONADO[5];
		parent.ejecutarOperacionNACAREscenario('FC000019', listaParametros, 'CTE_TIPO_NAV', null, '1');
	}
}

function recolocacion() {
	if (hayClienteSeleccionado(true)) {
		//alert("Acceso Temporal a Recolocacion NCC");
		parent.seleccionarPestanya(2);
		top.document.getElementById('FPrincipal').src = "https://150.250.250.207:4443/ecinxd_mx_web/ecinxd_mx_web/servlet/web?flujo=CRMXFL00100&LOCALE=es_ES&DATOS_ENTRADA.NUMERO_CLIENTE=" +
			CLIENTE_SELECIONADO[5] + "" +
			"&DATOS_ENTRADA.NOMBRE=" + CLIENTE_SELECIONADO[0] + "" +
			"&DATOS_ENTRADA.PATERN=" + CLIENTE_SELECIONADO[1] + "" +
			"&DATOS_ENTRADA.MATERN=" + CLIENTE_SELECIONADO[2] + "" +
			"&DATOS_ENTRADA.HCLAVE=" + CLIENTE_SELECIONADO[4] + "" +
			"&DATOS_ENTRADA.RFC=" + CLIENTE_SELECIONADO[3] + "" +
			"&DATOS_ENTRADA.SECTOR=" + CLIENTE_SELECIONADO[7] + "" +
			"&DATOS_ENTRADA.SEGMEN=" + CLIENTE_SELECIONADO[9] + "" +
			"&DATOS_ENTRADA.SECTORCOMPLETO=F33";
	}
}

/* ultima funion a llamar ya que se tengan todos los datos a subir */
function subirObNeg() {
	//subirObjetosNegocio(CLAVES,CLIENTE_SELECIONADO);
	//alert('Me invocan para subir datos');
}


function subidaObjetoLigero(claves, valores) {
	var claves1 = claves
	var cliente = '';
	var index = getClaveClient(claves1);
	var separador = String.fromCharCode(165) + '$|' + String.fromCharCode(165);
	try {
		if (isCuenta(claves)) {
			/*Asi sin hacer busqueda */
			CLIENTE_SELECIONADO[6] = valores[0];

			cliente = CLIENTE_SELECIONADO[6] + "--" + CLIENTE_SELECIONADO[5] + "--" + CLIENTE_SELECIONADO[0] + " " + CLIENTE_SELECIONADO[1] + " ";
			cliente += CLIENTE_SELECIONADO[2];
			valorMostrado[0] = cliente;
			ocultarCapturas();
			if (lanzarOperacion(claves, valores) == 'S' || lanzarOperacion(claves, valores) == '')

				parent.ejecutarOperacionNACAREscenario('FC000025', cargarParametros(), 'CTE_TIPO_NAV', null, '1');
			/***********************************/
			/*Asi para hacer busqueda */
			/*
			  console.log('Busco cuenta');
			 CLIENTE_SELECIONADO[6]=valores[0];
			 var textBusqueda ='0'+separador+CLIENTE_SELECIONADO[6];
			 lanzarFicha=lanzarOperacion(claves1,valores);			 
			 envioNacar(null,miFuncion,null,true,textBusqueda);			 			 
			 */



		} else {

			if (index != null) {
				CLIENTE_SELECIONADO[5] = valores[index];
				var textBusqueda = '8' + separador + CLIENTE_SELECIONADO[5];
				lanzarFicha = lanzarOperacion(claves1, valores);
				envioNacar(null, miFuncion, null, true, textBusqueda, null);

			}
		}

	} catch (err) {
		//console.error(err)
	}
}

function getClaveClient(claves) {
	var index = null
	for (var k = 0; k < claves.length; k++) {
		if (claves[k] == "MULTICLIENTE.COD_CCLIEN")
			index = k;
	}
	return index;

}

function getNomClient(claves) {
	var index = null
	for (var k = 0; k < claves.length; k++) {
		if (claves[k] == "MULTICLIENTE.DES_NOMBRE")
			index = k;
	}
	return index;

}

function lanzarOperacion(claves, valores) {


	var indicador = '';
	for (var k = 0; k < claves.length; k++) {
		if (claves[k] == "MULTICLIENTE.LANZAR_OPERACION")
			indicador = valores[k];
	}
	return indicador;

}

function cargarParametros() {
	var urlFINAL = '';

	CLIENTE_SELECIONADO[1] = CLIENTE_SELECIONADO[1].replace('�', '%F1');
	CLIENTE_SELECIONADO[1] = CLIENTE_SELECIONADO[1].replace('�', '%D1');
	CLIENTE_SELECIONADO[1] = CLIENTE_SELECIONADO[1].replace('#', '%23');
	CLIENTE_SELECIONADO[2] = CLIENTE_SELECIONADO[2].replace('�', '%F1');
	CLIENTE_SELECIONADO[2] = CLIENTE_SELECIONADO[2].replace('�', '%D1');
	CLIENTE_SELECIONADO[2] = CLIENTE_SELECIONADO[2].replace('#', '%23')
	if (hayClienteSeleccionado(true)) {
		urlFINAL = urlFINAL + "DATOS_ENTRADA.NUMERO_CLIENTE=" + CLIENTE_SELECIONADO[5];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.NOMBRE=" + CLIENTE_SELECIONADO[0];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.APEPAT=" + CLIENTE_SELECIONADO[1];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.APEMAT=" + CLIENTE_SELECIONADO[2];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.RFC=" + CLIENTE_SELECIONADO[3];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.HOMOCLAVE=" + CLIENTE_SELECIONADO[4];
		if (CLIENTE_SELECIONADO[6] != '')
			urlFINAL = urlFINAL + "&DATOS_ENTRADA.NUMERO_CONTRATO=" + CLIENTE_SELECIONADO[6];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.SECTOR=" + CLIENTE_SELECIONADO[7];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.DES_SECTOR=" + CLIENTE_SELECIONADO[8];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.SEGMENTO=" + CLIENTE_SELECIONADO[9];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.DES_SEGMENTO=" + CLIENTE_SELECIONADO[10];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.INDPRE=" + CLIENTE_SELECIONADO[14];
	}
	return urlFINAL;
}

function isCuenta(claves) {
	var hayCuenta = false;
	for (var k = 0; k < claves.length; k++) {
		if (claves[k] == "NUMERO_CONTRATO")
			hayCuenta = true;
	}
	return hayCuenta;
}

function ocultarDivBusqueda() {
	document.getElementById('cargaBusqueda').className = 'ocultarCarga';
}

function paginar(pag) {
	top.keonEnvioPeticion();
	if (pag == 'inicio') {
		envioNacar(null, miFuncion, null, true, busqueda, null);
	}
	if (pag == 'atras') {
		envioNacar(null, miFuncion, null, true, busqueda, parseInt(paginaActual) - 1);
	}
	if (pag == 'siguiente') {
		envioNacar(null, miFuncion, null, true, busqueda, parseInt(paginaActual) + 1);
	}
}

function mover_contratacion(tipo) {
	var datosCont = datosContratacion();
	datosCont["app1"] = datosCont["app1"].replace('�', '%F1');
	datosCont["app1"] = datosCont["app1"].replace('�', '%D1');
	datosCont["app1"] = datosCont["app1"].replace('#', '%23');
	datosCont["app2"] = datosCont["app2"].replace('�', '%F1');
	datosCont["app2"] = datosCont["app2"].replace('�', '%D1');
	datosCont["app2"] = datosCont["app2"].replace('#', '%23');
	var parametros = '';
	if (tipo == 'C') {
		if (datosCont["sector"] == 'F') {
			valorMostrado[0] = '00000000 -- ' + datosCont["nombre"].toUpperCase() + ' ' + datosCont["app1"].toUpperCase() + ' ' + datosCont["app2"].toUpperCase();
			ocultarCapturas();
			parametros += 'DATOS_ENTRADA.NUMERO_CLIENTE=00000000';
			parametros += '&DATOS_ENTRADA.SECTOR=' + datosCont["sector"];
			parametros += '&DATOS_ENTRADA.APEPAT=' + datosCont["app1"];
			parametros += '&DATOS_ENTRADA.APEMAT=' + datosCont["app2"];
			parametros += '&DATOS_ENTRADA.NOMBRE=' + datosCont["nombre"];
			parent.ejecutarOperacionNACAREscenario('FC000024', parametros, 'CTE_TIPO_NAV', null, '1');
		} else {
			valorMostrado[0] = '00000000 -- ' + datosCont["nombre"].toUpperCase() + ' ' + datosCont["app1"];
			ocultarCapturas();
			parametros += 'DATOS_ENTRADA.NUMERO_CLIENTE=00000000';
			parametros += '&DATOS_ENTRADA.SECTOR=' + datosCont["sector"];
			parametros += '&DATOS_ENTRADA.APEPAT=' + datosCont["app1"];
			parametros += '&DATOS_ENTRADA.NOMBRE=' + datosCont["nombre"];
			parent.ejecutarOperacionNACAREscenario('FC000024', parametros, 'CTE_TIPO_NAV', null, '1');
		}

	}
	if (tipo == 'P') {
		//console.log('Alta Prospecto');
		if (datosCont["sector"] == 'F') {
			parametros += '&DATOS_ENTRADA.APPATERNO=' + datosCont["app1"];
			parametros += '&DATOS_ENTRADA.APMATERNO=' + datosCont["app2"];
			parametros += '&DATOS_ENTRADA.NOMBRE=' + datosCont["nombre"];
			parent.ejecutarOperacionNACAREscenario('FC000035', parametros, 'CTE_TIPO_NAV', null, '1');
		} else {
			parametros += '&DATOS_ENTRADA.RAZONSO=' + datosCont["nombre"] + ' ' + datosCont["app1"];
			parent.ejecutarOperacionNACAREscenario('FC000034', parametros, 'CTE_TIPO_NAV', null, '1');
		}
		resetData()
	}

}

function mover_Prospecot(indice) {
	var parametros = 'DATOS_ENTRADA.NUMPROSP=' + DATOS_NACAR_1[indice][6];
	parametros += '&DATOS_ENTRADA.NUMCLIEN=' + DATOS_NACAR_1[indice][6];
	parametros += '&DATOS_ENTRADA.PERSONA=' + DATOS_NACAR_1[indice][9];
	parent.ejecutarOperacionNACAREscenario('FC000036', parametros, 'CTE_TIPO_NAV', null, '1');
	resetData()
}

function datosContratacion() {
	var datosRetorno = new Array();
	var separador = String.fromCharCode(165) + '$|' + String.fromCharCode(165);
	var tokens = busqueda.split(separador);
	if (tokens[0] == 5) //fisica
	{
		datosRetorno["nombre"] = tokens[1].toUpperCase();
		datosRetorno["app1"] = tokens[2].toUpperCase();
		datosRetorno["app2"] = tokens[3].toUpperCase();
		datosRetorno["sector"] = 'F';
	}
	if (tokens[0] == 6) //moral
	{
		datosRetorno["nombre"] = tokens[1].toUpperCase();
		datosRetorno["app1"] = tokens[2].toUpperCase();
		datosRetorno["app2"] = tokens[3];
		datosRetorno["sector"] = 'M';
	}
	return datosRetorno;
}

function resetData() {
	DATOS_NACAR_1 = new Array();
}

function limpiarBusqueda() {
	try {
		document.getElementById("captura0").value = '';
	} catch (err) {}
	try {
		document.getElementById("captura1").value = '';
	} catch (err) {}
	try {
		document.getElementById("captura2").value = '';
	} catch (err) {}
	try {
		document.getElementById("captura3").value = '';
	} catch (err) {}
	try {
		document.getElementById("captura4").value = '';
	} catch (err) {}
	try {
		document.getElementById("captura5").value = '';
	} catch (err) {}
}

/**** Aqui todo lo del gestor ******/
function isGestorSeleccionado() {
	return gestorSeleccionado;
}

function cargarParametrosGestor() {
	var urlFINAL = '';
	if (isGestorSeleccionado()) {
		GESTOR_SELECIONADO[1] = GESTOR_SELECIONADO[1].replace('�', '%F1');
		GESTOR_SELECIONADO[1] = GESTOR_SELECIONADO[1].replace('�', '%D1');
		GESTOR_SELECIONADO[1] = GESTOR_SELECIONADO[1].replace('#', '%23');
		urlFINAL = urlFINAL + "DATOS_ENTRADA.GESTOR=" + GESTOR_SELECIONADO[0];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.NOMBRE=" + GESTOR_SELECIONADO[1];
		urlFINAL = urlFINAL + "&DATOS_ENTRADA.CR=" + GESTOR_SELECIONADO[5];
	}
	return urlFINAL;
}

function clienteCalificado(indice) {
	var aux = '';
	var parametros = '';
	if (DATOS_NACAR_1[indice][0]) {
		if (DATOS_NACAR_1[indice][0] == 'F')
			aux = '0'; // Fallecido
		else
			aux = '1'; // ARCO PEE5
	}

	if (DATOS_NACAR_1[indice][13]) {
		if (DATOS_NACAR_1[indice][13] == '9')
			aux = '0'; // Fallecido
	}

	if (DATOS_NACAR_1[indice][14]) {
		if (DATOS_NACAR_1[indice][14] == '8' || DATOS_NACAR_1[indice][14] == '9')
			aux = '2'; // ARCO WI65
	}

	switch (aux) {

		case '0': //Fallecido
			if (lanzarFicha != 'S')
				top.frames['Fcabecera'].seleccionarPestanya(2);
			parametros = '&DATOS_ENTRADA.NUMERO_CLIENTE=' + DATOS_NACAR_1[indice][6];
			parent.ejecutarOperacionNACAREscenario('FC000041', parametros, 'CTE_TIPO_NAV', null, '1');
			resetData();
			indicadorCalificado = true;
			window.location.reload();
			break;

		case '1': //Arco PEE5
			if ((DATOS_NACAR_1[indice][0] == '8') ||
				(DATOS_NACAR_1[indice][0] == '9') ||
				(DATOS_NACAR_1[indice][0] == 'Y') ||
				(DATOS_NACAR_1[indice][0] == 'Z')
			) {
				if (lanzarFicha != 'S')
					top.frames['Fcabecera'].seleccionarPestanya(2);
				parametros = '&DATOS_ENTRADA.NUMERO_CLIENTE=' + DATOS_NACAR_1[indice][6];
				parametros += '&DATOS_ENTRADA.APEPAT=' + DATOS_NACAR_1[indice][2];
				parametros += '&DATOS_ENTRADA.APEMAT=' + DATOS_NACAR_1[indice][3];
				parametros += '&DATOS_ENTRADA.HOMOCLAVE=' + DATOS_NACAR_1[indice][5];
				parametros += '&DATOS_ENTRADA.NOMBRE=' + DATOS_NACAR_1[indice][1];
				parametros += '&DATOS_ENTRADA.RFC=' + DATOS_NACAR_1[indice][4];
				parametros += '&DATOS_ENTRADA.SECTOR=' + DATOS_NACAR_1[indice][9];
				parametros += '&DATOS_ENTRADA.SEGMENTO=' + DATOS_NACAR_1[indice][11];
				parametros += '&DATOS_ENTRADA.DES_SECTOR=' + DATOS_NACAR_1[indice][10];
				parametros += '&DATOS_ENTRADA.DES_SEGMENTO=' + DATOS_NACAR_1[indice][12];
				parametros += '&DATOS_ENTRADA.NUMERO_CONTRATO=' + DATOS_NACAR_1[indice][8];
				parametros += '&DATOS_ENTRADA.IND_PROS=' + DATOS_NACAR_1[indice][0];

				parent.ejecutarOperacionNACAREscenario('FC000050', parametros, 'CTE_TIPO_NAV', null, '1');
				resetData();
				indicadorCalificado = true;
				window.location.reload();
			}
			break;

		case '2': //Arco WI65
			if (lanzarFicha != 'S')
				top.frames['Fcabecera'].seleccionarPestanya(2);
			parametros = '&DATOS_ENTRADA.NUMERO_CLIENTE=' + DATOS_NACAR_1[indice][6];
			parametros += '&DATOS_ENTRADA.APEPAT=' + DATOS_NACAR_1[indice][2];
			parametros += '&DATOS_ENTRADA.APEMAT=' + DATOS_NACAR_1[indice][3];
			parametros += '&DATOS_ENTRADA.HOMOCLAVE=' + DATOS_NACAR_1[indice][5];
			parametros += '&DATOS_ENTRADA.NOMBRE=' + DATOS_NACAR_1[indice][1];
			parametros += '&DATOS_ENTRADA.RFC=' + DATOS_NACAR_1[indice][4];
			parametros += '&DATOS_ENTRADA.SECTOR=' + DATOS_NACAR_1[indice][9];
			parametros += '&DATOS_ENTRADA.SEGMENTO=' + DATOS_NACAR_1[indice][11];
			parametros += '&DATOS_ENTRADA.DES_SECTOR=' + DATOS_NACAR_1[indice][10];
			parametros += '&DATOS_ENTRADA.DES_SEGMENTO=' + DATOS_NACAR_1[indice][12];
			parametros += '&DATOS_ENTRADA.NUMERO_CONTRATO=' + DATOS_NACAR_1[indice][8];
			parametros += '&DATOS_ENTRADA.IND_PROS=' + DATOS_NACAR_1[indice][14];

			parent.ejecutarOperacionNACAREscenario('FC000050', parametros, 'CTE_TIPO_NAV', null, '1');
			resetData();
			indicadorCalificado = true;
			window.location.reload();
			break;
			lanzarFicha = '';

	}
}