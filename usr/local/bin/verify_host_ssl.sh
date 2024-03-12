#!/bin/bash

# business.gateway.ohio.gov

SSL_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt"
LOCAL_CA="/usr/local/share/ca-certificates"

CHECK_HOST()
{
	host ${1} |& grep -o -iE "\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"	
	[ $? == 0 ] && return 0;	
	echo "DNS failed: host ${HOST}"
	exit 1
}

GET_CERT()
{
	echo "" | openssl s_client -showcerts -servername ${1} -connect ${1}:443 2> /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' | tee "${MYCERT}"
}

VERIFY_CERT()
{
	openssl verify --verbose --CAfile "${SSL_CA_BUNDLE}"
	let X=$?
	echo "result: $X"
	return $X
}


UPDATE_CA_BUNDLE()
{
	update-ca-certificates --fresh
}


PARSE_QUERY()
{
	URL=$1
	PROTO=${URL%%://*}; 
	[ "x${PROTO}" == "x${URL}" ] && PROTO="https"
	
	URI=${URL#*//}; 
	HOST_PORT=${URI%%/*}; 
	FQDN=${HOST_PORT%%:*}; 
	PORT=${HOST_PORT##*:}; 
	[ "x${PORT}" == "x${HOST_PORT}" ] && PORT=443
	FILE=${URI#*/}; 
	echo PROTO[$PROTO] URI[$URI] HOST_PORT[$HOST_PORT] FQDN[$FQDN] PORT[$PORT] FILE[$FILE];

}

MAIN()
{
	PARSE_QUERY $1
	exit
	CHECK_HOST $1
	CERT=`GET_CERT $1`
	echo -e "CERT:\n${CERT}"
	echo "${CERT}" | VERIFY_CERT
	exit
}


MAIN $1
echo "${TEMP}"
#rm -rf "${TEMP}"

exit
PROTO=${URL%%://*}; URI=${URL#*//}; HOST_PORT=${URI%%/*}; FQDN=${HOST_PORT%%:*}; PORT=${HOST_PORT##*:}; FILE=${URI#*/}; echo $PROTO $URI $HOST_PORT $FQDN $PORT $FILE;
