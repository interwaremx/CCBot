df -h | grep "/disk0s2" | awk '{print substr($5,1,length($5-1))}'
