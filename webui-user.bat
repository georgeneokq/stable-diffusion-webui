@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=

REM To prevent personal configuration from getting committed to git, define env variables in personal-env.bat
REM For backward compatibility purposes, since everyone uses webui-user.bat to start the program.
if exist personal-env.bat call personal-env.bat

call webui.bat
