function NiftyCheck() {
	if (!document.getElementById || !document.createElement)
		return (false);
	var b = navigator.userAgent.toLowerCase();
	if (b.indexOf("msie 5") > 0 && b.indexOf("opera") == -1)
		return (false);
	return (true);
}

function Rounded(selector, bk, color, size) {
	var i;
	var v = getElementsBySelector(selector);
	var l = v.length;
	for (i = 0; i < l; i++) {
		AddTop(v[i], bk, color, size);
		AddBottom(v[i], bk, color, size);
	}
}

function RoundedTop(selector, bk, color, size, origen) {
	var i;
	var v = getElementsBySelector(selector, origen);
	for (i = 0; i < v.length; i++)
		AddTop(v[i], bk, color, size, origen);
}

function RoundedBottom(selector, bk, color, size, origen) {
	var i;
	var v = getElementsBySelector(selector, origen);
	for (i = 0; i < v.length; i++)
		AddBottom(v[i], bk, color, size);
}

function AddTop(el, bk, color, size, orig) {
	var origen = document;
	if (orig)
		origen = orig;
	var i;
	var d = origen.createElement("b");
	var cn = "r";
	var lim = 4;
	if (size && size == "small") {
		cn = "rs";
		lim = 2
	}
	d.className = "rtop";
	d.style.backgroundColor = bk;
	for (i = 1; i <= lim; i++) {
		var x = origen.createElement("b");
		x.className = cn + i;
		x.style.backgroundColor = color;
		d.appendChild(x);
	}
	el.insertBefore(d, el.firstChild);
}

function AddBottom(el, bk, color, size) {
	var i;
	var d = document.createElement("b");
	var cn = "r";
	var lim = 4;
	if (size && size == "small") {
		cn = "rs";
		lim = 2
	}
	d.className = "rbottom";
	d.style.backgroundColor = bk;
	for (i = lim; i > 0; i--) {
		var x = document.createElement("b");
		x.className = cn + i;
		x.style.backgroundColor = color;
		d.appendChild(x);
	}
	el.appendChild(d, el.firstChild);
}

function getElementsBySelector(selector, orig) {
	var origen = document;
	if (orig) {
		origen = orig;
	}
	var i;
	var s = [];
	var selid = "";
	var selclass = "";
	var tag = selector;
	var objlist = [];
	if (selector.indexOf(" ") > 0) { //descendant selector like "tag#id tag"
		s = selector.split(" ");
		var fs = s[0].split("#");
		if (fs.length == 1) return (objlist);
		return (origen.getElementById(fs[1]).getElementsByTagName(s[1]));
	}
	if (selector.indexOf("#") > 0) { //id selector like "tag#id"
		s = selector.split("#");
		tag = s[0];
		selid = s[1];
	}
	if (selid != "") {
		objlist.push(origen.getElementById(selid));
		return (objlist);
	}
	if (selector.indexOf(".") > 0) { //class selector like "tag.class"
		s = selector.split(".");
		tag = s[0];
		selclass = s[1];
	}
	var v = origen.getElementsByTagName(tag); // tag selector like "tag"
	if (selclass == "")
		return (v);
	for (i = 0; i < v.length; i++) {
		if (v[i].className == selclass) {
			objlist.push(v[i]);
		}
	}
	return (objlist);
}

function getElementsByClass(searchClass, node, tag) {
	var classElements = new Array();
	if (node == null)
		node = document;
	if (tag == null)
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
	for (i = 0, j = 0; i < elsLen; i++) {
		if (pattern.test(els[i].className)) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}

function MM_swapImgRestore() { //v3.0 
	var i, x, a = document.MM_sr;
	for (i = 0; a && i < a.length && (x = a[i]) && x.oSrc; i++) x.src = x.oSrc;
}

function MM_swapImage() { //v3.0
	var i, j = 0,
		x, a = MM_swapImage.arguments;
	document.MM_sr = new Array;
	for (i = 0; i < (a.length - 2); i += 3)
		if ((x = MM_findObj(a[i])) != null) {
			document.MM_sr[j++] = x;
			if (!x.oSrc) x.oSrc = x.src;
			x.src = a[i + 2];
		}
}

function MM_findObj(n, d) { //v4.01
	var p, i, x;
	if (!d) d = document;
	if ((p = n.indexOf("?")) > 0 && parent.frames.length) {
		d = parent.frames[n.substring(p + 1)].document;
		n = n.substring(0, p);
	}
	if (!(x = d[n]) && d.all) x = d.all[n];
	for (i = 0; !x && i < d.forms.length; i++) x = d.forms[i][n];
	for (i = 0; !x && d.layers && i < d.layers.length; i++) x = MM_findObj(n, d.layers[i].document);
	if (!x && d.getElementById) x = d.getElementById(n);
	return x;
}

function mostrar(link) {
	var arr = link.parentNode.parentNode.childNodes;
	var flag = false;
	for (i = 0; i < arr.length; i++) {
		if (arr[i].tagName == "DIV") {
			if (!flag)
				flag = true;
			else
				div = arr[i];
		}
	}
	for (i = 0; i < link.childNodes.length; i++)
		if (link.childNodes[i].tagName == "IMG")
			ruta = link.childNodes[i].src;
	ruta = ruta.substring(0, ruta.lastIndexOf("/"));
	if (div.style.display == "" || div.style.display == "block") {
		div.style.display = "none";
		ruta = ruta + "/abajoGris.gif"
		link.childNodes[0].src = ruta;
	} else {
		div.style.display = "block";
		ruta = ruta + "/arribaGris.gif"
		link.childNodes[0].src = ruta;
	}
}

function Link(valor, accion, tooltip) {
	this.valor = valor;
	this.accion = accion;
	this.tooltip = tooltip;
	this.crearLink = function () {
		var elemento = document.createElement("A");
		elemento.innerHTML = this.valor;
		if (this.accion != null) {
			//Firefox, Chrome
			if ((!document.all) && (document.getElementById)) {
				elemento.setAttribute("onclick", this.accion);
			}
			//IE
			if ((document.all) && (document.getElementById)) {
				elemento["onclick"] = new Function(this.accion);
			}
		}
		elemento.href = "javascript:void(0);";
		if (this.tooltip) elemento.title = tooltip;
		return elemento;
	}
}

function Lista(objetoULHijo) {
	this.objetoULHijo = objetoULHijo;
	this.hijos = new Array();
	this.padres = new Array();
	this.agregarPadre = function (valor, titulo) {
		this.padres[this.padres.length] = valor;
		this.hijos[this.hijos.length] = new Array();
		this.hijos[this.hijos.length - 1][0] = titulo;
	}
	this.agregarHijo = function (padre, link) {
		var indice = this.buscarIndice(padre);
		this.hijos[indice][this.hijos[indice].length] = link;
	}
	this.buscarIndice = function (elemento) {
		if (this.padres.length > 0) {
			for (i = 0; i < this.padres.length; i++) {
				if (this.padres[i] == elemento)
					return i;
			}
			return (-1);
		}
		if (padres)
			return padres.length;
		else
			return 0;
	}
	this.cambiarHijos = function (padre) {
		this.limpiarLista();
		var padresAMostrar = new Array();
		var indice = this.buscarIndice(padre);
		if (indice >= 0) {
			if (this.hijos[indice][0] != null && this.hijos[indice][0] != "") {
				var elemento = document.createElement("TD");
				var b = document.createElement("B");
				b.innerHTML = this.hijos[indice][0];
				elemento.appendChild(b);
			}
			for (i = 1; i < this.hijos[indice].length; i++) {
				try {
					elemento = document.createElement("TD");
					elemento.appendChild(this.hijos[indice][i].crearLink());
					this.objetoULHijo.appendChild(elemento);
				} catch (err) {
					if (this.objetoULHijo != null)
						this.objetoULHijo.appendChild(this.hijos[indice][i]);
				}
			}
			//Validacion por si es iexplorer 6
			if (/MSIE (5|6)/.test(navigator.userAgent) && this.hijos[indice][0] != null && this.hijos[indice][0] != "") {
				agregarHoverID("nivel2");
			}
		} else {
			this.limpiarLista();
		}
	}
	this.limpiarLista = function () {
		if (this.objetoULHijo != null)
			if (this.objetoULHijo.hasChildNodes())
				while (this.objetoULHijo.childNodes.length >= 1)
					this.objetoULHijo.removeChild(this.objetoULHijo.firstChild);
	}
}

function cambiarPestanyaActiva(nuevaPestanya, accion, opcionMenu) {
	var anterior = getElementsByClass("PestanyaActiva")[0];
	if (nuevaPestanya.id == 'Hoy') {
		document.getElementById("menu1").style.display = "none";
		document.getElementById("menu2").style.display = "none";
		document.getElementById("busqueda").style.display = "none";
		window.frames["pantalla"].location.href = accion;
	}
	/*se muestran los menus*/
	else {
		document.getElementById("menu1").style.display = "block";
		document.getElementById("menu2").style.display = "block";
		document.getElementById("busqueda").style.display = "block";
		if (opcionMenu == null || opcionMenu != "noLimpiar") {
			nivel1.limpiarLista();
			nivel2.limpiarLista();
		}
		window.frames["pantalla"].location.href = accion;
		if (opcionMenu != null && opcionMenu != "noLimpiar") {
			/*Se cargan sus menus*/
			nivel1.cambiarHijos(opcionMenu);
		}
	}
	if (anterior) anterior.className = "Pestanya";
	nuevaPestanya.className = "PestanyaActiva";
	var arreglo = new Array();
	arreglo = getElementsByClass("rtop", document.getElementById("pestanyas"));
	for (i = 0; i < arreglo.length; i++)
		arreglo[i].parentNode.removeChild(arreglo[i]);
	RoundedTop("div.Pestanya", "#FFF", "#034896", "small");
	RoundedTop("div.PestanyaActiva", "#FFF", "#ADC4E0", "small");
}

function cambiarEscenario(nueva, orig) {
	var origen = (orig) ? orig : document;
	var anterior = origen.getElementById("activa");
	anterior.id = "";
	anterior.className = "Pestanya";

	nueva.id = "activa";
	nueva.className = "";

	/*para remover las Pestanyas*/
	var arreglo = new Array();

	arreglo = getElementsByClass("rtop", origen.getElementById("pestanyas"));
	for (i = 0; i < arreglo.length; i++)
		arreglo[i].parentNode.removeChild(arreglo[i]);
	RoundedTop("div.Pestanya", "#FFF", "#034896", "small", origen);
	RoundedTop("div#activa", "#FFF", "#ADC4E0", "small", origen);
}

function Reloj(horaInicio, html) {
	this.html = html;
	this.horas = parseInt(horaInicio.split(":")[0]);
	this.minutos = parseInt(horaInicio.split(":")[1]);
	this.segundos = parseInt(horaInicio.split(":")[2]);
	this.correr = function () {
		var s, m, h;
		this.segundos += 1;
		s = this.segundos;
		m = this.minutos;
		h = this.horas;
		if (this.segundos > 59) {
			s = "00";
			this.segundos = 0;
			this.minutos += 1;
			m = this.minutos;
		}
		if (this.segundos < 10) {
			s = "0" + this.segundos;
		}
		if (this.minutos > 59) {
			m = "00";
			this.minutos = 0;
			this.horas += 1;
			h = this.horas;
		}
		if (this.minutos < 10) {
			m = "0" + this.minutos;
		}
		if (this.horas > 23) {
			this.horas = 0;
			h = this.horas;
		}
		if (this.horas < 10) {
			h = "0" + this.horas;
		}
		b = document.createElement("b");
		b.innerHTML = h + ":" + m + ":" + s;
		this.html.removeChild(this.html.firstChild);;
		this.html.appendChild(b);
		setTimeout('miReloj.correr()', 1000);
	}
}

function redimensionar(frame) {
	try {
		var oBody = frame.document.body;
		var oFrame = document.all(frame);
		oFrame.style.height = oBody.scrollHeight + (oBody.offsetHeight - oBody.clientHeight);
	} catch (e) {
		eval('document.getElementById(\'' + frame + '\').height = window.frames.' + frame + '.document.body.offsetHeight;-20');
	}
}

function Nivel4(raiz, texto, flujo) {
	var opciones = document.createElement("UL");
	raiz.appendChild(opciones);
	if (flujo != null && flujo != "null" && flujo != "") {
		script = "lanzarFlujo(\"" + flujo + "\");";
		anchor = new Link(texto, script);
	} else
		anchor = new Link(texto);
	raiz.appendChild(anchor.crearLink());
	raiz.appendChild(opciones);
	this.agregarOpcion = function (texto, flujo) {
		var liIn = document.createElement("TD");
		if (flujo != null && flujo != "null" && flujo != "") {
			script = "lanzarFlujo(\"" + flujo + "\");";
			anchor = new Link(texto, script);
		} else
			anchor = new Link(texto);
		liIn.appendChild(anchor.crearLink());
		opciones.appendChild(liIn);
	}
}


function Menus() {
	this.indicePadre = "";
	this.nombreEscenario = "";
	this.nombreMenu = "";
	this.indiceSubmenu = "";
	this.nombreSubmenus = "";
	this.flujoProcces = "";

	this.agregarMenu = function (a, b, c, d, e, f) {
		this.indicePadre = a;
		this.nombreEscenario = b;
		this.nombreMenu = c;
		this.indiceSubmenu = d;
		this.nombreSubmenus = e;
		this.flujoProcces = f;
	}

}