// Inicializar variables
var versionCss;
var keonImportaInicio = '/keon_mult_mult_pub/estilos/Nacar';
var keonImportaNavegador = 'IE';
var keonImportaResolucion = '1024';
var keonImportaFin = '.css';

// Versi�n css
versionCss = versionCss + "";
if (versionCss.length == 1)
	versionCss = "0" + versionCss;
if (versionCss != "00" && versionCss != "01" && versionCss != "02")
	versionCss = "01";
versionCss = "v" + versionCss;

// Versi�n navegador
var keonDataBrowser = navigator.userAgent;
if (keonDataBrowser.indexOf("MSIE") != -1)
	keonImportaNavegador = "IE";
else if (keonDataBrowser.indexOf("Firefox") != -1)
	keonImportaNavegador = "FF";
else if (keonDataBrowser.indexOf("Chrome") != -1)
	keonImportaNavegador = "FF";
else
	keonImportaNavegador = "IE";

// Incluir importaci�n css en �rbol DOM
var keonCSS = keonImportaInicio + keonImportaNavegador + keonImportaResolucion + versionCss + keonImportaFin;
var keonLink = document.createElement("link");
keonLink.setAttribute('rel', 'stylesheet');
keonLink.setAttribute('type', 'text/css');
keonLink.setAttribute('href', keonCSS);

var keonHead = document.getElementsByTagName('head')[0];
if (!keonHead) {
	keonHead = document.body.parentNode.appendChild(document.createElement('head'));
}
keonHead.appendChild(keonLink);