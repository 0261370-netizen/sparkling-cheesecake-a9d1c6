/* Citas creativas y sidequests — Creative Gym. Personal data: 'tdl-quests' (synced). Recently shown ids: 'tdl-quest-recent' (this browser only). */
(() => {
  'use strict';
  const X = window.TDX, D = window.TDX_DATA, esc = X.esc, $ = id => document.getElementById(id);
  const Q = D.QUESTS, byId = id => Q.find(q => q.id === id);
  const KEY = 'tdl-quests', RECENT = 'tdl-quest-recent';
  const FOCUS = { color: 'Color', dibujo: 'Dibujo', fotografia: 'Fotografía', materiales: 'Materiales', naturaleza: 'Naturaleza', observacion: 'Observación' };
  const GROUPS = [
    ['min', 'Tiempo', [[5, '5 min'], [15, '15 min'], [30, '30 min'], [60, '60 min']]],
    ['where', 'Dónde', [['casa', 'En casa'], ['fuera', 'Fuera']]],
    ['budget', 'Costo', [['gratis', 'Gratis'], ['bajo', 'Bajo presupuesto']]],
    ['energy', 'Energía', [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta']]],
    ['focus', 'Enfoque', Object.entries(FOCUS)],
  ];
  const f = { min: null, where: null, budget: null, energy: null, focus: null };
  const match = q => (!f.min || q.min === f.min) && (!f.where || q.where === f.where) && (!f.budget || q.budget === f.budget) && (!f.energy || q.energy === f.energy) && (!f.focus || q.focus.includes(f.focus));
  const daily = () => X.dailyQuest();
  let current = daily(), isDaily = true;

  // ---------- state ----------
  const all = () => X.questState();
  const rec = id => all().find(q => q.id === id && !q.deleted);
  function write(id, patch) {
    const list = all(), i = list.findIndex(q => q.id === id), prev = i >= 0 ? list[i] : { id, savedAt: Date.now() };
    const next = { ...prev, ...patch, deleted: patch.deleted || false, updated: Date.now() };
    if (i >= 0) list[i] = next; else list.push(next);
    return X.put(KEY, list);
  }
  const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch { return []; } };
  const remember = id => { try { localStorage.setItem(RECENT, JSON.stringify([id, ...recent().filter(x => x !== id)].slice(0, 14))); } catch { /* ignore */ } };

  // ---------- filters ----------
  function renderFilters() {
    $('filters').innerHTML = GROUPS.map(([k, label, opts]) => `<fieldset class="qx-fgroup"><legend>${label}</legend>${opts.map(([v, l]) => `<button type="button" data-f="${k}" data-v="${v}" aria-pressed="${String(f[k]) === String(v)}">${l}</button>`).join('')}</fieldset>`).join('')
      + `<div class="tdx-row"><button type="button" class="tdx-btn terra" id="surprise">✦ Sorpréndeme</button>${isDaily ? '' : '<button type="button" class="tdx-btn ghost" id="backDaily">← Volver a la cita de hoy</button>'}<button type="button" class="tdx-act" id="clearF">Quitar filtros</button></div>`;
  }
  $('filters').addEventListener('click', e => {
    const b = e.target.closest('[data-f]');
    if (b) { const k = b.dataset.f, v = k === 'min' ? Number(b.dataset.v) : b.dataset.v; f[k] = f[k] === v ? null : v; renderFilters(); renderMatches(); return; }
    if (e.target.closest('#surprise')) surprise();
    if (e.target.closest('#backDaily')) { current = daily(); isDaily = true; renderAll(); }
    if (e.target.closest('#clearF')) { Object.keys(f).forEach(k => f[k] = null); renderFilters(); renderMatches(); }
  });
  function surprise() {
    const pool = Q.filter(match);
    if (!pool.length) { X.toast('Ninguna cita coincide con esos filtros. Quita alguno.', true); return; }
    const rc = recent(), fresh = pool.filter(q => !rc.includes(q.id) && q.id !== current.id);
    const from = fresh.length ? fresh : pool.filter(q => q.id !== current.id);
    current = (from.length ? from : pool)[Math.floor(Math.random() * (from.length || pool.length))];
    isDaily = current.id === daily().id; remember(current.id); renderAll();
    if (!fresh.length && pool.length > 1) X.toast('Ya viste todas las que coinciden; repetimos una que no es la última.');
  }
  function renderMatches() {
    const list = Q.filter(match);
    $('countTxt').textContent = `${list.length} de ${Q.length} citas`;
    $('matches').innerHTML = list.length ? list.slice(0, 40).map(q => `<button type="button" class="qx-item" data-open="${q.id}" style="text-align:left;cursor:pointer" ${q.id === current.id ? 'aria-current="true"' : ''}><h4>${esc(q.title)}</h4><p>${esc(q.place)} · ${q.min} min · ${q.budget === 'gratis' ? 'gratis' : 'bajo costo'}</p></button>`).join('') : '<p class="tdx-muted">Nada con esa combinación. Prueba quitando un filtro.</p>';
  }
  $('matches').addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (!b) return; current = byId(b.dataset.open); isDaily = current.id === daily().id; remember(current.id); renderAll(); $('card').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth', block: 'start' }); });

  // ---------- card ----------
  const chip = q => [`⏱ ${q.min} min`, q.where === 'casa' ? '⌂ En casa' : '↗ Fuera', q.budget === 'gratis' ? 'Gratis' : '$ Bajo presupuesto', `Energía ${q.energy}`, ...q.focus.map(x => FOCUS[x])];
  const qUrl = q => '/citas#q-' + q.id;
  const prompt = q => `${q.mission}\n\nPara el cuaderno (${q.take.type}): ${q.take.text}`;
  function renderCard() {
    const q = current, r = rec(q.id);
    $('cardEyebrow').textContent = isDaily ? 'La cita de hoy · ' + new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) : 'Sorpréndeme';
    $('card').innerHTML = `<article class="qx-card ${X.reduced() ? '' : 'bx-anim'}" id="q-${q.id}">
      <span class="tdx-eyebrow">${esc(q.place)}</span><h3>${esc(q.title)}</h3>
      <div class="ticket">${chip(q).map(c => `<span class="tdx-chip">${esc(c)}</span>`).join('')}${r ? `<span class="tdx-chip fn">${r.status === 'done' ? '✓ Realizada' : '♥ Guardada'}</span>` : ''}</div>
      <p class="qx-mission"><b>Misión.</b> ${esc(q.mission)}</p>
      <dl class="qx-meta"><div><dt>Lugar sugerido</dt><dd>${esc(q.place)}</dd></div><div><dt>Tiempo y presupuesto</dt><dd>${q.min} min · ${q.budget === 'gratis' ? 'gratis' : 'bajo presupuesto'}</dd></div><div><dt>Materiales opcionales</dt><dd>${esc(q.materials)}</dd></div></dl>
      <div class="qx-take"><b>Para el cuaderno · ${esc(q.take.type)}:</b> ${esc(q.take.text)}</div>
      <div class="tdx-row" style="margin-top:14px"><button class="tdx-btn" data-q="done">${r?.status === 'done' ? '✎ Editar resultados' : '✓ La hice: anotar resultados'}</button><button class="tdx-btn ghost" data-q="mesa">▦ Llevar a la Mesa de trabajo</button><button class="tdx-btn ghost" data-q="cal">📅 Google Calendar</button><button class="tdx-btn ghost" data-q="draw">✐ Dibujar en el cuaderno</button></div>
      ${X.actions({ kind: 'quest', ref: q.id, label: q.title, url: qUrl(q), prompt: prompt(q), summary: `Cita creativa en ${q.place}: ${q.mission}`, topic: 'Cita creativa' }, { saved: !!r, saveLabel: '♡ Guardar para después' })}
    </article>`;
  }
  X.saveHandlers.quest = o => {
    const r = rec(o.ref);
    if (r && r.status === 'done') { X.toast('Ya está en tus realizadas'); return; }
    if (r) { write(o.ref, { deleted: true }); X.toast('Quitada de guardadas'); } else { write(o.ref, { status: 'saved', savedAt: Date.now() }); X.toast('Guardada para después'); }
    renderAll();
  };
  $('card').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) act(b.dataset.q, current); });

  function act(a, q) {
    if (a === 'done') resultsDialog(q);
    if (a === 'mesa') mesaDialog(q);
    if (a === 'cal') calDialog(q);
    if (a === 'draw') X.toNotebook({ kind: 'quest', ref: q.id, label: q.title, url: qUrl(q), prompt: prompt(q) }, 'bocetos');
    if (a === 'nb') X.toNotebook({ kind: 'quest', ref: q.id, label: q.title, url: qUrl(q), prompt: prompt(q) + (rec(q.id)?.results ? '\n\nLo que traje: ' + rec(q.id).results : '') });
    if (a === 'forget' && confirm('¿Quitar esta aventura de tu lista? Se borran sus resultados y fotos.')) { write(q.id, { deleted: true }); renderAll(); }
  }

  // ---------- results + reflection ----------
  function resultsDialog(q) {
    const r = rec(q.id) || {};
    let photos = Array.isArray(r.photos) ? [...r.photos] : [];
    const pals = X.palettes.list();
    const thumbs = () => photos.map((p, i) => `<figure class="att"><img src="${p}" alt="Foto ${i + 1}"><button type="button" data-rm="${i}" aria-label="Quitar foto ${i + 1}">×</button></figure>`).join('');
    X.dialog({
      title: q.title, wide: true,
      body: `<p class="tdx-muted">${esc(q.take.text)}</p><form data-f>
        <label class="tdx-lbl">¿Qué trajiste? (resultados)<textarea name="res" rows="3" maxlength="1500" placeholder="Ej.: tres nervaduras dibujadas; la de abanico parece una estructura de lámpara.">${esc(r.results || '')}</textarea></label>
        <label class="tdx-lbl">Reflexión<textarea name="ref" rows="3" maxlength="1500" placeholder="¿Qué te sorprendió? ¿Qué te llevas para diseñar?">${esc(r.reflection || '')}</textarea></label>
        <label class="tdx-lbl">Paleta relacionada<select name="pal"><option value="">— Ninguna —</option>${pals.map(p => `<option value="${esc(p.id)}" ${r.paletteId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
        <div class="tdx-lbl">Fotos (máx. 3, se comprimen en tu navegador)<div class="att-list" data-ph style="margin-top:6px">${thumbs()}</div><input type="file" accept="image/*" multiple data-in aria-label="Añadir fotos"></div>
        <p class="tdx-muted">Para dibujos, usa «Dibujar en el cuaderno»: el boceto quedará unido a esta aventura.</p>
        <div class="tdx-row end">${r.status === 'done' ? '<button type="button" class="tdx-btn ghost" data-undone>Marcar como no realizada</button>' : ''}<button class="tdx-btn">✓ Guardar como realizada</button></div></form>`,
      onMount: d => {
        const ph = d.querySelector('[data-ph]');
        ph.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { photos.splice(Number(b.dataset.rm), 1); ph.innerHTML = thumbs(); } });
        d.querySelector('[data-in]').onchange = async e => { for (const file of [...e.target.files].slice(0, 3 - photos.length)) { try { photos.push((await X.compressImage(file, 900, .7)).data); } catch { X.toast('No se pudo leer una foto', true); } } e.target.value = ''; ph.innerHTML = thumbs(); };
        d.querySelector('[data-undone]')?.addEventListener('click', () => { write(q.id, { status: 'saved' }); d.close(); renderAll(); });
        d.querySelector('[data-f]').onsubmit = e => {
          e.preventDefault(); const fm = e.target, p = X.palettes.find(fm.pal.value);
          if (write(q.id, { status: 'done', doneAt: r.doneAt || Date.now(), results: fm.res.value.trim(), reflection: fm.ref.value.trim(), photos, paletteId: p?.id || '', palette: p?.colors || null })) { X.toast('¡Aventura anotada!'); d.close(); renderAll(); }
        };
      },
    });
  }

  // ---------- Mesa de trabajo + Google Calendar ----------
  const C = window.TDLCal;
  const mondayOf = s => { const d = C.parseDate(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return C.iso(d); };
  const todayIso = () => C.iso(new Date());
  const whenForm = (q, btn) => `<form data-f><div class="tdx-row"><label class="tdx-lbl" style="flex:1">Día<input type="date" name="date" value="${todayIso()}"></label><label class="tdx-lbl" style="flex:1">Hora (opcional)<input type="time" name="time"></label></div><p class="tdx-muted">Duración: ${q.min} min. Sin hora se crea como evento de todo el día.</p><div class="tdx-row end">${btn}</div></form>`;
  function calItem(q, date, time) { return { id: 'cita-' + q.id, title: '✦ ' + q.title, date, time: time || '', dur: q.min, place: q.place, details: `${q.mission}\n\nPara el cuaderno: ${q.take.text}\nMateriales: ${q.materials}`, url: location.origin + qUrl(q) }; }
  function mesaDialog(q) {
    X.dialog({ title: 'Llevar a la Mesa de trabajo', body: `<p class="tdx-muted">Se crea un objetivo con prioridad baja en la semana del día que elijas. Es una invitación, no una obligación.</p>${whenForm(q, '<button class="tdx-btn">▦ Crear objetivo</button>')}`,
      onMount: d => d.querySelector('[data-f]').onsubmit = e => {
        e.preventDefault(); const date = e.target.date.value, time = e.target.time.value;
        if (!C.validDate(date)) { X.toast('Elige un día', true); return; }
        let goals; try { goals = JSON.parse(localStorage.getItem('tdl-mesa') || '[]'); } catch { goals = []; } if (!Array.isArray(goals)) goals = [];
        if (goals.some(g => g && g.questId === q.id && g.date === date)) { X.toast('Ya está en tu Mesa de trabajo ese día'); d.close(); return; }
        goals.push({ id: X.uid(), week: mondayOf(date), title: '✦ ' + q.title, note: `${q.place}. ${q.mission}`.slice(0, 600), prio: 'baja', tag: 'Cita creativa', date, time: C.validTime(time) ? time : '', dur: q.min, status: 'todo', subs: [{ id: X.uid(), t: 'Para el cuaderno: ' + q.take.text.slice(0, 150), d: false }], cal: '', questId: q.id, created: Date.now(), updated: Date.now() });
        if (X.put('tdl-mesa', goals)) { if (!rec(q.id)) write(q.id, { status: 'saved' }); X.toast('Objetivo creado en tu Mesa de trabajo'); d.close(); renderAll(); }
      } });
  }
  function calDialog(q) {
    X.dialog({ title: 'Añadir a Google Calendar', body: `<p class="tdx-muted">${esc(C.help)}</p>${whenForm(q, '<button type="button" class="tdx-btn ghost" data-ics>Descargar .ics</button><button class="tdx-btn">📅 Abrir Google Calendar</button>')}`,
      onMount: d => {
        const f2 = d.querySelector('[data-f]');
        f2.onsubmit = e => { e.preventDefault(); const it = calItem(q, f2.date.value, f2.time.value); if (!C.validDate(it.date)) { X.toast('Elige un día', true); return; } window.open(C.googleUrl(it), '_blank', 'noopener'); d.close(); };
        d.querySelector('[data-ics]').onclick = () => { const it = calItem(q, f2.date.value, f2.time.value); if (!C.downloadIcs([it], 'cita-creativa')) X.toast('Elige un día', true); };
      } });
  }

  // ---------- my adventures ----------
  let mineTab = 'saved';
  function renderMine() {
    const sk = X.sketches();
    const list = all().filter(r => !r.deleted && byId(r.id) && (mineTab === 'done' ? r.status === 'done' : r.status !== 'done')).sort((a, b) => (b.updated || 0) - (a.updated || 0));
    document.querySelectorAll('[data-mine]').forEach(b => b.setAttribute('aria-selected', b.dataset.mine === mineTab));
    $('mine').innerHTML = list.length ? list.map(r => {
      const q = byId(r.id), sks = (r.sketches || []).map(id => sk.find(s => s.id === id)).filter(Boolean);
      return `<article class="qx-item ${r.status === 'done' ? 'done' : ''}" id="mine-${q.id}"><span class="tdx-eyebrow">${esc(q.place)} · ${q.min} min</span><h4>${esc(q.title)}</h4><p>${esc(q.mission)}</p>
        ${r.results ? `<p><b>Resultados:</b> ${esc(r.results)}</p>` : ''}${r.reflection ? `<p><b>Reflexión:</b> ${esc(r.reflection)}</p>` : ''}
        ${r.palette ? `<div class="pal-mini" style="height:14px">${r.palette.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</div>` : ''}
        ${(r.photos?.length || sks.length) ? `<div class="qx-res-pics">${(r.photos || []).map(p => `<img src="${p}" alt="Foto de la aventura" loading="lazy">`).join('')}${sks.map(s => `<a href="/cuaderno#bocetos" title="Boceto: ${esc(s.title)}"><img src="${esc(s.img)}" alt="Boceto ${esc(s.title)}" loading="lazy"></a>`).join('')}</div>` : ''}
        <div class="tdx-row"><button class="tdx-act" data-m="open" data-id="${q.id}">Ver</button><button class="tdx-act" data-m="done" data-id="${q.id}">${r.status === 'done' ? '✎ Editar' : '✓ La hice'}</button><button class="tdx-act" data-m="nb" data-id="${q.id}">✎ Cuaderno</button><button class="tdx-act" data-m="draw" data-id="${q.id}">✐ Dibujar</button><button class="tdx-act" data-m="mesa" data-id="${q.id}">▦ Mesa</button><button class="tdx-act danger" data-m="forget" data-id="${q.id}">Quitar</button></div></article>`;
    }).join('') : `<div class="tdx-empty" style="grid-column:1/-1"><b>${mineTab === 'done' ? 'Todavía nada por aquí' : 'Sin aventuras guardadas'}</b><span>${mineTab === 'done' ? 'Cuando hagas una, anota lo que trajiste. Y si no haces ninguna, también está bien.' : 'Pulsa «♡ Guardar para después» en cualquier propuesta.'}</span></div>`;
  }
  document.querySelector('.qx-kind').addEventListener('click', e => { const b = e.target.closest('[data-mine]'); if (b) { mineTab = b.dataset.mine; renderMine(); } });
  $('mine').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; const q = byId(b.dataset.id); if (!q) return; if (b.dataset.m === 'open') { current = q; isDaily = q.id === daily().id; renderAll(); $('hoy').scrollIntoView({ behavior: X.reduced() ? 'auto' : 'smooth' }); } else act(b.dataset.m, q); });

  function renderAll() { renderFilters(); renderCard(); renderMatches(); renderMine(); }
  const h = location.hash.match(/^#q-(.+)$/); if (h && byId(h[1])) { current = byId(h[1]); isDaily = current.id === daily().id; }
  remember(current.id);
  renderAll();
  X.mountStatus($('saveState'));
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === 'tdl-sketches') renderAll(); });
  document.addEventListener('tdx:change', e => { if (e.detail?.key === KEY) renderMine(); });
})();
