#!/bin/bash

# Keep this file as root:root

TMP="/tmp/safesquid"
LIST_CONF="list.conf"
[ "x${APPLIANCE}" == "x" ] && APPLIANCE=".."
TREE=/usr/bin/tree

T_SCRIPT=${TMP}/script

> ${T_SCRIPT}
> ${LIST_CONF}

let d=0 # directories
let f=0 # files
let s=0 # softlinks

declare -a DEST_DIR PERMISSION_DIR DEST_FILE PERMISSION_FILE TARGET S_LINK

MAKE_TEST_FLDR ()
{
	[ "x${TEST_PATH}" == "x" ] && return;
	tee -a ${T_SCRIPT}  <<- _EOF
	mkdir -p "${TEST_PATH}/"
	_EOF
}

SHOW_TREE ()
{
	${TREE} "$@" | awk '{print $1}'
}

DIRECTORIES()
{
	X="${APPLIANCE}"
	while read item
	do
		[ -d "${item}" ] || continue; # Not a directory
		
		#OWNER=$(stat "${item}" --format="%U")
		#[ "x${OWNER}" == "xssquid" ] || continue;
	
		echo DEST_DIR[$d]=\""${item##$X}"\" 
		echo PERMISSION_DIR[$d]=$(stat ${item} -t --format="%a") 
		echo ""	
		((d++))
	done < <(SHOW_TREE  -inf --dirsfirst --noreport "${APPLIANCE}")

}

FILES()
{
	X="${APPLIANCE}"
	while read item
	do
		[ -f "${item}" ] || continue; # Not a file
		[ -h "${item}" ] && continue; # It is a symbolic link

		#OWNER=$(stat "${item}" --format="%U")
		#[ "x${OWNER}" == "xssquid" ] || continue;
	
		echo DEST_FILE[$f]=\""${item##$X}"\" 
		echo PERMISSION_FILE[$f]=$(stat ${item} -t --format="%a")
		echo ""
		
		((f++))
		
		
	done < <(SHOW_TREE  -inf --dirsfirst --noreport "${APPLIANCE}")

}

SOFTLINKS()
{
	X="${APPLIANCE}"
	while read item
	do
		[ -f "${item}" ] || continue; # Not a file
		[ -h "${item}" ] || continue; # Not a symbolic link

		#OWNER=$(stat "${item}" --format="%U")
		#[ "x${OWNER}" == "xssquid" ] || continue;
		
		tt=$(readlink ${item})

		echo TARGET[$s]=\""${tt}"\"
		echo S_LINK[$s]=\""${item##$X}"\" 
		echo ""
		((s++))
	
	done < <(SHOW_TREE  -inf --dirsfirst --noreport "${APPLIANCE}")
}

START()
{
	MAKE_TEST_FLDR
	DIRECTORIES
	FILES
	SOFTLINKS
}

START >> ${LIST_CONF}