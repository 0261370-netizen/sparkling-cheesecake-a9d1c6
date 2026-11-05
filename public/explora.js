/* The Design Library — Exploración creativa (Creative Gym).
   Shared core for Color, Citas creativas, Bitácora silvestre and the notebook:
   color math, daily picks (no AI: prepared content + color rules), personal storage
   (localStorage keys synced by cloud.js), personal moodboards, and the actions
   "Guardar · Crear moodboard · Llevar al cuaderno · Crear ficha de concepto".
   Personal keys: tdl-palettes, tdl-quests, tdl-bio, tdl-boards, tdl-sketches, tdl-ideas. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const put = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); document.dispatchEvent(new CustomEvent('tdx:change', { detail: { key: k } })); return true; }
    catch { toast('No se pudo guardar: el almacenamiento de este navegador está lleno o bloqueado. Libera espacio (por ejemplo, borra bocetos antiguos) e inténtalo de nuevo.', true); return false; }
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- toast ----------
  function toast(msg, isErr) {
    let t = document.getElementById('tdxToast');
    if (!t) { t = document.createElement('div'); t.id = 'tdxToast'; t.className = 'tdx-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.toggle('err', !!isErr); t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), isErr ? 6000 : 2600);
  }

  // ---------- dates (America/Mexico_City, like the rest of the daily content) ----------
  const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dayKey = (d = new Date()) => keyFmt.format(d);
  const dayNum = (k = dayKey()) => Math.floor(new Date(k + 'T12:00:00Z').getTime() / 864e5);
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const niceDate = (ts) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ts));

  // ---------- color math ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const normHex = h => { h = String(h || '').trim().replace(/^#/, ''); if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map(c => c + c).join(''); return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toLowerCase() : null; };
  const hexToRgb = h => { h = normHex(h) || '#000000'; return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return [h, s * 100, l * 100];
  }
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }
  const hsl = (h, s, l) => rgbToHex(...hslToRgb(h, s, l));
  const toHsl = hex => rgbToHsl(...hexToRgb(hex));
  const lum = hex => { const [r, g, b] = hexToRgb(hex).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const textOn = hex => contrast(hex, '#ffffff') >= contrast(hex, '#1d2b25') ? '#ffffff' : '#1d2b25';
  const isWarm = hex => { const [h, s] = toHsl(hex); return s > 12 && (h < 75 || h > 330); };
  const isCool = hex => { const [h, s] = toHsl(hex); return s > 12 && h > 150 && h < 290; };

  const HARMONIES = {
    triada: { label: 'Tríada', angles: [0, 120, 240], why: 'Tres matices separados 120° en la rueda forman un triángulo equilátero: hay contraste entre los tres, pero ninguno domina por naturaleza. Funciona mejor si eliges uno como protagonista y bajas la saturación de los otros.' },
    complementario: { label: 'Complementarios', angles: [0, 180], why: 'Dos matices opuestos (180°). Es el contraste de matiz más fuerte posible: cada color hace que el otro se vea más intenso. Úsalo con mucha diferencia de proporción, no a partes iguales.' },
    dividido: { label: 'Complementarios divididos', angles: [0, 150, 210], why: 'En vez del opuesto exacto, se toman sus dos vecinos (a 150° y 210°). Conserva la tensión del complementario con menos choque y más matices para trabajar.' },
    analogo: { label: 'Análogos', angles: [-30, -15, 0, 15, 30], why: 'Matices vecinos dentro de un arco de unos 60°. Se sienten coherentes y tranquilos porque comparten parte de su color; el contraste debe venir del valor (claro/oscuro) y no del matiz.' },
    mono: { label: 'Monocromático', angles: [0], why: 'Un único matiz variando luminosidad y saturación. La unidad es total; el interés depende del contraste de valor y de las texturas o materiales que lo acompañen.' },
  };
  const HKEYS = Object.keys(HARMONIES);
  // Five swatches for a harmony around a base [h,s,l]. jitter (0–1 random fn) varies values.
  function harmony([h, s, l], type, r) {
    const j = (n) => r ? (r() - .5) * n : 0;
    const S = v => clamp(v, 6, 96), L = v => clamp(v, 8, 94);
    let out;
    switch (type) {
      case 'complementario': out = [[h, s, l], [h, S(s - 18 + j(8)), L(l + 24 + j(6))], [h, S(s + 4), L(l - 22 + j(6))], [h + 180, s, l], [h + 180, S(s - 25), L(l + 26 + j(6))]]; break;
      case 'dividido': out = [[h, s, l], [h + 150, s, L(l + j(10))], [h + 210, s, L(l + j(10))], [h, S(s - 30), L(l + 30)], [h, S(s + 6), L(l - 26)]]; break;
      case 'analogo': out = [[h - 30, S(s - 8), L(l + 16 + j(6))], [h - 15, s, L(l + 6)], [h, s, l], [h + 15, s, L(l - 10)], [h + 30, S(s - 6), L(l - 22 + j(6))]]; break;
      case 'mono': out = [[h, S(s - 30), L(l + 32)], [h, S(s - 12), L(l + 16)], [h, s, l], [h, S(s + 6), L(l - 16)], [h, S(s - 4), L(l - 30)]]; break;
      default: out = [[h, s, l], [h + 120, s, L(l + j(8))], [h + 240, s, L(l + j(8))], [h, S(s - 35), L(l + 32)], [h + 120, S(s - 10), L(l - 26)]];
    }
    return out.map(([a, b, c]) => hsl(a, b, c));
  }
  // New palette around locked colours. slots: [{hex, locked}].
  function regenerate(slots, type, rnd = Math.random) {
    const locked = slots.filter(s => s.locked);
    const t = type || HKEYS[Math.floor(rnd() * HKEYS.length)];
    const base = locked.length ? toHsl(locked[0].hex) : [rnd() * 360, 35 + rnd() * 45, 38 + rnd() * 26];
    const fresh = harmony(base, t, rnd);
    const pool = fresh.filter(c => !locked.some(l => l.hex === c));
    let i = 0;
    return { type: t, slots: slots.map(s => s.locked ? s : { hex: pool[i++ % pool.length] || fresh[0], locked: false }) };
  }

  // ---------- palette of the day (rules, no AI) ----------
  const FAMILIES = [
    [0, 14, 'rojo', ['Granada', 'Chile seco', 'Jamaica']], [14, 38, 'naranja', ['Cempasúchil', 'Terracota', 'Barro cocido']],
    [38, 62, 'amarillo', ['Maíz', 'Cera de abeja', 'Polen']], [62, 95, 'lima', ['Brote', 'Liquen', 'Hoja nueva']],
    [95, 160, 'verde', ['Musgo', 'Vivero', 'Helecho']], [160, 195, 'turquesa', ['Laguna', 'Cenote', 'Jade']],
    [195, 245, 'azul', ['Añil', 'Lluvia', 'Pizarra']], [245, 285, 'violeta', ['Jacaranda', 'Lavanda', 'Amatista']],
    [285, 330, 'magenta', ['Bugambilia', 'Pitaya', 'Ciruela']], [330, 361, 'rosa', ['Rosa mexicano', 'Coral', 'Flor de cactus']],
  ];
  const family = h => { h = ((h % 360) + 360) % 360; return FAMILIES.find(f => h >= f[0] && h < f[1]) || FAMILIES[0]; };
  const MODIFIERS = { triada: ['de mercado', 'de feria', 'en tres tiempos'], complementario: ['a contraluz', 'en diálogo', 'con su opuesto'], dividido: ['entre vecinos', 'de taller', 'en tensión suave'], analogo: ['al atardecer', 'en calma', 'de sendero'], mono: ['en sombra', 'de un solo tono', 'en capas'] };
  const APPLY = [
    (n, c) => `Cartel: fondo en ${c[0]} (60%), titular en ${c[2]} (30%) y un solo detalle en ${c[4]} (10%).`,
    (n, c) => `Interior: muros en ${c[0]}, tapicería en ${c[2]} y cerámica o cojines en ${c[3]} como acento.`,
    (n, c) => `Objeto: una lámpara con pantalla en ${c[1]}, cuerpo en ${c[2]} y el interruptor en ${c[4]} para que se encuentre a simple vista.`,
    (n, c) => `Mobiliario: estructura en ${c[2]}, superficie en ${c[0]} y el canto o los herrajes en ${c[3]}.`,
    (n, c) => `Empaque: caja en ${c[0]}, ilustración en ${c[1]} y ${c[2]}, y la tipografía en ${c[4]}.`,
  ];
  function dailyPalette(k = dayKey()) {
    const n = dayNum(k), r = rng(n * 2654435761 >>> 0);
    const h = (n * 137.508) % 360, type = HKEYS[n % HKEYS.length];
    const s = 38 + r() * 40, l = 40 + r() * 20;
    const colors = harmony([h, s, l], type, r);
    const fam = family(h), mods = MODIFIERS[type];
    const name = `${fam[3][n % 3]} ${mods[Math.floor(n / 5) % 3]}`;
    const warm = colors.filter(isWarm).length, cool = colors.filter(isCool).length;
    const temp = warm > cool ? 'Predominan los colores cálidos, que tienden a sentirse cercanos y a avanzar visualmente.' : cool > warm ? 'Predominan los colores fríos, que suelen percibirse más distantes y calmados.' : 'Cálidos y fríos están equilibrados, así que la proporción decidirá el carácter.';
    const why = `${HARMONIES[type].label} construida a partir de un ${fam[2]} (${Math.round(h)}°). ${HARMONIES[type].why.split('. ')[0]}. ${temp}`;
    return { id: 'dia-' + k, day: k, name, type, colors, why, apply: APPLY[n % APPLY.length](name, colors.map(c => c.toUpperCase())) };
  }

  // ---------- photo → palette (k-means, fully in the browser) ----------
  function loadImageFile(file) {
    return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); }; im.src = u; });
  }
  function extractPalette(img, k = 5) {
    const S = 110, f = Math.min(1, S / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round((img.naturalWidth || img.width) * f)); c.height = Math.max(1, Math.round((img.naturalHeight || img.height) * f));
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height).data, px = [];
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
    if (!px.length) return [];
    const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cents = [px[Math.floor(rnd() * px.length)].slice()];
    while (cents.length < k) {
      const w = px.map(p => Math.min(...cents.map(cn => dist(p, cn)))), tot = w.reduce((a, b) => a + b, 0);
      if (!tot) break; let r = rnd() * tot, i = 0; while ((r -= w[i]) > 0 && i < px.length - 1) i++; cents.push(px[i].slice());
    }
    const asg = new Array(px.length).fill(0);
    for (let it = 0; it < 10; it++) {
      px.forEach((p, i) => { let b = 0, bd = Infinity; cents.forEach((cn, j) => { const dd = dist(p, cn); if (dd < bd) { bd = dd; b = j; } }); asg[i] = b; });
      const sum = cents.map(() => [0, 0, 0, 0]);
      px.forEach((p, i) => { const s = sum[asg[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      sum.forEach((s, j) => { if (s[3]) cents[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
    }
    const counts = cents.map((_, j) => asg.filter(l => l === j).length);
    return cents.map((cn, j) => ({ hex: rgbToHex(...cn), share: counts[j] / px.length })).filter(c => c.share > 0).sort((a, b) => b.share - a.share);
  }
  // Downscale an image file to a JPEG data URL (keeps localStorage and the cloud small).
  async function compressImage(file, max = 1200, q = .72) {
    const im = await loadImageFile(file);
    const w0 = im.naturalWidth, h0 = im.naturalHeight, f = Math.min(1, max / Math.max(w0, h0));
    const c = document.createElement('canvas'); c.width = Math.round(w0 * f); c.height = Math.round(h0 * f);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
    return { data: c.toDataURL('image/jpeg', q), img: im, width: c.width, height: c.height };
  }

  // ---------- images (Netlify Image CDN with graceful fallback to the source) ----------
  const cdn = (src, w) => `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&q=70`;
  function picture(im, { sizes = '(max-width: 700px) 100vw, 50vw', alt = '', cls = '', eager = false, widths = [480, 800, 1200] } = {}) {
    if (!im || !im.src) return '';
    const set = widths.map(w => `${cdn(im.src, w)} ${w}w`).join(', ');
    return `<img class="${cls}" src="${cdn(im.src, widths[1] || 800)}" srcset="${set}" sizes="${sizes}" alt="${esc(alt)}" width="${im.w || 1200}" height="${im.h || 900}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-raw="${esc(im.src)}">`;
  }
  document.addEventListener('error', ev => {
    const im = ev.target;
    if (im && im.tagName === 'IMG' && im.dataset.raw && im.getAttribute('src') !== im.dataset.raw) { im.removeAttribute('srcset'); im.src = im.dataset.raw; }
  }, true);

  // ---------- saved palettes (tdl-palettes, shared with "Paleta desde mis fotos") ----------
  const PAL = 'tdl-palettes';
  const palettes = {
    all: () => (Array.isArray(get(PAL, [])) ? get(PAL, []) : []),
    list: () => palettes.all().filter(p => p && !p.deleted && Array.isArray(p.colors) && p.colors.length).sort((a, b) => (b.updated || 0) - (a.updated || 0)),
    find: id => palettes.list().find(p => p.id === id),
    save(p) {
      const all = palettes.all();
      const colors = (p.colors || []).map(normHex).filter(Boolean).slice(0, 6);
      if (!colors.length) return null;
      // Avoid duplicates: same colors + same name → update instead of adding.
      const sig = colors.join(',');
      const dupe = all.find(x => x && !x.deleted && x.id !== p.id && Array.isArray(x.colors) && x.colors.join(',') === sig && (x.name || '') === (p.name || ''));
      const id = p.id || dupe?.id || uid();
      const prev = all.find(x => x.id === id) || {};
      const rec = { ...prev, id, name: String(p.name || prev.name || 'Mi paleta').slice(0, 60), colors, date: prev.date || niceDate(Date.now()), harmony: p.harmony || prev.harmony || '', source: p.source || prev.source || null, links: p.links || prev.links || [], note: p.note ?? prev.note ?? '', updated: Date.now() };
      if (prev.thumb) rec.thumb = prev.thumb; if (p.thumb) rec.thumb = p.thumb;
      const out = all.filter(x => x && x.id !== id); out.push(rec);
      return put(PAL, out) ? rec : null;
    },
    remove(id) { const out = palettes.all().filter(x => x && x.id !== id); out.push({ id, deleted: true, updated: Date.now() }); return put(PAL, out); },
  };

  // ---------- personal moodboards (tdl-boards) ----------
  const BOARDS = 'tdl-boards';
  const boards = {
    all: () => (Array.isArray(get(BOARDS, [])) ? get(BOARDS, []) : []),
    list: () => boards.all().filter(b => b && !b.deleted && b.title).sort((a, b) => (b.updated || 0) - (a.updated || 0)),
    find: id => boards.list().find(b => b.id === id),
    write(b) { const out = boards.all().filter(x => x && x.id !== b.id); out.push({ ...b, updated: Date.now() }); return put(BOARDS, out); },
    create(title, item) { const b = { id: uid(), title: String(title || 'Moodboard sin título').slice(0, 80), note: '', items: item ? [itemOf(item)] : [], created: Date.now() }; return boards.write(b) ? b : null; },
    add(id, item) {
      const b = boards.find(id); if (!b) return false;
      const it = itemOf(item);
      if (b.items.some(x => x.kind === it.kind && x.ref === it.ref && (it.kind !== 'palette' || x.colors?.join() === it.colors?.join()))) return 'dupe';
      b.items = [...b.items, it]; return boards.write(b);
    },
    removeItem(id, itemId) { const b = boards.find(id); if (!b) return false; b.items = b.items.filter(x => x.id !== itemId); return boards.write(b); },
    rename(id, title, note) { const b = boards.find(id); if (!b) return false; if (title != null) b.title = String(title).slice(0, 80) || b.title; if (note != null) b.note = String(note).slice(0, 600); return boards.write(b); },
    remove(id) { const out = boards.all().filter(x => x && x.id !== id); out.push({ id, deleted: true, updated: Date.now() }); return put(BOARDS, out); },
  };
  // A board item keeps a link to its origin so an idea remembers where it came from.
  function itemOf(o) {
    return { id: uid(), kind: o.kind, ref: String(o.ref || o.id || ''), label: String(o.label || o.title || '').slice(0, 140), colors: Array.isArray(o.colors) ? o.colors.slice(0, 6) : undefined, img: o.img && !/^data:/.test(o.img) ? o.img : undefined, url: o.url || '', added: Date.now() };
  }

  // ---------- notebook handoff + sketches ----------
  const KIND_LABEL = { palette: 'Paleta', quest: 'Cita creativa', bio: 'Bitácora silvestre', lesson: 'Ejercicio de color', note: 'Nota', concept: 'Ficha de concepto', sketch: 'Boceto', board: 'Moodboard' };
  // Opens the notebook with the prompt and the original reference kept together.
  function toNotebook(o, tab = 'notas') {
    const h = { kind: o.kind, ref: o.ref || o.id || '', label: o.label || o.title || '', url: o.url || '', prompt: o.prompt || '', colors: o.colors || [], img: o.img || '', at: Date.now(), tab };
    try { localStorage.setItem('tdl-handoff', JSON.stringify(h)); } catch { toast('No se pudo abrir el cuaderno con esta referencia', true); return; }
    location.href = '/cuaderno#' + (tab === 'bocetos' ? 'bocetos' : 'notas');
  }
  function toConcept(src) {
    if (window.Lab && typeof Lab.open === 'function') { Lab.open(src); return; }
    toast('Abre la biblioteca para crear la ficha'); location.href = '/#gym';
  }
  const sketches = () => (Array.isArray(get('tdl-sketches', [])) ? get('tdl-sketches', []) : []).filter(s => s && s.id && s.img);
  const notes = () => (Array.isArray(get('tdl-ideas', [])) ? get('tdl-ideas', []) : []).filter(n => n && typeof n.text === 'string');

  // Link any item to a target. Used by "Adjuntar a…" and palette relations.
  function attach(target, payload) {
    // target: {kind:'note'|'quest'|'bio'|'concept'|'board', id}
    // payload: {kind:'sketch', id, img, title} | {kind:'palette', id, name, colors}
    if (target.kind === 'note') {
      const all = get('tdl-ideas', []); const n = all.find(x => x && x.id === target.id); if (!n) return false;
      if (payload.kind === 'sketch') n.sketches = [...new Set([...(n.sketches || []), payload.id])];
      if (payload.kind === 'palette') { n.palettes = (n.palettes || []).filter(p => p.id !== payload.id); n.palettes.push({ id: payload.id, name: payload.name, colors: payload.colors }); }
      n.updated = Date.now(); return put('tdl-ideas', all);
    }
    if (target.kind === 'quest') {
      const all = get('tdl-quests', []); let q = all.find(x => x && x.id === target.id);
      if (!q) { q = { id: target.id, status: 'saved', savedAt: Date.now() }; all.push(q); }
      if (payload.kind === 'sketch') q.sketches = [...new Set([...(q.sketches || []), payload.id])];
      if (payload.kind === 'palette') q.palette = payload.colors;
      q.updated = Date.now(); return put('tdl-quests', all);
    }
    if (target.kind === 'bio') {
      const st = bioState(); let r = st.refs.find(x => x.id === target.id);
      if (!r) { r = { id: target.id, cols: [], note: '', saved: Date.now() }; st.refs.push(r); }
      if (payload.kind === 'sketch') r.sketches = [...new Set([...(r.sketches || []), payload.id])];
      r.updated = Date.now(); return put('tdl-bio', st);
    }
    if (target.kind === 'concept') {
      let all; try { all = JSON.parse(localStorage.getItem('tdl-concepts') || '[]'); } catch { all = []; }
      const c = all.find(x => x && x.id === target.id); if (!c) return false;
      c.create = c.create || {};
      if (payload.kind === 'sketch') { c.create.sketches = c.create.sketches || []; if (!c.create.sketches.includes(payload.img)) c.create.sketches.push(payload.img); }
      if (payload.kind === 'palette') { c.connect = c.connect || { items: [], note: '' }; const line = `Paleta «${payload.name}»: ${payload.colors.join(' ')}`; if (!String(c.connect.note || '').includes(line)) c.connect.note = [c.connect.note, line].filter(Boolean).join('\n'); }
      c.updated = Date.now();
      const ok = put('tdl-concepts', all); document.dispatchEvent(new CustomEvent('lab:change')); return ok;
    }
    if (target.kind === 'board') return boards.add(target.id, payload.kind === 'sketch' ? { kind: 'sketch', ref: payload.id, label: payload.title } : { kind: 'palette', ref: payload.id, label: payload.name, colors: payload.colors });
    return false;
  }

  // ---------- bio state (tdl-bio): {cols:[{id,name}], refs:[{id, cols:[], note, sketches:[]}]} ----------
  function bioState() {
    const s = get('tdl-bio', {}) || {};
    return { cols: Array.isArray(s.cols) ? s.cols.filter(c => c && c.id) : [], refs: Array.isArray(s.refs) ? s.refs.filter(r => r && r.id) : [] };
  }
  // ---------- quests state (tdl-quests): [{id, status:'saved'|'done', results, reflection, photos, sketches, updated}] ----------
  const questState = () => (Array.isArray(get('tdl-quests', [])) ? get('tdl-quests', []) : []).filter(q => q && q.id);

  // ---------- dialogs ----------
  function dialog({ title, body, wide, onMount }) {
    const d = document.createElement('dialog');
    d.className = 'tdx-dialog' + (wide ? ' wide' : '');
    d.setAttribute('aria-labelledby', 'tdxDlgT');
    d.innerHTML = `<div class="tdx-dlg-head"><h2 id="tdxDlgT">${esc(title)}</h2><button type="button" class="tdx-x" data-close aria-label="Cerrar">×</button></div><div class="tdx-dlg-body">${body}</div>`;
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => d.remove());
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    onMount && onMount(d);
    return d;
  }

  // "Añadir a moodboard" picker. item: {kind, ref, label, colors?, img?, url?}
  function pickBoard(item) {
    const list = boards.list();
    dialog({
      title: 'Añadir a un moodboard',
      body: `<p class="tdx-muted">Tus moodboards personales reúnen paletas, referencias, aventuras y bocetos. Cada elemento conserva el enlace a su origen.</p>
        ${list.length ? `<div class="tdx-pick">${list.map(b => `<button type="button" data-b="${b.id}"><b>${esc(b.title)}</b><small>${b.items.length} elemento${b.items.length === 1 ? '' : 's'}</small></button>`).join('')}</div>` : ''}
        <form class="tdx-inline" data-new><label class="tdx-lbl">Nuevo moodboard<input name="t" maxlength="80" required placeholder="Ej.: Lámpara de nervaduras"></label><button class="tdx-btn">Crear y añadir</button></form>`,
      onMount: d => {
        d.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const r = boards.add(b.dataset.b, item); toast(r === 'dupe' ? 'Ya estaba en ese moodboard' : r ? 'Añadido al moodboard' : 'No se pudo añadir', !r); if (r) d.close(); });
        d.querySelector('[data-new]').onsubmit = e => { e.preventDefault(); const b = boards.create(e.target.t.value.trim(), item); if (b) { toast(`Moodboard «${b.title}» creado`); d.close(); } };
        setTimeout(() => d.querySelector('input')?.focus(), 30);
      },
    });
  }

  // Relate a palette with moodboards, notes or concept cards.
  function relatePalette(p, done) {
    const ns = notes().filter(n => n.id).slice(-30).reverse();
    const cs = window.Lab ? Lab.list() : [];
    const bs = boards.list();
    const has = (kind, id) => (p.links || []).some(l => l.kind === kind && l.id === id);
    const opt = (kind, id, label) => `<label class="tdx-check"><input type="checkbox" data-k="${kind}" value="${esc(id)}" data-label="${esc(label)}" ${has(kind, id) ? 'checked' : ''}> ${esc(label)}</label>`;
    dialog({
      title: `Relacionar «${p.name}»`, wide: true,
      body: `<div class="tdx-rel"><section><h3>Moodboards</h3>${bs.length ? bs.map(b => opt('board', b.id, b.title)).join('') : '<p class="tdx-muted">Aún no tienes moodboards.</p>'}<form class="tdx-inline" data-nb><input name="t" maxlength="80" placeholder="Nuevo moodboard" aria-label="Nombre del nuevo moodboard"><button class="tdx-btn ghost">Crear</button></form></section>
        <section><h3>Notas del cuaderno</h3>${ns.length ? ns.map(n => opt('note', n.id, n.title || n.text.slice(0, 60))).join('') : '<p class="tdx-muted">Aún no hay notas con identificador. Usa «Llevar al cuaderno» para crear una.</p>'}</section>
        <section><h3>Fichas de concepto</h3>${cs.length ? cs.map(c => opt('concept', c.id, Lab.nameOf(c))).join('') : '<p class="tdx-muted">Aún no tienes fichas de concepto.</p>'}</section></div>
        <div class="tdx-row end"><button type="button" class="tdx-btn" data-ok>Guardar relaciones</button></div>`,
      onMount: d => {
        d.querySelector('[data-nb]').onsubmit = e => { e.preventDefault(); const t = e.target.t.value.trim(); if (!t) return; const b = boards.create(t); if (b) { const sec = e.target.closest('section'); e.target.insertAdjacentHTML('beforebegin', opt('board', b.id, b.title)); sec.querySelector(`[value="${b.id}"]`).checked = true; e.target.reset(); sec.querySelector('.tdx-muted')?.remove(); } };
        d.querySelector('[data-ok]').onclick = () => {
          const picked = [...d.querySelectorAll('input[type=checkbox]:checked')].map(i => ({ kind: i.dataset.k, id: i.value, label: i.dataset.label }));
          const added = picked.filter(l => !has(l.kind, l.id));
          added.forEach(l => attach(l, { kind: 'palette', id: p.id, name: p.name, colors: p.colors }));
          const rec = palettes.save({ ...p, links: picked });
          if (rec) { toast(picked.length ? `Paleta relacionada con ${picked.length} elemento${picked.length === 1 ? '' : 's'}` : 'Relaciones quitadas'); d.close(); done && done(rec); }
        };
      },
    });
  }

  // Pick where to attach a sketch.
  function pickAttachTarget(payload, extra = {}) {
    const ns = notes().filter(n => n.id).slice(-25).reverse();
    const qs = questState().filter(q => !q.deleted);
    const quests = window.TDX_DATA ? qs.map(q => ({ q, d: TDX_DATA.QUESTS.find(x => x.id === q.id) })).filter(x => x.d) : [];
    const refs = bioState().refs.filter(r => !r.deleted).map(r => (window.TDX_DATA?.BIO || []).find(b => b.id === r.id) || ((window.TDX_SPECIES?.SPECIES || []).find(b => b.id === r.id) && { id: r.id, title: TDX_SPECIES.SPECIES.find(b => b.id === r.id).name })).filter(Boolean);
    const cs = window.Lab ? Lab.list() : [];
    const bs = boards.list();
    const group = (kind, title, items) => `<section><h3>${title}</h3>${items.length ? `<div class="tdx-pick">${items.map(([id, label]) => `<button type="button" data-k="${kind}" data-id="${esc(id)}">${esc(label)}</button>`).join('')}</div>` : '<p class="tdx-muted">Nada guardado todavía.</p>'}</section>`;
    dialog({
      title: 'Adjuntar este boceto a…', wide: true,
      body: `<div class="tdx-rel">${group('note', 'Una nota', ns.map(n => [n.id, n.title || n.text.slice(0, 50)]))}${group('quest', 'Una cita creativa', quests.map(x => [x.d.id, x.d.title]))}${group('bio', 'Una referencia o especie de la Bitácora', refs.map(r => [r.id, r.title]))}${group('concept', 'Una ficha de concepto', cs.map(c => [c.id, Lab.nameOf(c)]))}${group('board', 'Un moodboard', bs.map(b => [b.id, b.title]))}</div><p class="tdx-muted">Para citas y referencias, guárdalas primero en su página; aquí aparecen las tuyas.</p>`,
      onMount: d => d.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const ok = attach({ kind: b.dataset.k, id: b.dataset.id }, payload); toast(ok === 'dupe' ? 'Ya estaba adjunto' : ok ? 'Boceto adjuntado' : 'No se pudo adjuntar', !ok); if (ok) { d.close(); extra.done && extra.done(); } }),
    });
  }

  // ---------- save status (real local + cloud state, with retry) ----------
  function mountStatus(el) {
    if (!el) return;
    const render = () => {
      const C = window.TDLCloud;
      const st = C ? C.status : 'unavailable';
      let html;
      if (!C || !C.user) html = `<span class="tdx-dot local"></span><span>Guardado en este navegador. <button type="button" data-login>Inicia sesión</button> para guardarlo en tu nube privada y verlo en otros dispositivos.</span>`;
      else if (st === 'saving' || st === 'syncing') html = `<span class="tdx-dot busy"></span><span>Guardando en tu nube…</span>`;
      else if (st === 'offline') html = `<span class="tdx-dot err"></span><span>No se pudo subir a tu nube (sin conexión o error). Tus cambios siguen en este navegador. <button type="button" data-retry>Reintentar</button></span>`;
      else html = `<span class="tdx-dot ok"></span><span>Guardado en tu nube privada · ${esc(C.user.email || '')}</span>`;
      el.innerHTML = html;
      el.querySelector('[data-login]')?.addEventListener('click', () => C?.open());
      el.querySelector('[data-retry]')?.addEventListener('click', () => { (C.retry || C.pushNow)(); toast('Reintentando…'); });
    };
    el.classList.add('tdx-status'); el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    render();
    document.addEventListener('tdl-cloud:change', render);
  }

  // ---------- shared action bar ----------
  // o: {kind, ref, label, url, summary, topic, colors, img, prompt}; save: fn or null.
  function actions(o, { saved = false, saveLabel } = {}) {
    return `<div class="tdx-actions" data-actions="${esc(JSON.stringify(o))}">
      <button type="button" class="tdx-act save ${saved ? 'on' : ''}" data-a="save" aria-pressed="${saved}">${saved ? '♥ Guardado' : (saveLabel || '♡ Guardar')}</button>
      <button type="button" class="tdx-act" data-a="board">▦ Crear moodboard</button>
      <button type="button" class="tdx-act" data-a="notebook">✎ Llevar al cuaderno</button>
      <button type="button" class="tdx-act" data-a="concept">✳ Crear ficha de concepto</button></div>`;
  }
  // Pages register how "save" works for their kind; the rest is shared.
  const saveHandlers = {};
  document.addEventListener('click', ev => {
    const b = ev.target.closest('.tdx-actions [data-a]'); if (!b) return;
    let o; try { o = JSON.parse(b.closest('[data-actions]').dataset.actions); } catch { return; }
    const a = b.dataset.a;
    if (a === 'save') { const h = saveHandlers[o.kind]; if (h) h(o, b); }
    if (a === 'board') pickBoard({ kind: o.kind, ref: o.ref, label: o.label, colors: o.colors, img: o.img, url: o.url });
    if (a === 'notebook') toNotebook(o, o.tab || 'notas');
    if (a === 'concept') toConcept({ kind: KIND_LABEL[o.kind] || 'Inspiración', title: o.label, summary: o.summary || o.prompt || '', topic: o.topic || KIND_LABEL[o.kind] || '', url: o.url ? new URL(o.url, location.origin).href : '' });
  });

  // ---------- render a personal moodboard ----------
  function boardItemHtml(it) {
    const D = window.TDX_DATA;
    let visual = '';
    if (it.kind === 'palette' && it.colors) visual = `<div class="tdx-bi-pal">${it.colors.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</div>`;
    else if (it.kind === 'bio') { const r = (D?.BIO || []).find(x => x.id === it.ref) || (window.TDX_SPECIES?.SPECIES || []).find(x => x.id === it.ref); if (r) visual = picture(r.img, { alt: r.title || r.name, sizes: '200px', widths: [320, 480] }); }
    else if (it.kind === 'sketch') { const s = sketches().find(x => x.id === it.ref); if (s) visual = `<img src="${esc(s.img)}" alt="${esc(s.title)}" loading="lazy">`; }
    else if (it.kind === 'quest') visual = `<div class="tdx-bi-q">✦</div>`;
    if (!visual) visual = `<div class="tdx-bi-q">${esc((KIND_LABEL[it.kind] || '·')[0])}</div>`;
    return `<figure class="tdx-bi">${visual}<figcaption><small>${esc(KIND_LABEL[it.kind] || '')}</small>${it.url ? `<a href="${esc(it.url)}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`}</figcaption><button type="button" class="tdx-bi-x" data-rm="${it.id}" aria-label="Quitar ${esc(it.label)} del moodboard">×</button></figure>`;
  }
  function renderBoards(el) {
    if (!el) return;
    const list = boards.list();
    el.innerHTML = list.length ? list.map(b => {
      const cols = b.items.filter(i => i.colors).flatMap(i => i.colors).slice(0, 8);
      return `<article class="tdx-board" data-board="${b.id}"><header><div><span class="tdx-eyebrow">Moodboard personal · ${b.items.length} elemento${b.items.length === 1 ? '' : 's'}</span><h3>${esc(b.title)}</h3>${cols.length ? `<div class="tdx-board-strip" aria-hidden="true">${cols.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</div>` : ''}</div>
        <div class="tdx-row"><button type="button" class="tdx-act" data-bact="rename">Renombrar</button><button type="button" class="tdx-act" data-bact="note">✎ Llevar al cuaderno</button><button type="button" class="tdx-act" data-bact="concept">✳ Crear ficha</button><button type="button" class="tdx-act danger" data-bact="del">Borrar</button></div></header>
        ${b.note ? `<p class="tdx-muted">${esc(b.note)}</p>` : ''}
        <div class="tdx-board-grid">${b.items.length ? b.items.map(boardItemHtml).join('') : '<p class="tdx-muted">Vacío. Añade paletas, referencias o bocetos con «▦ Crear moodboard».</p>'}</div></article>`;
    }).join('') : `<div class="tdx-empty"><b>Todavía no tienes moodboards personales.</b><span>Desde una paleta, una cita creativa o una referencia bio, pulsa «▦ Crear moodboard». Aquí se reunirán con el enlace a su origen.</span></div>`;
    if (el._wired) return; el._wired = true;
    el.addEventListener('click', ev => {
      const card = ev.target.closest('[data-board]'); if (!card) return; const id = card.dataset.board, b = boards.find(id); if (!b) return;
      const rm = ev.target.closest('[data-rm]'); if (rm) { boards.removeItem(id, rm.dataset.rm); renderBoards(el); return; }
      const act = ev.target.closest('[data-bact]')?.dataset.bact; if (!act) return;
      if (act === 'rename') dialog({ title: 'Editar moodboard', body: `<form data-f><label class="tdx-lbl">Nombre<input name="t" maxlength="80" value="${esc(b.title)}" required></label><label class="tdx-lbl">Nota<textarea name="n" maxlength="600" rows="3">${esc(b.note || '')}</textarea></label><div class="tdx-row end"><button class="tdx-btn">Guardar</button></div></form>`, onMount: d => { d.querySelector('[data-f]').onsubmit = e => { e.preventDefault(); boards.rename(id, e.target.t.value.trim(), e.target.n.value.trim()); d.close(); renderBoards(el); toast('Moodboard actualizado'); }; } });
      if (act === 'del' && confirm(`¿Borrar el moodboard «${b.title}»? Las paletas, referencias y bocetos originales no se borran.`)) { boards.remove(id); renderBoards(el); toast('Moodboard borrado'); }
      if (act === 'note') toNotebook({ kind: 'board', ref: b.id, label: b.title, url: '/bio#moodboards', prompt: 'Moodboard «' + b.title + '»: ' + b.items.map(i => i.label).join(' · '), colors: b.items.filter(i => i.colors).flatMap(i => i.colors).slice(0, 6) });
      if (act === 'concept') toConcept({ kind: 'Moodboard', title: b.title, summary: 'Moodboard personal con: ' + b.items.map(i => `${KIND_LABEL[i.kind] || ''} ${i.label}`).join('; '), topic: 'Moodboard' });
    });
    document.addEventListener('tdx:change', e => { if (['tdl-boards', 'tdl-sketches'].includes(e.detail?.key)) renderBoards(el); });
    window.addEventListener('storage', e => { if (e.key === 'tdl-boards') renderBoards(el); });
  }

  // ---------- copy ----------
  function copy(text, label) {
    const ok = () => toast('Copiado: ' + (label || text));
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy(text) ? ok() : toast(text));
    else if (fallbackCopy(text)) ok(); else toast(text);
  }
  function fallbackCopy(t) { const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ } a.remove(); return ok; }

  // Daily picks shared by the Creative Gym summary and the pages (same result all day).
  const dailyQuest = () => { const Q = window.TDX_DATA?.QUESTS || []; const r = rng(dayNum() * 2246822519 >>> 0); return Q[Math.floor(r() * Q.length)]; };
  const dailyBio = () => { const B = window.TDX_DATA?.BIO || []; return B[(dayNum() * 7 + 3) % B.length]; };
  // Animal of the day: species interleaved by group so consecutive days change group.
  let spOrder = null;
  function dailySpecies(k = dayKey()) {
    const SP = window.TDX_SPECIES?.SPECIES || [];
    if (!SP.length) return null;
    if (!spOrder) {
      // Spread each group evenly over the cycle, then make sure two days in a row never share a group.
      const by = {}; SP.forEach(s => (by[s.group] = by[s.group] || []).push(s));
      spOrder = Object.values(by).flatMap(l => l.map((s, i) => ({ s, k: (i + 0.5) / l.length + s.group.length * 1e-4 }))).sort((a, b) => a.k - b.k).map(x => x.s);
      for (let i = 1; i < spOrder.length; i++) if (spOrder[i].group === spOrder[i - 1].group) {
        const j = spOrder.findIndex((x, k) => k > i && x.group !== spOrder[i - 1].group && (k + 1 >= spOrder.length || spOrder[k + 1].group !== spOrder[i].group) && spOrder[k - 1].group !== spOrder[i].group);
        if (j > 0) [spOrder[i], spOrder[j]] = [spOrder[j], spOrder[i]];
      }
      // The cycle wraps: the last day must not share a group with the first one.
      const L = spOrder.length - 1, ok = (arr, k) => (k === 0 || arr[k].group !== arr[k - 1].group) && (k === L ? arr[k].group !== arr[0].group : arr[k].group !== arr[k + 1].group);
      if (L > 1 && spOrder[L].group === spOrder[0].group) for (let j = 1; j < L; j++) { const t = spOrder.slice(); [t[L], t[j]] = [t[j], t[L]]; if (ok(t, j) && ok(t, L)) { spOrder = t; break; } }
    }
    const n = dayNum(k) - dayNum('2026-11-05');
    return spOrder[((n % spOrder.length) + spOrder.length) % spOrder.length];
  }

  window.TDX = { dailyQuest, dailyBio, dailySpecies,
    esc, uid, get, put, toast, reduced, dayKey, dayNum, rng, niceDate,
    color: { normHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hsl, toHsl, lum, contrast, textOn, isWarm, isCool, harmony, regenerate, family, HARMONIES, HKEYS },
    dailyPalette, extractPalette, compressImage, loadImageFile, picture, cdn,
    palettes, boards, bioState, questState, sketches, notes, attach,
    toNotebook, toConcept, dialog, pickBoard, relatePalette, pickAttachTarget, mountStatus, actions, saveHandlers, renderBoards, copy, KIND_LABEL,
  };
})();
