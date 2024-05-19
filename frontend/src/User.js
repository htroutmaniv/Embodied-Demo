import {
  Mesh,
  Vector3,
  BoxGeometry,
  Euler,
  SphereGeometry,
  ConeGeometry,
  CylinderGeometry,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  Object3D,
  Box3,
  PlaneGeometry,
  Group,
} from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class User {
  _name;
  _email;
  _age;
  _mesh;
  _textObject = new Group();
  _fontLoader = new FontLoader();

  constructor({ name, email, age }) {
    this._name = name;
    this._email = email;
    this._age = age;
    this._mesh = this.generateMesh();
    this._mesh.userData = this; // Add user data reference to the mesh
    this._fontLoader = new FontLoader();
    if (!User.font) {
      this._fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
        (font) => {
          User.font = font;
          this.createTextObject();
        }
      );
    } else {
      this.createTextObject();
    }
    this.hideTextObject();

    //squashing animation variables
    this.originalScale = new Vector3(1, 1, 1);
    this.squashScale = new Vector3(0.1, 2, 0.1);
    this.isSqueezing = false;
    this.scaleSpeed = 1.5; // Adjust for smoothness
  }

  //_region Getters and Setters
  // Getter and setter for name
  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  // Getter and setter for email
  get email() {
    return this._email;
  }

  set email(value) {
    this._email = value;
  }

  // Getter and setter for age
  get age() {
    return this._age;
  }

  set age(value) {
    this._age = value;
  }

  // Getter and setter for mesh
  get mesh() {
    return this._mesh;
  }
  set mesh(value) {
    if (value instanceof Object3D) {
      this._mesh = value;
    } else {
      throw new Error('mesh must be an instance of THREE.Object3D');
    }
  }

  get textObject() {
    return this._textObject;
  }

  //#endregion

  generateMesh() {
    const geometries = [
      new BoxGeometry(),
      new SphereGeometry(),
      new ConeGeometry(),
      new CylinderGeometry(),
    ];

    const randomGeometry =
      geometries[Math.floor(Math.random() * geometries.length)];
    const material = new MeshPhysicalMaterial({
      color: Math.random() * 0xffffff,
    });
    material.roughness = randFloat(0.2, 0.8);
    const mesh = new Mesh(randomGeometry, material);
    mesh.position.copy(
      new Vector3(randFloat(-5, 5), randFloat(-5, 5), randFloat(-5, 5))
    );
    mesh.rotation.copy(
      new Euler(randFloat(0, 359), randFloat(0, 359), randFloat(0, 359))
    );
    mesh.renderOrder = 0;
    mesh.name = 'userMesh';
    return mesh;
  }

  createTextObject() {
    const font = User.font;

    const textMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      depthTest: false,
    });

    // Combine name, email, and age into one string with newlines
    const combinedText = `${this._name}\n${this._email}\n${this._age}`;

    // Create a single text geometry
    const textGeometry = new TextGeometry(combinedText, {
      font: font,
      size: 0.2,
      height: 0.01,
    });
    const textMesh = new Mesh(textGeometry, textMaterial);
    textMesh.renderOrder = 999;

    // Create a group for the text and background
    const textGroup = new Group();
    textGroup.add(textMesh);

    // Calculate bounding box of the text geometry
    const boundingBox = new Box3().setFromObject(textMesh);
    const size = new Vector3();
    boundingBox.getSize(size);
    const center = boundingBox.getCenter(new Vector3());

    // Adjust position to center the text mesh
    textMesh.position.sub(center);

    // Create a background box
    const backgroundGeometry = new PlaneGeometry(size.x + 0.2, size.y + 0.1);
    const backgroundMaterial = new MeshBasicMaterial({
      color: 0x888888,
      opacity: 0.5,
      transparent: true,
      depthTest: false,
    });
    const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial);
    backgroundMesh.position.set(0, 0, -0.01); // Slightly behind the text
    backgroundMesh.renderOrder = 990;

    // Add background to the group
    textGroup.add(backgroundMesh);

    // Add the group to the text object
    this._textObject.add(textGroup);

    // Position text object above the user mesh
    this._textObject.position.copy(this._mesh.position);
    this._textObject.position.y += 1; // Adjust the height as needed
  }

  // Method to show text object
  showTextObject() {
    this._textObject.visible = true;
  }

  // Method to hide text object
  hideTextObject() {
    this._textObject.visible = false;
  }

  // Method to start the squeeze action
  startSqueeze() {
    this.isSqueezing = true;
  }

  // Method to end the squeeze action
  endSqueeze() {
    this.isSqueezing = false;
  }

  // Method to update the scaling of the mesh
  updateScale(delta) {
    const targetScale = this.isSqueezing
      ? this.squashScale
      : this.originalScale;
    this._mesh.scale.lerp(targetScale, this.scaleSpeed * delta);

    //return true if minimum scale is reached and the mesh should be popped.
    if (
      this.isSqueezing &&
      (this._mesh.scale.x <= 0.2 || this._mesh.scale.z <= 0.2)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export default User;
