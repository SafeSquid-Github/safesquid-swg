#!/bin/bash

# detect and remove expired certificates
EXIPRY_DUE=86400

THIS_PROCESS=$BASHPID
shopt -s expand_aliases

if [[ -t 1 ]]; then
	exec 1> >( exec logger --id=${THIS_PROCESS} -s -t "remove_expired.sh" ) 2>&1
	CHILD=$!
else
	exec 1> >( exec logger --id=${THIS_PROCESS} -t "remove_expired.sh" ) 2>&1
	CHILD=$!
fi

declare -x -a CERT_FOLDERS=();

CERT_FOLDERS+=("/var/db/safesquid/ssl/certs/")
CERT_FOLDERS+=("/usr/local/safesquid/security/ssl/")

IS_CERT()
{
	typeset -i z
	openssl x509 -noout -in $1 2> /dev/null
	z=$?
	[[ $z -eq 0 ]] && return $z
	echo "${1} is not an x509 certificate"
	return $z
}


COND_REMOVE()
{
	while read PEM
	do
		IS_CERT ${PEM} || continue;
		openssl x509 -checkend ${EXIPRY_DUE} -noout -in ${PEM} > /dev/null && continue;
		echo "${PEM} is expired"
		echo "remove PEM: ${PEM}"
		rm -v ${PEM}
	done 
}


MAIN()
{    
	typeset -i i=0
	typeset -i z=${#CERT_FOLDERS[*]}
	
	while [ $i -lt $z ]
	do
		find ${CERT_FOLDERS[$i]} -type f | COND_REMOVE
		(( i++ ))
	done
	
	date > /var/run/safesquid/cert.check
	
	return;
}


MAIN