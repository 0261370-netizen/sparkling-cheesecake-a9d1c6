/* The Design Library — cuenta y nube privada.
   Load this script in <head>, before any other library script: it watches
   localStorage writes so every save is also sent to the signed-in user's
   private cloud copy. Pages keep reading localStorage as before. */
(function () {
  'use strict';
  const KEYS = ['tdl-fav', 'tdl-custom', 'tdl-ideas', 'tdl-sketches', 'tdl-concepts', 'tdl-mood', 'tdl-palettes',
    'tdl-materials-fav', 'tdl-done', 'tdl-detective', 'tdl-gym-done', 'tdl-shelf-checks-v1', 'tdl-mesa', 'tdl-mesa-semanas', 'tdl-dudas', 'tdl-dudas-fotos', 'tdl-quests', 'tdl-bio', 'tdl-boards'];
  const SYNCED = new Set(KEYS);
  const META = 'tdl-sync-meta';
  const CHUNK = 3 * 1024 * 1024;
  const proto = Storage.prototype;
  const rawSet = proto.setItem, rawRemove = proto.removeItem, rawGet = proto.getItem;
  const ls = (() => { try { return window.localStorage; } catch { return null; } })();
  const lget = k => { try { return rawGet.call(ls, k); } catch { return null; } };
  const lset = (k, v) => { try { rawSet.call(ls, k, v); return true; } catch { return false; } };
  const ldel = k => { try { rawRemove.call(ls, k); } catch { /* ignore */ } };

  // ---------- helpers ----------
  const canon = v => {
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    return JSON.stringify(v === undefined ? null : v);
  };
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36) + '.' + s.length; };
  const parse = s => { try { return s == null ? null : JSON.parse(s); } catch { return s; } };
  const fp = str => str == null ? '∅' : fnv(canon(parse(str)));
  const fpVal = v => v == null ? '∅' : fnv(canon(v));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join('');
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const stamp = x => isObj(x) ? Number(x.updated || x.updatedAt || x.ts || x.time || 0) || 0 : 0;
  const itemKey = x => isObj(x) && x.id != null ? 'id:' + x.id : isObj(x) && x.url ? 'url:' + x.url : 'v:' + canon(x);

  // Union of two saved values: nothing from either side is dropped.
  function merge(cloud, local) {
    if (cloud == null) return local;
    if (local == null) return cloud;
    if (Array.isArray(cloud) && Array.isArray(local)) {
      const out = [], at = new Map();
      for (const x of [...cloud, ...local]) {
        const k = itemKey(x);
        if (!at.has(k)) { at.set(k, out.length); out.push(x); }
        else { const i = at.get(k); if (stamp(x) >= stamp(out[i])) out[i] = x; }
      }
      return out;
    }
    if (isObj(cloud) && isObj(local)) {
      const o = { ...cloud };
      for (const k of Object.keys(local)) o[k] = k in cloud ? merge(cloud[k], local[k]) : local[k];
      return o;
    }
    return local;
  }

  // ---------- sync state ----------
  let meta = (() => { const m = parse(lget(META)); return isObj(m) ? m : {}; })();
  meta.revs = meta.revs || {}; meta.hashes = meta.hashes || {}; meta.files = meta.files || {};
  const saveMeta = () => lset(META, JSON.stringify(meta));
  let user = null, ready = false, frozen = false, pushTimer = 0, pushing = null, status = 'idle', cloudFiles = null;
  const listeners = new Set();
  const emit = () => { listeners.forEach(f => { try { f(api); } catch { /* ignore */ } }); document.dispatchEvent(new CustomEvent('tdl-cloud:change')); renderSlots(); };
  const setStatus = s => { status = s; emit(); };

  // Watch writes to library keys from every script on the page.
  proto.setItem = function (k, v) {
    if (this === ls && SYNCED.has(k)) { if (frozen) return; rawSet.call(this, k, v); schedulePush(); return; }
    return rawSet.call(this, k, v);
  };
  proto.removeItem = function (k) {
    if (this === ls && SYNCED.has(k)) { if (frozen) return; rawRemove.call(this, k); schedulePush(); return; }
    return rawRemove.call(this, k);
  };

  const linked = () => user && ready && meta.user === user.id;
  const dirtyKeys = () => KEYS.filter(k => { const s = lget(k); const known = meta.hashes[k]; return known === undefined ? s != null : fp(s) !== known; });

  async function http(method, path, body, raw) {
    if (identity) { try { await identity.getUser(); } catch { /* refresh best effort */ } }
    const opt = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) {
      if (raw) { opt.body = body; opt.headers['content-type'] = 'application/octet-stream'; }
      else { opt.body = JSON.stringify(body); opt.headers['content-type'] = 'application/json'; }
    }
    const r = await fetch(path, opt);
    if (r.status === 401) { const e = new Error('auth'); e.status = 401; throw e; }
    if (!r.ok) { const e = new Error((await r.json().catch(() => ({}))).error || 'Error ' + r.status); e.status = r.status; throw e; }
    return raw === 'bytes' ? r.arrayBuffer() : r.json();
  }

  function schedulePush() {
    if (!linked()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushDirty, 1200);
  }
  async function pushKey(k) {
    const s = lget(k), value = parse(s);
    const res = await http('PUT', '/api/cloud/data', { items: [{ key: k, value }] });
    const it = res.items?.[0];
    meta.hashes[k] = fp(s);
    if (it) meta.revs[k] = it.updatedAt;
    saveMeta();
  }
  async function pushDirty() {
    if (!linked()) return;
    if (pushing) { schedulePush(); return; }
    const keys = dirtyKeys();
    if (!keys.length) return;
    pushing = (async () => {
      setStatus('saving');
      let failed = 0;
      for (const k of keys) {
        try { await pushKey(k); }
        catch (e) {
          failed++;
          if (e.status === 401) { setStatus('offline'); return; }
          if (e.status === 413) toast('Un elemento es demasiado grande para la nube; sigue en este navegador.');
        }
      }
      setStatus(failed ? 'offline' : 'synced');
    })();
    try { await pushing; } finally { pushing = null; }
  }

  // ---------- full sync ----------
  async function fetchValues(keys) {
    const out = {};
    for (const k of keys) {
      const r = await http('GET', '/api/cloud/data?keys=' + encodeURIComponent(k));
      for (const it of r.items || []) out[it.key] = it;
    }
    return out;
  }
  function writeLocal(k, value) {
    if (value == null) ldel(k); else if (!lset(k, JSON.stringify(value))) throw new Error('quota');
  }

  async function fullSync() {
    if (!user) return;
    setStatus('syncing');
    try {
      const man = await http('GET', '/api/cloud/data');
      const remote = Object.fromEntries((man.items || []).map(i => [i.key, i.updatedAt]));
      if (meta.user && meta.user !== user.id) {
        const ok = confirm(`Este navegador guarda datos de otra cuenta (${meta.email || 'otra cuenta'}). ¿Cambiarlos por los de ${user.email}?\n\nLos datos de la otra cuenta siguen en su propia nube; solo se perderían cambios que no alcanzaron a subirse.`);
        if (!ok) { await signOut(true); return; }
        for (const k of KEYS) ldel(k);
        await idbClear().catch(() => {});
        meta = { user: user.id, email: user.email, mode: 'normal', revs: {}, hashes: {}, files: {} };
        KEYS.forEach(k => { meta.hashes[k] = '∅'; });
      }
      const first = meta.user !== user.id;
      if (first) meta = { user: user.id, email: user.email, revs: {}, hashes: {}, files: {} };
      meta.email = user.email;
      const fetchKeys = KEYS.filter(k => remote[k] != null && remote[k] !== meta.revs[k]);
      const vals = await fetchValues(fetchKeys);
      let changed = false; const toPush = [];
      for (const k of KEYS) {
        const s = lget(k);
        const dirty = first ? s != null : (meta.hashes[k] === undefined ? s != null : fp(s) !== meta.hashes[k]);
        const rv = vals[k];
        if (rv) {
          if (dirty) {
            const merged = merge(rv.value, parse(s));
            if (fpVal(merged) !== fp(s)) { writeLocal(k, merged); changed = true; }
            if (fpVal(merged) !== fpVal(rv.value)) toPush.push(k);
            else { meta.hashes[k] = fpVal(merged); meta.revs[k] = rv.updatedAt; }
          } else {
            if (fpVal(rv.value) !== fp(s)) { writeLocal(k, rv.value); changed = true; }
            meta.hashes[k] = fpVal(rv.value); meta.revs[k] = rv.updatedAt;
          }
        } else if (dirty) toPush.push(k);
      }
      saveMeta();
      ready = true;
      let pushFailed = false;
      for (const k of toPush) { try { await pushKey(k); } catch (e) { pushFailed = true; if (e.status === 401) throw e; } }
      if (first) toast(toPush.length ? 'Listo: lo que tenías en este navegador ya está en tu nube.' : 'Sesión iniciada. Tu biblioteca está sincronizada.');
      setStatus(pushFailed ? 'offline' : 'synced');
      syncFiles(first).catch(() => {});
      if (changed) reloadWithCloud();
    } catch (e) {
      ready = meta.user === user?.id;
      setStatus(e.status === 401 ? 'signedout' : 'offline');
      if (e.message === 'quota') toast('No hay espacio en este navegador para descargar todo; tus datos siguen en la nube.');
    }
  }

  function reloadWithCloud() {
    const last = Number(sessionStorage.getItem('tdl-cloud-reload') || 0);
    if (Date.now() - last < 15000) { showBanner(); return; }
    frozen = true;
    try { sessionStorage.setItem('tdl-cloud-reload', String(Date.now())); } catch { /* ignore */ }
    toast('Cargando tus datos de la nube…');
    setTimeout(() => location.reload(), 500);
  }
  function showBanner() {
    if (document.getElementById('cloudBanner')) return;
    const b = document.createElement('div');
    b.id = 'cloudBanner'; b.className = 'cloud-banner'; b.setAttribute('role', 'status');
    b.innerHTML = '<span>☁ Hay cambios nuevos desde otro dispositivo.</span><button type="button">Actualizar</button>';
    b.querySelector('button').onclick = () => { frozen = true; location.reload(); };
    document.body.appendChild(b);
  }

  // Check for changes made on other devices when the tab comes back.
  let lastCheck = Date.now();
  async function checkRemote() {
    if (!linked() || Date.now() - lastCheck < 45000) return;
    lastCheck = Date.now();
    try {
      await pushDirty();
      const man = await http('GET', '/api/cloud/data');
      const newer = (man.items || []).some(i => SYNCED.has(i.key) && i.updatedAt !== meta.revs[i.key]);
      if (newer) showBanner();
    } catch { /* ignore */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkRemote(); else pushDirty(); });
  window.addEventListener('online', () => { if (user && !ready) fullSync(); else pushDirty(); });
  window.addEventListener('pagehide', () => { if (dirtyKeys().length) pushDirty(); });

  // ---------- private PDFs (IndexedDB locally, chunks in the cloud) ----------
  function idb() {
    return new Promise((res, rej) => {
      if (!('indexedDB' in window)) { rej(Error('IndexedDB no disponible')); return; }
      const q = indexedDB.open('tdl-private-reading-v1', 1);
      q.onupgradeneeded = () => { if (!q.result.objectStoreNames.contains('pdfs')) q.result.createObjectStore('pdfs', { keyPath: 'id' }); };
      q.onerror = () => rej(q.error); q.onsuccess = () => res(q.result);
    });
  }
  async function idbTx(mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction('pdfs', mode); const st = t.objectStore('pdfs'); let out;
      const q = fn(st); if (q) q.onsuccess = () => { out = q.result; };
      t.oncomplete = () => { db.close(); res(out); }; t.onerror = () => { db.close(); rej(t.error); };
    });
  }
  const idbAll = () => idbTx('readonly', st => st.getAll());
  const idbGet = id => idbTx('readonly', st => st.get(id));
  const idbPut = rec => idbTx('readwrite', st => st.put(rec));
  const idbDel = id => idbTx('readwrite', st => st.delete(id));
  const idbClear = () => idbTx('readwrite', st => st.clear());

  async function listFiles() {
    const r = await http('GET', '/api/cloud/files');
    cloudFiles = Object.fromEntries((r.files || []).map(f => [f.id, f]));
    return cloudFiles;
  }
  const uploads = new Map();
  function uploadPdf(id, blob, name) {
    if (!linked()) return Promise.resolve(null);
    if (uploads.has(id)) return uploads.get(id).then(() => uploadPdf(id, blob, name));
    const job = (async () => {
      const upload = rid(); const chunks = Math.max(1, Math.ceil(blob.size / CHUNK));
      for (let n = 0; n < chunks; n++) {
        await http('PUT', `/api/cloud/files/${id}/${upload}/${n}`, blob.slice(n * CHUNK, (n + 1) * CHUNK), true);
      }
      const r = await http('POST', `/api/cloud/files/${id}`, { upload, chunks, name: name || 'documento.pdf', size: blob.size });
      cloudFiles = { ...(cloudFiles || {}), [id]: r.file };
      meta.files[id] = r.file.updatedAt; saveMeta();
      const rec = await idbGet(id).catch(() => null);
      if (rec) await idbPut({ ...rec, updated: r.file.updatedAt }).catch(() => {});
      emit();
      return r.file;
    })();
    uploads.set(id, job);
    job.finally(() => uploads.delete(id)).catch(() => {});
    return job;
  }
  async function downloadPdf(id) {
    const f = (cloudFiles || await listFiles())[id];
    if (!f) return null;
    const parts = [];
    for (let n = 0; n < f.chunks; n++) parts.push(await http('GET', `/api/cloud/files/${id}/${f.upload}/${n}`, undefined, 'bytes'));
    const rec = { id, blob: new Blob(parts, { type: 'application/pdf' }), name: f.name, updated: f.updatedAt };
    await idbPut(rec).catch(() => {});
    meta.files[id] = f.updatedAt; saveMeta();
    emit();
    return rec;
  }
  async function removePdf(id) {
    delete meta.files[id]; saveMeta();
    if (!linked()) return;
    await http('DELETE', `/api/cloud/files/${id}`);
    if (cloudFiles) delete cloudFiles[id];
    emit();
  }
  async function syncFiles(first) {
    const files = await listFiles();
    const local = await idbAll().catch(() => []);
    let up = 0;
    for (const rec of local || []) {
      if (!rec || !rec.blob) continue;
      const c = files[rec.id];
      if (!c && !first && meta.files[rec.id]) { await idbDel(rec.id).catch(() => {}); delete meta.files[rec.id]; continue; } // removed on another device
      if (!c || Number(rec.updated || 0) > Number(c.updatedAt)) {
        if (rec.blob.size > 36000000) continue;
        up++;
        if (up === 1) toast('Subiendo tus PDFs a tu nube privada…');
        try { await uploadPdf(rec.id, rec.blob, rec.name); } catch { toast(`No se pudo subir ${rec.name || 'un PDF'}; se reintentará.`); }
      } else if (c && Number(rec.updated || 0) < Number(c.updatedAt)) {
        await idbDel(rec.id).catch(() => {}); // a newer version exists; downloaded when opened
      } else meta.files[rec.id] = c.updatedAt;
    }
    saveMeta();
    if (up) toast('PDFs guardados en tu nube privada.');
    emit();
  }

  // ---------- identity ----------
  let identity = null;
  async function loadIdentity() {
    if (identity) return identity;
    identity = await import('/vendor/netlify-identity.js');
    return identity;
  }
  async function start() {
    try {
      const id = await loadIdentity();
      id.onAuthChange((ev, u) => {
        if (ev === id.AUTH_EVENTS.LOGOUT) { user = null; ready = false; setStatus('signedout'); }
      });
      let cb = null;
      try { cb = await id.handleAuthCallback(); }
      catch (e) { openModal('login', 'El enlace ya no es válido o expiró. Inicia sesión de nuevo.'); }
      user = await id.getUser();
      if (cb?.type === 'recovery') openModal('reset');
      else if (cb?.type === 'invite') openModal('invite', '', cb.token);
      else if (cb?.type === 'confirmation') toast('Correo confirmado. ¡Bienvenida/o!');
      if (user) await fullSync(); else setStatus('signedout');
    } catch (e) {
      setStatus('unavailable');
    }
  }
  async function signedIn(u) {
    user = u; closeModal(); ready = false; await fullSync();
  }
  async function signOut(skipConfirm, wipe) {
    try { await pushDirty(); } catch { /* ignore */ }
    try { await (await loadIdentity()).logout(); } catch { /* ignore */ }
    user = null; ready = false;
    if (wipe) {
      frozen = true;
      for (const k of KEYS) ldel(k);
      ldel(META); await idbClear().catch(() => {});
      toast('Sesión cerrada y datos borrados de este dispositivo.');
      setTimeout(() => location.reload(), 600);
      return;
    }
    setStatus('signedout');
    if (!skipConfirm) toast('Sesión cerrada. Tu copia en la nube sigue a salvo.');
  }

  // ---------- UI ----------
  function toast(t) {
    let el = document.getElementById('cloudToast');
    if (!el) { el = document.createElement('div'); el.id = 'cloudToast'; el.className = 'cloud-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.textContent = t; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3600);
  }
  const LABEL = { idle: 'Cuenta', syncing: 'Sincronizando…', saving: 'Guardando…', synced: 'En la nube', offline: 'Sin conexión', signedout: 'Iniciar sesión', unavailable: 'Iniciar sesión' };
  function renderSlots() {
    document.querySelectorAll('[data-cloud-slot]').forEach(slot => {
      let b = slot.querySelector('button');
      if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'cloud-btn'; b.onclick = () => openModal(user ? 'account' : 'login'); slot.appendChild(b); }
      const s = user ? status : 'signedout';
      b.dataset.state = s;
      b.innerHTML = `<span class="cloud-dot" aria-hidden="true"></span>${esc(user ? (s === 'synced' ? 'En tu nube' : LABEL[s] || 'Cuenta') : 'Iniciar sesión')}`;
      b.setAttribute('aria-label', user ? `Cuenta de ${user.email}: ${LABEL[s] || ''}` : 'Iniciar sesión para guardar en la nube');
    });
  }

  let modal = null, inviteToken = '';
  function closeModal() { if (modal) { modal.remove(); modal = null; } }
  function openModal(view, msg, token) {
    if (token) inviteToken = token;
    closeModal();
    modal = document.createElement('div');
    modal.className = 'cloud-modal';
    modal.innerHTML = `<div class="cloud-card" role="dialog" aria-modal="true" aria-labelledby="cloudTitle"><button type="button" class="cloud-x" aria-label="Cerrar">×</button><div class="cloud-body"></div></div>`;
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modal.querySelector('.cloud-x').onclick = closeModal;
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    document.body.appendChild(modal);
    show(view, msg);
  }
  function show(view, msg) {
    const body = modal.querySelector('.cloud-body');
    const note = msg ? `<p class="cloud-msg">${esc(msg)}</p>` : '';
    const pw = (id, ac) => `<label>Contraseña<input id="${id}" type="password" required minlength="8" autocomplete="${ac}"></label>`;
    const views = {
      login: `<div class="cloud-eyebrow">☁ Tu biblioteca en la nube</div><h2 id="cloudTitle">Inicia sesión</h2><p class="cloud-lead">Guarda tus notas, bocetos, fichas, favoritos, paletas y PDFs en tu cuenta para verlos en cualquier dispositivo. Solo tú puedes verlos.</p>${note}<form data-f="login"><label>Correo<input id="cEmail" type="email" required autocomplete="email"></label>${pw('cPass', 'current-password')}<button class="cloud-primary">Entrar</button></form><div class="cloud-links"><button type="button" data-go="signup">Crear cuenta</button><button type="button" data-go="forgot">Olvidé mi contraseña</button></div>`,
      signup: `<div class="cloud-eyebrow">☁ Nueva cuenta</div><h2 id="cloudTitle">Crea tu cuenta</h2><p class="cloud-lead">Lo que ya tienes en este navegador se sube a tu nube la primera vez que entres. No se borra nada.</p>${note}<form data-f="signup"><label>Nombre<input id="cName" autocomplete="name"></label><label>Correo<input id="cEmail" type="email" required autocomplete="email"></label>${pw('cPass', 'new-password')}<small>Mínimo 8 caracteres.</small><button class="cloud-primary">Crear cuenta</button></form><div class="cloud-links"><button type="button" data-go="login">Ya tengo cuenta</button></div>`,
      forgot: `<div class="cloud-eyebrow">☁ Recuperar acceso</div><h2 id="cloudTitle">¿Olvidaste tu contraseña?</h2><p class="cloud-lead">Te enviamos un enlace para crear una nueva.</p>${note}<form data-f="forgot"><label>Correo<input id="cEmail" type="email" required autocomplete="email"></label><button class="cloud-primary">Enviar enlace</button></form><div class="cloud-links"><button type="button" data-go="login">Volver</button></div>`,
      reset: `<div class="cloud-eyebrow">☁ Nueva contraseña</div><h2 id="cloudTitle">Elige una contraseña nueva</h2>${note}<form data-f="reset">${pw('cPass', 'new-password')}<button class="cloud-primary">Guardar contraseña</button></form>`,
      invite: `<div class="cloud-eyebrow">☁ Invitación</div><h2 id="cloudTitle">Activa tu cuenta</h2>${note}<form data-f="invite">${pw('cPass', 'new-password')}<button class="cloud-primary">Activar</button></form>`,
      account: () => {
        const n = KEYS.filter(k => lget(k) != null).length;
        const pdfs = cloudFiles ? Object.keys(cloudFiles).length : 0;
        return `<div class="cloud-eyebrow">☁ Tu cuenta</div><h2 id="cloudTitle">${esc(user?.name || 'Tu biblioteca')}</h2><p class="cloud-lead">${esc(user?.email || '')}</p>${note}<ul class="cloud-state"><li><b>${esc(LABEL[status] || '')}</b> · ${n} colecciones guardadas · ${pdfs} PDF${pdfs === 1 ? '' : 's'} en la nube</li><li>Notas, bocetos, fichas de concepto, favoritos, moodboards, paletas, colecciones bio, citas creativas, materiales, retos y PDFs vinculados se guardan en tu nube privada. Nadie más puede verlos.</li></ul><div class="cloud-row"><button type="button" class="cloud-primary" data-act="sync">Sincronizar ahora</button><button type="button" class="cloud-ghost" data-act="out">Cerrar sesión</button></div><button type="button" class="cloud-danger" data-act="wipe">Cerrar sesión y borrar los datos de este dispositivo</button><small>Útil en un equipo compartido. Tu copia en la nube no se borra.</small>`;
      },
    };
    const v = views[view];
    body.innerHTML = typeof v === 'function' ? v() : v;
    body.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => show(b.dataset.go); });
    body.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = async () => {
        if (b.dataset.act === 'sync') { b.disabled = true; ready = false; await fullSync(); show('account', status === 'synced' ? 'Todo está al día.' : 'No se pudo conectar. Se reintentará.'); }
        if (b.dataset.act === 'out') { closeModal(); await signOut(); }
        if (b.dataset.act === 'wipe') { if (confirm('¿Cerrar sesión y borrar notas, bocetos, fichas, favoritos y PDFs de este navegador? Tu nube no se borra.')) { closeModal(); await signOut(false, true); } }
      };
    });
    const f = body.querySelector('form');
    if (f) f.onsubmit = e => { e.preventDefault(); submit(f.dataset.f, f); };
    setTimeout(() => body.querySelector('input,button.cloud-primary')?.focus(), 30);
  }
  async function submit(kind, form) {
    const val = id => form.querySelector('#' + id)?.value.trim() || '';
    const btn = form.querySelector('button'); btn.disabled = true;
    try {
      const id = await loadIdentity();
      if (kind === 'login') await signedIn(await id.login(val('cEmail'), form.querySelector('#cPass').value));
      if (kind === 'signup') {
        const u = await id.signup(val('cEmail'), form.querySelector('#cPass').value, { full_name: val('cName') });
        if (u?.emailVerified) await signedIn(await id.getUser() || u);
        else show('login', 'Te enviamos un correo para confirmar tu cuenta. Ábrelo y después inicia sesión aquí.');
      }
      if (kind === 'forgot') { await id.requestPasswordRecovery(val('cEmail')); show('login', 'Si el correo tiene cuenta, recibirás un enlace para crear una contraseña nueva.'); }
      if (kind === 'reset') { await id.updateUser({ password: form.querySelector('#cPass').value }); await signedIn(await id.getUser()); toast('Contraseña actualizada.'); }
      if (kind === 'invite') await signedIn(await id.acceptInvite(inviteToken, form.querySelector('#cPass').value));
    } catch (e) {
      const s = e?.status;
      const m = e?.name === 'MissingIdentityError' ? 'El inicio de sesión aún no está disponible en este sitio.'
        : s === 401 || s === 400 ? (kind === 'login' ? 'Correo o contraseña incorrectos, o falta confirmar tu correo.' : 'No se pudo completar. Revisa los datos.')
        : s === 403 ? 'El registro está cerrado en este sitio.'
        : s === 422 ? 'Revisa el correo y usa una contraseña de al menos 8 caracteres.'
        : s === 429 ? 'Demasiados intentos. Espera un momento.'
        : 'No se pudo conectar. Inténtalo de nuevo.';
      const p = form.parentElement.querySelector('.cloud-msg') || Object.assign(document.createElement('p'), { className: 'cloud-msg' });
      p.textContent = m; p.classList.add('err'); form.before(p);
    } finally { if (btn.isConnected) btn.disabled = false; }
  }

  // ---------- public API ----------
  const api = {
    get user() { return user; },
    get signedIn() { return !!linked(); },
    get status() { return status; },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    open() { openModal(user ? 'account' : 'login'); },
    fileInfo(id) { return linked() && cloudFiles ? cloudFiles[id] || null : null; },
    pdfSaved(id, file) { return linked() ? uploadPdf(id, file, file.name) : Promise.resolve(null); },
    pdfFetch(id) { return linked() ? downloadPdf(id) : Promise.resolve(null); },
    pdfRemoved(id) { return removePdf(id); },
    pushNow: pushDirty,
    retry() { if (user && !ready) return fullSync(); return pushDirty(); },
  };
  window.TDLCloud = api;

  const boot = () => { renderSlots(); start(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
(function(){const s=document.createElement('style');s.textContent=`.cloud-btn{display:inline-flex;gap:8px;align-items:center;border:1px solid rgba(255,255,255,.4);background:none;color:inherit;border-radius:999px;padding:8px 14px;font-size:12px;cursor:pointer}.cloud-dot{width:8px;height:8px;border-radius:50%;background:#aaa}.cloud-btn[data-state=synced] .cloud-dot{background:#7fc28e}.cloud-btn[data-state=saving] .cloud-dot,.cloud-btn[data-state=syncing] .cloud-dot{background:#e8d9a8}.cloud-btn[data-state=offline] .cloud-dot{background:#d68a70}[data-cloud-slot]{margin:14px 0}.cloud-modal{position:fixed;inset:0;background:rgba(10,25,20,.55);display:grid;place-items:center;z-index:9999;padding:16px}.cloud-card{background:#fffdf8;color:#193b32;max-width:420px;width:100%;border-radius:12px;padding:28px;position:relative;font-family:'Hanken Grotesk',Arial,sans-serif;max-height:90vh;overflow:auto}.cloud-card h2{font:400 34px/1 'Instrument Serif',serif;margin:8px 0}.cloud-eyebrow{font:10px 'DM Mono',monospace;letter-spacing:1.6px;text-transform:uppercase;color:#b8674f}.cloud-lead{font-size:13px;color:#6e766e;line-height:1.5}.cloud-card label{display:block;font-size:12px;margin:10px 0}.cloud-card input{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:11px;border:1px solid #dcded4;border-radius:6px;font:inherit}.cloud-primary,.cloud-ghost,.cloud-danger{border:0;border-radius:999px;padding:11px 18px;font-size:13px;cursor:pointer;margin-top:12px}.cloud-primary{background:#193b32;color:#fff}.cloud-ghost{background:none;border:1px solid #193b32;color:#193b32}.cloud-danger{background:none;color:#a2412b;text-decoration:underline;display:block;padding-left:0}.cloud-x{position:absolute;top:10px;right:14px;border:0;background:none;font-size:24px;cursor:pointer}.cloud-links{display:flex;gap:14px;margin-top:14px}.cloud-links button{border:0;background:none;text-decoration:underline;font-size:12px;cursor:pointer;color:#193b32}.cloud-msg{font-size:13px;background:#eef2e6;padding:10px;border-radius:6px}.cloud-msg.err{background:#f7e2da}.cloud-row{display:flex;gap:8px;flex-wrap:wrap}.cloud-state{font-size:13px;line-height:1.5;padding-left:18px}.cloud-card small{font-size:11px;color:#6e766e}.cloud-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(120px);background:#193b32;color:#fff;padding:12px 18px;border-radius:8px;font-size:13px;z-index:10000;transition:transform .3s}.cloud-toast.show{transform:translateX(-50%)}.cloud-banner{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#e8d9a8;color:#193b32;padding:10px 14px;border-radius:999px;display:flex;gap:10px;align-items:center;z-index:9998;font-size:13px}.cloud-banner button{border:0;background:#193b32;color:#fff;border-radius:999px;padding:6px 12px;cursor:pointer}`;document.head.appendChild(s)})();
