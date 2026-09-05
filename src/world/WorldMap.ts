import * as THREE from 'three';
import { GameRenderer } from '../engine/Renderer';
import { AssetGenerator } from '../engine/AssetGenerator';

export interface InteractiveProp {
  id: string;
  type: 'grog_barrel' | 'caragor_cage' | 'torch' | 'stealth_bush' | 'haedir_tower';
  position: THREE.Vector3;
  mesh: THREE.Object3D;
  isTriggered: boolean;
  radius: number;
}

export class WorldMap {
  public scene: THREE.Scene;
  public renderer: GameRenderer;
  public groundMesh!: THREE.Mesh;
  public wallMeshes: THREE.Mesh[] = [];
  public props: InteractiveProp[] = [];
  public mapBounds = { minX: -60, maxX: 60, minY: -60, maxY: 60 };

  constructor(scene: THREE.Scene, renderer: GameRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.createTerrain();
    this.createFortressAndStructures();
    this.spawnInteractiveProps();
  }

  private createTerrain() {
    // Ground Plane with Mordor Volcanic Rock Texture
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundTex = AssetGenerator.getTerrainTexture();
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(20, 20);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.15
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  private createFortressAndStructures() {
    const wallTex = AssetGenerator.getFortressWallTexture();
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(4, 1);

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.7,
      metalness: 0.3
    });

    // Helper to build a 2.5D stone wall segment
    const addWall = (x: number, y: number, w: number, h: number, depth: number = 5) => {
      const geo = new THREE.BoxGeometry(w, h, depth);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, y, depth / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.wallMeshes.push(mesh);
    };

    // 1. The Great Black Citadel (Northern Fortress)
    // Outer Gates
    addWall(-25, -15, 25, 4); // Left outer wall
    addWall(25, -15, 25, 4);  // Right outer wall
    // Inner Citadel Bastions
    addWall(-38, -35, 4, 40); // West rampart
    addWall(38, -35, 4, 40);  // East rampart
    addWall(0, -55, 80, 5);   // North Overlord Wall
    
    // Throne Room Pillars & Inner Sanctum
    addWall(-12, -40, 3, 14);
    addWall(12, -40, 3, 14);

    // 2. Ruined Watchtowers / Haedir Tower in South
    const towerGeo = new THREE.CylinderGeometry(2.5, 3.5, 12, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x2a303c, roughness: 0.5, metalness: 0.6 });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.rotation.x = Math.PI / 2;
    towerMesh.position.set(0, 45, 6);
    towerMesh.castShadow = true;
    this.scene.add(towerMesh);

    // Glowing Eye of the Bright Lord atop Haedir Tower
    const eyeGeo = new THREE.SphereGeometry(1, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38e1ff });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.set(0, 45, 13);
    this.scene.add(eyeMesh);

    const haedirLight = new THREE.PointLight(0x38e1ff, 3, 20);
    haedirLight.position.set(0, 45, 14);
    this.scene.add(haedirLight);
  }

  private spawnInteractiveProps() {
    // 1. Stealth Grass Bushes
    const bushTex = AssetGenerator.getStealthBushTexture();
    const bushMat = new THREE.MeshStandardMaterial({
      map: bushTex,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide
    });

    const bushPositions = [
      { x: -15, y: 15 }, { x: -12, y: 14 }, { x: -14, y: 18 },
      { x: 18, y: 12 }, { x: 21, y: 15 }, { x: 19, y: 9 },
      { x: -8, y: -2 }, { x: -5, y: -4 }, { x: 8, y: 28 },
      { x: -28, y: 25 }, { x: 30, y: -5 }, { x: -18, y: -20 }
    ];

    bushPositions.forEach((pos, idx) => {
      const geo = new THREE.PlaneGeometry(3.5, 3.5);
      const mesh = new THREE.Mesh(geo, bushMat);
      mesh.position.set(pos.x, pos.y, 1.7);
      mesh.rotation.x = Math.PI / 4; // Tilted toward camera for 2.5D look
      mesh.castShadow = false;
      this.scene.add(mesh);

      this.props.push({
        id: `bush_${idx}`,
        type: 'stealth_bush',
        position: new THREE.Vector3(pos.x, pos.y, 0),
        mesh,
        isTriggered: false,
        radius: 2.2
      });
    });

    // 2. Grog Barrels (Explosive / Poison Hazards)
    const grogTex = AssetGenerator.getGrogBarrelTexture();
    const grogMat = new THREE.MeshStandardMaterial({
      map: grogTex,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });

    const barrelPositions = [
      { x: -20, y: 22 }, { x: 15, y: 20 }, { x: -5, y: 10 },
      { x: 25, y: -5 }, { x: -18, y: -12 }, { x: 10, y: -22 },
      { x: -25, y: -28 }, { x: 0, y: -32 }
    ];

    barrelPositions.forEach((pos, idx) => {
      const geo = new THREE.PlaneGeometry(2.2, 2.2);
      const mesh = new THREE.Mesh(geo, grogMat);
      mesh.position.set(pos.x, pos.y, 1.1);
      mesh.rotation.x = Math.PI / 4;
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.props.push({
        id: `barrel_${idx}`,
        type: 'grog_barrel',
        position: new THREE.Vector3(pos.x, pos.y, 0),
        mesh,
        isTriggered: false,
        radius: 1.5
      });
    });

    // 3. Torches & Braziers (with dynamic point lights)
    const torchTex = AssetGenerator.getTorchTexture();
    const torchMat = new THREE.MeshStandardMaterial({
      map: torchTex,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });

    const torchPositions = [
      { x: -13, y: -15 }, { x: 13, y: -15 }, // Citadel Gate
      { x: -22, y: -25 }, { x: 22, y: -25 },
      { x: -10, y: -42 }, { x: 10, y: -42 }, // Throne room
      { x: -25, y: 12 }, { x: 22, y: 25 }, { x: 0, y: 40 }
    ];

    torchPositions.forEach((pos, idx) => {
      const geo = new THREE.PlaneGeometry(2, 3);
      const mesh = new THREE.Mesh(geo, torchMat);
      mesh.position.set(pos.x, pos.y, 1.5);
      mesh.rotation.x = Math.PI / 4;
      mesh.castShadow = true;
      this.scene.add(mesh);

      // Add dynamic flickering point light
      this.renderer.addTorchLight(pos.x, pos.y, 2.2);

      this.props.push({
        id: `torch_${idx}`,
        type: 'torch',
        position: new THREE.Vector3(pos.x, pos.y, 0),
        mesh,
        isTriggered: false,
        radius: 1.2
      });
    });

    // 4. Caragor Cages
    const cagePositions = [{ x: -30, y: 5 }, { x: 32, y: 15 }];
    cagePositions.forEach((pos, idx) => {
      const geo = new THREE.BoxGeometry(4, 4, 3);
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x333333, wireframe: true });
      const mesh = new THREE.Mesh(geo, wireMat);
      mesh.position.set(pos.x, pos.y, 1.5);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.props.push({
        id: `cage_${idx}`,
        type: 'caragor_cage',
        position: new THREE.Vector3(pos.x, pos.y, 0),
        mesh,
        isTriggered: false,
        radius: 2.5
      });
    });
  }

  // Check collision against stone fortress walls
  public checkWallCollision(x: number, y: number, radius: number = 0.8): boolean {
    for (const wall of this.wallMeshes) {
      const bbox = new THREE.Box3().setFromObject(wall);
      // 2D distance to box
      if (
        x + radius > bbox.min.x &&
        x - radius < bbox.max.x &&
        y + radius > bbox.min.y &&
        y - radius < bbox.max.y
      ) {
        return true;
      }
    }
    return false;
  }

  // Check if player is hiding in stealth grass
  public isPlayerInStealth(x: number, y: number): boolean {
    for (const prop of this.props) {
      if (prop.type === 'stealth_bush') {
        const dx = prop.position.x - x;
        const dy = prop.position.y - y;
        if (Math.hypot(dx, dy) < prop.radius) {
          return true;
        }
      }
    }
    return false;
  }
}
