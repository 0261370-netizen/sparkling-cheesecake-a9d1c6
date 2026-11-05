// ✳ ¿Qué puedo crear con esto? — 5-step creative lab + concept cards (MY STUDIO).
// Concept cards live in localStorage 'tdl-concepts' (this browser), like notes and sketches.
(() => {
  'use strict';
  const KEY = 'tdl-concepts';
  const STEPS = [
    { key: 'observe', en: 'Observe', es: 'Observar', color: '#547ca2', intro: 'Mira con calma. Responde con tus palabras: no hay respuestas incorrectas.' },
    { key: 'reinterpret', en: 'Reinterpret', es: 'Reinterpretar', color: '#c98f2c', intro: 'Pasa de lo que viste a lo que aprendiste. Una o dos frases por campo bastan.' },
    { key: 'create', en: 'Create', es: 'Crear', color: '#b8674f', intro: 'Tu mini sketchbook: escribe, dibuja, sube fotos, guarda referencias y elige materiales.' },
    { key: 'develop', en: 'Develop', es: 'Desarrollar', color: '#2f6b55', intro: 'Ordena la idea en una ficha de concepto. Rellenamos lo que ya escribiste; ajústalo.' },
    { key: 'connect', en: 'Connect', es: 'Conectar', color: '#8c5a8a', intro: 'Combina esta idea con otras cosas que guardaste. Las mejores ideas nacen de mezclas improbables.' },
  ];
  const MATERIALS = ['Roble', 'Nogal', 'Contrachapado de abedul', 'MDF', 'Tablero reciclado', 'Bambú', 'Corcho', 'Ratán', 'Acero doblado', 'Tubo de acero', 'Aluminio', 'Lámina perforada', 'Vidrio', 'Acrílico', 'Bioplástico', 'Lino', 'Lana', 'Piel', 'Concreto', 'Terrazo', 'Cerámica', 'Micelio'];
  const REINTERPRET = [
    ['observed', '¿Qué observé?', 'Ej.: las escamas se superponen y se abren con la humedad.'],
    ['principle', '¿Qué principio aprendí?', 'Ej.: piezas pequeñas que se mueven juntas crean una superficie flexible.'],
    ['problem', '¿Qué problema podría resolver?', 'Ej.: ventilar un mueble de guardado sin perder privacidad.'],
    ['experiment', '¿Qué quiero experimentar?', 'Ej.: lamas de chapa que giran con un solo eje.'],
    ['constraints', '¿Qué restricciones técnicas tendría?', 'Ej.: tolerancias de corte, peso, costo de herrajes, limpieza.'],
  ];
  const DEVELOP = [
    ['name', 'Nombre del concepto', 'input'], ['problem', 'Problema', 'area'], ['user', 'Usuario', 'input'],
    ['inspiration', 'Inspiración inicial', 'area'], ['principle', 'Principio de diseño', 'area'], ['materials', 'Materiales', 'input'],
    ['process', 'Proceso de fabricación', 'area'], ['constraints', 'Restricciones', 'area'], ['nextTest', 'Próxima prueba', 'area'],
  ];

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = v => { try { const u = new URL(v, location.origin); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const isImg = v => typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(v);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  // ---------- storage ----------
  function list() { const a = get(KEY, []); return Array.isArray(a) ? a.filter(c => c && c.id).sort((a, b) => (b.updated || 0) - (a.updated || 0)) : []; }
  function writeAll(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); document.dispatchEvent(new CustomEvent('lab:change')); return true; }
    catch { return false; }
  }
  function upsert(c) { const all = list().filter(x => x.id !== c.id); all.push(c); return writeAll(all); }
  function remove(id) { writeAll(list().filter(c => c.id !== id)); }
  const find = id => list().find(c => c.id === id);
  const nameOf = c => (c.develop?.name || c.create?.name || '').trim() || 'Concepto sin nombre';
  const filled = o => o && Object.entries(o).some(([k, v]) => !k.startsWith('_') && (Array.isArray(v) ? v.some(x => String(x ?? '').trim()) : String(v ?? '').trim()));
  function progress(c) {
    return [
      c.observe?.answers?.some(a => a?.trim()),
      filled(c.reinterpret),
      c.create && (c.create.name || c.create.ideas || c.create.sketches?.length || c.create.images?.length || c.create.materials?.length || (c.create.refs || []).length > 1),
      filled(c.develop),
      c.connect && (c.connect.items?.length || c.connect.note?.trim()),
    ].filter(Boolean).length;
  }
  function blankConcept(src) {
    const s = { kind: String(src.kind || 'Recurso').slice(0, 40), title: String(src.title || '').slice(0, 220), summary: String(src.summary || '').slice(0, 900), topic: String(src.topic || '').slice(0, 80), source: String(src.source || '').slice(0, 80), url: safeUrl(src.url || '') };
    return {
      id: uid(), created: Date.now(), updated: Date.now(), source: s,
      observe: { questions: [], answers: ['', '', ''], ai: false, focus: '' },
      reinterpret: {}, create: { name: '', ideas: '', sketches: [], images: [], refs: s.url ? [{ title: s.title, url: s.url }] : [], materials: [] },
      develop: {}, connect: { items: [], note: '' },
    };
  }
  // Normalizes imported/old data so rendering never breaks.
  function normalize(c) {
    if (!c || typeof c !== 'object' || typeof c.id !== 'string') return null;
    const b = blankConcept(c.source || {});
    const out = { ...b, ...c, source: { ...b.source, ...(c.source || {}) } };
    out.source.url = safeUrl(out.source.url || '');
    out.observe = { ...b.observe, ...(c.observe || {}) };
    out.observe.questions = (Array.isArray(out.observe.questions) ? out.observe.questions : []).map(String).slice(0, 3);
    out.observe.answers = [0, 1, 2].map(i => String(out.observe.answers?.[i] ?? ''));
    out.create = { ...b.create, ...(c.create || {}) };
    out.create.sketches = (out.create.sketches || []).filter(isImg); out.create.images = (out.create.images || []).filter(isImg);
    out.create.refs = (out.create.refs || []).filter(r => r && typeof r.title === 'string').map(r => ({ title: r.title.slice(0, 160), url: safeUrl(r.url || '') }));
    out.create.materials = (out.create.materials || []).map(String).slice(0, 20);
    out.reinterpret = typeof c.reinterpret === 'object' && c.reinterpret ? c.reinterpret : {};
    out.develop = typeof c.develop === 'object' && c.develop ? c.develop : {};
    out.connect = { items: (c.connect?.items || []).filter(i => i && typeof i.label === 'string').slice(0, 12), note: String(c.connect?.note || '') };
    return out;
  }

  // ---------- dialog ----------
  const dlg = document.createElement('dialog');
  dlg.className = 'lab'; dlg.setAttribute('aria-labelledby', 'labTitle');
  if (document.body) document.body.append(dlg); else document.addEventListener('DOMContentLoaded', () => document.body.append(dlg));

  let cur = null, saved = false, step = 0, pad = null, saveTimer = null;

  function say(msg) { const s = dlg.querySelector('.lab-status'); if (s) { s.textContent = msg; s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); } }
  function save(now) {
    clearTimeout(saveTimer);
    const run = () => {
      if (!cur) return; cur.updated = Date.now();
      if (upsert(cur)) { saved = true; say('✓ Guardado en MY STUDIO'); }
      else say('⚠ No se pudo guardar: el almacenamiento del navegador está lleno. Quita alguna imagen.');
    };
    now ? run() : (saveTimer = setTimeout(run, 400));
  }
  const setPath = (path, val) => { const [a, b] = path.split('.'); cur[a] = cur[a] || {}; cur[a][b] = val; };
  const getPath = path => { const [a, b] = path.split('.'); return cur[a]?.[b] ?? ''; };
  const field = (path, label, ph = '', kind = 'area', rows = 3) => `<label class="lab-field"><span>${esc(label)}</span>${kind === 'input' ? `<input data-bind="${path}" value="${esc(getPath(path))}" placeholder="${esc(ph)}" maxlength="160">` : `<textarea data-bind="${path}" rows="${rows}" placeholder="${esc(ph)}" maxlength="2000">${esc(getPath(path))}</textarea>`}</label>`;

  function shell() {
    const s = cur.source;
    dlg.innerHTML = `<div class="lab-wrap" style="--step:${STEPS[step].color}">
      <header class="lab-head">
        <div class="lab-brand"><span class="lab-star">✳</span><div><small>Laboratorio creativo</small><h2 id="labTitle">¿Qué puedo crear con esto?</h2></div></div>
        <button class="lab-x" type="button" data-close aria-label="Cerrar">×</button>
      </header>
      <div class="lab-src"><span class="lab-kind">${esc(s.kind)}</span><strong>${esc(s.title)}</strong>${s.source ? `<small>${esc(s.source)}</small>` : ''}${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Ver original ↗</a>` : ''}</div>
      <nav class="lab-steps" aria-label="Pasos del laboratorio">${STEPS.map((st, i) => `<button type="button" data-step="${i}" style="--c:${st.color}" ${i === step ? 'aria-current="step"' : ''} class="${i < step ? 'past' : ''}"><b>${i + 1}</b><span>${st.en}<small>${st.es}</small></span></button>`).join('')}</nav>
      <main class="lab-body" tabindex="-1"></main>
      <footer class="lab-foot"><span class="lab-status" role="status" aria-live="polite">${saved ? '✓ Guardado en MY STUDIO' : 'Se guarda solo en cuanto escribas algo'}</span><div class="lab-nav">${step ? '<button type="button" class="lab-btn ghost" data-prev>← Anterior</button>' : ''}${step < 4 ? `<button type="button" class="lab-btn" data-next>Siguiente: ${STEPS[step + 1].es} →</button>` : '<button type="button" class="lab-btn" data-finish>Terminar y ver mis fichas ✓</button>'}</div></footer>
    </div>`;
    renderStep();
  }

  function renderStep() {
    const body = dlg.querySelector('.lab-body'), st = STEPS[step];
    const head = `<div class="lab-step-head"><span>${step + 1} / 5 · ${st.en.toUpperCase()}</span><h3>${st.es}</h3><p>${st.intro}</p></div>`;
    pad = null;
    if (step === 0) {
      const o = cur.observe;
      body.innerHTML = head + (o.questions.length ? `<div class="lab-qs">${o.questions.map((q, i) => `<label class="lab-q"><b>${i + 1}</b><span>${esc(q)}</span><textarea data-answer="${i}" rows="3" placeholder="Tu respuesta…" maxlength="2000">${esc(o.answers[i] || '')}</textarea></label>`).join('')}</div><p class="lab-note">${o.ai ? '✳ Preguntas creadas con IA para este recurso.' : 'Preguntas guía generales (la IA no respondió). <button type="button" class="lab-link" data-retry>Intentar de nuevo</button>'}</p>` : '<div class="lab-loading">✳ Preparando tres preguntas para este recurso…</div>');
      if (!o.questions.length) loadQuestions();
    } else if (step === 1) {
      body.innerHTML = head + `<div class="lab-grid2">${REINTERPRET.map(([k, l, p]) => field('reinterpret.' + k, l, p)).join('')}</div>`;
    } else if (step === 2) {
      const c = cur.create;
      body.innerHTML = head + `<div class="lab-create">
        <div class="lab-col">
          ${field('create.name', 'Nombre del concepto', 'Ej.: Escama, estantería que respira', 'input')}
          ${field('create.ideas', 'Ideas sueltas', 'Escribe rápido, sin filtrar: frases, preguntas, listas…', 'area', 5)}
          <div class="lab-block"><span class="lab-lbl">Materiales</span><div class="lab-chips">${[...new Set([...MATERIALS, ...c.materials])].map(m => `<button type="button" data-mat="${esc(m)}" aria-pressed="${c.materials.includes(m)}">${esc(m)}</button>`).join('')}</div><form class="lab-inline" data-addmat><input placeholder="Otro material…" maxlength="40" aria-label="Otro material"><button class="lab-btn small" type="submit">Añadir</button></form></div>
          <div class="lab-block"><span class="lab-lbl">Referencias</span><ul class="lab-refs">${c.refs.map((r, i) => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a>` : esc(r.title)}<button type="button" data-delref="${i}" aria-label="Quitar referencia">×</button></li>`).join('') || '<li class="muted">Sin referencias todavía.</li>'}</ul><form class="lab-inline" data-addref><input name="t" placeholder="Nombre de la referencia" maxlength="160" aria-label="Nombre de la referencia" required><input name="u" placeholder="Enlace (opcional)" aria-label="Enlace de la referencia"><button class="lab-btn small" type="submit">Guardar</button></form></div>
        </div>
        <div class="lab-col">
          <div class="lab-block"><span class="lab-lbl">Dibuja</span><div class="lab-pad"></div><button type="button" class="lab-btn small" data-addsketch>＋ Añadir este boceto a la ficha</button></div>
          <div class="lab-block"><span class="lab-lbl">Bocetos e imágenes de la ficha</span><div class="lab-thumbs">${[...c.sketches.map((s, i) => ['sketch', s, i]), ...c.images.map((s, i) => ['image', s, i])].map(([t, s, i]) => `<figure><img src="${esc(s)}" alt="${t === 'sketch' ? 'Boceto' : 'Imagen'} ${i + 1}"><button type="button" data-delimg="${t}:${i}" aria-label="Quitar">×</button></figure>`).join('') || '<p class="muted">Aún no hay bocetos ni imágenes.</p>'}</div>
          <label class="lab-btn small ghost lab-upload">📷 Subir mis imágenes<input type="file" accept="image/*" multiple data-upload hidden></label></div>
        </div></div>`;
      pad = Sketchpad(body.querySelector('.lab-pad'), { width: 1000, height: 750, label: 'Lienzo del laboratorio' });
    } else if (step === 3) {
      const d = cur.develop, r = cur.reinterpret, c = cur.create, s = cur.source;
      if (!d._prefilled) {
        const pre = { name: c.name, problem: r.problem, inspiration: [s.title, s.source].filter(Boolean).join(' — '), principle: r.principle, materials: c.materials.join(', '), constraints: r.constraints, nextTest: r.experiment };
        Object.entries(pre).forEach(([k, v]) => { if (!d[k] && v) d[k] = v; }); d._prefilled = true;
      }
      const pics = [...c.sketches, ...c.images];
      body.innerHTML = head + `<div class="lab-sheet"><div class="lab-sheet-top"><span>FICHA DE CONCEPTO</span><span>${esc(dateFmt.format(new Date(cur.created)))}</span></div><div class="lab-grid2">${DEVELOP.map(([k, l, t]) => field('develop.' + k, l, '', t, 3)).join('')}</div><div class="lab-block"><span class="lab-lbl">Bocetos</span>${pics.length ? `<div class="lab-thumbs">${pics.map(p => `<figure><img src="${esc(p)}" alt=""></figure>`).join('')}</div>` : '<p class="muted">Sin bocetos. <button type="button" class="lab-link" data-step="2">Dibujar en el paso 3</button></p>'}</div></div>`;
    } else {
      const opts = connectOptions(), sel = cur.connect.items;
      const isOn = o => sel.some(x => x.type === o.type && x.label === o.label);
      const groups = [['fav', 'Favoritos y recursos'], ['mood', 'Moodboards guardados'], ['note', 'Notas'], ['concept', 'Otras fichas']];
      body.innerHTML = head + `<div class="lab-chain">${['<span class="me">✳ ' + esc(nameOf(cur)) + '</span>', ...sel.map((x, i) => `<span>${esc(x.label)}<button type="button" data-unlink="${i}" aria-label="Quitar">×</button></span>`)].join('<i>+</i>')}${sel.length ? '' : '<i>+</i><span class="ghost">elige abajo 1 o 2 referencias</span>'}</div>
        <p class="lab-note">Ejemplo: una estructura vegetal + un mueble modular + un proceso de doblado metálico.</p>
        ${groups.map(([t, l]) => { const g = opts.filter(o => o.type === t); return g.length ? `<div class="lab-block"><span class="lab-lbl">${l}</span><div class="lab-chips">${g.map(o => `<button type="button" data-link="${esc(JSON.stringify(o))}" aria-pressed="${isOn(o)}">${esc(o.label)}</button>`).join('')}</div></div>` : ''; }).join('') || '<p class="muted">Todavía no tienes referencias guardadas. Guarda recursos con ♡ o moodboards, o escribe la conexión abajo.</p>'}
        <form class="lab-inline" data-addlink><input placeholder="Otra referencia: p. ej. doblado de lámina, andamio, hoja de loto…" maxlength="120" aria-label="Otra referencia"><button class="lab-btn small" type="submit">Conectar</button></form>
        ${field('connect.note', '¿Qué surge al combinarlas?', 'Escribe la idea híbrida y qué tendrías que probar para saber si funciona (cargas, materiales, procesos, costos).', 'area', 4)}`;
    }
  }

  function connectOptions() {
    const out = [];
    const R = typeof RESOURCES !== 'undefined' ? RESOURCES : [];
    const M = typeof MOOD_CATALOG !== 'undefined' ? MOOD_CATALOG : [];
    (get('tdl-fav', []) || []).forEach(u => { const r = R.find(x => x.url === u); let label = r?.title; if (!label) { try { const p = new URL(u); label = p.hostname.replace(/^www\./, '') + p.pathname.replace(/\/$/, ''); } catch { label = String(u); } } out.push({ type: 'fav', label: String(label).slice(0, 90), url: safeUrl(u) }); });
    (get('tdl-custom', []) || []).forEach(r => { if (r?.title && !out.some(o => o.url === r.url)) out.push({ type: 'fav', label: r.title.slice(0, 90), url: safeUrl(r.url) }); });
    (get('tdl-mood', []) || []).forEach(id => { const m = M.find(x => x.id === id); out.push({ type: 'mood', label: m ? `${m.title}` : `Moodboard ${id}` }); });
    (get('tdl-ideas', []) || []).slice(-12).forEach(n => { if (n?.text) out.push({ type: 'note', label: (n.title || n.text).slice(0, 70) }); });
    list().filter(c => c.id !== cur.id).forEach(c => out.push({ type: 'concept', label: nameOf(c) }));
    return out;
  }

  async function loadQuestions(force) {
    const id = cur.id, s = cur.source;
    try {
      const r = await fetch('/api/observe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: s.kind, title: s.title, summary: s.summary, topic: s.topic, source: s.source, url: s.url, force: !!force }), signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw Error();
      const d = await r.json();
      if (!cur || cur.id !== id) return;
      cur.observe.questions = d.questions.slice(0, 3); cur.observe.ai = !!d.ai; cur.observe.focus = d.focus || '';
    } catch {
      if (!cur || cur.id !== id) return;
      cur.observe.questions = ['¿Qué problema concreto resuelve este caso y para quién?', '¿Qué principio de forma, estructura o material lo hace funcionar?', '¿Cómo lo traducirías a una unión, superficie o sistema de mobiliario?'];
      cur.observe.ai = false;
    }
    if (saved) save(true);
    if (step === 0 && dlg.open) renderStep();
  }

  function compress(file, max = 900) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', .72)); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  }
  function keepSketch() {
    if (!pad || !pad.isDirty()) return false;
    if (cur.create.sketches.length >= 6) { say('Máximo 6 bocetos por ficha.'); return false; }
    cur.create.sketches.push(pad.snapshot(640, 480, .7)); pad.clear(); save(true); return true;
  }
  function go(i) {
    if (i === step) return;
    if (step === 2 && keepSketch()) say('✓ Tu boceto se añadió a la ficha');
    step = Math.max(0, Math.min(4, i)); shell(); dlg.querySelector('.lab-body').focus({ preventScroll: true }); dlg.querySelector('.lab-wrap').scrollTop = 0;
  }

  // ---------- events ----------
  dlg.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.bind) { setPath(t.dataset.bind, t.value); save(); }
    else if (t.dataset.answer) { cur.observe.answers[+t.dataset.answer] = t.value; save(); }
  });
  dlg.addEventListener('change', async e => {
    if (!e.target.matches('[data-upload]')) return;
    const files = [...e.target.files].slice(0, 6 - cur.create.images.length);
    if (!files.length) { say('Máximo 6 imágenes por ficha.'); return; }
    say('Preparando imágenes…');
    for (const f of files) { try { cur.create.images.push(await compress(f)); } catch { say('Una imagen no se pudo leer.'); } }
    save(true); renderStep();
  });
  dlg.addEventListener('submit', e => {
    e.preventDefault(); const f = e.target;
    if (f.matches('[data-addmat]')) { const v = f.querySelector('input').value.trim(); if (v && !cur.create.materials.includes(v)) cur.create.materials.push(v.slice(0, 40)); save(); renderStep(); }
    if (f.matches('[data-addref]')) { const t = f.t.value.trim(), raw = f.u.value.trim(), u = raw ? safeUrl(/^https?:/i.test(raw) ? raw : 'https://' + raw) : ''; if (raw && !u) { say('El enlace no es válido'); return; } if (t) cur.create.refs.push({ title: t.slice(0, 160), url: u }); save(); renderStep(); }
    if (f.matches('[data-addlink]')) { const v = f.querySelector('input').value.trim(); if (v) cur.connect.items.push({ type: 'custom', label: v.slice(0, 120) }); save(); renderStep(); }
  });
  dlg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) { if (e.target === dlg) close(); return; }
    if (b.matches('[data-close]')) return close();
    if (b.dataset.step != null) return go(+b.dataset.step);
    if (b.matches('[data-next]')) return go(step + 1);
    if (b.matches('[data-prev]')) return go(step - 1);
    if (b.matches('[data-finish]')) { keepSketch(); save(true); close(); if (!location.pathname.startsWith('/cuaderno')) location.href = '/cuaderno#fichas'; else document.getElementById('tabConcepts')?.click(); return; }
    if (b.matches('[data-retry]')) { cur.observe.questions = []; renderStep(); return; }
    if (b.dataset.mat) { const m = b.dataset.mat, a = cur.create.materials; cur.create.materials = a.includes(m) ? a.filter(x => x !== m) : [...a, m]; b.setAttribute('aria-pressed', String(cur.create.materials.includes(m))); save(); return; }
    if (b.dataset.delref) { cur.create.refs.splice(+b.dataset.delref, 1); save(); renderStep(); return; }
    if (b.dataset.delimg) { const [t, i] = b.dataset.delimg.split(':'); cur.create[t === 'sketch' ? 'sketches' : 'images'].splice(+i, 1); save(true); renderStep(); return; }
    if (b.matches('[data-addsketch]')) { if (keepSketch()) { say('✓ Boceto añadido a la ficha'); renderStep(); } else if (!pad?.isDirty()) say('Dibuja algo primero en el lienzo'); return; }
    if (b.dataset.link) { const o = JSON.parse(b.dataset.link), a = cur.connect.items, i = a.findIndex(x => x.type === o.type && x.label === o.label); i >= 0 ? a.splice(i, 1) : a.push(o); save(); renderStep(); return; }
    if (b.dataset.unlink) { cur.connect.items.splice(+b.dataset.unlink, 1); save(); renderStep(); return; }
    if (b.matches('[data-edit-current]')) { const id = cur.id; edit(id); return; }
    if (b.matches('[data-pdf-current]')) { pdf(cur.id); return; }
  });
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });

  function show() { if (!dlg.isConnected) document.body.append(dlg); if (!dlg.open) dlg.showModal(); document.documentElement.classList.add('lab-open'); }
  function close() {
    if (cur && step === 2) keepSketch();
    clearTimeout(saveTimer); if (cur && saved) { cur.updated = Date.now(); upsert(cur); }
    if (dlg.open) dlg.close(); document.documentElement.classList.remove('lab-open'); cur = null; pad = null;
  }

  function open(src) {
    if (!src || !src.title) return;
    cur = blankConcept(src); saved = false; step = 0; show(); shell();
    const prev = list().filter(c => c.source.title === cur.source.title && c.source.url === cur.source.url);
    if (prev.length) say(`Ya tienes ${prev.length} ficha${prev.length > 1 ? 's' : ''} de este recurso en MY STUDIO. Esta será una nueva.`);
  }
  function edit(id, at = 0) { const c = normalize(find(id)); if (!c) return; cur = c; saved = true; step = at; show(); shell(); }

  function sheetHTML(c) {
    const d = c.develop || {}, pics = [...(c.create?.sketches || []), ...(c.create?.images || [])];
    const row = (l, v) => String(v ?? '').trim() ? `<div class="lab-pv-row"><span>${esc(l)}</span><p>${esc(v)}</p></div>` : '';
    return `<div class="lab-pv-sheet">
      <div class="lab-sheet-top"><span>FICHA DE CONCEPTO · ${esc(c.source.kind)}</span><span>${esc(dateFmt.format(new Date(c.updated || c.created)))}</span></div>
      <h2>${esc(nameOf(c))}</h2>
      ${DEVELOP.slice(1).map(([k, l]) => row(l, d[k])).join('') || '<p class="muted">La ficha aún está vacía: edítala para completar el paso 4.</p>'}
      ${pics.length ? `<div class="lab-pv-row"><span>Bocetos</span><div class="lab-thumbs">${pics.map(p => `<figure><img src="${esc(p)}" alt=""></figure>`).join('')}</div></div>` : ''}
      ${c.observe?.questions?.length && c.observe.answers.some(a => a.trim()) ? `<div class="lab-pv-row"><span>Observación</span>${c.observe.questions.map((q, i) => c.observe.answers[i]?.trim() ? `<p><b>${esc(q)}</b><br>${esc(c.observe.answers[i])}</p>` : '').join('')}</div>` : ''}
      ${c.create?.refs?.length ? `<div class="lab-pv-row"><span>Referencias</span><p>${c.create.refs.map(r => r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a>` : esc(r.title)).join('<br>')}</p></div>` : ''}
      ${c.connect?.items?.length || c.connect?.note ? `<div class="lab-pv-row"><span>Conexiones</span><p>${c.connect.items.map(i => esc(i.label)).join(' + ')}${c.connect.note ? '<br>' + esc(c.connect.note) : ''}</p></div>` : ''}
    </div>`;
  }
  function preview(id) {
    const c = normalize(find(id)); if (!c) return;
    cur = c; saved = true; step = 3; show();
    dlg.innerHTML = `<div class="lab-wrap" style="--step:#2f6b55"><header class="lab-head"><div class="lab-brand"><span class="lab-star">✳</span><div><small>MY STUDIO · Ficha de concepto</small><h2 id="labTitle">${esc(nameOf(c))}</h2></div></div><button class="lab-x" type="button" data-close aria-label="Cerrar">×</button></header><main class="lab-body">${sheetHTML(c)}</main><footer class="lab-foot"><span class="lab-status">Inspirada en: ${esc(c.source.title)}</span><div class="lab-nav"><button class="lab-btn ghost" type="button" data-pdf-current>Descargar PDF ↓</button><button class="lab-btn" type="button" data-edit-current>Editar ficha ✎</button></div></footer></div>`;
  }

  // ---------- PDF ----------
  let jspdf = null;
  const loadPDF = () => jspdf || (jspdf = new Promise((res, rej) => { if (window.jspdf) return res(window.jspdf); const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'; s.onload = () => window.jspdf ? res(window.jspdf) : rej(); s.onerror = () => { jspdf = null; rej(); }; document.head.append(s); }));
  const latin = v => String(v ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
  async function pdf(id) {
    const c = normalize(find(id)); if (!c) return;
    let lib; try { lib = await loadPDF(); } catch { return printFallback(c); }
    const doc = new lib.jsPDF({ unit: 'mm', format: 'a4' }), W = 210, M = 16, CW = W - M * 2; let y = M;
    const ensure = h => { if (y + h > 297 - M) { doc.addPage(); y = M; } };
    doc.setFillColor(184, 103, 79); doc.rect(0, 0, W, 6, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 118, 110);
    doc.text(latin(`FICHA DE CONCEPTO  ·  ${c.source.kind.toUpperCase()}  ·  ${dateFmt.format(new Date(c.updated || c.created))}`), M, y + 6); y += 14;
    doc.setFont('times', 'normal'); doc.setFontSize(28); doc.setTextColor(25, 59, 50);
    const title = doc.splitTextToSize(latin(nameOf(c)), CW); doc.text(title, M, y + 4); y += title.length * 11 + 2;
    doc.setDrawColor(25, 59, 50); doc.line(M, y, W - M, y); y += 7;
    const block = (label, text) => {
      text = latin(text).trim(); if (!text) return;
      const lines = doc.setFont('helvetica', 'normal').setFontSize(10.5).splitTextToSize(text, CW);
      ensure(10 + Math.min(lines.length, 3) * 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(184, 103, 79); doc.text(latin(label.toUpperCase()), M, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(30, 40, 35);
      lines.forEach(l => { ensure(5); doc.text(l, M, y); y += 5; }); y += 4;
    };
    const d = c.develop || {};
    DEVELOP.slice(1).forEach(([k, l]) => block(l, d[k]));
    if (c.observe.answers.some(a => a.trim())) block('Observación', c.observe.questions.map((q, i) => c.observe.answers[i]?.trim() ? `${q}\n${c.observe.answers[i]}` : '').filter(Boolean).join('\n\n'));
    if (c.create.refs.length) block('Referencias', c.create.refs.map(r => r.url ? `${r.title} - ${r.url}` : r.title).join('\n'));
    if (c.connect.items.length || c.connect.note) block('Conexiones', [c.connect.items.map(i => i.label).join(' + '), c.connect.note].filter(Boolean).join('\n'));
    const pics = [...c.create.sketches, ...c.create.images];
    if (pics.length) {
      ensure(12); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(184, 103, 79); doc.text('BOCETOS E IMÁGENES', M, y); y += 4;
      const cw = (CW - 6) / 2;
      for (let i = 0; i < pics.length; i += 2) {
        const dims = await Promise.all(pics.slice(i, i + 2).map(p => new Promise(r => { const im = new Image(); im.onload = () => r([im.width, im.height]); im.onerror = () => r([4, 3]); im.src = p; })));
        const h = Math.max(...dims.map(([w, hh]) => cw * hh / w)); ensure(h + 4);
        dims.forEach(([w, hh], j) => { try { doc.addImage(pics[i + j], 'JPEG', M + j * (cw + 6), y, cw, cw * hh / w); } catch { } });
        y += h + 6;
      }
    }
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) { doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(140, 140, 130); doc.text(latin(`The Design Library · Atelier NORVID · Inspiración: ${c.source.title}`).slice(0, 120), M, 290); doc.text(`${p}/${pages}`, W - M, 290, { align: 'right' }); }
    doc.save((nameOf(c).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'ficha') + '.pdf');
  }
  function printFallback(c) {
    const w = window.open('', '_blank'); if (!w) { alert('Permite las ventanas emergentes para descargar el PDF.'); return; }
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(nameOf(c))}</title><link rel="stylesheet" href="/lab.css"><style>body{margin:24px;font-family:Arial,sans-serif}</style></head><body>${sheetHTML(c)}<script>setTimeout(()=>print(),400)<\/script></body></html>`); w.document.close();
  }

  // Any element with data-lab='{"title":...}' opens the lab.
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lab]'); if (!b || dlg.contains(b)) return;
    e.preventDefault(); try { open(JSON.parse(b.dataset.lab)); } catch { }
  });

  window.Lab = { open, edit, preview, pdf, remove, list: () => list().map(normalize).filter(Boolean), nameOf, progress, normalize, KEY };
  window.labButton = (src, cls = '') => `<button type="button" class="lab-trigger ${cls}" data-lab="${esc(JSON.stringify(src))}">✳ ¿Qué puedo crear con esto?</button>`;
})();
