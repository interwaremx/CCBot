#export DISPLAY=10:0
cd /opt/CCBOT3-distro/
#IP=`ifconfig | egrep "inet addr" | egrep Bcast | awk '{split($2,a,":"); printf("%s",a[2]);}'`
IP=`cat CENTRAL.IP`
PORT=`cat CENTRAL.PORT`
VERSION=`cat VERSION`
echo "IP:PORT=" $IP ":" $PORT
Xvfb :1 -screen 0 1280x960x24 &
CMD="DISPLAY-:1 java -cp lib/ccbot-"$VERSION"-standalone.jar mx.interware.cbot.web.server -central $IP -port $PORT -mod prod"
eval $CMD

