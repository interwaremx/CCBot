"use strict";

// jsROBOT Viewer
// InterWare de Mexico, S.A. de C.V.
// Felipe Gerard

/*jslint 
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

/*global jQuery, $, Raphael, alert */

Raphael.fn.arrow  =  function (x1, y1, x2, y2, size) {
  var angle  =  Math.atan2(x1 - x2, y2 - y1);
  angle  =  (angle / (2 * Math.PI)) * 360;
  var cx = (x1 + x2) / 2;
  var cy = (y1 + y2) / 2;
  var arrowPath  =  this.path("M" + cx + " " + cy + " L" + (cx - size) + " " + (cy - size) + " L" + (cx - size) + " " + (cy + size) + " L" + cx + " " + cy ).attr("fill", "black").rotate((90 + angle), cx, cy).toBack();
  var linePath  =  this.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2).toBack();
  return [linePath, arrowPath];
};

var cbot = (function () {
  var NV = "desconocido";
  var lastUUID = NV;
  var app = NV;
  var inst = NV;
  var states = {};
  var monitoring = true;
  var HIDE_ROBOT = -1;
  var RUNNING_ROBOT = 0;
  var STOP_ROBOT = 1;
  var WAIT_ROBOT = 2;
  var lastState = null;
  var etiqueta = ["state", "result", "when", "delta"];
  var robot = null;
  var dragging = false;
  var connecting = false;
  var connectImage = null;
  var connectImageBBOX = null;
  var connectingPath = null;
  var workspace = null;
  var conf = null;
  var offsetX = 0;
  var offsetY = 0;
  var otherState = null;
  var otherGlow = null;
  var glowArrow = null;
  var connectingState = null;
  var oprDiags = {};
  var arrowDialog = null;
  
  var each = function(set, fun) {
    var i;
    for (i = 0; i < set.length; i++) {
      fun(set[i]);
    }
  };

  var removeIt = function(elem) {
    if (elem!==null) {
      elem.remove();
    }
    return null;
  }; 

  var getWithDefault = function(mapa, path, defaultValue) {
    var i;
    var value = mapa;
    for (i = 0; i < path.length; i++) {
      value = value[path[i]];
      if (value === undefined) {
        return defaultValue;
      }
    }
    return value;
  };

  var connectInConf = function(state, other, regExp) {
    var idx = state.conf_idx;
    var connectArr = conf.states[idx].flow.connect;
    if (connectArr === undefined) {
      connectArr = [];
      conf.states[idx].flow.connect = connectArr;
    }
    if (connectArr.length === 0) {
      connectArr.unshift(other.key);
    } else {
      connectArr.unshift(regExp);
      connectArr.unshift(other.key);      
    }
  };

  var connectingStart = function(x, y, event) {
    if (connecting) {
      return;
    }
    connecting = true;
    var bbox = connectImageBBOX;
    offsetX = event.offsetX - (bbox.x + bbox.width);
    offsetY = event.offsetY - (bbox.y + bbox.height);
    connectingPath = workspace.path("M" + (bbox.x + bbox.width) + " " + (bbox.y + bbox.height)); // + "l0 0"
  };

  var contains = function(arr, elem) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i] === elem) {
        return i;
      }
    }
    return -1;
  };

  var removeArrows = function(state, otherKey) {
    var removed = [];
    var i = 0;
    var remover = function (elem) {
      elem.remove();
    };
    for (i = 0; i < state.statesOut.length; i++) {
      if (state.statesOut[i] === otherKey || otherKey === "*") {
        each(state.arrowsOut[i], remover);
        if (state.tipsOut[i] !== undefined) {
          state.tipsOut[i].remove();
        }
        removed.push([state.key, state.statesOut[i]]);
      }
    }
    return removed;
  };

var labelIt = function(x, y, txt, elem) {
    var condition = workspace.text(x, y, txt);
    var bbox = condition.getBBox();
    var rr = workspace.rect(bbox.x - 2, bbox.y - 2, bbox.width + 4, bbox.height + 4);
    rr.attr({fill: "#fff"});
    var tip = workspace.set(rr, condition);
    tip.attr({opacity: 0}).toBack();//toFront();    
    elem.hover(function() {
      tip.toFront().animate({opacity: 1}, 500);
    }, function() {
      tip.animate({opacity: 0}, 500).toBack();
    });
    return tip;
  };

  var connectUsing = function(index, state, other, outNum, tipTxt) {
    var pt = [parseInt(state.r_t_i_set[0].attrs.x, 10) + state.r_t_i_set[0].attrs.width / 2,
        parseInt(state.r_t_i_set[0].attrs.y, 10) + state.r_t_i_set[0].attrs.height / 2,
        parseInt(other.r_t_i_set[0].attrs.x, 10) + other.r_t_i_set[0].attrs.width / 2,
        parseInt(other.r_t_i_set[0].attrs.y, 10) + other.r_t_i_set[0].attrs.height / 2];
    var i;
    for (i = 0; i < pt.length; i++) {
      pt[i] = Math.floor(pt[i]);
    }
    var arr = workspace.arrow(pt[0], pt[1], pt[2], pt[3], 4);
    arr[1].data("estado", state);
    arr[1].data("otro", other);
    arr[1].hover(function() {
      removeIt(glowArrow);
      glowArrow = this.glow();
    }, function() {
      glowArrow=removeIt(glowArrow);
    });
    arr[1].click(function() {
      var state = this.data("estado");
      var other = this.data("otro");
      var connectArr = conf.states[state.conf_idx].flow.connect;
      var i = connectArr.length - 1;
      while (connectArr[i] !== other.key && i >= 0) {
        i -= 2;
      }
      if (i >= 0) {
        if (i === (connectArr.length - 1)) {
          jQuery("#regexp").val("default (no modificable)").attr({disabled: true});
        } else {
          jQuery("#regexp").val(connectArr[i + 1]).attr({disabled: false});
        }
        $("#arrowStateName").val(state.key);
        $("#arrowOtherStateName").val(other.key);
        $("#arrowCnctIdx").val(i + 1);
        arrowDialog.dialog("open");
      } else {
        alert("esto no puede pasar!");
      }
    });
    var tip = labelIt((pt[0] + pt[2]) / 2,
                    (pt[1] + pt[3]) / 2,
                    outNum + " [" + tipTxt + "]",
                    state.r_t_i_set);
    if (index < 0) {
      state.statesOut.push(other.key);
      state.arrowsOut.push(arr);
      state.tipsOut.push(tip);
      other.statesIn.push(state.key);
    } else {
      state.arrowsOut[index] = arr;
      state.tipsOut[index] = tip;
    }
  };

  var reConnectStates = function(state, otherName) {
    var i;
    for (i = 0; i < state.statesOut.length; i++) {
      var other = states[state.statesOut[i]];
      if (other.key === otherName || otherName === "*") {
        var tipTxt = conf.states[state.conf_idx].flow.connect[i * 2 + 1] !== undefined ?
              conf.states[state.conf_idx].flow.connect[i * 2 + 1] : "default";
        connectUsing(i, state, other, i + 1, tipTxt);
      }
    }
  };

  var connectingStop = function () {
    workspace.renderfix();
    connectingPath.remove();
    if (otherState !== null) {
      var state = connectingState;
      var other = otherState;
      if (contains(state.statesOut, other.key) < 0) {
        connectInConf(state, other, "undefined");
        removeArrows(state, "*");
        state.statesOut.unshift(other.key);
        reConnectStates(state, "*");
        other.statesIn.push(state.key);
      }
    }
    otherGlow=removeIt(otherGlow);
    connectingPath.remove();
    connectingPath = null;
    connectImage.remove();
    connectImage = null;
    connectImageBBOX = null;
    otherState = null;
    connecting = false;
  };

  var connectingMove = function(dx, dy) {
    var bbox = connectImageBBOX;
    connectingPath.attr({"path": "M" + (bbox.x + bbox.width) + " " + (bbox.y + bbox.height) + "l" + (dx + offsetX) + " " + (dy + offsetY)});
  };

  var mouseIsOver = function() {
    if (dragging) {
      return;
    }
    if (connectImage !== null) {
      if (connectingPath !== null) {
        if (connectImageBBOX !== this.group[0].getBBox()) { //ojo con el this
          // estamos conectando y ahora sobre OTRO estado
          otherState = states[this.group[0].key];
          otherGlow=removeIt(otherGlow);
          otherGlow = this.group[0].glow();
          return;
        } else {
          otherGlow=removeIt(otherGlow);
          otherState = null;
          return;
        }
      } else {
        connectImage=removeIt(connectImage);
      }
    }
    var bbox = this.group[0].getBBox();
    var p = workspace.path("M" + (bbox.x + bbox.width) + " " + (bbox.y + bbox.height) + "l -6 -2 -6 2 2 -6 -4 -2 4 -2 -2 -6 6 2 6 -2 -2 6 4 2 -4 2 z").attr({"fill": "#ff0000"});
    connectImage = p;
    connectImageBBOX = bbox;
    connectImage.drag(connectingMove, connectingStart, connectingStop);
    connectingState = states[this.group[0].key];
  };

  var mouseIsOut = function() {
    if (this.type === "rect") { //OJO con el this
      otherGlow=removeIt(otherGlow);
      otherState = null;
    }
  };

  var getCenter = function(stateName) {
    var state = states[stateName];
    var bbox = state.r_t_i_set[0].getBBox();
    var x = Math.floor(bbox.x + bbox.width / 2);
    var y = Math.floor(bbox.y + bbox.height / 2);
    return {"x": x, "y": y};
  };

  var createPathStr = function(from, to) {
    return "M" + from.x + ", " + from.y + "L" + to.x + ", " + to.y;
  };

  var connect = function(state, other, outNum, tipTxt) {
    connectUsing(-1, state, other, outNum, tipTxt);
  };

  var localUUID = function() {
    return Raphael.createUUID();
  };
 

 var showRobot = function(idx) {
    var i;

    if (robot !==  null) {
      for (i = 0; i < 3; i += 1) {
        robot[i].hide();//attr({opacity: 0});
        //robot[i].attr({opacity: 0});
      }
      if (idx >= 0) {
        robot[idx].show();//animate({opacity: 1}, 500);
        //robot[idx].animate({opacity: 1}, 500);
      }
    }

  };

  var startMonitoring = function(newUUID) {
    if (monitoring && app.length > 0 && inst.length > 0 && app !== NV && inst !== NV) {
      if (newUUID) {
        lastUUID = localUUID();
      }
      jQuery.ajax({
        url: "/apps/" + app + "/" + inst,
        dataType: "json",
        data: {
          cmd: "current-pos",
          uuid: lastUUID,
          timeout: "20000",
          json: "true"
        },
        success: function(result) {
          if (lastUUID === result["request-uuid"]) {
            if (states.length === 0) {
              alert("No hay estados a monitorear!");
              return;
            }
            var newState = states[result.current];
            if (newState === undefined) {
              alert("No hay estado con el nombre " + result.current + " !");
              startMonitoring(true);
              return;
            }
            var thumbUp = $("#thumb-up");
            var thumbDn = $("#thumb-down");
            lastUUID = result.uuid;
            thumbUp.hide();
            thumbDn.hide();
            if (result.status === ":bad") {
              thumbDn.show();
            } else {
              thumbUp.show();
            }
            jQuery("#resume").hide();
            jQuery("#stop-button").hide();
            jQuery("#start-button").hide();

            if (lastState !==  null) {
              lastState.r_t_i_set[0].animate({"fill": "#bbbbbb",
                                              "stroke-width": 3,
                                              "stroke": "#007eaf"
                                             }, 1000);
            }
            lastState = newState;
            lastState.r_t_i_set[0].animate({fill: "#eeeeee",
                                            stroke: "#c42530",
                                            "stroke-width": 3}, 1000);

            var resultIndex = 0;
            jQuery("table.status").find("tr").each(function (i) {
              if (i > 0) {
                $(this).find("td").each(function (j) {
                  if (resultIndex < result.stats.info.length) {
                    $(this).text(result.stats.info[resultIndex][etiqueta[j]]);
                  } else {
                    $(this).text("");
                  }
                });
                resultIndex += 1;
              }
            });
            if (!result["stop?"]) {
              jQuery("#stop-button").show();
              if (result["awaiting?"]) {
                showRobot(WAIT_ROBOT);
                jQuery("#resume").show();
              } else {
                showRobot(RUNNING_ROBOT);
              }
            } else {
              jQuery("#start-button").show();
              showRobot(STOP_ROBOT);
            }
            var xx = parseInt(states[result.current].r_t_i_set[0].attrs.x, 10);
            var yy = parseInt(states[result.current].r_t_i_set[0].attrs.y, 10);
            robot.animate({x: xx + 30, y: yy}, 500);
            startMonitoring(false);
          }
        }        
      });
    }
  };

  var connectStates = function() {
    var i, j;
    var state, other;
    var connectArr;
    var confStates = conf.states;
    for (i = 0; i < confStates.length; i += 1) {
      state = states[confStates[i].key];
      connectArr = confStates[i].flow.connect;// i es  ===  a state.conf_idx
      if (connectArr !== undefined) {
        for (j = 0; j < connectArr.length; j += 2) {
          other = states[connectArr[j]];
          connect(state, other, Math.floor(j / 2 + 1),
                  connectArr[j + 1] !== undefined ? connectArr[j + 1] : "default");
        }
      }
    }
    startMonitoring(true);
  };

  var dragStateStart = function() {
    if (dragging || connecting) {
      return;
    }
    var state = null;
    if (this.group !== undefined) {//OJO con this
      dragging = true;
      state = states[this.group[0].key];
    }
    if (state) {
      connectImage=removeIt(connectImage);
      connectingPath=removeIt(connectingPath);
      var i;
      for (i = 0; i < state.r_t_i_set.length; i++) {
        state.r_t_i_set[i].ox = parseInt(state.r_t_i_set[i].attrs.x, 10);
        state.r_t_i_set[i].oy = parseInt(state.r_t_i_set[i].attrs.y, 10);
      }
      //desconectar elemento
      var arrowsOut = removeArrows(state, "*");
      var arrowsIn = [];
      each(state.statesIn, function (name) {
        var other = states[name];
        var arrows = removeArrows(other, state.key);
        each(arrows, function(par) {arrowsIn.push(par); });
      });
      var pathsOut = [];
      each(arrowsOut, function(par) {
        var from = getCenter(par[0]); from.x0 = from.x; from.y0 = from.y;
        var to = getCenter(par[1]); to.x0 = to.x; to.y0 = to.y;
        pathsOut.push({"from": from, 
                       "to": to, 
                       "path": workspace.path(createPathStr(from, to)).toBack().attr({"stroke": "#c42530"})});
      });
      var pathsIn = [];
      each(arrowsIn, function(par) {
        var from = getCenter(par[0]); from.x0 = from.x; from.y0 = from.y;
        var to = getCenter(par[1]); to.x0 = to.x; to.y0 = to.y;
        pathsIn.push({"from": from, 
                      "to": to, 
                      "path": workspace.path(createPathStr(from, to)).toBack().attr({"stroke": "#007eaf"})});
      });
      state.pathsOut = pathsOut;
      state.pathsIn = pathsIn;
    }
  };

  var dragStateStop = function() {
    if (!dragging || connecting) {
      return;
    }
    var state = null;
    if (this.group !== undefined) {//OJO con el this !!!
      state = states[this.group[0].key];
    }
    if (state) {
      var i;
      for (i = 0; i < state.r_t_i_set.length; i++) {
        delete (state.r_t_i_set[i].ox);
        delete (state.r_t_i_set[i].oy);
      }
      conf.states[state.conf_idx].flow.x = state.r_t_i_set[0].attrs.x;
      conf.states[state.conf_idx].flow.y = state.r_t_i_set[0].attrs.y;
      each(state.pathsIn, function(info) {info.path.remove(); });
      each(state.pathsOut, function(info) {info.path.remove(); });
      reConnectStates(state, "*");
      each(state.statesIn, function(name) {
      var other = states[name];
        reConnectStates(other, state.key);
      });
      dragging = false;
    }
  };
  
  var dragStateMove = function(dx, dy) {
    if (!dragging || connecting) {
      return;
    }
    var state = null;
    if (this.group !== undefined) {//OJO this
      state = states[this.group[0].key];
    }
    if (state) {
      var x;
      for (x = 0; x < state.r_t_i_set.length; x++) {
        var obj = state.r_t_i_set[x];
        obj.attr({ x: obj.ox + dx, y: obj.oy + dy });
      }
      each(state.pathsOut, function(info) {
        info.from.x = info.from.x0 + dx;
        info.from.y = info.from.y0 + dy;
        info.path.attr({"path": createPathStr(info.from, info.to)});
      });
      each(state.pathsIn, function(info) {
        info.to.x = info.to.x0 + dx;
        info.to.y = info.to.y0 + dy;
        info.path.attr({"path": createPathStr(info.from, info.to)});
      });
    }
  };

  var buildState = function(index, state) {
    var txt = workspace.text(75, 50, state.key);
    var icono = workspace.image("/images/" + state["conf-map"].opr + ".gif", 40, 50, 15, 15);
    var g = workspace.set(txt, icono);
    var bbox = g.getBBox();
    var rect = workspace.rect(bbox.x - 8, bbox.y - 2, bbox.width + 16, bbox.height + 4, 8);
    rect.attr({"stroke": "#007eaf",
               "stroke-width": 3,
               "fill": "#bbbbbb"}).toBack();
    g = workspace.set(rect, txt, icono);//.data("dim", rect.getBBox());
    g.attr({x: parseInt(state.flow.x, 10), y: parseInt(state.flow.y, 10)});
    g[1].attr({x: parseInt(g[1].attrs.x, 10) + 15 + bbox.width / 2,
               y: parseInt(g[1].attrs.y, 10) + 18}).toFront();
    g[2].attr({x: parseInt(g[2].attrs.x, 10) + 4,
               y: parseInt(g[2].attrs.y, 10) + 7}).toFront();
    rect.key = state.key;
    g[0].group = g;
    g[2].group = g;
    g[1].group = g;
    states[state.key] = {"key": state.key,
                         "r_t_i_set": g,
                         "conf_idx": index,
                         "statesOut": [],
                         "arrowsOut": [],
                         "tipsOut": [],
                         "statesIn": []//, "glowArrow":null
                        };//statesIn los nombres
                        //de los estados que salen hacia ACA
    g.drag(dragStateMove, dragStateStart, dragStateStop);
    g.mouseover(mouseIsOver);
    g.mouseout(mouseIsOut);
    //g.dblclick(updateState);
    return states[state.key];
  };

  var buildWorkspace = function(confParam) {
    var i;
    connectImage=removeIt(connectImage);
    connectingPath=removeIt(connectingPath);
    conf = confParam;
    workspace.clear();

    var rStart = workspace.image("/images/robot-start.gif", 100, 100, 15, 15).toFront();//.attr({opacity: 0});
    var rStop = workspace.image("/images/robot-stop.gif", 100, 100, 15, 15).toFront();//.attr({opacity: 0});
    var rWaiting = workspace.image("/images/robot-waiting.gif", 100, 100, 15, 15).toFront();//.attr({opacity: 0});
    robot = workspace.set(rStart, rStop, rWaiting);
    states = {};
    for (i = 0; i < conf.states.length; i += 1) {
      buildState(i, conf.states[i]);
    }
    connectStates();
  };
  
  var showFFOptions = function(oprDialog) {
	  var browser = jQuery(oprDialog + " #browser").val();
	  if (browser != undefined && browser != null && browser == ":firefox") {
		  $(oprDialog + " .ffOption").each(function( index ) {
			  $(this).removeClass("hide-info");
		  });
	  } else {
		  $(oprDialog + " .ffOption").each(function( index ) {
			  $(this).addClass("hide-info");
		  });
	  }
  };
  
  var setLogit = function(confState, div) {
	  var flag = confState["conf-map"].logit == "true" ? true : false;
	  //alert("SET A: "+confState["conf-map"].logit + " B: " + flag);
	  div.find("#logit").prop("checked", flag);
  };

  var setTimeoutOpr = function(confState, div) {
    div.find("#timeout").val(confState["conf-map"].timeout);
    div.find("#retry-delay").val(confState["conf-map"]["retry-delay"]);
    div.find("#retry-count").val(confState["conf-map"]["retry-count"]);
  };

  var oprSetFunc = {
	 "send-stats-opr": function (state, confState) {
	  var div = $("#send-stats-oprDialog");
	  setLogit(confState, div);
	  div.find("#state-name").val(state.key);
	  div.find("#stats-rows2send").val(getWithDefault(confState, ["conf-map", "conf", "stats-rows2send"], "20"));
	  div.find("#stats-days4clear").val(getWithDefault(confState, ["conf-map", "conf", "stats-days4clear"], "7"));
	},
	"fb-har-opr": function (state, confState) {
	  var div = $("#fb-har-oprDialog");
	  setLogit(confState, div);
	  div.find("#state-name").val(state.key);
	  div.find("#browser").val(getWithDefault(confState, ["conf-map", "conf", "browser"], ":firefox"));
	  div.find("#delta").val(getWithDefault(confState, ["conf-map", "conf", "delta"], "10000"));
	  div.find("#uriHAR").val(getWithDefault(confState, ["conf-map", "conf", "uri"], ""));
	  div.find("#timeout").val(getWithDefault(confState, ["conf-map", "conf", "timeout"], "60000"));
	  var cache = getWithDefault(confState, ["conf-map", "conf", "cache"], "true");
	  if (typeof cache == "string") {
		  if (cache == "false") {
			  div.find("#cache").attr("checked",false);
		  } else {
			  div.find("#cache").attr("checked",true);
		  }
	  } else {
		  div.find("#cache").attr("checked",cache);
	  }
	  div.find("#hars-dir").val(getWithDefault(confState, ["conf-map", "conf", "hars-dir"], ""));
      div.find("#binary-path").val(getWithDefault(confState, ["conf-map", "conf", "binary-path"], ""));
      div.find("#profile-path").val(getWithDefault(confState, ["conf-map", "conf", "profile-path"], ""));
      showFFOptions("#fb-har-oprDialog"); // Se inserta en esta posici��n para habilitar el muestreo de informaci��n.
	},
    "browser-tc-opr": function (state, confState) {
      var div = $("#browser-tc-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#browser").val(getWithDefault(confState, ["conf-map", "conf", "browser"], ":firefox"));
      div.find("#delta").val(getWithDefault(confState, ["conf-map", "conf", "delta"], "1000"));
      div.find("#uri").val(getWithDefault(confState, ["conf-map", "conf", "uri"], ""));
      div.find("#timeout").val(getWithDefault(confState, ["conf-map", "conf", "timeout"], "60000"));
      var cache = getWithDefault(confState, ["conf-map", "conf", "cache"], "true");
	  if (typeof cache == "string") {
		  if (cache == "false") {
			  div.find("#cache").attr("checked",false);
		  } else {
			  div.find("#cache").attr("checked",true);
		  }
	  } else {
		  div.find("#cache").attr("checked",cache);
	  }
	  var close = getWithDefault(confState, ["conf-map", "conf", "close"], "true");
	  if (typeof close == "string") {
		  if (close == "false") {
			  div.find("#close").attr("checked",false);
		  } else {
			  div.find("#close").attr("checked",true);
		  }
	  } else {
		  div.find("#close").attr("checked",close);
	  }
      div.find("#startchrono").val(getWithDefault(confState, ["conf-map", "conf", "start-step"], "0")+"-step");
      div.find("#binary-path").val(getWithDefault(confState, ["conf-map", "conf", "binary-path"], ""));
      div.find("#profile-path").val(getWithDefault(confState, ["conf-map", "conf", "profile-path"], ""));
      var idx1= getWithDefault(confState, ["conf-map", "conf", "start-step"], "0");
      showFFOptions("#browser-tc-oprDialog"); // Se inserta en esta posici��n para habilitar el muestreo de informaci��n.

      var combo = jQuery("#startchrono").empty(); 
      for (var i=0; i<100; i++) {
        var lbl=""+i+"-step";
        if (i==idx1) {
          combo.append('<option value = "' + lbl + '" selected=true>' + lbl + '</option>');
        }
        else {
          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        }
      };

      var idx2= getWithDefault(confState, ["conf-map", "conf", "start-step"], "0");
      var combo = jQuery("#stopchrono").empty(); 
      for (var i=0; i<100; i++) {
        var lbl=""+i+"-step";
        if (i==idx2) {
          combo.append('<option value = "' + lbl + '" selected=true>' + lbl + '</option>');
        }
        else {
          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        }
      }
      ;div.find("#stopchrono").val(getWithDefault(confState, ["conf-map", "conf", "stop-step"], "99")+"-step");
    },
    "sleep-opr": function (state, confState) {
      var div = $("#sleep-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#delta").val(getWithDefault(confState, ["conf-map", "conf", "delta"], "1000"));
    },
    "socket-opr": function(state, confState) {
      var div = $("#socket-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      setTimeoutOpr(confState, div);
      div.find("#host").val(getWithDefault(confState, ["conf-map", "conf", "host"], "localhost"));
      div.find("#port").val(getWithDefault(confState, ["conf-map", "conf", "port"], "22"));
    },
    "os-cmd-opr": function(state, confState) {
      var div = $("#os-cmd-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      setTimeoutOpr(confState, div);
      div.find("#shell").val(getWithDefault(confState, ["conf-map", "conf", "shell"], "ls"));
    },
    "human-opr": function(state, confState) {
      var div = $("#human-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
    },
    "switch-good-opr": function(state, confState) {
      var div = $("#switch-good-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
    },
    "switch-bad-opr": function(state, confState) {
      var div = $("#switch-bad-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      var minutes2wait = getWithDefault(confState, ["conf-map", "conf", "minutes2wait"], "60");
      div.find("#minutes2wait").val(minutes2wait);
    },
    "date-time-opr": function(state, confState) {
      var div = $("#date-time-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      var format = getWithDefault(confState, ["conf-map", "conf", "format"], "HH");
      div.find("#format").val(format);
    },
    "log-opr": function(state, confState) {
      var div = $("#log-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#text").val(getWithDefault(confState, ["conf-map", "conf", "text"], "Message"));
      var lev = getWithDefault(confState, ["conf-map", "conf", "level"], ":debug");
      div.find("#log-levels").find("option").each(function() {
        this.selected = $(this).val() === lev;
      });
    },
    "print-msg-opr": function (state, confState) {
      var div = $("#print-msg-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#msg").val(getWithDefault(confState, ["conf-map", "conf", "msg"], "Message"));
    },
    "print-context-opr": function (state, confState) {
      var div = $("#print-context-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#filter-re").val(getWithDefault(confState, ["conf-map", "conf", "filter-re"], ".*"));
    },
    "get-http-opr": function (state, confState) {
      var div = $("#get-http-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#url").val(getWithDefault(confState, ["conf-map", "conf", "url"], "http://"));
      setTimeoutOpr(confState, div);
    },
    "post-http-opr": function (state, confState) {
      var div = $("#post-http-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#url").val(getWithDefault(confState, ["conf-map", "conf", "url"], "http://"));
      div.find("#params").val(getWithDefault(confState, ["conf-map", "conf", "params"], "name1 = value1\nname2 = value2"));
      setTimeoutOpr(confState, div);
    },
    "send-mail-opr": function (state, confState) {
      var div = $("#send-mail-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#host").val(getWithDefault(confState, ["conf-map", "conf", "host"], "smtp.gmail.com"));
      div.find("#port").val(getWithDefault(confState, ["conf-map", "conf", "port"], "465"));
      div.find("#ssl").attr("checked",getWithDefault(confState, ["conf-map", "conf", "ssl"], "true")==="true");
      div.find("#user").val(getWithDefault(confState, ["conf-map", "conf", "user"], "userId"));
      div.find("#password").val(getWithDefault(confState, ["conf-map", "conf", "passwd"], ""));
      div.find("#to-vec").val(getWithDefault(confState, ["conf-map", "conf", "to-vec"], "smtp.gmail.com"));
      div.find("#subject").val(getWithDefault(confState, ["conf-map", "conf", "subject"], ""));
      div.find("#text-vec").val(getWithDefault(confState, ["conf-map", "conf", "text-vec"], ""));
      setTimeoutOpr(confState, div);
    },
    "clojure-opr": function (state, confState) {
      var div = $("#clojure-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#code").val(getWithDefault(confState, ["conf-map", "conf", "code"], "(fn [ctx] \"undefined clojure function\")"));
    },
    "js-opr": function (state, confState) {
      var div = $("#js-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#code").val(getWithDefault(confState, ["conf-map", "conf", "code"], "function (ctx) {return \"undefined javascript function\";}"));
    },
    "play-sound-opr": function (state, confState) {
      var div = $("#play-sound-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#code").val(getWithDefault(confState, ["conf-map", "conf", "path"], "resources/public/sound/housprob.wav"));
    },
    "sql-read-opr": function(state,confState) {
      var div=$("#sql-read-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#classname").val(getWithDefault(confState,["conf-map", "conf", "db", "classname"], "org.h2.Driver"));
      div.find("#subprotocol").val(getWithDefault(confState,["conf-map", "conf", "db", "subprotocol"], "h2"));
      div.find("#subname").val(getWithDefault(confState,["conf-map", "conf", "db", "subname"], "/tmp/testdb"));
      div.find("#user").val(getWithDefault(confState,["conf-map", "conf", "db", "user"], ""));
      div.find("#password").val(getWithDefault(confState,["conf-map", "conf", "db", "password"], ""));
      div.find("#query").val(getWithDefault(confState,["conf-map", "conf", "query"], "select count(*) from estados"));
      setTimeoutOpr(confState, div);
    },
    "get-mail-opr": function(state,confState) {
      var div=$("#get-mail-oprDialog");
      setLogit(confState, div);
      div.find("#state-name").val(state.key);
      div.find("#host").val(getWithDefault(confState,["conf-map", "conf", "host"], "pop.gmail.com"));
      div.find("#port").val(getWithDefault(confState,["conf-map", "conf", "port"], "995"));
      div.find("#protocol").val(getWithDefault(confState,["conf-map", "conf", "protocol"], "pop3s"));
      div.find("#email").val(getWithDefault(confState,["conf-map", "conf", "email"], ""));
      div.find("#password").val(getWithDefault(confState,["conf-map", "conf", "password"], ""));
      div.find("#subject-re").val(getWithDefault(confState,["conf-map", "conf", "subject-re"], ".*"));
      setTimeoutOpr(confState, div);
    }     
  }; 

  var removeState = function(opr) {
    var div = $("#" + opr + "Dialog");
    var state = states[div.find("#state-name").val()];
    var i, j;
    var nstates = [];
    var connectVec;
    var cur;
    for (i = 0; i < conf.states.length; i++) {
      cur = conf.states[i];
      if (cur.key !== state.key) {
        connectVec = [];
        if (cur.flow.connect !== undefined) {
          for (j = 0; j < cur.flow.connect.length; j += 2) {
            if (cur.flow.connect[j] !==  state.key) {
              connectVec.push(cur.flow.connect[j]);
              if (j < cur.flow.connect.length - 1) {
                if ((cur.flow.connect[j+2]!==state.key) || (cur.flow.connect[cur.flow.connect.length-1]!==state.key)) {
                  connectVec.push(cur.flow.connect[j + 1]);
                }
              }
            }
          }
        }
        cur.flow.connect = connectVec;
        nstates.push(conf.states[i]);
      }
    }
    conf.states = nstates;
    buildWorkspace(conf);
  };

  var getLogit = function(div, state) {
	  var flag = div.find("#logit").prop("checked") ? "true" : "false";
	  conf.states[state.conf_idx]["conf-map"].logit = flag;
  };
  
  var getTimeoutOpr = function(div, state) {
    var timeout = div.find("#timeout").val();
    var rCount = div.find("#retry-count").val();
    var rDelay = div.find("#retry-delay").val();
    conf.states[state.conf_idx]["conf-map"].timeout = timeout;
    conf.states[state.conf_idx]["conf-map"]["retry-count"] = rCount;
    conf.states[state.conf_idx]["conf-map"]["retry-delay"] = rDelay;
  };

  var oprOKFunc = {
	"send-stats-opr": function () {
	  var div = $("#send-stats-oprDialog");
	  var state = states[div.find("#state-name").val()];
	  var statsrows2send = div.find("#stats-rows2send").val();
	  var statsdays4clear = div.find("#stats-days4clear").val();
	  getLogit(div, state);
	  conf.states[state.conf_idx]["conf-map"].conf = {
		"stats-rows2send": statsrows2send,
		"stats-days4clear": statsdays4clear};
    },
    "fb-har-opr": function () {
        var div = $("#fb-har-oprDialog");
        var state = states[div.find("#state-name").val()];
        var browser = div.find("#browser option:selected").val();
        var uri = div.find("#uriHAR").val();
        var timeout = div.find("#timeout").val();
        var cache = $(div.find("#cache")).is(":checked");
        var delta = div.find("#delta").val();
        var binarypath = div.find("#binary-path").val();
        var profilepath = div.find("#profile-path").val();
        var harsdir = div.find("#hars-dir").val();
        getLogit(div, state);
        conf.states[state.conf_idx]["conf-map"].conf = {
          "browser": browser, 
          "uri": uri,
          "timeout": timeout, 
          "cache": cache,
          "delta": delta,
          "hars-dir": harsdir,
          "binary-path": binarypath,
          "profile-path": profilepath};
	},
    "browser-tc-opr": function () {
      var div = $("#browser-tc-oprDialog");
      var state = states[div.find("#state-name").val()];
      var browser = div.find("#browser option:selected").val();
      var uri = div.find("#uri").val();
      var timeout = div.find("#timeout").val();
      var cache=$(div.find("#cache")).is(":checked");
      var close=$(div.find("#close")).is(":checked");
      var delta = div.find("#delta").val();
      var n = div.find("#startchrono option:selected").val();
      var start = n.substring(0,n.indexOf("-"));
      var n = div.find("#stopchrono option:selected").val();
      var stop = n.substring(0,n.indexOf("-"));
      var binarypath = div.find("#binary-path").val();
      var profilepath = div.find("#profile-path").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {
        "browser": browser, 
        "uri": uri,
        "timeout": timeout, 
        "cache": cache, 
        "close": close,
        "delta": delta,
        "start-step": start,
        "stop-step": stop,
        "binary-path": binarypath,
        "profile-path": profilepath};
    },
    "sleep-opr": function () {
      var div = $("#sleep-oprDialog");
      var state = states[div.find("#state-name").val()];
      var delta = div.find("#delta").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"delta": delta};
    },
    "socket-opr": function () {
      var div = $("#socket-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var host = div.find("#host").val();
      var port = div.find("#port").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"host": host, "port": port};
    },
    "os-cmd-opr": function () {
      var div = $("#os-cmd-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var shell = div.find("#shell").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"shell": shell};
    },
    "human-opr": function () {
    	getLogit(div, state);
    },
    "switch-good-opr": function () {
    	getLogit(div, state);
    },
    "switch-bad-opr": function () {
      var div = $("#switch-bad-oprDialog");
      var state = states[div.find("#state-name").val()];
      var minutes2wait = div.find("#minutes2wait").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"minutes2wait": minutes2wait};
    },
    "date-time-opr": function () {
      var div = $("#date-time-oprDialog");
      var state = states[div.find("#state-name").val()];
      var format = div.find("#format").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"format": format};
    },
    "log-opr": function () {
      var div = $("#log-oprDialog");
      var state = states[div.find("#state-name").val()];
      var level = div.find("#log-levels option:selected").val();
      var text = div.find("#text").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"level": level, "text": text};
    },
    "print-msg-opr": function () {
      var div = $("#print-msg-oprDialog");
      var state = states[div.find("#state-name").val()];
      var msg = div.find("#msg").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"msg": msg};
    },
    "print-context-opr": function () {
      var div = $("#print-context-oprDialog");
      var state = states[div.find("#state-name").val()];
      var filter = div.find("#filter-re").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"filter-re": filter};
    },
    "get-http-opr": function () {
      var div = $("#get-http-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var url = div.find("#url").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"url": url};
    },
    "post-http-opr": function () {
      var div = $("#post-http-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var url = div.find("#url").val();
      var params = div.find("#params").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"url": url, "params": params};
    },
    "send-mail-opr": function () {
      var div = $("#send-mail-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var host = div.find("#host").val();
      var port = div.find("#port").val();
      var tmp=$(div.find("#ssl")).is(":checked");
      var ssl = tmp;
      var user = div.find("#user").val();
      var password = div.find("#password").val();
      var tovec = div.find("#to-vec").val();
      var subject = div.find("#subject").val();
      var textvec = div.find("#text-vec").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {
        "host": host, 
        "port": port,
        "ssl": ssl,
        "user": user,
        "passwd": password,
        "to-vec": tovec,
        "subject": subject,
        "text-vec": textvec
      };
    },
    "clojure-opr": function () {
      var div = $("#clojure-oprDialog");
      var state = states[div.find("#state-name").val()];
      var code = div.find("#code").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"code": code};
    },
    "js-opr": function () {
      var div = $("#js-oprDialog");
      var state = states[div.find("#state-name").val()];
      var code = div.find("#code").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"code": code};
    },
    "play-sound-opr": function () {
      var div = $("#play-sound-oprDialog");
      var state = states[div.find("#state-name").val()];
      var path = div.find("#path").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {"path": path};
    },
    "sql-read-opr": function() {
      var div=$("#sql-read-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var classname=div.find("#classname").val();
      var subprotocol=div.find("#subprotocol").val();
      var subname=div.find("#subname").val();
      var user=div.find("#user").val();
      var password=div.find("#password").val();
      var query=div.find("#query").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf = {
        "db" : {"classname": classname, "subprotocol": subprotocol, "subname": subname, "user": user, "password": password},
        "query" : query
      };
    },
    "get-mail-opr": function() {
      var div=$("#get-mail-oprDialog");
      var state = states[div.find("#state-name").val()];
      getTimeoutOpr(div, state);
      var host=div.find("#host").val();
      var port=div.find("#port").val();
      var protocol=div.find("#protocol").val();
      var email=div.find("#email").val();
      var password=div.find("#password").val();
      var subjectre=div.find("#subject-re").val();
      getLogit(div, state);
      conf.states[state.conf_idx]["conf-map"].conf ={
        "host" : host,
        "port" : port,
        "protocol" : protocol,
        "email" : email,
        "password" : password,
        "subject-re" : subjectre
      };
    }
  };

  var updateState = function() {
    var state = states[this.group[0].key];
    var confState = conf.states[state.conf_idx];
    var opr = confState["conf-map"].opr;
    oprSetFunc[opr](state, confState);
    var getDialog4Opr = function(opr) {
      var oprDiag = opr + "Dialog";
      if (oprDiags[oprDiag] === undefined) {
        oprDiags[oprDiag] = $("#" + oprDiag).dialog({
          autoOpen: false,
          modal: true,
          width: 'auto',
          buttons: {
            "Aceptar": function() {
              oprOKFunc[opr]();
              $(this).dialog("close");
            },
            "Eliminar": function() {
              removeState(opr);
              each(states,function (state) {
                state.r_t_i_set.dblclick(updateState);
              });
              $(this).dialog("close");
            },
            "Cancelar": function() {
              $(this).dialog("close");
            }
          }
        });
      }
      return oprDiags[oprDiag];
    };
    getDialog4Opr(opr).dialog("open");
  };

  var buildWorkspaceAndInitDblClick = function(conf) {
    buildWorkspace(conf);
    var stateName;
    for (stateName in states) {
      if (states.hasOwnProperty(stateName)) {
        states[stateName].r_t_i_set.dblclick(updateState);
      }
    }
  };

  var fillSelect = function(json, tagLabel) {
    var combo = jQuery(tagLabel).empty();
    var selected = NV;
    var i;
    for (i = 0; i < json.length; i += 1) {
      if (i === 0) {
        combo.prepend('<option value = "' + json[i] + '" selected = "selected">' + json[i] + '</option>');
        selected = json[i];
      } else {
        combo.prepend('<option value = "' + json[i] + '">' + json[i] + '</option>');
      }
    }
    return selected;
  };

  var removeFromArr = function(arr, value) {
    var tmp = [];
    var i;
    for (i === 0; i < arr.length; i++) {
      if (value !== arr[i]) {
        tmp.push(arr[i]);
      }
    }
    return tmp;
  };

  var instanceChange = function() {
    showRobot(HIDE_ROBOT);
    inst = jQuery("#instances option:selected").text();
    startMonitoring(true);
  };

  var setMonitor = function(monitorVal) {
    monitoring = monitorVal;
    if (!monitoring) {
      showRobot(HIDE_ROBOT);
    }
  };


 var fillInstances = function(instances) {
    inst = fillSelect(instances, "#instances");
    jQuery("#instances").change(instanceChange);
    setMonitor(true);
    instanceChange();
  };

  var applicationChange = function() {
    setMonitor(false);
    app = jQuery("#applications option:selected").text();
    inst = NV;
    jQuery.ajax({
      url: "/apps/" + app,
      dataType: "json",        
      success: fillInstances
    });
    jQuery.ajax({
      url: "/conf/" + app,
      dataType: "json",
      success: buildWorkspaceAndInitDblClick
    });
  };

  return {
	showFFOptions: showFFOptions,
    fillApplications: function(apps) {
      if (apps.length > 0) {
        app=fillSelect(apps,"#applications");
        jQuery("#applications").change(applicationChange);
        jQuery.ajax({
          url: "/apps/" + app,
          dataType: "json",
          success: fillInstances
        });
        inst=NV; 
        jQuery.ajax({
          url: "/conf/" + app,
          dataType: "json",
          success: buildWorkspaceAndInitDblClick
        });
      }
    },
    fillOperations: function(oprs) {
      fillSelect(oprs, "#operations");
    },
    setMonitoring: function(monitoringVal) {
      setMonitor(monitoringVal);
    },
    startMonitoring: function(monitoring) {
        startMonitoring(monitoring);
      },
    startInstance: function() {
      jQuery.ajax({
        url: "/apps/" + app + "/" + inst,
        //dataType: "json",
        data: {"cmd": "start"},
        success: function(result) {
          jQuery("#result-str").text(result);
          startMonitoring(false);
        }
      });
      jQuery("#start-button").hide();
    },
    stopInstance: function() {
      jQuery.ajax({
        url: "/apps/" + app + "/" + inst,
        //dataType: "json",
        data: {"cmd": "stop"},
        success: function(result) {
          jQuery("#result-str").text(result);
          startMonitoring(false);
        }
      });
      jQuery("#stop-button").hide();
    },
    resumeInstance: function() {
      var msg = jQuery("#resume-msg").val();
      jQuery.ajax({
        url: "/apps/" + app + "/" + inst,
        //dataType: "json",
        data: {"cmd": "resume",
               "msg": msg},
        success: function(result) {
          jQuery("#result-str").text(result);
          startMonitoring(false);
        }
      });
      jQuery("#resume").hide();
    },
    saveStates: function() {
      jQuery.ajax({
        type: "POST",
        url: "/store/save/" + app,
        dataType: "json",
        data: {"conf": conf},
        success: function(result) {
          alert(result.result);
          applicationChange();
          setMonitor(true);
          startMonitoring(true);
        }
      });
    },
    setWorkspace: function (wrkspc) {
      workspace=wrkspc;
    },
    currentApp: function() {
      return app;
    },
    gNV: function() {
      return NV;
    },
    addNewState: function(newState) {
      var len=0;
      if (conf !== undefined && conf.states !== undefined) {
        len=conf.states.length;
        if (len > 0) {
          for (var i=0; i<len; i++) {
            if (conf.states[i].key === newState.key) {
              alert("Error ya existe otro estado con ese nombre!");
              return;
            }
          }
        }
      }
      
      buildState(len,newState).r_t_i_set.dblclick(updateState);
      conf.states.push(newState);

//init new state
      var opr = newState["conf-map"].opr;
      oprSetFunc[opr](newState,newState);
      var div = $("#"+opr+"Dialog");
      //alert(newState["conf-map"].opr);
      div.find("#state-name").val(newState.key);
      oprOKFunc[newState["conf-map"].opr]();
    },
    createArrowDiag: function() {
      arrowDialog = $("#arrowDialog").dialog({
        autoOpen: false,
        modal: true,
        buttons : {
          "Aceptar": function() {
            var state = states[$("#arrowStateName").val()];
            var other = states[$("#arrowOtherStateName").val()];
            var connectArr = conf.states[state.conf_idx].flow.connect;
            var i = $("#arrowCnctIdx").val();
            if (i<connectArr.length) {
              connectArr[i] = $("#regexp").val();
            }
            removeArrows(state, other.key);
            reConnectStates(state, other.key);
            $(this).dialog("close");
          },
          "Eliminar": function() {
            var state = states[$("#arrowStateName").val()];
            var other = states[$("#arrowOtherStateName").val()];
            var connectArr = conf.states[state.conf_idx].flow.connect;
            var i = parseInt($("#arrowCnctIdx").val(), 10) - 1;
            var nconnectArr = [];
            var j;
            for (j = 0; j < connectArr.length; j += 2) {
              if (i !== j) {
                nconnectArr.push(connectArr[j]);
                if (j < connectArr.length - 1) {
                  if (((j+2) !== i) || (i!==connectArr.length-1)) {
                    nconnectArr.push(connectArr[j + 1]);
                  }
                }
              }
            }
            removeArrows(state, other.key);
            state.statesOut = removeFromArr(state.statesOut, other.key);
            other.statesIn = removeFromArr(other.statesIn, state.key);
            conf.states[state.conf_idx].flow.connect = nconnectArr;
            $(this).dialog("close");
          },
          "Cancelar": function() {
            $(this).dialog("close");
          }
        }
      });
    },
    applicationsScreen: function() {
      jQuery("#robot-screen").hide();
      jQuery("#app-screen").show();
    }
  };
}());


jQuery(document).ready(function() {
  jQuery("#browser-tc-oprDialog #browser").change(function () {cbot.showFFOptions("#browser-tc-oprDialog")});
  jQuery("#fb-har-oprDialog #browser").change(function () {cbot.showFFOptions("#fb-har-oprDialog")});
	
  cbot.setWorkspace(new Raphael("states", "740", "400"));
  cbot.createArrowDiag();
  jQuery("#start-button").click(cbot.startInstance);
  jQuery("#stop-button").click(cbot.stopInstance);
  jQuery("#resume-button").click(cbot.resumeInstance);
  jQuery("#add-state").click(function() {
    if (cbot.currentApp() !== cbot.gNV()) {
      var stateName = jQuery("#state-name").val().trim();
      if (stateName==="") {
        alert("No se ha indicado el nombre del estado a agregar!");
      }
      else if ((/:/).test(stateName)) {
        alert("No es v��lido que el nombre del estado contenga el cartacter ':'");
      }
      else {
        var stateOpr = jQuery("#operations option:selected").text();
        var newState = {flow: {x: 500, y: 300, connect: []}, key: ":"+stateName,
                      "conf-map": {opr: stateOpr, conf: []}};
        cbot.addNewState(newState);
      }

    }
  });
  jQuery("#save-states").click(cbot.saveStates);

  jQuery("#start-monitor-button").click(function () {
    cbot.setMonitoring(true);
    cbot.startMonitoring(true);
  });  
  jQuery("#stop-monitor-button").click(function () {
    cbot.setMonitoring(false);
    cbot.startMonitoring(true);
  });
  jQuery.ajax({
    url: "/operations",
    dataType: "json",
    success: cbot.fillOperations
  });
  
  jQuery("#app-link").click(cbot.applicationsScreen);
/*
  jQuery("#startchrono").focus(function() {
    jQuery.ajax({
      url: jQuery("#uri").val(),
      dataType: "xml",
      success: function (result) {
        var trs=result.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        var combo = jQuery("#startchrono").empty(); 
        for (var i=0; i<trs.length; i++) {
          var tds=trs[i].getElementsByTagName("td");
          var lbl=""+i+"-"+tds[0].innerHTML+" ";
          lbl=lbl+tds[1].innerHTML+" ";
          lbl=lbl+tds[2].innerHTML+" ";

          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        }
      },
      error: function() {
        var combo = jQuery("#startchrono").empty(); 
        combo.append('<option value="0-step" selected="selected">0-step</option>');
        for (var i=1; i<99; i++) {
          var lbl=""+i+"-step";
          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        };
        combo.append('<option value="99-step">99-step</option>');
      }
    });      
  });
  */
/*
  jQuery("#stopchrono").focus(function() {
    jQuery.ajax({
      url: jQuery("#uri").val(),
      dataType: "xml",
      success: function (result) {
        var trs=result.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        var combo = jQuery("#stopchrono").empty();
        for (var i=0; i<trs.length; i++) {
          var tds=trs[i].getElementsByTagName("td");
          var lbl=""+i+"-"+tds[0].innerHTML+" ";
          lbl=lbl+tds[1].innerHTML+" ";
          lbl=lbl+tds[2].innerHTML+" ";
          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        }
      },
      error: function() {
        var combo = jQuery("#stopchrono").empty(); 
        combo.append('<option value="0-step">0-step</option>');
        for (var i=1; i<99; i++) {
          var lbl=""+i+"-step";
          combo.append('<option value = "' + lbl + '">' + lbl + '</option>');
        };
        combo.append('<option value="99-step" selected="selected">99-step</option>');
      }
    });      
  });
  */
  jQuery("#loadchrono").click(function() {
    jQuery.ajax({
      url: jQuery("#uri").val(),
      dataType: "xml",
      success: function (result) {
        var trs=result.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        var comboStart = jQuery("#startchrono").empty();
        var comboStop = jQuery("#stopchrono").empty();
        for (var i=0; i<trs.length; i++) {
          var tds=trs[i].getElementsByTagName("td");
          var lbl=""+i+"-"+tds[0].innerHTML+" ";
          lbl=lbl+tds[1].innerHTML+" ";
          lbl=lbl+tds[2].innerHTML+" ";
          comboStart.append('<option value = "' + lbl + '">' + lbl + '</option>');
          comboStop.append('<option value = "' + lbl + '">' + lbl + '</option>');
        }
      },
      error: function() {
        var comboStart = jQuery("#startchrono").empty(); 
        var comboStop = jQuery("#stopchrono").empty();
        comboStop.append('<option value="0-step">0-step</option>');       
        comboStart.append('<option value="0-step" selected="selected">0-step</option>');
        for (var i=1; i<99; i++) {
          var lbl=""+i+"-step";
          comboStart.append('<option value = "' + lbl + '">' + lbl + '</option>')
          comboStop.append('<option value = "' + lbl + '">' + lbl + '</option>');
        };
        comboStart.append('<option value="99-step">0-step</option>');       
        comboStop.append('<option value="99-step" selected="selected">99-step</option>');
      }
    });      
  })
  var apps = jQuery("#applications");
  apps.empty();
  jQuery.ajax({
    url: "/apps",
    dataType: "json",
    success: cbot.fillApplications
  });
});

