import * as THREE from 'three';
import { OrcAppearance } from '../nemesis/NemesisTypes';

export class AssetGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // Helper to create a pixelated canvas texture
  private static makeTexture(width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // --- TERRAIN & ENVIRONMENT TILES ---

  // Dark Mordor Volcanic Rock / Soil
  public static getTerrainTexture(): THREE.CanvasTexture {
    const key = 'terrain_ground';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(64, 64, (ctx) => {
      // Base dark earthy ground
      ctx.fillStyle = '#221e1b';
      ctx.fillRect(0, 0, 64, 64);

      // Cracks and pebbles
      ctx.fillStyle = '#171412';
      for (let i = 0; i < 40; i++) {
        const x = (i * 17) % 64;
        const y = (i * 29) % 64;
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.fillStyle = '#322c28';
      for (let i = 0; i < 30; i++) {
        const x = (i * 23) % 64;
        const y = (i * 37) % 64;
        ctx.fillRect(x, y, 3, 2);
      }
      // Lava fissures
      ctx.fillStyle = '#d94b18';
      ctx.fillRect(12, 18, 4, 1);
      ctx.fillRect(15, 19, 6, 1);
      ctx.fillRect(20, 20, 3, 1);
      ctx.fillStyle = '#ff9922';
      ctx.fillRect(15, 19, 3, 1);
    });

    this.cache.set(key, tex);
    return tex;
  }

  // Stone Fortress Wall Tile
  public static getFortressWallTexture(): THREE.CanvasTexture {
    const key = 'fortress_wall';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(64, 64, (ctx) => {
      ctx.fillStyle = '#1e2229';
      ctx.fillRect(0, 0, 64, 64);

      // Stone brick lines
      ctx.fillStyle = '#121418';
      for (let y = 0; y < 64; y += 16) {
        ctx.fillRect(0, y, 64, 2);
        const offset = (y / 16) % 2 === 0 ? 0 : 16;
        for (let x = offset; x < 64; x += 32) {
          ctx.fillRect(x, y, 2, 16);
        }
      }

      // Highlights on bricks
      ctx.fillStyle = '#2f3642';
      for (let y = 2; y < 64; y += 16) {
        ctx.fillRect(2, y, 14, 1);
        ctx.fillRect(34, y, 14, 1);
      }
      // Spikes / Mordor barbs at top
      ctx.fillStyle = '#0a0a0c';
      for (let x = 4; x < 64; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 4, 8);
        ctx.lineTo(x - 4, 8);
        ctx.fill();
      }
    });

    this.cache.set(key, tex);
    return tex;
  }

  // Scorched Grass / Tall Stealth Bush
  public static getStealthBushTexture(): THREE.CanvasTexture {
    const key = 'stealth_bush';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(48, 48, (ctx) => {
      ctx.clearRect(0, 0, 48, 48);

      // Dark withered tall grass cluster
      const colors = ['#223318', '#384f24', '#4e6d33', '#16220f'];
      for (let i = 0; i < 28; i++) {
        const x = 6 + (i * 3) % 36;
        const h = 18 + ((i * 7) % 20);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 46);
        ctx.quadraticCurveTo(x + (i % 2 === 0 ? 4 : -4), 46 - h / 2, x + (i % 3 === 0 ? 6 : -3), 46 - h);
        ctx.stroke();
      }
    });

    this.cache.set(key, tex);
    return tex;
  }

  // Grog Barrel (Explosive Hazard)
  public static getGrogBarrelTexture(): THREE.CanvasTexture {
    const key = 'grog_barrel';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(32, 32, (ctx) => {
      ctx.clearRect(0, 0, 32, 32);

      // Wooden barrel body
      ctx.fillStyle = '#5c381e';
      ctx.fillRect(6, 6, 20, 24);
      ctx.fillStyle = '#3b2210';
      ctx.fillRect(8, 6, 3, 24);
      ctx.fillRect(21, 6, 3, 24);

      // Iron hoops
      ctx.fillStyle = '#1c1f24';
      ctx.fillRect(5, 8, 22, 3);
      ctx.fillRect(5, 24, 22, 3);

      // Toxic Grog skull mark (toxic poison / explosive)
      ctx.fillStyle = '#44ff22';
      ctx.fillRect(13, 14, 6, 5);
      ctx.fillRect(14, 19, 4, 3);
      // Skull eyes
      ctx.fillStyle = '#1c1f24';
      ctx.fillRect(14, 15, 1, 1);
      ctx.fillRect(17, 15, 1, 1);
    });

    this.cache.set(key, tex);
    return tex;
  }

  // Torch / Fire Brazier
  public static getTorchTexture(): THREE.CanvasTexture {
    const key = 'torch_brazier';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(32, 48, (ctx) => {
      ctx.clearRect(0, 0, 32, 48);

      // Iron pole & bowl
      ctx.fillStyle = '#15171a';
      ctx.fillRect(14, 20, 4, 28);
      ctx.fillRect(10, 42, 12, 4);

      // Brazier basket
      ctx.fillStyle = '#2c3138';
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(24, 16);
      ctx.lineTo(20, 24);
      ctx.lineTo(12, 24);
      ctx.fill();

      // Flame core
      ctx.fillStyle = '#ff3300';
      ctx.beginPath();
      ctx.arc(16, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(16, 11, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff66';
      ctx.beginPath();
      ctx.arc(16, 10, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    this.cache.set(key, tex);
    return tex;
  }

  // --- PLAYER SPRITE (Talion / Bright Lord) ---
  public static getPlayerSpriteTexture(frame: 'idle' | 'walk' | 'attack' | 'aim' | 'drain'): THREE.CanvasTexture {
    const key = `player_${frame}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(48, 64, (ctx) => {
      ctx.clearRect(0, 0, 48, 64);

      // Flowing Dark Ranger Cloak
      ctx.fillStyle = '#1d2228';
      ctx.beginPath();
      ctx.moveTo(16, 20);
      ctx.lineTo(32, 20);
      ctx.lineTo(38, 56);
      ctx.lineTo(10, 56);
      ctx.fill();

      // Tunic / Armor
      ctx.fillStyle = '#39404a';
      ctx.fillRect(18, 22, 12, 18);
      ctx.fillStyle = '#272b32';
      ctx.fillRect(20, 24, 8, 14);

      // Boots & Trousers
      ctx.fillStyle = '#2b1f18';
      if (frame === 'walk') {
        ctx.fillRect(16, 42, 5, 14);
        ctx.fillRect(27, 40, 5, 14);
      } else {
        ctx.fillRect(17, 42, 5, 14);
        ctx.fillRect(26, 42, 5, 14);
      }

      // Head & Hair
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(20, 10, 8, 8); // Face
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(18, 8, 12, 5); // Hair
      ctx.fillRect(17, 10, 3, 6);

      // Wraith glowing eyes (Celebrimbor blue)
      ctx.fillStyle = '#44d2ff';
      ctx.fillRect(22, 13, 2, 2);
      ctx.fillRect(26, 13, 2, 2);

      // Arms & Weapons
      if (frame === 'attack') {
        // Slashing Urfael sword with glowing arc
        ctx.strokeStyle = '#6fe7ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(24, 28, 22, -0.4, Math.PI * 0.7);
        ctx.stroke();

        ctx.fillStyle = '#ddf6ff';
        ctx.fillRect(34, 16, 12, 3); // Sword blade
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(30, 16, 4, 3); // Hilt
      } else if (frame === 'aim') {
        // Azkâr Bow drawn
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(32, 24, 14, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();

        // Glowing blue wraith arrow
        ctx.fillStyle = '#00e1ff';
        ctx.fillRect(24, 23, 16, 2);
      } else if (frame === 'drain') {
        // Wraith Hand stretched out with blue corona
        ctx.fillStyle = '#00c3ff';
        ctx.beginPath();
        ctx.arc(36, 24, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(36, 24, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Default: sword sheathed, arm at side
        ctx.fillStyle = '#9aa0a6';
        ctx.fillRect(14, 24, 3, 16);
      }
    });

    this.cache.set(key, tex);
    return tex;
  }

  // --- DYNAMIC ORC SPRITE GENERATION ---
  public static getOrcSpriteTexture(app: OrcAppearance, isBranded: boolean, isEnraged: boolean): THREE.CanvasTexture {
    const key = `orc_${app.skinColor}_${app.armorColor}_${app.helmetStyle}_${app.weaponType}_${app.scar}_${isBranded}_${isEnraged}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(64, 64, (ctx) => {
      ctx.clearRect(0, 0, 64, 64);

      // Body / Muscular Torso
      ctx.fillStyle = app.skinColor;
      ctx.fillRect(20, 20, 24, 20); // Thick orc chest

      // Heavy Armor / Harness
      ctx.fillStyle = app.armorColor;
      ctx.fillRect(19, 22, 26, 16);
      ctx.fillStyle = '#111113';
      ctx.fillRect(22, 24, 20, 3); // Spiked belt

      // Legs
      ctx.fillStyle = '#221914';
      ctx.fillRect(21, 40, 8, 16);
      ctx.fillRect(35, 40, 8, 16);
      // Iron boots
      ctx.fillStyle = app.armorColor;
      ctx.fillRect(20, 50, 10, 6);
      ctx.fillRect(34, 50, 10, 6);

      // Head
      ctx.fillStyle = app.skinColor;
      ctx.fillRect(23, 10, 18, 13);
      // Heavy lower jaw with tusks
      ctx.fillRect(21, 16, 22, 7);
      ctx.fillStyle = '#f0ecd9';
      ctx.fillRect(23, 15, 3, 4); // Left tusk
      ctx.fillRect(38, 15, 3, 4); // Right tusk

      // Eyes
      if (isBranded) {
        ctx.fillStyle = '#38e1ff'; // Glowing Wraith Blue when branded!
      } else if (isEnraged) {
        ctx.fillStyle = '#ff1100'; // Fiery red glowing eyes when enraged!
      } else {
        ctx.fillStyle = '#ff8800'; // Sauron yellow/orange
      }
      ctx.fillRect(26, 13, 3, 2);
      ctx.fillRect(35, 13, 3, 2);

      // Helmet Styles
      if (app.helmetStyle === 'horned') {
        ctx.fillStyle = '#2d3138';
        ctx.fillRect(21, 7, 22, 6);
        // Spiked horns
        ctx.fillStyle = '#e8dec8';
        ctx.fillRect(17, 2, 4, 10);
        ctx.fillRect(43, 2, 4, 10);
      } else if (app.helmetStyle === 'iron_mask') {
        ctx.fillStyle = '#1c1e22';
        ctx.fillRect(20, 8, 24, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(25, 12, 14, 3); // Visor slit
      } else if (app.helmetStyle === 'skull') {
        ctx.fillStyle = '#e3ded1';
        ctx.fillRect(21, 5, 22, 8);
        ctx.fillStyle = '#1a1917';
        ctx.fillRect(24, 8, 4, 4);
        ctx.fillRect(36, 8, 4, 4);
      }

      // War Paint
      if (app.warPaintColor) {
        ctx.fillStyle = app.warPaintColor;
        ctx.fillRect(24, 11, 4, 8);
        ctx.fillRect(36, 11, 4, 8);
        ctx.fillRect(28, 25, 8, 8);
      }

      // Scars
      if (app.scar === 'burn') {
        ctx.fillStyle = '#2b1c19';
        ctx.fillRect(33, 11, 8, 10);
        ctx.fillStyle = '#d64d29';
        ctx.fillRect(35, 13, 4, 4);
      } else if (app.scar === 'iron_jaw') {
        ctx.fillStyle = '#6a727d';
        ctx.fillRect(21, 18, 22, 6);
        ctx.fillStyle = '#111';
        ctx.fillRect(25, 20, 2, 3);
        ctx.fillRect(31, 20, 2, 3);
        ctx.fillRect(37, 20, 2, 3);
      }

      // Weapons
      ctx.fillStyle = '#7a818c';
      if (app.weaponType === 'two_handed_axe') {
        // Massive battle axe
        ctx.fillStyle = '#523725';
        ctx.fillRect(48, 10, 4, 44); // Handle
        ctx.fillStyle = '#8f98a3';
        ctx.fillRect(42, 8, 16, 12); // Axe blade
      } else if (app.weaponType === 'heavy_mace') {
        ctx.fillStyle = '#4a3629';
        ctx.fillRect(48, 14, 4, 38);
        ctx.fillStyle = '#202226';
        ctx.fillRect(44, 8, 12, 12); // Spiked mace head
      } else {
        // Serrated Orc Scimitar
        ctx.fillStyle = '#9aa1ab';
        ctx.fillRect(48, 16, 4, 28);
        ctx.fillRect(46, 20, 8, 3);
      }

      // Branded Hand Mark on armor if branded
      if (isBranded) {
        ctx.fillStyle = '#00e1ff';
        ctx.fillRect(30, 26, 4, 6);
        ctx.fillRect(29, 29, 6, 2);
      }
    });

    this.cache.set(key, tex);
    return tex;
  }

  // --- CARAGOR / BEAST SPRITE ---
  public static getCaragorTexture(): THREE.CanvasTexture {
    const key = 'beast_caragor';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const tex = this.makeTexture(64, 48, (ctx) => {
      ctx.clearRect(0, 0, 64, 48);

      // Predatory quadruped body
      ctx.fillStyle = '#453833';
      ctx.fillRect(14, 16, 32, 16);

      // Spine ridges
      ctx.fillStyle = '#211a18';
      for (let x = 18; x < 42; x += 5) {
        ctx.fillRect(x, 13, 3, 4);
      }

      // Legs
      ctx.fillStyle = '#382d29';
      ctx.fillRect(16, 30, 6, 14);
      ctx.fillRect(38, 30, 6, 14);

      // Fanged Beast Head
      ctx.fillStyle = '#453833';
      ctx.fillRect(42, 12, 16, 14);
      ctx.fillStyle = '#f7f4ea';
      ctx.fillRect(52, 22, 4, 6); // Saber tusks

      // Red glowing eyes
      ctx.fillStyle = '#ff2b00';
      ctx.fillRect(48, 14, 3, 2);
    });

    this.cache.set(key, tex);
    return tex;
  }
}
