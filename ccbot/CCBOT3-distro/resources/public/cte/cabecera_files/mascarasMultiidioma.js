/* Librer�a de funciones para aplicar/desaplicar mascaras por defecto en funci�n del locale activo a fechas e importes. */
/* Estas funciones javascript se corresponden con las funciones Nacar de similares nombres de AtaeSvPresentacionUtils */

/* Funciones a utilizar por las aplicaciones*/

function aplicaMascaraFechaDefecto(p1, p2, p3, p4) {
	/*uno/dos par�metros: valor e indice*/
	if (p1 != undefined && p2 == undefined && p3 == undefined && p4 == undefined)
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, p1, null);

	if (p1 != undefined && p2 != undefined && p3 == undefined && p4 == undefined)
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, p1, p2);

	/*tres/cuatro par�metros: dia, mes, a�o e indice*/
	if (p1 != undefined && p2 != undefined && p3 != undefined) {
		var anyo = "" + p3;
		var mes = "" + p2;
		var dia = "" + p1;
		var valor = anyo;
		if (mes.length == 1)
			mes = "0" + mes;
		if (dia.length == 1)
			dia = "0" + dia;
		valor += mes;
		valor += dia;

		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, valor, p4);
	}

}

function aplicaMascaraNumericaDefecto(valor) {
	return arq_mm_mascarasMultiidiomaCargaDojo(0, 1, valor, null);
}

function aplicaMascaraNumericaDefecto(valor, indice) {
	return arq_mm_mascarasMultiidiomaCargaDojo(0, 1, valor, indice);
}

function desaplicaMascaraFechaDefecto(valor) {
	return arq_mm_mascarasMultiidiomaCargaDojo(1, 0, valor, null);
}

function desaplicaMascaraFechaDefecto(valor, indice) {
	return arq_mm_mascarasMultiidiomaCargaDojo(1, 0, valor, indice);
}

function desaplicaMascaraNumericaDefecto(valor) {
	return arq_mm_mascarasMultiidiomaCargaDojo(1, 1, valor, null);
}

function desaplicaMascaraNumericaDefecto(valor, indice) {
	return arq_mm_mascarasMultiidiomaCargaDojo(1, 1, valor, indice);
}

/* Evo. Selecci�n Locale en Mascaras Multiidioma*/

function aplicaMascaraFechaLocaleSelec(p1, p2, p3, p4, p5) {
	/*un par�metro: valor, se aplicar� la m�scara por defecto*/
	if (p1 != undefined && p2 == undefined && p3 == undefined && p4 == undefined && p5 == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, p1, null, null);
	}

	/*dos par�metros: valor y locale*/
	if (p1 != undefined && p2 != undefined && p3 == undefined && p4 == undefined && p5 == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, p1, null, p2);
	}

	/*tres par�metros: valor, locale e �ndice*/
	if (p1 != undefined && p2 != undefined && p3 != undefined && p4 == undefined && p5 == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, p1, p3, p2);
	}

	/*cuatro par�metros: dia, mes, a�o y locale*/
	if (p1 != undefined && p2 != undefined && p3 != undefined && p4 != undefined && p5 == undefined) {
		var anyo = "" + p3;
		var mes = "" + p2;
		var dia = "" + p1;
		var valor = anyo;
		if (mes.length == 1)
			mes = "0" + mes;
		if (dia.length == 1)
			dia = "0" + dia;
		valor += mes;
		valor += dia;
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, valor, null, p4);
	}
	/*cinco par�metros: dia, mes, a�o, locale e indice*/
	if (p1 != undefined && p2 != undefined && p3 != undefined && p4 != undefined && p5 != undefined) {
		var anyo = "" + p3;
		var mes = "" + p2;
		var dia = "" + p1;
		var valor = anyo;
		if (mes.length == 1)
			mes = "0" + mes;
		if (dia.length == 1)
			dia = "0" + dia;
		valor += mes;
		valor += dia;

		return arq_mm_mascarasMultiidiomaCargaDojo(0, 0, valor, p5, p4);
	}
}

function desaplicaMascaraFechaLocaleSelec(valor, locale, indice) {
	if (valor != undefined && locale == undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 0, valor, null, null);
	}

	if (valor != undefined && locale != undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 0, valor, null, locale);
	}

	if (valor != undefined && locale != undefined && indice != undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 0, valor, indice, locale);
	}
}

/*un par�metro: valor, se aplicar� la m�scara por defecto*/
function aplicaMascaraNumericaLocaleSelec(valor, locale, indice) {
	if (valor != undefined && locale == undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 1, valor, null, null);
	}

	if (valor != undefined && locale != undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 1, valor, null, locale);
	}

	if (valor != undefined && locale != undefined && indice != undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(0, 1, valor, indice, locale);
	}
}

/*un par�metro: valor, se aplicar� la m�scara por defecto*/
function desaplicaMascaraNumericaLocaleSelec(valor, locale, indice) {
	if (valor != undefined && locale == undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 1, valor, null, null);
	}

	if (valor != undefined && locale != undefined && indice == undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 1, valor, null, locale);
	}

	if (valor != undefined && locale != undefined && indice != undefined) {
		return arq_mm_mascarasMultiidiomaCargaDojo(1, 1, valor, indice, locale);
	}
}

/* Funciones de arquitectura */

/* Obtiene el objeto HTTP para AJAX*/
function arq_mm_getHTTPObject() {

	var xmlhttp = false;

	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}

	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;

}

/* Realiza una peticion AJAX s�ncrona */
function arq_mm_ejecutarPeticionAJAX(url) {

	var req = arq_mm_getHTTPObject();

	try {

		req.open("GET", url, false);

		req.send(null);

		if (req.status == 200)
			return req.responseText;
		else
			return null;

	} catch (e) {
		return null;
	}
}

/* Carga din�mica, en la cabecera de la p�gina, de la librer�a Dojo recuperada s�ncronamente por AJAX */
function arq_mm_loadScriptDojoAjax() {

	var srcDojo = arq_mm_ejecutarPeticionAJAX("/" + nombreArquitecturaAux + "_es_web_pub/js/dojo/dojo/dojo.js");

	var script = document.createElement("script")
	script.type = "text/javascript";
	script.id = "libDojoArq";

	script.djConfig = 'parseOnLoad: true';
	script.text = srcDojo;

	document.getElementsByTagName("head")[0].appendChild(script);

	dojo.baseUrl = "/" + nombreArquitecturaAux + "_es_web_pub/js/dojo/dojo/";

}

/* Invocaci�n a la funcion de aplicaci�n de mascaras, previa carga din�mica de Dojo si es necesario */
function arq_mm_mascarasMultiidiomaCargaDojo(op, obj, valor, indice, locale) {

	try {

		if (window.dojo == undefined) {
			arq_mm_loadScriptDojoAjax();
		}
		if (locale != undefined) {
			return arq_mm_mascarasMultiidioma(op, obj, valor, indice, locale);
		} else {
			return arq_mm_mascarasMultiidioma(op, obj, valor, indice, null);
		}


	} catch (e) {
		return "ERROR01";
	}

}

/* Funci�n de aplicaci�n/desaplicaci�n de m�scaras por defecto */
function arq_mm_mascarasMultiidioma(op, obj, valor, indice, locale) {

	/*Se comprueba si locale viene informado*/
	if (locale != undefined && locale != null) {
		/* se transforma el locale al formato dojo */
		locale_dojo = locale.toLowerCase().replace("_", "-");
		locale_Arquitectura = locale;
	} else {
		/* se transforma el locale al formato dojo */
		var locale_dojo = locale_Arquitectura.toLowerCase().replace("_", "-");
	}


	/* configuraci�n del locale de dojo */
	djConfig.locale = locale_dojo;
	djConfig.extraLocale = [locale_dojo];

	try {
		if (obj == 0) { //fechas

			dojo.require("dojo.date.locale");

			var clave = "CFG.MASCARA_FECHA_" + locale_Arquitectura;

			if (indice != null)
				clave += "_" + indice;

			var mascara = null;
			var encontrado = false;
			for (var i = 0; i < arrayMascarasMultiidiomaFechas.length && !encontrado; i++) {
				if (arrayMascarasMultiidiomaFechas[i] == clave) {
					if (arrayMascarasMultiidiomaFechas[i + 1].substr(0, 1) == "D")
						mascara = arrayMascarasMultiidiomaFechas[i + 1].substr(1, arrayMascarasMultiidiomaFechas[i + 1].length - 1);
					else
						mascara = arrayMascarasMultiidiomaFechas[i + 1];
					encontrado = true;
				}
			}
			if (mascara != null && valor != null && locale_dojo != null) {
				if (op == 0) { //aplicar
					var anyo = parseInt(valor.substr(0, 4), 10);
					var mes = parseInt(valor.substr(4, 2), 10);
					var dia = parseInt(valor.substr(6, 2), 10);
					var mesaux = mes - 1;

					// Comprabamos que el mes est� comprendido entre 12 y 1
					if ((mes) > 12 || mes == 0) {
						return -1;
					}

					if (mes == 1 || mes == 3 || mes == 5 || mes == 7 || mes == 8 || mes == 10 || mes == 12) {
						if (dia > 31 || dia < 1) {
							return -1;
						}
					}

					if (mes == 4 || mes == 6 || mes == 9 || mes == 11) {
						if (dia > 30 || dia < 1) {
							return -1;
						}
					}


					//Tratamos si el a�o es bisiesto, calculando si el resto de las divisines es 0
					if (mes == 2 && ((anyo % 4 == 0 && anyo % 100 != 0 && anyo % 1000 != 0) || anyo % 1000 == 0)) {
						if (dia > 29 || dia < 1) {
							return -1;
						}
					}

					//Comprobamos que el a�o no es bisiesto					
					if (mes == 2 && !((anyo % 4 == 0 && anyo % 100 != 0) || anyo % 1000 == 0)) {
						if (dia > 28 || dia < 1) {
							return -1;
						}
					}
					var fecha = new String();
					var fecha_FormateadaAux = new String();
					var anyoAux = new String();
					fecha = dojo.date.locale.format(new Date(anyo, mesaux, dia, 0, 0, 0), {
						datePattern: mascara,
						selector: "date",
						locale: locale_dojo
					});
					if (anyo >= 0 && anyo <= 1900) {
						if (mascara.lastIndexOf("yyyy") != -1) {
							var auxPosicion = null;
							//Obtengo la posici�n del a�o en la m�scara para colocarlo en la misma posici�n
							auxPosicion = mascara.indexOf("y");
							//Obtengo el a�o despu�s de aplicar la m�scara
							fecha_FormateadaAux = fecha.substr(auxPosicion, 4);
							//De la fecha inicial, me quedo con el a�o							
							var valorAux = valor.substr(0, 4);
							//Sustituimos el a�o que redonda Dojo por el a�o original tratado en el paso anterior en funci�n de la m�scara seleccionada
							fecha = fecha.replace(fecha_FormateadaAux, valorAux);
						}
					}
					return fecha;
				}
				if (op == 1) { //desaplicar
					var f = dojo.date.locale.parse(valor, {
						datePattern: mascara,
						selector: "date",
						locale: locale_dojo
					});
					var res = "" + f.getYear();
					//Redondeo de ceros para equiparar la m�scara con valor desformateado.
					if (mascara.lastIndexOf("yyyy") != -1) {
						var auxCero = res.length;
						switch (auxCero) {
							case 1:
								res = "000" + res;
								break;
							case 2:
								res = "00" + res;
								break;
							case 3:
								res = "0" + res;
								break;
						}
					}
					if ((f.getMonth() + 1) >= 10)
						res += f.getMonth() + 1;
					else
						res += "0" + (f.getMonth() + 1);
					if (f.getDate() >= 10)
						res += f.getDate();
					else
						res += "0" + f.getDate();
					return res;
				}
			} else
				return "ERROR02";
		}
		if (obj == 1) { //numeros

			dojo.require("dojo.number");

			var clave = "CFG.MASCARA_NUMERICA_" + locale_Arquitectura;

			if (indice != null)
				clave += "_" + indice;
			var mascara = null;
			var encontrado = false;
			for (var i = 0; i < arrayMascarasMultiidiomaNumericas.length && !encontrado; i++) {
				if (arrayMascarasMultiidiomaNumericas[i] == clave) {
					if (arrayMascarasMultiidiomaNumericas[i + 1].substr(0, 1) == "9") {
						mascara = arrayMascarasMultiidiomaNumericas[i + 1].substr(1, arrayMascarasMultiidiomaNumericas[i + 1].length - 1);
					} else {
						mascara = arrayMascarasMultiidiomaNumericas[i + 1];
					}
					mascara = arq_mm_tratarFormatoMascaraNumerica(locale_dojo, mascara);
					encontrado = true;
				}
			}
			if (mascara != null && valor != null && locale_dojo != null) {
				if (op == 0) { //aplicar
					valor = valor.split(",").join("."); //transformaci�n al formato estandar dojo
					var res = "" + dojo.number.format(valor, {
						pattern: mascara,
						locale: locale_dojo
					});
					return arq_mm_eliminaCero(mascara, res, valor);
				}
				if (op == 1) { //desaplicar

					var res = "" + dojo.number.parse(valor, {
						pattern: mascara,
						locale: locale_dojo
					});
					var quitarCerosFin = new Boolean(true);
					var posicValida = valor.length;

					//Si el valor no se corresponde con la m�scara, se devuelve el valor original
					if (res == "NaN") {
						//Si es necesario, se eliminan los ceros situados a la derecha en la parte decimal 
						//(para igualar comportamiento con m�scaras java).
						if (valor.indexOf(",") >= 0) {
							while (quitarCerosFin) {
								if (valor.charAt(posicValida - 1) == '0')
									posicValida--;
								else if (valor.charAt(posicValida - 1) == ',') {
									quitarCerosFin = false;
									valor = valor.substring(0, posicValida - 1);
								} else {
									quitarCerosFin = false;
									valor = valor.substring(0, posicValida);
								}
							}
						}
						return valor.replace(".", "");
					}

					res = res.split(".").join(","); //transformaci�n al formato estandar Nacar
					return res;
				}
			} else
				return "ERROR02";

		}

	} catch (e) {
		return "ERROR00";
	}

	return "ERROR00";
}

/* tratamiento de los puntos y comas para locales no compatibles con el formato estandar Dojo */
function arq_mm_tratarFormatoMascaraNumerica(locale, mascara) {
	var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
	var group = bundle.group;
	var decimal = bundle.decimal;
	if (decimal != "." && group != ",") {
		mascara = mascara.split(decimal).join("@");
		mascara = mascara.split(group).join(",");
		mascara = mascara.split("@").join(".");
	}
	return mascara;
}

/* eliminaci�n del cero para importes entre -1 y 1 y mascaras de tipo #.00 */
function arq_mm_eliminaCero(mascara, res, valor) {
	var posPunto = mascara.lastIndexOf(".");
	if (posPunto > -1) {
		var todoCeros = true;
		var restoMascara = mascara.substr(posPunto + 1);
		for (var i = 0; i < restoMascara.length; i++) {
			todoCeros = todoCeros && (restoMascara.charAt(i) == '0');
		}
		//mascara de formato #.00...
		if (todoCeros && mascara.charAt(posPunto - 1) == '#') {
			var v = parseFloat(valor);
			if (v < 1 && v > 0) {
				res = res.substr(1, res.length - 1);
			} else {
				if (v > -1 && v < 0) {
					res = "-" + res.substr(2, res.length - 2);
				} else {
					if (v == 0) {
						if (res.charAt(0) == '-')
							res = "-" + res.substr(2, res.length - 2);
						else
							res = res.substr(1, res.length - 1);
					}
				}
			}
		}
	}
	return res;
}