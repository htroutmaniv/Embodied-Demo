@echo off

echo Installing prerequisites...
call scripts\install_prerequisites.bat

echo Configuring Nginx...
call scripts\configure_nginx.bat

echo Creating virtual environment for backend...
cd backend
python -m venv venv
call venv\Scripts\activate
echo Installing backend dependencies...
pip install -r requirements.txt

echo Running database migrations...
python manage.py migrate
deactivate
cd ..

echo Setting up the frontend...
cd frontend
cd threejs-webxr-frontend
npm install
cd ..\..

echo Prerequisites installed successfully.
echo Installation complete.
pause
