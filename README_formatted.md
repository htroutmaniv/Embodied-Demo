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

- `App.js`: The main React component that initializes the Three.js scene and handles the main application logic.
- `User.js`: Represents a user in the 3D scene, including the 3D mesh and associated data.
- `MeshManager.js`: Manages groups of meshes in the scene.
- `FireworkEffect.js`: Manages the creation and animation of particle effects.
- `UserSerializer.py`: Defines the serializer for user data in the backend.
- `RandomUserView` and `RandomSingleUserView`: API views for fetching user data.

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js
- npm (Node Package Manager)
- Nginx

### Installation

#### Installing Python

1. Visit the [Python downloads page](https://www.python.org/downloads/).
2. Download the installer for your operating system.
3. Run the installer and follow the instructions. Make sure to check the box that says "Add Python to PATH".

#### Installing Node.js

1. Visit the [Node.js downloads page](https://nodejs.org/en/download/).
2. Download the installer for your operating system.
3. Run the installer and follow the instructions.

#### Installing Nginx

1. Visit the [Nginx downloads page](http://nginx.org/en/download.html).
2. Download the appropriate version for your operating system.
3. Follow the instructions provided on the website to install Nginx.

#### Clone the Repository

```sh
git clone <repository_url>
cd <repository_name>
```

#### Backend Setup

```sh
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver #this starts the server
```

#### Frontend Setup

```sh
cd frontend
npm install
npm start #start the server
```

#### Nginx Setup

- Copy the provided `nginx.conf` to your Nginx configuration directory.
- Modify the root path in `nginx.conf` to match the location of your frontend public directory.
- Start Nginx.

### Running the Application

- Ensure the backend and frontend servers are running. You may use the run.bat
- Open a browser and navigate to `http://localhost:3000` to view the application.
- Browser may ask for permissions which should be allowed for proper functioning.

## Usage

- **VR Interaction**: Use VR controllers to interact with the 3D scene. Use the joystick to move the camera toward the direction you're looking or to rotate left and right. Trigger actions over objects will display user data and squeeze actions will squeeze/pop objects.
- **Desktop Interaction**: Use the mouse to click on objects in the scene. Click and hold over an object to squeeze/pop. Mouse controls for manipulating the view, left click drag - rotate, middle mouse and scroll wheel - zoom, right mouse - pan

## Contact

For any inquiries or issues, please contact [Harold Troutman] at [HTroutmanIV@gmail.com].
