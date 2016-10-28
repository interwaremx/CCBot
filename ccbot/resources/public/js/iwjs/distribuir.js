"use strict";

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var distCtrl = (function() {
  // Nombre de la operación principal (se pueden definir más).
  var operationName = "distribuir configuraci\u00f3n";
  
  var checkAll = function(clase, idCheck) {
	  jQuery(clase).each(function() {
		  jQuery(this).prop("checked", jQuery(idCheck).prop("checked"));
	  });
  };
   
  var distribuir = function () {
  	var numErrors = 0;
  	generalVal.cleanErrors();
  	numErrors += generalVal.valCheckSelected(".chkapps", "aplicaci&oacute;n");
  	numErrors += generalVal.valCheckSelected(".chknodes", "nodo");
  
  	if (numErrors == 0) {
		var instMap={};
		var properTimeout = 0;
		var numNodes = 0;
		
		instMap.ips=[];
		jQuery(".chknodes:checked").each(function(index) {
			numNodes++;
			instMap.ips[index] = jQuery(this).val();
		});
		properTimeout = (parseInt(numNodes) * parseInt(generalVal.getGenTimeout()));
		
  		if (generalVal.validateOperationAndAddMsg(operationName, " Esta operaci\u00f3n pude tardar hasta "+properTimeout+"ms.")) {
		  generalVal.blockScreen();

		  instMap.apps=[];
		  jQuery(".chkapps:checked").each(function(index) {
			  instMap.apps[index] = jQuery(this).val();
		  });

		  jQuery.ajax({
			type: "POST",
			url: "/admin/send-app-to",
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
  
  return {
    init: function() {
      jQuery("#div-distribuir #chkApps").click(function (){checkAll(".chkapps","#chkApps")});
      jQuery("#div-distribuir #chkNodes").click(function (){checkAll(".chknodes","#chkNodes")});
      jQuery("#div-distribuir #distribuir").click(distribuir);
      $(".IMGof a").click(rstatus.clickStatus);
    } 
  };
  
}());

jQuery(document).ready(distCtrl.init);
