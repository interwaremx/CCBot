var rstatus = (function () {
  var setImage = function (elemImg, ip) {
    jQuery.ajax({
      type: "GET",
      url: "/admin/get-status-img",
      data: {
        "ip": ip
      },
      dataType: "JSON",
      success: function (props) {
        elemImg.prop("src", props.src);
        elemImg.prop("title", props.title);
      }
    });
  };

  var getStatus = function () {
    var ip = $(this).parent().children("input").prop("value");
    var elemImg = jQuery(this).children("img");
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
  };

  return {
    "clickStatus": getStatus
  };
}());