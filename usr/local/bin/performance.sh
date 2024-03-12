#!/bin/bash

L[0]="TimeStamp"
L[1]="ElapsedTime"
L[2]="ConnHandled"
L[3]="ConnClosed"
L[4]="Xactions"
L[5]="C.Pool"
L[6]="SpareThreads"
L[7]="ThreadsUsed"
L[8]="ThreadsWaiting"
L[9]="ThreadsStarting"
L[10]="ThreadsPrefetching"
L[11]="ThreadErrors"
L[12]="SrvConn"
L[13]="SrvConnFail"
L[14]="ConnPoolReused"
L[15]="SrvPool"
L[16]="KBytesIn"
L[17]="KBytesOut"
L[18]="Caching Objects Created in Memory"
L[19]="Caching Objects Removed from Memory"
L[20]="DNS Queries Reused"
L[21]="New DNS Queries"
L[22]="DNS Query failures"
L[23]="Total System Memory (KBytes)"
L[24]="Free System Memory (KBytes)"
L[25]="VMemory (KBytes)"
L[26]="RSSMemory (KBytes)"
L[27]="ShMemory (KBytes)"
L[28]="CodeMemory (KBytes)"
L[29]="DataMemory (KBytes)"
L[30]="LibMemory (KBytes)"
L[31]="ConnHdelta"
L[32]="ConnCdelta"
L[33]="XactionsDelta"
L[34]="Client Pool Delta"
L[35]="Spare Threads Delta"
L[36]="Active Threads Delta"
L[37]="Threads Waiting Delta"
L[38]="Threads Starting up Delta"
L[39]="Threads Prefetching Delta"
L[40]="Threading Errors Delta"
L[41]="Outbound Connections created Delta"
L[42]="Outbound Connections Failed Delta"
L[43]="Outbound Connection Pool Reused Delta"
L[44]="Outbound Connections in Pool Delta"
L[45]="KBytesInDelta"
L[46]="KBytesOutDelta"
L[47]="Caching Objects Created in Memory Delta"
L[48]="Caching Objects Removed from Memory Delta"
L[49]="DNS Queries Reused Delta"
L[50]="New DNS Queries Delta"
L[51]="DNS Query failures Delta"
L[52]="LoadAvg1"
L[53]="LoadAvg5"
L[54]="LoadAvg15"
L[55]="RProcesses"
L[56]="WProcesses"
L[57]="U.Time"
L[58]="SysTime"
L[59]="U+SysTime"
L[60]="UTimeD"
L[61]="SysTimeD"
L[62]="U+SysTimeD"


OIFS=${IFS}
IFS=','
tail -n 500 -F /var/log/safesquid/performance/performance.log | while read -a P
do	
	M=`tput lines`
	M=$(( M - 2 ))
	i=$(( i + 1 ))
	[ $i == 1 ] && printf '%16.16s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s\n' ${L[0]} ${L[1]} ${L[2]} ${L[3]} ${L[4]} ${L[31]} ${L[32]} ${L[32]} ${L[5]} ${L[15]} ${L[25]} ${L[26]} ${L[60]} ${L[61]}
				   printf '%16d %8d %8d %8d %8d %8d %8d %8d %8d %8d %8d %8d % 8.4f % 8.4f\n'                    ${P[0]} ${P[1]} ${P[2]} ${P[3]} ${P[4]} ${P[31]} ${P[32]} ${P[33]} ${P[5]} ${P[15]} ${P[25]} ${P[26]} ${P[60]} ${P[61]}
	[ $i == $M ] && let i=0
done

IFS=${OIFS}
