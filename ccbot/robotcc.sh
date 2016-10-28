#!/bin/bash
fileName=CCBOT3-distro.tar.gz
fileSize=50730049
version=3.1.8

#Valida que exista el archivo
if [ ! -f /tmp/$fileName ];then
    exit
fi
echo "Existe el Archivo"

#Valida el tamaño del archivo
currentFileSize=`ls -l /tmp/$fileName | cut -d' ' -f5`
if [ $fileSize != $currentFileSize ]; then
    exit
fi
echo "Tamaño correcto"

#Valida si esta activo el servicio
activeService=`ps awx | grep 'ccbotd' |grep -v grep|wc -l`
if [ $activeService != 0 ]; then
    echo "Servicio Activo. Deteniendo...."
    service ccbotd stop
fi

#Valida si existe el directorio del robot y lo elimina.
if [ -d /opt/CCBOT3-distro ];then
    rm -R /opt/CCBOT3-distro
fi

#Descomprime el archivo
tar -C /opt -xzvf /tmp/$fileName

#Valida la version
currentVersion=`cat /opt/CCBOT3-distro/VERSION`
echo $currentVersion
if [ $version != $currentVersion ];then
    exit
fi

#Valida que exista el archivo para el servicio.
if [ ! -f /opt/CCBOT3-distro/ccbotd ];then
   exit
fi

#Copia el archivo ccbotd a init.d para iniciar el servicio.
cp /opt/CCBOT3-distro/ccbotd /etc/init.d/ccbotd
chmod 755 /etc/init.d/ccbotd
chkconfig --add ccbotd
service ccbotd start
