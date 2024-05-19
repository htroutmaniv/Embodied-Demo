@echo off

echo Configuring Nginx...

set source_conf=nginx\nginx.conf
set target_conf=nginx\nginx-1.25.5\conf\nginx.conf

if not exist %source_conf% (
    echo Source nginx.conf not found.
    pause
    exit /b 1
)

set temp_conf=%target_conf%.tmp

:: Set the root path and replace backslashes with forward slashes
set root_path=%cd%\frontend\public
set root_path=%root_path:\=/%

:: Read the source file line by line, perform find and replace, and write to the temp file
(for /f "delims=" %%i in (%source_conf%) do (
    set "line=%%i"
    setlocal enabledelayedexpansion
    set "newline=!line:ROOT_PATH_PLACEHOLDER=%root_path%!"
    echo !newline!
    endlocal
)) > %temp_conf%

:: Move the temp file to replace the target configuration file
move /y %temp_conf% %target_conf%

if exist %target_conf% (
    echo nginx.conf successfully updated.
) else (
    echo Failed to update nginx.conf.
    pause
    exit /b 1
)

echo Nginx configured successfully.

