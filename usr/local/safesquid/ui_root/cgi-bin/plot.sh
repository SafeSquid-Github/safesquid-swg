#!/bin/bash


# THis script analyses SafeSquid's performance.log

	
#PERFORMANCE_LOG_FILE=performance.log	

# comment the specification of LOG_SOURCE here if you wish to analyze a local performance.log
 LOG_SOURCE="/var/log/safesquid/performance/performance.log"
#LOG_SOURCE="./performance.log"

[ "x${PERFORMANCE_LOG_FILE}" == "x" ] && [ "x${LOG_SOURCE}" == "x" ] && exit
[ "x${LOG_SOURCE}" == "x" ] && LOG_SOURCE=${PERFORMANCE_LOG_FILE}
[ "x${PERFORMANCE_LOG_FILE}" == "x" ] && PERFORMANCE_LOG_FILE=${LOG_SOURCE}

CUR_TIME=`date +%Y-%m-%d-%H-%M-%S`
OUTPUT="`dirname ${PERFORMANCE_LOG_FILE}`/performance.png"
REPORT_DATE=`date +%Y-%m-%d%t%H:%M:%S`
REPORT_TITLE="Analysis of Safesquid Performance Logs"

	
#START_DATE=20151224090143
#END_DATE=20151224090342
START_DATE=$1
END_DATE=$2



# string performance_legend = "Time Stamp (YYYYMMDDhhmmss) , Elapsed Time , Client Connections Handled , Client Connections Closed , Client Transactions Handled , Client Connections in Pool , Spare Client Threads , Client Threads in Use , Client Threads in Waiting , Threads Starting up , Threads Reserved for Prefetching , Threading Errors , Outbound Connections created , Outbound Connections Failed , Outbound Connection Pool Reused , Outbound Connections in Pool , Bytes in (KBytes) , Bytes Out (KBytes) , Caching Objects Created in Memory , Caching Objects Removed from Memory , DNS Queries Reused , New DNS Queries , DNS Query failures , Total System Memory (KBytes) , Free System Memory (KBytes) , SafeSquid Virtual Memory (KBytes) , SafeSquid Resident Memory (KBytes) , SafeSquid Shared Memory (KBytes) , SafeSquid Code Memory (KBytes) , SafeSquid Data Memory (KBytes) , SafeSquid Library Memory (KBytes) , Connections Handled Delta , Connections Closed Delta , Transactions Handled Delta , Client Pool Delta , Spare Threads Delta , Active Threads Delta , Threads Waiting Delta , Threads Starting up Delta , Threads Prefetching Delta , Threading Errors Delta , Outbound Connections created Delta , Outbound Connections Failed Delta , Outbound Connection Pool Reused Delta , Outbound Connections in Pool Delta , Bytes in (KBytes) Delta , Bytes Out (KBytes) Delta , Caching Objects Created in Memory Delta , Caching Objects Removed from Memory Delta , DNS Queries Reused Delta , New DNS Queries Delta , DNS Query failures Delta, load avg.(1 min), load avg.(5 min), load avg.(15 min), Running Processes, Waiting Processes, User Time, System Time, Total (user + system) Time , User Time Delta , System Time Delta , Total Time Delta\n";
	
PLOT_WIDTH=1200

PLOT ()
{

#S=20150327000000
#E=20150327010000

# START_DATE=20150327000000
# END_DATE=20150327010000

A=${START_DATE}
B=${END_DATE}

echo A: $A
echo B: $B

echo "Plotting: started: `date +%Y-%m-%d.%H:%M:%S.%N` "
ST=`date +%s`
/usr/bin/gnuplot << _EOF


##### template #####

# CPU Utilization
# PLOT38="Running Processes"
# PLOT39="Waiting Processes"
# PLOT40="User Time"
# PLOT41="System Time"
# PLOT42="Total (user + system) Time"
# PLOT43="User Time Delta"
# PLOT44="System Time Delta"
# PLOT45="Total Time Delta"


# unset label; unset logscale y
# p=2 ; d=(d == 0 ? n : 0 ) ; c = l - d -1  ; j=1 ; 

# set autoscale y ; set autoscale y2 ; 

# print PLOT4
# print PLOT5
# print PLOT6


# set label j PLOT4 at graph 0,0  rotate left  tc lt j offset -c,0 ; c = c - 2 ; j=j + 1


# c = l - d -1  ; 
# set label j PLOT5 at graph 1,0  rotate left tc lt j offset c,0 ; c = c - 2 ; j=j + 1
# set label j PLOT6 at graph 1,0  rotate left tc lt j offset c,0 ; c = c - 2 ; j=j + 1


# plot \
#	"${PERFORMANCE_LOG_FILE}" usi 1:32 ti PLOT4 w impulses  lw 3,\
#	"${PERFORMANCE_LOG_FILE}" usi 1:33 ti PLOT5 w lines  lw 2 axes x1y2,\
#	"${PERFORMANCE_LOG_FILE}" usi 1:35 ti PLOT6 w lines  lw 1 axes x1y2


##### - #####



# total number of plots
t=18.0
# width of individual plots
# w=1024
w=${PLOT_WIDTH}
# height of individual plots
h=150
# left margin
l=30
# right margin
r=l


set datafile commentschars "#T"

# set term png size 600,400  

# set term png size 800,1000  
# set output "figure.png"  

# set term dumb 144 200 enhanced

#set terminal png  size w,( (t + 1.5) * h)
set terminal png  transparent truecolor size w,(( t * h) + ( 19 * 25) + h )
set output "${OUTPUT}"


# set timefmt "<format string>"  
set timefmt "%Y%m%d%H%M%S"  
set xdata time  	# The x axis data is time
# set format x "%Y-%m-%d %H:%M:%S" 	# On the x-axis, we want tics like Jun 10
# set xtics 2
# Input file contains comma-separated values fields  
set datafile separator "," 
# set xrange [0:400]
set xtics border out
set ytics border nomirror out
set y2tics border nomirror out
set key off
set xtics autofreq   rotate by 90
set autoscale y ; set autoscale y2 ; set autoscale x

# set xrange ["20150327000000":"20150327010000"]
# set xrange ["20150327000000":*]
set xrange ["${A}":"${B}"]
show xrange

n=l/3
d=0

set grid

# set multiplot

set multiplot layout t,1 rowsfirst title "${REPORT_TITLE}\n${RESTART}"

set bmargin 0
set tmargin 1
set rmargin r
set lmargin l



# set key outside rmargin center vertical


set macros
set format x ""


plot_reset = " d=(d == 0 ? n : 0 ) ; j=1 ; unset label; unset logscale y ; unset autoscale y; unset autoscale y2 ; set autoscale y ; set autoscale y2 ;"

lreset = "c = l - d -1;"
left_side = "at graph 0,0  rotate left  tc lt j offset -c,0 ; c= c - 2 ; j=j + 1 ;"

right_side = "at graph 1,0  rotate left  tc lt j offset c,0 ; c= c - 2 ; j=j + 1 ;"

##### Connections #####
# first plot

@plot_reset

PLOT1="Concurrent Client Connections"
PLOT2="Concurrent Active Requests"


print PLOT1
print PLOT2

@lreset
set label j PLOT1 @left_side

@lreset
set label j PLOT2 @right_side

plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$3-\$4) ti PLOT1 w impulses  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$8) ti PLOT2 w lines lw 1 axes x1y2 


##### Incoming Pressure #####
@plot_reset


PLOT4="New Incoming Connections"
PLOT5="Client Connections in Pool"

print PLOT4
print PLOT5

@lreset
set label j PLOT4 @left_side

@lreset
set label j PLOT5 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:32 ti PLOT4 w impulses  lw 3 , \
	"${PERFORMANCE_LOG_FILE}" usi 1:6 ti PLOT5 w lines  lw 1 axes x1y2



##### Request Handling #####
@plot_reset


PLOT7="Client Transactions Handled"
PLOT8="Outbound Connections demanded"

print PLOT7
print PLOT8

@lreset
set label j PLOT7 @left_side

@lreset
set label j PLOT8 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:34 ti PLOT7 w impulses  lw 3 axes x1y1, \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$42 + \$43 + +\$44 + \$51) ti PLOT8 w steps  lw 1 axes x1y2
	
##### - #####



##### WAN Pressure #####
@plot_reset

PLOT13="Outbound Connection Pool Reused"
PLOT14="Outbound Connections in Pool"

print PLOT13
print PLOT14

@lreset
set label j PLOT13 @left_side

@lreset
set label j PLOT14 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:44 ti PLOT13 w impulses  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:16 ti PLOT14 w lines  lw 1 axes x1y2



# Network Pressure
@plot_reset

PLOT3="Total TCP Connections"
PLOT4="Idle TCP Connections"
print PLOT3
print PLOT4


@lreset
set label j PLOT3 @left_side


@lreset
set label j PLOT4 @right_side

plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$3 - \$4 + \$42 + \$16) ti PLOT3 w impulses  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$6 + \$16) ti PLOT4 w lines  lw 1 axes x1y2
	
	
##### Data Xfer #####

# Data Xfer
@plot_reset

PLOT16="Bytes In (MBytes)"
PLOT17="Bytes Out (MBytes)"

print PLOT16
print PLOT17

@lreset
set label j PLOT16 @left_side


@lreset
set label j PLOT17 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$46 / 1048576) ti PLOT16 w impulses  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$47 / 1048576) ti PLOT17 w lines  lw 1 axes x1y2

##### Caching #####


# Caching
@plot_reset

PLOT18="Caching Objects in Memory"
PLOT19="Caching Objects Removed from Memory"
PLOT20="Caching Objects Added into Memory"

print PLOT18
print PLOT19
print PLOT20

@lreset
set label j PLOT18 @left_side
set label j PLOT19 @left_side


@lreset
set label j PLOT20 @right_side


plot "${PERFORMANCE_LOG_FILE}" usi 1:(\$19-\$20) ti PLOT18 w line  lw 5,\
	"${PERFORMANCE_LOG_FILE}" usi 1:49 ti PLOT19 w lines  lw 3 axes x1y2,\
	"${PERFORMANCE_LOG_FILE}" usi 1:48 ti PLOT20 w lines  lw 1 axes x1y2


##### DNS #####
@plot_reset

PLOT22="New DNS Queries"
PLOT23="DNS Query Reused"

print PLOT22
print PLOT23

@lreset
set label j PLOT22 @left_side


@lreset
set label j PLOT23 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:51 ti PLOT22 w impulses  lw 3 ,\
	"${PERFORMANCE_LOG_FILE}" usi 1:50 ti PLOT23 w lines  lw 1 axes x1y2


##### Threading Capacity #####

@plot_reset

PLOT8="Spare Client Threads"
PLOT9="Client Threads in Use"
PLOT10="Client Threads in Waiting"


print PLOT8
print PLOT9
print PLOT10



@lreset
set label j PLOT8 @left_side
set label j PLOT9 @left_side



@lreset
set label j PLOT10 @right_side



plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:7 ti PLOT8 w lines  lw 5,\
	"${PERFORMANCE_LOG_FILE}" usi 1:8 ti PLOT9 w lines  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:9 ti PLOT10 w lines lw 1 axes x1y2

##### System Memory #####


# System Memory
PLOT24="Total System Memory (GBytes)"
PLOT25="Free System Memory (MBytes)"

@plot_reset


print PLOT24
print PLOT25

@lreset
set label j PLOT24 @left_side


@lreset
set label j PLOT25 @right_side

plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$24 / 1048576) ti PLOT24 w lines  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$25 / 1024) ti PLOT25 w lines  lw 1 axes x1y2


##### SafeSquid Memory #####

# SafeSquid Memory
PLOT26="SafeSquid Virtual Memory (MBytes)"
PLOT27="SafeSquid Resident Memory (MBytes)" 
PLOT28="SafeSquid Shared Memory (MBytes)" 
PLOT29="SafeSquid Code Memory (MBytes)" 
PLOT30="SafeSquid Data Memory (MBytes)" 
PLOT31="SafeSquid Library Memory (MBytes)"

@plot_reset


print PLOT26
print PLOT27
print PLOT28
print PLOT29
print PLOT30
print PLOT31


@lreset
set label j PLOT26 @left_side
set label j PLOT27 @left_side



@lreset
set label j PLOT28 @right_side
set label j PLOT29 @right_side
set label j PLOT30 @right_side
set label j PLOT31 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$26 / 1024) ti PLOT26 w lines  lw 11,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$27 / 1024) ti PLOT27 w lines  lw 9,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$28 / 1024) ti PLOT28 w lines  lw 7 axes x1y2,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$29 / 1024) ti PLOT29 w lines  lw 5 axes x1y2,\
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$30 / 1024) ti PLOT30 w lines  lw 3 axes x1y2, \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$31 / 1024) ti PLOT31 w lines  lw 1 axes x1y2


##### Errors #####

# Errors
PLOT32="DNS Query failures"
PLOT33="Outbound Connections Failed"
PLOT34="Threading Errors"


@plot_reset


print PLOT32
print PLOT33
print PLOT34


@lreset
set label j PLOT32 @left_side
set label j PLOT33 @left_side


@lreset
set label j PLOT34 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:52 ti PLOT32 w impulses  lw 5,\
	"${PERFORMANCE_LOG_FILE}" usi 1:43 ti PLOT33 w lines  lw 3 axes x1y2,\
	"${PERFORMANCE_LOG_FILE}" usi 1:41 ti PLOT34 w lines  lw 1 axes x1y2


##### System Load #####

# System Load
PLOT35="load avg.(1 min)"
PLOT36="load avg.(5 min)"
PLOT37="load avg.(15 min)"


@plot_reset


print PLOT35
print PLOT36
print PLOT37


@lreset
set label j PLOT35 @left_side



@lreset
set label j PLOT36 @right_side
set label j PLOT37 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:53 ti PLOT35 w steps  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:54 ti PLOT36 w steps  lw 2 axes x1y2,\
	"${PERFORMANCE_LOG_FILE}" usi 1:55 ti PLOT37 w steps  lw 1 axes x1y2


##### CPU Switching #####

# CPU Switching
PLOT38="Running Processes"
PLOT39="Waiting Processes"


@plot_reset


print PLOT38
print PLOT39


@lreset
set label j PLOT38 @left_side



@lreset
set label j PLOT39 @right_side


plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:56 ti PLOT38 w impulses  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:63 ti PLOT39 w lines  lw 1 axes x1y2


##### CPU Utilization 1 #####

# CPU Utilization
@plot_reset

PLOT43="Total CPU Use Delta (msecs)"
PLOT44="User Time (msecs)"
PLOT45="System Time (msecs)"

print PLOT43
print PLOT44
print PLOT45

@lreset
set label j PLOT43 @left_side

@lreset
set label j PLOT44 @right_side
set label j PLOT45 @right_side

plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$63 * 1000) ti PLOT43 w impulses  lw 5, \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$61 * 1000) ti PLOT44 w lines  lw 3 axes x1y2, \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$62 * 1000) ti PLOT45 w lines  lw 1 axes x1y2
	
##### CPU Utilization 2 #####

# CPU Utilization
PLOT40="Total CPU Use Trend"
PLOT41="User Time Trend"
PLOT42="System Time Trend"


@plot_reset


print PLOT40
print PLOT41
print PLOT42

@lreset
set label j PLOT40 @left_side



@lreset

plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:( (\$60 + \$63 ) / \$2) ti PLOT40 w steps  lw 5,\
	"${PERFORMANCE_LOG_FILE}" usi 1:( (\$58 + \$61 ) / \$2) ti PLOT41 w steps  lw 3,\
	"${PERFORMANCE_LOG_FILE}" usi 1:( (\$59 + \$62) / \$2) ti PLOT42 w steps  lw 1



##### Process Life #####

# last plot must print time as the significant x values
set format x "%Y-%m-%d %H:%M:%S"	

@plot_reset

set logscale y2

PLOT46="SafeSquid Virtual Memory (MBytes)"
PLOT47="Process Age"
	
print PLOT46
print PLOT47



@lreset
set label j PLOT46 @left_side

@lreset
set label j PLOT47 @right_side
	
plot \
	"${PERFORMANCE_LOG_FILE}" usi 1:(\$26 / 1024 ) ti PLOT46 w lines  lw 3 axes x1y1,\
	"${PERFORMANCE_LOG_FILE}" usi 1:2 ti PLOT47 w lines lw 1  axes x1y2	
	
# last plot
set bmargin 0

##### - #####


	
unset multiplot
exit

_EOF
ET=`date +%s`
echo "Plotting: ended: `date +%Y-%m-%d.%H:%M:%S.%N` "
echo "Processing time $[ ${ET} - ${ST} ] seconds"
}

	

START ()
{

[ -f ${PERFORMANCE_LOG_FILE} ] || echo "log file not found"



# PROCESS_WATCH



PLOT

ln -fs ${OUTPUT} figure.png 

}
	
MAIN ()
{

if [ ${#*} -le 0 ] 
then
	PERFORMANCE_LOG_FILE=${LOG_SOURCE}
	return;
fi

# PERFORMANCE_LOG_FILE=/tmp/performance.log
# [ -f ${PERFORMANCE_LOG_FILE} ] && rm ${PERFORMANCE_LOG_FILE}

case $2 in
	d|D|day|DAY)

		GETLINE=$[ $1 * 24 * 60 * 60 / 2 ] 
#		tail -n ${GETLINE} ${LOG_SOURCE} > ${PERFORMANCE_LOG_FILE}
#		REPORT_TITLE="Report generated on: ${REPORT_DATE}\tPerformance Analysis last $1 Day(s)"
	
#		S=`date --date="$1 day ago" +%Y%m%d%H%M%S`
#		E=`date +%Y%m%d%H%M%S`
	;;
	h|H|hour|HOUR)

		GETLINE=$[ $1 * 60 * 60 / 2 ]
#		tail -n ${GETLINE} ${LOG_SOURCE} > ${PERFORMANCE_LOG_FILE}
#		REPORT_TITLE="Report generated on: ${REPORT_DATE}\tPerformance Analysis last $1 Hour(s)"
		
		S=`date --date="$1 hour ago" +%Y%m%d%H%M%S`
		E=`date +%Y%m%d%H%M%S`
		
	;;

	*)
		unset GETLINE
		S=$1
		E=$2	
	;;

esac



	S=${S//-/} ; 	S=${S// /} ; 	S=${S//:/} ; 
	E=${E//-/} ; 	E=${E// /} ;	E=${E//:/} ;
	
	YY=${S:0:4} ; [ ${#YY} -lt 4 ] && YY=`date +%Y`
	MO=${S:4:2} ; [ ${#MO} -lt 2 ] && MO=01
	DD=${S:6:2} ; [ ${#DD} -lt 2 ] && DD=01
	
	HH=${S:8:2} ; [ ${#HH} -lt 2 ] && HH=00
	MN=${S:10:2} ; [ ${#MN} -lt 2 ] && MN=00
	SS=${S:12:2} ; [ ${#SS} -lt 2 ] && SS=00
	
	PDS="${YY}${MO}${DD} ${HH}:${MN}:${SS}"

	if [ "x${2}" != "x" ]
	then
	
		YY=${E:0:4} ; [ ${#YY} -lt 4 ] && YY=`date +%Y`
		MO=${E:4:2} ; [ ${#MO} -lt 2 ] && MO=01
		DD=${E:6:2} ; [ ${#DD} -lt 2 ] && DD=01
		
		HH=${E:8:2} ; [ ${#HH} -lt 2 ] && HH=00
		MN=${E:10:2} ; [ ${#MN} -lt 2 ] && MN=00
		SS=${E:12:2} ; [ ${#SS} -lt 2 ] && SS=00
		

	else

		YY=`date +%Y` ; MO=`date +%m` ;	DD=`date +%d` ; HH=`date +%H` ;	MN=`date +%M` ;	SS=`date +%S`

	fi
	
		PDE="${YY}${MO}${DD} ${HH}:${MN}:${SS}"
		
	START_DATE=`date --date="${PDS}" +%Y%m%d%H%M%S`
	END_DATE=`date --date="${PDE}" +%Y%m%d%H%M%S`
	

#	[ "x${START_DATE}" == "x" ] && echo "Bad Start date $1" && exit
	echo -e "Start date:\t${START_DATE} ${PDS}"

#	[ "x${END_DATE}" == "x" ] && echo "Bad end date $2" && exit
	echo -e "End date:\t${END_DATE} ${PDE}"
	
return;	
	
	REPORT_TITLE=`echo -e "Report generated on: ${REPORT_DATE}\tPerformance Analysis of period from ${PDS} to ${PDE}"`

	typeset -i I L P Q; I=0 ; L=0; P=0 ; Q=0
	O_IFS=${IFS}; IFS=',' ; unset DA ; typeset -a DA 
	
	if [ "x${GETLINE}" == "x" ]
	then
		while read -a DA
		do 
			I=$[I + 1] ; L=$[ I / 1000 ] ; [ $I == $[ L * 1000 ] ] && echo -ne ".$I."
			[ ${DA[0]} -lt ${START_DATE} ] && continue
			
			P=$[P + 1] ; Q=$[ P / 1000 ] ; [ $P == $[ Q * 1000 ] ] && echo -ne ".$P/$I."
			
			[ ${DA[0]} -gt ${END_DATE} ] && break
			
			echo ${DA[*]} | tr ' ' ',' >> ${PERFORMANCE_LOG_FILE}
		done < ${LOG_SOURCE}

	else 
		tail -n ${GETLINE} ${LOG_SOURCE} |	while read -a DA
		do 
			I=$[I + 1] ; L=$[ I / 1000 ] ; [ $I == $[ L * 1000 ] ] && echo -ne ".$I."
			[ ${DA[0]} -lt ${START_DATE} ] && continue
			
			P=$[P + 1] ; Q=$[ P / 1000 ] ; [ $P == $[ Q * 1000 ] ] && echo -ne ".$P/$I."
			
			[ ${DA[0]} -gt ${END_DATE} ] && break
			
			echo ${DA[*]} | tr ' ' ',' >> ${PERFORMANCE_LOG_FILE}
		done
	

		
	fi
	
	IFS=${O_IFS}
	echo -e "\ndone"




}	
	
MAIN $* 2> /dev/null

START

exit


