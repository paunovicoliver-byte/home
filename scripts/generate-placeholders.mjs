/**
 * Generates art-directed PLACEHOLDER imagery for DRVENO.
 *
 * These are not photographs and must not be presented as DRVENO's work.
 * Replace each file in src/assets/images/ with real photography of the same
 * name (any aspect ratio works — the components read intrinsic dimensions).
 *
 *   npm run images
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = new URL('../src/assets/images/', import.meta.url);
await mkdir(OUT, { recursive: true });

const palette = {
  oak: ['#6b4a2b', '#a77b4f', '#d2ac7c'],
  walnut: ['#2e1d14', '#5a3a26', '#8a6040'],
  ash: ['#8d7a63', '#c4ad8d', '#e6d6bd'],
  aged: ['#3d3a33', '#6f685b', '#a39a87'],
};

/** Wood grain as an SVG filter. Long horizontal fibres with banding. */
function grainFilter(id, colors, { fx = 0.0022, fy = 0.09, seed = 3, oct = 4, rot = 0 } = {}) {
  const [d, m, l] = colors.map(hex);
  return `
  <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="${oct}" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  0 0 0 0 1" result="gray"/>
    <feComponentTransfer in="gray" result="band">
      <feFuncR type="table" tableValues="${d[0]} ${m[0]} ${l[0]} ${m[0]} ${d[0]} ${m[0]} ${l[0]} ${m[0]}"/>
      <feFuncG type="table" tableValues="${d[1]} ${m[1]} ${l[1]} ${m[1]} ${d[1]} ${m[1]} ${l[1]} ${m[1]}"/>
      <feFuncB type="table" tableValues="${d[2]} ${m[2]} ${l[2]} ${m[2]} ${d[2]} ${m[2]} ${l[2]} ${m[2]}"/>
      <feFuncA type="linear" slope="0" intercept="1"/>
    </feComponentTransfer>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 7}" result="fine"/>
    <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0" result="fineA"/>
    <feComposite in="fineA" in2="band" operator="over"/>
  </filter>`;
}
const hex = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));

function paperNoise(id, opacity = 0.06, seed = 1) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="${seed}"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/>
  </filter>`;
}

function vignette(w, h, strength = 0.55) {
  return `<radialGradient id="vg" cx="50%" cy="45%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${strength}"/>
    </radialGradient>`;
}

const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}${vignette(w, h)}</defs>${body}<rect width="${w}" height="${h}" fill="url(#vg)"/></svg>`;

/* ---------- Motifs ---------- */

// Planks laid side by side (table top / workbench / hero)
function planks(w, h, colors, { n = 5, seed = 2, vertical = false, gap = 6, light = 0.0 } = {}) {
  let defs = '', body = `<rect width="${w}" height="${h}" fill="#1a1612"/>`;
  const span = vertical ? w : h;
  const size = span / n;
  for (let i = 0; i < n; i++) {
    const id = `g${i}`;
    defs += grainFilter(id, colors, { seed: seed + i * 11, fx: vertical ? 0.09 : 0.0018 + (i % 3) * 0.0004, fy: vertical ? 0.0018 : 0.09 });
    const x = vertical ? i * size : 0, y = vertical ? 0 : i * size;
    const ww = vertical ? size - gap : w, hh = vertical ? h : size - gap;
    body += `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" filter="url(#${id})"/>`;
  }
  if (light) {
    defs += `<linearGradient id="lt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2d8" stop-opacity="${light}"/><stop offset=".6" stop-color="#fff2d8" stop-opacity="0"/></linearGradient>`;
    body += `<rect width="${w}" height="${h}" fill="url(#lt)"/>`;
  }
  return svg(w, h, defs, body);
}

// End grain of a log: distorted concentric rings
function endGrain(w, h, colors, seed = 4) {
  const cx = w * 0.62, cy = h * 0.55, R = Math.max(w, h) * 0.75;
  let rings = '';
  for (let r = 6; r < R; r += 7 + ((r * 13) % 9)) {
    const c = colors[(Math.floor(r / 9)) % 3];
    rings += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${3 + (r % 5)}" stroke-opacity=".85"/>`;
  }
  const defs = `
    <filter id="warp" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="2" seed="${seed}" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="90" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    ${paperNoise('pn', 0.12, seed)}
    <radialGradient id="sh" cx="${(cx / w) * 100}%" cy="${(cy / h) * 100}%" r="60%"><stop offset="0" stop-color="#f3d9a8" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient>`;
  const body = `<rect width="${w}" height="${h}" fill="${colors[1]}"/>
    <g filter="url(#warp)">${rings}</g>
    <path d="M${cx} ${cy} L${cx + R} ${cy - R * 0.08}" stroke="#1b120c" stroke-width="5" opacity=".55" filter="url(#warp)"/>
    <rect width="${w}" height="${h}" fill="url(#sh)"/>
    <rect width="${w}" height="${h}" filter="url(#pn)"/>`;
  return svg(w, h, defs, body);
}

// Wooden window in a plaster/stone wall
function windowScene(w, h, { frame = palette.oak, wall = '#d9d2c3', panes = [2, 3], aged = false, seed = 5, arch = false } = {}) {
  const fw = w * 0.46, fh = h * 0.72, fx = (w - fw) / 2, fy = h * 0.12;
  const t = Math.min(fw, fh) * 0.075; // frame thickness
  const defs = `
    ${grainFilter('fr', frame, { seed, fx: 0.003, fy: 0.12 })}
    ${grainFilter('frv', frame, { seed: seed + 3, fx: 0.12, fy: 0.003 })}
    ${paperNoise('wallN', aged ? 0.22 : 0.12, seed)}
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#cfd6cf"/><stop offset=".5" stop-color="#7f8d86"/><stop offset="1" stop-color="#3c4741"/>
    </linearGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff6e6" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="${t * 0.35}"/></filter>`;
  let body = `<rect width="${w}" height="${h}" fill="${wall}"/><rect width="${w}" height="${h}" filter="url(#wallN)"/>`;
  // reveal shadow
  body += `<rect x="${fx - t * 0.6}" y="${fy - t * 0.6}" width="${fw + t * 1.2}" height="${fh + t * 1.6}" fill="#000" opacity=".28" filter="url(#soft)"/>`;
  const clip = arch
    ? `<clipPath id="win"><path d="M${fx} ${fy + fw / 2} A ${fw / 2} ${fw / 2} 0 0 1 ${fx + fw} ${fy + fw / 2} V ${fy + fh} H ${fx} Z"/></clipPath>`
    : `<clipPath id="win"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"/></clipPath>`;
  body = body.replace('</defs>', '') ;
  let g = `<defs>${clip}</defs><g clip-path="url(#win)">`;
  g += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#glass)"/>`;
  // reflections
  g += `<path d="M${fx + fw * 0.1} ${fy + fh} L${fx + fw * 0.55} ${fy} L${fx + fw * 0.7} ${fy} L${fx + fw * 0.25} ${fy + fh}Z" fill="#fff" opacity=".10"/>`;
  // outer frame
  g += `<rect x="${fx}" y="${fy}" width="${fw}" height="${t}" filter="url(#fr)"/>`;
  g += `<rect x="${fx}" y="${fy + fh - t * 1.3}" width="${fw}" height="${t * 1.3}" filter="url(#fr)"/>`;
  g += `<rect x="${fx}" y="${fy}" width="${t}" height="${fh}" filter="url(#frv)"/>`;
  g += `<rect x="${fx + fw - t}" y="${fy}" width="${t}" height="${fh}" filter="url(#frv)"/>`;
  const [cols, rows] = panes;
  const mt = t * 0.45;
  for (let c = 1; c < cols; c++) {
    const x = fx + (fw / cols) * c - mt / 2;
    g += `<rect x="${x}" y="${fy}" width="${c === cols / 2 ? t * 0.9 : mt}" height="${fh}" filter="url(#frv)"/>`;
  }
  for (let r = 1; r < rows; r++) {
    const y = fy + (fh / rows) * r - mt / 2;
    g += `<rect x="${fx}" y="${y}" width="${fw}" height="${mt}" filter="url(#fr)"/>`;
  }
  // inner shadow lines (profile)
  g += `<rect x="${fx + t}" y="${fy + t}" width="${fw - 2 * t}" height="${fh - 2.3 * t}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="${t * 0.12}"/>`;
  if (aged) g += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#4a463d" opacity=".35" filter="url(#wallN)"/>`;
  g += `</g>`;
  // sill
  g += `<rect x="${fx - t * 1.2}" y="${fy + fh}" width="${fw + t * 2.4}" height="${t * 0.8}" filter="url(#fr)"/>`;
  g += `<rect x="${fx - t * 1.2}" y="${fy + fh + t * 0.8}" width="${fw + t * 2.4}" height="${t * 0.5}" fill="#000" opacity=".18" filter="url(#soft)"/>`;
  g += `<rect width="${w}" height="${h}" fill="url(#wallL)"/>`;
  return svg(w, h, defs, body + g);
}

// Forest: vertical trunks in mist
function forest(w, h, seed = 9) {
  let defs = `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9cbbd"/><stop offset=".55" stop-color="#8e9682"/><stop offset="1" stop-color="#3a4234"/></linearGradient>
    <filter id="bark" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.25 0.012" numOctaves="3" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.11  0 0 0 0 0.09  0 0 0 0.9 0"/></filter>
    <filter id="mist"><feGaussianBlur stdDeviation="18"/></filter>
    ${paperNoise('pn', 0.08, seed)}`;
  let body = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let layer = 0; layer < 3; layer++) {
    const count = 9 - layer * 2;
    const op = [0.35, 0.6, 0.95][layer];
    const tone = ['#5d6455', '#3b4136', '#211f1a'][layer];
    for (let i = 0; i < count; i++) {
      const tw = (w / 40) * (1 + layer * 0.9) * (0.6 + rnd());
      const x = rnd() * w;
      body += `<rect x="${x}" y="0" width="${tw}" height="${h}" fill="${tone}" opacity="${op}"/>`;
      if (layer === 2) body += `<rect x="${x}" y="0" width="${tw}" height="${h}" filter="url(#bark)" opacity=".7"/>`;
    }
    body += `<rect x="0" y="${h * (0.55 + layer * 0.1)}" width="${w}" height="${h * 0.25}" fill="#d8d9cc" opacity="${0.25 - layer * 0.06}" filter="url(#mist)"/>`;
  }
  body += `<rect width="${w}" height="${h}" fill="#1f2a1f" opacity=".18"/><rect width="${w}" height="${h}" filter="url(#pn)"/>`;
  return svg(w, h, defs, body);
}

// Panelled door
function door(w, h, colors, seed = 12) {
  const dw = w * 0.42, dh = h * 0.86, dx = (w - dw) / 2, dy = h * 0.08;
  const defs = `${grainFilter('dv', colors, { seed, fx: 0.08, fy: 0.002 })}${grainFilter('dh', colors, { seed: seed + 2, fx: 0.002, fy: 0.08 })}
    ${paperNoise('wn', 0.1, seed)}<filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>`;
  let body = `<rect width="${w}" height="${h}" fill="#bdb5a6"/><rect width="${w}" height="${h}" filter="url(#wn)"/>`;
  body += `<rect x="${dx - 22}" y="${dy - 22}" width="${dw + 44}" height="${dh + 22}" fill="#000" opacity=".3" filter="url(#soft)"/>`;
  body += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" filter="url(#dv)"/>`;
  const pad = dw * 0.12;
  const pw = (dw - pad * 3) / 2;
  const ph = [dh * 0.36, dh * 0.4];
  let y = dy + pad;
  for (const hh of ph) {
    for (let c = 0; c < 2; c++) {
      const x = dx + pad + c * (pw + pad);
      body += `<rect x="${x}" y="${y}" width="${pw}" height="${hh}" filter="url(#dh)" opacity=".9"/>`;
      body += `<rect x="${x}" y="${y}" width="${pw}" height="${hh}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="6"/>`;
      body += `<rect x="${x + 10}" y="${y + 10}" width="${pw - 20}" height="${hh - 20}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>`;
    }
    y += hh + pad;
  }
  body += `<circle cx="${dx + dw - pad * 0.6}" cy="${dy + dh * 0.52}" r="${dw * 0.018}" fill="#2a2620"/>`;
  return svg(w, h, defs, body);
}

// Table seen from low angle: top slab + legs, on paper background
function table(w, h, colors, { legs = 'straight', seed = 21, bg = '#e9e3d7' } = {}) {
  const tw = w * 0.72, tx = (w - tw) / 2, ty = h * 0.42, th = h * 0.07;
  const defs = `${grainFilter('top', colors, { seed, fx: 0.0016, fy: 0.12 })}${grainFilter('leg', colors, { seed: seed + 4, fx: 0.1, fy: 0.003 })}
    ${paperNoise('pn', 0.07, seed)}<filter id="soft"><feGaussianBlur stdDeviation="24"/></filter>
    <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#cfc6b5"/></linearGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#fl)"/><rect width="${w}" height="${h}" filter="url(#pn)"/>`;
  body += `<ellipse cx="${w / 2}" cy="${h * 0.86}" rx="${tw * 0.55}" ry="${h * 0.035}" fill="#000" opacity=".28" filter="url(#soft)"/>`;
  const lw = w * 0.035, lh = h * 0.86 - ty - th;
  const lx = legs === 'trestle' ? [tx + tw * 0.12, tx + tw * 0.88 - lw] : [tx + tw * 0.05, tx + tw * 0.95 - lw];
  for (const x of lx) body += `<rect x="${x}" y="${ty + th}" width="${lw}" height="${lh}" filter="url(#leg)"/>`;
  if (legs === 'trestle') body += `<rect x="${lx[0]}" y="${ty + th + lh * 0.7}" width="${lx[1] - lx[0] + lw}" height="${lw * 0.7}" filter="url(#top)"/>`;
  body += `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" filter="url(#top)"/>`;
  body += `<rect x="${tx}" y="${ty + th * 0.82}" width="${tw}" height="${th * 0.18}" fill="#000" opacity=".25"/>`;
  return svg(w, h, defs, body);
}

// Mountains (Switzerland) — layered ridgelines
function ridges(w, h, seed = 31) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const tones = ['#c9c6bb', '#a4a497', '#7a7e70', '#4e5448', '#2c302a'];
  let body = `<rect width="${w}" height="${h}" fill="#e2ddd1"/>`;
  tones.forEach((tone, i) => {
    let d = `M0 ${h}`;
    const base = h * (0.3 + i * 0.12);
    for (let x = 0; x <= w; x += w / 14) d += ` L${x} ${base - rnd() * h * (0.22 - i * 0.03)}`;
    d += ` L${w} ${h} Z`;
    body += `<path d="${d}" fill="${tone}"/>`;
  });
  const defs = paperNoise('pn', 0.1, seed);
  body += `<rect width="${w}" height="${h}" filter="url(#pn)"/>`;
  return svg(w, h, defs, body);
}

// Old facade with a grid of windows (heritage)
function facade(w, h, { seed = 41, aged = true } = {}) {
  const defs = `${paperNoise('pn', aged ? 0.2 : 0.1, seed)}${grainFilter('fr', palette.aged, { seed, fx: 0.004, fy: 0.1 })}
    <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5650"/><stop offset="1" stop-color="#1f2622"/></linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe8c2" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="#cbbfa8"/><rect width="${w}" height="${h}" filter="url(#pn)"/>`;
  body += `<rect y="${h * 0.48}" width="${w}" height="${h * 0.02}" fill="#a89a80"/>`;
  const cols = 4, rows = 2;
  const ww = w / (cols * 1.9), wh = h / (rows * 2.1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = (w / cols) * c + (w / cols - ww) / 2, y = h * 0.08 + r * h * 0.47;
    body += `<rect x="${x - 14}" y="${y - 14}" width="${ww + 28}" height="${wh + 34}" fill="#e3d9c6"/>`;
    body += `<rect x="${x}" y="${y}" width="${ww}" height="${wh}" fill="url(#gl)"/>`;
    body += `<rect x="${x}" y="${y}" width="${ww}" height="${wh}" fill="none" stroke="#6d5b44" stroke-width="${ww * 0.07}"/>`;
    body += `<rect x="${x + ww / 2 - ww * 0.03}" y="${y}" width="${ww * 0.06}" height="${wh}" fill="#6d5b44"/>`;
    body += `<rect x="${x}" y="${y + wh * 0.33}" width="${ww}" height="${ww * 0.05}" fill="#6d5b44"/>`;
  }
  body += `<rect width="${w}" height="${h}" fill="url(#sun)"/>`;
  return svg(w, h, defs, body);
}

// Hand-plane shavings / workbench with tool silhouettes
function bench(w, h, seed = 51) {
  const defs = `${grainFilter('b', palette.oak, { seed, fx: 0.0015, fy: 0.07 })}<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    ${grainFilter('s', palette.ash, { seed: seed + 9, fx: 0.01, fy: 0.3 })}`;
  let body = `<rect width="${w}" height="${h}" filter="url(#b)"/>`;
  return svg(w, h, defs, body);
}

/* ---------- Render ---------- */

const jobs = [
  ['hero-workshop', 2400, 1500, () => planks(2400, 1500, palette.walnut, { n: 6, seed: 7, light: 0.28 })],
  ['forest', 2000, 1400, () => forest(2000, 1400, 9)],
  ['forest-portrait', 1200, 1600, () => forest(1200, 1600, 17)],
  ['end-grain', 1600, 1600, () => endGrain(1600, 1600, ['#5b3c22', '#9c7046', '#c99c66'], 4)],
  ['windows-hero', 2000, 1400, () => windowScene(2000, 1400, { panes: [2, 3], seed: 5 })],
  ['window-traditional', 1200, 1500, () => windowScene(1200, 1500, { panes: [2, 3], seed: 8, wall: '#cfc6b4' })],
  ['window-arched', 1200, 1500, () => windowScene(1200, 1500, { panes: [2, 4], seed: 13, arch: true, frame: palette.walnut, wall: '#ddd5c5' })],
  ['window-modern', 1200, 1500, () => windowScene(1200, 1500, { panes: [1, 1], seed: 19, frame: palette.ash, wall: '#e4e0d8' })],
  ['window-before', 1600, 1200, () => windowScene(1600, 1200, { panes: [2, 2], seed: 23, aged: true, frame: palette.aged, wall: '#b9b09c' })],
  ['window-after', 1600, 1200, () => windowScene(1600, 1200, { panes: [2, 2], seed: 23, frame: palette.oak, wall: '#d8d0bf' })],
  ['heritage-facade', 2000, 1400, () => facade(2000, 1400, { seed: 41 })],
  ['heritage-library', 1600, 1200, () => facade(1600, 1200, { seed: 44, aged: false })],
  ['table-oak', 1600, 1200, () => table(1600, 1200, palette.oak, { seed: 21 })],
  ['table-farmhouse', 1600, 1200, () => table(1600, 1200, ['#5c4129', '#8d6743', '#b89069'], { seed: 26, legs: 'trestle', bg: '#e3dccd' })],
  ['table-minimal', 1600, 1200, () => table(1600, 1200, palette.ash, { seed: 29, bg: '#efebe3' })],
  ['table-top', 1600, 1200, () => planks(1600, 1200, palette.oak, { n: 4, seed: 33, gap: 3, light: 0.18 })],
  ['bench', 1600, 1200, () => table(1600, 1200, palette.walnut, { seed: 36, legs: 'trestle', bg: '#e6e0d3' })],
  ['door', 1200, 1600, () => door(1200, 1600, palette.oak, 12)],
  ['door-walnut', 1200, 1600, () => door(1200, 1600, palette.walnut, 15)],
  ['workbench', 1600, 1200, () => bench(1600, 1200, 51)],
  ['grain-walnut', 1600, 1200, () => planks(1600, 1200, palette.walnut, { n: 3, seed: 61, gap: 2 })],
  ['grain-oak', 1600, 1200, () => planks(1600, 1200, palette.oak, { n: 3, seed: 64, gap: 2, vertical: true })],
  ['switzerland', 2000, 1300, () => ridges(2000, 1300, 31)],
  ['og-default', 1200, 630, () => planks(1200, 630, palette.walnut, { n: 3, seed: 7, light: 0.2 })],
];

for (const [name, w, h, make] of jobs) {
  const file = new URL(`${name}.jpg`, OUT);
  await sharp(Buffer.from(make()), { density: 72 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(file.pathname);
  console.log('✓', name);
}
