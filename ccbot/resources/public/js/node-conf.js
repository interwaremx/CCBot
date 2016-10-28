"use strict";

// jsApplication Viewer
// InterWare de Mexico, S.A. de C.V.
// Felipe Gerard

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */

var nodeConfCtrl = (function() {
  // Nombre de la operación principal (se pueden definir más).
  var operationName = "guardar par\u00e1metros de nodo";
  var conf = {};

  var localUUID = function() {
    return Raphael.createUUID();
  };

  var extractParams = function(tagId) {
    var pars={"-": "-"};
    var esKey=true;
    var kv=[];
    var mal=false;
    $(tagId).find("input").each(function() {
		kv.push($(this).val());
		if (!esKey) {
		  pars[kv[0]]=kv[1];
		  if (kv[0].indexOf(":")>=0) mal=true;
		  kv=[];
		}
		esKey=!esKey;
    });
    if (mal) {
      return null;    	
    }
    else {
      return pars;
    }
  };

  var attachDelete = function(uuid) {
    return function() {
      $("#"+uuid).parent().parent().remove();
    };
  };

  var setParameters = function(tagId, data) {
    var name;
    var names = new Array();
    for (name in data) {
      if (data.hasOwnProperty(name)) {
        names.push(name);
      }
    }
    names.sort();
    for (var i=0; i< names.length; i++) {
      name=names[i];
      if (data.hasOwnProperty(name)) {
        var uuid=localUUID();
        jQuery(tagId).append('<tr class=\"dynamic\">'+
			//'<td><input type=\"button\" id='+uuid+' class=\"button\" value=\"Borrar\"/></td>'+
			'<td align=\"center\"><a id='+uuid+'><img src=\"/images/node/delete.png\"/></a></td>'+
			'<td><input type=\"text\" maxlength=\"30\" value=\"'+name+'\" style=\"width: 97%;\" class=\"required field\"/></td>'+
			'<td><input type=\"text\" maxlength=\"100\" value=\"'+data[name]+'\" style=\"width: 97%;\" class=\"required field\"/></td>'+
			'</tr>');
        jQuery("#"+uuid).click(attachDelete(uuid));
      }
    }
  };

  var addParameterInit = function() {
    var uuid=localUUID();
    jQuery("#content-app #parameters").append('<tr class=\"dynamic\">'+
		//'<td><input type=\"button\" id='+uuid+' class=\"button\" value=\"Borrar\"/></td>'+
		'<td align=\"center\"><a id='+uuid+'><img src=\"/images/node/delete.png\"/></a></td>'+
		'<td><input type=\"text\" maxlength=\"30\" style=\"width: 97%;\" class=\"required field\"/></td>'+
		'<td><input type=\"text\" maxlength=\"100\" style=\"width: 97%;\" class=\"required field\"/></td>'+
		'</tr>');
    jQuery("#"+uuid).click(function () {
      $("#"+uuid).parent().parent().remove();
    });
  };

  var saveRobotNodeConf = function() {
	var numErrores = 0;
	generalVal.cleanErrors();
	numErrores += generalVal.valRequieredFields(".required");

	if (numErrores == 0) {
		if (generalVal.validateOperation(operationName)) {
		  generalVal.blockScreen();	
			var nodePars=extractParams("#content-app #parameters");
			conf = nodePars;

			jQuery.ajax({
				type: "POST",
				url: "/store/set-node-conf",
				data: {"parameters" : conf},
				dataType: generalVal.getGenDataType(),
				timeout: generalVal.getGenTimeout(),
				error: generalVal.handleAjaxError,
				success: function() {
				  generalVal.succesOperation(operationName);
				  location.href="/node";
				}
			  });
		}
	}
  };

  var fillNodeInfo = function(zconf) {
    conf=zconf;
    setParameters("#content-app #parameters", conf);
	generalVal.unblockScreen();
  };
  
  var cancel = function() {
	location.href="/node";
  };

  return {
    init: function() {
      jQuery("#content-app #add-p-btn").click(addParameterInit);
      jQuery("#content-app #save-node-conf").click(saveRobotNodeConf);
      jQuery("#content-app #cancel").click(cancel);

      generalVal.blockScreen();
      jQuery.ajax({
        url: "/store/get-node-conf",
        dataType: generalVal.getGenDataType(),
		timeout: generalVal.getGenTimeout(),
		error: generalVal.handleAjaxError,
        success: fillNodeInfo
      });
    } 
  };

}());

jQuery(document).ready(nodeConfCtrl.init);
