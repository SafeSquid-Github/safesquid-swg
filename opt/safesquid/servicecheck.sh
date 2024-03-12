#!/bin/bash

. /opt/safesquid/safesquid_params.sh && EXPORT_INI

NATIVE_LOG="${VAR_LOG}/${PROGRAM_NAME}/native/safesquid.log"
EXTENDED_LOG="${VAR_LOG}/${PROGRAM_NAME}/extended/extended.log"
PID_FILE="${VAR_RUN}/${PROGRAM_NAME}/${PROGRAM_NAME}.pid"
PERFORMANCE_LOG="${VAR_LOG}/${PROGRAM_NAME}/performance/performance.log"


KILLALL="/usr/bin/killall"
NOW=$(date "+%s" --date="-3 second")

LOG_IT()
{
	date "+%Y %m %d %H:%M:%S [0] warn: servicecheck : ${1}"
}

DATE()
{
	date -r ${1} "+%s"
}

# service was recently started
[ $(DATE ${PID_FILE}) -gt ${NOW} ] && exit 0

# requests are being serviced
[ $(DATE ${EXTENDED_LOG}) -gt ${NOW} ] && exit 0

# process is doing something
[ $(DATE ${NATIVE_LOG}) -gt ${NOW} ] && exit 0

# performance log is moving
[ $(DATE ${PERFORMANCE_LOG}) -gt ${NOW} ] && exit 0

# if we have not exited by now then SafeSquid needs to die

# send TERM signal to all processes running by SafeSquid's user
${KILLALL} -u ${USER} -s TERM
sleep 3s

# make sure we have no zombie processes
${KILLALL} -u ${USER} -s KILL

LOG_IT "killed by servicecheck" >> ${NATIVE_LOG}

exit 1
