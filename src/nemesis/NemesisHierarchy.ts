import { 
  OrcCaptain, 
  OrcRank, 
  OrcTribe, 
  OrcClass, 
  ImmunityTrait, 
  EnrageTrait, 
  WeaknessTrait, 
  BonusTrait,
  OrcAppearance
} from './NemesisTypes';

const ORC_FIRST_NAMES = [
  'Kûka', 'Tûg', 'Pûg', 'Ar-Gûl', 'Mogg', 'Dûsh', 'Gorgum', 'Flak', 
  'Ratbag', 'Lûrn', 'Horza', 'Skak', 'Bûz', 'Ghash', 'Ogg', 'Zuka', 
  'Krimp', 'Torz', 'Prak', 'Nûzu', 'Az-Galg', 'Dugz'
];

const ORC_TITLES = [
  'the Blood-Spiller', 'Iron-Skin', 'the Poet', 'the Screamer', 'the Cleaver',
  'Bone-Crusher', 'the Poisoner', 'Fire-Bringer', 'the Despoiler', 'the Coward',
  'Beast-Tamer', 'the Man-Eater', 'the Butcher', 'the Defiler', 'Shadow-Stalker',
  'the Drunkard', 'the Machine', 'Grave-Robber', 'the Slaver', 'the Executioner'
];

const TRIBES: OrcTribe[] = ['Dark', 'Feral', 'Machine', 'Marauder', 'Terror', 'Warmonger', 'Slaughter'];
const CLASSES: OrcClass[] = ['Assassin', 'Berserker', 'Commander', 'Destroyer', 'Marksman', 'Slayer', 'Tank', 'Trickster'];
const IMMUNITIES: ImmunityTrait[] = ['Arrow-Proof', 'Execution-Proof', 'Fire-Proof', 'Poison-Proof', 'Frost-Proof', 'Stealth-Proof', 'Vault-Breaker'];
const ENRAGES: EnrageTrait[] = ['Enraged by Injury', 'Enraged by Fire', 'Enraged by Rivals', 'Enraged by Betrayal', 'Bloodlust', 'Vengeful Retaliation'];
const WEAKNESSES: WeaknessTrait[] = ['Fear of Fire', 'Fear of Beasts', 'Fear of Betrayal', 'Vulnerable to Stealth', 'Vulnerable to Ranged', 'Soft Target', 'Dazed by Wraith Blast'];
const BONUSES: BonusTrait[] = ['No Chance', 'Flaming Weapon', 'Poison Claws', 'Cursed Touch', 'Summon Gang', 'Iron Will', 'Thick Skinned'];

const SKIN_COLORS = ['#3d6338', '#4b7342', '#2f4a2b', '#6b5e43', '#85755b', '#39423c', '#573d3d'];
const ARMOR_COLORS = ['#444449', '#2a2a2d', '#7d3a2a', '#342947', '#544627', '#1a1a1c'];
const WAR_PAINTS = [null, '#aa2222', '#eeeeee', '#222222', '#dd8800', '#2266aa'];

export class NemesisHierarchy {
  public overlord: OrcCaptain;
  public warchiefs: OrcCaptain[] = [];
  public captains: OrcCaptain[] = [];
  public alliedBodyguardId: string | null = null;

  constructor() {
    const saved = this.loadFromStorage();
    if (saved) {
      this.overlord = saved.overlord;
      this.warchiefs = saved.warchiefs;
      this.captains = saved.captains;
      this.alliedBodyguardId = saved.alliedBodyguardId;
    } else {
      const generated = this.generateInitialArmy();
      this.overlord = generated.overlord;
      this.warchiefs = generated.warchiefs;
      this.captains = generated.captains;
      this.saveToStorage();
    }
  }

  // Generate complete hierarchy (1 Overlord, 3 Warchiefs, 12 Captains)
  private generateInitialArmy(): { overlord: OrcCaptain; warchiefs: OrcCaptain[]; captains: OrcCaptain[] } {
    // 1 Overlord
    const overlord = this.createOrc('Overlord', 25 + Math.floor(Math.random() * 5));
    overlord.name = 'Az-Galg';
    overlord.title = 'the Fortress Master';
    overlord.worldPosition = { x: 0, y: -45 }; // Citadel throne room

    // 3 Warchiefs
    const warchiefs: OrcCaptain[] = [];
    const warchiefPositions = [
      { x: -28, y: -25 }, // West Gate
      { x: 0, y: -20 },   // Central Courtyard
      { x: 28, y: -25 }   // East Armory
    ];
    for (let i = 0; i < 3; i++) {
      const wc = this.createOrc('Warchief', 18 + Math.floor(Math.random() * 5));
      wc.worldPosition = warchiefPositions[i];
      warchiefs.push(wc);
    }

    // 12 Captains (Scattered in Mordor valley outposts, ruins, and camps)
    const captains: OrcCaptain[] = [];
    const captainPositions = [
      { x: -40, y: 15 }, { x: -20, y: 25 }, { x: 0, y: 35 }, { x: 25, y: 20 },
      { x: 45, y: 10 }, { x: -35, y: 0 }, { x: -15, y: 10 }, { x: 15, y: 5 },
      { x: 38, y: -5 }, { x: -25, y: -10 }, { x: 22, y: -12 }, { x: 5, y: 18 }
    ];

    for (let i = 0; i < 12; i++) {
      const rank: OrcRank = i < 6 ? 'Veteran' : 'Captain';
      const level = rank === 'Veteran' ? 10 + Math.floor(Math.random() * 6) : 4 + Math.floor(Math.random() * 5);
      const cap = this.createOrc(rank, level);
      cap.worldPosition = captainPositions[i] || { x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 60 };
      
      // Assign bodyguard bonds to warchiefs
      if (i < 3) {
        cap.masterId = warchiefs[i].id;
        cap.isBodyguard = true;
      }
      captains.push(cap);
    }

    return { overlord, warchiefs, captains };
  }

  public createOrc(rank: OrcRank, level: number): OrcCaptain {
    const id = 'orc_' + Math.random().toString(36).substring(2, 9);
    const firstName = ORC_FIRST_NAMES[Math.floor(Math.random() * ORC_FIRST_NAMES.length)];
    const title = ORC_TITLES[Math.floor(Math.random() * ORC_TITLES.length)];
    const tribe = TRIBES[Math.floor(Math.random() * TRIBES.length)];
    const orcClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];

    // Traits based on rank
    const immunityCount = rank === 'Overlord' ? 3 : rank === 'Warchief' ? 2 : rank === 'Veteran' ? 1 : 0;
    const enrageCount = rank === 'Overlord' ? 2 : 1;
    const weaknessCount = rank === 'Overlord' ? 1 : rank === 'Warchief' ? 1 : 2;

    const shuffledImm = [...IMMUNITIES].sort(() => 0.5 - Math.random());
    const shuffledEnr = [...ENRAGES].sort(() => 0.5 - Math.random());
    const shuffledWk = [...WEAKNESSES].sort(() => 0.5 - Math.random());
    const shuffledBon = [...BONUSES].sort(() => 0.5 - Math.random());

    const immunities = shuffledImm.slice(0, immunityCount);
    const enrages = shuffledEnr.slice(0, enrageCount);
    const weaknesses = shuffledWk.slice(0, weaknessCount);
    const bonuses = shuffledBon.slice(0, rank === 'Overlord' ? 2 : 1);

    // Tone & Personality
    let tone: 'psychotic' | 'arrogant' | 'screamer' | 'poet' | 'brutal' = 'brutal';
    if (title.includes('Poet')) tone = 'poet';
    else if (title.includes('Screamer')) tone = 'screamer';
    else if (title.includes('Blood') || title.includes('Butcher')) tone = 'psychotic';
    else if (tribe === 'Marauder' || tribe === 'Terror') tone = 'arrogant';

    const appearance: OrcAppearance = {
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      armorColor: ARMOR_COLORS[Math.floor(Math.random() * ARMOR_COLORS.length)],
      warPaintColor: WAR_PAINTS[Math.floor(Math.random() * WAR_PAINTS.length)],
      helmetStyle: ['horned', 'skull', 'iron_mask', 'hood', 'bare'][Math.floor(Math.random() * 5)] as OrcAppearance['helmetStyle'],
      weaponType: ['scimitar', 'two_handed_axe', 'dual_daggers', 'crossbow', 'heavy_mace'][Math.floor(Math.random() * 5)] as OrcAppearance['weaponType'],
      scar: 'none',
      scale: rank === 'Overlord' ? 1.45 : rank === 'Warchief' ? 1.25 : rank === 'Veteran' ? 1.15 : 1.05
    };

    const maxHp = 200 + level * 50 + (rank === 'Overlord' ? 500 : rank === 'Warchief' ? 250 : 0);

    return {
      id,
      name: firstName,
      title,
      rank,
      level,
      power: level * 10 + (rank === 'Overlord' ? 100 : rank === 'Warchief' ? 50 : 0),
      tribe,
      orcClass,
      health: maxHp,
      maxHealth: maxHp,
      immunities,
      enrages,
      weaknesses,
      bonuses,
      isBranded: false,
      isSpy: false,
      targetWarchiefId: null,
      isBodyguard: false,
      masterId: null,
      bloodBrotherId: null,
      rivalId: null,
      appearance,
      memory: {
        killedPlayerCount: 0,
        fledFromPlayerCount: 0,
        burnedByPlayer: false,
        humiliatedByPlayer: false,
        cheatedDeath: false,
        timesEncountered: 0,
        lastEncounterResult: 'none'
      },
      tone,
      voicePitch: 0.8 + Math.random() * 0.4,
      isDead: false,
      worldPosition: { x: 0, y: 0 },
      activeMission: null
    };
  }

  // Orc killed player: promote, level up, and taunt
  public onPlayerKilledByOrc(orcId: string) {
    const orc = this.getOrcById(orcId);
    if (!orc) return;

    orc.level += 3;
    orc.maxHealth += 150;
    orc.health = orc.maxHealth;
    orc.memory.killedPlayerCount++;
    orc.memory.timesEncountered++;
    orc.memory.lastEncounterResult = 'killed_player';

    // Promotion if Captain -> Veteran or Veteran -> Warchief if slot empty
    if (orc.rank === 'Captain') {
      orc.rank = 'Veteran';
    } else if (orc.rank === 'Veteran') {
      const deadWarchiefIndex = this.warchiefs.findIndex(w => w.isDead);
      if (deadWarchiefIndex !== -1) {
        orc.rank = 'Warchief';
        this.warchiefs[deadWarchiefIndex] = orc;
        this.captains = this.captains.filter(c => c.id !== orc.id);
        // Replace empty captain slot with a new recruit!
        this.captains.push(this.createOrc('Captain', Math.max(1, orc.level - 4)));
      }
    }
    this.saveToStorage();
  }

  // Orc defeated by player
  public onOrcDefeated(orcId: string, killedByFire: boolean = false) {
    const orc = this.getOrcById(orcId);
    if (!orc) return;

    // 30% chance to Cheat Death if not Overlord!
    const canCheatDeath = orc.rank !== 'Overlord' && Math.random() < 0.35;

    if (canCheatDeath) {
      orc.isDead = false;
      orc.memory.cheatedDeath = true;
      orc.level += 2;
      orc.health = orc.maxHealth;
      if (killedByFire) {
        orc.appearance.scar = 'burn';
        orc.memory.burnedByPlayer = true;
      } else {
        orc.appearance.scar = ['iron_jaw', 'eyepatch', 'cursed_veins'][Math.floor(Math.random() * 3)] as OrcAppearance['scar'];
      }
      orc.bonuses.push('Iron Will');
      // Relocate on the world map
      orc.worldPosition = {
        x: (Math.random() - 0.5) * 80,
        y: 10 + Math.random() * 40
      };
    } else {
      orc.isDead = true;
      // Respawn a new rival captain after some time if regular captain
      if (orc.rank === 'Captain' || orc.rank === 'Veteran') {
        const replacement = this.createOrc('Captain', Math.floor(Math.random() * 6) + 4);
        replacement.worldPosition = {
          x: (Math.random() - 0.5) * 70,
          y: 15 + Math.random() * 30
        };
        setTimeout(() => {
          const idx = this.captains.findIndex(c => c.id === orc.id);
          if (idx !== -1) {
            this.captains[idx] = replacement;
            this.saveToStorage();
          }
        }, 15000);
      }
    }
    this.saveToStorage();
  }

  // Dominate / Brand an Orc
  public brandOrc(orcId: string): boolean {
    const orc = this.getOrcById(orcId);
    if (!orc) return false;

    // If has Iron Will, must break it first
    if (orc.bonuses.includes('Iron Will')) {
      orc.bonuses = orc.bonuses.filter(b => b !== 'Iron Will');
      orc.memory.humiliatedByPlayer = true;
      return false; // Iron will broken, need to brand again or recruit
    }

    orc.isBranded = true;
    orc.memory.lastEncounterResult = 'branded';
    this.saveToStorage();
    return true;
  }

  // Set Bodyguard
  public assignPlayerBodyguard(orcId: string) {
    const orc = this.getOrcById(orcId);
    if (!orc || !orc.isBranded) return;
    this.alliedBodyguardId = orc.id;
    this.saveToStorage();
  }

  // Infiltrate as Spy to Warchief
  public infiltrateSpy(spyOrcId: string, warchiefId: string) {
    const spy = this.getOrcById(spyOrcId);
    const warchief = this.getOrcById(warchiefId);
    if (!spy || !warchief || !spy.isBranded) return;

    spy.isSpy = true;
    spy.targetWarchiefId = warchief.id;
    spy.masterId = warchief.id;
    this.saveToStorage();
  }

  public getOrcById(id: string): OrcCaptain | undefined {
    if (this.overlord.id === id) return this.overlord;
    const wc = this.warchiefs.find(w => w.id === id);
    if (wc) return wc;
    return this.captains.find(c => c.id === id);
  }

  public getAllOrcs(): OrcCaptain[] {
    return [this.overlord, ...this.warchiefs, ...this.captains];
  }

  public saveToStorage() {
    try {
      const data = {
        overlord: this.overlord,
        warchiefs: this.warchiefs,
        captains: this.captains,
        alliedBodyguardId: this.alliedBodyguardId
      };
      localStorage.setItem('mordor_nemesis_data', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save nemesis state:', e);
    }
  }

  private loadFromStorage(): { overlord: OrcCaptain; warchiefs: OrcCaptain[]; captains: OrcCaptain[]; alliedBodyguardId: string | null } | null {
    try {
      const item = localStorage.getItem('mordor_nemesis_data');
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn('Failed to load nemesis state:', e);
    }
    return null;
  }
}
