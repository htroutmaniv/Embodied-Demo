# Define base directory
$BaseDir = Get-Location

# Function to run a command and check for errors
function Run-Command {
    param (
        [string]$Command,
        [string]$ErrorMessage
    )
    Write-Output "Running: $Command"
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Error $ErrorMessage
        exit $LASTEXITCODE
    }
}

# Function to refresh environment variables
function Refresh-EnvironmentVariables {
    Write-Output "Refreshing environment variables..."
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Output "Environment variables refreshed."
}

# Function to install prerequisites
function Install-Prerequisites {
    Write-Output "Installing prerequisites..."

    # Check and install Python
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue)?.Path
    if ($pythonPath) {
        Write-Output "Python is already installed at $pythonPath"
    } else {
        if (Test-Path "$BaseDir\Installs\python-3.12.3-amd64.exe") {
            Write-Output "Python installer found. Running installer..."
            Start-Process -FilePath "$BaseDir\Installs\python-3.12.3-amd64.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to install Python. Exit code: $LASTEXITCODE"
                exit $LASTEXITCODE
            }
            Refresh-EnvironmentVariables
        } else {
            Write-Error "Python installer not found."
            exit 1
        }
    }

    # Check and install Node.js
    $nodePath = (Get-Command node -ErrorAction SilentlyContinue)?.Path
    if ($nodePath) {
        Write-Output "Node.js is already installed at $nodePath"
    } else {
        if (Test-Path "$BaseDir\Installs\node-v20.13.1-x64.msi") {
            Write-Output "Node.js installer found. Running installer..."
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$BaseDir\Installs\node-v20.13.1-x64.msi`" /quiet" -Wait
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to install Node.js. Exit code: $LASTEXITCODE"
                exit $LASTEXITCODE
            }
            Refresh-EnvironmentVariables
        } else {
            Write-Error "Node.js installer not found."
            exit 1
        }
    }

    # Check and install Nginx
    $nginxPath = "$BaseDir\nginx\nginx-1.25.5"
    if (Test-Path $nginxPath) {
        Write-Output "Nginx is already installed at $nginxPath"
    } else {
        if (Test-Path "$BaseDir\Installs\nginx-1.25.5.zip") {
            Write-Output "Nginx installer found. Extracting files..."
            try {
                Expand-Archive -Path "$BaseDir\Installs\nginx-1.25.5.zip" -DestinationPath "$BaseDir\nginx" -Force
            } catch {
                Write-Error "Failed to extract Nginx. Error: $_"
                exit 1
            }
        } else {
            Write-Error "Nginx installer not found."
            exit 1
        }
    }

    Write-Output "Prerequisites installed successfully."
}



# Function to configure Nginx
function Configure-Nginx {
    Write-Output "Configuring Nginx..."

    $nginxConfPath = "$BaseDir\nginx\nginx.conf"
    $nginxDestPath = "$BaseDir\nginx\nginx-1.25.5\conf\nginx.conf"
    $rootPath = "$BaseDir\frontend\src"

    # Copy the nginx.conf file
    Copy-Item -Path $nginxConfPath -Destination $nginxDestPath -Force
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to copy nginx.conf."
        exit $LASTEXITCODE
    }

    # Replace ROOT_PATH_PLACEHOLDER with the actual root path
    $nginxConfContent = Get-Content -Path $nginxDestPath
    $nginxConfContent = $nginxConfContent -replace 'ROOT_PATH_PLACEHOLDER', [regex]::Escape($rootPath)
    $nginxConfContent | Set-Content -Path $nginxDestPath

    Write-Output "Nginx configured successfully."
}


function Setup-Backend {
    Write-Output "Setting up the backend..."
    Set-Location "$BaseDir\backend"

    # Check if Python is installed by attempting to create a virtual environment
    Run-Command "python --version" "Python is not installed or not found in PATH."

    # Create a virtual environment
    Run-Command "python -m venv venv" "Failed to create virtual environment."

    # Activate the virtual environment
    $activateScript = ".\venv\Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to activate virtual environment."
            exit $LASTEXITCODE
        }
    } else {
        Write-Error "Activation script not found."
        exit 1
    }

    # Install backend dependencies
    if (Test-Path "requirements.txt") {
        Run-Command "pip install -r requirements.txt" "Failed to install backend dependencies."
    } else {
        Write-Error "requirements.txt not found."
        exit 1
    }

    # Run database migrations
    if (Test-Path "manage.py") {
        Run-Command "python manage.py migrate" "Failed to run database migrations."
    } else {
        Write-Error "manage.py not found."
        exit 1
    }

    Write-Output "Backend setup successful."

    # Deactivate the virtual environment
    $deactivateScript = ".\venv\Scripts\deactivate.ps1"
    if (Test-Path $deactivateScript) {
        & $deactivateScript
    } else {
        Write-Error "Deactivation script not found."
    }

    # Return to the base directory
    Set-Location $BaseDir
}


# Function to set up the frontend
function Setup-Frontend {
    Write-Output "Setting up the frontend..."
    Set-Location "$BaseDir\frontend"

    Run-Command "npm install" "Failed to install frontend dependencies."

    Write-Output "Frontend setup successful."
    Set-Location $BaseDir
}

# Main script execution
Install-Prerequisites
Configure-Nginx
Setup-Backend
Setup-Frontend

Write-Output "Installation complete."
