// VISUAL ATLAS (palette from photos + materials library) and SAVED (Inspiration DNA).
// Personal data stays in this browser: 'tdl-palettes', 'tdl-materials-fav'.
(() => {
  'use strict';
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { say('No se pudo guardar: el almacenamiento del navegador está lleno'); return false; } };
  const say = m => (typeof toast === 'function' ? toast(m) : null);
  const copy = (t, l) => (typeof copyText === 'function' ? copyText(t, l) : navigator.clipboard?.writeText(t));
  const lab = o => (window.labButton ? labButton(o) : '');
  const isHex = c => /^#[0-9a-f]{6}$/i.test(c);
  const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const textOn = h => { const [r, g, b] = rgb(h); return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#193b32' : '#fff'; };
  function hsl(h) { let [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let hh = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [hh, s, l]; }

  // =============== 1. PALETTE FROM MY PHOTOS ===============
  const PAL = 'tdl-palettes';
  let current = null; // {colors:[{hex,share}], thumb}

  function loadImage(file) {
    return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(); }; im.src = u; });
  }
  // k-means (k = 5) on a downscaled copy of the photo. Runs fully in the browser.
  function extract(img) {
    const S = 120, k = Math.min(1, S / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height).data, px = [];
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
    if (!px.length) return [];
    const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    // k-means++ seeding with a fixed seed so the same photo gives the same palette.
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cents = [px[Math.floor(rnd() * px.length)].slice()];
    while (cents.length < 5) {
      const w = px.map(p => Math.min(...cents.map(cn => dist(p, cn)))), tot = w.reduce((a, b) => a + b, 0);
      if (!tot) break; let r = rnd() * tot, i = 0; while ((r -= w[i]) > 0 && i < px.length - 1) i++; cents.push(px[i].slice());
    }
    let asg = new Array(px.length).fill(0);
    for (let it = 0; it < 12; it++) {
      px.forEach((p, i) => { let b = 0, bd = Infinity; cents.forEach((cn, j) => { const dd = dist(p, cn); if (dd < bd) { bd = dd; b = j; } }); asg[i] = b; });
      const sum = cents.map(() => [0, 0, 0, 0]);
      px.forEach((p, i) => { const s = sum[asg[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      sum.forEach((s, j) => { if (s[3]) cents[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
    }
    const counts = cents.map((_, j) => asg.filter(l => l === j).length);
    return cents.map((cn, j) => ({ hex: hex(...cn), share: counts[j] / px.length })).filter(c => c.share > 0).sort((a, b) => b.share - a.share);
  }
  function thumbOf(img) { const W = 200, k = W / img.width, c = document.createElement('canvas'); c.width = W; c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .7); }

  function renderPalette() {
    const box = document.getElementById('palBody'); if (!box) return;
    const saved = (get(PAL, []) || []).filter(p => Array.isArray(p.colors));
    box.innerHTML = `<div class="pal-layout"><div class="pal-drop" tabindex="0" role="button" aria-label="Subir una imagen para extraer su paleta" data-pick>
        ${current ? `<img src="${e(current.thumb)}" alt="Tu imagen">` : '<span class="pal-icon">📷</span><strong>Sube una foto</strong><small>Toca aquí o arrastra una imagen. Se procesa en tu navegador: la foto no se sube a ningún servidor.</small>'}
</div>
      <div class="pal-result">${current ? `<span class="gc-tag">Tus 5 colores principales</span><div class="pal-sw">${current.colors.map(c => `<button type="button" data-copy="${c.hex}" style="--c:${c.hex};color:${textOn(c.hex)}" aria-label="Copiar ${c.hex}"><b>${c.hex.toUpperCase()}</b><small>${Math.round(c.share * 100)}%</small></button>`).join('')}</div><p class="gym-hint">Toca un color para copiar su código HEX. El porcentaje indica cuánto ocupa en la foto.</p>
        <form class="pal-save" data-save><input name="n" maxlength="60" placeholder="Nombre de la paleta (p. ej. Mercado de Coyoacán)" aria-label="Nombre de la paleta"><button class="gc-btn" type="submit">♡ Guardar paleta</button><button class="gc-btn ghost" type="button" data-copyall>Copiar todos</button><button class="gc-btn ghost" type="button" data-pick>Otra foto</button></form>`
        : '<span class="gc-tag">Cómo funciona</span><ol class="gc-q"><li>Sube una foto de un lugar, un material o un objeto que te guste.</li><li>Extraemos sus 5 colores principales con sus códigos HEX.</li><li>Guárdala como paleta: aparecerá en tu Inspiration DNA.</li></ol>'}</div></div>
      <h4>Mis paletas guardadas · ${saved.length}</h4>${saved.length ? `<div class="pal-saved">${saved.slice().reverse().map(p => `<article>${p.thumb ? `<img src="${e(p.thumb)}" alt="">` : ''}<div class="pal-bar">${p.colors.filter(isHex).map(c => `<button type="button" data-copy="${c}" style="background:${c}" aria-label="Copiar ${c}" title="${c}"></button>`).join('')}</div><div class="pal-meta"><strong>${e(p.name)}</strong><small>${e(p.date)}</small></div><div class="pal-acts"><button type="button" data-copyset="${e(p.colors.join(', '))}">Copiar</button>${lab({ kind: 'Paleta', title: 'Paleta ' + p.name, summary: 'Paleta extraída de una foto propia con los colores ' + p.colors.join(', ') + '.', topic: 'Color y materiales' })}<button type="button" class="del" data-delpal="${e(p.id)}" aria-label="Borrar paleta">×</button></div></article>`).join('')}</div>` : '<p class="gym-hint">Aún no guardas paletas.</p>'}`;
  }
  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { say('Elige un archivo de imagen'); return; }
    try { const img = await loadImage(file); const colors = extract(img); if (!colors.length) throw Error(); current = { colors, thumb: thumbOf(img) }; renderPalette(); }
    catch { say('No se pudo leer esa imagen'); }
  }

  // =============== 2. MATERIALS LIBRARY ===============
  const MAT_FAV = 'tdl-materials-fav';
  const CATS = ['Madera', 'Metales', 'Tableros', 'Plásticos', 'Textiles', 'Acabados'];
  // Cost: relative scale for furniture use, approximate. Varies by supplier, region and thickness.
  const MATERIALS = [
    { n: 'Roble', c: 'Madera', props: ['Dura y resistente al desgaste', 'Veta abierta muy marcada', 'Buena estabilidad una vez seca'], proc: ['Corte y cepillado CNC o manual', 'Ensambles de caja y espiga', 'Curvado al vapor'], sus: 'Busca certificación FSC; es de crecimiento lento y suele importarse, lo que aumenta su huella de transporte.', cost: 3, tip: 'Cubiertas, sillas y piezas que deben envejecer bien.' },
    { n: 'Nogal', c: 'Madera', props: ['Tono oscuro y cálido', 'Dureza media', 'Se trabaja y lija muy bien'], proc: ['Torneado', 'Tallado y fresado', 'Chapa para tableros'], sus: 'Recurso escaso en macizo; usarlo como chapa sobre tablero aprovecha mejor cada árbol.', cost: 4, tip: 'Piezas protagonistas, detalles y frentes.' },
    { n: 'Pino', c: 'Madera', props: ['Ligero y blando', 'Nudos visibles', 'Absorbe mucho el acabado'], proc: ['Corte y ensamble sencillo', 'Atornillado', 'Fresado básico'], sus: 'Crecimiento rápido y amplia disponibilidad nacional con plantaciones certificadas.', cost: 1, tip: 'Prototipos, estructuras ocultas y mobiliario económico.' },
    { n: 'Parota', c: 'Madera', props: ['Madera tropical mexicana de vetas amplias', 'Ligera para su tamaño', 'Resistente a la humedad'], proc: ['Losas de una pieza (live edge)', 'Cepillado', 'Ensambles de mariposa para grietas'], sus: 'Verifica el origen legal; prefiere proveedores con manejo forestal documentado.', cost: 3, tip: 'Mesas de comedor y cubiertas de gran formato.' },
    { n: 'Bambú', c: 'Madera', props: ['Muy resistente a la tracción', 'Ligero', 'Superficie lisa con nudos'], proc: ['Laminado en tableros', 'Uniones amarradas o con pernos', 'Curvado con calor'], sus: 'Crece en pocos años y captura carbono; revisa los adhesivos de los tableros laminados.', cost: 2, tip: 'Estructuras ligeras, celosías y piezas de exterior protegidas.' },
    { n: 'Acero al carbono', c: 'Metales', props: ['Muy resistente y rígido', 'Se oxida sin protección', 'Permite perfiles delgados'], proc: ['Doblado de tubo y lámina', 'Soldadura MIG/TIG', 'Corte láser y plasma'], sus: 'Altamente reciclable; el recubrimiento (pintura en polvo, galvanizado) define su vida útil.', cost: 2, tip: 'Estructuras, patas y bastidores de mesa.' },
    { n: 'Acero inoxidable', c: 'Metales', props: ['Resistente a la corrosión', 'Higiénico y fácil de limpiar', 'Más difícil de trabajar que el acero común'], proc: ['Doblado y soldadura TIG', 'Pulido o cepillado', 'Corte láser'], sus: 'Larga vida útil y reciclable, aunque su producción consume mucha energía.', cost: 3, tip: 'Cocinas, laboratorios, exterior y salud.' },
    { n: 'Aluminio', c: 'Metales', props: ['Ligero: aprox. un tercio del peso del acero', 'No se oxida como el acero', 'Menos rígido a igual sección'], proc: ['Extrusión de perfiles', 'Fundición', 'Anodizado y pintura en polvo'], sus: 'Reciclarlo ahorra la mayor parte de la energía de producirlo nuevo; busca contenido reciclado.', cost: 3, tip: 'Mobiliario de exterior, sillas apilables y perfiles modulares.' },
    { n: 'Lámina perforada', c: 'Metales', props: ['Ligera y ventilada', 'Patrón visual y translúcido', 'Rigidez depende del doblez'], proc: ['Punzonado o corte láser', 'Plegado CNC', 'Pintura en polvo'], sus: 'Reciclable; diseñar con pliegues reduce espesor y material.', cost: 2, tip: 'Frentes ventilados, pantallas de luz y estantes.' },
    { n: 'Latón', c: 'Metales', props: ['Tono dorado', 'Se patina con el tiempo', 'Fácil de mecanizar'], proc: ['Torneado y fresado', 'Fundición', 'Pulido o barnizado'], sus: 'Muy reciclable; su valor hace que casi siempre se recupere.', cost: 4, tip: 'Herrajes, detalles, tiradores y uniones vistas.' },
    { n: 'Contrachapado de abedul', c: 'Tableros', props: ['Capas cruzadas muy estables', 'Canto rayado atractivo', 'Resistente para su espesor'], proc: ['Corte CNC y ensambles de encastre', 'Moldeado con calor y presión', 'Canto visto aceitado'], sus: 'Aprovecha bien la madera; elige adhesivos de baja emisión (E1 o mejor).', cost: 3, tip: 'Muebles planos, sillas moldeadas y sistemas modulares.' },
    { n: 'MDF', c: 'Tableros', props: ['Superficie muy lisa y homogénea', 'Pesado', 'Sensible a la humedad (salvo MDF hidrófugo)'], proc: ['Fresado y grabado CNC', 'Lacado', 'Enchapado'], sus: 'Usa fibras recuperadas, pero contiene resinas; prefiere versiones de bajo formaldehído.', cost: 1, tip: 'Frentes lacados, piezas fresadas y mobiliario interior.' },
    { n: 'Aglomerado melamínico', c: 'Tableros', props: ['Económico y estable', 'Acabado decorativo listo', 'Tornillos con poca sujeción repetida'], proc: ['Seccionado', 'Enchapado de cantos', 'Herrajes de ensamble rápido'], sus: 'Aprovecha residuos de madera; difícil de reciclar al final de su vida.', cost: 1, tip: 'Mobiliario de oficina y clósets en serie.' },
    { n: 'Tablero OSB', c: 'Tableros', props: ['Virutas orientadas visibles', 'Resistente para su costo', 'Textura cruda'], proc: ['Corte y atornillado', 'Sellado o barnizado', 'Uso en estructuras'], sus: 'Usa árboles de crecimiento rápido y casi todo el tronco.', cost: 1, tip: 'Interiores industriales, stands y prototipos a escala real.' },
    { n: 'Polipropileno (PP)', c: 'Plásticos', props: ['Flexible y resistente a la fatiga', 'Ligero', 'Permite bisagras vivas'], proc: ['Inyección', 'Termoformado', 'Corte de lámina'], sus: 'Reciclable (código 5); el contenido reciclado reduce su huella.', cost: 2, tip: 'Carcasas de silla, contenedores y piezas que flexionan.' },
    { n: 'Policarbonato', c: 'Plásticos', props: ['Transparente', 'Muy resistente al impacto', 'Se raya con facilidad'], proc: ['Inyección', 'Termoformado', 'Corte y doblado en frío'], sus: 'Durable pero complejo de reciclar; diseñar piezas desmontables ayuda.', cost: 3, tip: 'Sillas transparentes, mamparas y protectores.' },
    { n: 'Acrílico (PMMA)', c: 'Plásticos', props: ['Transparencia tipo vidrio', 'Más ligero que el vidrio', 'Frágil ante golpes fuertes'], proc: ['Corte y grabado láser', 'Doblado con calor', 'Pulido de cantos'], sus: 'Reciclable en circuitos especializados; evita mezclarlo con otros materiales.', cost: 2, tip: 'Exhibidores, señalética y piezas de luz.' },
    { n: 'PET reciclado (fieltro o lámina)', c: 'Plásticos', props: ['Absorbe sonido en forma de fieltro', 'Ligero', 'Colores sólidos'], proc: ['Termoformado de fieltro', 'Corte CNC o láser', 'Costura'], sus: 'Recupera botellas recicladas; revisa que el proveedor acredite el contenido reciclado.', cost: 2, tip: 'Paneles acústicos, separadores y tapizados.' },
    { n: 'Lino', c: 'Textiles', props: ['Fresco y transpirable', 'Arruga natural', 'Resistente en seco'], proc: ['Tapizado', 'Fundas desmontables', 'Tejido mixto con algodón'], sus: 'Requiere poca agua y pesticidas frente al algodón.', cost: 3, tip: 'Fundas, cojines y paneles textiles cálidos.' },
    { n: 'Lana', c: 'Textiles', props: ['Aislante térmico y acústico', 'Retardante natural al fuego', 'Elástica y resistente'], proc: ['Tapizado', 'Fieltro prensado', 'Tejido en telar'], sus: 'Renovable y biodegradable; revisa tintes y bienestar animal.', cost: 3, tip: 'Asientos de alto uso y paneles acústicos.' },
    { n: 'Cuero', c: 'Textiles', props: ['Muy durable', 'Desarrolla pátina', 'Varía según curtido'], proc: ['Corte y costura', 'Tensado sobre estructura', 'Repujado'], sus: 'El curtido vegetal evita el cromo; aprovecha subproducto de la industria alimentaria.', cost: 4, tip: 'Asientos tensados, correas y tiradores.' },
    { n: 'Fibras naturales (palma, ixtle, tule)', c: 'Textiles', props: ['Textura artesanal', 'Ligeras y transpirables', 'Sensibles a la humedad'], proc: ['Tejido a mano', 'Trenzado', 'Cestería sobre bastidor'], sus: 'Renovables y locales; trabajar con artesanos mantiene técnicas vivas y precios justos.', cost: 2, tip: 'Respaldos, asientos tejidos y pantallas de lámpara.' },
    { n: 'Aceite y cera natural', c: 'Acabados', props: ['Acabado mate que muestra la veta', 'Fácil de reparar', 'Protege menos contra manchas'], proc: ['Aplicación con trapo', 'Varias capas y lijado fino', 'Mantenimiento periódico'], sus: 'Bajo en compuestos volátiles si es de base vegetal.', cost: 1, tip: 'Maderas macizas que se tocan mucho.' },
    { n: 'Laca poliuretánica', c: 'Acabados', props: ['Alta resistencia a manchas y rayones', 'Brillo a elegir', 'Colores sólidos'], proc: ['Aplicación con pistola en cabina', 'Lijado entre capas', 'Secado controlado'], sus: 'Prefiere lacas de base agua con menos compuestos volátiles.', cost: 2, tip: 'Frentes de MDF, cocinas y piezas de color.' },
    { n: 'Pintura electrostática en polvo', c: 'Acabados', props: ['Capa gruesa y uniforme', 'Muy resistente al desgaste', 'Amplia gama de colores y texturas'], proc: ['Aplicación electrostática', 'Horneado', 'Preparación con fosfatizado'], sus: 'Casi sin compuestos volátiles; el polvo sobrante se recupera.', cost: 2, tip: 'Estructuras metálicas de interior y exterior.' },
    { n: 'Anodizado', c: 'Acabados', props: ['Capa protectora integrada al aluminio', 'Tonos metálicos', 'No se desprende como la pintura'], proc: ['Baño electroquímico', 'Coloreado', 'Sellado'], sus: 'No añade capas plásticas, lo que facilita reciclar el aluminio.', cost: 3, tip: 'Perfiles, herrajes y piezas de aluminio vistas.' },
  ];
  const COST = ['', 'Económico', 'Medio', 'Medio-alto', 'Alto'];
  let matCat = 'Madera', matQ = '';
  function renderMaterials() {
    const box = document.getElementById('matBody'); if (!box) return;
    const fav = get(MAT_FAV, []) || [], q = matQ.toLowerCase();
    const list = MATERIALS.filter(m => (matCat === 'Guardados' ? fav.includes(m.n) : !q ? m.c === matCat : true) && (!q || JSON.stringify(m).toLowerCase().includes(q)));
    box.querySelector('.mat-cats').innerHTML = [...CATS, 'Guardados'].map(c => `<button type="button" data-cat="${c}" aria-pressed="${c === matCat && !q}">${c === 'Guardados' ? '♥ Guardados (' + fav.length + ')' : c}</button>`).join('');
    box.querySelector('.mat-grid').innerHTML = list.length ? list.map(m => { const on = fav.includes(m.n); return `<article class="mat-card" data-c="${e(m.c)}"><div class="mat-top"><span class="gc-tag">${e(m.c)}</span><button type="button" class="mat-fav ${on ? 'on' : ''}" data-matfav="${e(m.n)}" aria-pressed="${on}" aria-label="${on ? 'Quitar de' : 'Guardar en'} mis materiales">${on ? '♥' : '♡'}</button></div><h4>${e(m.n)}</h4><p class="mat-tip">${e(m.tip)}</p>
      <dl><dt>Propiedades</dt><dd><ul>${m.props.map(p => `<li>${e(p)}</li>`).join('')}</ul></dd><dt>Procesos de fabricación</dt><dd><ul>${m.proc.map(p => `<li>${e(p)}</li>`).join('')}</ul></dd><dt>Sostenibilidad</dt><dd>${e(m.sus)}</dd><dt>Costo aproximado</dt><dd><span class="mat-cost" aria-label="${COST[m.cost]}">${'$'.repeat(m.cost)}<i>${'$'.repeat(4 - m.cost)}</i></span> ${COST[m.cost]}</dd></dl>
      ${lab({ kind: 'Material', title: m.n, summary: `${m.n} (${m.c}). Propiedades: ${m.props.join('; ')}. Procesos: ${m.proc.join('; ')}. Sostenibilidad: ${m.sus} Uso típico: ${m.tip}`, topic: 'Materiales' })}<button type="button" class="lab-trigger" data-duda="${e(JSON.stringify({ topic: 'Materiales', ref: { kind: 'Material', label: m.n, url: '/#atlas-materials' } }))}">＋ Duda</button></article>`; }).join('')
      : `<div class="wk-empty" style="grid-column:1/-1">${matCat === 'Guardados' ? 'Aún no guardas materiales. Toca ♡ en cualquier ficha.' : 'Ningún material coincide con tu búsqueda.'}</div>`;
  }

  // =============== 3. INSPIRATION DNA ===============
  function tally(arr) { const m = new Map(); arr.filter(Boolean).forEach(v => { const k = String(v).trim(); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); }
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  function dnaData() {
    const R = typeof RESOURCES !== 'undefined' ? RESOURCES : [], M = typeof MOOD_CATALOG !== 'undefined' ? MOOD_CATALOG : [];
    const favs = (get('tdl-fav', []) || []).map(u => R.find(r => r.url === u) || { url: u });
    const moods = (get('tdl-mood', []) || []).map(id => M.find(m => m.id === id)).filter(Boolean);
    const pals = (get(PAL, []) || []).filter(p => Array.isArray(p.colors));
    const mats = get(MAT_FAV, []) || [];
    const concepts = window.Lab ? Lab.list() : [];
    const notes = get('tdl-ideas', []) || [];
    const colors = [...moods.flatMap(m => m.colors || []), ...pals.flatMap(p => p.colors)].filter(isHex);
    const materials = tally([...moods.flatMap(m => m.materials || []), ...mats, ...mats, ...concepts.flatMap(c => c.create?.materials || [])]);
    const themes = tally([...favs.map(r => r.cat), ...moods.map(m => m.title), ...notes.flatMap(n => (n.tags || []).map(t => '#' + t)), ...concepts.map(c => c.source?.topic)]);
    const sources = tally([...favs.map(r => host(r.url)), ...concepts.map(c => c.source?.source || host(c.source?.url))]);
    return { colors, materials, themes, sources, counts: { favs: favs.length, moods: moods.length, pals: pals.length, mats: mats.length, concepts: concepts.length } };
  }
  function colorClusters(colors) {
    const m = new Map();
    colors.forEach(h => { const [r, g, b] = rgb(h), k = `${r >> 5}-${g >> 5}-${b >> 5}`, v = m.get(k) || { n: 0, r: 0, g: 0, b: 0 }; v.n++; v.r += r; v.g += g; v.b += b; m.set(k, v); });
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 8).map(v => ({ hex: hex(v.r / v.n, v.g / v.n, v.b / v.n), n: v.n }));
  }
  function styleLine(d, clusters) {
    const bits = [];
    if (clusters.length) {
      let warm = 0, light = 0, sat = 0, tot = 0;
      clusters.forEach(c => { const [h, s, l] = hsl(c.hex); const w = c.n; tot += w; if (s > .12 && (h < 75 || h > 300)) warm += w; light += l * w; sat += s * w; });
      bits.push(`una paleta ${warm / tot > .5 ? 'cálida' : 'fría'}, ${light / tot > .6 ? 'clara' : light / tot < .35 ? 'profunda' : 'de tonos medios'} y ${sat / tot > .45 ? 'vibrante' : 'suave'}`);
    }
    if (d.materials.length) bits.push(`materiales como ${d.materials.slice(0, 2).map(x => x[0].toLowerCase()).join(' y ')}`);
    if (d.themes.length) bits.push(`temas de ${d.themes.slice(0, 2).map(x => x[0]).join(' y ')}`);
    return bits.length ? `Te atrae ${bits.join(', ')}.` : '';
  }
  function bars(rows, color) {
    if (!rows.length) return '<p class="gym-hint">Todavía no hay datos aquí.</p>';
    const max = rows[0][1];
    return `<ul class="dna-bars">${rows.slice(0, 6).map(([k, v]) => `<li><span class="dna-k">${e(k)}</span><span class="dna-track"><i style="width:${Math.max(6, v / max * 100)}%;background:${color}"></i></span><b>${v}</b></li>`).join('')}</ul>`;
  }
  function renderDNA() {
    const box = document.getElementById('dnaRoot'); if (!box) return;
    const d = dnaData(), cl = colorClusters(d.colors), total = Object.values(d.counts).reduce((a, b) => a + b, 0);
    const c = d.counts;
    box.innerHTML = `<div class="dna">
      <div class="dna-hero"><div><span class="gc-tag">Inspiration DNA</span><h3>${total ? 'Tu estilo, según lo que guardas' : 'Tu ADN empieza aquí'}</h3><p class="dna-line">${total ? e(styleLine(d, cl) || 'Guarda un poco más para descubrir tu estilo.') : 'Guarda recursos con ♡, moodboards, materiales o paletas de tus fotos y aquí verás qué colores, materiales, temas y fuentes se repiten en tu mirada.'}</p></div>
      <div class="dna-strand" aria-hidden="true">${(cl.length ? cl : [{ hex: '#e8d9a8', n: 1 }, { hex: '#b8674f', n: 1 }, { hex: '#a8b49a', n: 1 }, { hex: '#547ca2', n: 1 }]).map((x, i) => `<i style="background:${x.hex};--d:${i}"></i>`).join('')}</div></div>
      <div class="dna-counts">${[['Favoritos', c.favs, '#biblioteca'], ['Moodboards', c.moods, '#moodboards'], ['Paletas', c.pals, '#atlas-palette'], ['Materiales', c.mats, '#atlas-materials'], ['Fichas de concepto', c.concepts, '/cuaderno#fichas']].map(([l, n, h]) => `<a href="${h}"><b>${n}</b><span>${l}</span></a>`).join('')}</div>
      <div class="dna-grid">
        <section class="dna-card"><h4>Colores</h4>${cl.length ? `<div class="dna-colors">${cl.map(x => `<button type="button" data-copy="${x.hex}" style="--c:${x.hex};flex:${x.n};color:${textOn(x.hex)}" aria-label="Copiar ${x.hex}, aparece ${x.n} veces"><b>${x.hex.toUpperCase()}</b></button>`).join('')}</div><p class="gym-hint">De tus moodboards y paletas guardadas. El ancho indica cuánto se repite. Toca para copiar.</p>` : '<p class="gym-hint">Guarda un moodboard o una paleta de tus fotos.</p>'}</section>
        <section class="dna-card"><h4>Materiales</h4>${bars(d.materials, '#b8674f')}</section>
        <section class="dna-card"><h4>Temas</h4>${bars(d.themes, '#2f6b55')}</section>
        <section class="dna-card"><h4>Fuentes</h4>${bars(d.sources, '#547ca2')}</section>
      </div></div>`;
  }

  // =============== shell + events ===============
  const atlas = document.getElementById('atlasRoot');
  if (atlas) {
    atlas.innerHTML = `<section class="gym-block" id="atlas-palette" style="--g:#b8674f"><header><b>1</b><div><h3>Paleta desde mis fotos</h3><p>Sube una imagen y obtén sus 5 colores principales con códigos HEX.</p></div></header><input type="file" accept="image/*" hidden data-file aria-hidden="true" tabindex="-1"><div id="palBody"></div></section>
      <section class="gym-block" id="atlas-materials" style="--g:#2f6b55"><header><b>2</b><div><h3>Biblioteca de materiales</h3><p>${MATERIALS.length} fichas de madera, metales, tableros, plásticos, textiles y acabados. Los costos son relativos y aproximados: varían según proveedor, región y espesor.</p></div></header><div id="matBody"><div class="mat-tools"><div class="mat-cats" role="group" aria-label="Categorías de materiales"></div><input type="search" placeholder="Buscar: exterior, ligero, reciclable…" aria-label="Buscar materiales" data-matq></div><div class="mat-grid"></div></div></section>`;
    renderPalette(); renderMaterials();
    atlas.closest('section').querySelectorAll('.gym-tabs a').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    atlas.addEventListener('click', ev => {
      const t = ev.target.closest('[data-pick],[data-copy],[data-copyall],[data-copyset],[data-delpal],[data-cat],[data-matfav]'); if (!t) return;
      if (t.matches('[data-pick]')) atlas.querySelector('[data-file]').click();
      else if (t.dataset.copy) copy(t.dataset.copy, t.dataset.copy);
      else if (t.matches('[data-copyall]')) copy(current.colors.map(c => c.hex).join(', '), 'paleta');
      else if (t.dataset.copyset) copy(t.dataset.copyset, 'paleta');
      else if (t.dataset.delpal) { if (!confirm('¿Borrar esta paleta?')) return; put(PAL, (get(PAL, []) || []).filter(p => p.id !== t.dataset.delpal)); renderPalette(); renderDNA(); }
      else if (t.dataset.cat) { matCat = t.dataset.cat; matQ = ''; atlas.querySelector('[data-matq]').value = ''; renderMaterials(); }
      else if (t.dataset.matfav) { const f = get(MAT_FAV, []) || [], n = t.dataset.matfav; put(MAT_FAV, f.includes(n) ? f.filter(x => x !== n) : [...f, n]); renderMaterials(); renderDNA(); say(f.includes(n) ? 'Material quitado' : '♥ Material guardado'); }
    });
    atlas.addEventListener('keydown', ev => { if (ev.target.matches('.pal-drop') && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); atlas.querySelector('[data-file]').click(); } });
    atlas.addEventListener('change', ev => { if (ev.target.matches('[data-file]')) { handleFile(ev.target.files[0]); ev.target.value = ''; } });
    atlas.addEventListener('input', ev => { if (ev.target.matches('[data-matq]')) { matQ = ev.target.value.trim(); renderMaterials(); } });
    atlas.addEventListener('dragover', ev => { if (ev.target.closest('.pal-drop')) { ev.preventDefault(); ev.target.closest('.pal-drop').classList.add('over'); } });
    atlas.addEventListener('dragleave', ev => ev.target.closest('.pal-drop')?.classList.remove('over'));
    atlas.addEventListener('drop', ev => { if (ev.target.closest('.pal-drop')) { ev.preventDefault(); handleFile(ev.dataTransfer.files[0]); } });
    atlas.addEventListener('submit', ev => {
      if (!ev.target.matches('[data-save]') || !current) return; ev.preventDefault();
      const all = get(PAL, []) || [], name = ev.target.n.value.trim() || 'Mi paleta ' + (all.length + 1);
      all.push({ id: uid(), name: name.slice(0, 60), date: dateFmt.format(new Date()), colors: current.colors.map(c => c.hex), thumb: current.thumb });
      if (put(PAL, all)) { say('♡ Paleta guardada'); current = null; renderPalette(); renderDNA(); }
    });
  }
  const dna = document.getElementById('dnaRoot');
  if (dna) { renderDNA(); dna.addEventListener('click', ev => { const b = ev.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b.dataset.copy); }); }
  // Refresh DNA when other parts of the page save something.
  ['click', 'change'].forEach(t => document.addEventListener(t, ev => { if (ev.target.closest?.('[data-fav],[data-mood],#importFile')) setTimeout(renderDNA, 300); }));
  document.addEventListener('lab:change', renderDNA);
  window.addEventListener('storage', renderDNA);
  window.addEventListener('hashchange', () => { if (location.hash === '#guardados') renderDNA(); });
})();
