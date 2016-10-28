// Inicializar variables
var versionCss;
var keonImportaInicio='/keon_mult_mult_pub/estilos/Nacar';
var keonImportaNavegador='IE';
var keonImportaResolucion='1024';
var keonImportaFin='.css';

// Versión css
versionCss=versionCss+"";
if(versionCss.length == 1)
	versionCss="0"+versionCss;
if(versionCss!="00" && versionCss!="01" && versionCss!="02")
	versionCss="01";
versionCss="v"+versionCss;

// Versión navegador
var keonDataBrowser=navigator.userAgent;
if(keonDataBrowser.indexOf("MSIE")!=-1)
	keonImportaNavegador="IE";
else if(keonDataBrowser.indexOf("Firefox")!=-1)
	keonImportaNavegador="FF";
else if(keonDataBrowser.indexOf("Chrome")!=-1)
	keonImportaNavegador="FF";
else
	keonImportaNavegador="IE";

/* 
Chrome:
	keonDataBrowser=navigator.userAgent
	indexOf("Chrome")
	keonImportaNavegador="CR";

OmniWeb:
	keonDataBrowser=navigator.userAgent
	indexOf("OmniWeb")
	keonImportaNavegador="OW";

Safari:
	keonDataBrowser=navigator.vendor
	indexOf("Apple")
	keonImportaNavegador="SA";

iCab:
	keonDataBrowser=navigator.vendor
	indexOf("iCab")
	keonImportaNavegador="iC";

Konqueror:
	keonDataBrowser=navigator.vendor
	indexOf("KDE")
	keonImportaNavegador="KQ";

Firefox:
	keonDataBrowser=navigator.userAgent
	indexOf("Firefox")
	keonImportaNavegador="FF";

Camino:
	keonDataBrowser=navigator.vendor
	indexOf("Camino")
	keonImportaNavegador="CM";

Netscape 6+:
	keonDataBrowser=navigator.userAgent
	indexOf("Netscape")
	keonImportaNavegador="NS";

Explorer:
	keonDataBrowser=navigator.userAgent
	indexOf("MSIE")
	keonImportaNavegador="IE";

Mozilla:
	keonDataBrowser=navigator.userAgent
	indexOf("Gecko")
	keonImportaNavegador="MZ";

Netscape 4-:	
	keonDataBrowser=navigator.userAgent
	indexOf("Mozilla")
	keonImportaNavegador="NS";
*/

// Incluir importación css en árbol DOM
var keonCSS = keonImportaInicio+keonImportaNavegador+keonImportaResolucion+versionCss+keonImportaFin;
var keonLink = document.createElement("link");
keonLink.setAttribute('rel', 'stylesheet');
keonLink.setAttribute('type', 'text/css');
keonLink.setAttribute('href', keonCSS);

var keonHead = document.getElementsByTagName('head')[0];
if (!keonHead) {  
	keonHead = document.body.parentNode.appendChild(document.createElement('head'));
}  
keonHead.appendChild(keonLink);  
