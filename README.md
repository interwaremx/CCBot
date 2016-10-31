![alt text][logo]
[logo]: http://reedlatam.com/sadmoweb/img/modulos/Listasweb/expo-tecnologia/2016/lista-expositores//logo_iw_soluciones_honestas.png "Interware de México"
-----
# [CCBot](http://www.interware.com.mx)   

CCBot is a friendly and highly configurable platform that allows monitoring of servers, applications and services through the implementation of a testing state machine, with the goal of informing users about service drops, low bandwidth, high latency, and other common service problems.

## Features
* Tests set for connectivity/service avalability
* Mailer
* Bash scripts execution.
* Javascript scripts execution.
* Clojure scripts execution.
* Database conectivity tests.

## Language
 * Clojure
 * Javascript

## Requirements
 * Linux based operating system 
 * Maven 

## Installation
### Central
1.	Uncompress unzip CCBOT3-distro-3.X.X.zip
4.	Write server ip address at CCBOT3-distro/CENTRAL.IP
5.	Write the central server’s listening port at CCBOT3-distro/CENTRAL.PORT (8050 suggested)
6.	Write node server’s port at CCBOT3-distro/ NODE.PORT (8060 is suggested)
7.	Execute startcentral.sh
8.  If server IP address is equal to CENTRAL.IP it will ask you for the admin password
9.  Navigate in your browser to http://localhost:8050 (default port).
10. Login with the username ccbot using the password you wrote before.

## Build
1. Install and add to your CLASSPATH Maven 3. 
2. Execute the make-distro.sh file from source code.
