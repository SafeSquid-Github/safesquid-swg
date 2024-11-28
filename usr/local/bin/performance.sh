#!/bin/bash

L[0]="TStamp"
L[1]="ElapsedT"
L[2]="inAccept"
L[3]="inClosed"
L[4]="xactions"
L[5]="inIdle"
L[6]="thSpare"
L[7]="thActive"
L[8]="thWait"
L[9]="thSpcl"
L[10]="thPftch"
L[11]="thError"
L[12]="outCreate"
L[13]="outFail"
L[14]="outReuse"
L[15]="outIdle"
L[16]="BytesIn"
L[17]="BytesOut"
L[18]="cchNew"
L[19]="cchRem"
L[20]="dnsHit"
L[21]="dnsMiss"
L[22]="dnsFail"
L[23]="memSysT"
L[24]="memSysF"
L[25]="memV"
L[26]="memRes"
L[27]="memRSS"
L[28]="memCode"
L[29]="memData"
L[30]="memLib"
L[31]="inAcceptD"
L[32]="inClosedD"
L[33]="xactionD"
L[34]="inIdleD"
L[35]="thSpareD"
L[36]="thActiveD"
L[37]="thWaitD"
L[38]="thSpclD"
L[39]="thPftchD"
L[40]="thErrorD"
L[41]="outCreatD"
L[42]="outFailD"
L[43]="outReuseD"
L[44]="outIdleD"
L[45]="BytesInD"
L[46]="BytesOutD"
L[47]="cchNewD"
L[48]="cchRemD"
L[49]="dnsHitD"
L[50]="dnsMissD"
L[51]="dnsFailD"
L[52]="loadAv1"
L[53]="loadAv5"
L[54]="loadAv15"
L[55]="prcRun"
L[56]="prcWait"
L[57]="tmUserT"
L[58]="tmSysT"
L[59]="tmTotal"
L[60]="tmUserD"
L[61]="tmSysD"
L[62]="tmTotalD"


HEAD()
{
printf '%16.16s %8.8s %8.8s %8.8s %8.8s %8.8s %8.8s %12.8s %12.8s %12.8s %12.8s %12.8s %12.8s\n' \
			"${L[0]}" "${L[1]}" "${L[2]}" "${L[3]}" "inConcrt" "${L[4]}" "${L[33]}" "${L[57]}" "${L[58]}" "${L[59]}" "${L[62]}" "sysYield"
}


OIFS=${IFS}
IFS=','
S=$(wc -l < /var/log/safesquid/performance/performance.log)
tail -n $[ S - 5 ] -F /var/log/safesquid/performance/performance.log | while read -a P
do	
	M=$(tput lines)
	M=$(( M - 2 ))
	i=$(( i + 1 ))
	
	[ $i == 1 ] && HEAD;
    let z=$(echo "${P[33]} != 0" | bc -l)
    let y=$(echo "${P[59]} > 0" | bc)
    [ 1 -eq "$z" ] && [ 1 -eq "$y" ] && t=$(echo "scale=4; ${P[4]} / ${P[59]}" | bc -l)

	printf '%16d %8d %8d %8d %8d %8d %8d %12.4f %12.4f %12.4f %12.4f %12.4f\n' \
		"${P[0]}" "${P[1]}" "${P[2]}" "${P[3]}" "$(( P[2] - P[3] ))" "${P[4]}" "${P[33]}" "${P[57]}" "${P[58]}" "${P[59]}" "${P[62]}" "$t"
	
	[ $i == $M ] && i=0
done

IFS=${OIFS}

exit;

