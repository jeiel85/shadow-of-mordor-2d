// Shadow of War Nemesis System Types & Data Definitions

export type OrcRank = 'Captain' | 'Veteran' | 'Warchief' | 'Overlord';

export type OrcTribe = 
  | 'Dark' 
  | 'Feral' 
  | 'Machine' 
  | 'Marauder' 
  | 'Terror' 
  | 'Warmonger' 
  | 'Slaughter';

export type OrcClass = 
  | 'Assassin' 
  | 'Berserker' 
  | 'Commander' 
  | 'Destroyer' 
  | 'Marksman' 
  | 'Slayer' 
  | 'Tank' 
  | 'Trickster';

export type ImmunityTrait = 
  | 'Arrow-Proof' 
  | 'Execution-Proof' 
  | 'Fire-Proof' 
  | 'Poison-Proof' 
  | 'Frost-Proof' 
  | 'Stealth-Proof' 
  | 'Vault-Breaker';

export type EnrageTrait = 
  | 'Enraged by Injury' 
  | 'Enraged by Fire' 
  | 'Enraged by Rivals' 
  | 'Enraged by Betrayal' 
  | 'Bloodlust' 
  | 'Vengeful Retaliation';

export type WeaknessTrait = 
  | 'Fear of Fire' 
  | 'Fear of Beasts' 
  | 'Fear of Betrayal' 
  | 'Vulnerable to Stealth' 
  | 'Vulnerable to Ranged' 
  | 'Soft Target' 
  | 'Dazed by Wraith Blast';

export type BonusTrait = 
  | 'No Chance' 
  | 'Flaming Weapon' 
  | 'Poison Claws' 
  | 'Cursed Touch' 
  | 'Summon Gang' 
  | 'Iron Will' 
  | 'Thick Skinned';

export interface OrcAppearance {
  skinColor: string;
  armorColor: string;
  warPaintColor: string | null;
  helmetStyle: 'horned' | 'skull' | 'iron_mask' | 'hood' | 'bare';
  weaponType: 'scimitar' | 'two_handed_axe' | 'dual_daggers' | 'crossbow' | 'heavy_mace';
  scar: 'burn' | 'iron_jaw' | 'eyepatch' | 'cursed_veins' | 'none';
  scale: number;
}

export interface OrcMemory {
  killedPlayerCount: number;
  fledFromPlayerCount: number;
  burnedByPlayer: boolean;
  humiliatedByPlayer: boolean;
  cheatedDeath: boolean;
  timesEncountered: number;
  lastEncounterResult: 'escaped' | 'killed_player' | 'died' | 'branded' | 'none';
}

export interface OrcCaptain {
  id: string;
  name: string;
  title: string;
  rank: OrcRank;
  level: number;
  power: number;
  tribe: OrcTribe;
  orcClass: OrcClass;
  health: number;
  maxHealth: number;
  
  // Nemesis Traits
  immunities: ImmunityTrait[];
  enrages: EnrageTrait[];
  weaknesses: WeaknessTrait[];
  bonuses: BonusTrait[];
  
  // Allegiance & Mind
  isBranded: boolean;
  isSpy: boolean;
  targetWarchiefId: string | null;
  isBodyguard: boolean;
  masterId: string | null; // If bodyguard to another orc
  bloodBrotherId: string | null;
  rivalId: string | null;

  // History & Appearance
  appearance: OrcAppearance;
  memory: OrcMemory;
  tone: 'psychotic' | 'arrogant' | 'screamer' | 'poet' | 'brutal';
  voicePitch: number;

  // Current World State
  isDead: boolean;
  worldPosition: { x: number; y: number };
  activeMission: {
    type: 'duel' | 'execution' | 'feast' | 'beast_hunt' | 'patrol';
    targetOrcId?: string;
    locationName: string;
    turnsRemaining: number;
  } | null;
}

export interface GearItem {
  id: string;
  name: string;
  type: 'sword' | 'dagger' | 'bow' | 'armor' | 'cloak' | 'ring';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  level: number;
  attackPower?: number;
  defense?: number;
  perk: string;
  iconName: string;
}

export interface PlayerStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  mirian: number; // In-game currency
  health: number;
  maxHealth: number;
  wrath: number; // 0 to 100
  focus: number; // 0 to 100 (for slow-mo aim)
  arrows: number;
  maxArrows: number;
  comboHits: number;
  equippedGear: {
    sword: GearItem;
    dagger: GearItem;
    bow: GearItem;
    armor: GearItem;
    cloak: GearItem;
    ring: GearItem;
  };
  skills: {
    executionUnlocked: boolean;
    shadowStrikeUnlocked: boolean;
    perfectCounterUnlocked: boolean;
    ironWillBreakerUnlocked: boolean;
    callBodyguardUnlocked: boolean;
    caragorRiderUnlocked: boolean;
    stealthDrainUnlocked: boolean;
  };
}
