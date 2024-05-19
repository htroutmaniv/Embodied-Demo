@echo off

echo Starting Nginx...
cd nginx\nginx-1.25.5
if exist nginx.exe (
    start "" "nginx.exe"
    echo Nginx started successfully.
) else (
    echo Nginx executable not found.
)
cd ..\..

echo Starting frontend server...
cd frontend
if exist package.json (
    start "" cmd /k npm start 2> npm-error.log
    echo Frontend server started successfully.
) else (
    echo package.json not found in frontend directory.
)
cd ..

echo Starting backend server...
cd backend
if exist venv\Scripts\activate (
    call venv\Scripts\activate
    if exist manage.py (
        start "" cmd /k python manage.py runserver
        echo Backend server started successfully.
    ) else (
        echo manage.py not found in backend directory.
    )
    deactivate
) else (
    echo Virtual environment not found.
)
cd ..



echo All services started. Press any key to exit.
pause
