#!/bin/bash
IPCENTRAL=`cat CENTRAL.IP`
PORTNODE=`cat NODE.PORT`
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
  mkdir nodes/$PORTNODE/running
fi
cd nodes/$PORTNODE
if [ -f "CENTRAL.IP" ]
then
  IPCENTRAL=`cat CENTRAL.IP`
  PORTCENTRAL=`cat CENTRAL.PORT`
fi
CMD="java -cp ../../lib/ccbot-"$VERSION".jar:../../lib/ccbot-"$VERSION"-standalone.jar mx.interware.cbot.web.server -central $IPCENTRAL -port-central $PORTCENTRAL -port $PORTNODE -mod prod"
echo $CMD
eval $CMD
