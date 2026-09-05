import * as THREE from 'three';

export class GameRenderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public ambientLight: THREE.AmbientLight;
  public dirLight: THREE.DirectionalLight;
  public pointLights: THREE.PointLight[] = [];
  
  // Camera follow & shake
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();
  private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, -18, 16);
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;

  // Particle System (Embers & Ash)
  private emberParticles!: THREE.Points;
  private emberPositions!: Float32Array;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    // Atmospheric Mordor haze / dark purple-red fog
    this.scene.background = new THREE.Color(0x0e0c12);
    this.scene.fog = new THREE.FogExp2(0x0e0c12, 0.015);

    // HD-2D Low-Angle Perspective Camera for rich depth & 2.5D feel
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, -20, 20);
    this.camera.lookAt(0, 0, 0);

    // WebGL Renderer with soft shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // Dynamic Lighting
    this.ambientLight = new THREE.AmbientLight(0x352b42, 1.2); // Cool purple-grey ambient
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xff9944, 2.2); // Warm volcanic directional light
    this.dirLight.position.set(20, -30, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    const d = 40;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    this.initEmberParticles();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private initEmberParticles() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    this.emberPositions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      this.emberPositions[i] = (Math.random() - 0.5) * 80;
      this.emberPositions[i + 1] = (Math.random() - 0.5) * 80;
      this.emberPositions[i + 2] = Math.random() * 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff5511,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.emberParticles = new THREE.Points(geometry, material);
    this.scene.add(this.emberParticles);
  }

  public addTorchLight(x: number, y: number, z: number = 1.2): THREE.PointLight {
    const light = new THREE.PointLight(0xff7722, 2.5, 12, 1.8);
    light.position.set(x, y, z);
    light.castShadow = true;
    this.scene.add(light);
    this.pointLights.push(light);
    return light;
  }

  public triggerScreenShake(intensity: number = 0.5) {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 1.5);
  }

  public setFollowTarget(x: number, y: number, z: number = 0) {
    this.cameraTarget.set(x, y, z);
  }

  public update(delta: number) {
    // Smooth camera lerp
    const desiredPos = this.cameraTarget.clone().add(this.cameraOffset);
    
    // Screen shake
    if (this.shakeIntensity > 0.01) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      desiredPos.x += sx;
      desiredPos.y += sy;
      this.shakeIntensity *= this.shakeDecay;
    }

    this.camera.position.lerp(desiredPos, 0.1);
    this.camera.lookAt(this.cameraTarget.x, this.cameraTarget.y + 2, this.cameraTarget.z);

    // Update ember particles drifting
    const pos = this.emberPositions;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += delta * 1.5; // Drift north
      pos[i + 2] += Math.sin(Date.now() * 0.002 + i) * 0.02; // Float
      if (pos[i + 1] > this.cameraTarget.y + 40) {
        pos[i + 1] = this.cameraTarget.y - 40;
      }
    }
    this.emberParticles.geometry.attributes.position.needsUpdate = true;

    // Flicker point lights (torches)
    const time = Date.now() * 0.008;
    for (const light of this.pointLights) {
      light.intensity = 2.2 + Math.sin(time + light.position.x * 5) * 0.5 + Math.cos(time * 1.5 + light.position.y) * 0.3;
    }

    // Directional light shadow box follows player
    this.dirLight.position.set(this.cameraTarget.x + 20, this.cameraTarget.y - 30, 40);
    this.dirLight.target.position.copy(this.cameraTarget);
    this.dirLight.target.updateMatrixWorld();
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
