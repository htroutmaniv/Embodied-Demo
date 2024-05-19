@echo off

echo Creating virtual environment for backend...
cd backend
python -m venv venv
if %errorlevel% neq 0 (
    echo Failed to create virtual environment.
    exit /b %errorlevel%
)

call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Failed to activate virtual environment.
    exit /b %errorlevel%
)

echo Installing backend dependencies...
start /wait cmd /c pip install -r requirements.txt > pip-install.log 2>&1
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    exit /b %errorlevel%
)

echo Running database migrations...
start /wait cmd /c python manage.py migrate > migrate.log 2>&1
if %errorlevel% neq 0 (
    echo Failed to run database migrations.
    exit /b %errorlevel%
)

deactivate
cd ..
