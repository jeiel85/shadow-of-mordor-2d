import { Player } from '../entities/Player';
import { GearItem } from '../nemesis/NemesisTypes';
import { soundManager } from '../audio/SoundManager';

export class InventoryScreen {
  private container: HTMLElement;
  private player: Player;
  private selectedItem: GearItem | null = null;

  constructor(player: Player) {
    this.player = player;
    this.container = document.createElement('div');
    this.container.id = 'inventory-screen';
    this.container.className = 'modal-overlay hidden';
    document.body.appendChild(this.container);
  }

  public show() {
    this.container.classList.remove('hidden');
    this.render();
  }

  public hide() {
    this.container.classList.add('hidden');
    this.selectedItem = null;
  }

  public toggle() {
    if (this.container.classList.contains('hidden')) {
      this.show();
    } else {
      this.hide();
    }
  }

  private render() {
    const p = this.player.stats;
    const eq = p.equippedGear;

    this.container.innerHTML = `
      <div class="inventory-window">
        <div class="inv-header">
          <div class="inv-title">
            <h2>INVENTORY & FORGE</h2>
            <span class="inv-currency">🪙 ${p.mirian} Mirian • Level ${p.level} Ranger</span>
          </div>
          <button class="close-btn" id="inv-close-btn">&times;</button>
        </div>

        <div class="inv-body">
          <!-- Equipped Column -->
          <div class="equipped-panel">
            <h3>EQUIPPED WEAPONS & ARMOR</h3>
            <div class="equipment-slots">
              ${this.renderSlot('Sword', eq.sword)}
              ${this.renderSlot('Dagger', eq.dagger)}
              ${this.renderSlot('Bow', eq.bow)}
              ${this.renderSlot('Armor', eq.armor)}
              ${this.renderSlot('Cloak', eq.cloak)}
              ${this.renderSlot('Ring', eq.ring)}
            </div>
          </div>

          <!-- Backpack Column -->
          <div class="backpack-panel">
            <h3>LOOT BAG (${this.player.inventory.length} items)</h3>
            <div class="loot-grid">
              ${this.player.inventory.length > 0 
                ? this.player.inventory.map(item => this.renderLootItem(item)).join('')
                : '<div class="empty-inventory">No spare loot. Defeat Orc Captains to claim legendary weapons!</div>'
              }
            </div>

            <!-- Item Detail & Reforge Card -->
            <div class="item-detail-box" id="inv-detail-box">
              ${this.selectedItem ? this.renderItemDetail(this.selectedItem) : '<div class="empty-hint">Select any gear to view stats, equip, or upgrade at the Forge.</div>'}
            </div>
          </div>
        </div>
      </div>
    `;

    // Listeners
    document.getElementById('inv-close-btn')?.addEventListener('click', () => this.hide());

    // Slot & item clicks
    this.container.querySelectorAll('.gear-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const found = Object.values(this.player.stats.equippedGear).find(g => g.id === id) ||
                      this.player.inventory.find(g => g.id === id);
        if (found) {
          this.selectedItem = found;
          soundManager.playSlash();
          this.render();
        }
      });
    });

    // Equip button
    document.getElementById('btn-equip-item')?.addEventListener('click', () => {
      if (this.selectedItem) {
        this.equipItem(this.selectedItem);
        soundManager.playFanfare();
        this.render();
      }
    });

    // Reforge / Upgrade button
    document.getElementById('btn-reforge-item')?.addEventListener('click', () => {
      if (this.selectedItem && this.player.stats.mirian >= 150) {
        this.player.stats.mirian -= 150;
        this.selectedItem.level++;
        if (this.selectedItem.attackPower) this.selectedItem.attackPower += 12;
        if (this.selectedItem.defense) this.selectedItem.defense += 8;
        this.player.saveStats();
        soundManager.playParry();
        this.render();
      }
    });
  }

  private renderSlot(label: string, item: GearItem): string {
    return `
      <div class="equipment-slot">
        <span class="slot-name">${label}</span>
        <div class="gear-item-card rarity-${item.rarity.toLowerCase()} ${this.selectedItem?.id === item.id ? 'selected' : ''}" data-id="${item.id}">
          <div class="gear-title">${item.name}</div>
          <div class="gear-power">
            ${item.attackPower ? `⚔ ${item.attackPower} DMG` : `🛡 ${item.defense} DEF`} • Lv.${item.level}
          </div>
        </div>
      </div>
    `;
  }

  private renderLootItem(item: GearItem): string {
    return `
      <div class="gear-item-card rarity-${item.rarity.toLowerCase()} ${this.selectedItem?.id === item.id ? 'selected' : ''}" data-id="${item.id}">
        <div class="gear-title">${item.name}</div>
        <div class="gear-power">
          ${item.attackPower ? `⚔ ${item.attackPower}` : `🛡 ${item.defense}`} • ${item.rarity}
        </div>
      </div>
    `;
  }

  private renderItemDetail(item: GearItem): string {
    const isEquipped = Object.values(this.player.stats.equippedGear).some(g => g.id === item.id);
    const upgradeCost = 150;
    const canAfford = this.player.stats.mirian >= upgradeCost;

    return `
      <div class="detail-wrap">
        <div class="item-name rarity-${item.rarity.toLowerCase()}">${item.name} (${item.rarity})</div>
        <div class="item-stat">
          ${item.attackPower ? `Base Attack Power: <strong>${item.attackPower}</strong>` : `Defense Rating: <strong>${item.defense}</strong>`}
          • Level ${item.level}
        </div>
        <div class="item-perk">${item.perk}</div>

        <div class="item-actions">
          ${!isEquipped ? `<button class="btn-action equip" id="btn-equip-item">EQUIP ITEM</button>` : `<span class="equipped-tag">CURRENTLY EQUIPPED</span>`}
          <button class="btn-action reforge ${!canAfford ? 'disabled' : ''}" id="btn-reforge-item">
            FORGE UPGRADE (150 🪙)
          </button>
        </div>
      </div>
    `;
  }

  private equipItem(item: GearItem) {
    const type = item.type;
    const current = this.player.stats.equippedGear[type];
    
    // Swap
    this.player.stats.equippedGear[type] = item;
    this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
    this.player.inventory.push(current);
    this.player.saveStats();
  }
}
