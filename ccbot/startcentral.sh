#!/bin/bash
IPCENTRAL=`cat CENTRAL.IP`
PORTNODE=`cat CENTRAL.PORT`
PORTCENTRAL=`cat CENTRAL.PORT`
VERSION=`cat VERSION`
if [ ! -d nodes ] 
then
  mkdir nodes
fi
if [ ! -d nodes/$PORTNODE ] 
then
  mkdir nodes/$PORTNODE
  cp -rv resources nodes/$PORTNODE/
  cp -v log4j* nodes/$PORTNODE/
  cp -v app-store3.clj nodes/$PORTNODE/
  cp -rv KEYS nodes/$PORTNODE/
  cp -v datos-licencia.edn nodes/$PORTNODE
  cp -v firma-licencia nodes/$PORTNODE
  mv app-store3.clj app-store3.bak
  mkdir nodes/$PORTNODE/running
fi
cd nodes/$PORTNODE
CMD="java -cp ../../lib/ccbot-"$VERSION".jar:../../lib/ccbot-"$VERSION"-standalone.jar mx.interware.cbot.web.server -central $IPCENTRAL -port-central $PORTCENTRAL -port $PORTNODE -mod prod"
eval $CMD
