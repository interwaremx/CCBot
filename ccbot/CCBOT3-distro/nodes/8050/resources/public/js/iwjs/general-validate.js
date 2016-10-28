var generalVal = (function () {
	// Id de mensajes de error.
	var divMessagesId = "#divMessages";

	// Mensaje de confirmaci�n de operaci�n.
	var msgConfirmOperation = "\u00BFDesea ejecutar la operaci\u00f3n: #opName?";
	// Mensaje de �xito en operaci�n.
	var msgSuccesOperation = "\u00A1La operaci\u00f3n: #opName se ha ejecutado con \u00e9xito\u0021";
	// Mensaje de error de selecci�n de opciones tanto para checkbox como para combobox.
	var msgErrorSeleccion = "No se ha seleccionado ninguna de las opciones de: #objName!";
	// Mensaje de error por lista de campos requeridos.
	var msgErrorRequiredFields = "No se han definido valores para los campos marcados!";

	// Llave de nombre de operaci�n sustituible en mensaje de confirmaci�n de operaci�n.
	var opNameKey = "#opName";
	// Llave de nombre de objeto sustituible en mensaje de error de selecci�n de opciones.
	var objNameKey = "#objName";

	var classErrorRequiredFields = "errorRequiredFields";

	// Expresi�n regular para url.
	var ipRegExp = /^\bhttp\:\/\/(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])\:([0-9]{2,5})$/i;
	var mailRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

	// Timeout gen�rico para peticiones as�ncronas.
	var genTimeout = 10000;
	// Timeout gen�rico para peticiones as�ncronas.
	var genDataType = "json";

	// Funci�n para obtener la expresi�n regular de ip, con fines de validaci�n.
	var getIpRegExp = function () {
		return ipRegExp;
	};

	// Funci�n para obtener la expresi�n regular de ip, con fines de validaci�n.
	var getMailRegExp = function () {
		return mailRegExp;
	};

	// Funci�n para obtenci�n de timeout gen�rico para peticiones as�ncronas.
	var getGenTimeout = function () {
		return genTimeout;
	}

	// Funci�n para obtenci�n de timeout gen�rico para peticiones as�ncronas.
	var getGenDataType = function () {
		return genDataType;
	}

	// Funci�n para validaci�n de operaci�n mediante confirm.
	var validateOperation = function (opName) {
		return confirm(msgConfirmOperation.replace(opNameKey, opName));
	};

	// Funci�n para validaci�n de operaci�n mediante confirm.
	var validateOperationAndAddMsg = function (opName, msg) {
		return confirm(msgConfirmOperation.replace(opNameKey, opName) + msg);
	};

	// Funci�n para validaci�n de operaci�n mediante confirm y bloquear pantalla.
	var validateOperationAndBlockScreen = function (opName) {
		if (validateOperation(opName)) {
			generalVal.blockScreen();
			return true;
		}

		return false;
	};

	// Funci�n para confirmaci�n de operaci�n por alert.
	var succesOperation = function (opName) {
		unblockScreen();
		//alert(msgSuccesOperation.replace(opNameKey, opName));
	};

	// Funci�n para validaci�n de opciones de checkboxes por clase asociada al grupo.
	var valCheckSelected = function (className, objName) {
		var checked = ":checked";
		var total = 0;

		jQuery(className + checked).each(function (index) {
			total++;
		});

		if (total == 0) {
			createError(msgErrorSeleccion.replace(objNameKey, objName));
			return 1;
		}

		return 0;
	};

	// Funci�n para validaci�n de opciones de combo.
	var valComboSelected = function (objId, objName) {
		if (jQuery(objId).val() == "") {
			createError(msgErrorSeleccion.replace(objNameKey, objName));
			return 1;
		}

		return 0;
	};

	// Funci�n para validaci�n de opciones de checkboxes por clase asociada al grupo.
	var valRequieredFields = function (className) {
		var total = 0;

		jQuery(className).each(function (index) {
			var field = $(this);
			if (field.val() != null && field.val() != "") {
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

	// Funci�n para eliminaci�n de errores (lista completa).
	var cleanErrors = function () {
		//document.getElementById(divMessagesId).innerHTML = "";
		jQuery(divMessagesId).html("");
	};

	// Funci�n para creaci�n de error en div asociado.
	var createError = function (errorMsg) {
		//document.getElementById(divMessagesId).innerHTML += errorMsg;
		jQuery(divMessagesId).append("<p>" + errorMsg + "</p>");
	};

	// Funci�n para manejar errores ajax.
	var handleAjaxError = function (xmlhttprequest, textStatus, message) {
		var errorMsg = (textStatus != null ? (textStatus + " : ") : "") + message + "! " + xmlhttprequest.responseText;
		createError(errorMsg);
		unblockScreen();
	};

	// Funci�n que bloquea la pantalla.
	var blockScreen = function () {
		$.blockUI({
			css: {
				border: 'none',
				padding: '15px',
				backgroundColor: '#000',
				'-webkit-border-radius': '10px',
				'-moz-border-radius': '10px',
				opacity: .5,
				color: '#fff'
			},
			message: "Procesando..."
		});
	};

	// Funci�n que desbloquea la pantalla..
	var unblockScreen = function () {
		$.unblockUI();
	};

	return {
		"getIpRegExp": getIpRegExp,
		"getMailRegExp": getMailRegExp,
		"getGenTimeout": getGenTimeout,
		"getGenDataType": getGenDataType,
		"validateOperation": validateOperation,
		"validateOperationAndAddMsg": validateOperationAndAddMsg,
		"validateOperationAndBlockScreen": validateOperationAndBlockScreen,
		"succesOperation": succesOperation,
		"valCheckSelected": valCheckSelected,
		"valComboSelected": valComboSelected,
		"valRequieredFields": valRequieredFields,
		"cleanErrors": cleanErrors,
		"createError": createError,
		"handleAjaxError": handleAjaxError,
		"blockScreen": blockScreen,
		"unblockScreen": unblockScreen
	};
})();