/* Creative Gym — accesos a Color, Citas creativas y Bitácora silvestre, con el resumen del día. */
(() => {
  'use strict';
  const root = document.getElementById('gymExplore');
  if (!root || !window.TDX || !window.TDX_DATA) return;
  const X = window.TDX, esc = X.esc, C = X.color;
  function render() {
    const p = X.dailyPalette(), q = X.dailyQuest(), sp = X.dailySpecies(), b = X.dailyBio();
    const nPal = X.palettes.list().length, nQ = X.questState().filter(x => !x.deleted).length, bs = X.bioState(), nB = bs.refs.filter(r => !r.deleted).length, nBoards = X.boards.list().length;
    const grad = `linear-gradient(135deg,${p.colors.join(',')})`;
    root.innerHTML = `<div class="gx-hub">
      <div class="gx-doors">
        <a class="gx-door" href="/color"><span class="bg" style="background:${grad}"></span><small>◐ Laboratorio</small><strong>Color</strong><span>Rueda, armonías, paleta del día, lecciones, psicología del color y contraste WCAG.${nPal ? ` · ${nPal} paleta${nPal === 1 ? '' : 's'} tuya${nPal === 1 ? '' : 's'}` : ''}</span></a>
        <a class="gx-door" href="/citas">${X.picture(window.TDX_DATA.BIO.find(r => r.id === 'fern').img, { alt: '', sizes: '(max-width:760px) 100vw, 33vw', widths: [480, 800] })}<small>✦ Sidequests</small><strong>Citas creativas</strong><span>Pequeñas aventuras con lugar, tiempo y misión. Sin rachas ni obligaciones.${nQ ? ` · ${nQ} guardada${nQ === 1 ? '' : 's'}` : ''}</span></a>
        <a class="gx-door" href="/bio">${X.picture(window.TDX_DATA.BIO.find(r => r.id === 'morpho').img, { alt: '', sizes: '(max-width:760px) 100vw, 33vw', widths: [480, 800] })}<small>❦ Cuaderno de campo</small><strong>Bitácora silvestre</strong><span>El animal del día, fichas para crear, noticias de naturaleza y una revista de referencias.${nB ? ` · ${nB} guardada${nB === 1 ? '' : 's'}` : ''}</span></a>
      </div>
      <div class="gx-today" aria-label="Resumen de hoy">
        <article class="gx-tile"><span class="tdx-eyebrow">Paleta del día</span><div class="pal">${p.colors.map(c => `<i style="background:${c}" title="${c.toUpperCase()}"></i>`).join('')}</div><h4>${esc(p.name)}</h4><p>${esc(p.apply)}</p><a class="more" href="/color#dia">Abrir en el laboratorio →</a></article>
        <article class="gx-tile"><span class="tdx-eyebrow">Cita de hoy · ${esc(q.place)} · ${q.min} min</span><h4>${esc(q.title)}</h4><p>${esc(q.mission)}</p><a class="more" href="/citas#q-${q.id}">Ver la cita →</a></article>
        ${sp ? `<article class="gx-tile"><span class="tdx-eyebrow">Animal del día · Bitácora silvestre</span>${X.picture(sp.img, { alt: sp.name, sizes: '320px', widths: [360, 560] }).replace('<img ', `<img style="object-position:${sp.focus || '50% 50%'}" `)}<h4>${esc(sp.name)}</h4><p><i>${esc(sp.sci)}</i> · ${esc(sp.hook)}</p><a class="more" href="/bio#sp-${sp.id}">Abrir la ficha →</a></article>` : `<article class="gx-tile"><span class="tdx-eyebrow">Referencia natural destacada</span>${X.picture(b.img, { alt: b.title, sizes: '320px', widths: [360, 560] })}<h4>${esc(b.title)}</h4><p>${esc(b.observe)}</p><a class="more" href="/bio#r-${b.id}">Hojear en la revista →</a></article>`}
      </div>
      ${nBoards ? `<p class="gym-hint">▦ Tienes ${nBoards} moodboard${nBoards === 1 ? '' : 's'} personal${nBoards === 1 ? '' : 'es'}. <a href="/bio#moodboards" style="text-decoration:underline">Verlos</a></p>` : ''}
    </div>`;
  }
  render();
  window.addEventListener('storage', e => { if (['tdl-palettes', 'tdl-quests', 'tdl-bio', 'tdl-boards'].includes(e.key)) render(); });
})();
