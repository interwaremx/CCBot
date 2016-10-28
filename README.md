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

## Technologies
 * Clojure
 * Java
 
## Requirements
 * Linux based operating system 
 * Maven

## Installation
### Central
1.	Before installing, you need to create a system user, named “cbot” and login using that user.
2.	Decompress tar file CCBOT3-distro-XX.tg, in order to create CCBOT3-distro directory
3.	Generate a ssh-key (Using ssh-keygen).
4.	Write server ip address at CCBOT3-distro/CENTRAL.IP
5.	Write the central server’s listening port at CCBOT3-distro/CENTRAL.PORT (8050 suggested)
6.	Write node server’s port at CCBOT3-distro/ NODE.PORT (8060 is suggested)
7.	Execute startcentral.sh}

### Nodes
1.	Before installing, you need to create a system user, named “cbotnode” and login using that user.
2.	Create directory shame .ssh in “cbotnode” user’s home directory.

