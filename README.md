# 🕹️ Catch the Correct Answer

> **The Vibe:** Classic retro arcade drop game with glowing CRT scanlines, 8-bit synthetic sound effects, procedural chiptune arpeggios, and scaling difficulty!

---

## 🚀 How to Play

### Instant Play
Simply open **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, etc.) by double-clicking it.

---

## 🎮 Game Modes

1. **Arcade Mode (Classic)**
   - Start with **3 Lives (❤️❤️❤️)**.
   - Catching the correct answer gives points and increases your **Combo Multiplier**.
   - Catching a decoy or letting the correct answer hit the floor costs **1 Life**.
   - Scales up in speed and complexity every 5 problems solved!
2. **Time Attack Mode (60s)**
   - Race against a 60-second clock!
   - Correct catches add bonus time; decoy catches subtract time.
3. **Zen Mode (Practice)**
   - Unlimited lives with relaxed pacing.
   - Perfect for brushing up on mental math and times tables without pressure.

---

## 🧮 Math Categories

- **Mixed (All)**: A dynamic mix of addition, subtraction, multiplication, and division.
- **Multiplication (×)**: Master times tables from 2x up to 12x and beyond.
- **Add & Sub (+ / -)**: Fast-paced mental addition and subtraction.
- **Division (÷)**: Clean whole-number division facts.
- **Number Ninja**: Special rules such as *Primes*, *Multiples of 3*, *Multiples of 5*, *Even*, and *Odd* numbers!

---

## 🕹️ Controls

| Action | Keyboard | Mouse / Trackpad | Touch (Mobile) |
|---|---|---|---|
| **Move Basket** | `←` / `→` or `A` / `D` | Move mouse horizontally | Drag finger or On-Screen Left/Right buttons |
| **Turbo Dash** | `Space` or `Shift` | Left Click | On-Screen **DASH** button |
| **Pause Game** | `P` or `ESC` | Pause Button (⏸️) | Pause Button (⏸️) |
| **Mute SFX** | `M` | Audio Icon (🔊) | Audio Icon (🔊) |
| **Toggle Music** | `N` | Music Icon (🎵) | Music Icon (🎵) |
| **Toggle CRT Scanlines** | `C` | CRT Icon (📺) | CRT Icon (📺) |
| **Toggle Fullscreen** | `F` | Fullscreen Icon (⛶) | Fullscreen Icon (⛶) |

---

## 🌟 Power-Ups

- ⭐ **Star**: Double points multiplier for 8 seconds.
- ⏱️ **Slow-Mo Clock**: Reduces falling speed by 50% for 6 seconds.
- 💣 **Smart Bomb**: Instantly wipes out all decoys currently on the screen.
- 🛡️ **Energy Shield**: Absorbs one wrong catch without losing a life.
- 💖 **Extra Life**: Restores 1 lost heart (Arcade mode).

---

## 🛠️ Project Structure

- `index.html` — Arcade cabinet marquee, HUD, overlays, and canvas viewport.
- `css/style.css` — Retro arcade aesthetics, neon palettes, CRT scanlines, and responsive layout.
- `js/audio.js` — Procedural 8-bit sound synthesizer & chiptune background arpeggios via Web Audio API.
- `js/particles.js` — Particle fireworks, debris bursts, screen shake, and floating arcade score text.
- `js/mathGenerator.js` — Intelligent arithmetic generation with plausible decoys (transposed digits, near-misses).
- `js/game.js` — Core game engine, entity physics, collision detection, and game state management.
