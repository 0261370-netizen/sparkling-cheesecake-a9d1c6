// MESA DE TRABAJO — weekly goals board, "Mi semana" agenda, reflection and history.
// Personal data: 'tdl-mesa' (goals) and 'tdl-mesa-semanas' (reflections). Both sync to the
// cloud through cloud.js and are part of the backup export.
(() => {
  'use strict';
  const root = document.getElementById('mesaRoot');
  if (!root || !window.TDLCal) return;
  const C = window.TDLCal;
  const GOALS = 'tdl-mesa', WEEKS = 'tdl-mesa-semanas';
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : f; } catch { return f; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { say('No se pudo guardar: el almacenamiento del navegador está lleno'); return false; } };
  const say = m => (typeof toast === 'function' ? toast(m) : null);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const now = () => Date.now();

  const STATUS = [['todo', 'Por hacer'], ['doing', 'En proceso'], ['done', 'Hecho']];
  const PRIO = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DURS = [[0, 'Sin duración'], [15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30'], [120, '2 h'], [180, '3 h'], [240, '4 h'], [480, 'Jornada (8 h)']];
  const fmtDur = m => { m = Number(m) || 0; if (!m) return ''; const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ' ' + r : ''}` : `${r} min`; };
  const monthFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
  const longFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return C.iso(x); };
  const today = () => C.iso(new Date());
  const thisWeek = () => mondayOf(new Date());
  const weekLabel = w => { const a = C.parseDate(w), b = C.parseDate(C.addDays(w, 6)); return `Semana del ${a.getDate()}${a.getMonth() !== b.getMonth() ? ' de ' + a.toLocaleDateString('es-MX', { month: 'long' }) : ''} al ${longFmt.format(b)}`; };
  const dayIndex = (w, date) => Math.round((C.parseDate(date) - C.parseDate(w)) / 864e5);

  // ---------- data ----------
  function norm(g) {
    if (!g || typeof g !== 'object' || typeof g.title !== 'string' || !C.validDate(g.week)) return null;
    return {
      id: String(g.id || uid()), week: g.week, title: g.title.slice(0, 140), note: String(g.note || '').slice(0, 600),
      prio: PRIO[g.prio] ? g.prio : 'media', tag: String(g.tag || '').slice(0, 40),
      date: C.validDate(g.date) ? g.date : '', time: C.validTime(g.time) ? g.time : '', dur: Number(g.dur) > 0 ? Math.min(1440, Number(g.dur)) : 0,
      status: STATUS.some(s => s[0] === g.status) ? g.status : 'todo',
      subs: Array.isArray(g.subs) ? g.subs.filter(s => s && typeof s.t === 'string').map(s => ({ id: String(s.id || uid()), t: s.t.slice(0, 160), d: !!s.d })) : [],
      cal: typeof g.cal === 'string' ? g.cal : '', created: Number(g.created) || now(), updated: Number(g.updated) || now(),
    };
  }
  let goals = get(GOALS, []).map(norm).filter(Boolean);
  let weeks = get(WEEKS, []).filter(w => w && C.validDate(w.id));
  const saveGoals = () => put(GOALS, goals);
  const saveWeeks = () => put(WEEKS, weeks);
  const touch = g => { g.updated = now(); };
  const byId = id => goals.find(g => g.id === id);
  const weekGoals = w => goals.filter(g => g.week === w);
  const reflection = w => weeks.find(x => x.id === w) || { id: w, good: '', improve: '', learned: '' };
  const visits = () => { try { const v = JSON.parse(localStorage.getItem('tdl-dudas')); return Array.isArray(v) ? v.filter(x => x && x.type === 'visit' && C.validDate(x.date)) : []; } catch { return []; } };

  const goalUrl = g => `${location.origin}/#mesa-g-${g.id}`;
  function calItem(g) {
    const lines = [];
    if (g.note) lines.push(g.note);
    if (g.subs.length) lines.push('Subtareas:\n' + g.subs.map(s => (s.d ? '☑ ' : '☐ ') + s.t).join('\n'));
    const meta = [`Prioridad ${PRIO[g.prio].toLowerCase()}`, g.tag ? 'Proyecto: ' + g.tag : ''].filter(Boolean).join(' · ');
    lines.push(meta);
    return { id: 'mesa-' + g.id, title: g.title, date: g.date, time: g.time, dur: g.dur, details: lines.join('\n\n'), url: goalUrl(g) };
  }
  const calState = g => !g.date ? 'none' : !g.cal ? 'new' : g.cal === C.signature(calItem(g)) ? 'added' : 'stale';

  // ---------- state ----------
  let week = thisWeek(), view = 'board', editing = null, formOpen = false;

  // ---------- render ----------
  const whenText = g => {
    if (!g.date) return '';
    const d = C.parseDate(g.date), i = (d.getDay() + 6) % 7;
    return `${DAYS[i]} ${d.getDate()}` + (g.time ? ' · ' + g.time : '') + (g.dur ? ' · ' + fmtDur(g.dur) : '');
  };
  function calButtons(g, compact) {
    const st = calState(g);
    if (st === 'none') return compact ? '' : '<span class="mz-cal-hint">Ponle un día para añadirlo a Calendar</span>';
    const badge = st === 'added' ? '<span class="mz-badge ok">📅 Añadido</span>'
      : st === 'stale' ? '<span class="mz-badge warn" role="note">Cambiaste este objetivo, vuelve a añadirlo a Calendar</span>' : '';
    return `<a class="mz-gcal" href="${e(C.googleUrl(calItem(g)))}" target="_blank" rel="noopener" data-act="gcal" data-id="${g.id}">📅 ${st === 'new' ? 'Añadir a Google Calendar' : 'Volver a añadir'}</a>`
      + (compact ? '' : `<button type="button" class="mz-mini" data-act="ics" data-id="${g.id}">.ics</button>`) + badge;
  }
  function card(g) {
    const si = STATUS.findIndex(s => s[0] === g.status);
    const subDone = g.subs.filter(s => s.d).length;
    return `<article class="mz-card p-${g.prio}${g.status === 'done' ? ' is-done' : ''}" id="mesa-g-${g.id}" draggable="true" data-id="${g.id}">
      <div class="mz-card-top"><span class="mz-prio">${PRIO[g.prio]}</span>${g.tag ? `<span class="mz-tag">#${e(g.tag)}</span>` : ''}${g.date ? `<span class="mz-when">${e(whenText(g))}</span>` : ''}</div>
      <label class="mz-title"><input type="checkbox" data-act="done" data-id="${g.id}" ${g.status === 'done' ? 'checked' : ''}><strong>${e(g.title)}</strong></label>
      ${g.note ? `<p class="mz-note">${e(g.note)}</p>` : ''}
      <div class="mz-subs">${g.subs.length ? `<small class="mz-subcount">${subDone}/${g.subs.length} subtareas</small>` : ''}
        ${g.subs.map(s => `<div class="mz-sub"><label><input type="checkbox" data-act="sub" data-id="${g.id}" data-sub="${s.id}" ${s.d ? 'checked' : ''}><span>${e(s.t)}</span></label><button type="button" class="mz-x" data-act="delsub" data-id="${g.id}" data-sub="${s.id}" aria-label="Borrar subtarea">×</button></div>`).join('')}
        <form class="mz-addsub" data-id="${g.id}"><input name="t" maxlength="160" placeholder="＋ Subtarea" aria-label="Nueva subtarea para ${e(g.title)}"></form></div>
      <div class="mz-calrow">${calButtons(g)}</div>
      <div class="mz-acts">
        <button type="button" class="mz-mini" data-act="move" data-dir="-1" data-id="${g.id}" ${si === 0 ? 'disabled' : ''} aria-label="Mover a ${si > 0 ? STATUS[si - 1][1] : ''}">← ${si > 0 ? STATUS[si - 1][1] : ''}</button>
        <button type="button" class="mz-mini" data-act="move" data-dir="1" data-id="${g.id}" ${si === 2 ? 'disabled' : ''} aria-label="Mover a ${si < 2 ? STATUS[si + 1][1] : ''}">${si < 2 ? STATUS[si + 1][1] : ''} →</button>
        <span class="mz-sp"></span>
        <button type="button" class="mz-mini" data-act="edit" data-id="${g.id}">Editar</button>
        <button type="button" class="mz-mini del" data-act="del" data-id="${g.id}">Borrar</button>
      </div></article>`;
  }
  function formHtml() {
    const g = editing ? byId(editing) : null;
    const w = g ? g.week : week;
    const tags = [...new Set(goals.map(x => x.tag).filter(Boolean))];
    const dayOpts = ['<option value="">Sin día</option>'].concat(DAYS_LONG.map((d, i) => { const iso = C.addDays(w, i); return `<option value="${iso}" ${g && g.date === iso ? 'selected' : ''}>${d} ${C.parseDate(iso).getDate()}</option>`; })).join('');
    return `<details class="mz-form-wrap" ${formOpen || editing || !weekGoals(week).length ? 'open' : ''}><summary>${editing ? '✎ Editando objetivo' : '＋ Nuevo objetivo para esta semana'}</summary>
      <form class="mz-form" id="mzForm">
        <input name="title" required maxlength="140" placeholder="Objetivo: p. ej. Terminar planos del escritorio" value="${e(g?.title)}" aria-label="Título del objetivo">
        <textarea name="note" maxlength="600" placeholder="Nota corta (opcional)" aria-label="Nota">${e(g?.note)}</textarea>
        <div class="mz-grid">
          <label>Prioridad<select name="prio">${Object.entries(PRIO).map(([k, v]) => `<option value="${k}" ${(g ? g.prio : 'media') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label>Proyecto o cliente<input name="tag" maxlength="40" list="mzTags" placeholder="NORVID, cliente…" value="${e(g?.tag)}"></label>
          <label>Día<select name="date">${dayOpts}</select></label>
          <label>Hora<input name="time" type="time" value="${e(g?.time)}"></label>
          <label>Duración<select name="dur">${DURS.map(([v, l]) => `<option value="${v}" ${(g ? g.dur : 0) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <datalist id="mzTags">${tags.map(t => `<option value="${e(t)}">`).join('')}</datalist>
        ${editing ? '' : '<textarea name="subs" placeholder="Subtareas (opcional), una por línea" aria-label="Subtareas"></textarea>'}
        <div class="mz-row"><button class="mz-btn" type="submit">${editing ? 'Guardar cambios' : 'Añadir objetivo'}</button>${editing ? '<button class="mz-btn ghost" type="button" data-act="cancel">Cancelar</button>' : ''}<small>La hora es opcional: sin hora se crea un evento de todo el día.</small></div>
      </form></details>`;
  }
  function boardHtml(list) {
    return `<div class="mz-board">${STATUS.map(([k, label]) => { const items = list.filter(g => g.status === k).sort((a, b) => ['alta', 'media', 'baja'].indexOf(a.prio) - ['alta', 'media', 'baja'].indexOf(b.prio) || (a.date || '9').localeCompare(b.date || '9') || (a.time || '').localeCompare(b.time || ''));
      return `<section class="mz-col c-${k}" data-col="${k}" aria-label="${label}"><h4>${label} <span>${items.length}</span></h4>${items.map(card).join('') || '<p class="mz-empty">Arrastra aquí un objetivo o usa las flechas.</p>'}</section>`; }).join('')}</div>`;
  }
  function weekHtml(list) {
    const vs = visits();
    const rows = DAYS_LONG.map((d, i) => {
      const iso = C.addDays(week, i);
      const items = list.filter(g => g.date === iso).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
      const vis = vs.filter(v => v.date === iso);
      const isToday = iso === today();
      return `<div class="mz-day${isToday ? ' today' : ''}"><div class="mz-dayname"><b>${d}</b><span>${monthFmt.format(C.parseDate(iso))}${isToday ? ' · hoy' : ''}</span></div><div class="mz-daylist">
        ${items.map(g => `<div class="mz-agenda s-${g.status}"><span class="mz-time">${g.time || 'Todo el día'}${g.dur ? `<small>${fmtDur(g.dur)}</small>` : ''}</span><div><label class="mz-title"><input type="checkbox" data-act="done" data-id="${g.id}" ${g.status === 'done' ? 'checked' : ''}><strong>${e(g.title)}</strong></label><small>${PRIO[g.prio]}${g.tag ? ' · #' + e(g.tag) : ''} · ${STATUS.find(s => s[0] === g.status)[1]}</small></div><div class="mz-calrow">${calButtons(g, true)}</div></div>`).join('')}
        ${vis.map(v => `<a class="mz-agenda visit" href="/cuaderno#visita-${e(v.id)}"><span class="mz-time">${e(v.time || 'Todo el día')}</span><div><strong>⌂ ${e(v.title)}</strong><small>Visita${v.place ? ' · ' + e(v.place) : ''} · ver preguntas ↗</small></div></a>`).join('')}
        ${!items.length && !vis.length ? '<span class="mz-free">Libre</span>' : ''}</div></div>`;
    }).join('');
    const loose = list.filter(g => !g.date);
    return `<div class="mz-week">${rows}<div class="mz-day"><div class="mz-dayname"><b>Sin día</b><span>${loose.length}</span></div><div class="mz-daylist">${loose.map(g => `<div class="mz-agenda s-${g.status}"><span class="mz-time">—</span><div><label class="mz-title"><input type="checkbox" data-act="done" data-id="${g.id}" ${g.status === 'done' ? 'checked' : ''}><strong>${e(g.title)}</strong></label><small>${PRIO[g.prio]}${g.tag ? ' · #' + e(g.tag) : ''}</small></div><button type="button" class="mz-mini" data-act="edit" data-id="${g.id}">Ponerle día</button></div>`).join('') || '<span class="mz-free">Todo tiene día ✓</span>'}</div></div></div>`;
  }
  function historyHtml() {
    const cur = thisWeek();
    const ids = [...new Set([...goals.map(g => g.week), ...weeks.filter(w => w.good || w.improve || w.learned).map(w => w.id)])].filter(w => w < cur).sort().reverse();
    if (!ids.length) return '<p class="mz-empty">Aquí aparecerán tus semanas anteriores con lo que lograste.</p>';
    return `<div class="mz-hist">${ids.map(w => { const l = weekGoals(w), d = l.filter(g => g.status === 'done'), r = reflection(w);
      return `<article><header><strong>${e(weekLabel(w))}</strong><span>${d.length} de ${l.length} logrados</span></header>
        <div class="mz-bar sm"><i style="width:${l.length ? Math.round(d.length / l.length * 100) : 0}%"></i></div>
        ${d.length ? `<ul>${d.slice(0, 6).map(g => `<li>✓ ${e(g.title)}</li>`).join('')}${d.length > 6 ? `<li>+ ${d.length - 6} más</li>` : ''}</ul>` : ''}
        ${r.learned ? `<p><b>Aprendí:</b> ${e(r.learned.slice(0, 160))}</p>` : ''}
        <button type="button" class="mz-mini" data-act="goto" data-week="${w}">Ver semana →</button></article>`; }).join('')}</div>`;
  }
  function render() {
    const list = weekGoals(week), done = list.filter(g => g.status === 'done').length;
    const pct = list.length ? Math.round(done / list.length * 100) : 0;
    const cur = thisWeek(), prev = C.addDays(week, -7);
    const prevPending = week === cur ? weekGoals(prev).filter(g => g.status !== 'done').length : 0;
    const r = reflection(week);
    const focus = document.activeElement && root.contains(document.activeElement) && document.activeElement.dataset.ref;
    root.innerHTML = `<div class="gym-block mz" style="--g:#b65a3c">
      <div class="mz-head">
        <div class="mz-nav"><button type="button" data-act="prev" aria-label="Semana anterior">‹</button><div><span class="mz-kicker">${week === cur ? 'Esta semana' : week < cur ? 'Semana pasada' : 'Semana próxima'}</span><h3>${e(weekLabel(week))}</h3></div><button type="button" data-act="next" aria-label="Semana siguiente">›</button><button type="button" class="mz-today" data-act="today" ${week === cur ? 'disabled' : ''}>Hoy</button></div>
        <div class="mz-progress"><div class="mz-bar"><i style="width:${pct}%"></i></div><span>${list.length ? `${done} de ${list.length} · ${pct}%` : 'Sin objetivos todavía'}</span></div>
      </div>
      ${prevPending ? `<div class="mz-banner">Tienes ${prevPending} pendiente${prevPending > 1 ? 's' : ''} de la semana pasada. <button type="button" class="mz-mini" data-act="pull">Traerlos a esta semana</button></div>` : ''}
      ${formHtml()}
      <div class="mz-toolbar">
        <div class="mz-views" role="tablist"><button type="button" role="tab" data-act="view" data-view="board" aria-selected="${view === 'board'}">▦ Tablero</button><button type="button" role="tab" data-act="view" data-view="week" aria-selected="${view === 'week'}">☰ Mi semana</button></div>
        <span class="mz-sp"></span>
        <button type="button" class="mz-mini" data-act="carry" ${list.some(g => g.status !== 'done') ? '' : 'disabled'}>⇢ Pasar pendientes</button>
        <button type="button" class="mz-mini" data-act="ics-week" ${list.some(g => g.date) ? '' : 'disabled'}>↓ .ics de la semana</button>
        <button type="button" class="mz-mini" data-act="copy" ${list.length ? '' : 'disabled'}>⧉ Copiar como lista</button>
      </div>
      <p class="mz-help">📅 ${e(C.help)} El archivo .ics sirve para Apple Calendar, Outlook o para importar varios objetivos a la vez en Google Calendar (Configuración → Importar).</p>
      ${view === 'board' ? boardHtml(list) : weekHtml(list)}
      <div class="mz-split">
        <section class="mz-reflect"><h4>Reflexión de la semana</h4>
          <label>Qué salió bien<textarea data-ref="good" maxlength="1200" placeholder="Terminé el modelo a tiempo…">${e(r.good)}</textarea></label>
          <label>Qué mejorar<textarea data-ref="improve" maxlength="1200" placeholder="Bloquear tiempo para dibujar…">${e(r.improve)}</textarea></label>
          <label>Qué aprendí<textarea data-ref="learned" maxlength="1200" placeholder="Un herraje nuevo, un proveedor…">${e(r.learned)}</textarea></label>
          <small class="mz-saved" id="mzSaved">Se guarda solo mientras escribes.</small></section>
        <section class="mz-history"><h4>Historial de semanas</h4>${historyHtml()}</section>
      </div></div>`;
    if (focus) { const t = root.querySelector(`[data-ref="${focus}"]`); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }
  }

  // ---------- actions ----------
  function setStatus(g, s) { if (g.status === s) return; g.status = s; touch(g); saveGoals(); render(); if (s === 'done') say('¡Objetivo logrado! ✓'); }
  function move(list, days) {
    list.forEach(g => { g.week = C.addDays(g.week, days); if (g.date) g.date = C.addDays(g.date, days); touch(g); });
    saveGoals();
  }
  function listText(list) {
    const lines = [`Objetivos · ${weekLabel(week)}`];
    const order = ['alta', 'media', 'baja'];
    list.slice().sort((a, b) => (a.status === 'done') - (b.status === 'done') || order.indexOf(a.prio) - order.indexOf(b.prio)).forEach(g => {
      const extra = [whenText(g), g.tag ? '#' + g.tag : '', g.prio === 'alta' ? 'prioridad alta' : ''].filter(Boolean).join(' · ');
      lines.push(`${g.status === 'done' ? '☑' : '☐'} ${g.title}${extra ? ` (${extra})` : ''}`);
      g.subs.forEach(s => lines.push(`   ${s.d ? '☑' : '☐'} ${s.t}`));
    });
    return lines.join('\n');
  }
  function copy(t) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(() => say('Lista copiada: pégala en Google Tasks, Keep, Notas o WhatsApp'), () => fallbackCopy(t));
    else fallbackCopy(t);
  }
  function fallbackCopy(t) { const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); say('Lista copiada'); } catch { say('No se pudo copiar'); } a.remove(); }

  root.addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
    const act = b.dataset.act, g = b.dataset.id ? byId(b.dataset.id) : null;
    if (act === 'prev' || act === 'next') { week = C.addDays(week, act === 'prev' ? -7 : 7); editing = null; render(); }
    else if (act === 'today') { week = thisWeek(); editing = null; render(); }
    else if (act === 'goto') { week = b.dataset.week; editing = null; render(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'view') { view = b.dataset.view; render(); }
    else if (act === 'move' && g) { const i = STATUS.findIndex(s => s[0] === g.status) + Number(b.dataset.dir); if (STATUS[i]) setStatus(g, STATUS[i][0]); }
    else if (act === 'edit' && g) { editing = g.id; week = g.week; render(); root.querySelector('#mzForm [name=title]')?.focus(); root.querySelector('.mz-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else if (act === 'cancel') { editing = null; render(); }
    else if (act === 'del' && g) { if (!confirm(`¿Borrar "${g.title}"?`)) return; goals = goals.filter(x => x !== g); if (editing === g.id) editing = null; saveGoals(); render(); say('Objetivo borrado'); }
    else if (act === 'delsub' && g) { g.subs = g.subs.filter(s => s.id !== b.dataset.sub); touch(g); saveGoals(); render(); }
    else if (act === 'gcal' && g) { g.cal = C.signature(calItem(g)); touch(g); saveGoals(); setTimeout(render, 50); say('Se abrió Google Calendar: pulsa Guardar para añadirlo'); }
    else if (act === 'ics' && g) { if (C.downloadIcs([calItem(g)], 'objetivo-' + g.title)) { g.cal = C.signature(calItem(g)); touch(g); saveGoals(); render(); say('Archivo .ics descargado: ábrelo para añadirlo a tu calendario'); } }
    else if (act === 'ics-week') { const list = weekGoals(week).filter(x => x.date); const n = C.downloadIcs(list.map(calItem), 'mesa-semana-' + week); if (n) { list.forEach(x => { x.cal = C.signature(calItem(x)); touch(x); }); saveGoals(); render(); say(`${n} objetivo${n > 1 ? 's' : ''} en el archivo .ics`); } }
    else if (act === 'copy') copy(listText(weekGoals(week)));
    else if (act === 'carry') {
      const pend = weekGoals(week).filter(x => x.status !== 'done'); if (!pend.length) return;
      if (!confirm(`¿Pasar ${pend.length} pendiente${pend.length > 1 ? 's' : ''} a la semana siguiente? Las fechas se mueven 7 días.`)) return;
      move(pend, 7); render(); say(`${pend.length} pendiente${pend.length > 1 ? 's' : ''} pasado${pend.length > 1 ? 's' : ''} a la semana siguiente`);
    } else if (act === 'pull') { const pend = weekGoals(C.addDays(week, -7)).filter(x => x.status !== 'done'); move(pend, 7); render(); say('Pendientes traídos a esta semana'); }
  });
  root.addEventListener('change', ev => {
    const t = ev.target, g = t.dataset.id ? byId(t.dataset.id) : null; if (!g) return;
    if (t.dataset.act === 'done') setStatus(g, t.checked ? 'done' : 'todo');
    else if (t.dataset.act === 'sub') { const s = g.subs.find(x => x.id === t.dataset.sub); if (s) { s.d = t.checked; touch(g); saveGoals(); render(); } }
  });
  root.addEventListener('toggle', ev => { if (ev.target.classList?.contains('mz-form-wrap')) formOpen = ev.target.open; }, true);
  root.addEventListener('submit', ev => {
    ev.preventDefault();
    const f = ev.target;
    if (f.classList.contains('mz-addsub')) { const g = byId(f.dataset.id), t = f.t.value.trim(); if (!g || !t) return; g.subs.push({ id: uid(), t: t.slice(0, 160), d: false }); touch(g); saveGoals(); render(); root.querySelector(`.mz-addsub[data-id="${g.id}"] input`)?.focus(); return; }
    if (f.id !== 'mzForm') return;
    const v = Object.fromEntries(new FormData(f)); const title = String(v.title || '').trim(); if (!title) return;
    const fields = { title, note: String(v.note || '').trim(), prio: v.prio, tag: String(v.tag || '').trim().replace(/^#/, ''), date: v.date || '', time: v.date ? v.time || '' : '', dur: Number(v.dur) || 0 };
    if (!v.date && v.time) say('Elige un día para usar la hora');
    if (editing) { const g = byId(editing); if (g) { Object.assign(g, fields); touch(g); } editing = null; say('Objetivo actualizado'); }
    else {
      const subs = String(v.subs || '').split('\n').map(s => s.trim()).filter(Boolean).map(t => ({ id: uid(), t: t.slice(0, 160), d: false }));
      goals.push(norm({ ...fields, id: uid(), week, status: 'todo', subs, created: now(), updated: now() }));
      formOpen = true; say(weekGoals(week).length > 7 ? 'Objetivo añadido. Consejo: de 3 a 7 objetivos por semana es más realista' : 'Objetivo añadido');
    }
    saveGoals(); render(); root.querySelector('#mzForm [name=title]')?.focus();
  });
  let refTimer = 0;
  root.addEventListener('input', ev => {
    const t = ev.target; if (!t.dataset.ref) return;
    clearTimeout(refTimer);
    refTimer = setTimeout(() => {
      let r = weeks.find(x => x.id === week); if (!r) { r = { id: week, good: '', improve: '', learned: '' }; weeks.push(r); }
      r[t.dataset.ref] = t.value.slice(0, 1200); r.updated = now(); saveWeeks();
      const s = document.getElementById('mzSaved'); if (s) s.textContent = '✓ Guardado';
    }, 500);
  });
  // Drag & drop between columns (desktop).
  let dragId = null;
  root.addEventListener('dragstart', ev => { const c = ev.target.closest?.('.mz-card'); if (!c) return; dragId = c.dataset.id; ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', dragId); } catch { /* ignore */ } c.classList.add('dragging'); });
  root.addEventListener('dragend', () => { dragId = null; root.querySelectorAll('.dragging,.over').forEach(x => x.classList.remove('dragging', 'over')); });
  root.addEventListener('dragover', ev => { const col = ev.target.closest?.('.mz-col'); if (!col || !dragId) return; ev.preventDefault(); root.querySelectorAll('.mz-col.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); });
  root.addEventListener('drop', ev => { const col = ev.target.closest?.('.mz-col'); if (!col || !dragId) return; ev.preventDefault(); const g = byId(dragId); dragId = null; if (g) setStatus(g, col.dataset.col); else render(); });

  // Deep link from a calendar event: /#mesa-g-<id>
  function openFromHash() {
    const m = /^#mesa-g-([\w-]+)$/.exec(location.hash); if (!m) return;
    const g = byId(m[1]); if (!g) return;
    week = g.week; view = 'board'; render();
    const el = document.getElementById('mesa-g-' + g.id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2400); }
  }
  window.addEventListener('hashchange', openFromHash);
  // Data restored from a backup or downloaded from the cloud.
  const reload = () => { goals = get(GOALS, []).map(norm).filter(Boolean); weeks = get(WEEKS, []).filter(w => w && C.validDate(w.id)); if (!root.contains(document.activeElement)) render(); };
  window.addEventListener('storage', ev => { if (ev.key === GOALS || ev.key === WEEKS || ev.key === 'tdl-dudas') reload(); });
  window.MesaDeTrabajo = { reload };
  render();
  openFromHash();
})();
