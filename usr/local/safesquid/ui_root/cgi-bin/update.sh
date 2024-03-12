#!/bin/bash


UPDATE="/tmp/safesquid"
UPTAR_UPDATE="${UPDATE}/_mkappliance/installation"
TAR_NAME=$(cat ${UPDATE}/upgrade)
MAIN()
{
	[ ! -f "${UPDATE}/${TAR_NAME}" ] && echo "${UPDATE}/${TAR_NAME} tar not available" && return 0;	
	[ -d "${UPDATE}/${UPTAR_UPDATE}" ] && rm -rf "${UPDATE}/_mkappliance" && continue;
	
	cd ${UPDATE} && tar -xvzf ${TAR_NAME} 
	
	if [ $? -eq 0 ]; then
		echo "successfully untar ${TAR_NAME}"
		cd "${UPTAR_UPDATE}" 		
		./setup.sh	
	else
		echo "failed to untar ${TAR_NAME}"
	fi
	
}

MAIN
