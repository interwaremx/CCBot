#!/bin/bash
echo "Maven is required";
mvn install:install-file -Dfile=./lib/commons-ssl-1.0.0.jar -DgroupId=commons-ssl -DartifactId=commons-ssl -Dversion=1.0.0 -Dpackaging=jar
rm -rvf CCBOT3-distro*
rm -v cbot.log*
mkdir CCBOT3-distro
VERSION=`cat VERSION`
lein clean
lein compile
lein uberjar
cd CCBOT3-distro
cp -rv ../db .
cp -rv ../resources .
mkdir lib
cp -v ../target/*standalone*jar lib
cp -v ../app-store3.clj .
cp -v ../log4j* .
cp -v ../start.sh .
cp -v ../Xstart.sh .
cp -v ../startcentral.sh .
cp -v ../*bat .
cp -v ../Xstartcentral.sh .
#cp -v ../startccbot.sh .
#cp -v ../remotedb.clj* .
cp -v ../CENTRAL.IP .
cp -v ../CENTRAL.PORT .
cp -v ../NODE.PORT .
cp -v ../VERSION .
cp -v ../datos-licencia.edn .
cp -v ../firma-licencia .
mkdir KEYS
cp -v ../KEYS/conf-pub.edn KEYS/
cp -v ../KEYS/auth_pubkey.pem KEYS/

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
CMD="tar cvzf CCBOT3-distro-"$VERSION".tgz CCBOT3-distro"
echo $CMD
eval $CMD
CMD="zip -r CCBOT3-distro-"$VERSION".zip CCBOT3-distro"
echo $CMD
eval $CMD
rm -rvf CCBOT3-distro
