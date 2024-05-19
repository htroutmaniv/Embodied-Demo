@echo off

REM Store the base directory
set BASE_DIR=%cd%

echo Configuring Nginx...
call scripts\configure_nginx.bat
if %errorlevel% neq 0 (
    echo Failed to configure Nginx.
    exit /b %errorlevel%
)

echo Setting up the backend...
call scripts\setup_backend.bat
if %errorlevel% neq 0 (
    echo Failed to set up the backend.
    exit /b %errorlevel%
)

cd ..

echo Setting up the frontend...
call scripts\setup_frontend.bat
if %errorlevel% neq 0 (
    echo Failed to set up the frontend.
    exit /b %errorlevel%
)

echo Prerequisites installed successfully.
echo Installation complete.
pause


