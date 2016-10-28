#!/bin/bash
# Con este comando se abre un browser con la consola al H2, para entrar
# se coloca la ruta correspondiente
# ej: nodes/8050/db/ccbotDB
VERSION=`cat VERSION`
CMD="java -cp ./lib/ccbot-"$VERSION"-standalone.jar org.h2.tools.Console"
echo $CMD
eval $CMD