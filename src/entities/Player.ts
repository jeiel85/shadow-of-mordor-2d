import * as THREE from 'three';
import { AssetGenerator } from '../engine/AssetGenerator';
import { PlayerStats, GearItem } from '../nemesis/NemesisTypes';
import { soundManager } from '../audio/SoundManager';

export class Player {
  public mesh: THREE.Mesh;
  public light: THREE.PointLight;
  public position: THREE.Vector3 = new THREE.Vector3(0, 35, 1.5);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public facing: THREE.Vector2 = new THREE.Vector2(0, -1);
  public speed: number = 9.5;
  
  // States
  public state: 'idle' | 'run' | 'attack' | 'aim' | 'drain' | 'dodge' = 'idle';
  public isInvulnerable: boolean = false;
  public isStealthed: boolean = false;
  public attackTimer: number = 0;
  public dodgeTimer: number = 0;
  public drainTimer: number = 0;

  // Stats & Progression
  public stats: PlayerStats;
  public inventory: GearItem[] = [];

  // Textures for animation states
  private texIdle: THREE.CanvasTexture;
  private texWalk: THREE.CanvasTexture;
  private texAttack: THREE.CanvasTexture;
  private texAim: THREE.CanvasTexture;
  private texDrain: THREE.CanvasTexture;
  private material: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene) {
    this.texIdle = AssetGenerator.getPlayerSpriteTexture('idle');
    this.texWalk = AssetGenerator.getPlayerSpriteTexture('walk');
    this.texAttack = AssetGenerator.getPlayerSpriteTexture('attack');
    this.texAim = AssetGenerator.getPlayerSpriteTexture('aim');
    this.texDrain = AssetGenerator.getPlayerSpriteTexture('drain');

    this.material = new THREE.MeshStandardMaterial({
      map: this.texIdle,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });

    const geo = new THREE.PlaneGeometry(3, 4);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.rotation.x = Math.PI / 4; // Tilt towards 2.5D camera
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // Ethereal Celebrimbor Wraith Aura (blue point light on player)
    this.light = new THREE.PointLight(0x00d4ff, 1.8, 8, 1.5);
    this.light.position.set(0, 0, 1.5);
    this.mesh.add(this.light);

    // Load or initialize stats
    this.stats = this.loadStats();
  }

  private loadStats(): PlayerStats {
    const saved = localStorage.getItem('mordor_player_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse player stats:', e);
      }
    }

    // Default starter stats
    return {
      level: 1,
      xp: 0,
      nextLevelXp: 500,
      mirian: 200,
      health: 300,
      maxHealth: 300,
      wrath: 0,
      focus: 100,
      arrows: 6,
      maxArrows: 6,
      comboHits: 0,
      equippedGear: {
        sword: {
          id: 'gear_sword_1',
          name: 'Urfael of the Ranger',
          type: 'sword',
          rarity: 'Common',
          level: 1,
          attackPower: 45,
          perk: 'Classic Ranger Blade forged in Gondor.',
          iconName: 'sword'
        },
        dagger: {
          id: 'gear_dagger_1',
          name: 'Acharn Broken Shard',
          type: 'dagger',
          rarity: 'Common',
          level: 1,
          attackPower: 75,
          perk: 'Stealth kills grant 1 Elf-Shot.',
          iconName: 'dagger'
        },
        bow: {
          id: 'gear_bow_1',
          name: 'Azkâr Bow of the Wraith',
          type: 'bow',
          rarity: 'Common',
          level: 1,
          attackPower: 60,
          perk: 'Headshots generate +10 Wrath.',
          iconName: 'bow'
        },
        armor: {
          id: 'gear_armor_1',
          name: 'Hauberk of the Black Gate',
          type: 'armor',
          rarity: 'Common',
          level: 1,
          defense: 30,
          perk: 'Reduces melee damage by 10%.',
          iconName: 'shield'
        },
        cloak: {
          id: 'gear_cloak_1',
          name: 'Cloak of the Shadow Lands',
          type: 'cloak',
          rarity: 'Common',
          level: 1,
          defense: 15,
          perk: 'Stealth bushes provide 20% faster movement.',
          iconName: 'user'
        },
        ring: {
          id: 'gear_ring_1',
          name: 'Celebrimbor Bright Ring',
          type: 'ring',
          rarity: 'Epic',
          level: 1,
          attackPower: 20,
          perk: 'Branded Orcs deal +25% bonus damage.',
          iconName: 'award'
        }
      },
      skills: {
        executionUnlocked: true,
        shadowStrikeUnlocked: true,
        perfectCounterUnlocked: true,
        ironWillBreakerUnlocked: false,
        callBodyguardUnlocked: true,
        caragorRiderUnlocked: false,
        stealthDrainUnlocked: true
      }
    };
  }

  public saveStats() {
    try {
      localStorage.setItem('mordor_player_stats', JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Failed to save player stats:', e);
    }
  }

  public gainXP(amount: number) {
    this.stats.xp += amount;
    if (this.stats.xp >= this.stats.nextLevelXp) {
      this.stats.level++;
      this.stats.xp -= this.stats.nextLevelXp;
      this.stats.nextLevelXp = Math.floor(this.stats.nextLevelXp * 1.5);
      this.stats.maxHealth += 40;
      this.stats.health = this.stats.maxHealth;
      this.stats.mirian += 250;
      soundManager.playFanfare();
      this.saveStats();
    }
  }

  public addWrath(amount: number) {
    this.stats.wrath = Math.min(100, this.stats.wrath + amount);
  }

  public takeDamage(amount: number) {
    if (this.isInvulnerable) return;
    const def = (this.stats.equippedGear.armor.defense || 0) + (this.stats.equippedGear.cloak.defense || 0);
    const actualDmg = Math.max(5, Math.floor(amount * (100 / (100 + def))));

    this.stats.health = Math.max(0, this.stats.health - actualDmg);
    this.stats.comboHits = 0; // Break combo
    soundManager.playImpact();

    // Flash red aura
    this.light.color.setHex(0xff2222);
    setTimeout(() => {
      this.light.color.setHex(0x00d4ff);
    }, 150);
  }

  public heal(amount: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public update(delta: number, input: { x: number; y: number; isAiming: boolean; isAttacking: boolean; isDodging: boolean }) {
    // Regenerate focus gradually
    if (!input.isAiming) {
      this.stats.focus = Math.min(100, this.stats.focus + delta * 25);
    } else {
      this.stats.focus = Math.max(0, this.stats.focus - delta * 30);
    }

    // Dodge State
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= delta;
      this.state = 'dodge';
      this.isInvulnerable = true;
      this.position.x += this.facing.x * this.speed * 1.6 * delta;
      this.position.y += this.facing.y * this.speed * 1.6 * delta;
      this.mesh.position.copy(this.position);
      return;
    } else {
      this.isInvulnerable = false;
    }

    // Attack State
    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      this.state = 'attack';
      this.material.map = this.texAttack;
      return;
    }

    // Drain State
    if (this.drainTimer > 0) {
      this.drainTimer -= delta;
      this.state = 'drain';
      this.material.map = this.texDrain;
      return;
    }

    // Aiming Bow State
    if (input.isAiming && this.stats.focus > 5) {
      this.state = 'aim';
      this.material.map = this.texAim;
      return;
    }

    // Normal Movement
    if (input.x !== 0 || input.y !== 0) {
      const len = Math.hypot(input.x, input.y);
      const nx = input.x / len;
      const ny = input.y / len;
      this.facing.set(nx, ny);

      const curSpeed = this.isStealthed ? this.speed * 0.75 : this.speed;
      this.position.x += nx * curSpeed * delta;
      this.position.y += ny * curSpeed * delta;
      this.state = 'run';
      this.material.map = this.texWalk;

      // Flip sprite based on movement direction
      this.mesh.scale.x = nx < 0 ? -1 : 1;
    } else {
      this.state = 'idle';
      this.material.map = this.texIdle;
    }

    this.mesh.position.copy(this.position);
  }
}
