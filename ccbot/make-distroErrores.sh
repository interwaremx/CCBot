#!/bin/bash
rm -rvf CCBOT3-distro*
rm -v cbot.log*
mkdir CCBOT3-distro
lein clean
lein compile
lein uberjar
cd CCBOT3-distro
cp -rv ../db .
cp -rv ../resources .
rm -rvf resources/iwcfdi-priv
rm -rvf resources/public/iwcfdi
mkdir lib
cp -v ../target/*standalone*jar lib
cp -v ../app-store3.clj .
cp -v ../log4j* .
cp -v ../startErrores.sh .
cp -v ../remotedb.clj* .
cp -v ../CENTRAL.IP .
cp -v ../CENTRAL.PORT .
cp -v ../NODE.PORT .
cp -v ../VERSION .
# chkconfig --add ccbotd   PARA INSTALAR EL MANEJADOR DE SERVICIOS LINUX
cp -v ../ccbotd .
rm -vf db/*
#rm -v app-store3.clj
find . -name CVS -exec rm -rvf {} \;
find . -name "*~" -exec rm -rvf {} \;
find . -name "*swp" -exec rm -rvf {} \;
find . -name ".cvs*" -exec rm -rvf {} \;
find . -name ".DS_Store" -exec rm -rvf {} \;
find . -name "*bak" -exec rm -rvf {} \;
cd ..
tar cvzf CCBOT3-distro.tgz CCBOT3-distro
zip -r CCBOT3-distro.zip CCBOT3-distro
rm -rvf CCBOT3-distro
