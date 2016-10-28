"use strict";

/*jslint
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var userCtrl = (function () {
	// Nombre de la operaci�n principal (se pueden definir m�s).
	var operationName = "actualizar usuarios";

	var checkAll = function (clase, idCheck) {
		jQuery(clase).each(function () {
			jQuery(this).prop("checked", jQuery(idCheck).prop("checked"));
		});
	};

	var actualiza = function () {
		var numErrores = 0;
		generalVal.cleanErrors();
		numErrores += generalVal.valCheckSelected(".users-active", "usuario activo");
		if (numErrores == 0) {
			if (generalVal.validateOperation(operationName)) {
				generalVal.blockScreen();
				var map = {};
				map.users = [];

				jQuery(".users-active:checked").each(function (index) {
					map.users[index] = $(this).prop("value");
				});

				jQuery.ajax({
					type: "POST",
					url: "/admin/users-put",
					data: map,
					dataType: generalVal.getGenDataType(),
					timeout: generalVal.getGenTimeout(),
					error: generalVal.handleAjaxError,
					success: function () {
						generalVal.succesOperation(operationName);
					}
				});
			}
		}
	};

	return {
		init: function () {
			jQuery("#actualiza").click(actualiza);
			jQuery("#chkUsers").click(function () {
				checkAll(".users-active", "#chkUsers")
			});
		}
	};
}());

jQuery(document).ready(userCtrl.init);