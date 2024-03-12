#!/bin/bash

_CAT=/bin/cat

LOG()
{
	echo -ne "SafeSquid: ${*}" >> /var/log/syslog
}

BUILD_STUB(){
	LOG "Bind: recreating stub: /etc/bind/named.conf.stub"
	${_CAT} /usr/local/safesquid/security/dns/*.stub > /etc/bind/named.conf.stub
	RET=$?
	[ "x${RET}" == "x0" ] && LOG "Bind: recreating stub: done" && return 1;
	LOG "Bind: recreating stub: failed"
	return 0;
}

BIND_RELOAD(){
	LOG "Bind: reloading\n"
	/etc/init.d/bind9 reload	
	RET=$?
	[ "x${RET}" != "x0" ] && LOG "Bind: reloading: done\n" && return 1;
	LOG "Bind: reloading: failed\n" ;
	return 0;
}

MAIN() {

	BUILD_STUB
	RET=$?

	BIND_RELOAD
	RET=$?
}

MAIN
