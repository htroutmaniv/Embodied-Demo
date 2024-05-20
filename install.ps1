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

    # Install Python
    if (Test-Path "$BaseDir\Installs\python-3.12.3-amd64.exe") {
        Write-Output "Python installer found. Running installer..."
        $process = Start-Process -FilePath "$BaseDir\Installs\python-3.12.3-amd64.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait -PassThru
        if ($process.ExitCode -ne 0) {
            Write-Error "Failed to install Python. Exit code: $($process.ExitCode)"
            exit $process.ExitCode
        }
        Refresh-EnvironmentVariables
    } else {
        Write-Error "Python installer not found."
        exit 1
    }

    # Check for existing Node.js installation
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        Write-Output "Node.js is already installed at $($nodePath.Source)"
    } else {
        # Install Node.js
        if (Test-Path "$BaseDir\Installs\node-v20.13.1-x64.msi") {
            Write-Output "Node.js installer found. Running installer..."
            $logPath = "$BaseDir\Installs\nodejs_install.log"
            $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$BaseDir\Installs\node-v20.13.1-x64.msi`" /quiet /l*v `"$logPath`"" -Wait -PassThru
            if ($process.ExitCode -ne 0) {
                Write-Error "Failed to install Node.js. Exit code: $($process.ExitCode). Check the log at $logPath for details."
                exit $process.ExitCode
            }
            Refresh-EnvironmentVariables
        } else {
            Write-Error "Node.js installer not found."
            exit 1
        }
    }

    # Check for existing Nginx installation
    $nginxPath = "$BaseDir\nginx\nginx-1.25.5"
    if (Test-Path $nginxPath) {
        Write-Output "Nginx is already installed at $nginxPath"
    } else {
        # Install Nginx
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

    # Ensure the destination directory exists
    $nginxDestDir = [System.IO.Path]::GetDirectoryName($nginxDestPath)
    if (-not (Test-Path $nginxDestDir)) {
        Write-Output "Creating destination directory: $nginxDestDir"
        New-Item -ItemType Directory -Path $nginxDestDir -Force
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to create destination directory: $nginxDestDir"
            exit $LASTEXITCODE
        }
    }

    # Copy the nginx.conf file
    try {
        Copy-Item -Path $nginxConfPath -Destination $nginxDestPath -Force
    } catch {
        Write-Error "Failed to copy nginx.conf. Error: $_"
        exit 1
    }

    # Replace ROOT_PATH_PLACEHOLDER with the actual root path
    try {
        $nginxConfContent = Get-Content -Path $nginxDestPath
        $nginxConfContent = $nginxConfContent -replace 'ROOT_PATH_PLACEHOLDER', [regex]::Escape($rootPath)
        $nginxConfContent | Set-Content -Path $nginxDestPath
    } catch {
        Write-Error "Failed to update nginx.conf with the root path. Error: $_"
        exit 1
    }

    Write-Output "Nginx configured successfully."
}



function Setup-Backend {
    Write-Output "Setting up the backend..."
    Set-Location "$BaseDir\backend"

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
    if ($function:deactivate) {
        deactivate
    } else {
        Write-Error "Deactivation script not found."
    }

    # Return to the base directory
    Set-Location $BaseDir
}



function Setup-Frontend {
    Write-Output "Setting up the frontend..."
    Set-Location "$BaseDir\frontend"

    # Install frontend dependencies
    Run-Command "npm install" "Failed to install frontend dependencies."

    # Check for outdated packages
    Write-Output "Checking for outdated packages..."
    Run-Command "npm outdated" "Failed to check for outdated packages."

    # Update all packages to the latest versions based on version ranges in package.json
    Write-Output "Updating packages..."
    Run-Command "npm update" "Failed to update packages."

    # Check for and fix security vulnerabilities
    Write-Output "Checking for security vulnerabilities..."
    Run-Command "npm audit" "Failed to check for security vulnerabilities."
    Run-Command "npm audit fix" "Failed to fix security vulnerabilities."

    Write-Output "Frontend setup successful."
    Set-Location $BaseDir
}

# Main script execution
Install-Prerequisites
Configure-Nginx
Setup-Backend
Setup-Frontend

Write-Output "Installation complete."
