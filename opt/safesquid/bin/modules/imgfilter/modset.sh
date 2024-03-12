#!/bin/bash

MDIR=${PWD}
THIS_FILE=`readlink -f $0`
CWD=`dirname ${THIS_FILE}`

L_DIR[0]=./imgfilter/
FILE[0]=./libIAImageReaderShared.so.1.5.0.1
L_FILE[0]=./libIAImageReaderShared.so

L_DIR[1]=./imgfilter/
FILE[1]=./libIAEngineShared.so.5.0.13.4
L_FILE[1]=./libIAEngineShared.so


F=${#FILE[*]}
F=$[ $F - 1 ]

for i in `seq 0 $F`
do
	cd ${CWD}
	[ -d ${L_DIR[$i]} ] || continue;
	cd ${L_DIR[$i]}
	pwd
	echo "setting up soft-link ${L_FILE[$i]} -> ${FILE[$i]}"
	ln -vfs "${FILE[$i]}" "${L_FILE[$i]}" 

done

cd ${MDIR}
