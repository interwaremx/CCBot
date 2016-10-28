"use strict";

// jsApplication Viewer
// InterWare de Mexico, S.A. de C.V.
// fosorio

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */


var repCtrl = (function () {
	return {
		init: function () {
			$("#fechaInicio").datepicker({
				dateFormat: 'dd/mm/yy',
				monthNames: generalVal.getSpanishMonths(),
				monthNamesShort: generalVal.getSpanishShortMonths(),
				dayNames: generalVal.getSpanishDays(),
				dayNamesMin: generalVal.getSpanishShortDays(),
				prevText: "Anterior",
				nextText: "Siguiente",
				onSelect: function (dateText, datePicker) {
					$("#fechaTermino").prop("disabled", false);
					$("#fechaTermino").datepicker("option", "minDate", dateText);
				}
			});

			$("#fechaTermino").datepicker({
				dateFormat: 'dd/mm/yy',
				monthNames: generalVal.getSpanishMonths(),
				monthNamesShort: generalVal.getSpanishShortMonths(),
				dayNames: generalVal.getSpanishDays(),
				dayNamesMin: generalVal.getSpanishShortDays(),
				prevText: "Anterior",
				nextText: "Siguiente"
			});

			$("#appForm").validate({
				errorElement: "p",
				errorContainer: "#divMessages",
				errorLabelContainer: "#divMessages",
				rules: {
					fechaInicio: {
						required: true
					},
					fechaTermino: {
						required: true
					}
				},
				messages: {
					fechaInicio: {
						required: "No se ha definido un valor para el campo fecha de Inicio."
					},
					fechaTermino: {
						required: "No se ha definido un valor para el campo fecha de Término."
					}
				}
			});
		}
	};
}());

jQuery(document).ready(repCtrl.init);