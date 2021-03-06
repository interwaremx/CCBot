var rstatus = (function () {
  var operationNameDR = "detener robot";
  var operationNameIR = "iniciar robot";
  var operationNameInstR = "instalar robot";

  var setImage = function (elemImg, ip) {
    jQuery.ajax({
      type: "GET",
      url: "/admin/get-status-img",
      data: {
        "ip": ip
      },
      dataType: generalVal.getGenDataType(),
      success: function (props) {
        elemImg.prop("src", props.src);
        elemImg.prop("title", props.title);
      }
    });
  };

  var extractIp = function (elem) {
    var ip = $(elem).parent().children("input").prop("value");
    return ip;
  };

  var extractImg = function (elem) {
    return jQuery(elem).children("img");
  };

  var processStatus = function (elem, elemImg, ip) {
    elemImg.prop("src", "/images/engrane.gif");
    jQuery.ajax({
      type: "GET",
      url: "/admin/get-rts-of",
      data: {
        "ip": ip,
        "timeout": 5000
      },
      timeout: generalVal.getGenTimeout(),
      error: function () {
        setImage(elemImg, ip);
      },
      success: function () {
        setImage(elemImg, ip);
      }
    });
  }

  var status = function (xthis) {
    var ip = extractIp(xthis);
    var elemImg = extractImg(xthis);
    processStatus(xthis, elemImg, ip);
  };

  var start = function (xthis) {
    generalVal.cleanErrors();
    var ip = extractIp(xthis);
    var elemImg = extractImg(xthis);
    var icono = elemImg.prop("src");
    if (/waiting.gif$/.test(icono)) {
      processStatus(xthis, elemImg, ip);
    } else if (/stop.gif$/.test(icono)) {
      if (generalVal.validateOperationAndAddMsg(operationNameIR, " URL: " + ip)) {
        elemImg.prop("src", "/images/engrane.gif");
        jQuery.ajax({
          type: "GET",
          url: "/admin/remote-start",
          data: {
            "ip": ip
          },
          dataType: generalVal.getGenDataType(),
          timeout: generalVal.getGenTimeout(),
          error: function (a, b, c) {
            setImage(elemImg, ip);
          },
          success: function (a) {
            setImage(elemImg, ip);
          }
        });
      };
    } else if (/start.gif$/.test(icono)) {
      generalVal.createError("El robot ya se encuentra en ejecuci&oacute;n! URL: " + ip);
    } else {
      generalVal.createError("Por favor, espere a que la operaci&oacute;n en proceso termine! URL: " + ip);
    }
  };

  var stop = function (xthis, opr) {
    generalVal.cleanErrors();
    var ip = extractIp(xthis);
    var elemImg = extractImg(xthis);
    var icono = elemImg.prop("src");
    if (/waiting.gif$/.test(icono)) {
      processStatus(xthis, elemImg, ip);
    } else if (/stop.gif$/.test(icono)) {
      generalVal.createError("El robot ya se encuentra detenido! URL: " + ip);

    } else if (/start.gif$/.test(icono)) {
      if (generalVal.validateOperationAndAddMsg(operationNameDR, " URL: " + ip)) {
        elemImg.prop("src", "/images/engrane.gif");
        jQuery.ajax({
          type: "GET",
          url: "/admin/remote-stop",
          data: {
            "ip": ip
          },
          dataType: generalVal.getGenDataType(),
          timeout: generalVal.getGenTimeout(),
          error: function (a, b, c) {
            setImage(elemImg, ip);
          },
          success: function (a) {
            setImage(elemImg, ip);
          }
        });
      };
    } else {
      generalVal.createError("Por favor, espere a que la operaci&oacute;n en proceso termine! URL: " + ip);
    }
  };

  var install = function (xthis, opr) {
    generalVal.cleanErrors();
    var ip = extractIp(xthis);
    var elemImg = extractImg(xthis);
    var icono = elemImg.prop("src");
    if (/waiting.gif$/.test(icono)) {
      processStatus(xthis, elemImg, ip);
    } else if (/stop.gif$/.test(icono)) {
      if (generalVal.validateOperationAndAddMsg(operationNameInstR, " URL: " + ip)) {
        elemImg.prop("src", "/images/engrane.gif");
        jQuery.ajax({
          type: "GET",
          url: "/admin/send-distro",
          data: {
            "ip": ip
          },
          dataType: generalVal.getGenDataType(),
          timeout: generalVal.getGenTimeout() * 4,
          error: function (a, b, c) {
            setImage(elemImg, ip);
          },
          success: function (a) {
            setImage(elemImg, ip);
          }
        });
      }
    } else if (/start.gif$/.test(icono)) {
      generalVal.createError("El robot ya se encuentra en ejecuci&oacute;n, no se puede reinstalar! URL: " + ip);
    } else {
      generalVal.createError("Por favor, espere a que la operaci&oacute;n en proceso termine! URL: " + ip);
    }
  };

  return {
    "status": status,
    "start": start,
    "stop": stop,
    "install": install
  };
}());