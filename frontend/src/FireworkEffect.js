import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  AdditiveBlending,
  PointsMaterial,
  Vector3,
  Color,
  TextureLoader,
} from 'three';

class FireworkEffect {
  constructor(scene, particleCount = 100) {
    this.scene = scene;
    this.particleCount = particleCount;
    this.particles = null;
    this.material = null;
    this.velocity = [];
    this.lifespan = 2; // seconds
    this.elapsedTime = 0;
    this.active = false;
    this.origin = new Vector3(); // Default origin

    // Load textures
    const textureLoader = new TextureLoader();
    this.mapTexture = textureLoader.load('./Firework_Map.png');
    this.alphaMapTexture = textureLoader.load('./Firework_Alpha.png');

    this.init();
  }

  // Initialize the particle system
  init() {
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    this.velocity = new Array(this.particleCount);

    // Initialize particle attributes
    for (let i = 0; i < this.particleCount; i++) {
      const color = new Color(Math.random(), Math.random(), Math.random());

      // Set initial positions at the origin
      this.setPosition(positions, i, 0, 0, 0);

      // Set random colors and sizes
      this.setColor(colors, i, color);
      sizes[i] = Math.random() * 0.1;

      // Initialize random velocity
      this.setRandomVelocity(i);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));

    this.material = new PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: AdditiveBlending,
      depthTest: false,
      map: this.mapTexture,
      alphaMap: this.alphaMapTexture,
    });

    this.particles = new Points(geometry, this.material);
    this.scene.add(this.particles);
  }

  // Set particle position
  setPosition(array, index, x, y, z) {
    array[index * 3] = x;
    array[index * 3 + 1] = y;
    array[index * 3 + 2] = z;
  }

  // Set particle color
  setColor(array, index, color) {
    array[index * 3] = color.r;
    array[index * 3 + 1] = color.g;
    array[index * 3 + 2] = color.b;
  }

  // Set random velocity for particles
  setRandomVelocity(index) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 2 + 2;
    const vx = speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);
    const vz = Math.random() * 2 - 1;
    this.velocity[index] = new Vector3(vx, vy, vz);
  }

  // Play the firework effect
  play(origin = new Vector3()) {
    this.elapsedTime = 0;
    this.active = true;
    this.origin.copy(origin);
    this.resetParticles();
  }

  // Reset particle positions and velocities
  resetParticles() {
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      // Reset positions to the origin
      this.setPosition(
        positions,
        i,
        this.origin.x,
        this.origin.y,
        this.origin.z
      );

      // Set random velocity
      this.setRandomVelocity(i);
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.validatePositions(positions);
    this.particles.geometry.computeBoundingSphere();
  }

  // Validate particle positions to ensure they are valid numbers
  validatePositions(positions) {
    for (let i = 0; i < positions.length; i++) {
      if (isNaN(positions[i])) {
        console.error(`Invalid position value at index ${i}:`, positions[i]);
        return false;
      }
    }
    return true;
  }

  // Update particle positions and velocities
  update(delta) {
    if (!delta) {
      console.log('Invalid delta value.');
      return;
    }
    if (!this.active) return;

    this.elapsedTime += delta;
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      // Update positions based on velocity and delta time
      positions[i * 3] += this.velocity[i].x * delta;
      positions[i * 3 + 1] += this.velocity[i].y * delta;
      positions[i * 3 + 2] += this.velocity[i].z * delta;

      // Apply gravity
      this.velocity[i].y -= 9.81 * delta * 0.1;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    if (!this.validatePositions(positions)) return;

    this.particles.geometry.computeBoundingSphere();

    if (this.elapsedTime > this.lifespan) {
      this.active = false;
      this.scene.remove(this.particles);
    }
  }
}

export default FireworkEffect;
