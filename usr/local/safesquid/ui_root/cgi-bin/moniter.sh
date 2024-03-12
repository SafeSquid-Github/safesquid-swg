#!/bin/bash
#written by Suhas @SafeSquid Labs
#####################################
#This script will be used for sending 
#####################################

exit

. /opt/safesquid/safesquid_params.sh && EXPORT_INI

# Sender's  Username and password account for sending mail
SNDR_UNAME="suhaskekuda@gmail.com"
SNDR_PASSWD="***********"

# Define recepient's email ID
TO_MAIL=""

# Define mail server for sending mail [ IP:PORT or HOSTNAME:PORT ]
RELAY_SERVER="smtp://smtp.gmail.com:25"

MAIL_CONTENT="email-contents.txt"

HARDDISK_LIMIT_MAX=${MAX_MAIL_THRESHOLD}
HARDDISK_LIMIT_MIN=${MIN_MAIL_THRESHOLD}
DAYS_DATA_KEEP=${KEEP_DATA}

i=0;p=0
unset DIRECTORIES
DIRECTORIES[$p]="/";p=$((i++));
DIRECTORIES[$p]="/var/log/safesquid";p=$((i++));
DIRECTORIES[$p]="/var/db/safesquid";p=$((i++));
DIRECTORIES[$p]="/usr/local/safesquid";p=$((i++));

i=0;p=0
unset LOCATION
LOCATION[$p]="/var/log ; /var/cache/apt/archives";p=$((i++));
LOCATION[$p]="/var/log/safesquid/native ; /var/log/safesquid/extended ; /var/log/safesquid/performance ; /var/log/safesquid/config ";p=$((i++));
LOCATION[$p]="/var/db/safesquid";p=$((i++));
LOCATION[$p]="/usr/local/safesquid";p=$((i++));

x=$[ ${#DIRECTORIES[*]} - 1 ]
for i in `seq 0 $x`
do
	CURRENT_LIMIT=$(df -kh --output ${DIRECTORIES[$i]} | sed 1d | awk '{print $10}' | tr -d '%')
	
	if [ [ ${CURRENT_LIMIT} -ge ${HARDDISK_LIMIT_MIN} ] && [ ${CURRENT_LIMIT} -lt ${HARDDISK_LIMIT_MAX} ] ]; then	
		
		cat << _EOF > ${MAIL_CONTENT}
Subject: SafeSquid Hardisk Info

Critical diskspace. 		

	:: Hard disk details are as below ::
		
	`df -h`
							
	Advice : Move/Delete Safesquid generated logs ..
	Note : If the harddisk utilization reaches ${HARDDISK_LIMIT_MAX}% below files will be deleted
	
_EOF

		curl --connect-timeout 15 -v --insecure ${RELAY_SERVER} -u "${SNDR_UNAME}:${SNDR_PASSWD}" --mail-from ${SNDR_UNAME} --mail-rcpt ${TO_MAIL} -T ${MAIL_CONTENT} --ssl
		
		rm -rf ${MAIL_CONTENT}
	fi
	
	if [ ${CURRENT_LIMIT} -ge ${HARDDISK_LIMIT_MAX} ]; then	
			cat << _EOF > ${MAIL_CONTENT}
Subject: SafeSquid deleted files from ${DIRECTORIES[$i]}

Critical diskspace. 		
	Cleaning partition for space . Hope you had taken backup.
	
_EOF
		unset CRT_PATH
		#delete option to be written here
		IFS=';' read -ra CRT_PATH <<<${LOCATION[$i]}	
		
		y=$[ ${#CRT_PATH[*]} - 1 ]
		for m in `seq 0 $y`
		do
			find ${CRT_PATH[$m]} -mindepth 1 -mtime +${DAYS_DATA_KEEP} -delete
		done
		
		curl --connect-timeout 15 -v --insecure ${RELAY_SERVER} -u "${SNDR_UNAME}:${SNDR_PASSWD}" --mail-from ${SNDR_UNAME} --mail-rcpt ${TO_MAIL} -T ${MAIL_CONTENT} --ssl
		
		rm -rf ${MAIL_CONTENT}
	fi
	
done