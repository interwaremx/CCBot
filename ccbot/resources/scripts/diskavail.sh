#!/bin/bash
df -h | grep "/$" | awk '{f=NF-1; printf("%s",substr($f,0,length($f)-1));}'
