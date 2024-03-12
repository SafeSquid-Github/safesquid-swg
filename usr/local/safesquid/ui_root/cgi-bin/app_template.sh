#!/bin/bash

:<< _EOF
Sample Template for all application handler scripts
_EOF

#echo -e "\n\n--called--" | tee -a /tmp/safesquid/manish

CUR_TIME=`date +%c`

DEBUG="Y"

DEBUG_FILE="/dev/null"

[ "x${DEBUG}" == "xY" ] && DEBUG_FILE="/tmp/safesquid/exec"

# Set the default output mime type to the mime type expected by the caller
[ "x${MIME}" == "x" ] && export MIME="text/html" || export MIME="${MIME}"

# pass OP_FILE as an argument if that function can handle path of the required file name
[ "x${OP_FILE}" == "x" ] && unset OP_FILE || export OP_FILE="${OP_FILE}"

CONTENT_LENGTH=0

HEADER()
{
	echo -ne "HTTP/1.1 200 OK"
	echo -ne "\r\n"
	echo -ne "Date: ${CUR_TIME}"
	echo -ne "\r\n"
	echo -ne "Server: SafeSquid/appHandler"
	echo -ne "\r\n"
	echo -ne "Connection: Close"
	echo -ne "\r\n"
	echo -ne "Content-Type: ${MIME}"
	echo -ne "\r\n"
	[ "x${CONTENT_LENGTH}" != "x" ] && echo -ne "Content-Length: ${CONTENT_LENGTH}" && echo -ne "\r\n"
	
	echo -ne "\r\n"
}

SCRIPT_EXEC()
{		
	
	[[ ! -z  ${script_name} ]] && /bin/bash /usr/local/safesquid/ui_root/cgi-bin/${script_name} || return ;
	
}

STAT_FILE()
{
	[ "x${OP_FILE}" == "x" ] && return;
	[ ! -f "${OP_FILE}" ]  && return;

	CONTENT_LENGTH=`stat --format="%s" "${OP_FILE}"`
	MIME=`file -b --mime-type "${OP_FILE}"`
	
	HEADER
	echo -ne `< ${OP_FILE}`
	exit 0;
}

MAIN()
{
	# call the required script
	OUTPUT=`SCRIPT_EXEC` 
	CONTENT_LENGTH=${#OUTPUT}
	
	STAT_FILE
	
	HEADER | tee -a ${DEBUG_FILE}
	echo -ne "${OUTPUT}" | tee -a ${DEBUG_FILE}
}


MAIN
#Ensuring the content produced by this script will be used to render output on the UI
exit 0
