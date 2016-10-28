/*
 * jQuery blockUI plugin
 * Version 2.02 (04/07/2008)
 * @requires jQuery v1.2.3 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2008 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 * Special thanks to Amir-Hossein Sobhi for some excellent contributions!
 */
var contLitBlockUI=0;
function dbLiteralesBlockUI(literal, es_ES, ca_ES,eu_ES, gl_ES, en_GB, fr_FR, de_DE, va_ES, pt_PT, es_MX, es_AR, es_CO, es_PE, es_PR, es_VE, es_CL, pt_BR, en_US, it_IT){
	this.literal=literal;
	this.es_ES=es_ES;
	this.ca_ES=ca_ES;
	this.eu_ES=eu_ES;
	this.gl_ES=gl_ES;
	this.en_GB=en_GB;
	this.fr_FR=fr_FR;
	this.de_DE=de_DE;
	this.va_ES=va_ES;
	this.pt_PT=pt_PT;
	this.es_MX=es_MX;
	this.es_AR=es_AR;
	this.es_CO=es_CO;
	this.es_PE=es_PE;
	this.es_PR=es_PR;
	this.es_VE=es_VE;
	this.es_CL=es_CL;
	this.pt_BR=pt_BR;
	this.en_US=en_US;
	this.it_IT=it_IT;
	return this;
}
var literalesBlockUI=new Array();
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Procesando","Procesando su petici&oacute;n.","Processant la seva petició.","Zure eskaria prozesatzean.","Procesando a súa solicitude","Processing your request.","Traitement de votre demande.","Bei der Bearbeitung Ihrer Anfrage.","Processant la seva petició.","Processamento de seu pedido.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Procesando su petici&oacute;n.","Processamento de seu pedido.","Processing your request.","L'elaborazione della tua richiesta.");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Espere","Espere por favor...","Espereu si us plau ...","Mesedez, itxaron ...","Espere por favor...","Please wait...","S'il vous plaît patienter...","Bitte warten...","Espereu si us plau...","Por favor, aguarde...","Espere por favor...","Espere por favor...","Espere por favor...","Espere por favor...","Espere por favor...","Espere por favor...","Espere por favor...","Por favor, aguarde...","Please wait...","Attendere prego...");

literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Informacion importante","Informaci&oacute;n importante","Informació important","Informazio garrantzitsua","Informaci&oacute;n importante","Important information","Renseignements importants","Wichtige Informationen","Informació important","Informações importantes","Informaci&oacute;n importante","Informaci&oacute;n importante","Informaci&oacute;n importante","Informaci&oacute;n importante","Informaci&oacute;n importante","Informaci&oacute;n importante","Informaci&oacute;n importante","Informações importantes","Important information","Informazioni importanti");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Informacion","Informaci&oacute;n","Informació","Informazioa","Informaci&oacute;n","Information","Informations","Information","Informació","Informações","Informaci&oacute;n","Informaci&oacute;n","Informaci&oacute;n","Informaci&oacute;n","Informaci&oacute;n","Informaci&oacute;n","Informaci&oacute;n","Informações","Information","Informazioni");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Pregunta","Pregunta","Pregunta","Galdera","Pregunta","Question","Question","Frage","Pregunta","Pergunta","Pregunta","Pregunta","Pregunta","Pregunta","Pregunta","Pregunta","Pregunta","Pergunta","Question","Questione");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Confirmacion","Confirmaci&oacute;n","Confirmació","Baieztapen","Confirmaci&oacute;n","Confirmation","Confirmation","Bestätigung","Confirmació","Confirmação","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmaci&oacute;n","Confirmação","Confirmation","Conferma");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Error","Error","Error","Errorea","Error","Error","Erreur","Fehler","Error","Erro","Error","Error","Error","Error","Error","Error","Error","Erro","Error","Errore");

literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Aceptar","Aceptar","Acceptar","Onartu","Aceptar","Accept","Accepter","Akzeptieren","Acceptar","Aceitar","Aceptar","Aceptar","Aceptar","Aceptar","Aceptar","Aceptar","Aceptar","Aceitar","Accept","Accettare");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Cancelar","Cancelar","Cancel","Ezeztatu","Cancelar","Cancel","Annuler","Stornieren","Cancel","Cancelar","Cancelar","Cancelar","Cancelar","Cancelar","Cancelar","Cancelar","Cancelar","Cancelar","Cancel","Annullare");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Si","Si","Si","Bada","Si","Yes","Oui","Wenn","Si","Se","Si","Si","Si","Si","Si","Si","Si","Se","Yes","Se");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("No","No","No","No","Non","No","Aucun","Nicht","No","Não","No","No","No","No","No","No","No","Não","No","No");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Cerrar","Cerrar","Tancar","Close","Pechar","Close","Fermer","Schließen","Tancar","Fechar","Cerrar","Cerrar","Cerrar","Cerrar","Cerrar","Cerrar","Cerrar","Fechar","Close","Chiudere");
literalesBlockUI[contLitBlockUI++] = new dbLiteralesBlockUI("Continuar","Continuar","Continuar","Jarraitu","Continuar","Continue","Continuer","Fortsetzen","Continuar (va_ES)","Continuar","Continuar","Continuar","Continuar","Continuar","Continuar","Continuar","Continuar","Continuar","Continue","Continuare");

function getLiteralBlockUI(literal){
	for(i=0;i<literalesBlockUI.length;i++){
		if(literalesBlockUI[i].literal==literal){
			try{
				return eval("literalesBlockUI[i]."+locale_Arquitectura);
			}catch(err){
				return literalesBlockUI[i].es_ES;
			}
		}
	}	
}
 
//var imgPrecarga = new Image();
var imgPrecarga= document.createElement('img'); 
imgPrecarga.src= '/keon_mult_mult_pub/images/loadingAnimation.gif';
(function($) {

if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery)) {
    alert('blockUI requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
    return;
}

// global $ methods for blocking/unblocking the entire page
$.blockUI   = function(opts) { install(window, opts); };
$.unblockUI = function(opts) { remove(window, opts); };

// plugin method for blocking element content
$.fn.block = function(opts) {
    return this.each(function() {
        if ($.css(this,'position') == 'static')
            this.style.position = 'relative';
        if ($.browser.msie) 
            this.style.zoom = 1; // force 'hasLayout'
        install(this, opts);
		
    });
};

// plugin method for unblocking element content
$.fn.unblock = function(opts) {
    return this.each(function() {
        remove(this, opts);
    });
};

$.blockUI.version = 2.02; // 2nd generation blocking at no extra cost!

// override these in your code to change the default behavior and style
$.blockUI.defaults = {
    // message displayed when blocking (use null for no message)
    message:  '<h1>Please wait...</h1>',
    
    // styles for the message when blocking; if you wish to disable
    // these and use an external stylesheet then do this in your code:
    // $.blockUI.defaults.css = {};
    css: { 
        padding:        0,
        margin:         0,
        width:          '30%', 
        top:            '40%', 
        left:           '35%', 
        textAlign:      'center', 
        color:          '#000', 
        border:         '3px solid #aaa',
        backgroundColor:'#fff',
        cursor:         'default' //flaco
    },
    
    // styles for the overlay
    overlayCSS:  { 
        backgroundColor:'#000', 
        opacity:        '0.5' 
    },
    
    // allow body element to be stetched in ie6; this makes blocking look better
    // on "short" pages.  disable if you wish to prevent changes to the body height
    allowBodyStretch: true,
    
    // be default blockUI will supress tab navigation from leaving blocking content;
    constrainTabKey: true,
    
    // fadeOut time in millis; set to 0 to disable fadeout on unblock
    fadeOut: false,
    
    // suppresses the use of overlay styles on FF/Linux (due to significant performance issues with opacity)
    applyPlatformOpacityRules: true
};

// private data and functions follow...

//var ie6 = $.browser.msie && /MSIE 6.0/.test(navigator.userAgent);
var ie6 = $.browser.msie && (/MSIE 6.0/.test(navigator.userAgent) || /MSIE 7.0/.test(navigator.userAgent));
var pageBlock = null;
var pageBlockEls = [];

function install(el, opts) {
    var full = (el == window);
    var msg = opts && opts.message !== undefined ? opts.message : undefined;
    opts = $.extend({}, $.blockUI.defaults, opts || {});
    opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
    var css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
    msg = msg === undefined ? opts.message : msg;

    // remove the current block (if there is one)
    if (full && pageBlock) 
        remove(window, {fadeOut:0}); 
    
    // if an existing element is being used as the blocking content then we capture
    // its current place in the DOM (and current display style) so we can restore
    // it when we unblock
    if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
        var node = msg.jquery ? msg[0] : msg;
        var data = {};
        $(el).data('blockUI.history', data);
        data.el = node;
        data.parent = node.parentNode;
        data.display = node.style.display;
        data.parent.removeChild(node);
    }
    
    // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
    // layer1 is the iframe layer which is used to supress bleed through of underlying content
    // layer2 is the overlay layer which has opacity and a wait cursor
    // layer3 is the message content that is displayed while blocking

    var lyr1 = ($.browser.msie) ? $('<iframe class="blockUI" style="z-index:995;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="javascript:false;"></iframe>')
                                : $('<div class="blockUI" style="display:none"></div>');
    var lyr2 = $('<div class="blockUI" style="z-index:996;cursor:default;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
    var lyr3 = full ? $('<div class="blockUI blockMsg blockPage" style="z-index:997;position:fixed"></div>')
                    : $('<div class="blockUI blockMsg blockElement" style="z-index:997;display:none;position:absolute"></div>');

    // if we have a message, style it
    if (msg) 
        lyr3.css(css);

    // style the overlay
    if (!opts.applyPlatformOpacityRules || !($.browser.mozilla && /Linux/.test(navigator.platform))) {
        lyr2.css(opts.overlayCSS);
    } else{
       if(opts.overlayCSS && ($.browser.mozilla && /Linux/.test(navigator.platform))) 
	 lyr2.css({background: 'rgba(000, 000, 000, 0.5)'});
    } 
    lyr2.css('position', full ? 'fixed' : 'absolute');
    
    // make iframe layer transparent in IE
    if ($.browser.msie) 
        lyr1.css('opacity','0.0');

    $([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);

    // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
    var expr = $.browser.msie && (!$.boxModel || $('object,embed', full ? null : el).length > 0);
    if (ie6 || expr) {
        // give body 100% height
        if (full && opts.allowBodyStretch && $.boxModel)
            $('html,body').css('height','100%');

        // fix ie6 issue when blocked element has a border width
        if ((ie6 || !$.boxModel) && !full) {
            var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
            var fixT = t ? '(0 - '+t+')' : 0;
            var fixL = l ? '(0 - '+l+')' : 0;
        }

        // simulate fixed position
        $.each([lyr1,lyr2,lyr3], function(i,o) {
            var s = o[0].style;
            s.position = 'absolute';


            if (i < 2) {                
				
				/*full ? s.setExpression('height','(document.documentElement.scrollHeight || document.body.scrollHeight) > (document.documentElement.offsetHeight || document.body.offsetHeight) ? (document.documentElement.scrollHeight || document.body.scrollHeight) : (document.documentElement.offsetHeight || document.body.offsetHeight) + "px"')
                     : s.setExpression('height','this.parentNode.offsetHeight + "px"');*/
		
				full ? s.setExpression('height','(document.documentElement.scrollHeight || document.body.scrollHeight) > (document.documentElement.offsetHeight || document.body.offsetHeight) ? (document.documentElement.scrollHeight || document.body.scrollHeight)-4 : (document.documentElement.offsetHeight || document.body.offsetHeight)-4 + "px"')
                     : s.setExpression('height','this.parentNode.offsetHeight + "px"');

				//full ? s.setExpression('height','document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + "px"')
                //     : s.setExpression('height','this.parentNode.offsetHeight + "px"');

                full ? s.setExpression('width','jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"')
                     : s.setExpression('width','this.parentNode.offsetWidth + "px"');
                if (fixL) s.setExpression('left', fixL);
                if (fixT) s.setExpression('top', fixT);
            }
            else {
                if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                s.marginTop = 0;
            }
        });
    }
    
    // show the message
    lyr3.append(msg).show();
    if (msg && (msg.jquery || msg.nodeType))
        $(msg).show();

    // bind key and mouse events
    bind(1, el, opts);
        
    if (full) {
        pageBlock = lyr3[0];
        pageBlockEls = $(':input:enabled:visible',pageBlock);
        setTimeout(focus, 20);
    }
    else 
        center(lyr3[0]);
};

// remove the block
function remove(el, opts) {
    var full = el == window;
    var data = $(el).data('blockUI.history');
    opts = $.extend(true, {}, $.blockUI.defaults, opts);
    bind(0, el, opts); // unbind events
    var els = full ? $('body > .blockUI') : $('.blockUI', el);
    if (full) 
        pageBlock = pageBlockEls = null;

    if (opts.fadeOut) {
        els.fadeOut(opts.fadeOut);
        setTimeout(function() { reset(els,data); }, opts.fadeOut);
    }
    else
        reset(els, data);
};

// move blocking element back into the DOM where it started
function reset(els,data) {
    els.each(function(i,o) {
        // remove via DOM calls so we don't lose event handlers
        if (this.parentNode) 
            this.parentNode.removeChild(this);
    });
    if (data) {
        data.el.style.display = data.display;
        data.parent.appendChild(data.el);
        $(data.el).removeData('blockUI.history');
    }
};

// bind/unbind the handler
function bind(b, el, opts) {

	var full = el == window, $el = $(el);

    // don't bother unbinding if there is nothing to unbind
    if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked'))) 
        return;
    if (!full) 
        $el.data('blockUI.isBlocked', b);
        
    // bind anchors and inputs for mouse and key events
    var events = 'mousedown mouseup keydown keypress click';
    b ? $(document).bind(events, opts, handler) : $(document).unbind(events, handler);

// former impl...
//    var $e = $('a,:input');
//    b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
};

// event handler to suppress keyboard/mouse events when blocking
function handler(e) {
	//allow checkbox click event
	if($(e.target).attr("type")=="checkbox")
		return true;
    // allow tab navigation (conditionally)
    if (e.keyCode && e.keyCode == 9) {
        if (pageBlock && e.data.constrainTabKey) {
            var els = pageBlockEls;
            var fwd = !e.shiftKey && e.target == els[els.length-1];
            var back = e.shiftKey && e.target == els[0];
            if (fwd || back) {
                setTimeout(function(){focus(back)},10);
                return false;
            }
        }
    }
    // allow events within the message content
    if ($(e.target).parents('div.blockMsg').length > 0)
        return true;
        
    // allow events for content that is not being blocked
    return $(e.target).parents().children().filter('div.blockUI').length == 0;
};

function focus(back) {
    if (!pageBlockEls) 
        return;
    var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
    if (e) 
        e.focus();
};

function center(el) {
    var p = el.parentNode, s = el.style;
    var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
    var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
    s.left = l > 0 ? (l+'px') : '0';
    s.top  = t > 0 ? (t+'px') : '0';
};

function sz(el, p) { 
    return parseInt($.css(el,p))||0; 
};

})(jQuery);

function keonEnvioPeticion(mensaje,espere) {
	if (!mensaje) mensaje = getLiteralBlockUI("Procesando");
	if (!espere) espere = getLiteralBlockUI("Espere");


	$.blockUI({	   	
		message: '<b>'+mensaje+' </b><br/><b>'+espere+'</b><br/><img id="idImgPrecarga" src="/keon_mult_mult_pub/images/loadingAnimation.gif" />',
		css: {             
			border: 'none', 
            padding: '15px', 
            backgroundColor: '#fff', 
            color: '#1556a3'			
        },		
		overlayCSS: { backgroundColor: '#000' }
		
	});
	
	$("#idImgPrecarga").attr("src",imgPrecarga.src);
};



function keonFinPeticion() {
    $.unblockUI();	
};


function keonEnvioPeticionNC(mensaje,espere) {
	
	if ($.browser.msie && (/MSIE 6.0/.test(navigator.userAgent))){$("select").hide();}
	
	var events = 'mousedown mouseup keydown keypress click';
	$(document).bind(events, function(){return false;});
	//$(document).bind(events, function(event){event.preventDefault();});
	//$(document).bind(events, function(event){event.stopPropagation();});

	if (!mensaje) mensaje = getLiteralBlockUI("Procesando");
	if (!espere) espere = getLiteralBlockUI("Espere");
	var keonDivTag = document.createElement("div");      
	keonDivTag.id = "keonDivFondo";       
	keonDivTag.setAttribute("align","center");       
	keonDivTag.style.zIndex = "1000";       
	keonDivTag.style.margin = "0px auto";       
	var keonDivTagw = Math.max(window.innerWidth || self.innerWidth || (document.documentElement&&document.documentElement.clientWidth) || document.body.clientWidth);
	//var keonDivTagh = Math.max(window.innerHeight || self.innerHeight || (document.documentElement&&document.documentElement.clientHeight) || document.body.clientHeight);
	var keonDivTagh = (document.documentElement.scrollHeight || document.body.scrollHeight) > (document.documentElement.offsetHeight || document.body.offsetHeight) ? (document.documentElement.scrollHeight || document.body.scrollHeight) : (document.documentElement.offsetHeight || document.body.offsetHeight);
	keonDivTag.style.width=keonDivTagw+"px";
	keonDivTag.style.height=(keonDivTagh-4)+"px";
	keonDivTag.style.backgroundColor="#000";
	keonDivTag.style.color="#fff";
	keonDivTag.style.filter="alpha(opacity=50)";
	keonDivTag.style.position="absolute";
	keonDivTag.style.top="0px";
	keonDivTag.style.left="0px";       
	   
	var keonDivTagInner = document.createElement("div");      
	keonDivTagInner.id = "keonDivMsg";       
	keonDivTagInner.setAttribute("align","center");       
	keonDivTagInner.style.zIndex = "1001";       
	keonDivTagInner.style.margin = "0px auto";       
	keonDivTagInner.style.padding = "0px";       
	keonDivTagInner.style.width="336px";
	keonDivTagInner.style.height="73px";;
	keonDivTagInner.style.backgroundColor="white";
	keonDivTagInner.style.color="#1556a3";
	keonDivTagInner.style.position="absolute";
	var keonDivTagInnerw = (keonDivTagw-336)/2;
	var keonDivTagInnerh = (keonDivTagh-73)/2;
	keonDivTagInner.style.top=keonDivTagInnerh+"px";
	keonDivTagInner.style.left=keonDivTagInnerw+"px";       
	keonDivTagInner.innerHTML = '<br/><b>'+mensaje+' </b><br/><b>'+espere+'</b><br/><img id="idImgPrecarga" src="/keon_mult_mult_pub/images/loadingAnimation.gif" />';
	
	document.body.appendChild(keonDivTagInner);
	document.body.appendChild(keonDivTag);
	$("#idImgPrecarga").attr("src",imgPrecarga.src);
};

function keonFinPeticionNC() {
	if ($.browser.msie && (/MSIE 6.0/.test(navigator.userAgent))){$("select").show();}	
	//document.getElementById("keonDivFondo").style.display="none";
	//document.getElementById("keonDivMsg").style.display="none";
	document.body.removeChild(keonDivFondo);
	document.body.removeChild(keonDivMsg);
	//var events = 'mousedown mouseup keydown keypress click';
	$(document).unbind();
	
};

/*
tipo mensaje:
	exclamacion
	informacion
	pregunta
	confirmacion
	error
botonera:
	aceptar_cancelar
	si_no
	si_no_cancelar
	cerrar
*/	
function keonMensaje(tipomensaje,titulo,texto,botonera,btn1,btn2,btn3) {
		if (!tipomensaje) tipomensaje ="informacion";	
		if (!titulo) titulo ="";	
		if (!texto) texto ="";	
		if (!botonera) botonera ="cerrar";	
		if (!btn1) btn1 ="void(0)";	
		if (!btn2) btn2 ="void(0)";	
		if (!btn3) btn3 ="void(0)";
		switch(tipomensaje){
			case "exclamacion":
				icono="AlertExclamacion";
				tipotitulo=getLiteralBlockUI("Informacion importante");
			break;
			case "informacion":
				icono="AlertInformacion";
				tipotitulo=getLiteralBlockUI("Informacion");
			break;
			case "pregunta":
				icono="AlertPregunta";
				tipotitulo=getLiteralBlockUI("Pregunta");
			break;
			case "confirmacion":
				icono="AlertConfirmacion";
				tipotitulo=getLiteralBlockUI("Confirmacion");
			break;
			case "error":
				icono="AlertError";
				tipotitulo=getLiteralBlockUI("Error");
			break;
			default:
				icono="AlertInformacion";
				tipotitulo=getLiteralBlockUI("Informacion");
			break;
		}
		switch(botonera){
			case "aceptar_cancelar":
				botones='<input type="button" value="'+getLiteralBlockUI("Aceptar")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/> <input type="button" value="'+getLiteralBlockUI("Cancelar")+'" class="Boton" onclick="'+btn2+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje2" tabindex="992"/>';
			break;
			case "si_no":
				botones='<input type="button" value="'+getLiteralBlockUI("Si")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/> <input type="button" value="'+getLiteralBlockUI("No")+'" class="Boton" onclick="'+btn2+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje2" tabindex="992"/>';
			break;
			case "si_no_cancelar":
				botones='<input type="button" value="'+getLiteralBlockUI("Si")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/> <input type="button" value="'+getLiteralBlockUI("No")+'" class="Boton" onclick="'+btn2+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje2" tabindex="992"/>  <input type="button" value="'+getLiteralBlockUI("Cancelar")+'" class="Boton" onclick="'+btn3+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje3" tabindex="993"/>';
			break;
			case "cerrar":
				botones='<input type="button" value="'+getLiteralBlockUI("Cerrar")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/>';
			break;
			case "continuar":
				botones='<input type="button" value="'+getLiteralBlockUI("Continuar")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/>';
			break;
			default:
				botones='<input type="button" value="'+getLiteralBlockUI("Cerrar")+'" class="Boton" onclick="'+btn1+';$.unblockUI();" onmouseover="this.className=\'BotonHover\'" onmouseout="this.className=\'Boton\'" id="btnKeonMensaje1" tabindex="991"/>';
			break;
		}
		var anchomsj=600;
		if((calculateSize()-anchomsj)/2 <=0){
			var margenlateral=(1024-600)/2;
		}else{
			var margenlateral= (calculateSize()-anchomsj)/2;
		}
		
    $.blockUI({
    	message:'<table width="100%" border="0" cellspacing="1" cellpadding="0"><tr><td class="IcoAlert"><table width="100%" height="310px" border="0" cellspacing="2" cellpadding="8"><tr><td class="'+
    		icono+'"></td></tr><tr><td class="TextoTipoAlerta" ><label class="EtiquetaAutoescalableAlert">&nbsp;&nbsp;'+
    		tipotitulo+'</label></td></tr></table></td><td class="MsjAlert"><table width="100%" border="0" cellspacing="2" cellpadding="8"><tr><td class="TituloAlerta"><label class="EtiquetaAutoescalableAlert">'+
    		titulo+'</label></td></tr><tr><td class="TextoAlerta"><p class="txtAlert">'+
    		texto+'</p></td></tr><tr><td class="BotonesAlerta"><table width="100%" border="0" cellspacing="8" cellpadding="0"><tr><td class="alinearDer">'+
    		botones+'</td></tr></table></td></tr></table></td></tr></table>',
    	css: {
			border: 'none', 
			padding: '0px', 
			backgroundColor: '#fff', 
			color: '#1556a3',
			width: anchomsj+'px',
			left: margenlateral+'px',
			textAlign: 'left', 
			cursor: 'default',
			top: '30%'
    	},
 			overlayCSS: { backgroundColor: '#000' }
    });
};

function calculateSize(){
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	//var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	//arrayPageSize = [w,h];
	return w;
};