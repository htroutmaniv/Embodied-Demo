# Embodied Demo Project

## Overview

The Embodied Demo Project is an interactive 3D application built using React and Three.js, designed to be viewed in VR. The application retrieves and displays user data from a backend API, allowing users to interact with and manipulate 3D user representations in a virtual environment. The project includes backend components using Django and a frontend built with Three.js, providing a rich, immersive experience.

## Features

- **3D User Representation**: Displays users as 3D objects in the scene with associated data (name, email, age).
- **VR Support**: Utilizes WebXR to provide a VR experience, including controller support.
- **Interactive Elements**: Users can interact with 3D objects using VR controllers.
- **Dynamic Data Fetching**: Retrieves user data from a backend API and updates the 3D scene accordingly.
- **Particle Effects**: Includes particle effects, such as fireworks, that are triggered by user interactions.
- **Audio Effects**: Plays audio effects in response to certain interactions.

## Project Structure

### Backend

The backend is built with Django and provides API endpoints for fetching user data. It uses the requests library to retrieve data from an external API and serialize it using Django REST framework.

**Endpoints**:

- `/api/random-users/`: Fetches data for multiple users.
- `/api/single-user/`: Fetches data for a single user.

### Frontend

The frontend is a React application that uses Three.js for rendering 3D graphics. The main components of the frontend include:

- **Three.js Scene**: Initializes and manages the 3D scene, including the camera, renderer, controls, and lights.
- **MeshManager**: Manages the 3D meshes for user objects and their associated data.
- **FireworkEffect**: Handles the creation and management of particle effects.
- **User Interaction**: Captures user input through pointer and controller events and updates the scene accordingly.

## Key Components

- `App.js`: The main React component that initializes and renders the application.
- `Scene.js`: Manages the Three.js scene, camera, lights, and renderer.
- `User.js`: Represents a user in the 3D scene, including their 3D model and associated data.
- `VRController.js`: Handles VR controller input and interactions.
- `API.js`: Manages API requests to the backend.

## Installation Instructions

### Automated Installation (Recommended)

1. Clone the repository:

   ```sh
   git clone https://github.com/htroutmaniv/Embodied-Demo.git
   cd Embodied-Demo
   ```

2. Run the automated install script from an **administrator** prompt:

   ```sh
   install.bat
   ```
   **Note** It's important to use an administrator prompt or have proper admin credentials when running the install.

This script will automatically set up the backend, frontend, and Nginx servers.

### Manual Installation

#### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python** (version 3.8 or higher)
- **Node.js** (version 14.x or higher)
- **npm** (comes with Node.js)
- **Nginx**

Installation files are included in the "./Installs directory"

#### Unix-based Systems

1. **Installing Python**

   - Visit the [Python downloads page](https://www.python.org/downloads/).
   - Download the installer for your operating system.
   - Run the installer and follow the instructions to complete the installation.
   - Ensure `pip` is installed with Python (it usually is by default).

2. **Installing Node.js and npm**

   - Visit the [Node.js downloads page](https://nodejs.org/en/download/).
   - Download the installer for your operating system.
   - Run the installer and follow the instructions to complete the installation.

3. **Installing Nginx**

   - Visit the [Nginx downloads page](http://nginx.org/en/download.html).
   - Download the appropriate version for your operating system.
   - Follow the instructions provided on the website to install Nginx.

4. **Clone the Repository**

   Open a terminal and run the following commands to clone the repository and navigate into the project directory:

   ```sh
   git clone https://github.com/htroutmaniv/Embodied-Demo.git
   cd Embodied-Demo
   ```

5. **Backend Setup**

   Navigate to the backend directory and set up the Python virtual environment:

   ```sh
   cd backend
   python -m venv venv
   call venv/scripts/activate
   pip install -r requirements.txt
   python manage.py migrate
   cd ..
   ```

6. **Frontend Setup**

   Navigate to the frontend directory and install the necessary Node.js packages:

   ```sh
   cd frontend
   npm install
   ```

7. **Nginx Setup**

   - Copy the provided `nginx.conf` file from "./nginx" directory to your Nginx install configuration directory (typically ./nginx/nginx_version/conf/) this will replace the default config with the template.
   - Modify the root path in `nginx.conf` to match the location of your frontend public directory.

## Running the Application

### Starting the servers

- (Recommended) use the supplied run.bat script which will start the front end, back end, and nginx servers for you

- Alternative:
  1. Front end: Navigate to the frontend directory. Run the following command from a command window.
  ```sh
  npm run
  ```
  2. Back end: Navigate to the backend directory. Run the following command from a command window.
  ```sh
  python manage.py runserver
  ```
  3. nginx: navigate to your nginx install directory (typically ./nginx/nginx_version/) and run the nginx.exe

### Viewing the application

1. Open a browser and navigate to `http://localhost:3000` to view the application.
2. To utilize VR click the enter VR mode button on the screen

**Note**: When server is first started it may take a few seconds for the application to load at the specified address
**Note**: Your browser may request permissions, particularly when entering VR mode. Allow these permissions for proper functioning of the application.

## Usage

- **VR Interaction**: Use VR controllers to interact with the 3D scene. Use the joystick to move the camera toward the direction you're looking or to rotate left and right. Trigger actions over objects will display user data and squeeze actions will squeeze/pop objects.
- **Desktop Interaction**: Use the mouse to click on objects in the scene. Click and hold over an object to squeeze/pop. Mouse controls for manipulating the view: left click drag to rotate, middle mouse and scroll wheel to zoom, right mouse to pan.

## Contact

For any inquiries or issues, please contact [Harold Troutman] at [HTroutmanIV@gmail.com].
