import * as THREE from 'three';
import { GameRenderer } from './engine/Renderer';
import { WorldMap } from './world/WorldMap';
import { NemesisHierarchy } from './nemesis/NemesisHierarchy';
import { Player } from './entities/Player';
import { OrcEntity } from './entities/OrcEntity';
import { CombatSystem } from './combat/CombatSystem';
import { CombatHUD } from './ui/CombatHUD';
import { NemesisArmyScreen } from './ui/NemesisArmyScreen';
import { InventoryScreen } from './ui/InventoryScreen';
import { DialogueOverlay } from './ui/DialogueOverlay';
import { soundManager } from './audio/SoundManager';
import { OrcCaptain } from './nemesis/NemesisTypes';

class Game {
  private renderer: GameRenderer;
  private worldMap: WorldMap;
  private hierarchy: NemesisHierarchy;
  private player: Player;
  private orcEntities: OrcEntity[] = [];
  private combatSystem: CombatSystem;
  
  // UI
  private hud: CombatHUD;
  private armyScreen: NemesisArmyScreen;
  private inventoryScreen: InventoryScreen;
  private dialogueOverlay: DialogueOverlay;

  // Input state
  private keys: Record<string, boolean> = {};
  private mousePos: THREE.Vector2 = new THREE.Vector2();
  private isAimingBow: boolean = false;
  private lastTime: number = performance.now();
  private encounteredOrcIds: Set<string> = new Set();

  constructor() {
    const container = document.getElementById('canvas-container')!;
    this.renderer = new GameRenderer(container);
    this.worldMap = new WorldMap(this.renderer.scene, this.renderer);
    this.hierarchy = new NemesisHierarchy();
    this.player = new Player(this.renderer.scene);

    // Initialize UI
    this.hud = new CombatHUD(this.player, this.hierarchy);
    this.armyScreen = new NemesisArmyScreen(this.hierarchy);
    this.inventoryScreen = new InventoryScreen(this.player);
    this.dialogueOverlay = new DialogueOverlay();

    // Spawn Orc Entities
    this.spawnOrcEntities();

    // Combat System
    this.combatSystem = new CombatSystem(this.renderer.scene, this.player, this.worldMap, this.renderer);
    this.combatSystem.registerOrcs(this.orcEntities);
    this.hud.registerOrcs(this.orcEntities);

    // Setup callbacks
    this.setupCallbacks();
    this.setupInputListeners();

    // Start loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private spawnOrcEntities() {
    const allOrcs = this.hierarchy.getAllOrcs();
    for (const orc of allOrcs) {
      if (!orc.isDead) {
        const entity = new OrcEntity(orc, this.renderer.scene);
        this.orcEntities.push(entity);
      }
    }
  }

  private setupCallbacks() {
    // Loot drop handler
    this.combatSystem.onLootDrop = (item) => {
      this.player.inventory.push(item);
      this.hud.showAlert(`✨ LOOT ACQUIRED: [${item.rarity.toUpperCase()}] ${item.name}!`, 3500);
      soundManager.playFanfare();
    };

    // Captain Defeated
    this.combatSystem.onCaptainDefeated = (orc) => {
      this.hierarchy.onOrcDefeated(orc.data.id);
      this.hud.showAlert(`⚔ CAPTAIN SLAIN: ${orc.data.name} ${orc.data.title}!`, 4000);
      
      if (orc.data.rank === 'Overlord') {
        this.hud.showAlert(`👑 CITADEL OVERLORD DEFEATED! CIRITH GORGOR IS YOURS!`, 6000);
      }
    };

    // Captain Branded
    this.combatSystem.onCaptainBranded = (orc) => {
      this.hierarchy.brandOrc(orc.data.id);
      this.hud.showAlert(`⚡ CAPTAIN DOMINATED: ${orc.data.name} now serves the Bright Lord!`, 4000);
    };

    // Mark target on minimap from army screen
    this.armyScreen.onMarkTarget = (orc) => {
      this.hud.showAlert(`🎯 Target marked: ${orc.name} ${orc.title} (Lv.${orc.level})`, 3000);
    };

    // Hotkey bar buttons
    document.getElementById('hk-nemesis')?.addEventListener('click', () => this.armyScreen.toggle());
    document.getElementById('hk-inv')?.addEventListener('click', () => this.inventoryScreen.toggle());
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      soundManager.ensureAudio();
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      // Hotkey Actions
      if (e.key === 'm' || e.key === 'M') {
        this.armyScreen.toggle();
      }
      if (e.key === 'i' || e.key === 'I') {
        this.inventoryScreen.toggle();
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.combatSystem.performCounter();
      }
      if (e.key === 'f' || e.key === 'F') {
        this.combatSystem.performExecution();
      }
      if (e.key === 'e' || e.key === 'E') {
        this.combatSystem.performDrainOrBrand();
      }
      if (e.key === 'x' || e.key === 'X') {
        this.combatSystem.performShadowStrike();
      }
      if (e.key === 'b' || e.key === 'B') {
        this.summonBodyguard();
      }
      if (e.key === 'q' || e.key === 'Q') {
        this.isAimingBow = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
      if (e.key === 'q' || e.key === 'Q') {
        this.isAimingBow = false;
      }
    });

    // Mouse Controls
    window.addEventListener('mousedown', (e) => {
      soundManager.ensureAudio();
      if (e.button === 0) {
        // Left click: Melee combo or Bow shot if aiming
        if (this.isAimingBow) {
          this.shootBowAtMouse();
        } else {
          this.combatSystem.performMeleeAttack();
        }
      } else if (e.button === 2) {
        // Right click: Counter / Parry
        this.combatSystem.performCounter();
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  private shootBowAtMouse() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mousePos, this.renderer.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.5);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);

    if (target) {
      const dir = new THREE.Vector2(target.x - this.player.position.x, target.y - this.player.position.y).normalize();
      this.combatSystem.shootArrow(dir);
    }
  }

  private summonBodyguard() {
    if (!this.hierarchy.alliedBodyguardId) {
      this.hud.showAlert(`⚠️ No bodyguard assigned! Open Army Screen [M] to assign a Branded Captain.`, 3000);
      return;
    }
    const bgOrc = this.orcEntities.find(o => o.data.id === this.hierarchy.alliedBodyguardId);
    if (bgOrc) {
      bgOrc.position.set(this.player.position.x + 2, this.player.position.y - 1, 1.5);
      bgOrc.mesh.position.copy(bgOrc.position);
      soundManager.playWarHorn();
      this.hud.showAlert(`★ BODYGUARD SUMMONED: ${bgOrc.data.name} has arrived to fight!`, 3000);
    }
  }

  private handlePlayerDeath(killerOrc: OrcEntity) {
    soundManager.playOrcGrunt(0.6);
    this.hud.showAlert(`☠ YOU WERE SLAIN BY ${killerOrc.data.name.toUpperCase()}!`, 5000);
    this.renderer.triggerScreenShake(1.2);

    this.hierarchy.onPlayerKilledByOrc(killerOrc.data.id);

    setTimeout(() => {
      // Respawn at Haedir Tower
      this.player.position.set(0, 42, 1.5);
      this.player.mesh.position.copy(this.player.position);
      this.player.stats.health = this.player.stats.maxHealth;
      this.player.saveStats();
      this.hud.showAlert(`⚡ Resurrected at Haedir Tower. Seek your vengeance!`, 4000);
    }, 2000);
  }

  private gameLoop(time: number) {
    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    // Focus Slow-Motion: If aiming bow, slow world by 75%
    const timeScale = this.isAimingBow && this.player.stats.focus > 5 ? 0.25 : 1.0;
    const worldDelta = delta * timeScale;

    // Process Player Movement Input
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveY += 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    const isDodging = !!this.keys['shift'];
    if (isDodging && this.player.dodgeTimer <= 0) {
      this.player.dodgeTimer = 0.35;
      soundManager.playSlash();
    }

    // Stealth check in bushes
    this.player.isStealthed = this.worldMap.isPlayerInStealth(this.player.position.x, this.player.position.y);

    // Wall collision prevention
    const oldX = this.player.position.x;
    const oldY = this.player.position.y;
    this.player.update(delta, {
      x: moveX,
      y: moveY,
      isAiming: this.isAimingBow,
      isAttacking: this.player.attackTimer > 0,
      isDodging
    });

    if (this.worldMap.checkWallCollision(this.player.position.x, this.player.position.y)) {
      this.player.position.x = oldX;
      this.player.position.y = oldY;
      this.player.mesh.position.copy(this.player.position);
    }

    // Camera follow player
    this.renderer.setFollowTarget(this.player.position.x, this.player.position.y, this.player.position.z);
    this.renderer.update(delta);

    // Update Orc Entities
    let inCombatWithAny = false;
    for (const orc of this.orcEntities) {
      if (orc.state === 'dead') continue;

      const dist = Math.hypot(orc.position.x - this.player.position.x, orc.position.y - this.player.position.y);
      if (dist < 12) inCombatWithAny = true;

      // Proximity encounter cutscene check
      if (dist < 8.0 && !this.encounteredOrcIds.has(orc.data.id) && !orc.data.isBranded) {
        this.encounteredOrcIds.add(orc.data.id);
        this.dialogueOverlay.showEncounter(orc.data);
      }

      const orcResult = orc.update(worldDelta, this.player.position, this.player.isStealthed);
      if (orcResult.willHitPlayer) {
        this.player.takeDamage(orcResult.attackDamage);
        this.renderer.triggerScreenShake(0.6);
        if (this.player.stats.health <= 0) {
          this.handlePlayerDeath(orc);
        }
      }
    }

    soundManager.setInCombat(inCombatWithAny);

    // Update Combat System (Projectiles, etc.)
    this.combatSystem.update(worldDelta);

    // Update HUD
    this.hud.update();

    // Render Scene
    this.renderer.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
