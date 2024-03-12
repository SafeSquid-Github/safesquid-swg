#!/bin/bash 

BD_NAME="/var/db/safesquid/user_ip_db/sopenvpn.db"
TABLE_NAME="MAIN" 
IP_MASTER_TABLE="IP_MASTER"
USER_MASTER_TABLE="USER_MASTER"
LOG_FILE="/etc/openvpn/openvpn-connection.log"

IP_INFO="${ifconfig_pool_remote_ip}"
USER_INFO="${common_name}"


DATE()
{
	date "+%Y-%m-%d %H:%M:%S.%N"
}

SQLITE_INSERT_()
{
	[ "x${BD_NAME}" == "x" ] && return;
	[ ! -f "${BD_NAME}" ] && return;


	sqlite3 ${BD_NAME} <<- EOF
	BEGIN TRANSACTION;	
	INSERT OR IGNORE INTO "${IP_MASTER_TABLE}" values('${IP_INFO}', NULL);
	INSERT OR IGNORE INTO "${USER_MASTER_TABLE}" values('${USER_INFO}', NULL);
	INSERT OR IGNORE INTO "${TABLE_NAME}" 
		select ${IP_MASTER_TABLE}.B,${USER_MASTER_TABLE}.B from ${IP_MASTER_TABLE},${USER_MASTER_TABLE} 
		WHERE ${USER_MASTER_TABLE}.A = '${USER_INFO}' and ${IP_MASTER_TABLE}.A = '${IP_INFO}';	
	COMMIT;
	EOF
}


SQLITE_INSERT()
{
	[ "x${BD_NAME}" == "x" ] && return;
	[ ! -f "${BD_NAME}" ] && return;


	sqlite3 ${BD_NAME} <<- EOF
	BEGIN TRANSACTION;	
	INSERT OR IGNORE INTO "${IP_MASTER_TABLE}" values('${IP_INFO}', NULL);
	INSERT OR IGNORE INTO "${USER_MASTER_TABLE}" values('${USER_INFO}', NULL);
	INSERT OR REPLACE INTO "${TABLE_NAME}" 
		select ${IP_MASTER_TABLE}.B,${USER_MASTER_TABLE}.B from ${IP_MASTER_TABLE},${USER_MASTER_TABLE} 
		WHERE ${USER_MASTER_TABLE}.A = '${USER_INFO}' and ${IP_MASTER_TABLE}.A = '${IP_INFO}';	
	COMMIT;
	EOF
	
}



SQLITE_DELETE()
{
	[ "x${BD_NAME}" == "x" ] && return;
	[ ! -f "${BD_NAME}" ] && return;
	
	sqlite3 ${BD_NAME} <<- EOF
	BEGIN TRANSACTION;	
	DELETE FROM ${TABLE_NAME} 
		WHERE B = ( SELECT B FROM ${USER_MASTER_TABLE} 
		where A = '${USER_INFO}' ) and A = ( SELECT B FROM ${IP_MASTER_TABLE} 
		where A = '${IP_INFO}' );
	COMMIT;
	EOF
		
}

WRITE_LOGS()
{
	printf "%s %s [%s] %s:%s %s %s %d %d\n" $(DATE) ${METHODS} ${trusted_ip} ${trusted_port} ${IP_INFO} ${USER_INFO} ${bytes_sent} ${bytes_received} >> ${LOG_FILE}
	
#	echo -ne $(DATE) [${METHODS}] ${trusted_ip}:${trusted_port} ${IP_INFO} ${USER_INFO} ${bytes_sent} ${bytes_received} >> ${LOG_FILE}
	return;
}

CREATE_DB ()
{
	[ "x${BD_NAME}" == "x" ] && return;
	[ -f "${BD_NAME}" ] && return;

	sqlite3 ${BD_NAME} <<- EOF
		BEGIN TRANSACTION;
		CREATE TABLE IF NOT EXISTS "IP_MASTER" (
			"A"	TEXT UNIQUE,
			"B"	INTEGER,
			PRIMARY KEY("B")
		);
		CREATE TABLE IF NOT EXISTS "USER_MASTER" (
			"A"	TEXT UNIQUE,
			"B"	INTEGER,
			PRIMARY KEY("B")
		);
		CREATE TABLE IF NOT EXISTS "MAIN" (
			"A"	INTEGER,
			"B"	INTEGER,
			PRIMARY KEY("A"),
			FOREIGN KEY("B") REFERENCES "user_master"("B") ON DELETE NO ACTION ON UPDATE NO ACTION,
			FOREIGN KEY("A") REFERENCES "ip_master"("B") ON DELETE NO ACTION ON UPDATE NO ACTION
		);
		CREATE VIEW main_view AS select IP_MASTER.A AS ip , USER_MASTER.A AS user from IP_MASTER,USER_MASTER,MAIN where MAIN.A=IP_MASTER.B and MAIN.B=USER_MASTER.B;
		COMMIT;

	EOF
	
	chmod 775 ${BD_NAME}
}


MAIN()
{
	WRITE_LOGS
	[[ "x${METHODS}" == "xCONNECT" ]] && CREATE_DB;
	[[ "x${METHODS}" == "xCONNECT" ]] && SQLITE_INSERT;
	[[ "x${METHODS}" == "xDISCONNECT" ]] && SQLITE_DELETE;
}

MAIN 2&1>> ${LOG_FILE}
