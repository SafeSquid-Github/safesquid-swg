#!/bin/bash

. /opt/safesquid/safesquid_params.sh && EXPORT_INI

SUPPORT_PATH="${SUPPORT_DIR}"
LOG_LINES="5000"

[ "x$1" != "x" ] && SUPPORT=$1 || SUPPORT="${PROGRAM_NAME}-`date +%Y-%m-%d-%H-%M-%S`"

SAFESQUID_LOGS="${SUPPORT}/safesquid_logs"
SYSTEM_LOGS="${SUPPORT}/system_logs"
SYSTEM_DETAILS="${SUPPORT}/system_details"


TIME_STAMP ()
{
	echo -ne `date "+%Y-%m-%d::%H:%M:%S.%N"`"\t"
	echo "$*"	
	return;
}

MAKE_FOLDER_STRUCTURES(){	
	TIME_STAMP Creating folder: ${SUPPORT} to contain relevant files and information for support
	[ ! -d ${SUPPORT_PATH} ] && TIME_STAMP "creating support directory: ${SUPPORT_PATH}" && mkdir -p ${SUPPORT_PATH}
	
	cd "${SUPPORT_PATH}"
	#base structure
	mkdir -p ${SUPPORT}	
	#logs
	mkdir -p ${SAFESQUID_LOGS}
	mkdir -p ${SYSTEM_LOGS}	
}

SAFESQUID_LOGS_COLLECTOR(){	

	if [ -f  ${NATIVE_LOG_PATH} ]
	then
		TIME_STAMP Copying last ${LOG_LINES} lines of ${NATIVE_LOG_PATH} to ${SAFESQUID_LOGS}/safesquid.log
		tail -n ${LOG_LINES} ${NATIVE_LOG_PATH} > ${SAFESQUID_LOGS}/safesquid.log		
		cat ${NATIVE_LOG_PATH} | grep -e 'error:' | tail -n ${LOG_LINES} > ${SAFESQUID_LOGS}/error_safesquid.log				
		cat ${NATIVE_LOG_PATH} | grep -e 'warn:' | tail -n ${LOG_LINES} > ${SAFESQUID_LOGS}/warn_safesquid.log
		cat ${NATIVE_LOG_PATH} | grep -e 'advice:' | tail -n ${LOG_LINES} > ${SAFESQUID_LOGS}/advice_safesquid.log
		cat ${NATIVE_LOG_PATH} | grep -e 'security:' | tail -n ${LOG_LINES} > ${SAFESQUID_LOGS}/security_safesquid.log
	fi
				
	if [ -f ${EXTENDED_LOG_PATH} ]
	then
		TIME_STAMP Copying last ${LOG_LINES} lines of ${EXTENDED_LOG_PATH} to ${SAFESQUID_LOGS}/extended.log
		tail -n ${LOG_LINES} ${EXTENDED_LOG_PATH} > ${SAFESQUID_LOGS}/extended.log
	fi
	
	if [ -f ${PERFORMANCE_LOG_PATH} ]
	then
		TIME_STAMP Copying last ${LOG_LINES} lines of ${PERFORMANCE_LOG_PATH} to ${SAFESQUID_LOGS}/performance.log
		tail -n ${LOG_LINES} ${PERFORMANCE_LOG_PATH} > ${SAFESQUID_LOGS}/performance.log
	fi
	
}

SAFESQUID_PROPERTY(){
#section xml
	cp -r ${SECTIONS_DIR} ${SUPPORT}/
	
#config xml
	cp ${CONFIG_XML_PATH} ${SUPPORT}/config.xml
	
#ini files	
	cp "${SETUP_FILE_PATH}" ${SUPPORT}/
	
	cp "${DEFAULT_CONFIGURATION_FILE_PATH}" ${SUPPORT}/
    [ -f "${CONFIGURATION_FILE_PATH}" ] && cp "${CONFIGURATION_FILE_PATH}" ${SUPPORT}/       
	
}


SYSTEM_LOGS_COLLECTOR(){
	MONIT_LOG_FILE="/var/log/monit.log"
	MESSAGE_FILE="/var/log/messages"
	
	if [ -f ${MONIT_LOG_FILE} ]
	then
		TIME_STAMP Copying last ${LOG_LINES} lines of ${MONIT_LOG_FILE} to ${SYSTEM_LOGS}/monit.log
		tail -n ${LOG_LINES} ${MONIT_LOG_FILE} > ${SYSTEM_LOGS}/monit.log
	fi
	
	if [ -f ${MESSAGE_FILE} ]
	then
		TIME_STAMP Copying last ${LOG_LINES} lines of ${MESSAGE_FILE} to ${SYSTEM_LOGS}/message
		tail -n ${LOG_LINES} ${MESSAGE_FILE} > ${SYSTEM_LOGS}/message
	fi
	
	dmesg | tail -n ${LOG_LINES} > ${SYSTEM_LOGS}/dmesg
	
}

SERVER_PARAMS(){
	#sysctl params
	TIME_STAMP Getting sysctl information into ${SUPPORT}/sysctl.txt
	sysctl -a > ${SUPPORT}/sysctl.txt 2> /dev/null

	#network
	TIME_STAMP Getting the Information about Network Interfaces into ${SUPPORT}/network.txt
	netstat -v -e --interfaces >> ${SUPPORT}/network.txt
	TIME_STAMP Getting the Information about Network Routing Table into ${SUPPORT}/network.txt
	netstat -v -e --route >> ${SUPPORT}/network.txt
	TIME_STAMP Getting the Network Statistics into ${SUPPORT}/network.txt
	echo -e "\n--- Network Statistics ---\n" >> ${SUPPORT}/network.txt
	netstat -v -e --statistics >> ${SUPPORT}/network.txt
	echo -e "\n--- resolve.conf ---\n" >> ${SUPPORT}/network.txt
	cat /etc/resolv.conf >> ${SUPPORT}/network.txt
		
	#iptables
	TIME_STAMP Getting iptables NAT Configuration into ${SUPPORT}/iptables.txt
	echo -e "\n--- IPTABLES NAT rules ---\n" >> ${SUPPORT}/iptables.txt
	iptables -L -v -n -t nat >> ${SUPPORT}/iptables.txt
	TIME_STAMP Getting iptables MANGLE Configuration into ${SUPPORT}/iptables.txt
	echo -e "\n--- IPTABLES MANGLE rules ---\n" >> ${SUPPORT}/iptables.txt
	iptables -L -v -n -t mangle >> ${SUPPORT}/iptables.txt
	TIME_STAMP Getting iptables FILTER Configuration into ${SUPPORT}/iptables.txt
	echo -e "\n--- IPTABLES Filter rules ---\n" >> ${SUPPORT}/iptables.txt
	iptables -L -v -n -t filter >> ${SUPPORT}/iptables.txt
		
	#disk and partition
	TIME_STAMP Getting Disk Partitions Information into ${SUPPORT}/filesystem.txt
	echo -e "\n-- Disks and Partitions --\n" >> ${SUPPORT}/filesystem.txt
	fdisk -l >> ${SUPPORT}/filesystem.txt
	TIME_STAMP Getting Disk Usage Information into ${SUPPORT}/filesystem.txt
	echo -e "\n-- Disk Usage Information --\n" >> ${SUPPORT}/filesystem.txt
	df -Tha >> ${SUPPORT}/filesystem.txt
	TIME_STAMP Getting Disk inode Usage Information into ${SUPPORT}/filesystem.txt
	echo -e "\n-- Disk inodes Usage Information --\n" >> ${SUPPORT}/filesystem.txt
	df -Tiha >> ${SUPPORT}/filesystem.txt	
	TIME_STAMP Getting File System Mount Information into ${SUPPORT}/filesystem.txt
	echo -e "\n-- System Mount Information --\n" >> ${SUPPORT}/filesystem.txt
	mount -l >> ${SUPPORT}/filesystem.txt
	
	#system information			
	TIME_STAMP Getting Kernel Information into ${SUPPORT}/systeminfo.txt
	echo -e "\n-- Kernel Information --\n" >> ${SUPPORT}/systeminfo.txt
	cat /proc/version >> ${SUPPORT}/systeminfo.txt
	TIME_STAMP Getting CPU information into ${SUPPORT}/systeminfo.txt
	echo -e "\n-- Processors Information --\n" >> ${SUPPORT}/systeminfo.txt
	cat /proc/cpuinfo >> ${SUPPORT}/systeminfo.txt
	TIME_STAMP Getting Memory Information into ${SUPPORT}/systeminfo.txt
	echo -e "\n-- Memory Information --\n" >> ${SUPPORT}/systeminfo.txt
	cat /proc/meminfo >> ${SUPPORT}/systeminfo.txt
	TIME_STAMP Getting ram memory into ${SUPPORT}/systeminfo.txt
	echo -e "\n--ram Memory Information --\n" >> ${SUPPORT}/systeminfo.txt
	free -m >> ${SUPPORT}/systeminfo.txt
	
}

CREATE_TARBALL(){

	TIME_STAMP Creating the tar-ball for sending to SafeSquid Technical Support
	tar -czf ${SUPPORT}.tar.gz ${SUPPORT} 2> /dev/null
	TIME_STAMP Extracted contents of the support tar-ball may be confirmed from ${SUPPORT}
	chown -R ssquid:root ${SUPPORT_PATH}
	wait
	rm -rf ${SUPPORT}
	
}


MAIN(){

MAKE_FOLDER_STRUCTURES
SAFESQUID_LOGS_COLLECTOR
SAFESQUID_PROPERTY
SYSTEM_LOGS_COLLECTOR
SERVER_PARAMS
CREATE_TARBALL

}

MAIN $*
