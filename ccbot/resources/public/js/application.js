"use strict";

// jsApplication Viewer
// InterWare de Mexico, S.A. de C.V.
// Felipe Gerard

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */

var appCtrl = (function() {
  // Nombre de la operación principal (se pueden definir más).
  var operationNameSA = "guardar par&aacute;metros de aplicaci&oacute;n";
  var operationNameDA = "eliminar aplicaci&oacute;n";
  var NAPP = "Nueva...";
  var NV = "desconocido";
  var app = NV;
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

  var setParameters = function(tagId,data) {
    var name;
    var names = new Array();
    for (name in data) {
      if (data.hasOwnProperty(name)) {
        names.push(name);
      }
    }
    names.sort();
    for (var i=0; i<names.length; i++) {
      name=names[i];
      if (data.hasOwnProperty(name)) {
        var uuid=localUUID();
        jQuery(tagId).append('<tr class=\"dynamic\">'+
		//'<td width=\"5%\"><input type="button" id='+uuid+' class="button" value="Borrar"/></td>'+
		'<td width=\"5%\" align=\"center\"><a id='+uuid+'><img src=\"/images/node/delete.png\"/></a></td>'+
		'<td width=\"20%\"><input type=\"text\" maxlength=\"30\" value=\"'+name+'\" style=\"width: 97%;\" class=\"required field cljkeyword\"/></td>'+
		'<td width=\"75%\"><input type=\"text\" maxlength=\"1000\" value=\"'+data[name]+'\" style=\"width: 97%;\"/ class=\"required field\"/></td>'+
		'</tr>');
        jQuery("#"+uuid).click(attachDelete(uuid));
      }
    }
  };

  var addParameterInit = function() {
    var uuid=localUUID();
    jQuery("#content-app #parameters").append('<tr>'+ // class=\"dynamic\"
	//'<td width=\"5%\"><input type="button" id='+uuid+' class="button" value="Borrar"/></td>'+
	'<td width=\"5%\" align=\"center\"><a id='+uuid+'><img src=\"/images/node/delete.png\"/></a></td>'+
	'<td width=\"20%\"><input type=\"text\"  maxlength=\"30\" style=\"width: 97%;\" class=\"required field cljkeyword\"/></td>'+
	'<td width=\"75%\"><input type=\"text\"  maxlength=\"1000\" style=\"width: 97%;\" class=\"required field\"/></td></tr>');
    jQuery("#"+uuid).click(function () {
      $("#"+uuid).parent().parent().remove();
    });  
  };

  var addInstanceInit = function() {
    var uuid=localUUID();
    var instUUID=localUUID();
    var addUUID=localUUID(); 
    jQuery("#content-app #instances").append('<tr>'+ // class=\"dynamic\"
	//'<td width=\"5%\"><input type="button" id='+uuid+' class="button" value="Borrar"/></td>'+
	'<td width=\"5%\" align=\"center\"><a id='+uuid+'><img src=\"/images/node/delete.png\"/></a></td>'+
	'<td width=\"20%\"><input name=\"'+instUUID+'\" type=\"text\"  maxlength=\"30\" style=\"width: 97%;\" class=\"instance required field cljkeyword\"/></td>'+
	'<td width=\"75%\"><table class=\"tableNodeField\"><tr>'+
	  '<td><table class=\"tableNodeList tInstancia\" id='+instUUID+'><tr>'+
	    '<th width="5%"></th>'+
		'<th width="20%" class=\"thListNode\">Par&aacute;metro</th>'+
		'<th width="75%" class=\"thListNode\">Valor</th>'+
	  '</tr></table></td>'+
	  '</tr><tr>'+
	    '<td align=\"right\"><input type="button" id='+addUUID+' class="button" value="Agregar Par&aacute;metro"/></td>'+
	  '</tr></table></td>'+
	'</tr>');
    jQuery("#"+uuid).click(function () {
      $("#"+uuid).parent().parent().remove();
    });
	
    jQuery("#"+addUUID).click(function() {
      var delUUID=localUUID(); 
      jQuery("#"+instUUID).append('<tr>'+
	  //'<td width=\"5%\"><input type="button" id='+delUUID+' class="button" value="Borrar"/></td>'+
	  '<td width=\"5%\" align=\"center\"><a id='+delUUID+'><img src=\"/images/node/delete.png\"/></a></td>'+
	  '<td width=\"20%\"><input type=\"text\"  maxlength=\"30\" style=\"width: 97%;\" class=\"required field cljkeyword\"/></td>'+
	  '<td width=\"75%\"><input type=\"text\"  maxlength=\"1000\" style=\"width: 97%;\" class=\"required field\"/></td></tr>');
      jQuery("#"+delUUID).click(function () {
        $("#"+delUUID).parent().parent().remove();
      });
    });
  };

  var saveApp = function() {
    var numErrores = 0;
	generalVal.cleanErrors();
	numErrores += generalVal.valRequieredFields(".required");
        numErrores += generalVal.valFields(".integer","integer");
        numErrores += generalVal.valFields(".cljkeyword","cljkeyword")
	if (numErrores == 0) {
		if (generalVal.validateOperation(operationNameSA)) {
		    generalVal.blockScreen();
			var name=$("#content-app #app-name").val();
			if (name.indexOf(":")>=0) {
				generalval.createError("Datos no v&aacute;lidos en el nombre de aplicaci&oacute;n!");
				generalVal.unblockScreen();
				return;
			}
			var interStateDelay=$("#content-app #interstate-delay").val();
			var statsCacheLen=$("#content-app #stats-cache-len").val();
			var appPars=extractParams("#content-app #parameters");
			if (appPars===null) {
				generalval.createError("Datos no v&aacute;lidos en el nombre del par&aacute;metro!");
				generalVal.unblockScreen();
				return;
			}
			var instances={};   
			$("#content-app #instances").find(".instance").each(function() {
			  var instName=$(this).val();
			  if (instName.indexOf(":")>=0) {
				generalval.createError("Datos no v&aacutelidos en el nombre de instancia!");
				generalVal.unblockScreen();
				instances=null;
				return;
			  }
			  instances[instName]={};
			  instances[instName]["param-map"]=extractParams("#"+this.name);
			  if (instances[instName]["param-map"]===null ) {
				generalval.createError("Datos no v&aacute;lidos en el nombre del par&aacute;metro de la instancia: " + instName + "!");
				generalVal.unblockScreen();
				instances=null;
				return;
			  }
			});
			if (instances===null) {
				generalval.createError("No se han definido instancias!");
				generalVal.unblockScreen();
				return;
			}
			conf["interstate-delay"]=interStateDelay;
			conf["stats-cache-len"]=statsCacheLen;
			conf.parameters=appPars;
			conf.instances=instances;
			if (conf.states === undefined || conf.states.length===0) {
			  conf.states=[];
			  conf.states.push({"flow": {"y":100, "x":100, "connect": []}, "key": ":start", "conf-map":{"opr": "sleep-opr", "conf": {"delta": "3000"}}});
			}
			app=name;
			jQuery.ajax({
			  type: "POST",
			  url: "/store/save/"+app,
			  data: {"conf":conf},
			  dataType: generalVal.getGenDataType(),
			  timeout: generalVal.getGenTimeout(),
			  error: generalVal.handleAjaxError,
			  success: function() {
				generalVal.succesOperation(operationNameSA);
				location.href="/applications";
			  }
			});
		}
	}
  };

  var removeApp = function() {
	if (generalVal.validateOperation(operationNameDA)) {
		generalVal.blockScreen();
		var name=$("#content-app #app-name").val();
		app=name;
		jQuery.ajax({
		  type: "GET",
		  url: "/store/remove/"+app,
		  timeout: generalVal.getGenTimeout(),
		  error: generalVal.handleAjaxError,
		  success: function() {
			generalVal.succesOperation(operationNameDA);
			location.href="/applications";
		  }
		});
	}
  };

  var fillSelect = function(json, tagLabel) {
    var combo = jQuery(tagLabel).empty();
    var selected = NV;
    var i;
    for (i = -1; i < json.length; i += 1) {
      if (i === -1) {
        combo.prepend('<option value = "'
                      + NAPP +'" selected = "selected">'
                      + NAPP + '</option>');
        selected = NAPP;
      } else {
        combo.prepend('<option value = "' + json[i] + '">' + json[i] + '</option>');
      }
    }
    return selected;
  };

  var clearAllInfo = function() {
    $("#content-app #app-name").val("");
    $("#content-app #interstate-delay").val("1000");
    $("#content-app #stats-cache-len").val("10");
    $("#content-app #parameters").find(".dynamic").detach();
    $("#content-app #instances").find(".dynamic").detach();
  };
  
  var onclickAdd = function(instUUID) {
    var delUUID=localUUID(); 
    jQuery("#"+instUUID).append('<tr>'+
	//'<td width=\"5%\"><input type="button" id='+delUUID+' class="button" value="Borrar"/></td>'+
	'<td width=\"5%\" align=\"center\"><a id='+delUUID+'><img src=\"/images/node/delete.png\"/></a></td>'+
	'<td width=\"20%\"><input type=\"text\"  maxlength=\"30\" style=\"width: 97%;\" class=\"required field\"/></td>'+
	'<td width=\"75%\"><input type=\"text\"  maxlength=\"1000\" style=\"width: 97%;\" class=\"required field\"/></td></tr>');
    jQuery("#"+delUUID).click(function () {
      $("#"+delUUID).parent().parent().remove();
    });
  }; 

  var onClickDel = function(uuid) {
	$("#"+uuid).parent().parent().remove();
  }
   
/*
instName+'\"/></td><td><table><tr><td><table id='+instUUID+' border="1" cellspacing="5" width=\"500pt\"><tr><th width="10%"></th><th width="20%">Nombre</th><th width="70%">Valor de par&aacute;metro</th></tr></table></td></tr><tr><td><input type="button" onclick="appCtrl.onclickAdd(\''+instUUID+'\');" id='+addUUID+' class="button" value="Agregar par&aacute;metro"/></td></tr></table></td></tr>'
 */
  var fillAppInfo = function(zconf) {
    conf=zconf;
    $("#content-app #app-name").val(app);
    $("#content-app #interstate-delay").val(conf["interstate-delay"]);
    $("#content-app #stats-cache-len").val(conf["stats-cache-len"]);
    setParameters("#content-app #parameters", conf.parameters);
    var instName;
    for (instName in conf.instances) {
      if (conf.instances.hasOwnProperty(instName)) {
        var uuid=localUUID();
        var instUUID=localUUID();
        var addUUID=localUUID(); 
        jQuery("#content-app #instances").append('<tr class=\"dynamic\">'+
		//'<td width=\"5%\"><input type="button" id='+uuid+' class="button" value="Borrar" onclick="appCtrl.onClickDel(\''+uuid+'\');"/></td>'+
		'<td width=\"5%\" align=\"center\"><a id='+uuid+' onclick="appCtrl.onClickDel(\''+uuid+'\');"><img src=\"/images/node/delete.png\"/></a></td>'+
		'<td width=\"20%\"><input class=\"instance required field\" style=\"width: 97%\" name=\"'+instUUID+'\" type=\"text\"  maxlength=\"30\" value=\"'+instName+'\"/></td>'+
		  '<td width=\"75%\"><table class=\"tableNodeField\"><tr>'+
		    '<td><table class=\"tableNodeList tInstancia\" id='+instUUID+'><tr>'+
		      '<th width="5%"></th>'+
		      '<th class=\"thListNode\" width="20%">Par&aacute;metro</th>'+
		      '<th class=\"thListNode\" width="75%">Valor</th>'+
		    '</tr></table></td>'+
		  '</tr><tr>'+
		    '<td align=\"right\"><input type="button" onclick=\"appCtrl.onclickAdd(\''+instUUID+'\');\" id='+addUUID+' class="button" value="Agregar Par&aacute;metro"/></td>'+
		  '</tr></table></td>'+
		'</tr>');
        
        setParameters("#"+instUUID, conf.instances[instName]["param-map"]);
      }
    }
	generalVal.unblockScreen();
  };

  var applicationChange = function() {
    app = jQuery("#content-app #applications option:selected").text();
    clearAllInfo();
    conf={};
    if (app !== NAPP) {
      jQuery.ajax({
        url: "/conf/" + app,
		dataType: generalVal.getGenDataType(),
		timeout: generalVal.getGenTimeout(),
		error: generalVal.handleAjaxError,
        success: fillAppInfo
      });  
    }
  };

  var fillApplications = function(apps) {
    app=fillSelect(apps,"#content-app #applications");
    jQuery("#content-app #applications").change(applicationChange);
	generalVal.unblockScreen();
  };

//  var robotScreen = function() {
//    jQuery("#app-screen").hide();
//    jQuery("#robot-screen").show();
//  };

  var cancel = function() {
	location.href="/applications";
  };

  return {
    onclickAdd: onclickAdd,
    onClickDel: onClickDel,
    init: function() {
      jQuery("#content-app #add-p-btn").click(addParameterInit);
      jQuery("#content-app #add-i-btn").click(addInstanceInit);      
      jQuery("#content-app #create-app").click(saveApp);
      jQuery("#content-app #remove-app").click(removeApp);
	  jQuery("#content-app #cancel").click(cancel);
      //jQuery("#content-app #main-link").click(robotScreen);
      //jQuery("#content-app #save-node-conf").click(saveRobotNodeConf);
	  generalVal.blockScreen();
      jQuery.ajax({
        url: "/apps",
        dataType: generalVal.getGenDataType(),
		timeout: generalVal.getGenTimeout(),
		error: generalVal.handleAjaxError,
        success: fillApplications
      });
    } 
  };

}());

jQuery(document).ready(appCtrl.init);
