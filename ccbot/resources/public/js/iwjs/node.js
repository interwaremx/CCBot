"use strict";

// jsApplication Viewer
// InterWare de Mexico, S.A. de C.V.
// Felipe Gerard

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */

var sucCtrl = (function() {
  // Nombres de las operaciones principales (se pueden definir más).
  var operationNameAS = "actualizar nodo";
  var operationNameCS = "crear nodo";
  
  var saveSuc = function() {
	if (generalVal.validateOperation(operationNameCS)) {
		generalVal.blockScreen();
		
		var info={};
		info.ip=jQuery("#suc-ip").val();
		info.cr=jQuery("#suc-cr").val();
		info.suc=jQuery("#suc-suc").val();
		
		jQuery.ajax({
		  type: "POST",
		  url: "/service/sucursal",
		  data: info,
		  dataType: generalVal.getGenDataType(),
		  timeout: generalVal.getGenTimeout(),
		  error: generalVal.handleAjaxError,
		  success: function () {
			generalVal.succesOperation(operationNameCS);
		  }
		});
	}
  };

  var cancela = function() {
    document.location.href="/";
  };

  return {
    init: function() {
      jQuery("#div-sucursal #opSuc").click(saveSuc);
      jQuery("#div-sucursal #cancela").click(cancela);
      
      jQuery.validator.addMethod("ipformat", function(value, element, params) {
        return this.optional(element) || params.test(value);
      }, "El formato de URL es incorrecto!");
	  
      $("#appForm").validate({
        errorElement: "p",
       	errorContainer: "#divMessages",
    	errorLabelContainer: "#divMessages",
		rules: {
          ip: {required: true,
               ipformat: generalVal.getIpRegExp()},
		  cr: {required: true}
        },
        messages: {
          ip: {required: "No se ha definido un valor para el campo URL!"},
          cr: {required: "No se ha definido un valor para el campo CR!"}
        }
      });
    }
  };
}());

jQuery(document).ready(sucCtrl.init);
