var radio;
var filaAnt = 0;
var EventList = new Array();
EventList[0] = new Array(2);

var _TP_TEXTO = 0; // Todo texto valido, excepto caracteres especiales.
var _TP_NUMERICO = 1; // solo numeros enteros (con signo de puntuacion)
var _TP_DECIMAL = 2; // importes con decimales
var _TP_DECIMAL_NN = 3; // importes con decimales, y numeros negativos
var _TP_PORCIENTO = 4; // valores para porcentajes 
var _TP_CIFRA = 5; // n�meros sin nig�n tipo de separador
var _TP_FECHA = 6; // Todo texto valido, excepto caracteres especiales.

var _CAMP_OCULTO = 0; // Campo oculto
var _CAMP_OBLIGATORIO = 1; // Campo obligatorio
var _CAMP_OPCIONAL = 2; // Campo opcional
var _CAMP_PROTEGIDO = 3; // Campo protegido

//realizamos esto para asegurarnos que el scroll s�lo aparece si es necesario.
document.onreadystatechange = configBody;


function configBody() {

    if (document.readyState == 'complete')
        document.body.style.overflow = 'auto';

}


/************************************************************************************************************
 *****																									*****
 ***** Nombre 	  : ToggleRadio                      											    	*****
 ***** Descripci�n : Establece la fila seleccionada						 							    ***** 
 ***** Par�metros  : 																					*****
 *****				e 		= radio																		*****
 *****				numFila = n�mero de fila en la que estamos											*****  
 *****																									*****
 *************************************************************************************************************/
function ToggleRadio(e, numFila) {
    if (radio == e) return;

    if (radio == null) {
        //fila azul clara
        Highlight(e, numFila);
        radio = e;
        filaAnt = numFila;
    } else {
        Highlight(e, numFila);
        //fila azul oscura
        Unhighlight(radio, filaAnt);
        radio = e;
        filaAnt = numFila;
    }
}

/************************************************************************************************************
 *****																									*****
 ***** Nombre 	  : Unhighlight                      											    	*****
 ***** Descripci�n : Desilumina la fila anteriormente seleccionada		 							    *****
 ***** Par�metros  : 																					*****
 *****				e 		= radio																		*****
 *****				numFila = n�mero de fila en la que estamos											*****  
 *****																									*****
 ***** NOTA		  : Se deber� de crear una funci�n cambioColor(numfila,pijama), de igual manera que la  *****
 *****				creada para la aplicaci�n NCTC, que haga refencia al nombre de las columnas que 	*****
 *****				tenga la trabla																		*****
 *****																									*****
 *************************************************************************************************************/
function Unhighlight(e, numFila) {
    var r = null;

    if (e.parentNode && e.parentNode.parentNode) {
        r = e.parentNode.parentNode;
    } else if (e.parentElement && e.parentElement.parentElement) {
        r = e.parentElement.parentElement;
    }
    if (r) {

        if (r.className == "CampoPijama3") {

            r.className = "CampoPijama" + parseInt((numFila + 1) % 2 + 1);

            cambioColor(numFila, "CampoPijama" + parseInt((numFila + 1) % 2 + 1));
        }
    }
}

/************************************************************************************************************
 *****																									*****
 ***** Nombre 	  : Highlight	                      											    	*****
 ***** Descripci�n : Ilumina la fila pasada como parametro						 						*****
 ***** Par�metros  : 																					*****
 *****				e 		= radio																		*****
 *****				numFila = n�mero de fila en la que estamos											*****  
 *****																									*****
 ***** NOTA		  : Se deber� de crear una funci�n cambioColor(numfila,pijama), de igual manera que la  *****
 *****				creada para la aplicaci�n NCTC, que haga refencia al nombre de las columnas que 	*****
 *****				tenga la trabla																		*****
 *****																									*****
 *************************************************************************************************************/
function Highlight(e, numFila) {
    var r = null;
    if (e.parentNode && e.parentNode.parentNode) {
        r = e.parentNode.parentNode;
    } else if (e.parentElement && e.parentElement.parentElement) {
        r = e.parentElement.parentElement;
    }

    if (r) {
        if (r.className == "CampoPijama1") {
            r.className = "CampoPijama3";
            cambioColor(numFila, "CampoPijama3");
        } else {
            if (r.className == "CampoPijama2") {
                r.className = "CampoPijama3";
                cambioColor(numFila, "CampoPijama3");
            }
        }
    }
}

function fitButton() {

    var x = document.getElementById('botones');
    var tx = document.getElementById('tbotones');

    var myBody = document.getElementsByTagName("body")[0];

    var horizont = myBody.scrollHeight;



    if ((myBody.clientHeight - tx.offsetHeight) > horizont)
        x.style.top = myBody.clientHeight - tx.offsetHeight;

    document.onresize = "";

}

function AZ_AjustaScroll(cabecera, divcuer) {
    var dvCuerpo = document.getElementById(divcuer);
    var dvCabecera = document.getElementById(cabecera);

    var areaCliente = dvCuerpo.clientWidth;
    var areaObjeto = dvCuerpo.offsetWidth;

    if (areaCliente < areaObjeto) {
        dvCabecera.style.width = "98.1%";
    }


}

function lanzaEvento(evento) {
    keonEnvioPeticion();
    document.forms[0].evento.value = evento;
    document.forms[0].submit();

}




function validar() {
    var prefix = event.srcElement.name.substr(0, 3);
    prefix.toUpperCase();

    var tecla = event.keyCode;
    var temp = String.fromCharCode(tecla);



    ;
    switch (prefix) {
        case "NUM":
        case "QNU":
        case "POR":
        case "COD":
        case "QTY": //para campos de cantidades

            var includeString = "0123456789";

            if (includeString.indexOf(temp) == -1) {
                event.keyCode = 0;
            } else
                event.srcElement.className = "CampoEntrada";
            break;

        case "FEC":
            var includeString = "0123456789/"




            if (includeString.indexOf(temp) == -1) {
                event.keyCode = 0;
            } else
                event.srcElement.className = "CampoEntrada";

            break;
        case "IMP":
            var includeString = "0123456789."
            if (includeString.indexOf(temp) == -1 || (event.srcElement.value.indexOf(".") != -1 && temp == ".")) {
                event.keyCode = 0;
            } else
                event.srcElement.className = "CampoEntrada";

            break;

        default: //para el resto de campos restringe caracteres especiales
            //Para tipo de campo normal
            var excludeString = "\"\'\\\&<>{}^`:;$#\*%[]=!^\-|";



            var tecla = event.keyCode;
            var temp = String.fromCharCode(tecla);

            if (excludeString.indexOf(temp) != -1) {
                event.keyCode = 0;
            } else
            if (event.srcElement.readOnly != true) event.srcElement.className = "CampoEntrada";

    } //fin switch


}
//Funcion que marca los objetos como Obligatorio

function poner_Obligatorio(objeto) {
    var temp;


    if (objeto == null) {
        //si viene informando nulo es que entra desde evento.
        objeto = event.srcElement;
        //comprueba si tiene una llamada adicional

        for (x = 1; x <= EventList.length - 1; x++) {

            if (EventList[x][0] == objeto.name) {

                eval(EventList[x][1] + "(objeto)");
                break;
            }

        }
    }
    if (objeto.value == "") {
        objeto.className = "CampoObligatorio";


    }
    objeto.onblur = poner_Obligatorio;

}
//Funcion para restringir todos los campos en funcion de su tipo de contenido.

function limitaCampos() {
    try {
        var prefix

        for (x = 0; x <= document.forms[0].elements.length - 1; x++) {

            if ((document.forms[0].elements[x].type == "text" || document.forms[0].elements[x].type == "textarea")) {
                document.forms[0].elements[x].onkeypress = validar;
                prefix = document.forms[0].elements[x].name.substr(0, 3);
                prefix.toUpperCase();

                if (prefix == "FEC") {
                    auxFunction(document.forms[0].elements[x], "Alerta_fecha");
                    document.forms[0].elements[x].onblur = Alerta_fecha;
                }


            }


        }
    } catch (e) {
        alert(e.description);
    }
}

function Alerta_fecha(objeto) {
    if (objeto == null) objeto = event.srcElement;


    if (fechavalida(objeto.value) == false && objeto.value != "") {
        alert("La fecha introducida no es v�lida \n Formato:\"dd/mm/aaaa\"");
        objeto.focus();

    }

}

//Funcion para asignar una funcion adicional al ponerObligatorio;

function auxFunction(objeto, funcion) {

    EventList[EventList.length] = new Array(2);

    EventList[EventList.length - 1][0] = objeto.name;

    EventList[EventList.length - 1][1] = funcion;

}


/******************************************************************************************************************
 * asignaValorCombo, esta funcion se llama desde onchange de los combos.
 * 
 *  PARAMETROS:
 *              oCombo       :     objeto combo modificado
 *              oHdValorCombo:     objeto imput hidden que se actualizar� con el valor seleccionado del combo
 *******************************************************************************************************************/

function asignaValorCombo(oCombo, oHdValorCombo) {

    oHdValorCombo.value = oCombo.value;
}

/*****************************************************************************************************************
 *  Selecciona un valor de una lista desplegable a partir del combo y la opcion.
 *
 *  PARAMETROS:
 *              nombreCombo     -> combo a modificar
 *              codSeleccionado -> codigo del combo seleccionado
 *
 *****************************************************************************************************************/

function seleccionaOpcionCombo(nombreCombo, codSeleccionado) {
    miCombo = eval("document.forms[0]." + nombreCombo);
    miArray = null;
    if (codSeleccionado != null && codSeleccionado != "") {
        for (var i = 0; i < miCombo.length; i++) {
            if (miCombo.options[i].value.indexOf("#") != -1) {
                miArray = miCombo.options[i].value.split("#");
                if (miArray[0] == codSeleccionado) {
                    miCombo.options[i].selected = true;
                }
            } else if (miCombo.options[i].value == codSeleccionado) {
                miCombo.options[i].selected = true;
            }
        }
    } else {
        miCombo.selectedIndex = -1;
    }
}




/*********************************************************************************************************************** 
 * limpiarTabla. Limpia la Tabla (celdas / columnas). Establecen de nuevo el estilo apropiado para cada 
 *               cada registro. Modificada para que trate tablas sin cabecera.
 * Parametros:
 *              idTabla           : Id de la lista (String)
 *              numfilasCabeceras : Numero de filas usadas para la cabecera
 **********************************************************************************************************************/

function limpiarTabla(idTabla, numfilasCabeceras) {
    var objTabla = document.getElementById(idTabla);
    var vEstilosFila = new Array();
    var CPijama = "";
    vEstilosFila[0] = (numfilasCabeceras == 0 ? "Pijama1" : "Pijama2")
    vEstilosFila[1] = (numfilasCabeceras == 0 ? "Pijama2" : "Pijama1")



    for (var i = numfilasCabeceras; i < objTabla.rows.length; i++) {

        if ((i % 2) == 0) CPijama = vEstilosFila[0];
        else CPijama = vEstilosFila[1];



        objFila = objTabla.rows[i];

        for (var j = 0; j < objFila.cells.length; j++) {
            objCelda = objFila.cells[j];

            objCelda.innerHTML = "<td>&nbsp;&nbsp;&nbsp;</td>";
            objCelda.setAttribute(document.all ? "className" : "class", CPijama);
        }
    }

}

/*****************************************************************************************************************
 *  setFoco: Funcion llamada desde selectStart(). Situa el foco en el siguiente campo habilitado.
 *
 *  
 *****************************************************************************************************************/

function setFoco(parObjecto) {
    var encontre = false;

    ns = (document.layers);
    ie = (document.all);

    obj = document.forms[0];

    iMax = obj.elements.length;
    for (i = 0; i < iMax; i++) {
        if (encontre) {
            if (obj.elements[i].type == "select-one" ||
                obj.elements[i].type == "select-multiple" ||
                obj.elements[i].type == "button" ||
                obj.elements[i].type == "radio" ||
                obj.elements[i].type == "checkbox" ||
                obj.elements[i].type == "submit") {
                if (obj.elements[i].disabled == false) {
                    if (obj.elements[i].style.visibility != "hidden") {
                        try {
                            obj.elements[i].focus();
                            break;
                        } catch (e) {}
                    }
                }
            } else if (obj.elements[i].type == "text") {
                if (obj.elements[i].readOnly == false) {
                    if (obj.elements[i].style.visibility != "hidden") {
                        try {
                            obj.elements[i].focus();
                            break;
                        } catch (e) {}
                    }
                }
            }
        }

        if (parObjecto.name == obj.elements[i].name) {
            encontre = true;
        }

    }
}


/*****************************************************************************************************************
 *  selectStart: Funcion llamada desde el evento onFocus. No permite seleccionar un componente de la ventana que este protegido. 
 *
 *  
 *****************************************************************************************************************/

function selectStart(obj) {
    if (obj.readOnly || obj.disabled) {
        obj.onselectstart = new Function("return false");
        setFoco(obj);
    } else {
        obj.onselectstart = new Function("return true");
    }
}


/**************************************************************************************************************
 *  validarCamposAlf, Cadenas de caracteres sin numeros incluidos
 *
 *  PARAMETROS:
 *              
 *              obElem    -> Objeto del campo a validar
 *              flagCampo -> obligatoriedad de Campo ( 1:obligatorio \ 2:opcional ). Flag pasados por Host
 ***************************************************************************************************************/

function validarCamposAlf(obElem, flagCampo) {
    var vCaracteresNA = new Array("'", ">", "<", "%", '"');
    var sCadena = toUpper(obElem.value);
    var bIsOk = false;
    var sMsj = "";

    try {
        if (sCadena.length > 0) {
            // elimina caracteres no aplicables
            for (iInd = 0; iInd < vCaracteresNA.length; iInd++) {
                sCadena = xreplace(sCadena, vCaracteresNA[iInd], '');
            }

            obElem.value = sCadena;
            bIsOk = true;
        }

        // establece aspecto del componente (result_operacion, elemen, obligatorio, tp_dato, mensaje)
        aspectoFinalComp(bIsOk, obElem, (flagCampo == _CAMP_OBLIGATORIO ? true : false), _TP_TEXTO, sMsj);
    } catch (E) {}

    return bIsOk;
}


/******************************************************************************************************************
 * Comprueba si la validacion del valor del campo fu� correcta, asignandole la apariencia en cosecuencia.
 * 
 *  PARAMETROS:
 *              isOk        -> (false: valor incorrecto; true: valor correcto)
 *              objeto      -> campo sobre el que se realizan los cambios
 *              oblig       -> Campo obligatorio (false\true)
 *              tpCampo     -> tipo de campo. (0:num; 1:alfNum,fecha)
 *              mensaje     -> mensaje del error\aviso
 *******************************************************************************************************************/

function aspectoFinalComp(isOk, objeto, oblig, tpCampo, mensaje) {
    // comprueba si el objeto es de Entrada o Salida
    var sInOut = toUpper(objeto.className);
    var sStiloInOut = (sInOut.match("SALIDA") ? "Salida" : "Entrada");

    // Si el campo es correcto llama a la funcion
    //
    if (isOk || Trim(objeto.value) == "") {
        validadoOK(objeto, oblig, tpCampo, sStiloInOut)
    }

    // si el campo NO es opcional y NO est� vacio, llamara la funci�n
    //    
    else
    if (!(!oblig && objeto.value == "")) {
        validadoNOK(objeto, oblig, tpCampo, mensaje, sStiloInOut);
    }
}


/*****************************************************************************************************************
 *  validadoOK: devuelve el aspecto especifico de un campo ok.
 *
 *  PARAMETROS:
 *              cad         -> campo sobre el que se realizan los cambios
 *              oblig       -> Campo obligatorio (false\true)
 *              tpCampo     -> tipo de campo. ( 0:alfNum,fecha - 1:num )
 *              sStiloInOut -> marca el estilo del objeto, Entrada o Salida 
 ******************************************************************************************************************/

function validadoOK(cad, oblig, tpCampo, sStiloInOut) {
    cad.className = "Campo" +
        ((oblig) ? "Obligatorio" : sStiloInOut) +
        ((tpCampo == _TP_NUMERICO) ? "Importe" : "") +
        ((cad.value == "") ? "" : "OK");
}

/******************************************************************************************************************
 *  validadoNOK: devuelve el aspecto especifico de un campo NO ok.
 *
 *  PARAMETROS:
 *              cad         -> campo sobre el que se realizan los cambios
 *              oblig       -> Campo obligatorio (false\true)
 *              tpCampo     -> tipo de campo. (0:num; 1:alfNum,fecha)
 *              mensaje     -> mensaje del error\aviso
 *              sStiloInOut -> marca el estilo del objeto, Entrada o Salida
 *******************************************************************************************************************/

function validadoNOK(cad, oblig, tpCampo, mensaje, sStiloInOut) {

    cad.className = "Campo" +
        ((oblig) ? "Obligatorio" : sStiloInOut) +
        ((tpCampo == _TP_NUMERICO) ? "Importe" : "") +
        ((cad.value == "") ? "" : "Error");
}


/******************************************************************************************************************
 * doKeyPress, controla que lo introducido por teclado se corresponda con el tipo de datos requerido.
 * 
 *  PARAMETROS:
 *              iTpDato    -> Flag n�merico que representa un tipo de dato:
 *                             0.- Numero        2.- Fechas       4.- texto (excluye texto no aplicable)
 *                             1.- Alfanum       3.- Decimal      5.- porcentaje
 *                             6.- importes (incluye n� negativos)7.- numeros(sin puntos ni comas)
 *			       8.- email
 *******************************************************************************************************************/

function doKeyPress(TP_DATO, evento) {
    //var e =window.event 

    var tecla = (document.all) ? window.event.keyCode : evento.which;

    var sCadena = String.fromCharCode(tecla);
    var sPatron = "";

    switch (TP_DATO) {
        case _TP_CIFRA:
            sPatron = /^[0-9]*$/;
            break;
        case _TP_NUMERICO:
            sPatron = /^[.]*[0-9]*$/;
            break;
        case _TP_FECHA:
            sPatron = /^[0-9]*[/]*$/;
            break;
        case _TP_DECIMAL:
            sPatron = /^[.]*[,]*[0-9]*$/;
            break;
        case _TP_TEXTO:
            sPatron = /^["'"^'>'^'<'^'%'^'"'^"`"^"^"^"\\"]+$/;
            break;
        case _TP_PORCIENTO:
            sPatron = /^[,]*[0-9]*$/;
            break;
        case _TP_DECIMAL_NN:
            sPatron = /^[-]*[.]*[,]*[0-9]*$/;
            break;
    }


    // Si es INTRO y buscar est� habilitado llama a la funcion que lanza el evento
    if (tecla == 13 && document.forms[0].BT_BUSCAR != undefined)
        if (!document.forms[0].BT_BUSCAR.disabled) mantenimiento("BUSCAR");

        // si es texto y un caracter no permitido lo elimina
    if ((TP_DATO == _TP_TEXTO && sCadena.search(sPatron) != -1) ||
        (TP_DATO != _TP_TEXTO && sCadena.search(sPatron) == -1))
        tecla = 0;
}

/******************************************************************************************************************
 * toUpper
 *       Dado un string, devuelve la misma cadena de caracteres en mayusculas, eliminando
 *       los espacios a izquierda y derecha.
 *
 *  PARAMETROS:
 *              sCadena   -> cadena de caracteres a poner en mayusculas
 *******************************************************************************************************************/

function toUpper(sCadena) {
    return (Trim(sCadena.toUpperCase()));
}


/******************************************************************************************************************
 * estaVacio,  Valida que la cadena este vacia. Devuelve True si est� vacia.
 *
 *  PARAMETROS:
 *              variable  -> cadena caracteres a testear. 
 *******************************************************************************************************************/

function estaVacio(sValor) {
    return (Trim(sValor) == "");
}

/******************************************************************************************************************
 * Trim       ,  limpia los caracters en blanco por la izquierda y derecha de la cadena
 * Izqdatrim  ,  limpia los caracters en blanco ala izquierda de la cadena
 * Dchatrim   ,  limpia los caracters en blanco a derecha de la cadena
 * ReplaceNBSP,  Sustituye los caracters en blanco propios de html nbsp (NON BREAKING SPACE) por espacios normales
 *
 *  PARAMETROS:
 *              s    -> cadena caracteres a modificar.
 *******************************************************************************************************************/

function Trim(s) {
    var res = Dchatrim(Izqdatrim(s));
    if (res == " ") res = "";
    return res;
}

function Izqdatrim(s) {
    return s.replace(/^\s*/, "");
}

function Dchatrim(s) {
    return s.replace(/\s*$/, "");
}

function ReplaceNBSP(sStr) {
    return (Trim(xreplace(sStr, String.fromCharCode(160), String.fromCharCode(32))));
}

/******************************************************************************************************************
 * xreplace,  reemplaza todas las ocurrencias de un carater pasado por otro tambien pasado por parametro.
 *
 *  PARAMETROS:
 *              sCadena    -> cadena caracteres a modificar.
 *              cCarAntig  -> caracter antiguo a buscar y cambiar.
 *              cCarNuevo  -> nuevo caracter que se reemplazara en la cadena.
 *******************************************************************************************************************/

function xreplace(sCadena, cCarAntig, cCarNuevo) {
    var temp = sCadena;

    var i = temp.indexOf(cCarAntig);

    while (i > -1) {
        // sustituye el caracter
        //
        temp = temp.replace(cCarAntig, cCarNuevo);

        // recupera la siguiente posicion del caracter a sustituir
        //
        i = temp.indexOf(cCarAntig);
    }

    return temp;
}

/** **********************************************************************
 * comprueba que el codigo postal sea valido                                 
 *                                                                           
 * @param oCp C�digo postal                                                  
 * @return  bOblig Indicador de obligatoriedad                              
 *********************************************************************** */
function esCpValido(oCp, bOblig) {
    oCp.value = (oCp.value.length > 0 ? setCerosIzq(oCp.value, 5) : oCp.value);
    var sCp = oCp.value;
    var sPatronCp = new RegExp(/^\d\d\d\d\d$/g);
    var sZona = sCp.substring(0, 2);
    var sArea = sCp.substring(2, 5);
    var bIsOk = false;
    var sMsj = "";

    // comprueba que est� relleno de numeros   
    bIsOk = sPatronCp.exec(sCp);

    // validacion de codigo postal
    bIsOk = (bIsOk && (parseInt(sZona, 10) > 0 && parseInt(sZona, 10) <= 52) &&
        (parseInt(sArea, 10) >= 0 && parseInt(sArea, 10) <= 999));

    if (!bIsOk) sMsj = "C�digo postal err�neo";

    // establece aspecto del componente
    aspectoFinalComp(bIsOk, oCp, bOblig, _TP_NUMERICO, sMsj);

    return bIsOk;
}

/******************************************************************************************************************
 * setCerosIzq, Retorna el parametro con ceros a la izquierda.
 * 
 *  PARAMETROS:
 *              valor    -> valor a modificar
 *              numero   -> cantidad de valores a insertar por la izquierda 
 *******************************************************************************************************************/

function setCerosIzq(valor, numero) {
    var len = valor.length;

    if (len >= numero) return valor;

    var resto = numero - len;

    for (var i = 0; i < resto; i++) {
        valor = "0" + valor;
    }

    return valor;
}

/*****************************************************************************************************************
 *  Inserta el numero de filas vacias indicadas con la anchura por cada columan pasada en el vector.
 *
 *  PARAMETROS:
 *              iTotalFilas        -> N�mero de filas total establecido de la lista (filas a mostrar)
 *              iTotalFilasDatos   -> N�mero total de filas de la tabla con datos (total filas tabla datos).
 *              vectColum          -> Vector con el ancho de cada columna
 *              iFilasxReg         -> N�mero de filas en la tabla por registro de datos. CAMPO NO OBLIGATORIO
 *              iFilasXPagina      -> solo para paginacion x javascript. Numero de registros de cada p�ginacion
 *****************************************************************************************************************/

function insertarFilasEnBlancoDatos(iTotalFilas, iTotalFilasDatos, vectColum, sNomFila, iFilasXPagina, iNumFilasxReg) {

    // si es undefined, es que no se est� pasando este argumento. 
    var iFilasxReg = (iNumFilasxReg == undefined ? 1 : iNumFilasxReg);
    var var_tabla = document.getElementById("tbodyDatos");

    // oculta las filas en blanco insertadas si hay mas filas a visualizar que las que se mostrar� por pantalla.
    var bOcultarFila = (iFilasXPagina != undefined && parseInt(iFilasXPagina) < parseInt(iTotalFilasDatos));
    var resto = iTotalFilasDatos % iTotalFilas;
    var numFilas = iTotalFilas - resto;
    var fila = "";
    var Pijama = "";
    var AuxPijama = "";
    var sNombre = ""

    // Si el numero de filas establecido es menor o igual al numero de filas de la tabla
    // de datos, no ser� necesario insertar nuevas filas vacias. 
    if (parseInt(iTotalFilasDatos) != 0) {
        if (parseInt(iTotalFilasDatos) <= parseInt(numFilas)) return;
    }


    if ((iTotalFilasDatos % 2) == 0) {
        Pijama = "Pijama2";
        AuxPijama = "Pijama1";
    } else {
        Pijama = "Pijama1";
        AuxPijama = "Pijama2";
    }

    for (i = 0; i < parseInt(numFilas); i++) {
        aux = Pijama;
        Pijama = AuxPijama;
        AuxPijama = aux;

        // inserta tantas filas con el mismo estilo por registro como indique iFilasxReg.
        //
        for (iInd = 0; iInd < iFilasxReg; iInd++) {
            // a�ade el nombre a la fila, para poder ocultarla o hacerla visible
            if (sNomFila != undefined) sNombre = sNomFila + (iTotalFilas - (numFilas - i));

            var var_fila = document.createElement("tr");

            var_fila.setAttribute('height', '21');
            var_fila.setAttribute('name', sNombre);
            var_fila.setAttribute('id', sNombre);
            var_fila.setAttribute(document.all ? "className" : "class", Pijama);

            // concatena cada campo del regisrto
            for (indColAux = 0; indColAux < vectColum.length; indColAux++) {
                var var_columna = document.createElement("td");
                var_columna.setAttribute('width', vectColum[indColAux] + '%');
                var_columna.innerHTML = "";
                var_fila.appendChild(var_columna);
            }
            // cierra la fila a�adida a la tabla

        }
        var_tabla.appendChild(var_fila);
    }

}

/******************************************************************************************************************
 * validarFormulario,  Valida que todos los campos del formulario sean correctos
 * 
 *  PARAMETROS:
 *             
 *******************************************************************************************************************/

function validarFormulario() {
    ns = (document.layers);
    ie = (document.all);

    for (j = 0; j < document.forms.length; j++) {
        obj = document.forms[j];

        iMax = obj.elements.length;

        for (m = 0; m < iMax; m++) {
            if (obj.elements[m].className.indexOf("Obligatorio") != -1 && estaVacio(obj.elements[m].value)) {
                textoMensajes(obj.elements[m].label, 0);
                obj.elements[m].focus();

                return false;
            }
            if (obj.elements[m].className.indexOf("Error") != -1) {
                textoMensajes(obj.elements[m].label, 1);
                obj.elements[m].focus();

                return false;
            }
        }
    }
    return true;
}