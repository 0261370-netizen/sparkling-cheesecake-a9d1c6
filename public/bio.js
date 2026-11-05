/* Bitácora silvestre — revista digital de naturaleza y diseño. Personal data: 'tdl-bio' {cols, refs} (synced). */
(() => {
  'use strict';
  const X = window.TDX, D = window.TDX_DATA, C = X.color, esc = X.esc, $ = id => document.getElementById(id);
  const BIO = D.BIO, CATS = D.CATS, byId = id => BIO.find(b => b.id === id);
  const KEY = 'tdl-bio';

  // ---------- derived filter values ----------
  const colorFamily = r => { const best = r.colors.map(c => [c, C.toHsl(c)]).sort((a, b) => b[1][1] - a[1][1])[0]; return best[1][1] < 18 ? 'neutros' : C.family(best[1][0])[2]; };
  BIO.forEach(r => { r.fam = colorFamily(r); });
  const uniq = k => [...new Set(BIO.flatMap(r => Array.isArray(r[k]) ? r[k] : [r[k]]))].sort((a, b) => a.localeCompare(b, 'es'));
  const OPTS = { fam: ['Color', uniq('fam')], texture: ['Textura', uniq('texture')], shape: ['Forma', uniq('shape')], principles: ['Principio', uniq('principles')], kind: ['Tipo', ['visual', 'funcional']] };
  const KIND_L = { visual: 'Inspiración visual', funcional: 'Biomímesis funcional' };
  const f = { cat: '', fam: '', texture: '', shape: '', principles: '', kind: '', col: '' };
  let view = 'mosaic', page = 0;

  // ---------- personal state ----------
  const st = () => X.bioState();
  const live = s => ({ cols: s.cols.filter(c => !c.deleted), refs: s.refs.filter(r => !r.deleted && byId(r.id)) });
  const mine = id => live(st()).refs.find(r => r.id === id);
  function saveState(s) { return X.put(KEY, s); }
  function patchRef(id, patch) { const s = st(); let r = s.refs.find(x => x.id === id); if (!r) { r = { id, cols: [], note: '', saved: Date.now() }; s.refs.push(r); } Object.assign(r, patch, { updated: Date.now() }); if (!patch.deleted) r.deleted = false; return saveState(s); }

  // ---------- filtering ----------
  function list() {
    const m = live(st());
    return BIO.filter(r => (!f.cat || r.cat === f.cat) && (!f.fam || r.fam === f.fam) && (!f.texture || r.texture === f.texture) && (!f.shape || r.shape === f.shape) && (!f.principles || r.principles.includes(f.principles)) && (!f.kind || r.kind === f.kind)
      && (!f.col || (f.col === '__saved' ? m.refs.some(x => x.id === r.id) : m.refs.some(x => x.id === r.id && (x.cols || []).includes(f.col)))));
  }
  function renderCats() {
    $('cats').innerHTML = [['', 'Todas'], ...Object.entries(CATS)].map(([k, l]) => `<button type="button" data-cat="${k}" aria-pressed="${f.cat === k}">${l} <small>${k ? BIO.filter(r => r.cat === k).length : BIO.length}</small></button>`).join('');
  }
  function renderFilters() {
    const m = live(st());
    $('filters').innerHTML = Object.entries(OPTS).map(([k, [l, vals]]) => `<label><span class="tdx-eyebrow">${l}</span><select data-f="${k}" aria-label="Filtrar por ${l.toLowerCase()}"><option value="">Todo</option>${vals.map(v => `<option value="${esc(v)}" ${f[k] === v ? 'selected' : ''}>${esc(KIND_L[v] || v[0].toUpperCase() + v.slice(1))}</option>`).join('')}</select></label>`).join('')
      + `<label><span class="tdx-eyebrow">Mis colecciones</span><select data-f="col"><option value="">Todas las referencias</option><option value="__saved" ${f.col === '__saved' ? 'selected' : ''}>♥ Guardadas (${m.refs.length})</option>${m.cols.map(c => `<option value="${c.id}" ${f.col === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>`;
  }
  $('cats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; f.cat = b.dataset.cat; page = 0; renderCats(); renderView(); });
  $('filters').addEventListener('change', e => { const s = e.target.closest('[data-f]'); if (!s) return; f[s.dataset.f] = s.value; page = 0; renderView(); });
  function clearFilters() { Object.keys(f).forEach(k => f[k] = ''); renderCats(); renderFilters(); renderView(); }

  // ---------- mosaic ----------
  function renderMosaic(items) {
    const m = live(st());
    return `<div class="bx-mosaic">${items.map((r, i) => `<button type="button" class="bx-pin" data-open="${r.id}" aria-label="Abrir ${esc(r.title)} en la revista">${X.picture(r.img, { alt: '', sizes: '(max-width: 700px) 50vw, 25vw', widths: [360, 560, 800], eager: i < 4 })}
      <span class="cap" style="display:block"><span class="tdx-eyebrow">${esc(CATS[r.cat])}</span>${m.refs.some(x => x.id === r.id) ? '<span class="saved" aria-label="Guardada">♥</span>' : ''}<h3>${esc(r.title)}</h3><span class="pal">${r.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span><span class="tdx-chip ${r.kind === 'funcional' ? 'fn' : 'vis'}" style="margin-top:8px">${KIND_L[r.kind]}</span></span></button>`).join('')}</div>`;
  }

  // ---------- magazine ----------
  function spread(r, n, total) {
    const m = mine(r.id), s = live(st()), sks = (m?.sketches || []).map(id => X.sketches().find(x => x.id === id)).filter(Boolean);
    const cr = r.credit;
    return `<article class="bx-spread" id="r-${r.id}" aria-roledescription="página" aria-label="${n + 1} de ${total}: ${esc(r.title)}">
      <div class="ph">${X.picture(r.img, { alt: `${r.title} — ${r.sci}`, sizes: '(max-width: 900px) 100vw, 56vw', widths: [640, 960, 1200], eager: true }).replace('<img ', `<img style="object-position:${r.focus || '50% 50%'}" `)}
        <div class="det" aria-hidden="true">${X.picture(r.img, { alt: '', sizes: '300px', widths: [480, 800] }).replace('<img ', `<img style="object-position:${r.focus || '50% 50%'}" `)}</div></div>
      <div class="tx ${X.reduced() ? '' : 'bx-anim'}">
        <div class="tdx-row"><span class="tdx-eyebrow">${esc(CATS[r.cat])} · Nº ${String(BIO.indexOf(r) + 1).padStart(2, '0')}</span><span class="tdx-chip ${r.kind === 'funcional' ? 'fn' : 'vis'}">${KIND_L[r.kind]}</span></div>
        <h2>${esc(r.title)}</h2><p class="sci">${esc(r.sci)}</p>
        <div class="pal" role="group" aria-label="Paleta">${r.colors.map(c => `<button type="button" data-copy="${c}" style="background:${c};color:${C.textOn(c)}" aria-label="Copiar ${c.toUpperCase()}">${c.toUpperCase()}</button>`).join('')}</div>
        <a class="tdx-act" style="align-self:flex-start;text-decoration:none" href="/color?colors=${r.colors.map(c => c.slice(1)).join(',')}#estudio">◐ Abrir paleta en el laboratorio</a>
        <dl class="bx-block"><dt>Qué observar</dt><dd>${esc(r.observe)}</dd><dt>Patrón, textura o principio</dt><dd>${esc(r.pattern)} <small class="tdx-muted">(${esc(r.texture)} · ${esc(r.shape)} · ${r.principles.map(esc).join(', ')})</small></dd>
          <dt>${r.kind === 'funcional' ? 'Exploración de diseño · hipótesis por explorar' : 'Exploración de diseño'}</dt><dd>${esc(r.explore)}</dd><dt>Reto para dibujar o experimentar</dt><dd>${esc(r.challenge)}</dd></dl>
        ${r.claim ? `<div class="bx-claim ${r.kind === 'funcional' ? '' : 'vis'}"><b>${r.kind === 'funcional' ? 'Lo que dice la investigación' : 'Contexto'}:</b> ${esc(r.claim)}<br><a href="${esc(r.source.url)}" target="_blank" rel="noopener noreferrer">Fuente: ${esc(r.source.label)} ↗</a></div>` : ''}
        <div class="tdx-row"><button class="tdx-btn" type="button" data-draw="${r.id}">✐ Dibujar el reto</button></div>
        ${X.actions({ kind: 'bio', ref: r.id, label: r.title, url: '/bio#r-' + r.id, img: r.img.src, colors: r.colors, prompt: `${r.title} (${r.sci}). Observar: ${r.observe}\nReto: ${r.challenge}`, summary: `${r.pattern} ${r.explore}`, topic: 'Bitácora silvestre' }, { saved: !!m })}
        <div><span class="tdx-eyebrow">Mis colecciones</span><div class="bx-coll" style="margin-top:6px">${s.cols.map(c => `<button type="button" data-col="${c.id}" data-ref="${r.id}" aria-pressed="${!!m?.cols?.includes(c.id)}">${esc(c.name)}</button>`).join('')}<button type="button" data-newcol="${r.id}">＋ Nueva colección</button></div></div>
        <label class="tdx-lbl">Mi comentario<textarea class="bx-note" data-note="${r.id}" maxlength="1200" placeholder="¿Qué te llevas de esta referencia?">${esc(m?.note || '')}</textarea><small class="tdx-muted" data-notest="${r.id}">${m?.note ? 'Guardado' : 'Se guarda al escribir y la referencia queda en «Guardadas».'}</small></label>
        ${sks.length ? `<div><span class="tdx-eyebrow">Mis bocetos de esta referencia</span><div class="qx-res-pics" style="margin-top:6px">${sks.map(s2 => `<a href="/cuaderno#bocetos"><img src="${esc(s2.img)}" alt="Boceto ${esc(s2.title)}"></a>`).join('')}</div></div>` : ''}
        <p class="bx-credit">Foto: ${esc(cr.author)} · ${cr.licenseUrl ? `<a href="${esc(cr.licenseUrl)}" target="_blank" rel="noopener noreferrer license">${esc(cr.license)}</a>` : esc(cr.license)} · <a href="${esc(cr.page)}" target="_blank" rel="noopener noreferrer">Ver en Wikimedia Commons ↗</a></p>
      </div></article>`;
  }
  function renderMag(items) {
    page = Math.max(0, Math.min(page, items.length - 1));
    const r = items[page];
    return `<div class="bx-mag" id="mag" tabindex="-1"><div class="bx-mag-nav"><button class="bx-arrow" type="button" data-pg="-1" aria-label="Página anterior" ${page ? '' : 'disabled'}>←</button>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="n">${page + 1} / ${items.length}</span><div class="bx-dots">${items.map((x, i) => `<button type="button" data-go="${i}" aria-label="Ir a ${esc(x.title)}" ${i === page ? 'aria-current="true"' : ''}></button>`).join('')}</div></div>
      <button class="bx-arrow" type="button" data-pg="1" aria-label="Página siguiente" ${page < items.length - 1 ? '' : 'disabled'}>→</button></div>
      ${spread(r, page, items.length)}
      <div class="bx-mag-nav" style="border-top:1px solid #eadfcb;border-bottom:0"><button class="tdx-act" type="button" data-pg="-1" ${page ? '' : 'disabled'}>← Anterior</button><span class="tdx-muted" style="font-size:11px">Desliza o usa ← →</span><button class="tdx-act" type="button" data-pg="1" ${page < items.length - 1 ? '' : 'disabled'}>Siguiente →</button></div></div>`;
  }

  // ---------- render ----------
  function renderView() {
    const items = list();
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === view));
    $('count').textContent = `${items.length} referencia${items.length === 1 ? '' : 's'}${items.length < BIO.length ? ' con estos filtros' : ''}`;
    if (!items.length) { $('view').innerHTML = `<div class="tdx-empty"><b>Ninguna referencia con esa combinación</b><span>Quita algún filtro para seguir explorando.</span><button class="tdx-btn ghost" type="button" data-clear>Quitar filtros</button></div>`; return; }
    $('view').innerHTML = view === 'mosaic' ? renderMosaic(items) : renderMag(items);
    if (view === 'mag') history.replaceState(null, '', '#r-' + items[page].id);
  }
  function go(n, focus) { const items = list(); const p = page + n; if (p < 0 || p >= items.length) return; page = p; renderView(); if (focus) $('mag')?.focus({ preventScroll: true }); }
  document.querySelector('.bx-view').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (!b) return; view = b.dataset.view; renderView(); if (view === 'mosaic') history.replaceState(null, '', location.pathname); });
  $('view').addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-clear]')) { clearFilters(); return; }
    const o = t.closest('[data-open]'); if (o) { const items = list(); page = items.findIndex(r => r.id === o.dataset.open); view = 'mag'; renderView(); $('explorar').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); $('mag')?.focus({ preventScroll: true }); return; }
    const pg = t.closest('[data-pg]'); if (pg) { go(Number(pg.dataset.pg)); return; }
    const g = t.closest('[data-go]'); if (g) { page = Number(g.dataset.go); renderView(); return; }
    const c = t.closest('[data-copy]'); if (c) { X.copy(c.dataset.copy.toUpperCase()); return; }
    const dr = t.closest('[data-draw]'); if (dr) { const r = byId(dr.dataset.draw); if (!mine(r.id)) patchRef(r.id, {}); X.toNotebook({ kind: 'bio', ref: r.id, label: r.title, url: '/bio#r-' + r.id, colors: r.colors, prompt: r.challenge + '\n(Referencia: ' + r.title + ', ' + r.sci + ')' }, 'bocetos'); return; }
    const col = t.closest('[data-col]'); if (col) { const r = mine(col.dataset.ref) || { cols: [] }; const cols = r.cols || []; const next = cols.includes(col.dataset.col) ? cols.filter(x => x !== col.dataset.col) : [...cols, col.dataset.col]; if (patchRef(col.dataset.ref, { cols: next })) { X.toast(next.length > cols.length ? 'Añadida a la colección' : 'Quitada de la colección'); renderView(); renderCols(); } return; }
    const nc = t.closest('[data-newcol]'); if (nc) { const name = prompt('Nombre de la nueva colección'); if (!name || !name.trim()) return; const s = st(); const c = { id: X.uid(), name: name.trim().slice(0, 50), updated: Date.now() }; s.cols.push(c); if (!saveState(s)) return; const r = mine(nc.dataset.newcol); patchRef(nc.dataset.newcol, { cols: [...(r?.cols || []), c.id] }); X.toast(`Colección «${c.name}» creada`); renderFilters(); renderView(); renderCols(); }
  });
  let noteT = 0;
  $('view').addEventListener('input', e => {
    const n = e.target.closest('[data-note]'); if (!n) return;
    const sEl = $('view').querySelector(`[data-notest="${n.dataset.note}"]`); sEl.textContent = 'Escribiendo…';
    clearTimeout(noteT); noteT = setTimeout(() => { sEl.textContent = patchRef(n.dataset.note, { note: n.value.trim() }) ? 'Guardado ✓' : 'No se pudo guardar'; }, 700);
  });
  // keyboard + swipe
  document.addEventListener('keydown', e => {
    if (view !== 'mag' || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1, true); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, true); }
  });
  let sx = null, sy = null;
  $('view').addEventListener('pointerdown', e => { if (view === 'mag' && e.pointerType !== 'mouse' && e.target.closest('.ph')) { sx = e.clientX; sy = e.clientY; } });
  $('view').addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); });
  $('view').addEventListener('touchstart', e => { if (view === 'mag') { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
  $('view').addEventListener('touchend', e => { if (sx == null) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('textarea,.pal,.bx-coll')) go(dx < 0 ? 1 : -1); }, { passive: true });

  X.saveHandlers.bio = o => {
    const m = mine(o.ref);
    if (m && (m.note || m.cols?.length || m.sketches?.length) && !confirm('Esta referencia tiene comentarios, colecciones o bocetos. ¿Quitarla de guardadas? (Los bocetos siguen en tu cuaderno.)')) return;
    patchRef(o.ref, m ? { deleted: true, cols: [], note: '' } : { saved: Date.now() });
    X.toast(m ? 'Quitada de guardadas' : 'Referencia guardada'); renderView(); renderCols(); renderFilters();
  };

  // ---------- collections ----------
  function renderCols() {
    const s = live(st());
    const groups = [{ id: '__saved', name: '♥ Guardadas', refs: s.refs }, ...s.cols.map(c => ({ ...c, refs: s.refs.filter(r => (r.cols || []).includes(c.id)) }))];
    $('cols').innerHTML = s.refs.length || s.cols.length ? `<div class="tdx-board-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${groups.map(g => { const imgs = g.refs.map(r => byId(r.id)).filter(Boolean).slice(0, 4); return `<article class="tdx-board" style="margin:0"><span class="tdx-eyebrow">${g.refs.length} referencia${g.refs.length === 1 ? '' : 's'}</span><h3>${esc(g.name)}</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px">${imgs.map(r => X.picture(r.img, { alt: r.title, sizes: '60px', widths: [160, 240] }).replace('<img ', '<img style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px" ')).join('')}</div>
      <div class="tdx-row"><button class="tdx-act" data-showcol="${g.id}" ${g.refs.length ? '' : 'disabled'}>Ver</button>${g.id === '__saved' ? '' : `<button class="tdx-act" data-rencol="${g.id}">Renombrar</button><button class="tdx-act danger" data-delcol="${g.id}">Borrar</button>`}</div></article>`; }).join('')}</div>`
      : `<div class="tdx-empty"><b>Aún no tienes colecciones</b><span>Abre una referencia en la revista, pulsa «♡ Guardar» o «＋ Nueva colección».</span></div>`;
  }
  $('cols').addEventListener('click', e => {
    const sh = e.target.closest('[data-showcol]'), rn = e.target.closest('[data-rencol]'), dl = e.target.closest('[data-delcol]');
    if (sh) { Object.keys(f).forEach(k => f[k] = ''); f.col = sh.dataset.showcol; page = 0; renderCats(); renderFilters(); renderView(); $('explorar').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); }
    if (rn) { const s = st(), c = s.cols.find(x => x.id === rn.dataset.rencol); const n = c && prompt('Nuevo nombre', c.name); if (n && n.trim()) { c.name = n.trim().slice(0, 50); c.updated = Date.now(); saveState(s); renderCols(); renderFilters(); renderView(); } }
    if (dl) { const s = st(), c = s.cols.find(x => x.id === dl.dataset.delcol); if (!c || !confirm(`¿Borrar la colección «${c.name}»? Las referencias guardadas no se borran.`)) return; c.deleted = true; c.updated = Date.now(); s.refs.forEach(r => { if ((r.cols || []).includes(c.id)) { r.cols = r.cols.filter(x => x !== c.id); r.updated = Date.now(); } }); saveState(s); if (f.col === c.id) f.col = ''; renderCols(); renderFilters(); renderView(); }
  });

  // ---------- boot ----------
  const h = location.hash.match(/^#r-(.+)$/);
  if (h && byId(h[1])) { view = 'mag'; page = BIO.findIndex(r => r.id === h[1]); }
  renderCats(); renderFilters(); renderView(); renderCols();
  X.renderBoards($('boards'));
  X.mountStatus($('saveState'));
  if (h && byId(h[1])) setTimeout(() => $('explorar').scrollIntoView(), 60);
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === 'tdl-sketches') { renderView(); renderCols(); renderFilters(); } });
})();
