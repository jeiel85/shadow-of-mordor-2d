# ⚔️ Nemesis Chronicles 2D: Shadow of Mordor

> **A 2.5D HD-2D Action RPG featuring the legendary *Middle-earth: Shadow of War* Nemesis System, dynamic Orc hierarchy, fortress sieges, and real-time combat built with Three.js & TypeScript.**

[![Deploy to GitHub Pages](https://github.com/jeiel85/shadow-of-mordor-2d/actions/workflows/deploy.yml/badge.svg)](https://github.com/jeiel85/shadow-of-mordor-2d/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-brightgreen?style=for-the-badge&logo=github)](https://jeiel85.github.io/shadow-of-mordor-2d/)

---

## 🎮 Live Demo
**Play directly in your browser:** [https://jeiel85.github.io/shadow-of-mordor-2d/](https://jeiel85.github.io/shadow-of-mordor-2d/)

---

## 🌟 Key Features

### 1. The Legendary Nemesis System (네메시스 시스템)
- **Living Orc Hierarchy**: 1 Overlord, 3 Warchiefs, and 12 Captains across multiple Mordor tribes (Dark, Feral, Machine, Marauder, Terror, Warmonger, Slaughter).
- **Persistent Memory & Grudges**:
  - Orcs remember if they killed you, if you burned them, or if you humiliated them.
  - Slaying an Orc has a chance for them to **Cheat Death** and return with physical scars (iron jaws, burn marks, eyepatch) and vengeance dialogue!
- **Promotions & Dynamic World**: If you fall in battle, the killer is promoted, levels up, and taunts you upon your resurrection.
- **Domination & Branding (세뇌/포섭)**:
  - Weaken orcs to break their will and brand them with Celebrimbor's wraith light.
  - Assign branded Captains as personal **Bodyguards** or plant them as **Spies** to backstab enemy Warchiefs.

### 2. HD-2D Visual Engine (Three.js 2.5D)
- Classic top-down tile-based aesthetic (inspired by *The Legend of Zelda* and *Pokémon*) elevated with modern **HD-2D rendering**:
  - Low-angle axonometric 3D perspective camera.
  - Real-time soft shadows & volumetric lighting.
  - Dynamic point lights (torches, grog fires, glowing wraith auras).
  - Floating ember particle systems and atmospheric fog.

### 3. Dynamic Combat & Skills
- **Free-Flow Melee Combat**: Light/Heavy sword combos with responsive hit-stop.
- **Parry & Counter**: Watch for the glowing blue counter prompt above enemy heads to execute devastating counters (`SPACE` / `Right Click`).
- **Bow & Slow-Mo Focus**: Draw your bow to trigger time-dilation and land precision shots (`Q`).
- **Brutal Executions**: Build your Wrath meter to 100% to unleash cinematic executions (`F`).
- **Shadow Strike**: Teleport across the battlefield in a flash of wraith power (`X`).
- **Environmental Hazards**: Shoot poisonous/explosive Grog barrels and unleash caged Caragors into enemy camps.

### 4. Fortress Assault & 1+ Hour Progression Loop
- **Citadel Siege**: Breach the outer gates of Cirith Gorgor, eliminate or turn the Warchiefs, and confront the Overlord in his throne room.
- **Loot & Celebrimbor's Forge**: Collect swords, daggers, bows, armors, cloaks, and rings from slain orcs across Common, Rare, Epic, and Legendary rarities. Upgrade them at the forge using Mirian currency.
- **Persistent Auto-Save**: Seamlessly saves your army state, inventory, and player level to `localStorage`.

---

## ⌨️ Controls

| Key / Action | Function |
|---|---|
| **W, A, S, D** / Arrows | Move Talion |
| **Shift** | Dodge Roll (Invulnerability frames) |
| **Left Click** | Sword Attack / Combo (Shoot arrow when aiming) |
| **Right Click** / **Space** | Counter / Parry attack |
| **Q** | Aim Bow (Slows down time with Focus) |
| **E** | Drain / Brand broken Captain into your army |
| **F** | Brutal Execution (Requires 100% Wrath) |
| **X** | Shadow Strike (Teleport kill) |
| **B** | Summon Assigned Branded Bodyguard |
| **M** | Open Nemesis Army Hierarchy Screen |
| **I** | Open Inventory & Forge Screen |

---

## 🛠️ Tech Stack & Architecture
- **Engine**: Three.js (WebGL, Soft PCF Shadows, Point Lighting)
- **Audio**: Web Audio API (Fully procedural real-time sound synthesizer & adaptive dark fantasy music)
- **Language**: TypeScript + HTML5 Canvas
- **Bundler**: Vite
- **Deployment**: GitHub Actions CI/CD to GitHub Pages

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/jeiel85/shadow-of-mordor-2d.git
cd shadow-of-mordor-2d

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📜 License
MIT License. Created with passion for Middle-earth and retro action-RPGs!
