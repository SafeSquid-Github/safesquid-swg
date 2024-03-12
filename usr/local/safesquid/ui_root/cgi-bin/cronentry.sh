#!/bin/bash

#update ca certificates
#update-ca-certificates --fresh
#
#> /etc/ssl/certs/trusted-ca-certificates.crt
#cat /etc/ssl/certs/* >> /etc/ssl/certs/trusted-ca-certificates.crt
#
#if [ ! -L "/usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt" ];then
# echo "file found.. making it softlink"
# mv /usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt /usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt_old
# ln -fs /etc/ssl/certs/trusted-ca-certificates.crt /usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt
# chown ssquid:root /usr/local/safesquid/security/ssl/trusted/trusted-ca-certificates.crt
#fi
