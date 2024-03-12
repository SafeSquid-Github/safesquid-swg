#!/bin/bash

LOCAL_CA="/usr/local/safesquid/security/ssl/trusted"
BADCERTS="/var/db/safesquid/ssl/badcerts/X509_V_ERR_UNABLE_TO_GET_ISSUER_CERT_LOCALLY"

TEMP="/tmp/verify_host/$$"
CA_BUNDLE="${TEMP}/tusted_ca_bundle.crt"
TEST_CERT_D="${TEMP}/TEST_CERT_D"
TEST_CA_DER="${TEMP}/TEST_CA.DER"
TEST_CA_PEM="${TEMP}/TEST_CA.PEM"
ADD_D="${TEMP}/add"

LOG_FILE="/var/log/`basename $0`.log"

declare -a CHAIN;
declare -a NEW_CA;

SETUP()
{
	HOST="${1}"
	HOSTCERT="${TEMP}/${HOST}"
	PORT="443"
	unset CHAIN NEW_CA;
	[ -d "${TEMP}/" ] && rm -rf "${TEMP}/*"
	[ -d "${TEST_CERT_D}/" ] && rm -rf "${TEST_CERT_D}/*"
	[ -d "${ADD_D}/" ] && rm -rf "${ADD_D}/*"
	mkdir -p "${TEMP}/"
	mkdir -p "${TEST_CERT_D}/"
	mkdir -p "${ADD_D}/"

	find "${LOCAL_CA}" -type f | while read CRT
	do
		cat ${CRT} >> "${CA_BUNDLE}"
	done
}


CHECK_HOST()
{
	host ${HOST} | grep -o -iE "\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"	
	[ $? == 0 ] && return 0;	
	echo "${FUNCNAME}:${LINENO}: DNS failed: host ${HOST}"
	return 1
}

S_CLIENT()
{
	echo "" | openssl s_client -showcerts -servername ${HOST} -connect ${HOST}:${PORT} 2> /dev/null 
}

GET_CERT_CHAIN()
{
	S_CLIENT | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > "${HOSTCERT}"
}

TEST_CERT()
{
	CERT=$1
	openssl verify --CAfile "${CA_BUNDLE}" "${CERT}"
	let X=$?
	echo "${FUNCNAME}:${LINENO}: $X"
	return $X
}

SPLIT_CHAIN()
{
	awk -v pt="${TEST_CERT_D}/" 'BEGIN {c=0;} /BEGIN CERT/{c++} { print > pt "cert." c ".pem"}' < "${HOSTCERT}"	
	for(( i=1; i<=100; i++ ))
	do
		CERT="${TEST_CERT_D}/cert.$i.pem"
		[ ! -f "${CERT}" ] && break;
		CHAIN+=("${CERT}")
	done
}

GET_ISSUER_URL()
{
	openssl x509  -text -noout | grep "CA Issuers - URI" | grep -o "http://.*" 
}

ADD_NEW()
{
	CERT=$1
	
	# Add the new Issuer Trusted Certificate into the bundle of Trusted Root Certificates
	cat "${CERT}" >> ${CA_BUNDLE}		
	
	# Determine the name of the Issuer from the certificate, and transform it to create an appropriate file name
	ADX=`openssl x509  -subject -noout -nameopt multiline -in "${CERT}" | sed -n 's/ *commonName *= //p' | tr -s ' ' '_' `
	
	mv "${CERT}" "${ADD_D}/${ADX}.crt"
	NEW_CA+=("${ADD_D}/${ADX}.crt")
}

DER_TO_PEM ()
{
	openssl x509 -inform DER -outform PEM
}


TEST_CHAIN()
{
	let i=$[ ${#CHAIN[@]} - 1 ]
	
	# start checking all certificates in the chain, starting with the last certificate
	while [ $i -ge 0 ]
	do
		echo "i: $i"
	
		CERT=${CHAIN[$i]}
		[ ! -f "${CERT}" ] && echo "not found: ${CERT}" && break;
		
		# If this certificate in the chain is trusted move to the next certificate in chain
		TEST_CERT ${CERT} && i=$[ i - 1 ] && continue;
		
		# Determine the CA User URI and download the Issuer Certificate
		cat ${CERT} | GET_ISSUER_URL | xargs wget -cnd $1 -O - > ${TEST_CA_DER} 
		
		cat ${TEST_CA_DER} | DER_TO_PEM > "${TEST_CA_PEM}"
		
		# If we trust this Issuer Certificate we include it for testing and addition
		TEST_CERT "${TEST_CA_PEM}" && ADD_NEW "${TEST_CA_PEM}" && continue;

		# Incomplete: If this is an intermediate CA certificate that also needs further call to fetch its issuer, more work will be required.
		
		break;
		
	done
}

COPY_CA()
{
	for (( i=$[ ${#NEW_CA[@]} - 1 ]; i>=0 ; i-- ))
	do
		mv "${NEW_CA[$i]}" "${LOCAL_CA}/"
	done
}

MAKE_CERT()
{
	SETUP "${1}"
	CHECK_HOST || return 1
	GET_CERT_CHAIN 
	TEST_CERT ${HOSTCERT} && return 0
	SPLIT_CHAIN
	TEST_CHAIN
#	COPY_CA
}

SCAN_DIR()
{
	find "${BADCERTS}" -type f -printf "%f\n"	| while read HH
	do
		MAKE_CERT "${HH}"
	done
}

MAIN()
{
	if [ "x${1}" != "x" ] 
	then
		MAKE_CERT "${1}"
	else
		SCAN_DIR 2>&1 >> "${LOG_FILE}"
	fi
}


MAIN "${1}"
