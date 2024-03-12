#!/bin/bash
# called by _USER_ to perform the necessary updation
# perform the process of updating the files in the safesquid folder
# ACTION(s) performed : softlink, mkdir, copy with overwite, copy without overwrite
# OWNERSHIP and PERMISSIONS will also be set

THIS_PROCESS=$BASHPID

shopt -s expand_aliases
trap _CLEANUP `seq 0 15`

if [[ -t 1 ]]; then
	exec 1> >( exec logger --id=${THIS_PROCESS} -s -t "safesquid.setup" ) 2>&1
	CHILD=$!
else
	exec 1> >( exec logger --id=${THIS_PROCESS} -t "safesquid.setup" ) 2>&1
	CHILD=$!
fi

set -o pipefail

CWD=`dirname $0`
IAM=`basename $0`
DIST=""
_USER_="ssquid"
_GROUP_="root"
OWNER="${_USER_}:${_GROUP_}"
_MONIT_STATUS=""
_MONIT=$(which monit) ; _e=$? ; [ "x${_e}" == "x0"  ] || _MONIT=""  
[ "x${_MONIT}" != "x" ] && ${_MONIT} status && let _MONIT_STATUS=0


[ "x${CWD}" == "x." ] && CWD=`pwd`

PARENT_DIR=`dirname ${CWD}`

LIST=${CWD}"/list.conf";
OLD_FILES=${CWD}"/old.conf";

DATE=`date`;
L=0;


_CLEANUP()
{
	echo "cleaning up"
	[ "x${INIT_PID}" != "x" ] && rm -v "${INIT_PID}"
	DIE
	set -e
	trap 'echo "exiting.. $$";' `seq 0 15`
	kill -15 ${CHILD}  ${THIS_PROCESS}  2>&1 > /dev/null
	exit 0
}

_CLEANUP_()
{
	echo "cleaning up setup"
	set -e
	trap 'echo "exiting.. $$";' `seq 0 15`
	kill ${CHILD} ${THIS_PROCESS}  2>&1 > /dev/null
	exit 0
}


MONIT_RESUME()
{
	[ "x${_MONIT_STATUS}" != "x0" ] && return;
	echo "Resuming Monit"
	${_MONIT} reload
	${_MONIT} monitor all
	${_MONIT} validate
	${_MONIT} start all
}


DIE()
{
	START_SAFESQUID
	MONIT_RESUME
}


STOP_SAFESQUID ()
{
	[ ! -f "${CWD}/../etc/init.d/safesquid" ] && return;
	echo "stopping SafeSquid"
	${CWD}/../etc/init.d/safesquid stop;
}

START_SAFESQUID ()
{
	[ ! -f "${CWD}/../etc/init.d/safesquid" ] && return;
	echo "starting SafeSquid"
	${CWD}/../etc/init.d/safesquid start;
}



WHICH_PLATFORM ()
{
	which aptitude && DIST="DB" && echo "platform: Debian" && return;
	which apt-get && DIST="DB" && echo "platform: Debian" && return;
	which yum && DIST="RH" && echo "platform: Red-Hat" && return;
	DIE "platform: unknown"
}

MAKE_USER_ ()
{
	ID=""; 
	unset GID;
	typeset -a GID;
	unset G; typeset -i G; G=1
	
	useradd -r ${_USER_} -g ${_GROUP_} --shell ${SHELL}
	usermod ${_USER_} -g ${_GROUP_}
	ID=`id -un ${_USER_}` || DIE 
	GID=( `id -Gn ${_USER_}` ) || DIE 

	for grps in ${GID[*]}
	do
		[ "x${grps}" != "x${_GROUP_}" ] && continue;			
		echo "_USER_ ${_USER_} is a member of _GROUP_ ${_GROUP_}" && G=0 && break;			
	done
	
	[ "x${G}" != "x0" ] && DIE 
	
	return;
}


DEBIAN_INSTALLATION()
{	
	declare -a PACKS
	PACKS+=( `< ${CWD}/dependencies.lst` )
	PACKS+=( `< ${CWD}/system_dependnecies.lst` )
	
	if [ "x${PACKS}" != "x" ]; then
		export DEBIAN_FRONTEND=noninteractive
		aptitude -q -y install ${PACKS[*]}
		aptitude -y autoclean
		export DEBIAN_FRONTEND=
	fi	
}

REDHAT_INSTALLATION()
{	
	PACKS=`< ${CWD}/rh_dependencies.lst`	
	
	if [ "x${PACKS}" != "x" ]; then
		yum install ${PACKS}
	fi
}

INSTALL_PACKAGES()
{	
	[ "x${DIST}" == "x" ] && DIE "platform: unknown"
	[ "x${DIST}" == "xDB" ] && DEBIAN_INSTALLATION && return;
	[ "x${DIST}" == "xRH" ] && REDHAT_INSTALLATION && return;	
}

INSTALL_APPLIANCE ()
{
	rsync -av --exclude "installation" ${PARENT_DIR}/ /
}

READ_OLD()
{
	source ${OLD_FILES}
}

REMOVE_OLD()
{
	local i=0
	for (( i=0; i<${#OLD[*]}; i++))
	do
		[ "x${OLD[$i]}" == "x" ] && continue;
		[ ! -e  "${OLD[$i]}" ] && continue;
		rm -f "${OLD[$i]}"	
	done
}

MAIN()
{
	[ "x${_MONIT_STATUS}" == "x0" ] && ${_MONIT} unmonitor all

	WHICH_PLATFORM
	MAKE_USER_
	READ_OLD
	REMOVE_OLD
	INSTALL_PACKAGES
	STOP_SAFESQUID
	INSTALL_APPLIANCE
	START_SAFESQUID
	return;
}


#MAIN | LOGGER
MAIN 
DIE
echo "All Done!"
exit 0

:<< _EOF
MAIN |& tee -a ${echoF};
chown ${OWNER} ${echoF}
DIE
echo "All Done!"
_EOF