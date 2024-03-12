#!/bin/bash --debugger
:<< _EOF
Sample script to demonstrate use of scripts with SafeSquid's External Parser
To use this script, specify /bin/bash as the "Executable" and the full path of this script as the argument.
Thus bash will execute this script as a normal script, without explicitly setting executable permissions to this script.
Note: ssquid:root should be set as the owner of this script.

When an entry is created in External Parser with "Type" set to File, SafeSquid will create a temporary file in /tmp/safesquid.
This file will contain Request/Response Headers and/or the body, depending on the options selected in "Applies To" and "Send Header".
SafeSquid forks an execvp child process to invoke the specified Executable, and sets the full path of the temporary file as the first argument.
SafeSquid sets the environment variables of each forked process and uniquely shares the related information about the request or response for which this script is executed.
Associative arrays ${CLIENT[]} and ${SERVER[]} are used for variable information.
The fork'd process exits only after the script exits.
SafeSquid deletes the temporary file after the fork'd process.
If the script exits exit code 0, SafeSquid will send the output of this scripts results to the user.
_EOF

THIS=`basename "$0"`
RET=1

#the destination folder for the output from this script
DEST_DIR="/var/log/safesquid/ext"

#Logs of all the operations
LOG="${DEST_DIR}/${THIS}.log"
ERROR_LOG="${DEST_DIR}/${THIS}.error.log"

SUB_DIR="${USERNAME}/${HTTP_HOST}"

#create a sub-folder within the destination folder
_MKDIR()
{
	[ "x${DEST_DIR}" == "x" ] && echo "DEST_DIR not specified" && exit 1 # Destination folder not specified
	[ ! -d "${DEST_DIR}" ] && echo "DEST_DIR does not exist" && mkdir -p "${DEST_DIR}"
	[ ! -d "${DEST_DIR}/${SUB_DIR}" ] && mkdir -p "${DEST_DIR}/${SUB_DIR}"
	[ ! -d "${DEST_DIR}/${SUB_DIR}" ] && echo "failed to create ${DEST_DIR}/${SUB_DIR}" && exit 1 # Destination folder cannot be created
	cp $1 "${DEST_DIR}/${SUB_DIR}/${RECORD_ID}" 
}

_PRINTENV()
{
	env | tr -s '\n' '\t'
}


MAIN()
{
	_MKDIR "$1" 2>&1 >> ${ERROR_LOG}
	_PRINTENV "$*" >> ${LOG}
}


MAIN "$*"

exit ${RET}
