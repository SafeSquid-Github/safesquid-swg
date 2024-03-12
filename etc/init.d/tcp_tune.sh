#!/bin/bash


PMEM=0
MAX_CONCURRENT=1000
TMP_SYSCTL="/tmp/sysctl_.conf"
DEF_SYSCTL="/tmp/sysctl_default.conf"


_IFS="${IFS}"
IFS=$'\t'
s=0
SPACE="$[ s += 20 ],$[ s += 20 ],$[ s += 20 ],$[ s += 20 ],$[ s += 20 ]"
declare -A _SYSCTLV
declare -A TCP_MEM
declare -A TCP_RMEM
declare -A TCP_WMEM
declare -a VV


__err_report() {
    echo "Error on line $1"
}

# lsmod | grep conntrack 2>&1 > /dev/null || modprobe ip_conntrack

# trap 'err_report $LINENO' ERR
#trap 'err_report ${BASH_SOURCE}:${FUNCNAME}:${LINENO}' ERR

trap 'echo "error: ${FUNCNAME}:${LINENO}"' ERR

VV+=("net.core.somaxconn")
VV+=("net.core.netdev_max_backlog")
VV+=("net.core.rmem_default")
VV+=("net.core.rmem_max")
VV+=("net.core.wmem_default")
VV+=("net.core.wmem_max")
VV+=("net.ipv4.tcp_mem")
VV+=("net.ipv4.tcp_rmem")
VV+=("net.ipv4.tcp_wmem")
VV+=("net.ipv4.udp_mem")
VV+=("net.ipv4.udp_rmem_min")
VV+=("net.ipv4.udp_wmem_min")
VV+=("net.ipv4.tcp_window_scaling")
VV+=("net.ipv4.tcp_adv_win_scale")
VV+=("net.ipv4.tcp_fin_timeout")
VV+=("net.ipv4.ip_local_port_range")
VV+=("net.ipv4.tcp_abort_on_overflow")
VV+=("net.ipv4.tcp_tw_recycle")
VV+=("net.ipv4.tcp_tw_reuse")
VV+=("net.ipv4.tcp_max_tw_buckets")
VV+=("net.ipv4.tcp_keepalive_intvl")
VV+=("net.ipv4.tcp_keepalive_probes")
VV+=("net.ipv4.tcp_keepalive_time")
VV+=("net.ipv4.tcp_orphan_retries")
VV+=("net.ipv4.tcp_retries1")
VV+=("net.ipv4.tcp_retries2")
VV+=("net.ipv4.tcp_mtu_probing")
VV+=("net.ipv4.tcp_rfc1337")
VV+=("net.ipv4.tcp_max_syn_backlog")
VV+=("net.ipv4.netfilter.ip_conntrack_generic_timeout")
VV+=("net.ipv4.netfilter.ip_conntrack_tcp_timeout_established")
VV+=("net.netfilter.nf_conntrack_max")
VV+=("net.ipv4.tcp_no_metrics_save")
VV+=("net.ipv4.tcp_low_latency")
VV+=("net.ipv4.tcp_fastopen")
VV+=("vm.swappiness")
VV+=("vm.overcommit_memory")
VV+=("vm.overcommit_ratio")
VV+=("net.netfilter.nf_conntrack_udp_timeout")
VV+=("net.netfilter.nf_conntrack_udp_timeout_stream")
VV+=("net.netfilter.nf_flowtable_udp_timeout")




for K in ${VV[*]};
do
	sysctl --names $K 2> /dev/null 1> /dev/null || continue;
	_SYSCTLV[$K]=`sysctl --values $K`
done

PRINT_DEFAULTS()
{
	[ -f ${DEF_SYSCTL} ] && return;

	for K in "${!_SYSCTLV[@]}"
	do 
		sysctl --names $K 2> /dev/null 1> /dev/null || continue;
		echo $K=${_SYSCTLV[$K]}; 
	done | sort | tee -a ${DEF_SYSCTL}
}

PHYSICAL_MEMORY()
{
# get physical memory available in the system
	PAGESIZE=$(getconf PAGESIZE)
	M_PAGES=$(getconf _PHYS_PAGES)
	PMEM=$(( M_PAGES * PAGESIZE ))
	CPUS=$(getconf _NPROCESSORS_ONLN)	

	#unless defined by caller, SOCKET Buffers shall not exceed 64 memory pages
	RECEIVE_SOCKET_BUFFERS=${RECEIVE_SOCKET_BUFFERS:- $(( PAGESIZE * 64 )) }
	SEND_SOCKET_BUFFERS=${SEND_SOCKET_BUFFERS:- $(( PAGESIZE * 64 )) }
}

OPTIMIZE_SOCKET_BUFFERS()
{
	_MAX_CONCURRENT=256
	_SOCK_MEM=66
	[ "x${SOCK_MEM}" != "x" ] && [ ${SOCK_MEM} -gt 1 ] && _SOCK_MEM=$(( SOCK_MEM ))
	[ "x${MAX_CONCURRENT}" != "x" ] && [ ${MAX_CONCURRENT} -gt ${_MAX_CONCURRENT} ] && _MAX_CONCURRENT=$(( MAX_CONCURRENT ))
	
	# adjust somaxconn
	# SafeSquid sets listen queue ~= somaxconn 
	_SYSCTLV[net.core.somaxconn]=$(( _MAX_CONCURRENT ))
	_SYSCTLV[net.core.netdev_max_backlog]=$(( CPUS * _MAX_CONCURRENT * 4 ))
#	_SYSCTLV[net.ipv4.tcp_max_syn_backlog]=$(( CPUS * _MAX_CONCURRENT * 4 ))
#	_SYSCTLV[net.ipv4.tcp_max_tw_buckets]=$(( _MAX_CONCURRENT * 4 * CPUS * 20 ))


	# these values are not in bytes but in pages of memory
	# Limit maximum memory utilization for TCP to SOCK_MEM. 
	TCP_MEM[max]=$(( _SOCK_MEM * M_PAGES ))		
	
	# Set the pressure level to 66% of maximum allocated TCP memory
	TCP_MEM[pressure]=$(( (66 * TCP_MEM[max]) / 100 )) # on a 2GB system this will be 330M

	# Set the low water-mark to 50% of TCP memory at pressure level	
	TCP_MEM[min]=$(( TCP_MEM[pressure] / 2 )) # on a 2GB system this will be 150M

	# concatenate the values (pages) for TCP_MEM
	_SYSCTLV[net.ipv4.tcp_mem]="${TCP_MEM[min]} ${TCP_MEM[pressure]} ${TCP_MEM[max]}"
	_SYSCTLV[net.ipv4.udp_mem]="${TCP_MEM[min]} ${TCP_MEM[pressure]} ${TCP_MEM[max]}"


	# setup the socket buffer memory allocation
	# set the min socket buffer size	

	TCP_RMEM[min]=$(( 4 * PAGESIZE ))
	TCP_WMEM[min]=$(( 4 * PAGESIZE ))

	_SYSCTLV[net.ipv4.udp_rmem_min]=$(( 8 * PAGESIZE ))
	_SYSCTLV[net.ipv4.udp_wmem_min]=$(( 8 * PAGESIZE ))
	
	# Default Socket buffer size
	# Handle 8 times of expected max concurrent connections

	# calculate max values for rmem and wmem in bytes
	let BUF=$(( ( TCP_MEM[max] /  ( _MAX_CONCURRENT * 8 ) ) * PAGESIZE ))
	TCP_RMEM[max]=$(( BUF ))
	TCP_WMEM[max]=$(( BUF ))

	_SYSCTLV[net.core.rmem_max]=${TCP_RMEM[max]}
	_SYSCTLV[net.core.wmem_max]=${TCP_WMEM[max]}
	
	# DEFAULT_BUFFER should not exceed 256 pages of memory
	DEFAULT_BUFFER=$(( 256 * PAGESIZE ))
	
	DEFAULT_BUFFER=$(( (( TCP_MEM[min] / ( _MAX_CONCURRENT * 8 ) ) * PAGESIZE ) ))
	
	RCV_BUFFER=$(( DEFAULT_BUFFER ))
	SND_BUFFER=$(( DEFAULT_BUFFER ))
	
#	[ "x${RECEIVE_SOCKET_BUFFERS}" != "x" ]  && (( DEFAULT_BUFFER > RECEIVE_SOCKET_BUFFERS )) && RCV_BUF=$(( RECEIVE_SOCKET_BUFFERS ))
#	[ "x${SEND_SOCKET_BUFFERS}" != "x" ]  && (( DEFAULT_BUFFER > SEND_SOCKET_BUFFERS )) && SND_BUFFER=$(( SEND_SOCKET_BUFFERS ))
	
	_SYSCTLV[net.core.rmem_default]=$(( RCV_BUFFER ))
	_SYSCTLV[net.core.wmem_default]=$(( SND_BUFFER ))

	TCP_RMEM[default]=$(( RCV_BUFFER ))
	TCP_WMEM[default]=$(( SND_BUFFER ))
		
	_SYSCTLV[net.ipv4.tcp_rmem]="${TCP_RMEM[min]} ${TCP_RMEM[default]} ${TCP_RMEM[max]}"
	_SYSCTLV[net.ipv4.tcp_wmem]="${TCP_WMEM[min]} ${TCP_WMEM[default]} ${TCP_WMEM[max]}"

	# setup netfilter
	_SYSCTLV[net.netfilter.nf_conntrack_buckets]=$(( TCP_MEM[max] / (16384  *  (64 / 32)) ))	
	_SYSCTLV[net.netfilter.nf_conntrack_max]=$(( _MAX_CONCURRENT * 4 * 20 ))
	
	# constants #
	# enable receive buffer auto-tuning, 
	# attempting to automatically size the buffer to match the size required by the path for full throughput.
	_SYSCTLV[net.ipv4.tcp_moderate_rcvbuf]=1
	_SYSCTLV[net.ipv4.tcp_window_scaling]=1
	_SYSCTLV[net.ipv4.tcp_adv_win_scale]=10 # Possible values are [-31, 31], inclusive.

	_SYSCTLV[net.ipv4.ip_local_port_range]="10000 65500"
	_SYSCTLV[net.ipv4.tcp_fin_timeout]=15

	_SYSCTLV[net.ipv4.tcp_keepalive_time]=900
	_SYSCTLV[net.ipv4.tcp_keepalive_intvl]=75
	_SYSCTLV[net.ipv4.tcp_keepalive_probes]=9

	_SYSCTLV[net.ipv4.tcp_abort_on_overflow]=1
	_SYSCTLV[net.ipv4.tcp_tw_recycle]=1
	_SYSCTLV[net.ipv4.tcp_tw_reuse]=1
	_SYSCTLV[net.ipv4.tcp_orphan_retries]=1
	_SYSCTLV[net.ipv4.tcp_retries1]=3
	_SYSCTLV[net.ipv4.tcp_retries2]=8

	_SYSCTLV[net.ipv4.tcp_mtu_probing]=2
	_SYSCTLV[net.ipv4.tcp_rfc1337]=1

	_SYSCTLV[net.ipv4.tcp_slow_start_after_idle]=0
	_SYSCTLV[net.ipv4.tcp_sack]=1
	_SYSCTLV[net.ipv4.tcp_ecn]=1
	_SYSCTLV[net.ipv4.tcp_no_metrics_save]=0
	_SYSCTLV[net.ipv4.tcp_low_latency]=1
	_SYSCTLV[net.ipv4.tcp_fastopen]=1
	
	_SYSCTLV[net.netfilter.nf_conntrack_generic_timeout]=120
	_SYSCTLV[net.netfilter.nf_conntrack_tcp_timeout_established]=$(( 2 * 24 * 60 * 60 )) # 2 days
	
	_SYSCTLV[nf_conntrack_tcp_timeout_close_wait]=10
	_SYSCTLV[nf_conntrack_tcp_timeout_fin_wait]=15
	_SYSCTLV[net.netfilter.nf_conntrack_tcp_timeout_time_wait]=60
	_SYSCTLV[nf_conntrack_tcp_timeout_unacknowledged]=15
 	
	_SYSCTLV[vm.swappiness]=1
	_SYSCTLV[vm.overcommit_memory]=2
	_SYSCTLV[vm.overcommit_ratio]=60
	
#	for K in "${!_SYSCTLV[@]}"; do sysctl -w $K=${_SYSCTLV[$K]}; done 

return;
}



BUILD_SYSCTL()
{

> ${TMP_SYSCTL}

cat <<- _EOF | tee -a ${TMP_SYSCTL}

###############
#       TOTAL SYSTEM MEMORY=$(( M_PAGES * PAGESIZE )) bytes (${M_PAGES} pages)
#                      CPUS=${CPUS}
#                  SOCK_MEM=${_SOCK_MEM}
#            MAX_CONCURRENT=${_MAX_CONCURRENT}
# MAX TCP MEMORY ALLOCATION=$[ TCP_MEM[max] * PAGESIZE ]
#           DEFAULT RCV_BUF=${TCP_RMEM[default]}
#           DEFAULT SND_BUF=${TCP_WMEM[default]}
#               MAX RCV_BUF=${_SYSCTLV[net.core.rmem_max]}
#               MAX SND_BUF=${_SYSCTLV[net.core.wmem_max]}
###############
_EOF


	for K in "${!_SYSCTLV[@]}"
	do 
		sysctl --names $K 2> /dev/null 1> /dev/null || continue;
		echo $K=${_SYSCTLV[$K]}; 
#		sysctl -w $K=${_SYSCTLV[$K]}
	done | tee -a ${TMP_SYSCTL}

	echo "#######xx######" >> ${TMP_SYSCTL}
}

LOAD_SYSCTL()
{

	[ "x${TMP_SYSCTL}" == "x" ] && return;
	[ -f ${TMP_SYSCTL} ] || return;
	
	sysctl --quiet --load=${TMP_SYSCTL}
}

SET_UP_CONNTRACK()
{
	sysctl --names "net.netfilter.nf_conntrack_max" 2> /dev/null 1> /dev/null || return;
	
	NF_CONNTRACK_MAX=${_SYSCTLV[net.netfilter.nf_conntrack_max]}
	HASHSIZE=$(( NF_CONNTRACK_MAX / 8 ))
	[ ! -d /sys/module/nf_conntrack/parameters ] && mkdir -p /sys/module/nf_conntrack/parameters
	
	echo "${HASHSIZE}" > /sys/module/nf_conntrack/parameters/hashsize
	
}

ETH_TXQ()
{
	ip link | awk -F: '$0 !~ "lo|vir|wl|^[^0-9]"{print $2}' | tr -d ' ' | while read eth
	do
		ip link set $eth txqueuelen 10000
	done
}

MAIN()
{
	PRINT_DEFAULTS
	PHYSICAL_MEMORY
	OPTIMIZE_SOCKET_BUFFERS
	BUILD_SYSCTL
	SET_UP_CONNTRACK
	LOAD_SYSCTL
	ETH_TXQ
	echo ""
	
}

MAIN
