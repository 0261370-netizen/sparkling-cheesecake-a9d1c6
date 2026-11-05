/* Laboratorio de color — Creative Gym. Uses TDX (explora.js) and TDX_DATA (explora-data.js). */
(() => {
  'use strict';
  const X = window.TDX, D = window.TDX_DATA, C = X.color, esc = X.esc;
  const $ = id => document.getElementById(id);
  const up = h => h.toUpperCase();

  // ---------- state ----------
  const BASE_IDX = { triada: 0, complementario: 0, dividido: 0, analogo: 2, mono: 2 };
  let type = 'triada', base = [24, 52, 47], slots = [], sel = 0;
  function fromHarmony(keepLocks = true) {
    const fresh = C.harmony(base, type);
    slots = fresh.map((hex, i) => keepLocks && slots[i]?.locked ? slots[i] : { hex, locked: false });
  }
  function setBase(hsl) { base = [((hsl[0] % 360) + 360) % 360, Math.max(0, Math.min(100, hsl[1])), Math.max(4, Math.min(96, hsl[2]))]; fromHarmony(); render(); }
  function loadColors(colors, name) {
    const cs = colors.map(C.normHex).filter(Boolean).slice(0, 5);
    while (cs.length < 5) cs.push(cs[cs.length - 1] || '#cccccc');
    slots = cs.map(hex => ({ hex, locked: false })); sel = 0; base = C.toHsl(cs[0]);
    if (name) $('palName').value = name;
    render();
  }

  const LOCK_PATH = '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/>';
  const ICON = {
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="11" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
    unlock: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };
  // ---------- wheel ----------
  const SIZE = 360, R = 170, CX = 180, CY = 180;
  const box = $('wheelBox');
  box.innerHTML = `<canvas width="${SIZE * 2}" height="${SIZE * 2}" class="cl-wheel" aria-hidden="true" style="position:absolute;inset:0"></canvas>
    <svg viewBox="0 0 ${SIZE} ${SIZE}" class="cl-wheel" tabindex="0" role="slider" aria-label="Rueda de color: elige matiz y saturación" style="position:relative"></svg>`;
  const cv = box.querySelector('canvas'), svg = box.querySelector('svg');
  let wheelL = -1;
  function paintWheel(l) {
    if (Math.abs(l - wheelL) < .5) return; wheelL = l;
    const ctx = cv.getContext('2d'), N = SIZE * 2, img = ctx.createImageData(N, N), d = img.data, r2 = R * 2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - N / 2, dy = y - N / 2, dist = Math.hypot(dx, dy), i = (y * N + x) * 4;
      if (dist > r2 + 1) { d[i + 3] = 0; continue; }
      const h = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360, s = Math.min(100, dist / r2 * 100);
      const [rr, gg, bb] = C.hslToRgb(h, s, l);
      d[i] = rr; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = dist > r2 ? 255 * (r2 + 1 - dist) : 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  const pt = (h, s) => [CX + Math.sin(h * Math.PI / 180) * R * s / 100, CY - Math.cos(h * Math.PI / 180) * R * s / 100];
  function renderWheel() {
    paintWheel(Math.max(25, Math.min(75, base[2])));
    const pts = slots.map(s => { const [h, sa] = C.toHsl(s.hex); return { hex: s.hex, h, s: Math.max(sa, 8), p: pt(h, Math.max(sa, 8)) }; });
    const bi = BASE_IDX[type];
    // Geometry that explains the harmony: lines from center to each harmony angle + figure.
    const angles = C.HARMONIES[type].angles.map(a => base[0] + a);
    const rim = angles.map(a => pt(a, 100));
    let fig = '';
    if (type === 'triada' || type === 'dividido') fig = `<polygon points="${rim.map(p => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>`;
    else if (type === 'complementario') fig = `<line x1="${rim[0][0]}" y1="${rim[0][1]}" x2="${rim[1][0]}" y2="${rim[1][1]}" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>`;
    else if (type === 'analogo') { const a0 = pt(base[0] - 30, 100), a1 = pt(base[0] + 30, 100); fig = `<path d="M${CX},${CY} L${a0.join(',')} A${R},${R} 0 0 1 ${a1.join(',')} Z" fill="rgba(255,255,255,.22)" stroke="#fff" stroke-width="2"/>`; }
    else fig = `<line x1="${CX}" y1="${CY}" x2="${rim[0][0]}" y2="${rim[0][1]}" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/>`;
    svg.innerHTML = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="rgba(0,0,0,.1)"/>${fig}
      ${pts.map((p, i) => `<line x1="${CX}" y1="${CY}" x2="${p.p[0]}" y2="${p.p[1]}" stroke="rgba(255,255,255,.55)" stroke-width="1"/>`).join('')}
      ${pts.map((p, i) => `<circle cx="${p.p[0]}" cy="${p.p[1]}" r="${(i === bi ? 15 : 10) + 3}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/><circle cx="${p.p[0]}" cy="${p.p[1]}" r="${i === bi ? 15 : 10}" fill="${p.hex}" stroke="${i === sel ? '#1d2b25' : '#fff'}" stroke-width="${i === sel ? 4 : 3}"/>${slots[i].locked ? `<g transform="translate(${p.p[0] - 6},${p.p[1] - 7}) scale(.5)" fill="${C.textOn(p.hex)}" color="${C.textOn(p.hex)}">${LOCK_PATH}</g>` : ''}`).join('')}`;
    svg.setAttribute('aria-valuetext', `Matiz ${Math.round(base[0])} grados, saturación ${Math.round(base[1])} %, luminosidad ${Math.round(base[2])} %`);
    $('wheelHint').textContent = `Base: ${up(slots[bi].hex)} · matiz ${Math.round(base[0])}° · ${C.family(base[0])[2]}`;
  }
  function fromPointer(e) {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * SIZE / r.width - CX, y = (e.clientY - r.top) * SIZE / r.height - CY;
    const h = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, s = Math.min(100, Math.hypot(x, y) / R * 100);
    sel = BASE_IDX[type]; setBase([h, s, base[2]]);
  }
  let dragging = false;
  svg.addEventListener('pointerdown', e => { dragging = true; svg.setPointerCapture(e.pointerId); fromPointer(e); });
  svg.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
  svg.addEventListener('pointerup', () => { dragging = false; });
  svg.addEventListener('keydown', e => {
    const st = e.shiftKey ? 15 : 5, m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
    if (!m) return; e.preventDefault(); sel = BASE_IDX[type]; setBase([base[0] + m[0], base[1] + m[1], base[2]]);
  });

  // ---------- harmony buttons + explanation ----------
  $('harmBtns').innerHTML = C.HKEYS.map(k => `<button type="button" data-h="${k}" aria-pressed="${k === type}">${C.HARMONIES[k].label}</button>`).join('');
  $('harmBtns').addEventListener('click', e => { const b = e.target.closest('[data-h]'); if (!b) return; type = b.dataset.h; sel = BASE_IDX[type]; fromHarmony(); render(); });
  function diagram() {
    const a = C.HARMONIES[type].angles, p = (ang, r = 26) => [32 + Math.sin((base[0] + ang) * Math.PI / 180) * r, 32 - Math.cos((base[0] + ang) * Math.PI / 180) * r];
    return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="#c9bda6" stroke-width="2"/>${a.map(x => { const q = p(x); return `<line x1="32" y1="32" x2="${q[0]}" y2="${q[1]}" stroke="#1d2b25"/><circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${C.hsl(base[0] + x, Math.max(base[1], 40), 50)}" stroke="#fff"/>`; }).join('')}</svg>`;
  }
  function renderWhy() {
    const H = C.HARMONIES[type], a = H.angles;
    const spread = type === 'mono' ? 'un solo matiz' : a.map(x => ((Math.round(base[0] + x) % 360) + 360) % 360 + '°').join(' · ');
    $('why').innerHTML = `${diagram()}<div><b>${esc(H.label)}</b> — ${esc(H.why)}<br><span class="tdx-muted">Matices en la rueda: ${spread}.</span></div>`;
  }

  // ---------- swatches + sliders + hex ----------
  function renderSwatches() {
    const bi = BASE_IDX[type];
    $('swatches').innerHTML = slots.map((s, i) => `<div class="cl-sw ${i === sel ? 'sel' : ''}" role="listitem" style="background:${s.hex};color:${C.textOn(s.hex)}">
      <button type="button" class="cl-pick" data-sel="${i}" aria-label="Editar color ${i + 1}: ${up(s.hex)}${i === bi ? ' (base)' : ''}" aria-pressed="${i === sel}"></button>
      <span class="cl-sw-btns"><button type="button" data-lock="${i}" aria-pressed="${s.locked}" aria-label="${s.locked ? 'Desbloquear' : 'Bloquear'} ${up(s.hex)}" title="${s.locked ? 'Bloqueado' : 'Bloquear'}">${s.locked ? ICON.lock : ICON.unlock}</button><button type="button" data-copy="${s.hex}" aria-label="Copiar ${up(s.hex)}" title="Copiar HEX">${ICON.copy}</button></span>
      <b>${up(s.hex)}${i === bi ? '<br>base' : ''}</b></div>`).join('');
  }
  const SL = [['h', 'Matiz', 0, 359, '°'], ['s', 'Saturación', 0, 100, '%'], ['l', 'Luminosidad', 0, 100, '%']];
  $('sliders').innerHTML = SL.map(([k, l, mn, mx, u]) => `<label class="cl-sl"><span>${l}</span><input type="range" min="${mn}" max="${mx}" data-sl="${k}" aria-label="${l}"><output data-out="${k}"></output></label>`).join('');
  function renderSliders() {
    const [h, s, l] = C.toHsl(slots[sel].hex);
    const v = { h, s, l };
    const tracks = { h: `linear-gradient(90deg,${[0, 60, 120, 180, 240, 300, 360].map(x => C.hsl(x, Math.max(s, 50), 50)).join(',')})`, s: `linear-gradient(90deg,${C.hsl(h, 0, l)},${C.hsl(h, 100, l)})`, l: `linear-gradient(90deg,#000,${C.hsl(h, s, 50)},#fff)` };
    SL.forEach(([k, , , , u]) => { const inp = $('sliders').querySelector(`[data-sl="${k}"]`); if (document.activeElement !== inp) inp.value = Math.round(v[k]); inp.style.setProperty('--track', tracks[k]); $('sliders').querySelector(`[data-out="${k}"]`).textContent = Math.round(v[k]) + u; });
    if (document.activeElement !== $('hexIn')) $('hexIn').value = up(slots[sel].hex);
  }
  function setSelected(hex) {
    if (sel === BASE_IDX[type]) { base = C.toHsl(hex); fromHarmony(); slots[sel] = { hex, locked: slots[sel].locked }; }
    else slots[sel] = { ...slots[sel], hex };
    render();
  }
  $('sliders').addEventListener('input', e => {
    const k = e.target.dataset.sl; if (!k) return;
    const [h, s, l] = C.toHsl(slots[sel].hex), nv = { h, s, l }; nv[k] = Number(e.target.value);
    setSelected(C.hsl(nv.h, nv.s, nv.l));
  });
  $('hexIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyHex(); } });
  $('hexIn').addEventListener('change', applyHex);
  function applyHex() { const h = C.normHex($('hexIn').value); if (!h) { X.toast('Ese código no es un HEX válido (ej. #B65A3C)', true); $('hexIn').value = up(slots[sel].hex); return; } if (h !== slots[sel].hex) setSelected(h); }
  $('swatches').addEventListener('click', e => {
    const s = e.target.closest('[data-sel]'), l = e.target.closest('[data-lock]'), c = e.target.closest('[data-copy]');
    if (c) { X.copy(up(c.dataset.copy)); return; }
    if (l) { const i = Number(l.dataset.lock); slots[i].locked = !slots[i].locked; X.toast(slots[i].locked ? 'Color bloqueado: se conserva al generar' : 'Color desbloqueado'); render(); return; }
    if (s) { sel = Number(s.dataset.sel); render(); }
  });
  $('copyHex').onclick = () => X.copy(up(slots[sel].hex));
  $('copyAll').onclick = () => X.copy(slots.map(s => up(s.hex)).join(', '), 'paleta');
  function regenerate() {
    const r = C.regenerate(slots, type);
    slots = r.slots; const lk = slots.find(s => s.locked);
    base = lk ? C.toHsl(lk.hex) : C.toHsl(slots[BASE_IDX[type]].hex);
    render(); X.toast(slots.some(s => s.locked) ? 'Nueva combinación alrededor de tus colores bloqueados' : 'Nueva combinación');
  }
  $('regen').onclick = regenerate;
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName) || e.target.isContentEditable || document.querySelector('dialog[open]')) return;
    e.preventDefault(); regenerate();
  });

  // ---------- save ----------
  $('saveForm').addEventListener('submit', e => {
    e.preventDefault();
    const rec = X.palettes.save({ name: $('palName').value.trim() || 'Mi paleta', colors: slots.map(s => s.hex), harmony: C.HARMONIES[type].label, source: { kind: 'color', label: 'Laboratorio de color', url: '/color' } });
    if (rec) { X.toast(`Paleta «${rec.name}» guardada`); renderSaved(); document.getElementById('mis-paletas').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); }
  });

  // ---------- daily palette ----------
  let explore = null;
  function renderDaily() {
    const today = X.dailyPalette(), p = explore || today, isToday = !explore;
    const saved = X.palettes.list().some(x => x.colors.join() === p.colors.join());
    $('daily').innerHTML = `<div class="cl-daily">
      <div class="cl-daily-strip" role="group" aria-label="Colores de ${esc(p.name)}">${p.colors.map(c => `<button type="button" style="background:${c};color:${C.textOn(c)}" data-copy="${c}" aria-label="Copiar ${up(c)}">${up(c)}</button>`).join('')}</div>
      <div class="tdx-card"><span class="tdx-chip">${isToday ? 'Hoy · ' + esc(new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(p.day + 'T12:00:00Z'))) : 'Explorando · no cambia la del día'}</span>
        <h3>${esc(p.name)}</h3><p style="margin:0;font-size:14px">${esc(p.why)}</p><div class="cl-apply"><b>Ejemplo de aplicación.</b> ${esc(p.apply)}</div>
        <div class="tdx-row"><button class="tdx-btn" type="button" data-d="use">Abrir en el estudio</button><button class="tdx-btn ghost" type="button" data-d="other">↻ Explorar otra</button>${isToday ? '' : '<button class="tdx-btn ghost" type="button" data-d="back">← Volver a la del día</button>'}</div>
        ${X.actions({ kind: 'palette', ref: p.id, label: 'Paleta ' + p.name, colors: p.colors, url: '/color#dia', prompt: `Paleta «${p.name}» (${p.colors.map(up).join(' ')}). ${p.apply}`, summary: p.why + ' ' + p.apply, topic: 'Color' }, { saved })}</div></div>`;
  }
  $('daily').addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) { X.copy(up(c.dataset.copy)); return; }
    const b = e.target.closest('[data-d]'); if (!b) return;
    const p = explore || X.dailyPalette();
    if (b.dataset.d === 'use') { type = p.type; loadColors(p.colors, p.name); $('estudio').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); }
    if (b.dataset.d === 'other') { const d = new Date(Date.now() + (Math.floor(Math.random() * 720) - 360) * 864e5); explore = X.dailyPalette(X.dayKey(d)); if (explore.day === X.dayKey()) explore = null; renderDaily(); }
    if (b.dataset.d === 'back') { explore = null; renderDaily(); }
  });
  X.saveHandlers.palette = (o, btn) => {
    const ex = X.palettes.list().find(x => x.colors.join() === o.colors.map(C.normHex).join());
    if (ex) { X.palettes.remove(ex.id); X.toast('Paleta quitada de Mis paletas'); }
    else { const r = X.palettes.save({ name: o.label.replace(/^Paleta /, ''), colors: o.colors, source: { kind: 'palette', label: o.label, url: o.url } }); if (r) X.toast('Paleta guardada en Mis paletas'); }
    renderDaily(); renderSaved(); renderPhotoOut();
  };

  // ---------- photo ----------
  let photo = null;
  const drop = $('drop'), pin = $('photoIn');
  drop.onclick = () => pin.click();
  drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin.click(); } };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files?.[0]; if (f) readPhoto(f); };
  pin.onchange = () => { const f = pin.files?.[0]; if (f) readPhoto(f); pin.value = ''; };
  async function readPhoto(f) {
    if (!/^image\//.test(f.type)) { X.toast('Elige un archivo de imagen', true); return; }
    try {
      const big = await X.compressImage(f, 900, .8), im = new Image();
      await new Promise((r, j) => { im.onload = r; im.onerror = j; im.src = big.data; });
      const cols = X.extractPalette(im, 5), th = await X.compressImage(f, 220, .7);
      photo = { preview: big.data, thumb: th.data, colors: cols, name: (f.name || 'Foto').replace(/\.[a-z0-9]+$/i, '').slice(0, 50) };
      drop.innerHTML = `<img src="${photo.preview}" alt="Tu foto">`;
      renderPhotoOut();
    } catch { X.toast('No se pudo leer esa imagen', true); }
  }
  function renderPhotoOut() {
    if (!photo) return;
    const hexes = photo.colors.map(c => c.hex);
    $('photoOut').innerHTML = `<div class="cl-daily-strip" style="min-height:160px">${photo.colors.map(c => `<button type="button" style="background:${c.hex};color:${C.textOn(c.hex)};flex:${Math.max(.6, c.share * 5)}" data-copy="${c.hex}" aria-label="Copiar ${up(c.hex)}, ${Math.round(c.share * 100)} % de la foto">${up(c.hex)}<br>${Math.round(c.share * 100)}%</button>`).join('')}</div>
      <form class="tdx-inline" id="photoSave"><label class="tdx-lbl">Nombre<input name="n" maxlength="60" value="${esc(photo.name)}" required></label><button class="tdx-btn">♡ Guardar paleta</button><button class="tdx-btn ghost" type="button" data-use>Abrir en el estudio</button></form>
      <p class="tdx-muted">El ancho de cada color muestra cuánto ocupa en la foto.</p>`;
    $('photoOut').querySelector('[data-use]').onclick = () => { loadColors(hexes, photo.name); $('estudio').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); };
    $('photoOut').querySelector('#photoSave').onsubmit = e => { e.preventDefault(); const r = X.palettes.save({ name: e.target.n.value.trim(), colors: hexes, thumb: photo.thumb, source: { kind: 'photo', label: 'Foto: ' + photo.name, url: '/color#foto' } }); if (r) { X.toast('Paleta de la foto guardada'); renderSaved(); } };
    $('photoOut').querySelectorAll('[data-copy]').forEach(b => b.onclick = () => X.copy(up(b.dataset.copy)));
  }

  // ---------- composition tester ----------
  let comp = 'cartel', weights = [60, 25, 8, 5, 2], order = [0, 1, 2, 3, 4];
  const ROLES = { cartel: ['Fondo', 'Bloque principal', 'Titular', 'Detalle', 'Acento'], objeto: ['Fondo', 'Pantalla', 'Cuerpo', 'Base', 'Interruptor'], interior: ['Muros', 'Sofá', 'Tapete', 'Cojines', 'Objeto acento'] };
  const sum = () => weights.reduce((a, b) => a + b, 0) || 1;
  const pc = i => weights[i] / sum();
  function art() {
    const c = order.map(i => slots[i].hex), W = 400, H = 500;
    if (comp === 'cartel') {
      let y = 0; const bands = [1, 2, 3, 4].map(i => { const h = H * pc(i); const r = `<rect x="0" y="${H - y - h}" width="${W}" height="${h}" fill="${c[i]}"/>`; y += h; return r; }).join('');
      return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cartel con la paleta"><rect width="${W}" height="${H}" fill="${c[0]}"/>${bands}
        <circle cx="${W * .72}" cy="${H * .28}" r="${30 + 90 * Math.sqrt(pc(4) + .02)}" fill="${c[4]}"/>
        <text x="28" y="80" font-family="Instrument Serif, Georgia, serif" font-size="58" fill="${c[2]}">Taller</text><text x="28" y="132" font-family="Instrument Serif, Georgia, serif" font-size="58" font-style="italic" fill="${c[2]}">de color</text>
        <text x="28" y="${H - 24}" font-family="DM Mono, monospace" font-size="12" fill="${C.textOn(c[1])}">CREATIVE GYM · ${up(c[0])}</text></svg>`;
    }
    if (comp === 'objeto') {
      const s = k => .55 + 1.4 * Math.sqrt(pc(k));
      const sw = 170 * s(1), sh = 110 * s(1), bw = 18 * s(2), bh = 160, base = 120 * s(3);
      return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Lámpara de mesa con la paleta"><rect width="${W}" height="${H}" fill="${c[0]}"/><rect y="${H * .82}" width="${W}" height="${H * .18}" fill="${c[0]}" opacity=".75"/><ellipse cx="${W / 2}" cy="${H * .84}" rx="${base * .9}" ry="10" fill="#000" opacity=".12"/>
        <rect x="${W / 2 - base / 2}" y="${H * .8}" width="${base}" height="22" rx="10" fill="${c[3]}"/>
        <rect x="${W / 2 - bw / 2}" y="${H * .8 - bh}" width="${bw}" height="${bh}" rx="${bw / 2}" fill="${c[2]}"/>
        <path d="M${W / 2 - sw / 2},${H * .8 - bh} L${W / 2 + sw / 2},${H * .8 - bh} L${W / 2 + sw * .32},${H * .8 - bh - sh} L${W / 2 - sw * .32},${H * .8 - bh - sh} Z" fill="${c[1]}"/>
        <circle cx="${W / 2 + base * .32}" cy="${H * .8 + 11}" r="${4 + 10 * Math.sqrt(pc(4))}" fill="${c[4]}"/></svg>`;
    }
    const wall = H * (.35 + .4 * pc(0)), sofaW = 140 + 220 * Math.sqrt(pc(1)), rug = 120 + 220 * Math.sqrt(pc(2)), cush = 16 + 40 * Math.sqrt(pc(3)), acc = 14 + 50 * Math.sqrt(pc(4));
    const sx = W / 2 - sofaW / 2, sy = wall - 70;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sala con la paleta"><rect width="${W}" height="${wall}" fill="${c[0]}"/><rect y="${wall}" width="${W}" height="${H - wall}" fill="#cbb89a"/>
      <ellipse cx="${W / 2}" cy="${wall + 60}" rx="${rug / 1.4}" ry="${32 + rug / 9}" fill="${c[2]}"/>
      <rect x="${sx}" y="${sy}" width="${sofaW}" height="70" rx="16" fill="${c[1]}"/><rect x="${sx - 10}" y="${sy + 24}" width="22" height="56" rx="10" fill="${c[1]}"/><rect x="${sx + sofaW - 12}" y="${sy + 24}" width="22" height="56" rx="10" fill="${c[1]}"/>
      <rect x="${sx + 22}" y="${sy + 6}" width="${cush}" height="${cush}" rx="6" fill="${c[3]}"/><rect x="${sx + sofaW - 22 - cush}" y="${sy + 6}" width="${cush}" height="${cush}" rx="6" fill="${c[3]}"/>
      <rect x="${W - 70}" y="${wall - 120}" width="8" height="120" fill="#3a3a3a"/><circle cx="${W - 66}" cy="${wall - 130}" r="${acc / 2 + 8}" fill="${c[4]}"/>
      <rect x="40" y="${wall * .22}" width="${80 + 40 * pc(4)}" height="${100}" fill="${c[0]}" stroke="${c[3]}" stroke-width="6"/></svg>`;
  }
  function renderComp() {
    $('compArt').innerHTML = art();
    const roles = ROLES[comp];
    $('props').innerHTML = order.map((ci, i) => `<label><i style="background:${slots[ci].hex}"></i><span>${roles[i]}<input type="range" min="0" max="100" value="${weights[i]}" data-w="${i}" aria-label="Proporción de ${roles[i]}"></span><output>${Math.round(pc(i) * 100)}%</output></label>`).join('');
    const dom = pc(0) >= .5 ? 'Hay un color dominante claro: la composición se lee tranquila.' : 'Ningún color domina: la composición se siente más enérgica (o ruidosa).';
    $('compNote').textContent = dom;
  }
  $('props').addEventListener('input', e => { const i = e.target.dataset.w; if (i == null) return; weights[i] = Number(e.target.value); $('compArt').innerHTML = art(); e.target.closest('label').querySelector('output').textContent = Math.round(pc(i) * 100) + '%'; $('props').querySelectorAll('output').forEach((o, k) => o.textContent = Math.round(pc(k) * 100) + '%'); });
  document.querySelector('.cl-comp-tabs').addEventListener('click', e => { const b = e.target.closest('[data-comp]'); if (!b) return; comp = b.dataset.comp; document.querySelectorAll('[data-comp]').forEach(x => x.setAttribute('aria-selected', x === b)); renderComp(); });
  $('rotate').onclick = () => { order = [...order.slice(1), order[0]]; renderComp(); };
  $('p603010').onclick = () => { weights = [60, 30, 10, 0, 0].map((v, i) => i > 2 ? 3 : v); renderComp(); };
  $('pEqual').onclick = () => { weights = [20, 20, 20, 20, 20]; renderComp(); };

  // ---------- saved palettes ----------
  function renderSaved() {
    const list = X.palettes.list();
    $('saved').innerHTML = list.length ? list.map(p => `<article><div class="strip">${p.colors.map(c => `<i style="background:${esc(c)}" title="${up(c)}"></i>`).join('')}</div><div class="body">
      <h4>${esc(p.name)}</h4><small class="tdx-muted">${esc(p.date || '')}${p.harmony ? ' · ' + esc(p.harmony) : ''}${p.source?.label ? ' · ' + esc(p.source.label) : ''}</small>
      ${p.links?.length ? `<div class="links">↔ ${p.links.map(l => esc(l.label)).join(' · ')}</div>` : ''}
      <div class="tdx-row"><button class="tdx-act" data-p="open" data-id="${esc(p.id)}">Abrir</button><button class="tdx-act" data-p="rename" data-id="${esc(p.id)}">Renombrar</button><button class="tdx-act" data-p="rel" data-id="${esc(p.id)}">↔ Relacionar</button><button class="tdx-act" data-p="copy" data-id="${esc(p.id)}">Copiar</button><button class="tdx-act" data-p="board" data-id="${esc(p.id)}">▦ Moodboard</button><button class="tdx-act" data-p="nb" data-id="${esc(p.id)}">✎ Cuaderno</button><button class="tdx-act" data-p="concept" data-id="${esc(p.id)}">✳ Ficha</button><button class="tdx-act danger" data-p="del" data-id="${esc(p.id)}" aria-label="Borrar ${esc(p.name)}">Borrar</button></div></div></article>`).join('')
      : `<div class="tdx-empty" style="grid-column:1/-1"><b>Aún no guardas paletas</b><span>Ponle nombre a la combinación del estudio y pulsa «Guardar paleta», o guarda la paleta del día.</span></div>`;
  }
  $('saved').addEventListener('click', e => {
    const b = e.target.closest('[data-p]'); if (!b) return; const p = X.palettes.find(b.dataset.id); if (!p) return;
    const a = b.dataset.p;
    if (a === 'open') { loadColors(p.colors, p.name); $('estudio').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); }
    if (a === 'rename') { const n = prompt('Nuevo nombre de la paleta', p.name); if (n && n.trim()) { X.palettes.save({ ...p, name: n.trim() }); renderSaved(); } }
    if (a === 'rel') X.relatePalette(p, renderSaved);
    if (a === 'copy') X.copy(p.colors.map(up).join(', '), 'paleta ' + p.name);
    if (a === 'board') X.pickBoard({ kind: 'palette', ref: p.id, label: p.name, colors: p.colors, url: '/color#mis-paletas' });
    if (a === 'nb') X.toNotebook({ kind: 'palette', ref: p.id, label: 'Paleta ' + p.name, colors: p.colors, url: '/color#mis-paletas', prompt: `Paleta «${p.name}»: ${p.colors.map(up).join(' ')}. ¿Dónde la usaría?` });
    if (a === 'concept') X.toConcept({ kind: 'Paleta', title: 'Paleta ' + p.name, summary: `Colores ${p.colors.map(up).join(', ')}${p.harmony ? ' · armonía ' + p.harmony : ''}.`, topic: 'Color', url: location.origin + '/color#mis-paletas' });
    if (a === 'del' && confirm(`¿Borrar la paleta «${p.name}»?`)) { X.palettes.remove(p.id); renderSaved(); renderDaily(); X.toast('Paleta borrada'); }
  });

  // ---------- lessons (demos use the current base colour) ----------
  function demo(kind) {
    const [h, s, l] = base, S = Math.max(s, 45), W = 300, H = 130;
    if (kind === 'wheel') return `<svg viewBox="0 0 ${W} ${H}">${Array.from({ length: 12 }, (_, i) => { const a = i * 30, x = 150 + Math.sin(a * Math.PI / 180) * 50, y = 65 - Math.cos(a * Math.PI / 180) * 50; return `<circle cx="${x}" cy="${y}" r="13" fill="${C.hsl(h + a, S, 52)}"${i === 0 ? ' stroke="#1d2b25" stroke-width="3"' : ''}/>`; }).join('')}</svg>`;
    if (kind === 'triad') { const c = [0, 120, 240].map(a => C.hsl(h + a, S, 50)); return `<svg viewBox="0 0 ${W} ${H}"><rect width="${W / 2}" height="${H}" fill="${c[0]}"/><rect x="${W / 2}" width="${W / 2}" height="${H / 2}" fill="${c[1]}"/><rect x="${W / 2}" y="${H / 2}" width="${W / 2}" height="${H / 2}" fill="${c[2]}"/><text x="10" y="${H - 10}" font-size="11" fill="#fff" font-family="DM Mono">IGUALES</text></svg>`; }
    if (kind === 'temp') return `<svg viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.hsl(215, 35, 40)}"/><rect x="${W / 2}" width="${W / 2}" height="${H}" fill="${C.hsl(25, 70, 55)}"/><rect x="${W / 4 - 25}" y="40" width="50" height="50" fill="${C.hsl(150, 30, 50)}"/><rect x="${W * .75 - 25}" y="40" width="50" height="50" fill="${C.hsl(150, 30, 50)}"/></svg>`;
    if (kind === 'contrast') { const a = C.hsl(h, S, 50), b = C.hsl(h + 180, S, 50), d = C.hsl(h, S, 15); return `<svg viewBox="0 0 ${W} ${H}"><rect width="${W / 2}" height="${H}" fill="${a}"/><text x="18" y="74" font-size="22" fill="${b}" font-family="Hanken Grotesk">Mismo valor</text><rect x="${W / 2}" width="${W / 2}" height="${H}" fill="${a}"/><text x="${W / 2 + 18}" y="74" font-size="22" fill="${d}" font-family="Hanken Grotesk">Valor distinto</text></svg>`; }
    if (kind === 'value') return `<svg viewBox="0 0 ${W} ${H}">${[90, 72, 52, 32, 14].map((L, i) => `<rect x="${i * 60}" width="60" height="${H / 2}" fill="${C.hsl(h, S, L)}"/><rect x="${i * 60}" y="${H / 2}" width="60" height="${H / 2}" fill="${C.hsl(0, 0, Math.round(C.lum(C.hsl(h, S, L)) ** (1 / 2.2) * 100))}"/>`).join('')}</svg>`;
    if (kind === 'sat') return `<svg viewBox="0 0 ${W} ${H}">${[8, 25, 45, 70, 95].map((ss, i) => `<rect x="${i * 60}" width="60" height="${H}" fill="${C.hsl(h, ss, 50)}"/>`).join('')}</svg>`;
    const c = [0, 120, 240].map(a => C.hsl(h + a, S, 50));
    return `<svg viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.hsl(h, 20, 88)}"/><rect width="${W * .6}" height="${H}" fill="${c[0]}"/><rect x="${W * .6}" width="${W * .3}" height="${H}" fill="${C.hsl(h + 120, 25, 70)}"/><rect x="${W * .9}" width="${W * .1}" height="${H}" fill="${c[2]}"/><text x="10" y="${H - 10}" font-size="11" fill="${C.textOn(c[0])}" font-family="DM Mono">60 · 30 · 10</text></svg>`;
  }
  function renderLessons() {
    $('lessons').innerHTML = D.LESSONS.map(L => `<article class="cl-lesson"><div class="demo" aria-hidden="true">${demo(L.demo)}</div><div class="body"><span class="tdx-eyebrow">Lección ${L.n}</span><h3>${esc(L.title)}</h3><p>${esc(L.text)}</p><p class="tip">💡 ${esc(L.tip)}</p><button class="tdx-act" type="button" data-try="${L.try.harmony}">Probarlo en el estudio →</button></div></article>`).join('');
  }
  $('lessons').addEventListener('click', e => { const b = e.target.closest('[data-try]'); if (!b) return; type = b.dataset.try; sel = BASE_IDX[type]; fromHarmony(false); render(); $('estudio').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); });

  // ---------- psychology ----------
  $('psy').innerHTML = D.PSYCH.map(p => `<article><div class="band" style="background:${p.color}"></div><div class="body"><h3>${esc(p.name)}</h3><dl>
    <dt>Asociaciones frecuentes</dt><dd>${esc(p.assoc)}</dd><dt>Depende del contexto</dt><dd>${esc(p.context)}</dd><dt>En el diseño</dt><dd>${esc(p.design)}</dd></dl>
    <ul class="cl-src">${p.src.map(k => `<li><a href="${D.SOURCES[k].url}" target="_blank" rel="noopener noreferrer">${esc(D.SOURCES[k].label)}</a></li>`).join('')}</ul></div></article>`).join('');
  $('sources').innerHTML = Object.values(D.SOURCES).map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('');

  // ---------- exercises ----------
  const CHECKS = {
    calm: cs => { const blue = cs.filter(c => { const [h, s] = C.toHsl(c); return s > 15 && h >= 190 && h <= 250; }).length, avgS = cs.reduce((a, c) => a + C.toHsl(c)[1], 0) / cs.length; return blue ? [false, `Hay ${blue} color${blue > 1 ? 'es' : ''} azul${blue > 1 ? 'es' : ''}. Cámbialo${blue > 1 ? 's' : ''} por otro matiz.`] : avgS > 50 ? [false, `Sin azul ✓, pero la saturación media es ${Math.round(avgS)} %. Bájala para más calma.`] : [true, `Sin azul y con saturación media de ${Math.round(avgS)} %. ¡Tranquila!`]; },
    triadDominant: () => type !== 'triada' ? [false, 'Elige la armonía «Tríada» en el estudio.'] : pc(0) < .6 ? [false, `Es una tríada ✓. Ahora sube el primer color a 60 % o más en la composición (está en ${Math.round(pc(0) * 100)} %).`] : [true, `Tríada con un color dominante del ${Math.round(pc(0) * 100)} %.`],
    energy: cs => { const red = cs.some(c => { const [h, s] = C.toHsl(c); return s > 25 && (h < 15 || h > 340); }); const ls = cs.map(c => C.toHsl(c)[2]), range = Math.max(...ls) - Math.min(...ls), maxS = Math.max(...cs.map(c => C.toHsl(c)[1])); return red ? [false, 'Hay un rojo. Quítalo y busca la energía en otro lado.'] : range < 40 ? [false, `Sin rojo ✓. Aumenta el contraste de valor (ahora ${Math.round(range)} puntos).`] : maxS < 60 ? [false, 'Añade un acento más saturado.'] : [true, 'Sin rojo, con contraste de valor y un acento intenso.']; },
    values: cs => { const ls = cs.map(c => C.lum(c)); const light = ls.some(v => v > .6), dark = ls.some(v => v < .08), mid = ls.some(v => v > .15 && v < .45); return light && dark && mid ? [true, 'Tienes claro, medio y oscuro: funcionará en blanco y negro.'] : [false, `Falta: ${[!light && 'un claro', !mid && 'un medio', !dark && 'un oscuro'].filter(Boolean).join(', ')}.`]; },
    contrastPair: cs => { let best = 0, pair; cs.forEach(a => cs.forEach(b => { const r = C.contrast(a, b); if (r > best) { best = r; pair = [a, b]; } })); return best >= 4.5 ? [true, `${up(pair[0])} sobre ${up(pair[1])}: ${best.toFixed(2)}:1, pasa AA.`] : [false, `La mejor pareja llega a ${best.toFixed(2)}:1. Oscurece o aclara un color.`]; },
    oneCool: cs => { const w = cs.filter(C.isWarm).length, c = cs.filter(C.isCool).length; return w >= 4 && c === 1 ? [true, '4 cálidos y 1 frío. Pruébalo en el cartel con el frío como acento.'] : [false, `Tienes ${w} cálido${w === 1 ? '' : 's'} y ${c} frío${c === 1 ? '' : 's'}.`]; },
  };
  const exRes = {};
  function renderExercises() {
    $('exercises').innerHTML = D.EXERCISES.map(x => `<article><span class="tdx-eyebrow">Ejercicio</span><h3>${esc(x.title)}</h3><p>${esc(x.brief)}</p>${exRes[x.id] ? `<p class="res ${exRes[x.id][0] ? 'ok' : 'no'}" role="status">${exRes[x.id][0] ? '✓ ' : '→ '}${esc(exRes[x.id][1])}</p>` : ''}
      <div class="tdx-row">${x.check ? `<button class="tdx-act" data-check="${x.id}">Comprobar con mi paleta</button>` : ''}<button class="tdx-act" data-exnb="${x.id}">✎ Abrir en el cuaderno</button><button class="tdx-act" data-exsk="${x.id}">✐ Dibujarlo</button></div></article>`).join('');
  }
  $('exercises').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const id = b.dataset.check || b.dataset.exnb || b.dataset.exsk, x = D.EXERCISES.find(y => y.id === id); if (!x) return;
    if (b.dataset.check) { exRes[id] = CHECKS[x.check](slots.map(s => s.hex)); renderExercises(); return; }
    X.toNotebook({ kind: 'lesson', ref: x.id, label: x.title, url: '/color#ejercicios', prompt: x.brief, colors: slots.map(s => s.hex) }, b.dataset.exsk ? 'bocetos' : 'notas');
  });

  // ---------- contrast ----------
  function contrastUI() {
    const fg = C.normHex($('fgHex').value) || '#000000', bg = C.normHex($('bgHex').value) || '#ffffff', r = C.contrast(fg, bg);
    $('preview').style.cssText = `background:${bg};color:${fg}`;
    $('ratio').textContent = r.toFixed(2) + ':1';
    const T = [['AA · texto normal', 4.5], ['AA · texto grande', 3], ['AAA · texto normal', 7], ['AAA · texto grande', 4.5], ['Componentes e iconos (AA)', 3]];
    $('wcag').innerHTML = T.map(([l, t]) => `<div class="${r >= t ? 'pass' : 'fail'}"><b>${r >= t ? '✓ Pasa' : '✗ No pasa'}</b>${l} · ${t}:1</div>`).join('');
  }
  const syncPick = (pick, hex) => { $(pick).addEventListener('input', () => { $(hex).value = up($(pick).value); contrastUI(); }); $(hex).addEventListener('input', () => { const h = C.normHex($(hex).value); if (h) { $(pick).value = h; contrastUI(); } }); };
  syncPick('fgPick', 'fgHex'); syncPick('bgPick', 'bgHex');
  $('swapC').onclick = () => { const a = $('fgHex').value; $('fgHex').value = $('bgHex').value; $('bgHex').value = a; $('fgPick').value = C.normHex($('fgHex').value); $('bgPick').value = C.normHex($('bgHex').value); contrastUI(); };
  function renderPairs() {
    const cs = [...new Set(slots.map(s => s.hex))], pairs = [];
    cs.forEach((a, i) => cs.forEach((b, j) => { if (i !== j) pairs.push([a, b, C.contrast(a, b)]); }));
    pairs.sort((x, y) => y[2] - x[2]);
    $('pairs').innerHTML = pairs.slice(0, 6).map(([a, b, r]) => `<button type="button" style="color:${a};background:${b}" data-fg="${a}" data-bg="${b}" aria-label="Probar ${up(a)} sobre ${up(b)}, ${r.toFixed(1)} a 1">Aa ${r.toFixed(1)}</button>`).join('');
  }
  $('pairs').addEventListener('click', e => { const b = e.target.closest('[data-fg]'); if (!b) return; $('fgHex').value = up(b.dataset.fg); $('bgHex').value = up(b.dataset.bg); $('fgPick').value = b.dataset.fg; $('bgPick').value = b.dataset.bg; contrastUI(); });

  // ---------- render ----------
  let lessonTimer = 0;
  function render() {
    document.querySelectorAll('#harmBtns [data-h]').forEach(b => b.setAttribute('aria-pressed', b.dataset.h === type));
    renderWheel(); renderWhy(); renderSwatches(); renderSliders(); renderComp(); renderPairs();
    clearTimeout(lessonTimer); lessonTimer = setTimeout(renderLessons, 120);
  }
  // Start from the palette of the day, or from ?colors=… links.
  const qp = new URLSearchParams(location.search).get('colors');
  if (qp) loadColors(qp.split(/[,\s]+/).map(c => '#' + c.replace('#', '')));
  else { const d = X.dailyPalette(); type = d.type; base = C.toHsl(d.colors[BASE_IDX[type]]); fromHarmony(false); slots = d.colors.map(hex => ({ hex, locked: false })); sel = BASE_IDX[type]; render(); }
  renderDaily(); renderSaved(); renderExercises(); contrastUI();
  X.mountStatus($('saveState'));
  document.addEventListener('tdx:change', e => { if (e.detail?.key === 'tdl-palettes') { renderSaved(); renderDaily(); } });
  window.addEventListener('storage', e => { if (e.key === 'tdl-palettes') { renderSaved(); renderDaily(); } });
})();
