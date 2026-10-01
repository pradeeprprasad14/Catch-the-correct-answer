# 🕹️ Catch the Correct Answer — Educational Math Drop

> **The Vibe:** Joyful, modern, light-themed arcade drop game with full-screen layout, high-clarity typography, 8-bit synthetic sound effects, procedural chiptune music, and scaling difficulty!

---

## 🚀 How to Play

### Instant Play
Simply open **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave, etc.) by double-clicking it, or run `launch_game.bat`.

---

## 🌟 New Features in This Version

- 🖥️ **Full Screen Viewport:** Adapts natively to full screen across all monitors and resolutions. Includes a one-click **Fullscreen (⛶)** toggle button (`F` key).
- 🎨 **Light, Joyful Aesthetic:** Bright, clean, high-contrast light colors for optimal daytime readability and educational focus.
- 🔤 **High-Clarity Modern Typography:** Upgraded to Google Fonts **Outfit** and **Fredoka** for crystal-clear mathematical numerals and UI text.
- 🎯 **Simple Start Flow:** Clean, prominent "Start" action button.

---

## 🎮 Game Modes

1. **Arcade Mode (Classic)**
   - Start with **3 Lives (❤️❤️❤️)**.
   - Catching the correct answer gives points and increases your **Combo Multiplier**.
   - Catching a decoy or letting the correct answer hit the floor costs **1 Life**.
   - Scales up in speed and complexity every 5 problems solved!
2. **Time Attack Mode (60s)**
   - Race against a 60-second clock!
   - Correct catches award **+3 Bonus Seconds**; decoy catches penalize **-4 Seconds**.
3. **Zen Mode (Practice)**
   - Unlimited lives with relaxed pacing.
   - Perfect for brushing up on mental math and times tables without pressure.

---

## 🧮 Math Categories

- **Mixed (All)**: Dynamic mixture of addition, subtraction, multiplication, and division.
- **Multiplication (×)**: Master times tables from 2x up to 12x and beyond.
- **Add & Sub (+ / -)**: Fast-paced mental addition and subtraction with carry/borrow distractors.
- **Division (÷)**: Clean whole-number division facts.
- **Number Ninja**: Special mathematical rules such as *Primes*, *Multiples of 3*, *Multiples of 5*, *Even*, and *Odd* numbers!

---

## 🕹️ Controls

| Action | Keyboard | Mouse / Trackpad | Touch (Mobile) |
|---|---|---|---|
| **Move Basket** | `←` / `→` or `A` / `D` | Move mouse horizontally | Drag finger or On-Screen Left/Right buttons |
| **Turbo Dash** | `Space` or `Shift` | Left Click | On-Screen **DASH** button |
| **Toggle Fullscreen**| `F` | Fullscreen Button (⛶) | Fullscreen Button (⛶) |
| **Pause Game** | `P` or `ESC` | Pause Button (⏸️) | Pause Button (⏸️) |
| **Mute SFX** | `M` | Audio Icon (🔊) | Audio Icon (🔊) |
| **Toggle Music** | `N` | Music Icon (🎵) | Music Icon (🎵) |
| **Toggle Scanlines** | `C` | CRT Icon (📺) | CRT Icon (📺) |

---

## 🌟 Power-Ups

- ⭐ **Star**: Double points multiplier for 8 seconds.
- ⏱️ **Slow-Mo Clock**: Reduces falling speed by 50% for 6 seconds.
- 💣 **Smart Bomb**: Instantly wipes out all decoys currently on the screen.
- 🛡️ **Energy Shield**: Absorbs one wrong catch without losing a life.
- 💖 **Extra Life**: Restores 1 lost heart (Arcade mode).

---

## 🛠️ Project Structure

- `index.html` — Header HUD, canvas viewport, modals, and virtual control deck.
- `css/style.css` — Modern light theme, fullscreen layout, and typography.
- `js/audio.js` — Procedural Web Audio API sound synthesizer & chiptune background arpeggios.
- `js/particles.js` — Particle fireworks, confetti bursts, screen shake, and floating score texts.
- `js/mathGenerator.js` — Smart arithmetic problem generation with collision-free, plausible near-miss decoys.
- `js/game.js` — Core game loop, fullscreen resizing, basket physics, and collision detection.
