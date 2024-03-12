#!/bin/bash

UPGRADE_PACKAGE="@UPGRADE_PACKAGE@"

_e=0
_MONIT_STATUS=""
SH=$(which bash) ; _e=$? ; [ "x${_e}" == "x0"  ] || exit 0  
TAR=$(which tar) ; _e=$? ; [ "x${_e}" == "x0"  ] || exit 0  
_MONIT=$(which monit) ; _e=$? ; [ "x${_e}" == "x0"  ] || _MONIT=""  
[ "x${_MONIT}" != "x" ] && ${_MONIT} status && let _MONIT_STATUS=0


# UPDATE="/tmp/safesquid/upgrade"
STAGING="/tmp/staging"
SETUP_SCRIPT_DIR="_mkappliance/installation/"
SETUP_SCRIPT="setup.sh"
LOG="/var/log/syslog"

LOG_IT ()
{
	TIME=`date +"%Y %m %d %T"`
	echo "${TIME} [-1] safesquid upgrade: ${*}"
	
	return;
}

REMOVE_RESIDUE ()
{
	[ -f ${UPGRADE_PACKAGE} ] && rm ${UPGRADE_PACKAGE}
	[ "${STAGING}/" == "/" ] && return;
	[ ! -d "${STAGING}/" ] && return;
	rm -rf "${STAGING}/" 
}

MONIT_RESUME()
{
	[ "x${_MONIT_STATUS}" != "x0" ] && return;
	${_MONIT} reload
	${_MONIT} monitor all
	${_MONIT} validate
	${_MONIT} start all
}

DIE()
{
	REMOVE_RESIDUE
	MONIT_RESUME
}

MAIN ()
{
#	[ -f ${UPDATE} ] || exit 0 # File that contains path of upgrade package not found
	
#	UPGRADE_PACKAGE=`<${UPDATE}`
	
	[ "x${UPGRADE_PACKAGE}" == "x" ] && LOG_IT "upgrade package not set" && return # upgrade package not set
	
	[ ! -f "${UPGRADE_PACKAGE}" ] && LOG_IT "upgrade package not found" && return # upgrade package not found
	
	[ "${STAGING}/" == "/" ] && LOG_IT "staging folder not specified" && return # staging folder not specified
	
	[ ! -d "${STAGING}/" ] && LOG_IT "creating staging folder" && mkdir "${STAGING}" # create staging folder if not exists
	[ ! -d "${STAGING}/" ] && LOG_IT "failed to create staging folder" && return # failed to create staging folder
	
	${TAR} -zxvf "${UPGRADE_PACKAGE}" -C "${STAGING}/" 
		
	[ ! -f "${STAGING}/${SETUP_SCRIPT_DIR}${SETUP_SCRIPT}" ] && LOG_IT "setup script not found" && return # setup script not found
	[ "x${_MONIT_STATUS}" != "x0" ] && ${_MONIT} unmonitor all
	${SH} "${STAGING}/${SETUP_SCRIPT_DIR}/${SETUP_SCRIPT}"
}

MAIN
DIE
