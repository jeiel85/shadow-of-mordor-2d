import { OrcCaptain } from './NemesisTypes';

export class DialogueGenerator {
  public static getEncounterQuote(orc: OrcCaptain): string {
    const mem = orc.memory;

    // 1. Cheated death / scar reaction
    if (mem.cheatedDeath) {
      if (orc.appearance.scar === 'burn') {
        return `"Look at what you did to my skin, Tark! Ash and blister! Every heartbeat burns, and now YOU will burn with me!"`;
      }
      if (orc.appearance.scar === 'iron_jaw') {
        return `"You broke my teeth and shattered my jaw! But the Machine boys wired me back together. Now my bite is iron!"`;
      }
      return `"You thought you left me dead in the dirt?! Death doesn't want me, Bright Lord! I crawled out of the pit just to gut you!"`;
    }

    // 2. Killed player before
    if (mem.killedPlayerCount > 0) {
      const phrases = [
        `"Back for more so soon, Gravewalker? How many times must I carve you up before you stay down?!"`,
        `"Ha! The boys didn't believe me when I said you'd come crawling back. Stand still, I want another trophy for my belt!"`,
        `"I killed you once, I'll kill you twice! Your ghost tricks won't save you from my blade!"`
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    // 3. Fled from player before
    if (mem.fledFromPlayerCount > 0) {
      return `"I didn't run, Tark! I was just finding a better spot to cut your throat! Today there's no running!"`;
    }

    // 4. Tone / Personality specific quotes
    if (orc.tone === 'screamer') {
      return `"RAAAAGHHH! SCREEEECH! TEAR THE FLESH! CRACK THE BONES! AAAAAAH!"`;
    }

    if (orc.tone === 'poet') {
      const poems = [
        `"A ranger walks into the mire, to quench his burning, foolish fire. His blood will spill, his soul will fade, upon my crimson, singing blade!"`,
        `"Bright Lord shining in the night, foolish moth drawn to the light. Wings shall tear and eyes shall bleed, on your carcass I shall feed!"`
      ];
      return poems[Math.floor(Math.random() * poems.length)];
    }

    if (orc.tone === 'psychotic') {
      return `"Hehehe... Do you hear them? The voices in the mud? They said your entrails would make lovely ribbons for my armor!"`;
    }

    if (orc.tone === 'arrogant') {
      return `"You think you're a legend, Ranger? In Mordor, you're just fresh meat looking for a spit!"`;
    }

    // Default brutal
    const brutalQuotes = [
      `"I smell elf-stench! Drop your weapons and I might just eat you before skinning you alive!"`,
      `"The Overlord promised a barrel of grog to whoever brings your head on a pike! Drinks are on me tonight!"`,
      `"Steel meets steel, Tark! Let's see if that glowing ghost inside you can stitch your belly back together!"`
    ];
    return brutalQuotes[Math.floor(Math.random() * brutalQuotes.length)];
  }

  public static getKillPlayerQuote(orc: OrcCaptain): string {
    return `"Now THAT is how an Uruk makes his name! Bring me his ring, and tell the Overlord I want a promotion!"`;
  }

  public static getBrandedQuote(orc: OrcCaptain): string {
    return `"My mind... it burns with blue fire! I see the Bright Lord... We serve the Bright Lord!"`;
  }

  public static getBetrayalQuote(orc: OrcCaptain): string {
    return `"Did you really think your glowing hand could leash a true Uruk forever?! You made me weak, Tark! Now I take my revenge!"`;
  }
}
