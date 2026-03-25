/**
 * BAR Stinger Export — Puppeteer frame capture + FFmpeg VP9 alpha WebM
 *
 * Usage:
 *   node export-stinger.js [--event alphacup-vi] [--fps 60] [--duration 3000] [--width 2560] [--height 1440]
 *
 * Reads design.json from events/<event>/ for editor settings.
 * Use "Save Design" in the browser editor to create this file.
 *
 * Requirements:
 *   - Node.js + Puppeteer (npm install puppeteer)
 *   - FFmpeg with libvpx-vp9 (https://ffmpeg.org/download.html or: choco install ffmpeg)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ===== CONFIG =====
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const FPS = parseInt(getArg('--fps', '60'));
let DURATION_MS = parseInt(getArg('--duration', '0')); // 0 = auto-detect from design
const WIDTH = parseInt(getArg('--width', '2560'));
const HEIGHT = parseInt(getArg('--height', '1440'));
const EVENT = getArg('--event', 'alphacup-vi');

const STINGER_FILE = path.resolve(__dirname, 'stinger.html');
const EVENT_DIR = path.resolve(__dirname, 'events', EVENT);
const FILE_URL = `file:///${STINGER_FILE.replace(/\\/g, '/')}?event=${EVENT}`;
const FRAMES_DIR = path.join(__dirname, 'frames');
const NOW = new Date();
const DATE_SUFFIX = `${NOW.getFullYear()}${String(NOW.getMonth()+1).padStart(2,'0')}${String(NOW.getDate()).padStart(2,'0')}-${String(NOW.getHours()).padStart(2,'0')}${String(NOW.getMinutes()).padStart(2,'0')}${String(NOW.getSeconds()).padStart(2,'0')}`;
const OUTPUT_FILE = path.join(__dirname, `stinger-${EVENT}-${WIDTH}x${HEIGHT}_${DATE_SUFFIX}.webm`);

// ===== MAIN =====
(async () => {
  console.log('=== BAR Stinger Export ===');
  console.log(`Event: ${EVENT}`);
  console.log(`Resolution: ${WIDTH}x${HEIGHT}`);
  console.log(`Source: ${STINGER_FILE}`);

  // Load design config — find the most recently modified design*.json
  let designConfig = null;
  let designFile = null;

  // Check for explicit --design flag first
  const explicitDesign = getArg('--design', null);
  if (explicitDesign) {
    const p = path.resolve(explicitDesign);
    if (fs.existsSync(p)) {
      designFile = p;
    } else {
      console.error(`ERROR: Design file not found: ${p}`);
      process.exit(1);
    }
  } else {
    // Auto-detect: find all design*.json files in the event dir and pick newest
    if (fs.existsSync(EVENT_DIR)) {
      const designFiles = fs.readdirSync(EVENT_DIR)
        .filter(f => f.match(/^design.*\.json$/i) && !f.match(/corner/i))
        .map(f => {
          const fp = path.join(EVENT_DIR, f);
          return { path: fp, name: f, mtime: fs.statSync(fp).mtimeMs };
        })
        .sort((a, b) => b.mtime - a.mtime);

      if (designFiles.length > 0) {
        designFile = designFiles[0].path;
        if (designFiles.length > 1) {
          console.log(`  Found ${designFiles.length} design files, using newest:`);
          designFiles.forEach((f, i) => {
            const date = new Date(f.mtime).toLocaleString();
            console.log(`    ${i === 0 ? '>' : ' '} ${f.name} (${date})`);
          });
        }
      }
    }
  }

  if (designFile) {
    designConfig = JSON.parse(fs.readFileSync(designFile, 'utf-8'));
    console.log(`Design: ${designFile} (${Object.keys(designConfig).length} settings)`);
  } else {
    console.log('Design: no design*.json found, using defaults');
    console.log('  Tip: Use "Save Design" in the browser editor to save your settings.');
  }
  // Resolve duration: CLI flag > design file > default 3000ms
  if (DURATION_MS === 0) {
    if (designConfig && designConfig.totalDuration) {
      DURATION_MS = Math.round(parseFloat(designConfig.totalDuration) * 1000);
    } else {
      DURATION_MS = 3000;
    }
  }
  const TOTAL_FRAMES = Math.ceil((DURATION_MS / 1000) * FPS);
  const FRAME_INTERVAL = 1000 / FPS;

  console.log(`Duration: ${DURATION_MS}ms | FPS: ${FPS} | Frames: ${TOTAL_FRAMES}`);
  console.log('');

  // Check source file
  if (!fs.existsSync(STINGER_FILE)) {
    console.error(`ERROR: Stinger file not found: ${STINGER_FILE}`);
    process.exit(1);
  }

  // Check FFmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    console.error('ERROR: FFmpeg not found. Install it first:');
    console.error('  Windows: choco install ffmpeg  (or download from https://ffmpeg.org)');
    console.error('  Mac:     brew install ffmpeg');
    console.error('  Linux:   sudo apt install ffmpeg');
    process.exit(1);
  }

  // Clean/create frames dir
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // ===== STEP 1: Capture frames =====
  console.log('Step 1/2: Capturing frames...');
  console.log('  Launching browser...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      '--disable-gpu',
      '--no-sandbox',
      '--allow-file-access-from-files',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  console.log('  Loading page...');
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for SVG objects to render
  console.log('  Waiting for assets...');
  await new Promise(r => setTimeout(r, 2000));

  // Use CDP to enable transparent screenshots
  const client = await page.createCDPSession();
  await client.send('Emulation.setDefaultBackgroundColorOverride', {
    color: { r: 0, g: 0, b: 0, a: 0 },
  });

  // Apply design config and prepare animations
  console.log('  Applying design & collecting animations...');
  const animCount = await page.evaluate((config) => {
    // Transparent background
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';

    // Hide editor & controls
    const controls = document.querySelector('.controls');
    if (controls) controls.style.display = 'none';
    const editor = document.querySelector('.editor-panel');
    if (editor) editor.style.display = 'none';

    // Apply design config if provided — set all editor inputs then let applyAllAnimations() handle it
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        if (key.startsWith('--')) {
          // CSS custom property
          const input = document.querySelector(`[data-var="${key}"]`);
          const unit = input ? (input.dataset.unit || '') : '';
          document.documentElement.style.setProperty(key, value + unit);
          if (input) input.value = value;
        } else {
          // Timing key (data-key)
          const input = document.querySelector(`[data-key="${key}"]`);
          if (input) input.value = value;
        }
      }
    }

    // Apply all dynamic animations (blades, logo parts, glow, flash, sweep, corners)
    if (typeof applyAllAnimations === 'function') {
      applyAllAnimations();
    }

    // Generate particles with current settings
    if (typeof generateParticles === 'function') {
      generateParticles(document.getElementById('particles'));
    }

    // Collect all animations and pause
    const allAnimations = [];
    document.getAnimations().forEach(a => allAnimations.push(a));
    document.querySelectorAll('*').forEach(el => {
      el.getAnimations().forEach(a => {
        if (!allAnimations.includes(a)) allAnimations.push(a);
      });
    });
    allAnimations.forEach(a => a.pause());
    window.__allAnimations = allAnimations;
    return allAnimations.length;
  }, designConfig);

  console.log(`  Found ${animCount} animations.`);
  console.log('  Capturing...\n');

  // Capture frames
  const startTime = performance.now();
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const timeMs = i * FRAME_INTERVAL;

    await page.evaluate((t) => {
      window.__allAnimations.forEach(a => { a.currentTime = t; });
    }, timeMs);

    const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({
      path: framePath,
      type: 'png',
      omitBackground: true,
    });

    if (i % 10 === 0 || i === TOTAL_FRAMES - 1) {
      const pct = Math.round((i / (TOTAL_FRAMES - 1)) * 100);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\r  Frame ${i + 1}/${TOTAL_FRAMES} (${pct}%) — ${elapsed}s`);
    }
  }
  const captureTime = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Done in ${captureTime}s.\n`);

  await browser.close();

  // ===== STEP 2: Encode to WebM =====
  console.log('Step 2/2: Encoding to WebM (VP9 + alpha)...');

  const ffmpegCmd = [
    'ffmpeg', '-y',
    '-framerate', String(FPS),
    '-i', `"${path.join(FRAMES_DIR, 'frame_%05d.png')}"`,
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p',
    '-b:v', '4M',
    '-auto-alt-ref', '0',
    '-metadata', `title="BAR Alpha Cup VI Stinger"`,
    `"${OUTPUT_FILE}"`,
  ].join(' ');

  console.log(`  ${ffmpegCmd}\n`);

  try {
    execSync(ffmpegCmd, { stdio: 'inherit' });
  } catch (e) {
    console.error('\nFFmpeg encoding failed. Check the error above.');
    process.exit(1);
  }

  // Stats
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n=== Export Complete ===');
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Size:   ${sizeMB} MB`);
  console.log(`Specs:  ${WIDTH}x${HEIGHT} @ ${FPS}fps, VP9 + alpha, ${(DURATION_MS / 1000).toFixed(1)}s`);

  // Cleanup frames
  console.log('\nCleaning up frames...');
  fs.rmSync(FRAMES_DIR, { recursive: true });
  console.log('Done!');
})();
