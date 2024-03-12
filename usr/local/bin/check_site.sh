#!/bin/bash

PROXY="-proxy 127.0.0.1:8080"

#SITE="www.fieldglass.net"
SITE="www.safesquid.com"
#SITE="www.google.com"
PORT=443

OPTS=""
#OPTS+=" -debug"
#OPTS+=" -msg"
OPTS+=" -state"
#OPTS+=" -reconnect"
#OPTS+=" -quiet"
OPTS+=" -ign_eof"
#OPTS+=" -no_tls1_3"

SESSION ()
{
	SESS=""
	[ ! -d /tmp/sess ] && mkdir /tmp/sess
	[ -f /tmp/sess/${SITE} ] && SESS+=" -sess_in /tmp/sess/${SITE}"
	SESS+=" -sess_out /tmp/sess/${SITE}"
}


CA()
{
	CAFILE="--CAfile "
	[ "x${PROXY}" == "x" ] && CAFILE+="/usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt" && return;
	CAFILE+="/usr/local/safesquid/security/ssl/ROOT_X509File.cer" && return;
}


GET()
{

todos <<- _EOF
GET /ok.txt HTTP/1.1
Host: ${SITE}
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
DNT: 1
Connection: close
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: none
Sec-Fetch-User: ?1
Pragma: no-cache
Cache-Control: no-cache

_EOF

}

CA
SESSION

GET | openssl s_client ${CAFILE} ${OPTS}  ${SESS} -servername ${SITE} -connect ${SITE}:$PORT ${PROXY}
exit

Accept-Encoding: gzip, deflate, br


