// Shared freehand canvas used by MY STUDIO (/cuaderno) and the creative lab.
// Mouse, finger or pen (with pressure). Usage: const pad = Sketchpad(container, {width, height, label, onChange}).
// Tools: pencil, eraser, size, colors (+ colors from my saved palettes, + any color),
// undo / redo (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z or Ctrl+Y), clear, enlarge canvas, photo underlay, download PNG.
(() => {
  'use strict';
  const COLORS = ['#193b32', '#b8674f', '#547ca2', '#d8a24a', '#7f9b8b', '#111111'];
  if (!document.getElementById('sketchpad-css')) {
    const st = document.createElement('style'); st.id = 'sketchpad-css';
    st.textContent = `.sp{position:relative}
.sp-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.sp-group{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap}
.sp-swatch{width:30px;height:30px;border-radius:50%;border:2px solid transparent;background:var(--c);padding:0;cursor:pointer;box-shadow:0 0 0 1px rgba(0,0,0,.12) inset}.sp-swatch.active{border-color:#193b32;box-shadow:0 0 0 2px #fff inset}
.sp-tools label{font-size:12px;display:inline-flex;align-items:center;gap:6px}
.sp-tool{border:1px solid #dcded4;background:#fff;border-radius:999px;padding:8px 12px;font-size:12px;cursor:pointer;color:#193b32;min-height:36px}.sp-tool.active{background:#193b32;color:#fff;border-color:#193b32}.sp-tool:disabled{opacity:.4;cursor:default}
.sp-tool:focus-visible,.sp-swatch:focus-visible,.sp-canvas:focus-visible{outline:3px solid #d68a70;outline-offset:2px}
.sp-pal{border:1px solid #dcded4;border-radius:999px;padding:7px 10px;font-size:12px;background:#fff;max-width:180px}
.sp-custom{width:34px;height:34px;padding:0;border:1px solid #dcded4;border-radius:50%;background:none;cursor:pointer}
.sp-canvas{width:100%;aspect-ratio:4/3;display:block;background:#fff;border:1px solid #dcded4;touch-action:none;cursor:crosshair;background-image:radial-gradient(#dcded4 1px,transparent 1px);background-size:20px 20px}
.sp-full{position:fixed;inset:0;z-index:9000;background:#f2ece1;padding:10px;display:flex;flex-direction:column;overflow:auto}
.sp-full .sp-canvas{width:min(100%,calc((100dvh - 120px) * 4 / 3));margin:auto;box-shadow:0 20px 50px rgba(0,0,0,.18)}
html.sp-lock{overflow:hidden}
.sp-hint{font-size:11px;color:#6e766e;margin:6px 0 0}
@media(max-width:600px){.sp-tool{padding:8px 10px}.sp-hide-sm{display:none}}`;
    document.head.append(st);
  }
  const savedPalettes = () => {
    try { const a = JSON.parse(localStorage.getItem('tdl-palettes') || '[]'); return Array.isArray(a) ? a.filter(p => p && !p.deleted && Array.isArray(p.colors) && p.colors.length) : []; } catch { return []; }
  };
  const escA = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.Sketchpad = function (root, opts = {}) {
    const W = opts.width || 1200, H = opts.height || 900;
    root.classList.add('sp');
    root.innerHTML = `<div class="sp-tools" role="toolbar" aria-label="Herramientas de dibujo">
      <span class="sp-group"><button class="sp-tool active" data-tool="pen" type="button" aria-pressed="true">✎ Lápiz</button><button class="sp-tool" data-tool="eraser" type="button" aria-pressed="false">⌫ Borrador</button></span>
      <span class="sp-group sp-colors" aria-label="Colores">${COLORS.map((c, i) => `<button type="button" class="sp-swatch ${i ? '' : 'active'}" style="--c:${c}" data-color="${c}" aria-label="Color ${c}"></button>`).join('')}</span>
      <span class="sp-group"><select class="sp-pal" data-pal aria-label="Usar colores de mis paletas"><option value="">🎨 Mis paletas…</option></select><input type="color" class="sp-custom" data-custom value="#193b32" aria-label="Elegir cualquier color"></span>
      <label>Grosor <input type="range" min="1" max="40" value="3" data-size aria-label="Grosor del trazo"></label>
      <span class="sp-group"><button class="sp-tool" data-undo type="button" disabled title="Deshacer (Ctrl/⌘+Z)">↶ Deshacer</button><button class="sp-tool" data-redo type="button" disabled title="Rehacer (Ctrl/⌘+Shift+Z)">↷ Rehacer</button><button class="sp-tool" data-clear type="button">Limpiar</button></span>
      <span class="sp-group"><button class="sp-tool" data-full type="button" aria-pressed="false">⤢ Ampliar lienzo</button>${opts.photo === false ? '' : '<button class="sp-tool" data-under type="button" title="Pon una foto en el lienzo y dibuja encima">📷 Foto de fondo</button>'}<button class="sp-tool" data-png type="button">↓ PNG</button></span>
      <input type="file" accept="image/*" data-underfile hidden>
    </div><canvas class="sp-canvas" width="${W}" height="${H}" tabindex="0" aria-label="${escA(opts.label || 'Lienzo de dibujo')}. Dibuja con ratón, dedo o lápiz digital."></canvas>
    <p class="sp-hint sp-hide-sm">Atajos: Ctrl/⌘+Z deshacer · Ctrl/⌘+Shift+Z rehacer · Esc sale del lienzo ampliado.</p>`;
    const cv = root.querySelector('canvas'), ctx = cv.getContext('2d'), size = root.querySelector('[data-size]');
    const bUndo = root.querySelector('[data-undo]'), bRedo = root.querySelector('[data-redo]'), bFull = root.querySelector('[data-full]');
    let color = COLORS[0], tool = 'pen', drawing = false, last = null, dirty = false;
    const undo = [], redo = [];
    const changed = () => { bUndo.disabled = !undo.length; bRedo.disabled = !redo.length; opts.onChange && opts.onChange(); };
    const blank = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); };
    blank();
    const setTool = t => { tool = t; root.querySelectorAll('[data-tool]').forEach(b => { const on = b.dataset.tool === t; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); }); };
    const setColor = (c, btn) => { color = c; root.querySelectorAll('.sp-swatch').forEach(s => s.classList.toggle('active', s === btn)); setTool('pen'); };
    root.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    root.querySelector('.sp-colors').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (b) setColor(b.dataset.color, b); });
    root.querySelector('[data-custom]').addEventListener('input', e => setColor(e.target.value, null));
    // Palette picker: replaces the swatches with the chosen palette's colours.
    const palSel = root.querySelector('[data-pal]');
    const fillPal = () => { const ps = savedPalettes(); palSel.innerHTML = `<option value="">🎨 ${ps.length ? 'Mis paletas…' : 'Aún sin paletas guardadas'}</option><option value="__base">Colores básicos</option>` + ps.map(p => `<option value="${escA(p.id)}">${escA(p.name || 'Paleta')}</option>`).join(''); };
    fillPal(); palSel.addEventListener('focus', fillPal); palSel.addEventListener('pointerdown', fillPal);
    palSel.addEventListener('change', () => {
      const v = palSel.value; if (!v) return;
      const cols = v === '__base' ? COLORS : (savedPalettes().find(p => p.id === v)?.colors || COLORS);
      const box = root.querySelector('.sp-colors');
      box.innerHTML = cols.map((c, i) => `<button type="button" class="sp-swatch ${i ? '' : 'active'}" style="--c:${escA(c)}" data-color="${escA(c)}" aria-label="Color ${escA(c)}"></button>`).join('');
      color = cols[0]; setTool('pen');
    });
    const pushUndo = () => { undo.push(ctx.getImageData(0, 0, W, H)); if (undo.length > 30) undo.shift(); redo.length = 0; };
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    function stroke(a, b, e) {
      const base = Number(size.value), pr = e.pressure && e.pointerType === 'pen' ? .3 + e.pressure * 1.6 : 1;
      ctx.strokeStyle = tool === 'eraser' ? '#fff' : color; ctx.lineWidth = (tool === 'eraser' ? base * 4 : base) * pr;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + .01, b.y); ctx.stroke();
    }
    cv.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); pushUndo(); drawing = true; dirty = true; last = pos(e); stroke(last, last, e); });
    cv.addEventListener('pointermove', e => { if (!drawing) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; for (const ev of evs.length ? evs : [e]) { const p = pos(ev); stroke(last, p, ev); last = p; } });
    ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { if (drawing) { drawing = false; changed(); } }));
    const doUndo = () => { const s = undo.pop(); if (!s) return; redo.push(ctx.getImageData(0, 0, W, H)); ctx.putImageData(s, 0, 0); dirty = true; changed(); };
    const doRedo = () => { const s = redo.pop(); if (!s) return; undo.push(ctx.getImageData(0, 0, W, H)); ctx.putImageData(s, 0, 0); dirty = true; changed(); };
    bUndo.addEventListener('click', doUndo); bRedo.addEventListener('click', doRedo);
    root.querySelector('[data-clear]').addEventListener('click', () => { pushUndo(); blank(); dirty = true; changed(); });
    const setFull = on => { root.classList.toggle('sp-full', on); document.documentElement.classList.toggle('sp-lock', on); bFull.setAttribute('aria-pressed', on); bFull.textContent = on ? '⤡ Salir del lienzo ampliado' : '⤢ Ampliar lienzo'; if (on) cv.focus(); };
    bFull.addEventListener('click', () => setFull(!root.classList.contains('sp-full')));
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape' && root.classList.contains('sp-full')) { e.stopPropagation(); setFull(false); bFull.focus(); return; }
      if (!(e.ctrlKey || e.metaKey) || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); } else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); doRedo(); }
    });
    // Photo underlay (e.g. a paper sketch or a reference) to draw on top.
    const underFile = root.querySelector('[data-underfile]');
    root.querySelector('[data-under]')?.addEventListener('click', () => underFile.click());
    underFile.addEventListener('change', () => { const f = underFile.files?.[0]; if (!f) return; const u = URL.createObjectURL(f); api.load(u, true).finally(() => URL.revokeObjectURL(u)); underFile.value = ''; });
    root.querySelector('[data-png]').addEventListener('click', () => api.download((opts.filename && opts.filename()) || 'boceto'));

    function drawFit(img, keepUndo) {
      if (keepUndo) pushUndo();
      blank();
      const k = Math.min(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    }
    const api = {
      canvas: cv,
      isDirty: () => dirty,
      markClean() { dirty = false; },
      clear() { undo.length = 0; redo.length = 0; blank(); dirty = false; changed(); },
      // load(src, asEdit): asEdit=true keeps undo history (photo underlay); otherwise starts a fresh session.
      load(src, asEdit) {
        return new Promise(res => {
          const img = new Image();
          img.onload = () => { if (!asEdit) { undo.length = 0; redo.length = 0; } drawFit(img, !!asEdit); dirty = !!asEdit; changed(); res(true); };
          img.onerror = () => res(false);
          img.src = src;
        });
      },
      snapshot(w = 1000, h = 750, q = .78) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(cv, 0, 0, w, h); return c.toDataURL('image/jpeg', q); },
      download(name) {
        const slug = String(name || 'boceto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'boceto';
        cv.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = slug + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 800); }, 'image/png');
      },
      setColor(c) { setColor(c, null); },
      exitFull() { setFull(false); },
    };
    return api;
  };
})();
