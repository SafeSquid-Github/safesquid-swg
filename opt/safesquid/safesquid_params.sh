DEFAULT_SETUP_INI="/opt/safesquid/default/setup.ini"
SETUP_INI="/opt/safesquid/setup.ini"
DEFAULT_STARTUP_INI="/opt/safesquid/default/startup.ini"
STARTUP_INI="/opt/safesquid/startup.ini"
SYSTEM_INI="/opt/safesquid/system.ini"


EXPORT_INI() 
{
	set -a
	[ "x${DEFAULT_SETUP_INI}" != "x" ] && [ -f "${DEFAULT_SETUP_INI}" ] && source "${DEFAULT_SETUP_INI}"
	[ "x${SETUP_INI}" != "x" ] && [ -f "${SETUP_INI}" ] && source "${SETUP_INI}"
	[ "x${DEFAULT_STARTUP_INI}" != "x" ] && [ -f "${DEFAULT_STARTUP_INI}" ] && source "${DEFAULT_STARTUP_INI}"
	[ "x${STARTUP_INI}" != "x" ] && [ -f "${STARTUP_INI}" ] && source "${STARTUP_INI}"
	[ "x${SYSTEM_INI}" != "x" ] && SYSTEM_INI="${SYSTEM_INI}"
	set +a
}


SYSTEM_TUNE()
{
set -a
[ "x${SYSTEM_INI}" != "x" ] && [ -f "${SYSTEM_INI}" ] && source "${SYSTEM_INI}"
set +a

}