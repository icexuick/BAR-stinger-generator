# BAR Livestream Stinger

Animated stinger/transition overlay for the **BAR Alpha Cup VI** livestream. Built as a browser-based animation with a visual editor and automated export to **WebM with alpha transparency** for use in OBS Studio.

## Preview

The stinger features:
- Diagonal wipe blades with brushed metal texture
- Animated logo build-up (shield, BAR logo, ALPHA, alphaVI, CUP)
- Shield glow effect
- Gold particle/spark explosion
- Light sweep and corner accents

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
git clone https://github.com/YOUR_USER/BAR-livestream-stinger.git
cd BAR-livestream-stinger
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
- **Loop** — auto-repeat the animation every 3 seconds
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
| **Shield** | Scale |
| **Shield Glow** | Size, Opacity, Start time, End time |
| **Blade Texture** | Opacity, Scale, Angle, Highlight |
| **Sparks** | Count, Size, Spread, Duration, Stretch, Deceleration |

All settings are automatically saved to `localStorage` and persist across browser refreshes.

#### Save / Load Design

- **Save Design** — downloads a `design.json` file with all current settings
- **Load Design** — load a previously saved design file
- **Reset** — reset all values to defaults and clear localStorage
- **Copy CSS** — copy current values as CSS custom properties

Place the `design.json` file in the `bar-stinger-alphacup-vi/` folder for the export script to use.

### 2. Export to WebM

Make sure your live server is **not** required — the export script opens the HTML file directly.

```bash
npm run export
```

This will:
1. Open the stinger in a headless Chromium browser at 2560x1440
2. Apply settings from the latest `design*.json` file
3. Set the background to transparent
4. Capture 180 frames (60fps x 3s) as PNG with alpha
5. Encode to VP9 WebM with alpha channel via FFmpeg
6. Output: `stinger-2560x1440_YYYYMMDD-HHMMSS.webm`

#### Export Options

```bash
node export-stinger.js [options]

Options:
  --fps <number>        Framerate (default: 60)
  --duration <number>   Duration in ms (default: 3000)
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

## Project Structure

```
BAR-livestream-stinger/
├── README.md
├── package.json
├── export-stinger.js              # Puppeteer + FFmpeg export script
├── bar-stinger-alphacup-vi/
│   ├── stinger-v1-simple.html     # Static version (no animation)
│   ├── stinger-v2-animated.html   # Animated version with editor
│   ├── design.json                # Saved editor settings
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
