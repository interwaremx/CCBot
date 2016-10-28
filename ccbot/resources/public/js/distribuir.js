"use strict";

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var distCtrl = (function() {
  // Nombre de la operaci�n principal (se pueden definir m�s).
  var operationName = "distribuir aplicaciones";
  
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
      
      if (generalVal.validateOperationAndAddMsg(
	operationName,
	generalVal.getTimeAlertMessage(properTimeout))) {
	generalVal.blockScreen();
        
	instMap.apps=[];
	jQuery(".chkapps:checked").each(function(index) {
	  instMap.apps[index] = jQuery(this).val();
	});
        
	jQuery.ajax({
	  type: "POST",
	  url: "/admin/asynch-send-app-to",
	  data: instMap,
	  dataType: generalVal.getGenDataType(),
	  timeout: properTimeout,
	  error: generalVal.handleAjaxError,
          success: generalVal.handleAjaxSuccess  
	  //success: function () {
          //  succesOperation(operationName);
          //}
	});
      }
    }
  };

  var fillInformacion = function(appSenderMap,textMsg,response) {
    var tbl = jQuery("#info-tbl");
    tbl.empty();
    var lst = appSenderMap.lista;
    if (!lst) {
      lst=[];
    }
    var total = appSenderMap.total;
    if (total > 0) {
      tbl.append("<tr><td><h4>Mostrando "+lst.length+"/"+appSenderMap.total+",<h4></td></tr>");
      for (var i=0; i<lst.length; i++) {
        tbl.append("<tr><td>"+lst[i]+"</td></tr>");
      }    
    }
    else {
      tbl.append("<tr><td>No existe informaci&oacute;n en proceso</td></tr>");
    }
  }

  var informacion = function() {
    jQuery.ajax({
      type: "POST",
      url: "/admin/asynch-send-app-to-info",
      dataType: generalVal.getGenDataType(),
      timeout: generalVal.getGenTimeout(),
      error: generalVal.handleAjaxError,
      success: fillInformacion  
    });
  };
  
  return {
    init: function() {
      jQuery("#div-distribuir #chkApps").click(function (){checkAll(".chkapps","#chkApps")});
      jQuery("#div-distribuir #chkNodes").click(function (){checkAll(".chknodes","#chkNodes")});
      jQuery("#div-distribuir #distribuir").click(distribuir);
      jQuery("#div-distribuir #info-btn").click(informacion);
      
      $.contextMenu({
        selector: '.IMGof a',
	trigger: "left",
        items: {
          "refreshRobotStatus": {
	    name: "Actualizar Estatus",
	    icon: "refresh",
	    callback: function(key, options) {
	      rstatus.status(options.$trigger);
	    }},
	  "sep1": "---------",
	  "viewRobot": {
	    name: "Ver Robot",
	    icon: "view",
	    callback: function(key, options) {
	      var url = jQuery(options.$trigger).parent().children("input").prop("value");
	      window.open(url +  "/viewcbot");
	    }},
          "startRobot": {
	    name: "Iniciar Robot",
	    icon: "start",
	    callback: function(key, options) {
	      rstatus.start(options.$trigger);
	    }},
          "stopRobot": {
	    name: "Detener Robot",
	    icon: "stop",
	    callback: function(key, options) {
	      rstatus.stop(options.$trigger);
	    }},
          "sep2": "---------",
          "installRobot": {
            name: "Instalar",
	    icon: "install",
            callback: function(key, options) {
	      rstatus.install(options.$trigger);
            }}
        }
      });
    } 
  };
  
}());

jQuery(document).ready(distCtrl.init);
