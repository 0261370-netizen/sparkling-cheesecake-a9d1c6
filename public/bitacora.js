/* Bitácora silvestre — portada con la especie del día, fichas de especies poco conocidas,
   «¿Qué puedo crear con esto?», mi archivo y noticias de naturaleza.
   Personal data lives in 'tdl-bio' (synced): refs[{id:'sp-…', saved, note, create:{notes, photos}}]. */
(() => {
  'use strict';
  const X = window.TDX, S = window.TDX_SPECIES, C = X.color, esc = X.esc, $ = id => document.getElementById(id);
  if (!S || !$('portada')) return;
  const SP = S.SPECIES, GROUPS = S.GROUPS, INSP = S.INSP, AREAS = S.AREAS;
  const byId = id => SP.find(s => s.id === id);
  const KEY = 'tdl-bio', RECENT = 'tdl-sp-recent';

  // ---------- personal state (shared with the rest of the page) ----------
  const st = () => X.bioState();
  const mine = id => st().refs.find(r => r.id === id && !r.deleted);
  function patch(id, p) {
    const s = st(); let r = s.refs.find(x => x.id === id);
    if (!r) { r = { id, cols: [], note: '', saved: Date.now() }; s.refs.push(r); }
    Object.assign(r, p, { updated: Date.now() }); if (!p.deleted) r.deleted = false;
    return X.put(KEY, s);
  }
  const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch { return []; } };
  const remember = id => { try { localStorage.setItem(RECENT, JSON.stringify([id, ...recent().filter(x => x !== id)].slice(0, 12))); } catch { /* ignore */ } };

  // ---------- helpers ----------
  const img = (s, o = {}) => X.picture(s.img, { alt: o.alt ?? `${s.name} (${s.sci})`, sizes: o.sizes || '(max-width: 800px) 100vw, 60vw', widths: o.widths || [640, 960, 1200], eager: !!o.eager }).replace('<img ', `<img style="object-position:${s.focus || '50% 50%'}" `);
  const groupL = g => GROUPS[g] || g;
  const credit = s => `Foto: ${esc(s.credit.author)} · ${s.credit.licenseUrl ? `<a href="${esc(s.credit.licenseUrl)}" target="_blank" rel="noopener noreferrer license">${esc(s.credit.license)}</a>` : esc(s.credit.license)} · <a href="${esc(s.credit.page)}" target="_blank" rel="noopener noreferrer">Fuente: Wikimedia Commons ↗</a>`;
  const today = () => X.dailySpecies();

  // ---------- portada: una sola tarjeta ----------
  let shown = null; // null → species of the day
  function renderPortada() {
    const d = today(), s = shown || d, isDay = !shown, saved = !!mine(s.id);
    const fecha = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Mexico_City' }).format(new Date());
    $('portada').innerHTML = `<article class="sp-cover ${X.reduced() ? '' : 'bx-anim'}">
      <button type="button" class="sp-cover-media" data-open="${s.id}" aria-label="Abrir la ficha de ${esc(s.name)}">${img(s, { eager: true, alt: '' })}<span class="sp-cover-pal" aria-hidden="true">${s.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span></button>
      <div class="sp-cover-tx">
        <span class="tdx-eyebrow">${isDay ? 'El animal del día · ' + esc(fecha) : 'Sorpresa · el del día sigue aquí'}</span>
        <h3>${esc(s.name)}</h3><p class="sci">${esc(s.sci)}</p>
        <div class="tdx-row">${[groupL(s.group), ...s.insp.map(i => INSP[i])].map(t => `<span class="tdx-chip">${esc(t)}</span>`).join('')}${saved ? '<span class="tdx-chip fn">♥ En mi archivo</span>' : ''}</div>
        <p class="hook">${esc(s.hook)}</p>
        <div class="tdx-row"><button type="button" class="tdx-btn" data-open="${s.id}">Abrir la ficha →</button><button type="button" class="tdx-btn ghost" id="spSurprise">✦ Sorpréndeme con otro</button>${isDay ? '' : `<button type="button" class="tdx-act" id="spBack">← Volver al del día</button>`}</div>
        <p class="bx-credit">${credit(s)}</p>
      </div></article>`;
  }
  $('portada').addEventListener('click', e => {
    if (e.target.closest('#spSurprise')) { surprise(); return; }
    if (e.target.closest('#spBack')) { shown = null; renderPortada(); return; }
  });
  function surprise() {
    const pool = filtered().length > 1 ? filtered() : SP, cur = (shown || today()).id, rc = recent();
    let opts = pool.filter(s => s.id !== cur && !rc.includes(s.id) && s.group !== (shown || today()).group);
    if (!opts.length) opts = pool.filter(s => s.id !== cur);
    shown = opts[Math.floor(Math.random() * opts.length)]; if (shown.id === today().id) shown = null;
    remember((shown || today()).id); renderPortada();
  }

  // ---------- ficha (dialog) ----------
  function fichaHtml(s) {
    const m = mine(s.id);
    return `<article class="sp-ficha">
      <div class="sp-ph">${img(s, { eager: true })}<div class="det" aria-hidden="true" style="--zx:${s.zoom?.x ?? 50}%;--zy:${s.zoom?.y ?? 50}%">${img(s, { alt: '', sizes: '320px', widths: [800, 1200] })}<span>Detalle ampliado</span></div></div>
      <p class="bx-credit">${credit(s)}</p>
      <div class="sp-body">
        <div class="tdx-row"><span class="tdx-chip">${esc(groupL(s.group))}</span>${s.insp.map(i => `<span class="tdx-chip">${esc(INSP[i])}</span>`).join('')}<span class="tdx-chip ${s.fact?.source ? 'fn' : 'vis'}">${s.fact?.source ? 'Dato con fuente' : 'Observación visual'}</span></div>
        <p class="sci">${esc(s.sci)} · ${esc(s.where)}</p>
        <div class="sp-pal" role="group" aria-label="Paleta extraída de la foto">${s.colors.map(c => `<button type="button" data-copy="${c}" style="background:${c};color:${C.textOn(c)}" aria-label="Copiar ${c.toUpperCase()}"><b>${c.toUpperCase()}</b></button>`).join('')}</div>
        <p class="tdx-muted" style="margin:4px 0 0">Paleta de cinco colores extraída de esta fotografía. Toca un color para copiar su HEX · <a href="/color?colors=${s.colors.map(c => c.slice(1)).join(',')}#estudio">abrir en el laboratorio de color</a>.</p>
        <dl class="bx-block" style="margin-top:14px"><dt>${esc(s.observe.kind)} · qué observar</dt><dd>${esc(s.observe.text)}</dd>
          ${s.fact ? `<dt>Dato curioso</dt><dd>${esc(s.fact.text)}${s.fact.source ? `<br><a class="sp-src" href="${esc(s.fact.source.url)}" target="_blank" rel="noopener noreferrer">Fuente: ${esc(s.fact.source.label)} ↗</a>` : ''}</dd>` : ''}</dl>
        <p style="font-size:12px"><a href="${esc(s.more)}" target="_blank" rel="noopener noreferrer">Más sobre la especie (enciclopedia) ↗</a></p>
        <div class="tdx-row"><button type="button" class="lab-trigger" data-create="${s.id}">✳ ¿Qué puedo crear con esto?</button><button type="button" class="tdx-btn ghost" data-save="${s.id}" aria-pressed="${!!m}">${m ? '♥ En mi archivo' : '♡ Guardar en mi archivo'}</button></div>
        ${m?.create?.notes || m?.create?.photos?.length ? `<div class="sp-mine"><span class="tdx-eyebrow">Mis notas</span>${m.create.notes ? `<p>${esc(m.create.notes)}</p>` : ''}${m.create.photos?.length ? `<div class="qx-res-pics">${m.create.photos.map(p => `<img src="${p}" alt="Foto de mi boceto">`).join('')}</div>` : ''}</div>` : ''}
        ${X.actions({ kind: 'bio', ref: s.id, label: s.name, url: '/bio#sp-' + s.id, img: s.img.src, colors: s.colors, prompt: `${s.name} (${s.sci}). ${s.observe.kind}: ${s.observe.text}\nReto (${AREAS[s.challenge.area]}): ${s.challenge.text}`, summary: `${s.observe.text} ${s.fact?.text || ''}`, topic: 'Bitácora silvestre' }, { saved: !!m })}
      </div></article>`;
  }
  let openDlg = null;
  function openFicha(id) {
    const s = byId(id); if (!s) return;
    remember(id);
    openDlg = X.dialog({ title: s.name, wide: true, body: fichaHtml(s), onMount: d => d.classList.add('sp-dialog') });
    history.replaceState(null, '', '#sp-' + id);
    openDlg.addEventListener('close', () => { openDlg = null; if (location.hash === '#sp-' + id) history.replaceState(null, '', location.pathname); });
    wireFicha(openDlg, s);
  }
  function refreshFicha(s) { if (openDlg) { openDlg.querySelector('.tdx-dlg-body').innerHTML = fichaHtml(s); } renderPortada(); renderGrid(); renderArchive(); }
  function wireFicha(d, s) {
    d.addEventListener('click', e => {
      const c = e.target.closest('[data-copy]'); if (c) { X.copy(c.dataset.copy.toUpperCase()); return; }
      if (e.target.closest('[data-save]')) { toggleSave(s.id); refreshFicha(s); return; }
      if (e.target.closest('[data-create]')) createDialog(s);
    });
  }
  function toggleSave(id) {
    const m = mine(id);
    if (m && (m.create?.notes || m.create?.photos?.length || m.note) && !confirm('Esta ficha tiene notas o fotos. ¿Quitarla de tu archivo? Se borrarán esas notas.')) return;
    patch(id, m ? { deleted: true, create: null, note: '', cols: [] } : { saved: Date.now() });
    X.toast(m ? 'Quitada de tu archivo' : 'Guardada en tu archivo');
  }
  X.saveHandlers.bio = (() => { const prev = X.saveHandlers.bio; return (o, b) => { if (byId(o.ref)) { toggleSave(o.ref); refreshFicha(byId(o.ref)); } else if (prev) prev(o, b); }; })();

  // ---------- «¿Qué puedo crear con esto?» ----------
  function createDialog(s) {
    const m = mine(s.id), cr = m?.create || {};
    let photos = Array.isArray(cr.photos) ? [...cr.photos] : [];
    const thumbs = () => photos.map((p, i) => `<figure class="att"><img src="${p}" alt="Foto ${i + 1} de mi boceto"><button type="button" data-rm="${i}" aria-label="Quitar foto ${i + 1}">×</button></figure>`).join('');
    const d = X.dialog({
      title: '¿Qué puedo crear con esto?', wide: true,
      body: `<p class="tdx-muted">${esc(s.name)} · <i>${esc(s.sci)}</i></p>
        <h3 class="sp-h">Tres preguntas para observar</h3><ol class="sp-qs">${s.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
        <div class="sp-reto"><span class="tdx-chip">${esc(AREAS[s.challenge.area])}</span><p><b>Reto breve.</b> ${esc(s.challenge.text)}</p></div>
        <form data-f><label class="tdx-lbl">Mis notas<textarea name="n" rows="5" maxlength="2500" placeholder="Responde las preguntas, anota ideas, medidas o materiales…">${esc(cr.notes || '')}</textarea></label>
          <div class="tdx-lbl">Foto de mi boceto (opcional, máx. 2 · se comprime en tu navegador)<div class="att-list" data-ph style="margin-top:6px">${thumbs()}</div><input type="file" accept="image/*" capture="environment" multiple data-in aria-label="Subir foto del boceto"></div>
          <p class="tdx-muted" data-st role="status" aria-live="polite">${cr.updated ? 'Guardado el ' + esc(X.niceDate(cr.updated)) : 'Se guarda en tu archivo. Con sesión iniciada, también en tu nube privada.'}</p>
          <div class="tdx-row end"><button type="button" class="tdx-btn ghost" data-draw>✐ Dibujar en el cuaderno</button><button type="button" class="tdx-btn ghost" data-concept>✳ Ficha de concepto completa</button><button class="tdx-btn">Guardar notas</button></div></form>`,
      onMount: dd => {
        const ph = dd.querySelector('[data-ph]'), stEl = dd.querySelector('[data-st]');
        ph.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { photos.splice(Number(b.dataset.rm), 1); ph.innerHTML = thumbs(); } });
        dd.querySelector('[data-in]').onchange = async e => { for (const f of [...e.target.files].slice(0, 2 - photos.length)) { try { photos.push((await X.compressImage(f, 1000, .72)).data); } catch { X.toast('No se pudo leer esa foto', true); } } e.target.value = ''; ph.innerHTML = thumbs(); stEl.textContent = 'Foto lista; pulsa «Guardar notas».'; };
        dd.querySelector('[data-draw]').onclick = () => X.toNotebook({ kind: 'bio', ref: s.id, label: s.name, url: '/bio#sp-' + s.id, colors: s.colors, prompt: `${s.challenge.text}\n\nObserva: ${s.questions.join(' / ')}` }, 'bocetos');
        dd.querySelector('[data-concept]').onclick = () => { dd.close(); X.toConcept({ kind: 'Bitácora silvestre', title: `${s.name} (${s.sci})`, summary: `${s.observe.kind}: ${s.observe.text} Reto (${AREAS[s.challenge.area]}): ${s.challenge.text}`, topic: AREAS[s.challenge.area], url: location.origin + '/bio#sp-' + s.id }); };
        dd.querySelector('[data-f]').onsubmit = e => {
          e.preventDefault();
          const notes = e.target.n.value.trim();
          if (patch(s.id, { create: { notes, photos, updated: Date.now() } })) { stEl.textContent = 'Guardado ✓ · también quedó en tu archivo'; X.toast('Notas guardadas en tu archivo'); refreshFicha(s); }
          else stEl.textContent = 'No se pudo guardar (almacenamiento lleno). Quita una foto e inténtalo de nuevo.';
        };
      },
    });
    return d;
  }

  // ---------- catálogo con filtros ----------
  const f = { insp: '', group: '' };
  const filtered = () => SP.filter(s => (!f.insp || s.insp.includes(f.insp)) && (!f.group || s.group === f.group));
  function renderFilters() {
    $('spFilters').innerHTML = `<fieldset class="qx-fgroup"><legend>Inspiración</legend><button type="button" data-fi="" aria-pressed="${!f.insp}">Todas</button>${Object.entries(INSP).map(([k, l]) => `<button type="button" data-fi="${k}" aria-pressed="${f.insp === k}">${l} <small>${SP.filter(s => s.insp.includes(k)).length}</small></button>`).join('')}</fieldset>
      <fieldset class="qx-fgroup"><legend>Grupo</legend><button type="button" data-fg="" aria-pressed="${!f.group}">Todos</button>${Object.entries(GROUPS).filter(([k]) => SP.some(s => s.group === k)).map(([k, l]) => `<button type="button" data-fg="${k}" aria-pressed="${f.group === k}">${l}</button>`).join('')}</fieldset>`;
  }
  $('spFilters').addEventListener('click', e => {
    const i = e.target.closest('[data-fi]'), g = e.target.closest('[data-fg]');
    if (i) f.insp = i.dataset.fi; if (g) f.group = g.dataset.fg;
    if (i || g) { renderFilters(); renderGrid(); }
  });
  function card(s) {
    const m = mine(s.id);
    return `<button type="button" class="sp-card" data-open="${s.id}" aria-label="Abrir la ficha de ${esc(s.name)}">${img(s, { alt: '', sizes: '(max-width: 700px) 50vw, 25vw', widths: [360, 560] })}<span class="sp-card-tx"><span class="tdx-eyebrow">${esc(groupL(s.group))}</span>${m ? '<span class="saved" aria-label="En mi archivo">♥</span>' : ''}<strong>${esc(s.name)}</strong><em>${esc(s.sci)}</em><span class="pal">${s.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span></span></button>`;
  }
  function renderGrid() {
    const list = filtered();
    $('spCount').textContent = `${list.length} ficha${list.length === 1 ? '' : 's'} de ${SP.length}`;
    $('spGrid').innerHTML = list.length ? list.map(card).join('') : `<div class="tdx-empty" style="grid-column:1/-1"><b>Ninguna ficha con esa combinación</b><span>Prueba otro tipo de inspiración o grupo.</span></div>`;
  }

  // ---------- mi archivo ----------
  function renderArchive() {
    const refs = st().refs.filter(r => !r.deleted && byId(r.id)).sort((a, b) => (b.updated || 0) - (a.updated || 0));
    $('spArchive').innerHTML = refs.length ? `<div class="sp-grid">${refs.map(r => { const s = byId(r.id); return `<div class="sp-arch">${card(s)}${r.create?.notes ? `<p class="tdx-muted">✎ ${esc(r.create.notes.slice(0, 140))}${r.create.notes.length > 140 ? '…' : ''}</p>` : ''}${r.create?.photos?.length ? `<p class="tdx-muted">📷 ${r.create.photos.length} foto${r.create.photos.length === 1 ? '' : 's'} de boceto</p>` : ''}</div>`; }).join('')}</div>`
      : `<div class="tdx-empty"><b>Tu archivo está vacío</b><span>Abre una ficha y pulsa «♡ Guardar en mi archivo», o escribe notas en «¿Qué puedo crear con esto?».</span></div>`;
  }

  document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o && byId(o.dataset.open) && !e.target.closest('.tdx-dialog')) openFicha(o.dataset.open); });

  // ---------- noticias de naturaleza ----------
  let news = [], topic = '';
  const dfmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
  async function loadNews() {
    $('newsGrid').innerHTML = '<p class="tdx-muted">Buscando noticias de naturaleza…</p>';
    try {
      const r = await fetch('/api/nature-news?limit=36');
      const j = await r.json();
      if (!r.ok || !j.items) throw new Error(j.error || 'Error');
      news = j.items;
      $('newsMeta').textContent = j.updatedAt ? `Actualizado ${new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(j.updatedAt))}${j.failed?.length ? ` · sin respuesta de: ${j.failed.join(', ')}` : ''}` : '';
      renderNews();
    } catch {
      $('newsGrid').innerHTML = `<div class="tdx-empty"><b>No se pudieron cargar las noticias</b><span>Puede ser la conexión o una fuente que no respondió.</span><button type="button" class="tdx-btn ghost" id="newsRetry">Reintentar</button></div>`;
      $('newsRetry').onclick = loadNews;
    }
  }
  function renderNews() {
    const topics = [...new Set(news.map(n => n.topic))];
    $('newsTopics').innerHTML = `<button type="button" data-nt="" aria-pressed="${!topic}">Todo</button>` + topics.map(t => `<button type="button" data-nt="${esc(t)}" aria-pressed="${topic === t}">${esc(t)}</button>`).join('');
    const list = news.filter(n => !topic || n.topic === topic).slice(0, 18);
    $('newsGrid').innerHTML = list.length ? list.map(n => `<article class="nw-card">${n.image ? `<a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${esc(n.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.remove()"></a>` : ''}<div><span class="tdx-eyebrow">${esc(n.topic)} · ${esc(n.source)} · ${esc(dfmt.format(new Date(n.publishedAt)))}${n.lang === 'en' ? ' · en inglés' : ''}</span><h3><a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">${esc(n.title)} ↗</a></h3>${n.summary ? `<p>${esc(n.summary)}</p>` : ''}</div></article>`).join('') : '<p class="tdx-muted">No hay noticias de este tema por ahora.</p>';
  }
  $('newsTopics').addEventListener('click', e => { const b = e.target.closest('[data-nt]'); if (b) { topic = b.dataset.nt; renderNews(); } });

  // ---------- boot ----------
  renderPortada(); renderFilters(); renderGrid(); renderArchive();
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); loadNews(); } }, { rootMargin: '400px' }); io.observe($('noticias')); } else loadNews();
  const h = location.hash.match(/^#sp-(.+)$/); if (h && byId(h[1])) setTimeout(() => openFicha(h[1]), 50);
  window.addEventListener('storage', e => { if (e.key === KEY) { renderPortada(); renderGrid(); renderArchive(); } });
  setInterval(() => { if (!shown) renderPortada(); }, 10 * 60000); // new animal after midnight
})();
