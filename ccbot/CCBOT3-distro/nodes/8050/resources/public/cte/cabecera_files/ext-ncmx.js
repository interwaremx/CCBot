/***********************************************************************
funcion alertaExt(Titulo, Mensaje, Icono):
Muestra un alert en una ventana modal.
Titulo = Poner el Titulo de la ventana
Mensaje = El mensaje que se va a usar
Icono = 0 -> Informacion
		1 -> Pregunta
		2 -> Advertencia
		3 -> Error
anchoMinimo = ancho MINIMO del mensaje
OPCIONAL
**********************************************************************/

function alertaExt(titulo, mensaje, icono,anchoMinimo)
{
	switch(icono)
	{
		case 0:
		nIcono = Ext.MessageBox.INFO;
		break;
		case 1:
		nIcono = Ext.MessageBox.QUESTION;
		break;
		case 2:
		nIcono = Ext.MessageBox.WARNING;
		break;
		case 3:
		nIcono = Ext.MessageBox.ERROR;
		break;
		default: 
		nIcono = Ext.MessageBox.WARNING;
	}
	if(!anchoMinimo){
		Ext.MessageBox.show({
       	    title: titulo,
       	    msg: mensaje,
       	    buttons: Ext.MessageBox.OK,
       	    icon: nIcono,
                  minWidth : 367
       	});
	}else if (parseInt(anchoMinimo)>0){
		Ext.MessageBox.show({
       	    title: titulo,
       	    msg: mensaje,
       	    buttons: Ext.MessageBox.OK,
       	    icon: nIcono,
		    minWidth : anchoMinimo
       	});
	}
}

/**********************************************************************
funcion reemplazarToolTips(elementos,prefijoGenerico):
Reemplaza los elementos 'Titile' por los QuitcTips de ext
elementos = arreglo de elementos para reemplazar
OPCIONAL
prefijoGenerico = prefijo para generarle un ID al elemento en caso de no tener,
				  si no se envia uno y NO tiene NO SE REEMPLAZARA

**********************************************************************/
function reemplazarToolTips(elementos,prefijoGenerico){
	var flag = false;
	for(i=0;i<elementos.length;i++){
		if(elementos[i].title!=""){
			flag=true;
			var id;
			var title = elementos[i].title;
			elementos[i].title =""
			if(elementos[i].id!="")
				id = elementos[i].id;
			else if(prefijoGenerico){
				id = prefijoGenerico+i;
				elementos[i].id = id;
			}
			new Ext.ToolTip({
				target: id,
				anchor: 'bottom',
				trackMouse: true,
				html: title
			});
		}
	}
	if(flag){
		if (window.addEventListener){
			window.addEventListener("load", Ext.QuickTips.init, false);
		}
		else if (window.attachEvent){
			window.attachEvent("onload", Ext.QuickTips.init);
		}
	}
}