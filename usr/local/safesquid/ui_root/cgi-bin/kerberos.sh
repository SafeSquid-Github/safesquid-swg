#!/bin/bash
#This script will help in setup kerberos 
#This script can be used for both ui as well as command line
. /opt/safesquid/safesquid_params.sh && EXPORT_INI

set -o pipefail

_KDESTROY=$(which kdestroy)
_KINIT=$(which kinit)
_MSKTUTIL=/usr/local/bin/msktutil
_KTUTIL=$(which ktutil)
_KLIST=$(which klist)

_AD_USER=""
MY_COMPUTER_NAME="$(hostname -s)"
MY_FQDN="$(hostname -f)"
MY_DOMAIN="$(hostname -d)"
SPN=${SERVICE_PRINCIPAL_NAME%%.*}
REALM=${AD_DOMAIN^^}


# > /tmp/safesquid/kerberos

LOG()
{
	cat - | tee -a /tmp/safesquid/kerberos
	echo -ne "kerberos : ${*}" | tee -a /tmp/safesquid/kerberos
}


DEPENDENCY_CHECK()
{
	local RET=1

	#msktutil dependency-check.
	LOG "Generate Keytab: calling RUN_MSKTUTIL\n"
	[ ! -f "${_MSKTUTIL}" ] && LOG "library: ${_MSKTUTIL}: not found\n" && return ${RET};
    PAKG=$( ldd ${_MSKTUTIL} | grep "not found" )
    [ "x${PAKG}" != "x" ] && LOG "library:${PAKG}\n" && return ${RET};
	
	return 0;
}

DO_KDESTROY()
{
	RET=1
	${_KDESTROY} --all |& LOG && RET=0	
	[ "x${RET}"  == "x1" ] && LOG "${_KDESTROY}: failed\n" && return;
	 LOG "${_KDESTROY}: successful\n"
}


KINIT_USER()
{		
	RET=1
	LOG "kinit user: _AD_USER: ${_AD_USER}\n"
	echo ${LDAP_PASSWORD} | ${_KINIT} --password-file=STDIN  ${_AD_USER} |& LOG && RET=0
	[ "x${RET}" == "x1" ] && LOG "${_KINIT}: failed\n" && return 1;
	
	LOG "${_KINIT}: successful\n" 
	return 0 ;
}

KEYTAB_CREATE()
{
	[ -f ${KRB5_KTNAME} ] && LOG "exists: ${KRB5_KTNAME}\n" && return 0;

	LOG "creating the stupid: ${KRB5_KTNAME}\n"

	declare -a OPTS
	export MSKTUTIL_KEYTAB=${KRB5_KTNAME}

	
	OPTS=();
	OPTS+=("--create")
	OPTS+=(--verbose)
	OPTS+=(--base 'CN=COMPUTERS')
	OPTS+=(--keytab ${KRB5_KTNAME})
	OPTS+=(--upn ${SPN}.${REALM})
	OPTS+=(--computer-name ${SPN})
	OPTS+=(--hostname ${SPN}.${REALM})
	OPTS+=(--server ${AD_FQDN})
	OPTS+=(--no-reverse-lookups)
	OPTS+=(--realm ${REALM})
	OPTS+=(--password ${LDAP_PASSWORD})
	OPTS+=(--dont-expire-password)
	OPTS+=(--no-canonical-name)
	OPTS+=(--no-pac)

	LOG "${_MSKTUTIL} ${OPTS[*]}\n"
	${_MSKTUTIL} ${OPTS[*]} |& LOG && RET=0
	
	return ${RET};	
}

RUN_MSKTUTIL()
{
	KEYTAB_CREATE || return 1;

	RET=1
	declare -a OPTS
	OPTS=();
	
	OPTS+=("--update")
	
	LOG "updating: ${KRB5_KTNAME}\n"
	
	OPTS+=(--verbose)
	OPTS+=(--base 'CN=COMPUTERS')
	OPTS+=(--service HTTP/${SPN}.${REALM})
	OPTS+=(--service LDAP/${SPN}.${REALM})
	OPTS+=(--service HOST/${SPN}.${REALM})
	OPTS+=(--service HTTP/${COMPUTER_NAME}.${REALM})
	OPTS+=(--service LDAP/${COMPUTER_NAME}.${REALM})
	OPTS+=(--service HOST/${COMPUTER_NAME}.${REALM})

	OPTS+=(--keytab ${KRB5_KTNAME})
	OPTS+=(--upn ${SPN}.${REALM})
	OPTS+=(--computer-name ${SPN})
	OPTS+=(--hostname ${SPN}.${REALM})
	OPTS+=(--server ${AD_FQDN})
	OPTS+=(--user-creds-only)
	OPTS+=(--password ${LDAP_PASSWORD})
	OPTS+=(--no-reverse-lookups)
	OPTS+=(--dont-expire-password)
	OPTS+=(--no-canonical-name)
	OPTS+=(--realm ${REALM})

	
	LOG "${_MSKTUTIL} ${OPTS[*]}"
	${_MSKTUTIL} ${OPTS[*]} |& LOG && RET=0
	
	return ${RET};
}

CHECK_CONNECTIVITY()
{
	LOG "CHECK_CONNECTIVITY: $*\n"	
	for ((i = 0 ; i < 5 ; i++)); do
		host $* |& LOG && return 0;
	done	
	return 1
}

VAR_SETUP ()
{

	[ "x${KRB5_CONFIG}" == "x" ] && LOG "KRB5_CONFIG: not specified" && return 1;
	LOG "KRB5_CONFIG: ${KRB5_CONFIG}\n"
	
	[ "x${KRB5_KTNAME}" == "x" ] && LOG "KRB5_KTNAME: not specified" && return 1;
	LOG "KRB5_KTNAME: ${KRB5_KTNAME}\n"
	
	[ "x${AD_FQDN}" == "x" ] && LOG "AD_FQDN: not specified" && return 1;
	LOG "AD_FQDN: ${AD_FQDN}\n"
	
	CHECK_CONNECTIVITY ${AD_FQDN} ; RET=$? 
	[ "x${RET}" != "x0" ] && LOG "lookup: failed AD_FQDN: ${AD_FQDN}\n" && return 1
	
	[ "x${LDAP_USER}" == "x" ] && LOG "LDAP_USER: not provided\n" && return 1;
	LOG "LDAP_USER: ${LDAP_USER}\n"
	
	[ "x${LDAP_PASSWORD}" == "x" ] && LOG "LDAP_PASSWORD: not provided\n" && return 1;	
	[ "x${AD_DOMAIN}" == "x" ] && LOG "AD_DOMAIN: not provided\n" && return 1;
	LOG "AD_DOMAIN: ${AD_DOMAIN}\n"

	[ ! -f "${KRB5_CONFIG}" ] && LOG "KRB5_CONFIG: not found\n" && return 1;
	nslookup ${AD_FQDN} ; RET=$? 
	[ "x${RET}" == "x1" ] && LOG "nslookup: failed AD_FQDN: ${AD_FQDN}\n" && return 1
	
	_AD_USER="${LDAP_USER}@${AD_DOMAIN^^}"
	#MY_DOMAIN=`echo "${AD_DOMAIN}" | tr '[A-Z]' '[a-z]'`
	MY_DOMAIN=${AD_DOMAIN,,}
	MY_FQDN="${MY_COMPUTER_NAME}.${MY_DOMAIN}"
	
	LOG "MY_FQDN: ${MY_FQDN}\n"
	
	CHECK_CONNECTIVITY ${MY_FQDN} ${AD_FQDN}
	RET=$? 
	[ "x${RET}" != "x0" ] && LOG "lookup: failed MY_FQDN: ${MY_FQDN}\n" && return 1

#	ntpdate -p 1 -q ${AD_FQDN} ; ret=$?
	
}

MERGE_KEYTABS ()
{
	[ ! -f ${KRB5_KTNAME} ] && LOG "${KRB5_KTNAME}: not found"
	
	${_KLIST} -l --verbose |& LOG
	
	LOG "Merging ${KRB5_KTNAME} -> ${HTTP_KEYTAB}\n"
	
	${_KTUTIL} copy ${KRB5_KTNAME} ${HTTP_KEYTAB} |& LOG
}


MAIN()
{	

	LOG "\n#############\n"
	
	HTTP_KEYTAB=${KRB5_KTNAME}	
	
	DEPENDENCY_CHECK || return;

	VAR_SETUP
	#should I deleted previously generated keytab?
	
#	DO_KDESTROY

	export KRB5_KTNAME=${HTTP_KEYTAB}.${REALM}

	KINIT_USER
	RET=$?		

	if [ "x${RET}" == "x0" ]
	then	
		LOG "kinit: successful\n" 
	else			
		LOG "kinit: failed\n" 
		return 1 ; 
	fi
	

	RUN_MSKTUTIL && LOG "MSKTUTIL: success\n" || LOG "MSKTUTIL: failed\n"

	MERGE_KEYTABS

	export KRB5_KTNAME=${HTTP_KEYTAB}
	
	${_KTUTIL} list --keys --timestamp |& LOG


	[ "x${RET}" == "x0" ] && LOG "Generate Keytab: successful\n" && return 1 ;
	LOG "Generate Keytab: failed\n" 
	
}

MAIN 
exit

:<<-_EOF
	MSKTUTIL Environment Variables 
	
	MSKTUTIL_LDAP_BASE
		Specifies a relative LDAP base when creating a new account (see --base),

	MSKTUTIL_KEYTAB
		Specifies the keytab. Default: /etc/krb5.keytab (see --keytab),

	MSKTUTIL_SERVER
		Specifies the domain controller (see --server).

	MSKTUTIL_DELEGATION
		Enables the account to be trusted for delegation (see --delegation).

	MSKTUTIL_NO_PAC
		Specifies that service tickets for this account should not contain a PAC (see --no-pac).
_EOF

:<<- _EOF
	Several  environment  variables  affect the operation of Kerberos-enabled programs. 
	These include:

	KRB5CCNAME
		Default name for the credentials cache file, in the form TYPE:residual.   The  type
		of the default cache may determine the availability of a cache collection.  FILE is
		not a collection type; KEYRING, DIR, and KCM are.

		If not  set,  the  value  of  default_ccache_name  from  configuration  files  (see
		KRB5_CONFIG)  will be used.  If that is also not set, the default type is FILE, and
		the residual is the path /tmp/krb5cc_*uid*, where uid is the decimal user ID of the
		user.

	KRB5_KTNAME
		Specifies  the  location of the default keytab file, in the form TYPE:residual.  If
		no type is present, the FILE type is assumed and residual is the  pathname  of  the
		keytab file.  If unset, FILE:/etc/krb5.keytab will be used.

	KRB5_CONFIG
		Specifies  the  location  of  the  Kerberos  configuration  file.   The  default is
		/etc/krb5.conf.  Multiple filenames can be specified, separated  by  a  colon;  all
		files which are present will be read.

	KRB5_KDC_PROFILE
		Specifies  the  location  of  the KDC configuration file, which contains additional
		configuration directives for the Key  Distribution  Center  daemon  and  associated
		programs.  The default is /etc/krb5kdc/kdc.conf.

	KRB5RCACHETYPE
		Specifies the default type of replay cache to use for servers.  Valid types include
		dfl for the normal file type and none for no replay cache.  The default is dfl.

	KRB5RCACHEDIR
		Specifies the default directory for replay caches used by servers.  The default  is
		the value of the TMPDIR environment variable, or /var/tmp if TMPDIR is not set.

	KRB5_TRACE
		Specifies  a filename to write trace log output to.  Trace logs can help illuminate
		decisions  made  internally  by  the  Kerberos   libraries.    For   example,   env
		KRB5_TRACE=/dev/stderr  kinit  would  send  tracing  information  for  kinit(1)  to
		/dev/stderr.  The default is not to write trace log output anywhere.

	KRB5_CLIENT_KTNAME
		Default       client       keytab        file        name.         If        unset,
		FILE:/etc/krb5/user/%{euid}/client.keytab will be used).

	KPROP_PORT
		kprop(8) port to use.  Defaults to 754.

	Most  environment  variables  are  disabled  for  certain  programs,  such as login system
	programs and setuid programs, which are designed to be secure when run within an untrusted
	process environment.

_EOF

