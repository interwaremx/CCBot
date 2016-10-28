"use strict";

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var confCtrl = (function () {
	// Nombre de la operaci�n principal (se pueden definir m�s).
	var operationNameGC = "guardar configuraci\u00f3n";
	var operationNameRC = "resetear configuraci\u00f3n";

	var guardar = function () {
		var numErrores = 0;
		generalVal.cleanErrors();
		numErrores += generalVal.valRequieredFields(".required");
		if (numErrores == 0) {
			if (generalVal.validateOperation(operationNameGC)) {
				sendConfig(operationNameGC);
			}
		}
	};

	var resetear = function () {
		if (generalVal.validateOperation(operationNameRC)) {
			jQuery(".field").each(function () {
				jQuery(this).val("");
			});
			sendConfig(operationNameRC);
		}
	};

	var sendConfig = function (operationName) {
		generalVal.blockScreen();

		var map = {};
		map.ip = jQuery("#ip").val();
		map.sucursal = {};

		jQuery(".suc").each(function () {
			var element = jQuery(this);
			var app = element.attr("id").split("|");
			map.sucursal[app[1]] = element.val();
		});
		map.appls = {};

		jQuery(".appl").each(function () {
			var element = jQuery(this);
			var app = element.attr("id").split("|");
			if (!(map.appls[app[0]])) {
				map.appls[app[0]] = {};
				map.appls[app[0]].instances = {};
			}
			if (!(map.appls[app[0]].parameters)) {
				map.appls[app[0]].parameters = {};
			}
			map.appls[app[0]].parameters[app[1]] = element.val();

		});

		jQuery(".inst").each(function () {
			var element = jQuery(this);
			var app = element.attr("id").split("|");
			if (!(map.appls[app[0]].instances[app[1]])) {
				map.appls[app[0]].instances[app[1]] = {};
			}
			map.appls[app[0]].instances[app[1]][app[2]] = element.val();
		});

		jQuery.ajax({
			type: "POST",
			url: "/service/sucursal/set-conf",
			data: map,
			dataType: generalVal.getGenDataType(),
			timeout: generalVal.getGenTimeout(),
			error: generalVal.handleAjaxError,
			success: function () {
				generalVal.succesOperation(operationName);
				document.location.reload(true);
			}
		});
	};

	return {
		init: function () {
			jQuery("#guardar").click(guardar);
			jQuery("#resetear").click(resetear);
		}
	};

}());

jQuery(document).ready(confCtrl.init);