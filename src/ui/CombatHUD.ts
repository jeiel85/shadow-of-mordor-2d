import { Player } from '../entities/Player';
import { OrcEntity } from '../entities/OrcEntity';
import { NemesisHierarchy } from '../nemesis/NemesisHierarchy';

export class CombatHUD {
  private container: HTMLElement;
  private player: Player;
  private hierarchy: NemesisHierarchy;
  private orcs: OrcEntity[] = [];
  private minimapCanvas!: HTMLCanvasElement;
  private minimapCtx!: CanvasRenderingContext2D;

  constructor(player: Player, hierarchy: NemesisHierarchy) {
    this.player = player;
    this.hierarchy = hierarchy;

    this.container = document.createElement('div');
    this.container.id = 'combat-hud';
    this.container.className = 'combat-hud';
    document.body.appendChild(this.container);

    this.renderInitialHTML();
    this.initMinimap();
  }

  public registerOrcs(orcs: OrcEntity[]) {
    this.orcs = orcs;
  }

  private renderInitialHTML() {
    this.container.innerHTML = `
      <!-- Top Left: Bright Lord Vitals -->
      <div class="hud-vitals">
        <div class="player-badge">
          <span class="player-lvl" id="hud-lvl">Lv.1</span>
          <div class="player-name-wrap">
            <span class="player-title">TALION & CELEBRIMBOR</span>
            <span class="player-sub">The Bright Lord</span>
          </div>
        </div>

        <!-- Health Bar -->
        <div class="bar-row">
          <span class="bar-label">HP</span>
          <div class="bar-frame">
            <div class="bar-fill hp" id="hud-hp-bar" style="width: 100%;"></div>
            <span class="bar-num" id="hud-hp-val">300 / 300</span>
          </div>
        </div>

        <!-- Wrath Bar (Elven Rage) -->
        <div class="bar-row">
          <span class="bar-label">WRATH</span>
          <div class="bar-frame wrath-frame">
            <div class="bar-fill wrath" id="hud-wrath-bar" style="width: 0%;"></div>
            <span class="bar-num" id="hud-wrath-val">0%</span>
          </div>
        </div>

        <!-- Focus & Arrows -->
        <div class="hud-row-flex">
          <div class="focus-wrap">
            <span class="bar-label">FOCUS</span>
            <div class="bar-frame mini">
              <div class="bar-fill focus" id="hud-focus-bar" style="width: 100%;"></div>
            </div>
          </div>
          <div class="arrow-wrap">
            <span class="bar-label">ARROWS</span>
            <span class="arrow-count" id="hud-arrows">🏹 6 / 6</span>
          </div>
        </div>

        <!-- Mirian & XP -->
        <div class="hud-currency">
          <span id="hud-mirian">🪙 200 Mirian</span>
          <span id="hud-xp">XP: 0 / 500</span>
        </div>
      </div>

      <!-- Center Dynamic Alerts & Combo -->
      <div class="hud-center-alert" id="hud-alert"></div>
      <div class="hud-combo" id="hud-combo" style="display: none;">
        <span class="combo-num" id="hud-combo-hits">0</span>
        <span class="combo-text">HIT STREAK</span>
      </div>

      <!-- Top Right: Minimap & Objective -->
      <div class="hud-top-right">
        <div class="objective-card">
          <div class="obj-header">CAMPAIGN OBJECTIVE</div>
          <div class="obj-text" id="hud-objective">
            Conquer the Citadel of Cirith Gorgor<br/>
            • Slay or Brand 3 Warchiefs<br/>
            • Confront Overlord Az-Galg
          </div>
        </div>
        <div class="minimap-frame">
          <canvas id="minimap-canvas" width="140" height="140"></canvas>
        </div>
      </div>

      <!-- Bottom Center: Action Keybindings -->
      <div class="hud-hotbars">
        <div class="hotkey-btn" title="Left Click"><span class="key">L-CLICK</span> Attack</div>
        <div class="hotkey-btn" title="Right Click or Space"><span class="key">SPACE</span> Counter</div>
        <div class="hotkey-btn" title="Shift"><span class="key">SHIFT</span> Dodge</div>
        <div class="hotkey-btn" title="Q"><span class="key">Q</span> Aim Bow</div>
        <div class="hotkey-btn" title="E"><span class="key">E</span> Drain / Brand</div>
        <div class="hotkey-btn" id="hk-exec" title="F"><span class="key">F</span> Execution</div>
        <div class="hotkey-btn" title="X"><span class="key">X</span> Shadow Strike</div>
        <div class="hotkey-btn" title="B"><span class="key">B</span> Bodyguard</div>
        <div class="hotkey-btn menu-btn" id="hk-nemesis"><span class="key">M</span> Army Screen</div>
        <div class="hotkey-btn menu-btn" id="hk-inv"><span class="key">I</span> Inventory</div>
      </div>
    `;
  }

  private initMinimap() {
    this.minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    if (this.minimapCanvas) {
      this.minimapCtx = this.minimapCanvas.getContext('2d')!;
    }
  }

  public showAlert(text: string, durationMs: number = 3000) {
    const alertBox = document.getElementById('hud-alert');
    if (!alertBox) return;
    alertBox.innerHTML = text;
    alertBox.style.opacity = '1';
    setTimeout(() => {
      alertBox.style.opacity = '0';
    }, durationMs);
  }

  public update() {
    const s = this.player.stats;

    // HP Bar
    const hpPct = Math.max(0, (s.health / s.maxHealth) * 100);
    const hpBar = document.getElementById('hud-hp-bar');
    const hpVal = document.getElementById('hud-hp-val');
    if (hpBar) hpBar.style.width = `${hpPct}%`;
    if (hpVal) hpVal.innerText = `${s.health} / ${s.maxHealth}`;

    // Wrath Bar
    const wrathBar = document.getElementById('hud-wrath-bar');
    const wrathVal = document.getElementById('hud-wrath-val');
    const execBtn = document.getElementById('hk-exec');
    if (wrathBar) {
      wrathBar.style.width = `${s.wrath}%`;
      if (s.wrath >= 100) {
        wrathBar.classList.add('ready');
        if (wrathVal) wrathVal.innerText = 'EXECUTION READY!';
        if (execBtn) execBtn.classList.add('ready-pulse');
      } else {
        wrathBar.classList.remove('ready');
        if (wrathVal) wrathVal.innerText = `${Math.floor(s.wrath)}%`;
        if (execBtn) execBtn.classList.remove('ready-pulse');
      }
    }

    // Focus & Arrows
    const focusBar = document.getElementById('hud-focus-bar');
    if (focusBar) focusBar.style.width = `${s.focus}%`;

    const arrowsEl = document.getElementById('hud-arrows');
    if (arrowsEl) arrowsEl.innerText = `🏹 ${s.arrows} / ${s.maxArrows}`;

    // Level, XP, Mirian
    const lvlEl = document.getElementById('hud-lvl');
    if (lvlEl) lvlEl.innerText = `Lv.${s.level}`;

    const mirianEl = document.getElementById('hud-mirian');
    if (mirianEl) mirianEl.innerText = `🪙 ${s.mirian} Mirian`;

    const xpEl = document.getElementById('hud-xp');
    if (xpEl) xpEl.innerText = `XP: ${s.xp} / ${s.nextLevelXp}`;

    // Combo Counter
    const comboWrap = document.getElementById('hud-combo');
    const comboHits = document.getElementById('hud-combo-hits');
    if (comboWrap && comboHits) {
      if (s.comboHits >= 2) {
        comboWrap.style.display = 'block';
        comboHits.innerText = `${s.comboHits}x`;
      } else {
        comboWrap.style.display = 'none';
      }
    }

    // Update Objective text
    const deadWcs = this.hierarchy.warchiefs.filter(w => w.isDead || w.isBranded).length;
    const objEl = document.getElementById('hud-objective');
    if (objEl) {
      if (this.hierarchy.overlord.isDead) {
        objEl.innerHTML = `<span style="color: #00ffaa; font-weight: bold;">★ VICTORY! CIRITH GORGOR HAS FALLEN!</span><br/>Appoint a new Overlord in the Army screen!`;
      } else {
        objEl.innerHTML = `
          Citadel Siege: Cirith Gorgor<br/>
          • Warchiefs Subdued: ${deadWcs} / 3<br/>
          • Citadel Overlord: ${this.hierarchy.overlord.name} ${this.hierarchy.overlord.title} (Lv.${this.hierarchy.overlord.level})
        `;
      }
    }

    this.drawMinimap();
  }

  private drawMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.fillStyle = 'rgba(15, 12, 18, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // World bounds mapping (-60..60 to 0..w)
    const mapRange = 120;
    const toMapX = (wx: number) => ((wx + 60) / mapRange) * w;
    const toMapY = (wy: number) => ((wy + 60) / mapRange) * h;

    // Draw Citadel Wall Outline
    ctx.strokeStyle = '#443b4f';
    ctx.lineWidth = 2;
    ctx.strokeRect(toMapX(-40), toMapY(-55), (80 / mapRange) * w, (45 / mapRange) * h);

    // Draw Haedir Tower in South
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(toMapX(0), toMapY(45), 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Orcs
    for (const orc of this.orcs) {
      if (orc.state === 'dead') continue;
      const ox = toMapX(orc.position.x);
      const oy = toMapY(orc.position.y);

      if (orc.data.isBranded) {
        ctx.fillStyle = '#00e1ff'; // Cyan for branded allies
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (orc.data.rank === 'Overlord') {
        ctx.fillStyle = '#ffaa00'; // Gold for Overlord
        ctx.beginPath();
        ctx.arc(ox, oy, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (orc.data.rank === 'Warchief') {
        ctx.fillStyle = '#ff4400'; // Orange for Warchief
        ctx.beginPath();
        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ee2222'; // Red for Captain
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Player
    const px = toMapX(this.player.position.x);
    const py = toMapY(this.player.position.y);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Player vision direction cone
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + this.player.facing.x * 10, py + this.player.facing.y * 10);
    ctx.stroke();
  }
}
