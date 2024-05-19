@echo off

REM Store the base directory
set BASE_DIR=%cd%

echo Installing prerequisites...
call scripts\install_prerequisites.bat
if %errorlevel% neq 0 (
    echo Failed to install prerequisites.
    exit /b %errorlevel%
)

REM Open a new Command Prompt window to run the second part
start cmd /k continue_setup.bat

REM Exit the initial script
exit
