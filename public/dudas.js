// DUDAS Y VISITAS — notebook tab for factory visits and supplier meetings.
// Data: 'tdl-dudas' (visits + loose questions) and 'tdl-dudas-fotos' ({questionId: jpeg data URL}).
// Both sync to the private cloud copy and are included in the backup.
(() => {
  'use strict';
  const root = document.getElementById('dudasRoot');
  if (!root || !window.TDLCal) return;
  const C = window.TDLCal;
  const KEY = 'tdl-dudas', PHOTOS = 'tdl-dudas-fotos', MESA = 'tdl-mesa';
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const getJ = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { say('No se pudo guardar: el almacenamiento del navegador está lleno. Prueba a quitar algunas fotos.'); return false; } };
  const say = m => { const t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => t.classList.remove('show'), 2600); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const now = () => Date.now();
  const ping = k => { try { window.dispatchEvent(new StorageEvent('storage', { key: k })); } catch { /* ignore */ } };

  const TOPICS = ['Materiales', 'Procesos de fabricación', 'Costos y mínimos', 'Tiempos de entrega', 'Acabados y calidad', 'Sostenibilidad', 'Otros'];
  const STATES = [['pendiente', 'Pendiente'], ['preguntada', 'Preguntada'], ['respondida', 'Respondida']];
  const TEMPLATES = {
    'Materiales': ['¿Qué materiales y espesores tienen en stock?', '¿Trabajan con maderas o tableros certificados (FSC)?', '¿Puedo llevarme muestras físicas?', '¿Qué alternativas más económicas o ligeras recomiendan?'],
    'Procesos de fabricación': ['¿Qué maquinaria tienen (CNC, láser, plegado, soldadura, inyección)?', '¿Qué tolerancias manejan?', '¿Hacen prototipos antes de la producción?', '¿Qué parte del proceso subcontratan?'],
    'Costos y mínimos': ['¿Cuál es el mínimo de producción?', '¿Cómo cambia el precio por volumen?', '¿Cobran moldes, herramentales o preparación de máquina?', '¿Qué condiciones de pago manejan?'],
    'Tiempos de entrega': ['¿Cuánto tarda un prototipo?', '¿Cuánto tarda una producción completa?', '¿En qué temporadas se saturan?', '¿Cómo avisan si hay retrasos?'],
    'Acabados y calidad': ['¿Qué acabados ofrecen (laca, aceite, electrostática, chapa)?', '¿Cómo controlan la calidad de cada lote?', '¿Qué garantía dan?', '¿Puedo ver piezas terminadas de otros clientes?'],
    'Sostenibilidad': ['¿Qué hacen con recortes y desperdicios?', '¿Usan acabados base agua o de bajo COV?', '¿Las piezas se pueden desmontar o reparar?', '¿De dónde viene la materia prima?'],
    'Otros': ['¿Quién será mi contacto para dar seguimiento?', '¿En qué formato prefieren los planos (DWG, STEP, PDF)?', '¿Se encargan del empaque y el envío?', '¿Firman acuerdo de confidencialidad?'],
  };
  const dayFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ---------- data ----------
  const normQ = q => q && typeof q.text === 'string' ? {
    id: String(q.id || uid()), topic: TOPICS.includes(q.topic) ? q.topic : 'Otros', text: q.text.slice(0, 400),
    status: STATES.some(s => s[0] === q.status) ? q.status : 'pendiente', answer: String(q.answer || '').slice(0, 2000),
    ref: q.ref && typeof q.ref.label === 'string' ? { kind: String(q.ref.kind || '').slice(0, 30), label: q.ref.label.slice(0, 120), url: /^\/|^https?:\/\//.test(q.ref.url || '') ? q.ref.url : '' } : null,
    updated: Number(q.updated) || now(),
  } : null;
  function norm(x) {
    if (!x || typeof x !== 'object') return null;
    if (x.type === 'q') { const q = normQ(x); return q && { ...q, type: 'q' }; }
    if (x.type !== 'visit' || typeof x.title !== 'string') return null;
    return {
      id: String(x.id || uid()), type: 'visit', title: x.title.slice(0, 140), place: String(x.place || '').slice(0, 160),
      date: C.validDate(x.date) ? x.date : '', time: C.validTime(x.time) ? x.time : '', dur: Number(x.dur) > 0 ? Math.min(1440, Number(x.dur)) : 0,
      contact: String(x.contact || '').slice(0, 160), goal: String(x.goal || '').slice(0, 600), goalId: String(x.goalId || ''),
      questions: Array.isArray(x.questions) ? x.questions.map(normQ).filter(Boolean) : [], cal: typeof x.cal === 'string' ? x.cal : '',
      created: Number(x.created) || now(), updated: Number(x.updated) || now(),
    };
  }
  let items = [], photos = {};
  const load = () => { const v = getJ(KEY, []); items = (Array.isArray(v) ? v : []).map(norm).filter(Boolean); const p = getJ(PHOTOS, {}); photos = p && typeof p === 'object' && !Array.isArray(p) ? p : {}; };
  load();
  const save = () => { const ok = put(KEY, items); ping(KEY); return ok; };
  const savePhotos = () => put(PHOTOS, photos);
  const visits = () => items.filter(x => x.type === 'visit');
  const loose = () => items.filter(x => x.type === 'q');
  const visitById = id => items.find(x => x.type === 'visit' && x.id === id);
  const findQ = (vid, qid) => { const v = vid ? visitById(vid) : null; return v ? v.questions.find(q => q.id === qid) : items.find(x => x.type === 'q' && x.id === qid); };
  const goals = () => { const g = getJ(MESA, []); return Array.isArray(g) ? g.filter(x => x && x.id && typeof x.title === 'string') : []; };
  const touch = x => { x.updated = now(); };

  // ---------- calendar ----------
  const visitUrl = v => `${location.origin}/cuaderno#visita-${v.id}`;
  function calItem(v) {
    const parts = [];
    if (v.goal) parts.push('Objetivo de la visita: ' + v.goal);
    if (v.contact) parts.push('Contacto: ' + v.contact);
    const pend = v.questions.filter(q => q.status !== 'respondida');
    if (pend.length) parts.push('Preguntas:\n' + TOPICS.map(t => { const qs = pend.filter(q => q.topic === t); return qs.length ? `${t}\n` + qs.map(q => '• ' + q.text).join('\n') : ''; }).filter(Boolean).join('\n'));
    return { id: 'visita-' + v.id, title: v.title, date: v.date, time: v.time, dur: v.dur || (v.time ? 120 : 0), place: v.place, details: parts.join('\n\n'), url: visitUrl(v) };
  }
  const calSig = v => C.signature(calItem(v)) + '|' + v.place;
  const calState = v => !v.date ? 'none' : !v.cal ? 'new' : v.cal === calSig(v) ? 'added' : 'stale';

  // ---------- summary ----------
  function summaryText(v) {
    const L = [`VISITA: ${v.title}`];
    if (v.date) L.push(`Fecha: ${dayFmt.format(C.parseDate(v.date))}${v.time ? ', ' + v.time : ''}`);
    if (v.place) L.push('Lugar: ' + v.place);
    if (v.contact) L.push('Contacto: ' + v.contact);
    if (v.goal) L.push('Objetivo: ' + v.goal);
    const ans = v.questions.filter(q => q.status === 'respondida').length;
    L.push(`${ans} de ${v.questions.length} preguntas respondidas`);
    for (const t of TOPICS) {
      const qs = v.questions.filter(q => q.topic === t); if (!qs.length) continue;
      L.push('', t.toUpperCase());
      for (const q of qs) { L.push(`${q.status === 'respondida' ? '✓' : q.status === 'preguntada' ? '•' : '○'} ${q.text}`); if (q.answer) L.push('   → ' + q.answer); if (photos[q.id]) L.push('   📷 foto en la visita'); }
    }
    const pend = v.questions.filter(q => q.status === 'pendiente');
    if (pend.length) L.push('', 'PENDIENTES PARA DAR SEGUIMIENTO', ...pend.map(q => '○ ' + q.text));
    return L.join('\n');
  }
  function copy(t, okMsg) {
    const fb = () => { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); say(okMsg); } catch { say('No se pudo copiar'); } a.remove(); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(() => say(okMsg), fb); else fb();
  }
  function saveAsNote(v) {
    const notes = getJ('tdl-ideas', []); const list = Array.isArray(notes) ? notes : [];
    list.push({ id: uid(), date: new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()), title: 'Visita: ' + v.title, text: summaryText(v), tags: ['visita', 'dudas'], link: '' });
    if (put('tdl-ideas', list)) { ping('tdl-ideas'); say('Resumen guardado como nota en tu cuaderno'); }
  }

  // ---------- photos ----------
  function compress(file) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => { URL.revokeObjectURL(u); const S = 900, k = Math.min(1, S / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .62)); };
      im.onerror = () => { URL.revokeObjectURL(u); rej(); }; im.src = u;
    });
  }
  let photoTarget = null;
  const photoInput = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', hidden: true });
  photoInput.setAttribute('capture', 'environment');
  document.body.appendChild(photoInput);
  photoInput.addEventListener('change', async () => {
    const f = photoInput.files?.[0]; const t = photoTarget; photoInput.value = ''; if (!f || !t) return;
    try { const d = await compress(f); photos[t.qid] = d; if (!savePhotos()) { delete photos[t.qid]; return; } const v = visitById(t.vid); if (v) { touch(v); save(); } render(); renderMode(); say('Foto guardada con la pregunta'); } catch { say('No se pudo leer la foto'); }
  });

  // ---------- render ----------
  let filter = 'proximas', editing = null, modeVisit = null, modeShowAll = false;
  const today = () => C.iso(new Date());
  const statusLabel = s => STATES.find(x => x[0] === s)[1];
  const topicOpts = sel => TOPICS.map(t => `<option ${t === sel ? 'selected' : ''}>${t}</option>`).join('');
  function qHtml(q, vid) {
    const ph = photos[q.id];
    return `<div class="dv-q s-${q.status}" data-q="${q.id}">
      <div class="dv-qtop"><button type="button" class="dv-status" data-act="cycle" data-v="${vid || ''}" data-q="${q.id}" title="Cambiar estado">${statusLabel(q.status)}</button><p>${e(q.text)}${q.ref ? ` <a class="dv-ref" href="${e(q.ref.url || '#')}">↳ ${e(q.ref.kind ? q.ref.kind + ': ' : '')}${e(q.ref.label)}</a>` : ''}</p><button type="button" class="mz-x" data-act="delq" data-v="${vid || ''}" data-q="${q.id}" aria-label="Borrar pregunta">×</button></div>
      ${vid ? `<textarea data-answer data-v="${vid}" data-q="${q.id}" maxlength="2000" placeholder="Respuesta…" aria-label="Respuesta">${e(q.answer)}</textarea>
      <div class="mz-row">${ph ? `<img class="dv-photo" src="${e(ph)}" alt="Foto de la visita"><button type="button" class="mz-mini del" data-act="delphoto" data-v="${vid}" data-q="${q.id}">Quitar foto</button>` : `<button type="button" class="mz-mini" data-act="photo" data-v="${vid}" data-q="${q.id}">📷 Foto</button>`}</div>` : ''}
    </div>`;
  }
  function visitForm() {
    const v = editing ? visitById(editing) : null;
    const gs = goals().sort((a, b) => String(b.week).localeCompare(String(a.week))).slice(0, 40);
    return `<form class="dv-form" id="dvForm">
      <input name="title" required maxlength="140" placeholder="Visita a fábrica de muebles, reunión con proveedor…" value="${e(v?.title)}" aria-label="Nombre de la visita">
      <input name="place" maxlength="160" placeholder="Lugar o dirección" value="${e(v?.place)}" aria-label="Lugar">
      <div class="dv-grid"><label>Fecha<input name="date" type="date" value="${e(v?.date)}"></label><label>Hora<input name="time" type="time" value="${e(v?.time)}"></label></div>
      <input name="contact" maxlength="160" placeholder="Contacto (nombre, teléfono, correo)" value="${e(v?.contact)}" aria-label="Contacto">
      <textarea name="goal" maxlength="600" placeholder="Objetivo de la visita: ¿qué necesito saber o decidir?" aria-label="Objetivo">${e(v?.goal)}</textarea>
      <label class="dv-lbl">Enlazar con un objetivo de la Mesa de trabajo<select name="goalId"><option value="">Sin enlazar</option>${gs.map(g => `<option value="${e(g.id)}" ${v?.goalId === g.id ? 'selected' : ''}>${e(g.title)}${g.date ? ' · ' + e(g.date) : ''}</option>`).join('')}<option value="__new">＋ Crear un objetivo nuevo con esta visita</option></select></label>
      <div class="mz-row"><button class="mz-btn" type="submit">${v ? 'Guardar cambios' : 'Crear visita'}</button>${v ? '<button type="button" class="mz-btn ghost" data-act="cancel">Cancelar</button>' : ''}</div></form>`;
  }
  function visitHtml(v) {
    const ans = v.questions.filter(q => q.status === 'respondida').length, pend = v.questions.filter(q => q.status === 'pendiente').length;
    const goal = v.goalId ? goals().find(g => g.id === v.goalId) : null, st = calState(v);
    return `<article class="dv-visit" id="visita-${v.id}">
      <header><div><span class="mz-kicker">Visita · reunión</span><h3>${e(v.title)}</h3></div><span class="dv-count">${ans}/${v.questions.length} respondidas</span></header>
      <div class="dv-meta">${v.date ? `<span>${e(dayFmt.format(C.parseDate(v.date)))}${v.time ? ' · ' + v.time : ''}</span>` : '<span>Sin fecha</span>'}${v.place ? `<span>⌂ ${e(v.place)}</span>` : ''}${v.contact ? `<span>☎ ${e(v.contact)}</span>` : ''}${goal ? `<a class="dv-goal-link" href="/#mesa-g-${e(goal.id)}">▦ ${e(goal.title)}</a>` : ''}</div>
      ${v.goal ? `<p class="dv-goal"><b>Objetivo:</b> ${e(v.goal)}</p>` : ''}
      <div class="mz-row"><button type="button" class="mz-btn terra" data-act="mode" data-v="${v.id}" ${v.questions.length ? '' : 'disabled'}>▶ Modo visita${pend ? ` · ${pend} pendientes` : ''}</button></div>
      ${TOPICS.map(t => { const qs = v.questions.filter(q => q.topic === t); return qs.length ? `<div class="dv-topic"><h4>${t}<span>${qs.filter(q => q.status === 'respondida').length}/${qs.length}</span></h4>${qs.map(q => qHtml(q, v.id)).join('')}</div>` : ''; }).join('')}
      <form class="dv-addq" data-v="${v.id}"><select name="topic" aria-label="Tema">${topicOpts('Materiales')}</select><input name="text" maxlength="400" placeholder="＋ Nueva pregunta para esta visita" aria-label="Nueva pregunta"><button class="mz-mini" type="submit">Añadir</button></form>
      <details class="dv-tpl"><summary>✦ Preguntas sugeridas para visitas a fábrica</summary>${TOPICS.map(t => `<h4 class="dv-tpl-h">${t}</h4><div class="dv-tpl-list">${TEMPLATES[t].map((q, i) => { const has = v.questions.some(x => x.text === q); return `<button type="button" data-act="tpl" data-v="${v.id}" data-t="${e(t)}" data-i="${i}" ${has ? 'disabled' : ''}>${has ? '✓ ' : '＋ '}${e(q)}</button>`; }).join('')}</div>`).join('')}</details>
      <div class="dv-foot">
        ${st === 'none' ? '<span class="mz-cal-hint">Ponle fecha para añadirla a Calendar</span>' : `<a class="mz-gcal" href="${e(C.googleUrl(calItem(v)))}" target="_blank" rel="noopener" data-act="gcal" data-v="${v.id}">📅 ${st === 'new' ? 'Añadir a Google Calendar' : 'Volver a añadir'}</a><button type="button" class="mz-mini" data-act="ics" data-v="${v.id}">.ics</button>${st === 'added' ? '<span class="mz-badge ok">📅 Añadido</span>' : st === 'stale' ? '<span class="mz-badge warn">Cambiaste esta visita, vuelve a añadirla a Calendar</span>' : ''}`}
        <span class="mz-sp"></span>
        <button type="button" class="mz-mini" data-act="summary" data-v="${v.id}">☰ Resumen</button>
        <button type="button" class="mz-mini" data-act="edit" data-v="${v.id}">Editar</button>
        <button type="button" class="mz-mini del" data-act="delv" data-v="${v.id}">Borrar</button>
      </div></article>`;
  }
  function render() {
    const vs = visits(), t = today();
    const shown = vs.filter(v => filter === 'todas' || (filter === 'proximas' ? !v.date || v.date >= t : v.date && v.date < t))
      .sort((a, b) => filter === 'pasadas' ? (b.date || '').localeCompare(a.date || '') : (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '').localeCompare(b.time || ''));
    const ls = loose();
    const count = document.getElementById('dCount'); if (count) count.textContent = ls.length + vs.reduce((n, v) => n + v.questions.filter(q => q.status === 'pendiente').length, 0);
    const active = document.activeElement, keep = active && root.contains(active) && active.dataset.answer !== undefined ? [active.dataset.q, active.selectionStart] : null;
    root.innerHTML = `<div class="dv"><div class="dv-layout">
      <aside class="dv-side">
        <section class="dv-box"><div class="mono">${editing ? 'Editando visita' : 'Nueva visita o reunión'}</div><h3>${editing ? 'Ajusta los datos' : '¿A dónde vas?'}</h3>${visitForm()}</section>
        <section class="dv-box"><div class="mono">Bandeja</div><h3>Dudas sueltas <small class="dv-count">${ls.length}</small></h3>
          <form class="dv-addq" data-v=""><select name="topic" aria-label="Tema">${topicOpts('Otros')}</select><input name="text" maxlength="400" placeholder="Anota una duda rápida…" aria-label="Duda suelta"><button class="mz-mini" type="submit">Guardar</button></form>
          <div class="dv-inbox">${ls.length ? ls.slice().reverse().map(q => `<div class="dv-loose"><div class="dv-qtop"><span class="mz-prio">${e(q.topic)}</span><p>${e(q.text)}${q.ref ? ` <a class="dv-ref" href="${e(q.ref.url || '#')}">↳ ${e(q.ref.kind ? q.ref.kind + ': ' : '')}${e(q.ref.label)}</a>` : ''}</p><button type="button" class="mz-x" data-act="delq" data-v="" data-q="${q.id}" aria-label="Borrar duda">×</button></div>
            ${vs.length ? `<div class="mz-row"><select data-moveq="${q.id}" aria-label="Mover a una visita"><option value="">Mover a una visita…</option>${vs.map(v => `<option value="${v.id}">${e(v.title)}</option>`).join('')}</select></div>` : ''}</div>`).join('') : '<p class="mz-empty">Aquí caen las preguntas que se te ocurren en cualquier momento. Luego las mueves a una visita.</p>'}</div>
          ${ls.length && !vs.length ? '<p class="mz-help">Crea una visita para poder mover estas dudas.</p>' : ''}</section>
      </aside>
      <div><div class="dv-filter mz-views" role="tablist">${[['proximas', 'Próximas'], ['pasadas', 'Pasadas'], ['todas', 'Todas']].map(([k, l]) => `<button type="button" role="tab" data-act="filter" data-f="${k}" aria-selected="${filter === k}">${l} · ${vs.filter(v => k === 'todas' || (k === 'proximas' ? !v.date || v.date >= t : v.date && v.date < t)).length}</button>`).join('')}</div>
        <p class="mz-help">📅 ${e(C.help)}</p>
        <div class="dv-visits">${shown.map(visitHtml).join('') || `<div class="dv-empty">${vs.length ? 'No hay visitas en esta vista.' : 'Crea tu primera visita a la izquierda y empieza a guardar preguntas para no olvidar nada.'}</div>`}</div></div>
    </div></div>`;
    if (keep) { const t2 = root.querySelector(`[data-answer][data-q="${keep[0]}"]`); if (t2) { t2.focus(); try { t2.setSelectionRange(keep[1], keep[1]); } catch { /* ignore */ } } }
  }

  // ---------- visit mode (phone first) ----------
  const overlay = document.createElement('div');
  overlay.className = 'dv-mode'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Modo visita');
  document.body.appendChild(overlay);
  function renderMode() {
    const v = modeVisit && visitById(modeVisit); if (!v) { overlay.hidden = true; document.body.classList.remove('dv-lock'); return; }
    const list = v.questions.filter(q => modeShowAll || q.status === 'pendiente');
    const pend = v.questions.filter(q => q.status === 'pendiente').length;
    overlay.innerHTML = `<header><div><small>Modo visita</small><strong>${e(v.title)}</strong></div><button type="button" data-mact="close">Salir ✕</button></header>
      <div class="dv-mode-bar"><span>${pend ? `${pend} pendiente${pend > 1 ? 's' : ''}` : '¡Todo preguntado!'}</span><button type="button" data-mact="all">${modeShowAll ? 'Solo pendientes' : 'Ver todas'}</button></div>
      <div class="dv-mode-list">${list.map(q => `<article class="s-${q.status}" data-q="${q.id}"><small>${e(q.topic)}</small><p>${e(q.text)}</p>
        <textarea data-manswer data-q="${q.id}" placeholder="Escribe la respuesta…" aria-label="Respuesta">${e(q.answer)}</textarea>
        <div class="dv-mode-acts"><button type="button" data-mact="asked" data-q="${q.id}">${q.status === 'pendiente' ? '✓ Ya la pregunté' : '↺ Pendiente'}</button><button type="button" data-mact="done" data-q="${q.id}" class="pri">Respondida ✓</button><button type="button" data-mact="photo" data-q="${q.id}">📷</button></div>
        ${photos[q.id] ? `<img src="${e(photos[q.id])}" alt="Foto">` : ''}</article>`).join('') || `<div class="dv-mode-end"><strong>Listo ✓</strong><p>Ya hiciste todas las preguntas pendientes.</p><button type="button" data-mact="summary" class="pri">Ver resumen de la visita</button></div>`}</div>`;
    overlay.hidden = false; document.body.classList.add('dv-lock');
  }
  overlay.addEventListener('click', ev => {
    const b = ev.target.closest('[data-mact]'); if (!b) return;
    const v = visitById(modeVisit); if (!v) return;
    const q = b.dataset.q ? v.questions.find(x => x.id === b.dataset.q) : null;
    const a = b.dataset.mact;
    if (a === 'close') { modeVisit = null; renderMode(); render(); }
    else if (a === 'all') { modeShowAll = !modeShowAll; renderMode(); }
    else if (a === 'asked' && q) { q.status = q.status === 'pendiente' ? 'preguntada' : 'pendiente'; q.updated = now(); touch(v); save(); renderMode(); }
    else if (a === 'done' && q) { const t = overlay.querySelector(`[data-manswer][data-q="${q.id}"]`); if (t) q.answer = t.value.slice(0, 2000); q.status = 'respondida'; q.updated = now(); touch(v); save(); renderMode(); }
    else if (a === 'photo' && q) { photoTarget = { vid: v.id, qid: q.id }; photoInput.click(); }
    else if (a === 'summary') { modeVisit = null; renderMode(); render(); openSummary(v); }
  });
  overlay.addEventListener('input', ev => { const t = ev.target; if (t.dataset.manswer === undefined) return; const v = visitById(modeVisit); const q = v?.questions.find(x => x.id === t.dataset.q); if (!q) return; q.answer = t.value.slice(0, 2000); q.updated = now(); touch(v); clearTimeout(overlay.t); overlay.t = setTimeout(save, 400); });

  // ---------- summary dialog ----------
  const sum = document.createElement('div'); sum.className = 'dv-sum'; sum.hidden = true; document.body.appendChild(sum);
  function openSummary(v) {
    sum.innerHTML = `<div class="dv-sum-card" role="dialog" aria-modal="true" aria-label="Resumen de la visita"><button type="button" class="dv-sum-x" data-sact="close" aria-label="Cerrar">✕</button>
      <div class="mono">Resumen de la visita</div><h3>${e(v.title)}</h3><pre>${e(summaryText(v))}</pre>
      ${v.questions.some(q => photos[q.id]) ? `<h4>Fotos</h4><div class="dv-sum-ph">${v.questions.filter(q => photos[q.id]).map(q => `<figure><img src="${e(photos[q.id])}" alt=""><figcaption>${e(q.text)}</figcaption></figure>`).join('')}</div>` : ''}
      <div class="mz-row"><button type="button" class="mz-btn" data-sact="copy">⧉ Copiar resumen</button><button type="button" class="mz-btn terra" data-sact="note">✎ Guardar como nota</button></div>
      <p class="mz-help">Las fotos se quedan en la visita; la nota guarda el texto.</p></div>`;
    sum.hidden = false; sum.dataset.v = v.id; document.body.classList.add('dv-lock');
  }
  sum.addEventListener('click', ev => {
    const a = ev.target.closest('[data-sact]')?.dataset.sact || (ev.target === sum ? 'close' : ''); const v = visitById(sum.dataset.v);
    if (a === 'close') { sum.hidden = true; document.body.classList.remove('dv-lock'); }
    else if (a === 'copy' && v) copy(summaryText(v), 'Resumen copiado');
    else if (a === 'note' && v) saveAsNote(v);
  });
  document.addEventListener('keydown', ev => { if (ev.key !== 'Escape') return; if (!sum.hidden) { sum.hidden = true; document.body.classList.remove('dv-lock'); } else if (!overlay.hidden) { modeVisit = null; renderMode(); render(); } });

  // ---------- actions ----------
  function createGoalFor(v) {
    const g = getJ(MESA, []); const list = Array.isArray(g) ? g : [];
    const base = v.date ? C.parseDate(v.date) : new Date(); base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const goal = { id: uid(), week: C.iso(base), title: v.title, note: v.goal, prio: 'alta', tag: 'visita', date: v.date, time: v.date ? v.time : '', dur: v.time ? 120 : 0, status: 'todo', subs: [], links: [], cal: '', created: now(), updated: now() };
    list.push(goal); put(MESA, list); ping(MESA); return goal.id;
  }
  root.addEventListener('submit', ev => {
    ev.preventDefault(); const f = ev.target;
    if (f.id === 'dvForm') {
      const d = Object.fromEntries(new FormData(f)); const title = String(d.title || '').trim(); if (!title) return;
      const fields = { title, place: String(d.place || '').trim(), date: d.date || '', time: d.date ? d.time || '' : '', contact: String(d.contact || '').trim(), goal: String(d.goal || '').trim() };
      let v = editing ? visitById(editing) : null;
      if (v) Object.assign(v, fields); else { v = norm({ ...fields, type: 'visit', id: uid(), questions: [] }); items.push(v); }
      v.goalId = d.goalId === '__new' ? createGoalFor(v) : d.goalId || '';
      touch(v); save(); say(editing ? 'Visita actualizada' : d.goalId === '__new' ? 'Visita creada y añadida a tu Mesa de trabajo' : 'Visita creada: añade tus preguntas');
      editing = null; filter = !v.date || v.date >= today() ? 'proximas' : 'pasadas'; render();
      document.getElementById('visita-' + v.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (f.classList.contains('dv-addq')) {
      const text = f.text.value.trim(); if (!text) return; const topic = f.topic.value;
      const vid = f.dataset.v;
      if (vid) { const v = visitById(vid); if (!v) return; v.questions.push(normQ({ topic, text })); touch(v); }
      else items.push({ ...normQ({ topic, text }), type: 'q' });
      save(); render();
      root.querySelector(`.dv-addq[data-v="${vid}"] input`)?.focus();
    }
  });
  root.addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
    const a = b.dataset.act, v = b.dataset.v ? visitById(b.dataset.v) : null;
    if (a === 'filter') { filter = b.dataset.f; render(); }
    else if (a === 'cancel') { editing = null; render(); }
    else if (a === 'edit' && v) { editing = v.id; render(); root.querySelector('#dvForm [name=title]')?.focus(); root.querySelector('#dvForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else if (a === 'delv' && v) { if (!confirm(`¿Borrar la visita "${v.title}" y sus ${v.questions.length} preguntas?`)) return; v.questions.forEach(q => delete photos[q.id]); savePhotos(); items = items.filter(x => x !== v); if (editing === v.id) editing = null; save(); render(); say('Visita borrada'); }
    else if (a === 'cycle') { const q = findQ(b.dataset.v, b.dataset.q); if (!q) return; const i = STATES.findIndex(s => s[0] === q.status); q.status = STATES[(i + 1) % 3][0]; q.updated = now(); if (v) touch(v); save(); render(); }
    else if (a === 'delq') { if (v) { v.questions = v.questions.filter(q => q.id !== b.dataset.q); touch(v); } else items = items.filter(x => !(x.type === 'q' && x.id === b.dataset.q)); delete photos[b.dataset.q]; savePhotos(); save(); render(); }
    else if (a === 'tpl' && v) { const t = b.dataset.t, q = TEMPLATES[t]?.[Number(b.dataset.i)]; if (!q || v.questions.some(x => x.text === q)) return; v.questions.push(normQ({ topic: t, text: q })); touch(v); save(); render(); root.querySelector(`#visita-${v.id} .dv-tpl`)?.setAttribute('open', ''); }
    else if (a === 'photo' && v) { photoTarget = { vid: v.id, qid: b.dataset.q }; photoInput.click(); }
    else if (a === 'delphoto' && v) { delete photos[b.dataset.q]; savePhotos(); touch(v); save(); render(); }
    else if (a === 'mode' && v) { modeVisit = v.id; modeShowAll = !v.questions.some(q => q.status === 'pendiente'); renderMode(); }
    else if (a === 'summary' && v) openSummary(v);
    else if (a === 'gcal' && v) { v.cal = calSig(v); touch(v); save(); setTimeout(render, 50); say('Se abrió Google Calendar: pulsa Guardar para añadirla'); }
    else if (a === 'ics' && v) { if (C.downloadIcs([calItem(v)], 'visita-' + v.title)) { v.cal = calSig(v); touch(v); save(); render(); say('Archivo .ics descargado'); } }
  });
  root.addEventListener('change', ev => {
    const s = ev.target; if (!s.dataset.moveq || !s.value) return;
    const q = items.find(x => x.type === 'q' && x.id === s.dataset.moveq), v = visitById(s.value); if (!q || !v) return;
    const { type, ...rest } = q; v.questions.push({ ...rest, updated: now() }); items = items.filter(x => x !== q); touch(v); save(); render(); say(`Duda movida a "${v.title}"`);
  });
  let ansTimer = 0;
  root.addEventListener('input', ev => {
    const t = ev.target; if (t.dataset.answer === undefined) return;
    const v = visitById(t.dataset.v), q = v?.questions.find(x => x.id === t.dataset.q); if (!q) return;
    q.answer = t.value.slice(0, 2000); if (q.answer && q.status === 'pendiente') q.status = 'preguntada'; q.updated = now(); touch(v);
    clearTimeout(ansTimer); ansTimer = setTimeout(save, 500);
  });
  root.addEventListener('focusout', ev => { if (ev.target.dataset?.answer !== undefined) { clearTimeout(ansTimer); save(); setTimeout(() => { if (!root.contains(document.activeElement) || document.activeElement.dataset.answer === undefined) render(); }, 0); } });

  function openFromHash() {
    const m = /^#visita-([\w-]+)$/.exec(location.hash); if (!m) return;
    const v = visitById(m[1]); if (!v) return;
    document.getElementById('tabDudas')?.click();
    history.replaceState(null, '', '#visita-' + v.id);
    filter = 'todas'; render();
    const el = document.getElementById('visita-' + v.id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2400); }
  }
  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('storage', ev => { if ((ev.key === KEY || ev.key === PHOTOS || ev.key === MESA) && !root.contains(document.activeElement)) { load(); render(); } });
  window.Dudas = { reload: () => { load(); render(); }, TOPICS };
  render();
  openFromHash();
})();
