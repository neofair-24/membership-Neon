# 🎮 Hero vs Demon King — Multiplayer RPG

A **4-player online co-op RPG** built with HTML5 Canvas + Node.js. No download required — plays instantly in any browser.

[![Tech](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%2B%20Socket.io-7c3aed)]()
[![Players](https://img.shields.io/badge/Players-1--4-22c55e)]()

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start both server + client dev servers simultaneously
npm run dev
```

Then open **http://localhost:5173** in your browser.

> The game server runs on **:3001** and the client on **:5173**. Vite automatically proxies Socket.io requests.

---

## 🎮 Controls

| Action | Key |
|---|---|
| Move | WASD / Arrow Keys |
| Ability 1 | Q |
| Ability 2 | W |
| Ability 3 | E |
| Ultimate | R |
| Dodge Roll | Space |
| Chat (multiplayer) | T |
| Skip Dialogue | Enter |
| Return to Menu | Escape |

---

## 👥 Multiplayer — How to Connect

### Hosting a Game
1. Open the game at `http://localhost:5173` (or your deployed URL)
2. Select a character class
3. Click **"🌐 Host Game"**
4. Enter your name and click **"🎮 Create Room"**
5. Share the **4-letter room code** with friends

### Joining a Game
1. Select a character class
2. Click **"🔗 Join Game"**
3. Enter your name and the room code
4. Click **"▶ Connect"**
5. Click **"Ready"** in the lobby — game starts when all players are ready

> For internet multiplayer, deploy the server (see [Deployment](#deployment) below).

---

## ⚔️ Character Classes

| Class | Role | HP | Abilities |
|---|---|---|---|
| **🟣 Mage** | Ranged DPS | 80 | Arcane Bolt, Meteor, Time Warp, Arcane Nova |
| **🔴 Boxer** | Melee DPS | 150 | Jab Combo, Power Punch, Flurry, Rage Mode |
| **🟡 Paladin** | Tank/Healer | 200 | Holy Strike, Divine Shield, Consecrate, Smite |
| **🟢 Rogue** | Assassin | 100 | Quick Slash, Shadow Step, Smoke Bomb, Backstab |

---

## 📖 Story Campaign

| Act | Event |
|---|---|
| **Intro** | Demon King Malvex attacks the kingdom |
| **Act I** | Fight through demon hordes |
| **Act II** | General Ironthorn (sword warrior) joins as an ally |
| **Act III** | General Embera (fire mage) joins; the Demon King's lair approaches |
| **Boss** | **Demon King Malvex** — 3-phase adaptive boss fight |

---

## 🧠 Adaptive AI System

The Demon King's AI observes your attack patterns in real time:

- **Tier 0 — Learning:** Records your ability usage
- **Tier 1 — Adapting:** Recognizes most-used attacks; increases dodge chance
- **Tier 2 — Expert:** Predicts your next ability; shields against your combo starters; counterattacks aggressively

The AI indicator appears on the boss health bar during the final fight.

---

## 🌐 Deployment (Internet Multiplayer)

To play with friends across the internet, deploy the server to a cloud host:

### Option A: Railway (free tier)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option B: Render
1. Push code to GitHub
2. Create a new Render Web Service
3. Set start command: `node server/index.js`
4. Set environment: `PORT=10000`

Then update `vite.config.js` to proxy to your deployed server URL for production builds.

---

## 🏗️ Architecture

```
chess/
├── server/                 # Node.js game server
│   ├── index.js            # Socket.io + room management
│   ├── GameRoom.js         # Authoritative game state per room
│   └── AIEngine.js         # Pattern-learning AI engine
└── src/                    # Client (HTML5 Canvas + Vite)
    ├── main.js             # Entry point
    ├── engine/             # RAF loop, input, networking
    ├── scenes/             # Menu, Lobby, Game scenes
    ├── entities/           # Player, DemonKing, General, Projectile
    ├── combat/             # Ability system, damage calculation
    ├── ui/                 # HUD, Dialogue box
    └── utils/              # Particle system, Web Audio SFX
```

**Key design decisions:**
- **Authoritative server**: Clients send inputs; server validates and broadcasts state
- **Client-side prediction**: Local player movement is immediate; server corrects HP/MP
- **Procedural audio**: No audio files — everything generated via Web Audio API
- **Canvas drawing**: All characters drawn programmatically (no sprite sheets needed)
