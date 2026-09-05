import * as THREE from 'three';
import { OrcCaptain } from '../nemesis/NemesisTypes';
import { AssetGenerator } from '../engine/AssetGenerator';

export class OrcEntity {
  public data: OrcCaptain;
  public mesh: THREE.Mesh;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public facing: THREE.Vector2 = new THREE.Vector2(0, 1);
  public speed: number = 5.5;

  // AI & Combat States
  public state: 'idle' | 'patrol' | 'investigate' | 'combat' | 'enraged' | 'flee' | 'branded_follow' | 'stunned' | 'dead' = 'patrol';
  public attackCooldown: number = 0;
  public telegraphTimer: number = 0; // Windup before hitting (allows player to counter!)
  public stunTimer: number = 0;
  public patrolTimer: number = 0;
  public patrolTarget: THREE.Vector2;
  public isEnraged: boolean = false;

  // UI elements attached
  public counterPromptMesh: THREE.Mesh | null = null;
  public healthBarMesh: THREE.Mesh;
  public material: THREE.MeshStandardMaterial;

  constructor(orcData: OrcCaptain, scene: THREE.Scene) {
    this.data = orcData;
    this.position = new THREE.Vector3(orcData.worldPosition.x, orcData.worldPosition.y, 1.5);
    this.patrolTarget = new THREE.Vector2(this.position.x, this.position.y);

    const tex = AssetGenerator.getOrcSpriteTexture(this.data.appearance, this.data.isBranded, this.isEnraged);
    this.material = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });

    const size = 3.2 * this.data.appearance.scale;
    const geo = new THREE.PlaneGeometry(size, size);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.rotation.x = Math.PI / 4;
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // Health Bar Billboard above head
    this.healthBarMesh = this.createHealthBar();
    this.mesh.add(this.healthBarMesh);

    // Counter prompt rune (initially invisible)
    this.counterPromptMesh = this.createCounterPrompt();
    this.mesh.add(this.counterPromptMesh);

    if (this.data.isBranded) {
      this.state = 'branded_follow';
    }
  }

  private createHealthBar(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(0, 0, 64, 8);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(2.0, 0.25);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 2.2, 0);
    return mesh;
  }

  private createCounterPrompt(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Blue/Yellow Counter Glyph (like Shadow of War!)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(24, 22);
    ctx.lineTo(8, 22);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(1.2, 1.2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 2.8, 0);
    mesh.visible = false;
    return mesh;
  }

  public updateHealthBar() {
    const canvas = (this.healthBarMesh.material as THREE.MeshBasicMaterial).map?.image as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 64, 8);

    // Background bar
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 64, 8);

    // Health fill
    const pct = Math.max(0, this.data.health / this.data.maxHealth);
    ctx.fillStyle = this.data.isBranded ? '#00e1ff' : this.isEnraged ? '#ff5500' : '#ee2222';
    ctx.fillRect(0, 0, Math.floor(64 * pct), 8);

    if ((this.healthBarMesh.material as THREE.MeshBasicMaterial).map) {
      (this.healthBarMesh.material as THREE.MeshBasicMaterial).map!.needsUpdate = true;
    }
  }

  public takeDamage(amount: number, isFire: boolean = false, isStealth: boolean = false): { died: boolean; broken: boolean } {
    if (this.state === 'dead') return { died: false, broken: false };

    // Check Immunities
    if (isFire && this.data.immunities.includes('Fire-Proof')) {
      amount = 0;
    }
    if (isStealth && this.data.immunities.includes('Stealth-Proof')) {
      amount = Math.floor(amount * 0.1);
    }

    // Check Enrages
    if (this.data.enrages.includes('Enraged by Injury') && this.data.health < this.data.maxHealth * 0.5) {
      this.triggerEnrage();
    }
    if (isFire && this.data.enrages.includes('Enraged by Fire')) {
      this.triggerEnrage();
    }

    // Check Fears
    if (isFire && this.data.weaknesses.includes('Fear of Fire')) {
      this.state = 'flee';
    }

    this.data.health -= amount;
    this.updateHealthBar();

    if (this.data.health <= 0) {
      this.state = 'dead';
      this.mesh.visible = false;
      return { died: true, broken: false };
    }

    // Broken state: HP under 25% (Ready to Dominate/Brand!)
    const broken = this.data.health <= this.data.maxHealth * 0.28;
    return { died: false, broken };
  }

  public triggerEnrage() {
    this.isEnraged = true;
    this.speed = 8.5;
    this.refreshTexture();
  }

  public refreshTexture() {
    this.material.map = AssetGenerator.getOrcSpriteTexture(this.data.appearance, this.data.isBranded, this.isEnraged);
    this.material.map.needsUpdate = true;
  }

  public update(delta: number, playerPos: THREE.Vector3, isPlayerStealthed: boolean): { willHitPlayer: boolean; attackDamage: number } {
    if (this.state === 'dead') return { willHitPlayer: false, attackDamage: 0 };

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.stunTimer = Math.max(0, this.stunTimer - delta);

    if (this.stunTimer > 0) {
      this.state = 'stunned';
      return { willHitPlayer: false, attackDamage: 0 };
    }

    const distToPlayer = Math.hypot(playerPos.x - this.position.x, playerPos.y - this.position.y);

    // Branded Ally Follow & Protect Mode
    if (this.data.isBranded) {
      this.state = 'branded_follow';
      if (distToPlayer > 4.5) {
        const dx = playerPos.x - this.position.x;
        const dy = playerPos.y - this.position.y;
        const len = Math.hypot(dx, dy);
        this.position.x += (dx / len) * this.speed * delta;
        this.position.y += (dy / len) * this.speed * delta;
        this.mesh.scale.x = dx < 0 ? -1 : 1;
      }
      this.mesh.position.copy(this.position);
      return { willHitPlayer: false, attackDamage: 0 };
    }

    // Fleeing state
    if (this.state === 'flee') {
      const dx = this.position.x - playerPos.x;
      const dy = this.position.y - playerPos.y;
      const len = Math.hypot(dx, dy) || 1;
      this.position.x += (dx / len) * (this.speed * 1.2) * delta;
      this.position.y += (dy / len) * (this.speed * 1.2) * delta;
      this.mesh.position.copy(this.position);
      return { willHitPlayer: false, attackDamage: 0 };
    }

    // Hostile AI Logic
    const detectionRange = isPlayerStealthed ? 5.0 : 14.0;

    if (distToPlayer < detectionRange) {
      this.state = 'combat';
      const dx = playerPos.x - this.position.x;
      const dy = playerPos.y - this.position.y;
      const len = Math.hypot(dx, dy);

      // Facing
      this.mesh.scale.x = dx < 0 ? -1 : 1;

      // Telegraphing attack!
      if (distToPlayer < 2.5) {
        if (this.attackCooldown <= 0 && this.telegraphTimer <= 0) {
          // Begin telegraph!
          this.telegraphTimer = 0.8; // 800ms window for player to counter
          if (this.counterPromptMesh) this.counterPromptMesh.visible = true;
        }

        if (this.telegraphTimer > 0) {
          this.telegraphTimer -= delta;
          if (this.telegraphTimer <= 0) {
            // Strike lands!
            if (this.counterPromptMesh) this.counterPromptMesh.visible = false;
            this.attackCooldown = 1.6;
            const baseDmg = 35 + this.data.level * 6;
            return { willHitPlayer: true, attackDamage: baseDmg };
          }
        }
      } else {
        // Move towards player
        if (this.counterPromptMesh) this.counterPromptMesh.visible = false;
        this.position.x += (dx / len) * this.speed * delta;
        this.position.y += (dy / len) * this.speed * delta;
      }
    } else {
      // Normal patrol around territory
      this.state = 'patrol';
      if (this.counterPromptMesh) this.counterPromptMesh.visible = false;
      this.patrolTimer -= delta;
      if (this.patrolTimer <= 0) {
        this.patrolTimer = 4 + Math.random() * 5;
        this.patrolTarget.set(
          this.data.worldPosition.x + (Math.random() - 0.5) * 12,
          this.data.worldPosition.y + (Math.random() - 0.5) * 12
        );
      }

      const dx = this.patrolTarget.x - this.position.x;
      const dy = this.patrolTarget.y - this.position.y;
      const len = Math.hypot(dx, dy);
      if (len > 0.5) {
        this.position.x += (dx / len) * (this.speed * 0.4) * delta;
        this.position.y += (dy / len) * (this.speed * 0.4) * delta;
        this.mesh.scale.x = dx < 0 ? -1 : 1;
      }
    }

    this.mesh.position.copy(this.position);
    return { willHitPlayer: false, attackDamage: 0 };
  }
}
