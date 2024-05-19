@echo off

:: Check and install Python
echo Installing Python...
cd Installs
if exist python-3.12.3-amd64.exe (
    echo Python installer found. Running installer...
    start /wait "" python-3.12.3-amd64.exe /quiet InstallAllUsers=1 PrependPath=1
    echo Python installed successfully.
) else (
    echo Python installer not found.
)
cd ..

:: Check and install Node.js
cd Installs
if exist node-v20.13.1-x64.msi (
    echo Node.js installer found. Running installer...
    start /wait "" msiexec /i node-v20.13.1-x64.msi /quiet
    echo Node.js installed successfully.
) else (
    echo Node.js installer not found.
)
cd ..

:: Check and install Nginx
cd Installs
if exist nginx-1.25.5.zip (
    echo Nginx installer found. Extracting files...
    tar -xf nginx-1.25.5.zip -C ..\nginx
    echo Nginx installed successfully.
) else (
    echo Nginx installer not found.
)
cd ..
