// MOODBOARD LAB — free concept → three creative directions → board of real Pexels references.
// Searches run only on button presses (via /api/moodlab). Saved boards live in this browser
// under 'tdl-moodlab' (concept, pinned references, challenges and notes).
(() => {
  'use strict';
  const root = document.getElementById('moodlabRoot');
  if (!root) return;

  const STORE = 'tdl-moodlab', SEEN = 'tdl-moodlab-seen';
  const PER_ROUTE = 4;
  const EXAMPLE = 'Un puente de escritorio hecho con sobrante de tablero, donde pueda guardar el teclado y apoyar el iPad';
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const say = m => (typeof toast === 'function' ? toast(m) : null);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const safeUrl = u => (/^https:\/\/[^\s"'<>]+$/.test(String(u || '')) ? u : '#');
  const PROV = { pexels: ['Pexels', 'https://www.pexels.com'], openverse: ['Openverse', 'https://openverse.org'] };
  const ROMAN = ['I', 'II', 'III'];

  const load = () => { try { const v = JSON.parse(localStorage.getItem(STORE)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const persist = v => { try { localStorage.setItem(STORE, JSON.stringify(v)); return true; } catch { say('No se pudo guardar: el almacenamiento del navegador está lleno'); return false; } };
  const seen = new Set((() => { try { return JSON.parse(sessionStorage.getItem(SEEN)) || []; } catch { return []; } })());
  const markSeen = refs => { refs.forEach(r => seen.add(r.id)); try { sessionStorage.setItem(SEEN, JSON.stringify([...seen].slice(-400))); } catch { /* ignore */ } };

  // board state
  let S = null;            // { id, concept, directions:[{key,angle,name,explores,question,queries,refs,note}], pins:Set, challenges:{}, notes, flags }
  let filter = 'all';
  let busy = false;

  // ---------- API ----------
  async function api(payload) {
    let res;
    try {
      res = await fetch('/api/moodlab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch { throw { code: 'network', error: 'Sin conexión con el servidor. Revisa tu red e inténtalo de nuevo.' }; }
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) throw data && data.error ? data : { code: res.status === 404 ? 'missing_fn' : 'error', error: res.status === 404 ? 'La función /api/moodlab no está disponible en este entorno.' : 'Algo falló en el servidor.' };
    return data;
  }

  function errorBox(err) {
    if (!err) return '';
    if (err.code === 'config') {
      const miss = (err.missing || []).map(m => `<code>${e(m)}</code>`).join(', ');
      return `<div class="ml-msg cfg" role="alert"><strong>Falta configurar Moodboard Lab</strong>${e(err.error)} Falta: ${miss || 'credenciales del servidor'}.
        <ol>${(err.missing || []).includes('PEXELS_API_KEY') ? `<li>Crea una clave gratuita en <a href="https://www.pexels.com/api/" target="_blank" rel="noopener">pexels.com/api</a> y añádela como <code>PEXELS_API_KEY</code> en <em>Project configuration → Environment variables</em>.</li>` : ''}
        <li>El modelo de texto usa Netlify AI Gateway: comprueba que AI Gateway esté activo en el proyecto.</li></ol></div>`;
    }
    const title = err.code === 'rate_limited' || err.code === 'provider_budget' ? 'Vas muy rápido' : err.code === 'network' ? 'Sin conexión' : 'No se pudo completar la búsqueda';
    return `<div class="ml-msg err" role="alert"><strong>${title}</strong>${e(err.error || 'Error desconocido.')}</div>`;
  }

  // ---------- render ----------
  function shell() {
    root.innerHTML = `<div class="ml">
      <form class="ml-ask" id="mlForm" novalidate>
        <div class="eyebrow">✎ Brief libre · en tus palabras</div>
        <label for="mlConcept">¿Qué estás <em>imaginando?</em></label>
        <textarea id="mlConcept" maxlength="400" placeholder="Ej.: ${e(EXAMPLE)}"></textarea>
        <div class="ml-ask-row">
          <button class="ml-go" id="mlGo" type="submit">Buscar inspiración <span aria-hidden="true">→</span></button>
          <button class="ml-link" type="button" id="mlExample">Usar el ejemplo</button>
          <small>Tres direcciones (función, construcción y una analogía inesperada) con hasta 12 fotos reales, enlazadas a su fuente y con su crédito.</small>
        </div>
      </form>
      <div id="mlStatus" aria-live="polite"></div>
      <div id="mlBoard"></div>
      <section class="ml-saved" aria-labelledby="mlSavedTitle"><h3 id="mlSavedTitle">Moodboards guardados</h3><div id="mlSaved"></div></section>
    </div>`;
  }

  const route = key => S && S.directions.find(d => d.key === key);

  function card(d, r) {
    const pinned = S.pins.has(r.id);
    const ch = S.challenges[r.id];
    const ratio = r.width && r.height ? `${r.width} / ${r.height}` : '4 / 5';
    const src2 = r.image || r.thumb;
    return `<figure class="ml-card${pinned ? ' pinned' : ''}" data-id="${e(r.id)}" style="--c:${e(r.color || '#e8e0d2')}">
      ${r.kind ? `<span class="ml-kind">${e(r.kind)}</span>` : ''}
      <a class="ml-img" href="${e(safeUrl(r.page))}" target="_blank" rel="noopener" style="aspect-ratio:${ratio}" aria-label="Abrir la página original">
        <img src="${e(r.thumb)}" srcset="${e(r.thumb)} 480w, ${e(src2)} 900w" sizes="(max-width:590px) 50vw, 25vw" loading="lazy" decoding="async" alt="${e(r.alt || 'Referencia de ' + d.name)}"></a>
      <figcaption>
        ${r.why ? `<p class="ml-why">${e(r.why)}</p>` : ''}
        <span class="ml-credit">${r.credit ? `Foto: ${r.creditUrl ? `<a href="${e(safeUrl(r.creditUrl))}" target="_blank" rel="noopener">${e(r.credit)}</a>` : e(r.credit)} · ` : ''}${r.provider === 'openverse' ? `${r.license ? (r.licenseUrl ? `<a href="${e(safeUrl(r.licenseUrl))}" target="_blank" rel="noopener">${e(r.license)}</a>` : e(r.license)) + ' · ' : ''}vía <a href="https://openverse.org" target="_blank" rel="noopener">Openverse</a>${r.source ? ' / ' + e(r.source) : ''}` : `<a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>`}</span>
        <div class="ml-actions">
          <button class="ml-btn ml-pin" type="button" data-pin="${e(r.id)}" aria-pressed="${pinned}">${pinned ? '✓ Fijada' : '📌 Fijar'}</button>
          <a class="ml-orig" href="${e(safeUrl(r.page))}" target="_blank" rel="noopener">Ver original ↗</a>
        </div>
        ${ch ? `<p class="ml-challenge"><small>Reto de boceto</small>${e(ch)}</p>` : `<button class="lab-trigger" type="button" data-ch="${e(r.id)}">✳ ¿Qué puedo crear con esto?</button>`}
      </figcaption>
    </figure>`;
  }

  function board() {
    const host = document.getElementById('mlBoard');
    if (!S) { host.innerHTML = ''; return; }
    const total = S.directions.reduce((n, d) => n + d.refs.length, 0);
    const notes = [];
    if (S.flags?.partial) notes.push('Algunas búsquedas no respondieron; mostramos resultados parciales.');
    if (S.flags?.curated === false) notes.push('La selección automática no estuvo disponible: las fotos se muestran por orden de búsqueda y pueden ser menos precisas.');
    if (S.flags?.provider === 'openverse') notes.push('Modo sin clave: PEXELS_API_KEY no está configurada, así que las fotos vienen de Openverse (imágenes reales con licencia Creative Commons; cupo gratuito reducido y relevancia algo menor). Configura la clave para usar Pexels.');
    if (S.flags?.reopened) notes.push('Moodboard reabierto: se muestran tus referencias fijadas. Usa “Buscar otras” para completar cada ruta.');
    const chips = [['all', 'Todas', ''], ...S.directions.map((d, i) => [d.key, `${ROMAN[i]} · ${d.angle || d.name}`, d.key])];
    host.innerHTML = `<div class="ml-board">
      <p class="ml-concept"><span>Concepto</span>“${e(S.concept)}”</p>
      ${notes.map(n => `<div class="ml-note">${e(n)}</div>`).join(' ')}
      ${!total && !S.flags?.reopened ? `<div class="ml-msg"><strong>Sin referencias pertinentes</strong>No encontramos fotos que encajen con estas direcciones. Prueba a describir el objeto, el material o el uso con otras palabras, o pulsa “Buscar otras” en una ruta.</div>` : ''}
      <div class="ml-toolbar">
        <div class="ml-chips" role="group" aria-label="Filtrar por ruta">${chips.map(([k, l, rk]) => `<button type="button" class="ml-chip" data-filter="${e(k)}" aria-pressed="${filter === k}" style="${rk ? `--rc:var(--r-${e(rk)},#1d2b25)` : ''}">${rk ? '<i></i>' : ''}${e(l)}</button>`).join('')}</div>
        <button type="button" class="ml-btn dark" id="mlSave">♡ Guardar moodboard${S.pins.size ? ` (${S.pins.size} fijadas)` : ''}</button>
      </div>
      ${S.directions.map((d, i) => `<section class="ml-route" data-key="${e(d.key)}" ${filter !== 'all' && filter !== d.key ? 'hidden' : ''} aria-labelledby="ml-r-${i}">
        <header class="ml-route-head"><b>${ROMAN[i]}</b>
          <div><span class="ml-angle">${e(d.angle || 'Ruta ' + (i + 1))}</span><h3 id="ml-r-${i}">${e(d.name)}</h3><p>${e(d.explores)}</p>${d.question ? `<p class="ml-q">${e(d.question)}</p>` : ''}</div>
          <button type="button" class="ml-btn" data-more="${e(d.key)}" ${busy ? 'disabled' : ''}>${d.loading ? 'Buscando…' : '↻ Buscar otras'}</button>
        </header>
        ${d.note ? `<div class="ml-note">${e(d.note)}</div>` : ''}
        ${d.refs.length ? `<div class="ml-grid">${d.refs.map(r => card(d, r)).join('')}</div>` : `<p class="ml-empty">${S.flags?.reopened ? 'Sin referencias fijadas en esta ruta.' : 'Sin referencias pertinentes para esta ruta.'}</p>`}
      </section>`).join('')}
      <div class="ml-notes"><label for="mlNotes">Mis notas para bocetar</label><textarea id="mlNotes" placeholder="Qué me llevo de cada ruta, medidas, dudas, próximos bocetos…">${e(S.notes)}</textarea></div>
      <div class="ml-foot"><span>${[...new Set(S.directions.flatMap(d => d.refs.map(r => r.provider || 'pexels')))].concat(S.flags?.provider ? [S.flags.provider] : []).filter((v, i, a) => a.indexOf(v) === i).map(p => `Fotos ${p === 'openverse' ? 'encontradas con' : 'proporcionadas por'} <a href="${PROV[p]?.[1] || '#'}" target="_blank" rel="noopener">${PROV[p]?.[0] || p}</a>`).join(' · ') || 'Fotos de la API de imágenes'} · cada imagen enlaza a su página original y su autor.</span><span>Direcciones y retos: modelo de texto vía Netlify AI Gateway.</span></div>
    </div>`;
  }

  function saved() {
    const list = load().sort((a, b) => (b.updated || 0) - (a.updated || 0));
    const host = document.getElementById('mlSaved');
    host.innerHTML = list.length ? `<div class="ml-saved-list">${list.map(b => `<article class="ml-saved-item">
        <div class="ml-thumbs">${(b.pins || []).slice(0, 4).map(p => `<span style="background-image:url('${e(p.thumb)}')"></span>`).join('')}</div>
        <strong>${e(b.concept.length > 90 ? b.concept.slice(0, 88) + '…' : b.concept)}</strong>
        <small>${(b.pins || []).length} fijadas · ${new Date(b.updated).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
        <div><button type="button" class="ml-btn dark" data-open="${e(b.id)}">Reabrir</button><button type="button" class="ml-btn" data-del="${e(b.id)}">Borrar</button></div>
      </article>`).join('')}</div>` : '<p class="ml-empty">Aún no guardas ningún moodboard. Fija referencias, escribe tus notas y pulsa “Guardar moodboard”. Se guardan solo en este navegador.</p>';
  }

  function loading(msg) {
    document.getElementById('mlStatus').innerHTML = `<div class="ml-loading"><i></i>${e(msg)}</div>
      <div class="ml-skel" aria-hidden="true">${[260, 180, 320, 220, 200, 290, 170, 240].map(h => `<span style="height:${h}px"></span>`).join('')}</div>`;
  }
  const status = html => { document.getElementById('mlStatus').innerHTML = html || ''; };

  // ---------- actions ----------
  async function runSearch() {
    if (busy) return;
    const ta = document.getElementById('mlConcept');
    const concept = ta.value.trim();
    if (concept.length < 4) { status('<div class="ml-msg">Escribe tu idea con un poco más de detalle (un objeto, un uso, un material…).</div>'); ta.focus(); return; }
    busy = true; document.getElementById('mlGo').disabled = true;
    loading('Proponiendo tres direcciones y buscando referencias reales…');
    try {
      const data = await api({ action: 'search', concept });
      S = { id: null, concept, notes: '', pins: new Set(), challenges: {}, flags: { partial: data.partial, curated: data.curated, provider: data.provider },
        directions: data.directions.map(d => ({ ...d, refs: d.refs || [] })) };
      S.directions.forEach(d => { d.note = d.refs.length && d.refs.length < PER_ROUTE ? `Solo encontramos ${d.refs.length} referencia${d.refs.length === 1 ? '' : 's'} pertinente${d.refs.length === 1 ? '' : 's'} para esta ruta.` : ''; markSeen(d.refs); });
      filter = 'all'; status(''); board();
      document.getElementById('mlBoard').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } catch (err) { status(errorBox(err)); }
    finally { busy = false; document.getElementById('mlGo').disabled = false; }
  }

  async function runMore(key) {
    const d = route(key);
    if (!d || busy) return;
    const pinned = d.refs.filter(r => S.pins.has(r.id));
    const need = PER_ROUTE - pinned.length;
    if (need <= 0) { say('Todas las referencias de esta ruta están fijadas'); return; }
    busy = true; d.loading = true; board();
    try {
      const exclude = [...new Set([...seen, ...S.directions.flatMap(x => x.refs.map(r => r.id))])];
      const data = await api({ action: 'more', concept: S.concept, direction: { key: d.key, angle: d.angle, name: d.name, explores: d.explores, question: d.question, queries: d.queries }, exclude, need });
      const fresh = (data.refs || []).filter(r => !exclude.includes(r.id)).slice(0, need);
      markSeen(fresh);
      if (Array.isArray(data.queries) && data.queries.length) d.queries = data.queries.slice(-4);
      // Pinned stay put; unpinned slots are replaced by the new ones (old unpinned kept only if not enough new).
      const unpinned = d.refs.filter(r => !S.pins.has(r.id));
      const keep = unpinned.slice(0, Math.max(0, need - fresh.length));
      d.refs = [...pinned, ...fresh, ...keep].slice(0, PER_ROUTE);
      d.note = !fresh.length ? 'No quedan referencias nuevas y pertinentes para esta ruta; mantenemos las actuales.' : fresh.length < need ? `Solo encontramos ${fresh.length} referencia${fresh.length === 1 ? '' : 's'} nueva${fresh.length === 1 ? '' : 's'} pertinente${fresh.length === 1 ? '' : 's'}.` : '';
      if (data.partial) S.flags.partial = true;
      if (data.curated === false) S.flags.curated = false;
      if (data.provider) S.flags.provider = data.provider;
    } catch (err) { d.note = ''; status(errorBox(err)); }
    finally { busy = false; d.loading = false; board(); }
  }

  async function runChallenge(id, btn) {
    const d = S.directions.find(x => x.refs.some(r => r.id === id));
    const r = d && d.refs.find(x => x.id === id);
    if (!r) return;
    btn.disabled = true; btn.textContent = 'Pensando un reto…';
    try {
      const data = await api({ action: 'challenge', concept: S.concept, direction: { name: d.name, explores: d.explores }, ref: { alt: r.alt, query: r.query, credit: r.credit } });
      S.challenges[id] = data.challenge;
      const fig = btn.closest('.ml-card');
      btn.outerHTML = `<p class="ml-challenge"><small>Reto de boceto</small>${e(data.challenge)}</p>`;
      if (fig) fig.querySelector('.ml-challenge')?.scrollIntoView({ block: 'nearest' });
    } catch (err) {
      btn.disabled = false; btn.textContent = '✳ ¿Qué puedo crear con esto?';
      say(err.code === 'config' ? 'Falta configurar el servidor de Moodboard Lab' : err.error || 'No se pudo escribir el reto');
    }
  }

  function save() {
    if (!S) return;
    const list = load();
    const pins = S.directions.flatMap(d => d.refs.filter(r => S.pins.has(r.id)).map(r => ({ ...r, route: d.key, challenge: S.challenges[r.id] || '' })));
    if (!pins.length && !S.notes.trim()) { say('Fija al menos una referencia o escribe una nota antes de guardar'); return; }
    const rec = { id: S.id || uid(), concept: S.concept, notes: S.notes, updated: Date.now(),
      directions: S.directions.map(({ key, angle, name, explores, question, queries }) => ({ key, angle, name, explores, question, queries })), pins };
    const i = list.findIndex(b => b.id === rec.id);
    if (i >= 0) list[i] = rec; else list.push(rec);
    if (persist(list)) { S.id = rec.id; saved(); say(i >= 0 ? 'Moodboard actualizado' : 'Moodboard guardado en este navegador'); }
  }

  function open(id) {
    const b = load().find(x => x.id === id);
    if (!b) return;
    S = { id: b.id, concept: b.concept, notes: b.notes || '', pins: new Set((b.pins || []).map(p => p.id)), flags: { reopened: true },
      challenges: Object.fromEntries((b.pins || []).filter(p => p.challenge).map(p => [p.id, p.challenge])),
      directions: (b.directions || []).map(d => ({ ...d, refs: (b.pins || []).filter(p => p.route === d.key), note: '' })) };
    markSeen(b.pins || []);
    document.getElementById('mlConcept').value = b.concept;
    filter = 'all'; status(''); board();
    document.getElementById('mlBoard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- events ----------
  shell(); saved();
  root.addEventListener('submit', ev => { ev.preventDefault(); runSearch(); });
  root.addEventListener('keydown', ev => { if (ev.target.id === 'mlConcept' && ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); runSearch(); } });
  root.addEventListener('input', ev => { if (ev.target.id === 'mlNotes' && S) S.notes = ev.target.value.slice(0, 4000); });
  root.addEventListener('click', ev => {
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.id === 'mlExample') { const ta = document.getElementById('mlConcept'); ta.value = EXAMPLE; ta.focus(); return; }
    if (t.id === 'mlSave') return save();
    if (t.dataset.filter) { filter = t.dataset.filter; board(); return; }
    if (t.dataset.more) return runMore(t.dataset.more);
    if (t.dataset.ch) return runChallenge(t.dataset.ch, t);
    if (t.dataset.pin) {
      const id = t.dataset.pin;
      if (S.pins.has(id)) S.pins.delete(id); else S.pins.add(id);
      const on = S.pins.has(id);
      t.setAttribute('aria-pressed', on); t.textContent = on ? '✓ Fijada' : '📌 Fijar';
      t.closest('.ml-card')?.classList.toggle('pinned', on);
      const sb = document.getElementById('mlSave'); if (sb) sb.textContent = `♡ Guardar moodboard${S.pins.size ? ` (${S.pins.size} fijadas)` : ''}`;
      return;
    }
    if (t.dataset.open) return open(t.dataset.open);
    if (t.dataset.del) { if (!confirm('¿Borrar este moodboard guardado?')) return; persist(load().filter(b => b.id !== t.dataset.del)); if (S && S.id === t.dataset.del) S.id = null; saved(); say('Moodboard borrado'); }
  });
})();
