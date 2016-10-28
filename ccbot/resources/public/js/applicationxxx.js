"use strict";

// jsApplication Viewer
// InterWare de Mexico, S.A. de C.V.
/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 

global jQuery, $, Raphael, alert */

var appCtrl = (function () {
  var NAPP = "*** NEW ***";
  var NV = "unknown";
  var app = NV;
  var conf = {};

  var localUUID = function () {
    return Raphael.createUUID();
  };

  var extractParams = function (tagId) {
    var pars = {
      "-": "-"
    };
    var esKey = true;
    var kv = [];
    var i = 0;
    var mal = false;
    $(tagId).find("input").each(function () {
      if (i > 0) {
        kv.push($(this).val());
        if (!esKey) {
          pars[kv[0]] = kv[1];
          if (kv[0].indexOf(":") >= 0) mal = true;
          kv = [];
        }
        esKey = !esKey;
      }
      i = ++i % 3;
    });
    if (mal) {
      return null;
    } else {
      return pars;
    }
  };

  var attachDelete = function (uuid) {
    return function () {
      $("#" + uuid).parent().parent().remove();
    };
  };

  var setParameters = function (tagId, data) {
    var name;
    for (name in data) {
      if (data.hasOwnProperty(name)) {
        var uuid = localUUID();
        jQuery(tagId).append('<tr class=\"dynamic\"><td><input type="button" id=' +
          uuid + ' class="button" value="Del"/></td><td><input type=\"text\" value=\"' +
          name + '\"/></td><td><input type=\"text\" value=\"' + data[name] +
          '\"/></td></tr>');
        jQuery("#" + uuid).click(attachDelete(uuid));
      }
    }
  };

  var addParameterInit = function () {
    var uuid = localUUID();
    jQuery("#content-app #parameters").append('<tr class=\"dynamic\"><td><input type="button" id=' + uuid + ' class="button" value="Del"/></td><td><input type=\"text\"/></td><td><input type=\"text\"/></td></tr>');
    jQuery("#" + uuid).click(function () {
      $("#" + uuid).parent().parent().remove();
    });
  };

  var addInstanceInit = function () {
    var uuid = localUUID();
    var instUUID = localUUID();
    var addUUID = localUUID();
    jQuery("#content-app #instances").append('<tr class=\"dynamic\"><td><input type="button" id=' + uuid + ' class="button" value="Del"/></td><td><input class=\"instance\" name=\"' + instUUID + '\" type=\"text\"/></td><td><table><tr><td><table id=' + instUUID + ' border="1" cellspacing="5" width=\"500pt\"><tr><th width="10%"></th><th width="20%">Name</th><th width="70%">Value of parameter</th></tr></table></td></tr><tr><td><input type="button" id=' + addUUID + ' class="button" value="Add parameter"/></td></tr></table></td></tr>');
    jQuery("#" + uuid).click(function () {
      $("#" + uuid).parent().parent().remove();
    });
    jQuery("#" + addUUID).click(function () {
      var delUUID = localUUID();
      jQuery("#" + instUUID).append('<tr><td><input type="button" id=' + delUUID + ' class="button" value="Del"/></td><td><input type=\"text\"/></td><td><input type=\"text\"/></td></tr>');
      jQuery("#" + delUUID).click(function () {
        $("#" + delUUID).parent().parent().remove();
      });
    });
  };

  var saveNodeConf = function () {
    alert("Se salva la configuracion del nodo");
  };

  var saveApp = function () {
    var name = $("#content-app #app-name").val();
    if (name.indexOf(":") >= 0) {
      alert("Invalid characters in app name");
      return;
    }
    var interStateDelay = $("#content-app #interstate-delay").val();
    var statsCacheLen = $("#content-app #stats-cache-len").val();
    var appPars = extractParams("#content-app #parameters");
    if (appPars === null) {
      alert("Invalid characters in parameter name");
      return;
    }
    var instances = {};
    $("#content-app #instances").find(".instance").each(function () {
      var instName = $(this).val();
      if (instName.indexOf(":") >= 0) {
        alert("Invalid characters in instance name");
        instances = null;
        return;
      }
      instances[instName] = {};
      instances[instName]["param-map"] = extractParams("#" + this.name);
      if (instances[instName]["param-map"] === null) {
        alert("Invalid characters in parameter name of instance:" + instName);
        instances = null;
        return;
      }
    });
    if (instances === null) return;
    conf["interstate-delay"] = interStateDelay;
    conf["stats-cache-len"] = statsCacheLen;
    conf.parameters = appPars;
    conf.instances = instances;
    if (conf.states === undefined || conf.states.length === 0) {
      conf.states = [];
      conf.states.push({
        "flow": {
          "y": 100,
          "x": 100,
          "connect": []
        },
        "key": ":start",
        "conf-map": {
          "opr": "sleep-opr",
          "conf": {
            "delta": "3000"
          }
        }
      });
    }
    app = name;
    jQuery.ajax({
      type: "POST",
      url: "/store/save/" + app,
      dataType: "json",
      data: {
        "conf": conf
      },
      success: function () {
        location.href = "/index.html";
      }
    });
  };

  var removeApp = function () {
    var name = $("#content-app #app-name").val();
    app = name;
    jQuery.ajax({
      type: "GET",
      url: "/store/remove/" + app,
      success: function () {
        location.href = "/index.html";
      }
    });
  };

  var fillSelect = function (json, tagLabel) {
    var combo = jQuery(tagLabel).empty();
    var selected = NV;
    var i;
    for (i = -1; i < json.length; i += 1) {
      if (i === -1) {
        combo.prepend('<option value = "' +
          NAPP + '" selected = "selected">' +
          NAPP + '</option>');
        selected = NAPP;
      } else {
        combo.prepend('<option value = "' + json[i] + '">' + json[i] + '</option>');
      }
    }
    return selected;
  };

  var clearAllInfo = function () {
    $("#content-app #app-name").val("");
    $("#content-app #interstate-delay").val("1000");
    $("#content-app #stats-cache-len").val("10");
    $("#content-app #parameters").find(".dynamic").detach();
    $("#content-app #instances").find(".dynamic").detach();
  };

  var fillAppInfo = function (zconf) {
    conf = zconf;
    $("#content-app #app-name").val(app);
    $("#content-app #interstate-delay").val(conf["interstate-delay"]);
    $("#content-app #stats-cache-len").val(conf["stats-cache-len"]);
    setParameters("#content-app #parameters", conf.parameters);
    var instName;
    for (instName in conf.instances) {
      if (conf.instances.hasOwnProperty(instName)) {
        var uuid = localUUID();
        var instUUID = localUUID();
        var addUUID = localUUID();
        jQuery("#content-app #instances").append('<tr class=\"dynamic\"><td><input type="button" id=' +
          uuid + ' class="button" value="Del"/></td><td><input class=\"instance\" name=\"' +
          instUUID + '\" type=\"text\" value=\"' +
          instName + '\"/></td><td><table><tr><td><table id=' + instUUID + ' border="1" cellspacing="5" width=\"500pt\"><tr><th width="10%"></th><th width="20%">Name</th><th width="70%">Value of parameter</th></tr></table></td></tr><tr><td><input type="button" id=' + addUUID + ' class="button" value="Add parameter"/></td></tr></table></td></tr>');
        jQuery("#" + uuid).click(function () {
          $("#" + uuid).parent().parent().remove();
        });
        jQuery("#" + addUUID).click(function () {
          var delUUID = localUUID();
          jQuery("#" + instUUID).append('<tr><td><input type="button" id=' + delUUID + ' class="button" value="Del"/></td><td><input type=\"text\"/></td><td><input type=\"text\"/></td></tr>');
          jQuery("#" + delUUID).click(function () {
            $("#" + delUUID).parent().parent().remove();
          });
        });
        setParameters("#" + instUUID, conf.instances[instName]["param-map"]);
      }
    }
  };

  var applicationChange = function () {
    app = jQuery("#content-app #applications option:selected").text();
    clearAllInfo();
    conf = {};
    if (app !== NAPP) {
      jQuery.ajax({
        url: "/conf/" + app,
        dataType: "json",
        success: fillAppInfo
      });
    }
  };

  var fillApplications = function (apps) {
    app = fillSelect(apps, "#content-app #applications");
    jQuery("#content-app #applications").change(applicationChange);
  };

  return {
    init: function () {
      jQuery("#content-app #add-p-btn").click(addParameterInit);
      jQuery("#content-app #add-i-btn").click(addInstanceInit);
      jQuery("#content-app #create-app").click(saveApp);
      jQuery("#content-app #remove-app").click(removeApp);
      jQuery("#content-app #save-node-conf").click(saveNodeConf);


      jQuery.ajax({
        url: "/apps",
        dataType: "json",
        success: fillApplications
      });
    }
  };
}());

jQuery(document).ready(appCtrl.init);