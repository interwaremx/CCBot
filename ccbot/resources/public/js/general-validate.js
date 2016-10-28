var generalVal = (function () {
	// Id de mensajes de error.
	var divMessagesId = "#divMessages";
	
	// Mensaje de confirmaci���n de operaci���n.
	var msgConfirmOperation = "\u00BFDesea ejecutar la operaci\u00f3n: #opName?";
	// Mensaje de ���xito en operaci���n.
	var msgSuccesOperation = "\u00A1La operaci\u00f3n: #opName se ha ejecutado con \u00e9xito\u0021";
	// Mensaje de error de selecci���n de opciones tanto para checkbox como para combobox.
	var msgErrorSeleccion = "No se ha seleccionado ninguna de las opciones de: #objName!";
	// Mensaje de error por lista de campos requeridos.
	var msgErrorRequiredFields = "No se han definido valores aceptables para los campos marcados!";
	// Mensaje de error por lista de campos requeridos.
	var msgTimeAlert = " Esta operaci\u00f3n puede tardar hasta #time s.";
	
	// Array de nombres de meses en espa���ol.
	var spanishMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	// Array de nombres cortos de meses en espa���ol.
	var spanishShortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
	// Array de nombres de d���as en espa���ol.
	var spanishDays = ["Lunes", "Martes", "Mi&eacute;rcoles", "Jueves", "Viernes", "S&aacute;bado", "Domingo"];
	// Array de nombres cortos de d���as en espa���ol.
	var spanishShortDays = ["Dom", "Lun", "Mar", "Mi&eacute;", "Jue", "Vie", "S&aacute;b"];
	
	// Llave de nombre de operaci���n sustituible en mensaje de confirmaci���n de operaci���n.
	var opNameKey = "#opName";
	// Llave de nombre de objeto sustituible en mensaje de error de selecci���n de opciones.
	var objNameKey = "#objName";
	// Llave de tiempo de ejecuci���n.
	var timeKey = "#time";
	
	var classErrorRequiredFields = "errorRequiredFields";
	
	// Expresi���n regular para url.
	//var ipRegExp = /^\bhttp\:\/\/(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\:([0-9]{2,5})$/i;
	// FGC la cambio a la que sigue 
	//var ipRegExp = /^\bhttps?\:\/\/[0-9a-zA-Z\-\._]+\:([0-9]{2,5})(\/[0-9a-zA-Z]+\-[0-9a-zA-Z]+\-[0-9a-zA-Z]+\-[0-9a-zA-Z]+\-[0-9a-zA-Z]+)?$/i;
	var ipRegExp = /^\bhttps?\:\/\/[0-9a-zA-Z\-\._]+\:([0-9]{2,5})$/i;

	//var ipRegExp = /^\bhttps?\:\/\/[0-9a-zA-Z\-\._]+\:([0-9]{2,5})$/i;
	var ipSimpleRegExp=/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/i;
	// Expresi��n regular para mail.
	var mailRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    // Expresi��n regular para lista de mails separados por comas.
    var mailListRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?((,\s?)[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?)*$/i;
	
        // -._������������������������������������������
        var paramRegExp = /^[A-Za-z0-9\u002d'u002e\u005f\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1\u00d1]+$/;

        var integerRegExp = /^[0-9]+$/i;

        var regExp = {"integer": integerRegExp,
                      "cljkeyword": paramRegExp};

	// Timeout gen���rico para peticiones as���ncronas.
	var genTimeout = 30000;
	// Timeout gen���rico para peticiones as���ncronas.
	var genDataType = "json";
	
	// Funci���n para obtener el arrays de nombres de meses en espa���ol.
	var getSpanishMonths = function () {
		return spanishMonths;
	};
	
	// Funci���n para obtener el array de nombres cortos de meses en espa���ol.
	var getSpanishShortMonths = function() {
		return spanishShortMonths;
	};
	
	// Funci���n para obtener el array de nombres de d���as en espa���ol.
	var getSpanishDays = function() {
		return spanishDays;
	};
	
	// Funci���n para obtener el array de nombres cortos de d���as en espa���ol.
	var getSpanishShortDays = function() {
		return spanishShortDays;
	};
	
	// Funci���n para obtener la expresi���n regular de ip, con fines de validaci���n.
	var getIpRegExp = function() {
		return ipRegExp;
	};
	
	var getIpSimpleRegExp = function(){
		return ipSimpleRegExp;
	};
	
	// Funci���n para obtener la expresi���n regular de ip, con fines de validaci���n.
	var getMailRegExp = function() {
		return mailRegExp;
	};
	
	// Funci��n para obtener la expresi��n regular de lista de emails.
	var getMailListRegExp = function() {
		return mailListRegExp;
	};

        var getParamRegExp = function() {
          return paramRegExp;
        };
	var getIntegerRegExp = function() {
          return integerRegExp;
        };

	// Funci���n para obtenci���n de timeout gen���rico para peticiones as���ncronas.
	var getGenTimeout = function () {
		return genTimeout;
	}
	
	// Funci���n para obtenci���n de timeout gen���rico para peticiones as���ncronas.
	var getGenDataType = function () {
		return genDataType;
	}
	
	// Funci���n para obtenci���n de mensaje de tiempo (ya convertido).
	var getTimeAlertMessage = function (time) {
		return msgTimeAlert.replace(timeKey, time/1000);
	};
	
	// Funci���n para validaci���n de operaci���n mediante confirm.
	var validateOperation = function (opName) {
		return confirm(msgConfirmOperation.replace(opNameKey, opName));
	};
	
	// Funci���n para validaci���n de operaci���n mediante confirm.
	var validateOperationAndAddMsg = function (opName, msg) {
		return confirm(msgConfirmOperation.replace(opNameKey, opName) + msg);
	};
	
	// Funci���n para validaci���n de operaci���n mediante confirm y bloquear pantalla.
	var validateOperationAndBlockScreen = function (opName) {
		if (validateOperation(opName)) {
			generalVal.blockScreen();
			return true;
		}
	
		return false;
	};
	
	// Funci���n para confirmaci���n de operaci���n por alert.
	var succesOperation = function (opName) {
		unblockScreen();
		//alert(msgSuccesOperation.replace(opNameKey, opName));
	};

	// Funci���n para validaci���n de opciones de checkboxes por clase asociada al grupo.
	var valCheckSelected = function (className, objName) {
		var checked = ":checked";
		var total = 0;
		
		jQuery(className + checked).each(function(index) {
			total++;
		});
		
		if (total == 0) {
			createError(msgErrorSeleccion.replace(objNameKey, objName));
			return 1;
		}
		
		return 0;
	};

	// Funci���n para validaci���n de opciones de combo.
	var valComboSelected = function (objId, objName) {
		if (jQuery(objId).val() == "") {
			createError(msgErrorSeleccion.replace(objNameKey, objName));
			return 1;
		}
		
		return 0;
	};
	
	// Funci���n para validaci���n de opciones de checkboxes por clase asociada al grupo.
	var valRequieredFields = function (className) {
		var total = 0;
		
		jQuery(className).each(function (index) {
			var field = $(this);
			if (field.val() != null && field.val() != "") {  //&&paramRegExp.test(field.val())
				field.removeClass(classErrorRequiredFields);
			} else {
				field.addClass(classErrorRequiredFields);
				total++;
			}
		});
		
		if (total > 0) {
			createError(msgErrorRequiredFields);
			return 1;
		}
		
		return 0;
	};

	// Funci���n para validaci���n de opciones de checkboxes por clase asociada al grupo.
	var valFields = function (className,regExpName) {
		var total = 0;
		
		jQuery(className).each(function (index) {
			var field = $(this);
			if (field.val() != null && field.val() != "" && regExp[regExpName].test(field.val())) {  
				field.removeClass(classErrorRequiredFields);
			} else { 
				field.addClass(classErrorRequiredFields);
				total++;
			}
		});
		
		if (total > 0) {
			createError(msgErrorRequiredFields);
			return 1;
		}
		
		return 0;
	}

	// Funci���n para eliminaci���n de errores (lista completa).
	var cleanErrors = function () {
		//document.getElementById(divMessagesId).innerHTML = "";
		jQuery(divMessagesId).html("");
	};

	// Funci���n para creaci���n de error en div asociado.
	var createError = function (errorMsg) {
		//document.getElementById(divMessagesId).innerHTML += errorMsg;
		jQuery(divMessagesId).append("<p>" + errorMsg + "</p>");
	};
	
	// Funci���n para manejar errores ajax.
	var handleAjaxError = function (xmlhttprequest, textStatus, message) {
	  var errorMsg = (textStatus != null ? (textStatus + " : ") : "") + message + "! "+ xmlhttprequest.responseText;
		createError(errorMsg);
		unblockScreen();
	};

        var handleAjaxSuccess = function (msg, textStatus, resp) {
	  createError(msg);
	  unblockScreen();
	}
	
	// Funci���n que bloquea la pantalla.
	var blockScreen = function () {
		$.blockUI({ css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff'
        }, message: "Procesando..." });
	};
	
	// Funci���n que desbloquea la pantalla..
	var unblockScreen = function () {
		$.unblockUI();
	};

	return {
		"getSpanishMonths": getSpanishMonths,
		"getSpanishShortMonths": getSpanishShortMonths,
		"getSpanishDays": getSpanishDays,
		"getSpanishShortDays": getSpanishShortDays,
		"getIpRegExp": getIpRegExp,
		"getMailRegExp": getMailRegExp,
		"getMailListRegExp": getMailListRegExp,
		"getGenTimeout": getGenTimeout,
		"getGenDataType": getGenDataType,
		"getTimeAlertMessage": getTimeAlertMessage,
		"validateOperation": validateOperation,
		"validateOperationAndAddMsg": validateOperationAndAddMsg,
		"validateOperationAndBlockScreen": validateOperationAndBlockScreen,
		"succesOperation": succesOperation,
		"valCheckSelected": valCheckSelected,
		"valComboSelected": valComboSelected,
		"valRequieredFields": valRequieredFields,
                "valFields": valFields,
		"cleanErrors": cleanErrors,
		"createError": createError,
		"handleAjaxError": handleAjaxError,
                "handleAjaxSuccess": handleAjaxSuccess,
		"blockScreen": blockScreen,
		"unblockScreen": unblockScreen,
		"getIpSimpleRegExp":getIpSimpleRegExp
	};
})();
