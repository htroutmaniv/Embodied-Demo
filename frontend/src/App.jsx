/**This is a React component which creates a ThreeJS environment, retrieves user data from back end api endpoints
 * and visualizes that data. It is VR enabled via WebXR and supports both browser and VR interactions.
 */

import React, { Component, createRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Vector2,
  Raycaster,
  DirectionalLight,
  AmbientLight,
  Matrix4,
  Vector3,
  EquirectangularReflectionMapping,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Group,
  Audio,
  AudioListener,
  AudioLoader,
} from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import axios from 'axios';
import { User } from './User';
import MeshManager from './MeshManager';
import FireworkEffect from './FireworkEffect';

class App extends Component {
  constructor(props) {
    super(props);
    this.mountRef = createRef();
    this.state = {
      vrSupported: true,
      vrSession: false,
    };
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.targetPosition = new Vector3(); // Target position for the user
    this.initialMouse = new Vector2(); // To track initial mouse position
    this.isPointerDown = false; // To track pointer down state
    this.isDragging = false; // To track if dragging is occurring
    this.multiviewFramebuffer = null;
    this.fireworksArray = [];
  }

  // React lifecycle method - invoked once the component has been mounted
  componentDidMount() {
    console.log('mounted');
    this.initThreeJS();
    this.fetchMultipleUserData();
    this.addEventListeners();
  }

  // React lifecycle method - invoked before the component is unmounted
  componentWillUnmount() {
    this.removeEventListeners();

    if (this.mountRef.current && this.renderer && this.renderer.domElement) {
      if (this.mountRef.current.contains(this.renderer.domElement)) {
        this.mountRef.current.removeChild(this.renderer.domElement);
      }
    }
  }

  // Initialize Three.js scene
  initThreeJS = () => {
    this.meshManager = new MeshManager();
    this.scene = new Scene();
    this.scene.background = new Color('#3E3E3F'); // 80% gray background

    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initLights();
    this.initControllers();
    this.loadHDR();
    //this.addAudioEffect();

    this.animate();
  };

  // Initialize the camera
  initCamera = () => {
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.name = 'mainCamera';

    this.cameraGroup = new Group();
    this.cameraGroup.name = 'cameraGroup';
    this.cameraGroup.position.set(10, 5, 10);
    this.camera.position.set(10, 5, 10);
    this.scene.add(this.camera);
    this.scene.add(this.cameraGroup);
  };

  // Initialize the renderer
  initRenderer = () => {
    // Initialize the WebGL renderer with antialiasing enabled
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.shadowMap.enabled = true; // Enable shadow maps

    // Check for WebXR support
    if (navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then(this.handleXRSupport)
        .catch(this.handleXRError);
    } else {
      console.error('WebXR not available');
      this.setState({ vrSupported: false });
    }

    // Initialize WebGL extensions
    this.initWebGLExtensions();
  };

  handleXRSupport = (supported) => {
    if (supported) {
      if (this.mountRef.current) {
        this.mountRef.current.appendChild(this.renderer.domElement);
        this.mountRef.current.appendChild(VRButton.createButton(this.renderer));
        this.renderer.xr.addEventListener('sessionstart', this.onSessionStart);
        this.renderer.xr.addEventListener('sessionend', this.onSessionEnd);
      }
    } else {
      this.mountRef.current.appendChild(this.renderer.domElement);
      this.renderer.xr.addEventListener('sessionstart', this.onSessionStart);
      this.renderer.xr.addEventListener('sessionend', this.onSessionEnd);

      // Create and append the not supported message
      const notSupportedMessage = document.createElement('div');
      notSupportedMessage.textContent = 'WebXR immersive-vr not supported';
      notSupportedMessage.style.position = 'absolute';
      notSupportedMessage.style.bottom = '0';
      notSupportedMessage.style.width = '100%';
      notSupportedMessage.style.textAlign = 'center';
      notSupportedMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      notSupportedMessage.style.color = 'white';
      notSupportedMessage.style.padding = '10px 0';
      this.mountRef.current.appendChild(notSupportedMessage);

      console.error('WebXR immersive-vr not supported');
      this.setState({ vrSupported: false });
    }
  };

  handleXRError = (error) => {
    console.error('Error checking WebXR support', error);
    this.setState({ vrSupported: false });
  };

  initWebGLExtensions = () => {
    const gl = this.renderer.getContext();
    this.multiviewExtension = gl.getExtension('OVR_multiview2');
    if (this.multiviewExtension) {
      console.log('OVR_multiview2 enabled:', this.multiviewExtension);
      this.multiviewFramebuffer = this.setupMultiviewFramebuffer();
    } else {
      console.warn('OVR_multiview2 not supported');
    }
  };

  // Initialize camera controls
  initControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  };

  // Initialize scene lights
  initLights = () => {
    const directionalLight = new DirectionalLight(0xfdf8d7, 0.6);
    directionalLight.castShadow = true; // Enable shadow casting
    directionalLight.rotation.set(0, 1, 0);
    this.scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
  };

  // Initialize VR controllers
  initControllers = () => {
    const controllerModelFactory = new XRControllerModelFactory();
    this.setupController(0, controllerModelFactory);
    this.setupController(1, controllerModelFactory);
  };

  setupController = (index, controllerModelFactory) => {
    try {
      const controller = this.renderer.xr.getController(index);
      controller.addEventListener('selectstart', this.onSelectStart);
      controller.addEventListener('selectend', this.onSelectEnd);
      controller.addEventListener('squeezestart', this.onSqueezeStart);
      controller.addEventListener('squeezeend', this.onSqueezeEnd);

      // Create a line to visualize the pointer
      const geometry = new BufferGeometry().setFromPoints([
        new Vector3(0, 0, 0),
        new Vector3(0, 0, -1),
      ]);
      const material = new LineBasicMaterial({ color: 0xffffff });
      const line = new Line(geometry, material);
      line.name = 'line';
      line.scale.z = 5;

      controller.add(line);
      this.cameraGroup.add(controller); // Add the controller to the cameraGroup

      const controllerGrip = this.renderer.xr.getControllerGrip(index);
      const model =
        controllerModelFactory.createControllerModel(controllerGrip);
      if (model) {
        controllerGrip.add(model);
        this.cameraGroup.add(controllerGrip); // Add the controller grip to the cameraGroup
      } else {
        console.error(`Failed to create controller model for index ${index}`);
      }
    } catch (error) {
      console.error(`Error setting up controller at index ${index}:`, error);
    }
  };

  // Load and set up HDR environment map
  loadHDR = () => {
    const rgbeLoader = new RGBELoader();

    // Load the HDR texture
    rgbeLoader.load(
      './overcast_soil_puresky_4k.hdr', // Path to the HDR file
      (texture) => {
        // Set the texture mapping type to Equirectangular
        texture.mapping = EquirectangularReflectionMapping;

        // Set the scene environment and background to the loaded texture
        this.scene.environment = texture;
        this.scene.background = texture;
      },
      undefined,
      // Error callback in case the HDR texture fails to load
      (err) => {
        console.error('An error occurred loading the HDR texture', err);
      }
    );
  };

  // Set up a framebuffer for multiview rendering
  setupMultiviewFramebuffer = () => {
    // Get the WebGL rendering context
    const gl = this.renderer.getContext();

    // Create and bind a new framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Create and configure the color texture
    const colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, colorTexture);
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY, // Target
      0, // Level
      gl.RGBA8, // Internal format
      gl.drawingBufferWidth, // Width
      gl.drawingBufferHeight, // Height
      2, // Depth (2 layers for multiview)
      0, // Border
      gl.RGBA, // Format
      gl.UNSIGNED_BYTE, // Type
      null // Data
    );
    gl.framebufferTextureLayer(
      gl.FRAMEBUFFER, // Target
      gl.COLOR_ATTACHMENT0, // Attachment point
      colorTexture, // Texture
      0, // Level
      0 // Layer
    );

    // Create and configure the depth texture
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, depthTexture);
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY, // Target
      0, // Level
      gl.DEPTH_COMPONENT24, // Internal format
      gl.drawingBufferWidth, // Width
      gl.drawingBufferHeight, // Height
      2, // Depth (2 layers for multiview)
      0, // Border
      gl.DEPTH_COMPONENT, // Format
      gl.UNSIGNED_INT, // Type
      null // Data
    );
    gl.framebufferTextureLayer(
      gl.FRAMEBUFFER, // Target
      gl.DEPTH_ATTACHMENT, // Attachment point
      depthTexture, // Texture
      0, // Level
      0 // Layer
    );

    // Unbind the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Return the created framebuffer and textures
    return { framebuffer, colorTexture, depthTexture };
  };

  // Add audio effect to the scene
  addAudioEffect = () => {
    // Create an AudioListener and add it to the camera
    const listener = new AudioListener();
    this.camera.add(listener);

    // Create a global audio source
    this.popSFX = new Audio(listener);

    // Load a sound and set it as the Audio object's buffer
    const audioLoader = new AudioLoader();
    audioLoader.load(
      './Pop_SFX.mp3',
      (buffer) => {
        this.popSFX.setBuffer(buffer);
        this.popSFX.setLoop(false);
        this.popSFX.setVolume(0.5);
      },
      undefined,
      (err) => {
        console.error(err);
      }
    );
  };

  // Event listener for starting the VR session
  onSessionStart = () => {
    this.setState({ vrSession: true });
    this.baseReferenceSpace = this.renderer.xr.getReferenceSpace(); // Store the base reference space

    // Add the xrCamera to the cameraGroup
    const xrCamera = this.renderer.xr.getCamera();
    this.cameraGroup.add(xrCamera);
    xrCamera.position.set(0, 0, 0); // Ensure xrCamera is reset
    xrCamera.updateWorldMatrix(true);

    // Add controllers to the cameraGroup
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      this.cameraGroup.add(controller);
      const controllerGrip = this.renderer.xr.getControllerGrip(i);
      this.cameraGroup.add(controllerGrip);
    }
  };

  // Event listener for ending the VR session
  onSessionEnd = () => {
    this.setState({ vrSession: false });

    // Remove the xrCamera from the cameraGroup to avoid conflicts
    const xrCamera = this.renderer.xr.getCamera();
    this.cameraGroup.remove(xrCamera);

    // Remove controllers from the cameraGroup
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      this.cameraGroup.remove(controller);
      const controllerGrip = this.renderer.xr.getControllerGrip(i);
      this.cameraGroup.remove(controllerGrip);
    }
  };

  // Add event listeners
  addEventListeners = () => {
    window.addEventListener('resize', this.handleResize);
    this.mountRef.current.addEventListener('pointermove', this.onPointerMove);
    this.mountRef.current.addEventListener(
      'pointerdown',
      this.onPointerDown,
      true
    );
    this.mountRef.current.addEventListener('pointerup', this.onPointerUp, true);
    document.addEventListener('pointerdown', this.addAudioEffect, {
      once: true,
    });
  };

  // Remove event listeners
  removeEventListeners = () => {
    // Remove window resize event listener
    window.removeEventListener('resize', this.handleResize);

    // Remove pointer event listeners
    if (this.mountRef.current) {
      this.mountRef.current.removeEventListener(
        'pointermove',
        this.onPointerMove
      );
      this.mountRef.current.removeEventListener(
        'pointerdown',
        this.onPointerDown,
        true
      );
      this.mountRef.current.removeEventListener(
        'pointerup',
        this.onPointerUp,
        true
      );
    }

    // Remove XR controller event listeners
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.removeEventListener('selectstart', this.onSelectStart);
      controller.removeEventListener('selectend', this.onSelectEnd);
      controller.removeEventListener('squeezestart', this.onSqueezeStart);
      controller.removeEventListener('squeezeend', this.onSqueezeEnd);
    }

    // Remove XR session event listeners
    this.renderer.xr.removeEventListener('sessionstart', this.onSessionStart);
    this.renderer.xr.removeEventListener('sessionend', this.onSessionEnd);

    // Remove Audio initializer Listener
    document.removeEventListener('pointerdown', this.addAudioEffect);
  };

  // Handle pointer move events
  onPointerMove = (event) => {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (this.isPointerDown) {
      const distance = Math.sqrt(
        Math.pow(this.mouse.x - this.initialMouse.x, 2) +
          Math.pow(this.mouse.y - this.initialMouse.y, 2)
      );
      const threshold = 0.01; // Adjust this threshold as needed
      if (distance > threshold) {
        this.isDragging = true;
      }
    } else {
      this.checkIntersection();
    }
  };

  // Handle pointer down events
  onPointerDown = (event) => {
    event.preventDefault();
    this.updateInitialMousePosition(event);

    this.isPointerDown = true;
    this.isDragging = false;

    const intersects = this.checkIntersection();
    if (intersects.length > 0) {
      this.handleIntersection(intersects[0]);
    }
  };

  // Handle pointer up events
  onPointerUp = (event) => {
    event.preventDefault();
    this.isPointerDown = false;
    this.isDragging = false;

    if (this.squeezeTarget) {
      this.squeezeTarget.endSqueeze();
      this.squeezeTarget = null;
    }
  };

  // Check for intersections with raycaster
  checkIntersection = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(
      this.meshManager.traversedUserGroup,
      true
    );
  };

  // Handle select start events
  onSelectStart = (event) => {
    const controller = event.target;
    const intersects = this.getIntersections(controller);
    if (intersects[0]) {
      intersects[0].object.userData.textObject.visible
        ? intersects[0].object.userData.hideTextObject()
        : intersects[0].object.userData.showTextObject();
    }
  };

  // Handle select end events
  onSelectEnd = (event) => {
    // Handle end of selection if necessary
  };

  // Handle squeeze start events
  onSqueezeStart = (event) => {
    const controller = event.target;
    const intersects = this.getIntersections(controller);
    if (intersects.length > 0) {
      this.handleIntersection(intersects[0]);
    }
  };

  // Handle squeeze end events
  onSqueezeEnd = (event) => {
    if (this.squeezeTarget) {
      this.squeezeTarget.endSqueeze();
      this.squeezeTarget = undefined;
    }
  };

  updateInitialMousePosition = (event) => {
    this.initialMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.initialMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  // Handle the intersection object
  handleIntersection = (intersect) => {
    const userData = intersect.object.userData;

    // Toggle the visibility of the text object if event is pointer down
    if (this.isPointerDown) {
      userData.textObject.visible
        ? userData.hideTextObject()
        : userData.showTextObject();
    }

    this.squeezeTarget = userData;
    if (userData instanceof User) {
      userData.startSqueeze();
    }
  };

  // Get intersections for controllers
  getIntersections = (controller) => {
    const tempMatrix = new Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return this.raycaster.intersectObjects(
      this.meshManager.traversedUserGroup,
      false
    );
  };

  // Get intersections with controller
  getIntersections = (controller) => {
    const tempMatrix = new Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return this.raycaster.intersectObjects(
      this.meshManager.traversedUserGroup,
      false
    );
  };
  animate = () => {
    let previousTime = performance.now();

    this.renderer.setAnimationLoop(() => {
      const currentTime = performance.now();
      const delta = (currentTime - previousTime) / 1000; // Convert to seconds
      previousTime = currentTime;

      // Rotate meshes
      this.rotateMeshes();

      // Handle controller input
      this.handleControllerInput();

      // Update fireworks with delta time
      this.fireworksArray.forEach((firework) => firework.update(delta));

      // Update the scaling of each user mesh and mark those below threshold for removal
      const poppedArray = this.updateUserScales(delta);

      // Remove popped users and create fireworks
      this.handlePoppedUsers(poppedArray);

      // Render the scene based on VR session state and multiview extension support
      this.renderScene();
    });
  };

  // Rotate meshes in the scene
  rotateMeshes = () => {
    this.meshManager.allMeshGroup.rotation.y += 0.002;
    this.meshManager.userGroup.children.forEach((object) => {
      if (object.isMesh) {
        object.rotation.x += 0.004;
        object.rotation.y += 0.004;
      }
    });

    this.meshManager.userDataGroup.children.forEach((object) => {
      if (!object.isMesh) {
        const target = this.state.vrSession
          ? this.cameraGroup.position
          : this.camera.position;
        object.lookAt(target);
      }
    });
  };

  handleControllerInput = () => {
    if (this.state.vrSession) {
      const session = this.renderer.xr.getSession();
      if (session) {
        const inputSources = session.inputSources;
        for (const inputSource of inputSources) {
          if (inputSource.gamepad) {
            const [xAxis, yAxis] = inputSource.gamepad.axes.slice(2, 4);

            const movementSensitivity = 0.1;
            const rotationSensitivity = 0.02;

            if (Math.abs(xAxis) > 0.1) {
              this.cameraGroup.rotateY(-xAxis * rotationSensitivity);
              this.cameraGroup.updateMatrixWorld(true);
            }
            if (Math.abs(yAxis) > 0.1) {
              const direction = new Vector3(0, 0, 1);
              direction.applyQuaternion(
                this.renderer.xr.getCamera().quaternion
              );
              direction.applyQuaternion(this.cameraGroup.quaternion); // Apply camera group's rotation
              direction.multiplyScalar(yAxis * movementSensitivity);
              this.cameraGroup.position.add(direction);
              this.cameraGroup.updateMatrixWorld(true);
            }
          }
        }
      }
    }
  };

  // Update the scaling of each user mesh and return those that need to be removed
  updateUserScales = (delta) => {
    const poppedArray = [];
    this.meshManager.userGroup.children.forEach((object) => {
      const user = object.userData;
      const popped = user.updateScale(delta);
      if (popped) {
        poppedArray.push(user);
      }
    });
    return poppedArray;
  };

  // Handle popped users by removing them and creating fireworks
  handlePoppedUsers = (poppedArray) => {
    poppedArray.forEach((user) => {
      const firework = new FireworkEffect(this.scene);
      const worldPosition = new Vector3();
      user.mesh.getWorldPosition(worldPosition);
      firework.play(worldPosition);
      this.fireworksArray.push(firework);

      this.meshManager.userGroup.remove(user.mesh);
      this.meshManager.userDataGroup.remove(user.textObject);

      this.popSFX.play();

      // Generate a new user to replace the popped one
      this.fetchSingleUserData();
    });
  };

  // Render the scene based on VR session state and multiview extension support
  renderScene = () => {
    if (
      this.state.vrSession &&
      this.multiviewExtension &&
      this.multiviewFramebuffer
    ) {
      const gl = this.renderer.getContext();
      const { framebuffer, colorTexture, depthTexture } =
        this.multiviewFramebuffer;

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      this.multiviewExtension.framebufferTextureMultiviewOVR(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        colorTexture,
        0,
        0,
        2
      );
      this.multiviewExtension.framebufferTextureMultiviewOVR(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        depthTexture,
        0,
        0,
        2
      );

      this.renderer.render(this.scene, this.renderer.xr.getCamera());

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  };

  // Handle window resize events
  handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Fetch user data from the backend
  fetchUserData = (endpoint, single = false) => {
    axios
      .get(`http://127.0.0.1:8000/api/${endpoint}/`)
      .then((response) => {
        this.displayUserData(response.data, single);
      })
      .catch((error) => {
        console.error(`Error fetching user data from ${endpoint}:`, error);
      });
  };

  // Fetch multiple user data sets from the backend
  fetchMultipleUserData = () => {
    this.fetchUserData('random-users');
  };

  // Fetch a single user data set from the backend
  fetchSingleUserData = () => {
    this.fetchUserData('single-user', true);
  };

  // Display user data in the scene
  displayUserData = (data, single = false) => {
    const users = single ? [data] : data;

    users.forEach((userData) => {
      const newUser = new User(userData);
      this.meshManager.userGroup.add(newUser.mesh);
      this.meshManager.userDataGroup.add(newUser.textObject);
    });

    this.scene.add(this.meshManager.allMeshGroup);
  };

  render() {
    return (
      <div
        ref={this.mountRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#cccccc',
          margin: '0',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {!this.state.vrSupported && <div>VR NOT SUPPORTED</div>}
      </div>
    );
  }
}

export default App;
