IP=`ifconfig | grep 0xffffff00 | awk '{printf("%s",$2);}'`
#cat CENTRAL.IP`
PORT=`cat CENTRAL.PORT`
java -cp lib/ccbot-3.1.0-standalone.jar mx.interware.cbot.web.server -central $IP -port $PORT -mod prod
