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

    if (Test-Path "$BaseDir\python-3.12.3-amd64.exe") {
        Write-Output "Python installer found. Running installer..."
        Start-Process -FilePath "$BaseDir\python-3.12.3-amd64.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install Python."
            exit $LASTEXITCODE
        }
        Refresh-EnvironmentVariables
    } else {
        Write-Error "Python installer not found."
        exit 1
    }

    Write-Output "Prerequisites installed successfully."
}

# Function to configure Nginx
function Configure-Nginx {
    Write-Output "Configuring Nginx..."
    # Example Nginx configuration commands (update as needed)
    Copy-Item -Path "$BaseDir\nginx\nginx.conf" -Destination "C:\nginx\conf\nginx.conf" -Force
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to configure Nginx."
        exit $LASTEXITCODE
    }
    Write-Output "Nginx configured successfully."
}

# Function to set up the backend
function Setup-Backend {
    Write-Output "Setting up the backend..."
    Set-Location "$BaseDir\backend"

    Run-Command "python -m venv venv" "Failed to create virtual environment."
    .\venv\Scripts\Activate.ps1

    Run-Command "pip install -r requirements.txt" "Failed to install backend dependencies."
    Run-Command "python manage.py migrate" "Failed to run database migrations."

    Write-Output "Backend setup successful."
    & .\venv\Scripts\deactivate.ps1
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
