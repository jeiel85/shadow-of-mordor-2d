import { OrcCaptain } from '../nemesis/NemesisTypes';
import { DialogueGenerator } from '../nemesis/DialogueGenerator';
import { soundManager } from '../audio/SoundManager';

export class DialogueOverlay {
  private container: HTMLElement;
  private isShowing: boolean = false;
  private autoDismissTimer: number | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'dialogue-overlay';
    this.container.className = 'dialogue-overlay hidden';
    document.body.appendChild(this.container);

    window.addEventListener('keydown', () => {
      if (this.isShowing) this.dismiss();
    });
    this.container.addEventListener('click', () => {
      if (this.isShowing) this.dismiss();
    });
  }

  public showEncounter(orc: OrcCaptain) {
    this.isShowing = true;
    soundManager.playWarHorn();
    soundManager.playOrcGrunt(orc.voicePitch);

    const quote = DialogueGenerator.getEncounterQuote(orc);

    this.container.innerHTML = `
      <div class="letterbox-top"></div>
      <div class="letterbox-bottom"></div>

      <div class="encounter-modal">
        <div class="orc-banner">
          <div class="banner-rank">${orc.rank.toUpperCase()}</div>
          <div class="banner-name">${orc.name}</div>
          <div class="banner-title">${orc.title}</div>
          <div class="banner-traits">
            <span class="trait-pill">Lv.${orc.level}</span>
            <span class="trait-pill">${orc.tribe} Tribe</span>
            <span class="trait-pill">${orc.orcClass}</span>
          </div>
        </div>

        <div class="dialogue-box">
          <div class="dialogue-quote">${quote}</div>
          <div class="dialogue-prompt">[PRESS ANY KEY TO ENGAGE]</div>
        </div>
      </div>
    `;

    this.container.classList.remove('hidden');

    if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
    this.autoDismissTimer = window.setTimeout(() => {
      this.dismiss();
    }, 4500);
  }

  public dismiss() {
    this.isShowing = false;
    this.container.classList.add('hidden');
    if (this.autoDismissTimer) clearTimeout(this.autoDismissTimer);
  }
}
