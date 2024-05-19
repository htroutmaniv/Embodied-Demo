@echo off

echo Setting up the frontend...
cd frontend
if %errorlevel% neq 0 (
    echo Failed to change directory to frontend.
    exit /b %errorlevel%
)

echo Current directory is %cd%
echo Installing frontend dependencies...
start /wait cmd /c npm install > npm-install.log 2>&1
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    exit /b %errorlevel%
)
cd ..
