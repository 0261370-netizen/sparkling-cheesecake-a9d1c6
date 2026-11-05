// THE DESIGN DAILY — renders today's newspaper inside the "#hoy" section of the library.
(() => {
  'use strict';
  const host = document.getElementById('dailyPaper');
  if (!host) return;
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = v => { try { const u = new URL(v); return ['http:','https:'].includes(u.protocol) ? e(u.href) : '#'; } catch { return '#'; } };
  const hex = v => /^#[a-f\d]{6}$/i.test(v) ? v : '#dddddd';
  const fmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const nice = d => { try { return fmt.format(new Date(String(d).slice(0, 10) + 'T12:00:00Z')); } catch { return e(d); } };
  const copy = h => (typeof copyText === 'function' ? copyText(h, h) : navigator.clipboard?.writeText(h));
  let request = 0;

  const img = (src, alt, cls = '') => src ? `<img class="${cls}" src="${url(src)}" alt="${e(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="var a=this.closest('article');if(a)a.classList.add('noimg');(this.closest('figure')||this).remove()">` : '';

  function lead(s) {
    const pic = s.image ? `<figure class="dd-photo">${img(s.image, s.title)}<figcaption>${e(s.source)}</figcaption></figure>` : '';
    return `<article class="dd-feat${s.image ? '' : ' noimg'}">${pic}<div><span class="dd-meta">${e(s.source)} · ${nice(s.publishedAt)}</span><h3><a href="${url(s.link)}" target="_blank" rel="noopener noreferrer">${e(s.title)}</a></h3><p>${e(s.summary)}</p><a class="dd-cta" href="${url(s.link)}" target="_blank" rel="noopener noreferrer">Leer la noticia completa ↗</a>${window.labButton?' '+labButton({kind:'Noticia',title:s.title,summary:s.summary,topic:s.topic,source:s.source,url:s.link}):''}</div></article>`;
  }
  function brief(s, i) {
    return `<article class="dd-story${s.image ? '' : ' noimg'}"><span class="n">${i + 1}</span><div><span class="dd-meta">${e(s.source)} · ${nice(s.publishedAt)}</span><a href="${url(s.link)}" target="_blank" rel="noopener noreferrer"><strong>${e(s.title)}</strong></a></div>${img(s.image, '')}</article>`;
  }

  function render(d, past) {
    host.innerHTML = `<div class="dd" data-theme="${e(d.theme.key)}"><div class="dd-in">
      <div class="dd-top"><span>Nº ${e(d.number)} · ${nice(d.date)}</span><span>Ciudad de México</span></div>
      <div class="dd-mast"><h1>The Design <em>Daily.</em></h1></div>
      <div class="dd-strip"><b>Tema de hoy: ${e(d.theme.name)}</b><span>${e(d.theme.kicker)}</span></div>
      ${past ? `<p class="dd-hint" style="margin-top:12px">Estás viendo una edición anterior. <button class="dd-btn" type="button" data-today>Volver a la de hoy</button></p>` : ''}
      <nav class="dd-guide" aria-label="Partes del periódico"><a href="#dd-main"><b>1</b>Historia principal</a><a href="#dd-more"><b>2</b>Más noticias</a><a href="#dd-color"><b>3</b>Color y materiales</a><a href="#dd-object"><b>4</b>Objeto del día</a><a href="#dd-challenge"><b>5</b>Reto de hoy</a></nav>
      <div class="dd-cover">
        <div class="dd-grid">
          <div class="dd-lead" id="dd-main"><span class="dd-label">1 · Historia principal</span><h2>${e(d.cover.headline)}</h2><p class="dd-dek">${e(d.cover.dek)}</p>${lead(d.featured)}</div>
          <div class="dd-side" id="dd-more"><span class="dd-label">2 · Más noticias</span><h4>En esta edición <i>${d.stories.length}</i></h4>${d.stories.map(brief).join('')}<p class="dd-hint">Toca un titular para leerlo en su fuente original.</p></div>
        </div>
        <div class="dd-row">
          <section class="dd-sec" id="dd-color"><span class="dd-label">3 · Color y materiales</span><h3>${e(d.color.title)}</h3><div class="dd-sw">${d.color.swatches.map(s => `<button type="button" data-hex="${e(s.hex)}" title="Copiar ${e(s.hex)}" aria-label="Copiar color ${e(s.hex)}"><span style="--c:${hex(s.hex)}"></span>${e(s.hex)}</button>`).join('')}</div><p class="dd-hint">Toca un color para copiar su código.</p><p><strong>Materiales:</strong> ${e(d.color.materials.join(' · '))}</p><p>${e(d.color.note)}</p><a class="dd-link" href="#moodboards">Ver el moodboard del día →</a></section>
          <section class="dd-sec" id="dd-object"><span class="dd-label">4 · Objeto del día</span><h3 class="dd-obj">${e(d.object.name)}</h3><span class="dd-meta">${e(d.object.designer)} · ${e(d.object.year)}</span><p>${e(d.object.story)}</p><p class="dd-q">${e(d.object.question)}</p>${window.labButton?labButton({kind:'Objeto del día',title:d.object.name+' — '+d.object.designer,summary:d.object.story,topic:d.theme.name}):''}</section>
          <section class="dd-sec" id="dd-challenge"><span class="dd-label">5 · Reto de hoy · ${e(d.challenge.time)}</span><h3>${e(d.challenge.title)}</h3><p>${e(d.challenge.brief)}</p><ul>${d.challenge.constraints.map(c => `<li>${e(c)}</li>`).join('')}</ul><a class="dd-cta" href="/cuaderno#bocetos">Dibujarlo en mi cuaderno ↗</a></section>
        </div>
      </div>
      <div class="dd-foot"><span>${d.usedStoredArticles ? 'Incluye artículos del archivo' : 'Noticias reales con su fuente y fecha'}</span><button class="dd-btn" type="button" data-archive aria-expanded="false" aria-controls="ddArchive">Ver ediciones anteriores ↓</button></div>
      <div class="dd-arch" id="ddArchive" hidden></div>
    </div></div>`;
    host.querySelectorAll('[data-hex]').forEach(b => b.addEventListener('click', () => copy(b.dataset.hex)));
    host.querySelector('[data-today]')?.addEventListener('click', () => load());
    host.querySelectorAll('.dd-guide a').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    host.querySelector('[data-archive]').addEventListener('click', ev => toggleArchive(ev.currentTarget, d.date));
  }

  async function toggleArchive(btn, current) {
    const box = host.querySelector('#ddArchive');
    box.hidden = !box.hidden; btn.setAttribute('aria-expanded', String(!box.hidden));
    btn.textContent = box.hidden ? 'Ver ediciones anteriores ↓' : 'Ocultar ediciones anteriores ↑';
    if (box.hidden || box.dataset.loaded) return;
    box.innerHTML = '<p class="dd-hint">Buscando portadas…</p>';
    try {
      const r = await fetch('/api/editions?limit=60', { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw Error();
      const rows = await r.json();
      box.dataset.loaded = '1';
      box.innerHTML = rows.length ? `<p class="dd-hint" style="margin-bottom:10px">Elige una portada para abrirla.</p><div class="dd-arch-list">${rows.map(row => `<button type="button" class="dd-th${row.date === current ? ' on' : ''}" data-edition="${e(row.date)}"><span class="m">The Design Daily</span>${row.featured?.image ? `<span class="i" style="background-image:url('${url(row.featured.image)}')"></span>` : ''}<span class="bar">${(row.colors || []).map(c => `<i style="background:${hex(c)}"></i>`).join('')}</span><small>${nice(row.date)} · Nº ${e(row.number)}</small><strong>${e(row.headline)}</strong><small>${e(row.theme?.name)}</small></button>`).join('')}</div>` : '<p class="dd-hint">Todavía no hay ediciones anteriores: esta es la primera.</p>';
      box.querySelectorAll('[data-edition]').forEach(b => b.addEventListener('click', () => load(b.dataset.edition)));
    } catch {
      box.innerHTML = '<p class="dd-hint">No se pudo abrir el archivo. <button class="dd-btn" type="button">Reintentar</button></p>';
      box.querySelector('button').onclick = () => { box.hidden = true; toggleArchive(btn, current); };
    }
  }

  async function load(date) {
    const mine = ++request;
    if (!host.querySelector('.dd')) host.innerHTML = '<div class="dd-loading">Imprimiendo el periódico de hoy…<small>UN MOMENTO</small></div>';
    try {
      const r = await fetch('/api/edition' + (date ? '/' + encodeURIComponent(date) : ''), { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw Error(String(r.status));
      const d = await r.json();
      if (mine !== request) return;
      render(d, Boolean(date));
      if (date) document.getElementById('hoy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      if (mine !== request) return;
      host.innerHTML = '<div class="dd-error">El periódico de hoy no está disponible en este momento. El resto de tu biblioteca funciona con normalidad. <button class="pill-btn pill-ghost" type="button" style="display:inline-flex;padding:10px 16px">Reintentar</button></div>';
      host.querySelector('button').onclick = () => load(date);
    }
  }
  load();
})();
