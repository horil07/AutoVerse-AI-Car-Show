# 🚗 AutoVerse — AI-Powered Car Customization Showcase
Live Link - https://auto-verse-ai-car-show.vercel.app/
> **Automotive Sector — Interactive Game with Generative AI**  
> Built as a browser-based interactive experience using HTML5 Canvas, CSS3, and JavaScript.

---

## 🎮 Features Implemented

### Core Game Mechanics
| Feature | Description |
|---|---|
| **Real-time Car Rendering** | Canvas-based 3D-style sports car drawn dynamically with custom lighting and reflections |
| **Body Color Selection** | 12-color curated palette + custom hex color picker |
| **Wheel Customization** | 6 distinct wheel styles: Sport, Blade, Luxury, Mesh, Off-Road, Split |
| **Interior Lighting** | 6 ambient underglow options: Blue, Red, Green, Purple, White, Gold |
| **Window Tint Control** | Smooth slider from 0% (crystal clear) to 100% (blacked out) |
| **Quick Themes** | One-click presets: ⚡ Sporty, 👑 Luxury, 🌑 Stealth, 🌈 Neon, 🏔️ Off-Road |
| **Style Score System** | Points awarded for every customization action |
| **Save Look** | Export current car configuration as PNG image |

### Real-Time Feedback
- ✅ Animated toast notification for every user action
- ✅ Live "Current Config" panel updating on all changes
- ✅ Animated score counter with visual bump effect
- ✅ Loading screen with staged progress bar

---

## 🤖 Generative AI Component

### How It Works
AutoVerse includes a local **rule-based Generative AI engine** (`ai.js`) that:

1. **Accepts free-text input** from the user (e.g., _"sporty red racer"_, _"luxury night"_, _"neon cyberpunk"_)
2. **Detects intent** via keyword matching across 5 themed dictionaries (Sporty, Luxury, Stealth, Neon, Off-Road)
3. **Extracts color keywords** (e.g., "red", "gold", "midnight") to influence the first suggestion
4. **Generates 3–5 unique suggestions** using seeded shuffling for variation on every call
5. **Produces varied descriptions** paired to detected theme style

### AI Generation Example
| Input | Detected Theme | Suggestions Generated |
|---|---|---|
| `"sporty red racer"` | Sporty | Track Dominator, Sprint Edition, Circuit Pro... |
| `"luxury night"` | Luxury | Prestige Black, Midnight Velvet, Executive Navy... |
| `"neon cyberpunk"` | Neon | Cyber Pulse, Ultraviolet Dreams, Holographic Drift... |
| `"mountain trail"` | Off-Road | Desert Conqueror, Army Trail Blazer, Mountain Storm... |
| `"anything else"` | Generic | Classic Red Racer, Ocean Blue Drift, Midnight Black... |

Each suggestion contains:
- ✅ Car body color
- ✅ Wheel style
- ✅ Lighting color
- ✅ Window tint level
- ✅ Style tags and description

---

## 🕹️ How to Interact

### Starting the Game
1. **Open** `index.html` in any modern web browser (Chrome, Edge, Firefox)  
   > No server or installation required — fully offline!
2. Watch the **loading screen** as the AI engine and garage environment initialize
3. The **interactive showcase** launches automatically

### Controls
| Control | Action |
|---|---|
| **Color Swatches** (left panel) | Click any swatch to change car body color |
| **Custom Color Picker** | Pick any hex color → click "Apply" |
| **Wheel Buttons** | Click a wheel style to swap (Sport/Blade/Luxury/Mesh/Off-Road/Split) |
| **Lighting Buttons** | Click to change underglow color (Blue/Red/Green/Purple/White/Gold) |
| **Tint Slider** | Drag to adjust window darkness |
| **Quick Themes** (bottom bar) | One-click apply full themed configuration |
| **AI Input + Generate** (right panel) | Type a style description and press Generate or Enter |
| **Suggestion Cards** | Click any AI suggestion card to apply all its settings |
| **📸 Save Look** | Download current canvas as PNG |

---

## 🏗️ Project Structure

```
game/
├── index.html    — Main HTML entry point + layout
├── style.css     — Premium dark UI design system
├── car.js        — Canvas 2D car rendering engine
├── ai.js         — Generative AI suggestion engine
├── game.js       — Game controller & event system
└── README.md     — This file
```

---

## 🧰 Technical Stack
- **Engine**: HTML5 Canvas 2D API (no WebGL dependencies)
- **Styling**: Vanilla CSS with CSS custom properties, glassmorphism
- **Typography**: Orbitron (display) + Inter (body) via Google Fonts
- **AI**: Custom JavaScript rule-based generative engine
- **Build**: Zero dependencies — pure HTML/CSS/JS, runs directly in browser

---

## 📊 Scoring System
Earn Style Points for each action:
| Action | Points |
|---|---|
| Color Change | +5 |
| Lighting Change | +6 |
| Tint Adjust | +3 |
| Wheel Change | +8 |
| Quick Theme | +15 |
| AI Generate | +20 |
| Apply Suggestion | +25 |
| Save Look | +10 |
| Custom Color | +10 |

---

*Built for the Game Development with Generative AI assignment — Automotive Sector*
