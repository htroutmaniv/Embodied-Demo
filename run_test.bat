@echo off
REM Ensure this script is run from the project root directory

REM Activate the virtual environment
call backend\venv\Scripts\activate

REM Run the Django tests
cd backend
python manage.py test

REM Deactivate the virtual environment
deactivate

pause
