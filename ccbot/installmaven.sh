# Comando para meter el jar creado con: lein jar
# ojo poner la version correcta
VERSION=`cat VERSION`
CMD="mvn install:install-file -Dfile=./target/ccbot-"$VERSION".jar -DgroupId=mx.interware -DartifactId=ccbot -Dversion="$VERSION" -Dpackaging=jar"
eval $CMD
