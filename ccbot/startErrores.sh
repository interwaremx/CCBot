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
  cp -v app-store3.clj nodes/$PORTNODE/
  mkdir nodes/$PORTNODE/running
fi
cd nodes/$PORTNODE
if [ -f "CENTRAL.IP" ]
then
  IPCENTRAL=`cat CENTRAL.IP`
  PORTCENTRAL=`cat CENTRAL.PORT`
fi
CMD="java -Xmx1G -Djavax.net.debugx=all -Djavax.net.ssl.trustStore=/Users/fgerard/git/workspace/ccbot-3.1.0/resources/iwcfdi-priv/trusted.jks -Djavax.net.ssl.trustStorePassword=gnp2012 -cp ../../lib/ccbot-"$VERSION"-standalone.jar:../../target/ccbot-3.1.0-standalone.jar mx.interware.cbot.web.server -central $IPCENTRAL -port-central $PORTCENTRAL -port $PORTNODE -mod prod -require-pkgs mx.interware.iwcfd.tool.core -use-running false"
eval $CMD
