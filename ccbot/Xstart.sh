#!/bin/bash
IPCENTRAL=`cat CENTRAL.IP`
PORTNODE=`cat NODE.PORT`
PORTCENTRAL=`cat CENTRAL.PORT`
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
xvfb-run java -cp ../../lib/ccbot-3.1.0-standalone.jar:../../target/ccbot-3.1.0-standalone.jar mx.interware.cbot.web.server -central $IPCENTRAL -port-central $PORTCENTRAL -port $PORTNODE -mod prod
