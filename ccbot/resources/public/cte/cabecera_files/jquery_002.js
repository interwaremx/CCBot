/*
 * jQuery Guia plugin
 * Version 1.00 (01/05/2010)
 * @requires jQuery v1.2.3 or later
 *
 * Copyright (c) 2010 INTERFAZ DE USUARIO Y USABILIDAD
 */

(function($) {

// definici�n de la funci�n  
$.fn.menuGuia = function(options){  
    // puede recibir un array de par�metros nombrados  
    // invocamos a una funci�n gen�rica que hace el merge   
    // entre los recibidos y los de por defecto   
    var opts = $.extend({}, $.fn.menuGuia.defaults, options);	

    // para cada componente que puede contener el objeto jQuery que invoca a esta funci�n  
    this.each(function(){  
        
		var keonMenuGuia = document.createElement("div");      
		keonMenuGuia.id = "keonMenuGuia";       
			   
		keonMenuGuia.innerHTML = "<div class='DivSlideGuiaEscenario'><div id='panel'><iframe id='frameGuia' src='"+opts. url_guia+"' frameborder='0' scrolling='no' height='100%' width='100%'></iframe></div><div class='globX'><span class='slideX'><a href='#' class='btn-slide' id='btnTituloVentana'>"+opts. titulo+"</a></span></div></div>";
		
		document.body.appendChild(keonMenuGuia);		
		//$.html(keonMenuGuia);              

		//-- Funcion plegar/desplegar guia
		$(".btn-slide").toggle(
		  function () {			
			$('DivSlideGuiaEscenario').css('z-index','998');
			$('div.DivPagina').unblock({fadeOut:0}).block({ message: null });
			$("#panel").slideToggle("slow");
			$(this).toggleClass("slide-active");
			return false;
		  },
		  function () {			
			$("#panel").slideToggle("slow", function () {
				//keonFinPeticion();
			});	
			$('DivSlideGuiaEscenario').css('z-index','994');
			$('div.DivPagina').unblock();
			$(this).removeClass("slide-active");
			return false;
			
		  }
		);
       
    });  
  
};  

 

// definimos los par�metros junto con los valores por defecto de la funci�n  
$.fn.menuGuia.defaults = {    
    titulo: 'Gu�a',
    url_guia: 'menu.html'
};

})(jQuery);

// Funcion plegar guia para asociar a la accion del item
function ocultarGuia(){	
	//keonEnvioPeticion();
	$(".btn-slide").click();	
}