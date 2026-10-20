import { NemesisHierarchy } from '../nemesis/NemesisHierarchy';
import { OrcCaptain } from '../nemesis/NemesisTypes';
import { soundManager } from '../audio/SoundManager';

export class NemesisArmyScreen {
  private container: HTMLElement;
  private hierarchy: NemesisHierarchy;
  private selectedOrc: OrcCaptain | null = null;
  public onMarkTarget?: (orc: OrcCaptain) => void;

  constructor(hierarchy: NemesisHierarchy) {
    this.hierarchy = hierarchy;
    this.container = document.createElement('div');
    this.container.id = 'nemesis-screen';
    this.container.className = 'modal-overlay hidden';
    document.body.appendChild(this.container);
  }

  public show() {
    soundManager.playWarHorn();
    this.container.classList.remove('hidden');
    this.render();
  }

  public hide() {
    this.container.classList.add('hidden');
    this.selectedOrc = null;
  }

  public toggle() {
    if (this.container.classList.contains('hidden')) {
      this.show();
    } else {
      this.hide();
    }
  }

  private render() {
    this.container.innerHTML = `
      <div class="nemesis-window">
        <div class="nemesis-header">
          <div class="header-title">
            <h2>ARMY OF CIRITH GORGOR</h2>
            <span class="subtitle">Middle-earth Nemesis Hierarchy</span>
          </div>
          <div class="header-actions">
            <a class="repo-link" href="https://github.com/jeiel85/shadow-of-mordor-2d" target="_blank" rel="noopener noreferrer" title="View source on GitHub" aria-label="View source on GitHub">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
              <span>GitHub</span>
            </a>
            <button class="close-btn" id="nemesis-close-btn">&times;</button>
          </div>
        </div>

        <div class="nemesis-board">
          <!-- Tier 4: Overlord -->
          <div class="hierarchy-tier overlord-tier">
            <div class="tier-label">CITADEL OVERLORD</div>
            <div class="tier-cards">
              ${this.renderOrcCard(this.hierarchy.overlord)}
            </div>
          </div>

          <!-- Tier 3: Warchiefs -->
          <div class="hierarchy-tier warchief-tier">
            <div class="tier-label">WARCHIEFS</div>
            <div class="tier-cards">
              ${this.hierarchy.warchiefs.map(w => this.renderOrcCard(w)).join('')}
            </div>
          </div>

          <!-- Tier 2 & 1: Captains -->
          <div class="hierarchy-tier captain-tier">
            <div class="tier-label">CAPTAINS & BODYGUARDS</div>
            <div class="tier-cards">
              ${this.hierarchy.captains.map(c => this.renderOrcCard(c)).join('')}
            </div>
          </div>
        </div>

        <!-- Detail Sidebar for Selected Orc -->
        <div class="nemesis-details ${this.selectedOrc ? 'active' : ''}" id="nemesis-details-panel">
          ${this.selectedOrc ? this.renderDetailPanel(this.selectedOrc) : '<div class="empty-hint">Select a Captain to inspect weaknesses, command, or mark.</div>'}
        </div>
      </div>
    `;

    // Event Listeners
    document.getElementById('nemesis-close-btn')?.addEventListener('click', () => this.hide());

    // Card click events
    this.container.querySelectorAll('.orc-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          this.selectedOrc = this.hierarchy.getOrcById(id) || null;
          soundManager.playSlash();
          this.render();
        }
      });
    });

    // Detail action buttons
    document.getElementById('btn-assign-bodyguard')?.addEventListener('click', () => {
      if (this.selectedOrc && this.selectedOrc.isBranded) {
        this.hierarchy.assignPlayerBodyguard(this.selectedOrc.id);
        soundManager.playFanfare();
        this.render();
      }
    });

    document.getElementById('btn-mark-target')?.addEventListener('click', () => {
      if (this.selectedOrc && this.onMarkTarget) {
        this.onMarkTarget(this.selectedOrc);
        this.hide();
      }
    });
  }

  private renderOrcCard(orc: OrcCaptain): string {
    const isSelected = this.selectedOrc?.id === orc.id;
    const isDead = orc.isDead;
    const isBranded = orc.isBranded;
    const isBodyguard = this.hierarchy.alliedBodyguardId === orc.id;
    const isSpy = orc.isSpy;

    let statusBadge = '';
    if (isDead) statusBadge = '<span class="badge dead">SLAIN</span>';
    else if (isBodyguard) statusBadge = '<span class="badge bodyguard">★ BODYGUARD</span>';
    else if (isSpy) statusBadge = '<span class="badge spy">🗡 SPY</span>';
    else if (isBranded) statusBadge = '<span class="badge branded">BRANDED</span>';

    return `
      <div class="orc-card ${isSelected ? 'selected' : ''} ${isDead ? 'dead' : ''} ${isBranded ? 'branded' : ''} rank-${orc.rank.toLowerCase()}" data-id="${orc.id}">
        <div class="card-level">Lv.${orc.level}</div>
        <div class="card-avatar" style="border-color: ${isBranded ? '#00e1ff' : orc.appearance.armorColor};">
          <div class="avatar-head" style="background-color: ${orc.appearance.skinColor};">
            ${orc.appearance.scar !== 'none' ? `<span class="scar-mark">✕</span>` : ''}
          </div>
        </div>
        <div class="card-info">
          <div class="orc-name">${orc.name}</div>
          <div class="orc-title">${orc.title}</div>
          <div class="orc-meta">${orc.tribe} ${orc.orcClass}</div>
        </div>
        ${statusBadge}
      </div>
    `;
  }

  private renderDetailPanel(orc: OrcCaptain): string {
    const isBranded = orc.isBranded;
    const isBodyguard = this.hierarchy.alliedBodyguardId === orc.id;

    return `
      <div class="detail-content">
        <div class="detail-header">
          <h3>${orc.name} ${orc.title}</h3>
          <div class="meta-tag">Level ${orc.level} • ${orc.rank} • ${orc.tribe} Tribe • ${orc.orcClass}</div>
          <div class="power-level">Power Rating: ${orc.power}</div>
        </div>

        <div class="traits-section">
          <div class="trait-group">
            <h4 class="trait-title immunity">IMMUNITIES</h4>
            <div class="trait-tags">
              ${orc.immunities.length > 0 ? orc.immunities.map(i => `<span class="tag imm">${i}</span>`).join('') : '<span class="tag empty">None</span>'}
            </div>
          </div>

          <div class="trait-group">
            <h4 class="trait-title enrage">ENRAGES & HATES</h4>
            <div class="trait-tags">
              ${orc.enrages.length > 0 ? orc.enrages.map(e => `<span class="tag enr">${e}</span>`).join('') : '<span class="tag empty">None</span>'}
            </div>
          </div>

          <div class="trait-group">
            <h4 class="trait-title weakness">WEAKNESSES & FEARS</h4>
            <div class="trait-tags">
              ${orc.weaknesses.length > 0 ? orc.weaknesses.map(w => `<span class="tag weak">${w}</span>`).join('') : '<span class="tag empty">None</span>'}
            </div>
          </div>

          <div class="trait-group">
            <h4 class="trait-title memory">NEMESIS MEMORY</h4>
            <div class="memory-box">
              <div>Encountered: ${orc.memory.timesEncountered} times</div>
              <div>Player Slain by Orc: ${orc.memory.killedPlayerCount} times</div>
              <div>Cheated Death: ${orc.memory.cheatedDeath ? 'YES (Scarred)' : 'No'}</div>
            </div>
          </div>
        </div>

        <div class="command-actions">
          ${isBranded ? `
            <button class="action-btn bodyguard" id="btn-assign-bodyguard">
              ${isBodyguard ? '✓ ACTIVE BODYGUARD' : '★ ASSIGN AS BODYGUARD'}
            </button>
          ` : ''}
          <button class="action-btn mark" id="btn-mark-target">🎯 MARK ON MINIMAP</button>
        </div>
      </div>
    `;
  }
}
