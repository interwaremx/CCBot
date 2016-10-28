"use strict";

// InterWare de Mexico, S.A. de C.V.

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */

var sucsCtrl = (function() {
  // Nombres de las operaciones principales (se pueden definir más).
  var operationNameIR = "iniciar robot";
  var operationNameDR = "detener robot";
  var operationNamePC = "obtener estatus robot";

  return {
    init: function() {
      $.contextMenu({
        selector: '.IMGof a',
	trigger: "left",
        items: {
          "refreshRobotStatus": {
	    name: "Actualizar Estatus",
	    icon: "refresh",
	    callback: function(key, options) {
	      rstatus.status(options.$trigger);
	    }
          },
	  "sep1": "---------",
	  "viewRobot": {
            name: "Ver Robot",
	    icon: "view",
	    callback: function(key, options) {
	      var url = jQuery(options.$trigger).parent().children("input").prop("value");
	      window.open(url +  "/viewcbot");
	    }
          },
          "startRobot": {
	    name: "Iniciar Robot",
	    icon: "start",
	    callback: function(key, options) {
	      rstatus.start(options.$trigger);
	    }
          },
          "stopRobot": {
	    name: "Detener Robot",
	    icon: "stop",
	    callback: function(key, options) {
	      rstatus.stop(options.$trigger);
	    }
          },
          "sep2": "---------",
          "installRobot": {
            name: "Instalar", 
	    icon: "install",
            callback: function(key, options) {
	      rstatus.install(options.$trigger);
            }
          }
        }
      });
    }
  };
}());

jQuery(document).ready(sucsCtrl.init);
