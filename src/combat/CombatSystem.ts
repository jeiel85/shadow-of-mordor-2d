import * as THREE from 'three';
import { Player } from '../entities/Player';
import { OrcEntity } from '../entities/OrcEntity';
import { WorldMap } from '../world/WorldMap';
import { soundManager } from '../audio/SoundManager';
import { GameRenderer } from '../engine/Renderer';
import { GearItem } from '../nemesis/NemesisTypes';

export interface ArrowProjectile {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isAlive: boolean;
  damage: number;
}

export class CombatSystem {
  public scene: THREE.Scene;
  public player: Player;
  public worldMap: WorldMap;
  public renderer: GameRenderer;
  public orcs: OrcEntity[] = [];
  public projectiles: ArrowProjectile[] = [];

  // Drop callback
  public onLootDrop?: (item: GearItem, pos: THREE.Vector3) => void;
  public onCaptainDefeated?: (orc: OrcEntity) => void;
  public onCaptainBranded?: (orc: OrcEntity) => void;

  constructor(scene: THREE.Scene, player: Player, worldMap: WorldMap, renderer: GameRenderer) {
    this.scene = scene;
    this.player = player;
    this.worldMap = worldMap;
    this.renderer = renderer;
  }

  public registerOrcs(orcs: OrcEntity[]) {
    this.orcs = orcs;
  }

  // 1. Regular Melee Attack
  public performMeleeAttack() {
    if (this.player.attackTimer > 0) return;
    this.player.attackTimer = 0.3;
    soundManager.playSlash();

    const swordDmg = this.player.stats.equippedGear.sword.attackPower || 45;
    const baseDamage = swordDmg + this.player.stats.level * 5;

    // Check hit in facing arc
    let hitAny = false;
    for (const orc of this.orcs) {
      if (orc.state === 'dead' || orc.data.isBranded) continue;
      const dx = orc.position.x - this.player.position.x;
      const dy = orc.position.y - this.player.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 3.2) {
        // Dot product with player facing
        const dot = (dx / dist) * this.player.facing.x + (dy / dist) * this.player.facing.y;
        if (dot > 0.2) {
          hitAny = true;
          this.player.stats.comboHits++;
          this.player.addWrath(8);

          const result = orc.takeDamage(baseDamage);
          soundManager.playImpact();
          this.renderer.triggerScreenShake(0.2);

          // Push back slightly
          orc.position.x += this.player.facing.x * 0.8;
          orc.position.y += this.player.facing.y * 0.8;

          if (result.died) {
            this.handleOrcDeath(orc);
          }
        }
      }
    }

    // Also check if hit a grog barrel
    for (const prop of this.worldMap.props) {
      if (prop.type === 'grog_barrel' && !prop.isTriggered) {
        const d = prop.position.distanceTo(this.player.position);
        if (d < 3.0) {
          this.explodeGrogBarrel(prop);
        }
      }
    }

    if (!hitAny) {
      // Missed attack: slight delay before combo breaks
    }
  }

  // 2. Counter / Parry (Spacebar or Right Click)
  public performCounter(): boolean {
    // Look for any hostile orc currently in telegraph window within 3.5 units
    for (const orc of this.orcs) {
      if (orc.state === 'dead' || orc.data.isBranded) continue;
      const dist = Math.hypot(orc.position.x - this.player.position.x, orc.position.y - this.player.position.y);
      if (dist < 3.5 && orc.telegraphTimer > 0) {
        // Successful parry!
        orc.telegraphTimer = 0;
        orc.stunTimer = 1.8;
        if (orc.counterPromptMesh) orc.counterPromptMesh.visible = false;

        soundManager.playParry();
        this.renderer.triggerScreenShake(0.4);
        this.player.addWrath(15);
        this.player.stats.comboHits += 2;

        // Counter strike damage
        const counterDmg = (this.player.stats.equippedGear.sword.attackPower || 45) * 1.5;
        const res = orc.takeDamage(counterDmg);
        if (res.died) {
          this.handleOrcDeath(orc);
        }
        return true;
      }
    }
    return false;
  }

  // 3. Brutal Execution (Wrath 100% -> 'F')
  public performExecution(): boolean {
    if (this.player.stats.wrath < 100) return false;

    // Find nearest non-branded enemy within 3.5 units
    let targetOrc: OrcEntity | null = null;
    let minDist = 4.0;
    for (const orc of this.orcs) {
      if (orc.state === 'dead' || orc.data.isBranded) continue;
      const d = Math.hypot(orc.position.x - this.player.position.x, orc.position.y - this.player.position.y);
      if (d < minDist) {
        minDist = d;
        targetOrc = orc;
      }
    }

    if (targetOrc) {
      this.player.stats.wrath = 0;
      soundManager.playExecution();
      this.renderer.triggerScreenShake(0.8);

      const execDmg = (this.player.stats.equippedGear.sword.attackPower || 45) * 4.0;
      const res = targetOrc.takeDamage(execDmg);
      if (res.died) {
        this.handleOrcDeath(targetOrc);
      }
      return true;
    }
    return false;
  }

  // 4. Drain & Brand ('E')
  public performDrainOrBrand(): boolean {
    // Find nearest broken or stunned enemy within 3.0 units
    let targetOrc: OrcEntity | null = null;
    let minDist = 3.5;
    for (const orc of this.orcs) {
      if (orc.state === 'dead' || orc.data.isBranded) continue;
      const d = Math.hypot(orc.position.x - this.player.position.x, orc.position.y - this.player.position.y);
      if (d < minDist) {
        minDist = d;
        targetOrc = orc;
      }
    }

    if (targetOrc) {
      this.player.drainTimer = 1.0;
      soundManager.playWraithChime();

      // Heal player and restore arrows
      this.player.heal(120);
      this.player.stats.arrows = Math.min(this.player.stats.maxArrows, this.player.stats.arrows + 3);

      // If enemy is broken (low HP), brand him into our army!
      if (targetOrc.data.health <= targetOrc.data.maxHealth * 0.35 || targetOrc.stunTimer > 0) {
        targetOrc.data.isBranded = true;
        targetOrc.state = 'branded_follow';
        targetOrc.refreshTexture();
        targetOrc.updateHealthBar();
        soundManager.playFanfare();

        if (this.onCaptainBranded) {
          this.onCaptainBranded(targetOrc);
        }
      }
      return true;
    }
    return false;
  }

  // 5. Fire Arrow Shot
  public shootArrow(targetDir: THREE.Vector2) {
    if (this.player.stats.arrows <= 0) return;
    this.player.stats.arrows--;
    soundManager.playBowShoot();

    const bowDmg = this.player.stats.equippedGear.bow.attackPower || 60;

    // Create glowing arrow mesh
    const geo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00e1ff });
    const arrowMesh = new THREE.Mesh(geo, mat);
    arrowMesh.rotation.z = Math.atan2(targetDir.y, targetDir.x) - Math.PI / 2;
    arrowMesh.position.set(this.player.position.x, this.player.position.y, 1.5);
    this.scene.add(arrowMesh);

    const speed = 28;
    this.projectiles.push({
      mesh: arrowMesh,
      position: arrowMesh.position.clone(),
      velocity: new THREE.Vector3(targetDir.x * speed, targetDir.y * speed, 0),
      isAlive: true,
      damage: bowDmg + this.player.stats.level * 6
    });
  }

  // 6. Shadow Strike Teleport Assassination ('X')
  public performShadowStrike(): boolean {
    if (this.player.stats.arrows <= 0) return false;

    // Find enemy closest to cursor / facing within 20 units
    let bestTarget: OrcEntity | null = null;
    let minDist = 22.0;

    for (const orc of this.orcs) {
      if (orc.state === 'dead' || orc.data.isBranded) continue;
      const d = Math.hypot(orc.position.x - this.player.position.x, orc.position.y - this.player.position.y);
      if (d < minDist) {
        minDist = d;
        bestTarget = orc;
      }
    }

    if (bestTarget) {
      this.player.stats.arrows--;
      soundManager.playShadowStrike();
      this.renderer.triggerScreenShake(0.5);

      // Instant teleport to behind the enemy
      this.player.position.set(bestTarget.position.x - 1.2, bestTarget.position.y - 0.5, 1.5);
      this.player.mesh.position.copy(this.player.position);

      // Massive shadow strike damage
      const shadowDmg = (this.player.stats.equippedGear.dagger.attackPower || 75) * 2.5;
      const res = bestTarget.takeDamage(shadowDmg, false, true);
      if (res.died) {
        this.handleOrcDeath(bestTarget);
      }
      return true;
    }
    return false;
  }

  // 7. Explode Grog Barrel
  private explodeGrogBarrel(barrel: any) {
    barrel.isTriggered = true;
    barrel.mesh.visible = false;
    soundManager.playImpact();
    this.renderer.triggerScreenShake(0.8);

    // Fire & poison explosion effect
    const explLight = new THREE.PointLight(0x44ff22, 5, 15);
    explLight.position.copy(barrel.position);
    this.scene.add(explLight);
    setTimeout(() => this.scene.remove(explLight), 500);

    // Damage all nearby orcs
    for (const orc of this.orcs) {
      if (orc.state === 'dead') continue;
      const d = propDistance(orc.position, barrel.position);
      if (d < 7.0) {
        const res = orc.takeDamage(200, true); // Fire damage!
        if (res.died) {
          this.handleOrcDeath(orc);
        }
      }
    }
  }

  // Orc Death & Loot Drop Generation
  private handleOrcDeath(orc: OrcEntity) {
    soundManager.playOrcGrunt(0.7);
    this.player.gainXP(orc.data.level * 100);
    this.player.stats.mirian += orc.data.level * 25;

    // Generate random gear drop
    const rarityPool: GearItem['rarity'][] = ['Common', 'Common', 'Rare', 'Epic'];
    if (orc.data.rank === 'Warchief' || orc.data.rank === 'Overlord') {
      rarityPool.push('Legendary', 'Legendary');
    }
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    const types: GearItem['type'][] = ['sword', 'dagger', 'bow', 'armor', 'cloak', 'ring'];
    const gearType = types[Math.floor(Math.random() * types.length)];

    const loot: GearItem = {
      id: 'drop_' + Math.random().toString(36).substring(2, 9),
      name: `${orc.data.name}'s ${gearType.toUpperCase()}`,
      type: gearType,
      rarity,
      level: orc.data.level,
      attackPower: ['sword', 'dagger', 'bow', 'ring'].includes(gearType) ? 50 + orc.data.level * 8 : undefined,
      defense: ['armor', 'cloak'].includes(gearType) ? 35 + orc.data.level * 5 : undefined,
      perk: `Forged in the blood of ${orc.data.title}. Grants +${orc.data.level * 3}% extra damage against ${orc.data.tribe} tribe.`,
      iconName: gearType
    };

    if (this.onLootDrop) {
      this.onLootDrop(loot, orc.position);
    }
    if (this.onCaptainDefeated) {
      this.onCaptainDefeated(orc);
    }
  }

  public update(delta: number) {
    // Update Arrow Projectiles
    for (const p of this.projectiles) {
      if (!p.isAlive) continue;
      p.position.addScaledVector(p.velocity, delta);
      p.mesh.position.copy(p.position);

      // Hit detection against orcs
      for (const orc of this.orcs) {
        if (orc.state === 'dead' || orc.data.isBranded) continue;
        const d = Math.hypot(orc.position.x - p.position.x, orc.position.y - p.position.y);
        if (d < 1.8) {
          p.isAlive = false;
          this.scene.remove(p.mesh);

          const res = orc.takeDamage(p.damage);
          soundManager.playImpact();
          if (res.died) {
            this.handleOrcDeath(orc);
          }
          break;
        }
      }

      // Hit detection against Grog Barrels
      for (const prop of this.worldMap.props) {
        if (prop.type === 'grog_barrel' && !prop.isTriggered) {
          const d = prop.position.distanceTo(p.position);
          if (d < 1.8) {
            p.isAlive = false;
            this.scene.remove(p.mesh);
            this.explodeGrogBarrel(prop);
            break;
          }
        }
      }

      // Max range check
      if (p.position.distanceTo(this.player.position) > 40) {
        p.isAlive = false;
        this.scene.remove(p.mesh);
      }
    }

    this.projectiles = this.projectiles.filter(p => p.isAlive);
  }
}

function propDistance(a: THREE.Vector3, b: THREE.Vector3) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
