@echo off

REM Store the base directory
set BASE_DIR=%cd%

echo Installing prerequisites...
call scripts\install_prerequisites.bat
if %errorlevel% neq 0 (
    echo Failed to install prerequisites.
    exit /b %errorlevel%
)

REM Create a temporary batch file for the second part
echo @echo off > continue_setup.bat
echo cd /d %BASE_DIR% >> continue_setup.bat
echo call setup_continue.bat >> continue_setup.bat

REM Open a new Command Prompt window to run the second part
start cmd /k continue_setup.bat

REM Exit the initial script
exit
