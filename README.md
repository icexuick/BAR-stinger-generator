# BAR Livestream Stinger

Animated stinger/transition overlay for the **BAR Alpha Cup VI** livestream. Built as a browser-based animation with a visual editor and automated export to **WebM with alpha transparency** for use in OBS Studio.

## Preview

The stinger features:
- Diagonal wipe blades with scanline texture
- Animated logo build-up (shield, BAR logo, ALPHA, alphaVI, CUP)
- Shield glow effect
- Gold particle/spark explosion (resolution-independent)
- Gold flash, light sweep, and corner accents
- Full timing control for all animated elements via dual-range sliders
- Adjustable animation duration (1–8 seconds)

## Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [FFmpeg](https://ffmpeg.org/) with VP9 support (`libvpx-vp9`)

### Installing FFmpeg

**Windows** (via Chocolatey, run as Administrator):
```bash
choco install ffmpeg -y
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## Setup

```bash
git clone https://github.com/icexuick/BAR-stinger-generator.git
cd BAR-stinger-generator
npm install
```

## Usage

### 1. Preview & Edit in Browser

Open `bar-stinger-alphacup-vi/stinger-v2-animated.html` in a browser. You can use VS Code's Live Server extension or any local server:

```bash
# Example with Python
cd bar-stinger-alphacup-vi
python -m http.server 8080
# Open http://localhost:8080/stinger-v2-animated.html
```

#### Controls Bar

- **Replay** — replay the animation
- **Pause/Play** — freeze the animation at the current frame
- **Loop** — auto-repeat the animation
- **Editor** — open the visual editor panel
- **Timeline scrubber** — scrub to any point in the animation

#### Visual Editor

The editor panel lets you adjust all parameters in real-time with sliders:

| Section | Controls |
|---------|----------|
| **BAR Logo** | Top position, Width |
| **ALPHA Text** | Top position, Width |
| **Alpha VI (Hero)** | Top position, Width |
| **CUP Text** | Bottom position, Width |
| **Logo** | Scale (entire logo assembly) |
| **Shield** | Scale |
| **Shield Glow** | Size, Opacity |
| **Timing** | Duration + dual-range start/end sliders for: Blades, Shield, BAR, ALPHA, Alpha VI, CUP, Glow, Flash, Sweep, Corners, Sparks |
| **Blade Texture** | Opacity, Gap, Weight, Highlight |
| **Sparks** | Count, Size, Spread, Duration, Stretch, Deceleration |
| **Effects** | Flash opacity, Sweep opacity, Corners opacity |

All settings are automatically saved to `localStorage` and persist across browser refreshes.

#### Save / Load Design

- **Save Design** — downloads a `design.json` file with all current settings
- **Load Design** — load a previously saved design file
- **Reset** — reset all values to defaults and clear localStorage
- **Copy CSS** — copy current values as CSS custom properties

Place the `design.json` file in the `bar-stinger-alphacup-vi/` folder for the export script to use.

### 2. Export to WebM

The export script opens the HTML file directly (no live server needed).

```bash
npm run export
```

This will:
1. Open the stinger in a headless Chromium browser at 2560x1440
2. Apply settings from the latest `design*.json` file
3. Auto-detect duration from the design file (or use default 3s)
4. Set the background to transparent
5. Capture frames as PNG with alpha at 60fps
6. Encode to VP9 WebM with alpha channel via FFmpeg
7. Output: `stinger-2560x1440_YYYYMMDD-HHMMSS.webm`

#### Export Options

```bash
node export-stinger.js [options]

Options:
  --fps <number>        Framerate (default: 60)
  --duration <number>   Duration in ms (default: from design.json, or 3000)
  --width <number>      Width in px (default: 2560)
  --height <number>     Height in px (default: 1440)
  --design <path>       Path to a specific design.json file
```

#### Design File Auto-Detection

The export script automatically picks the **most recently modified** `design*.json` file from the `bar-stinger-alphacup-vi/` directory. You can save multiple versions (`design.json`, `design-v2.json`, etc.) and it will always use the newest one.

To use a specific design file:
```bash
node export-stinger.js --design bar-stinger-alphacup-vi/design-v2.json
```

### 3. Use in OBS Studio

1. Add a **Media Source** in OBS
2. Select the exported `.webm` file
3. The transparent background will show through, making it a perfect stinger transition

Alternatively, use it as a **Stinger Transition**:
1. Go to **Scene Transitions** > **+** > **Stinger**
2. Select the `.webm` file
3. Set the transition point to match your animation timing

### 4. Logo Corner Animation

A separate looped animation for showing the tournament logo in a corner of the livestream.

Open `bar-stinger-alphacup-vi/logo-corner-anim.html` in a browser.

Features:
- Adjustable position and size (place anywhere on screen)
- Soft pulsing glow effect
- Periodic light sweep / glint
- 3D spin effect with per-layer depth (shield, BAR, ALPHA, αVI, CUP each at different Z-depths)
- Adjustable loop duration (3–20 seconds)
- Full editor with Save/Load Design support

Export:
```bash
npm run export-corner
```

Uses `design-corner.json` for settings. Same export options as the stinger (`--fps`, `--duration`, `--width`, `--height`, `--design`).

## Project Structure

```
BAR-livestream-stinger/
├── README.md
├── package.json
├── export-stinger.js              # Stinger export script
├── export-corner.js               # Corner logo export script
├── bar-stinger-alphacup-vi/
│   ├── stinger-v1-simple.html     # Static version (no animation)
│   ├── stinger-v2-animated.html   # Animated stinger with editor
│   ├── logo-corner-anim.html      # Looped corner logo with editor
│   ├── design.json                # Stinger editor settings
│   ├── design-corner.json         # Corner logo editor settings
│   └── assets/
│       ├── shield.svg
│       ├── bar-logo.svg
│       ├── alpha.svg
│       ├── alpha-vi.svg
│       └── cup.svg
└── stinger-*.webm                 # Exported videos (gitignored)
```

## Tech Stack

- **HTML/CSS/JS** — animation built with CSS keyframes and Web Animations API
- **Puppeteer** — headless Chromium for frame-accurate capture
- **FFmpeg** (VP9 + yuva420p) — WebM encoding with alpha transparency
- **CSS Custom Properties** — all visual parameters are editable via `--var` system

## License

This project contains assets specific to the BAR Alpha Cup VI tournament.
