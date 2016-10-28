"use strict";

/*jslint
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var activaCtrl = (function () {
	// Nombre de la operaci�n principal (se pueden definir m�s).
	var operationName = "activar instancias";

	var reload = function () {
		var applMap = {};

		jQuery(".inst-onfly").remove();
		applMap.appl = jQuery("#appl").val();

		if (applMap.appl != "") {
			generalVal.blockScreen();
			$("#chkInstancias").removeAttr("disabled");
			jQuery.ajax({
				type: "GET",
				url: "/service/activar",
				data: applMap,
				dataType: generalVal.getGenDataType(),
				timeout: generalVal.getGenTimeout(),
				error: generalVal.handleAjaxError,
				success: reloadPage
			})
		} else {
			$("#chkInstancias").attr("disabled", 'disabled');
		}
	};

	var reloadPage = function (resp) {
		if (resp === null) {
			jQuery(".inst-onfly").remove();
			generalVal.unblockScreen();
			alert("\u00A1No se encontraron instancias asociadas a la aplicaci\u00f3n\u0021");
			return;
		}
		jQuery.each(resp, function (index) {
			jQuery("#instancias-tr").after("<tr width=\"100%\" class=\"inst-onfly\"><td width=\"5%\" style=\"border-bottom:solid 1px #E6E6E6;\"><input id=\"" + resp[index] + "\" type=\"checkbox\" class=\"chkinstancias\" value=\"" + resp[index] + "\"/></td><td width=\"95%\" style=\"border-bottom:solid 1px #E6E6E6;\">" + resp[index] + "</td></tr>");
		});
		generalVal.unblockScreen();
	};

	var checkAll = function (clase, idCheck) {
		jQuery(clase).each(function () {
			jQuery(this).prop("checked", jQuery(idCheck).prop("checked"));
		});
	};

	var actualiza = function () {
		var numErrores = 0;
		generalVal.cleanErrors();
		numErrores += generalVal.valComboSelected("#appl", "aplicaci&oacute;n");
		numErrores += generalVal.valCheckSelected(".chknodes", "nodo");
		if (numErrores == 0) {
			var properTimeout = 0;
			var numNodes = 0;
			var instMap = {};

			instMap.ips = [];
			jQuery(".chknodes:checked").each(function (index) {
				numNodes++;
				instMap.ips[index] = jQuery(this).val();
			});

			properTimeout = (parseInt(numNodes) * parseInt(generalVal.getGenTimeout()));

			if (generalVal.validateOperationAndAddMsg(operationName, " Esta operaci\u00f3n pude tardar hasta " + properTimeout + "ms.")) {
				generalVal.blockScreen();

				instMap.apps = {};
				instMap.apps[jQuery("#div-activar #appl").val()] = [];

				jQuery(".chkinstancias:checked").each(function (index) {
					instMap.apps[jQuery("#div-activar #appl").val()][index] = jQuery(this).val();
				});

				if (instMap.apps[jQuery("#div-activar #appl").val()].length == 0) {
					instMap.apps[jQuery("#div-activar #appl").val()][0] = "-";
				}

				jQuery.ajax({
					type: "POST",
					url: "/admin/set-rts-of",
					data: instMap,
					dataType: generalVal.getGenDataType(),
					timeout: properTimeout,
					error: generalVal.handleAjaxError,
					success: function () {
						generalVal.succesOperation(operationName);
					}
				});
			}
		}
	};

	var showConfig = function () {
		var numErrores = 0;
		generalVal.cleanErrors();
		numErrores += generalVal.valComboSelected("#appl", "aplicaci&oacute;n");
		if (numErrores == 0) {
			generalVal.blockScreen();
			var map = {};

			map.ip = jQuery(this).attr("id");
			map.appl = jQuery("#div-activar #appl").val();
			jQuery.ajax({
				type: "GET",
				url: "/admin/get-rts-of",
				data: map,
				dataType: generalVal.getGenDataType(),
				timeout: generalVal.getGenTimeout(),
				error: generalVal.handleAjaxError,
				success: function (resp) {
					jQuery(".chkinstancias").each(function () {
						jQuery(this).prop("checked", false);
					});
					jQuery(resp).each(function () {
						jQuery("#" + this).prop("checked", true);
					});
					generalVal.succesOperation(operationName);
				}
			});
		}
	};

	return {
		init: function () {
			jQuery("#div-activar #appl").change(reload);
			jQuery("#div-activar #chkInstancias").click(function () {
				checkAll(".chkinstancias", "#chkInstancias")
			});
			jQuery("#div-activar #chkNodes").click(function () {
				checkAll(".chknodes", "#chkNodes")
			});
			jQuery("#div-activar #actualizar").click(actualiza);
			jQuery("#div-activar .hrefConfig").click(showConfig)
			$(".IMGof a").click(rstatus.clickStatus);

		}
	};
}());

jQuery(document).ready(activaCtrl.init);