"use strict";

/*jslint
    indent: 2, browser: true, sloppy: true, vars: true, cap: false, plusplus: true, maxerr: 50 
*/

var signupCtrl = (function() {
  // Nombre de la operación principal (se pueden definir más).
  var operationName = "crear usuario";
  var validatorResult;

  var crea = function () {
    if (validatorResult.form()) {
      if (generalVal.validateOperation(operationName)) {
        generalVal.blockScreen();	
	var user={};
	user.ip=jQuery("#userid").val();
	user.pass=jQuery("#pass").val();
		
	jQuery.ajax({
	  type: "POST",
	  url: "/signup",
	  data: user,
	  dataType: generalVal.getGenDataType(),
	  timeout: generalVal.getGenTimeout(),
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
      jQuery("#crear").click(crea);
	  
      jQuery.validator.addMethod("mailformat", function(value, element, params) {
        return this.optional(element) || params.test(value);
      }, "El formato de mail corporativo es incorrecto!");
      validatorResult=jQuery("#appform").validate({
        errorElement: "p",
       	errorContainer: "#divMessages",
    	errorLabelContainer: "#divMessages",
        rules: {userid: {required: true,
                         mailformat: generalVal.getMailRegExp()},
		pass: {required: true,
                       minlength: 6}
               },
        messages: {
          userid: {required: "No se ha definido un valor para el campo mail corporativo!"},
          pass: {required: "No se ha definido un valor para el campo password!",
                 minlength: "La longitud del campo password es incorrecta, se requieren 6 caracteres!"}
         }
     });
    } 
  };
}());

jQuery(document).ready(signupCtrl.init);
