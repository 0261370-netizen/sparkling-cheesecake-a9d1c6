// CREATIVE GYM — Creative Connections, Design Detective, weekly challenge and creative streak.
// Everything personal stays in this browser (localStorage), like the rest of the library.
(() => {
  'use strict';
  const root = document.getElementById('gymRoot');
  if (!root) return;
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { say('No se pudo guardar en este navegador'); return false; } };
  const say = m => (typeof toast === 'function' ? toast(m) : null);
  const lab = o => (window.labButton ? labButton(o) : '');

  // ---- Dates (America/Mexico_City) ----
  const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dayKey = (d = new Date()) => keyFmt.format(d);
  const toUTC = k => new Date(k + 'T12:00:00Z');
  const addDays = (k, n) => { const d = toUTC(k); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const dayNum = k => Math.floor(toUTC(k).getTime() / 864e5);
  const weekday = k => (toUTC(k).getUTCDay() + 6) % 7; // 0 = lunes … 6 = domingo
  const mondayOf = k => addDays(k, -weekday(k));
  const nice = (k, o = { day: 'numeric', month: 'long' }) => new Intl.DateTimeFormat('es-MX', { ...o, timeZone: 'UTC' }).format(toUTC(k));
  const today = dayKey();
  // Ids created by the notebook/lab start with Date.now() in base 36.
  const tsOfId = id => { const n = parseInt(String(id || '').slice(0, -5), 36); return n > 1.5e12 && n < 4e12 ? n : 0; };

  // Seeded random so a day/week always shows the same pick.
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const shuffle = (a, r = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const CHECK = ['Materiales: ¿qué material real lo permite y cuál es su espesor mínimo?', 'Cargas: ¿qué peso, golpes o uso diario debe resistir?', 'Procesos: ¿con qué máquinas o técnicas se fabricaría en serie?', 'Costos: ¿cuánto material, horas y herrajes implica frente a una solución común?'];

  // ---------------- 1. CREATIVE CONNECTIONS ----------------
  const CONNECTIONS = [
    { refs: ['Coral', 'Estación de trabajo'], q: ['El coral crece por acumulación de módulos pequeños: ¿cómo crecería una estación de trabajo si se añaden piezas con el tiempo?', '¿Qué parte del puesto necesita estructura rígida y cuál podría ser porosa, como el esqueleto calcáreo?', '¿Dónde pasarían cables, aire o luz si el mueble tuviera cavidades como un arrecife?'] },
    { refs: ['Hoja de loto', 'Acabado superficial'], q: ['La hoja repele el agua por su microtextura, no por un recubrimiento: ¿qué textura podrías grabar o moldear en una cubierta?', '¿En qué superficies de mobiliario importa más que la suciedad no se adhiera (cocina, exterior, hospital)?', '¿Cómo comprobarías el efecto con una muestra pequeña antes de aplicarlo a una pieza completa?'] },
    { refs: ['Andamio', 'Biblioteca modular'], q: ['¿Qué tiene la unión de un andamio (abrazadera, tubo, nudo) que permite montarlo sin herramientas?', '¿Cómo cambiaría la biblioteca si la estructura quedara a la vista y los estantes fueran intercambiables?', '¿Qué módulo mínimo se repetiría y cuántas piezas distintas necesitarías en total?'] },
    { refs: ['Silla Bauhaus', 'Proceso de fabricación actual'], q: ['¿Qué idea de la silla original (tubo curvado, estructura mínima) sigue vigente y qué se volvería distinto con corte láser, impresión 3D o CNC?', '¿Qué paso de fabricación del original podrías eliminar con la tecnología actual?', '¿Cómo respetarías la ligereza visual si cambias el material?'] },
    { refs: ['Sobrante de tablero', 'Mueble multifuncional'], q: ['¿Qué medidas tienen los recortes que normalmente se desechan en un taller y qué piezas caben en ellas?', '¿Qué dos funciones podría alternar el mueble (asiento y mesa, estante y biombo) usando solo piezas pequeñas?', '¿Cómo se unirían las piezas: ensamble, herraje o encastre, y cómo se verían los cantos?'] },
    { refs: ['Panal de abeja', 'Puerta de clóset'], q: ['¿Cómo aligera la celda hexagonal un panel sin perder rigidez?', '¿Dejarías el panal visible, cubierto o translúcido?', '¿Qué pasaría con las bisagras y el peso si la puerta es mucho más ligera?'] },
    { refs: ['Origami', 'Luminaria', 'Lámina metálica'], q: ['¿Qué pliegue simple genera más rigidez en una lámina delgada?', '¿Cómo cambia la luz al reflejarse en caras dobladas con distintos ángulos?', '¿Qué radio de doblez mínimo permite el metal sin agrietarse?'] },
    { refs: ['Raíz de árbol', 'Base de mesa'], q: ['¿Cómo reparten las raíces el peso hacia varios puntos de apoyo?', '¿Cuántas patas o ramificaciones necesita la base para ser estable en un piso irregular?', '¿Qué material permite ramificar sin uniones visibles?'] },
    { refs: ['Cesto tejido', 'Asiento de espera'], q: ['¿Qué aporta el tejido (flexibilidad, ventilación, textura) a un asiento de uso público?', '¿Cómo resistiría el desgaste y la limpieza diaria?', '¿Se puede tejer con un material industrial como cinta de PET o cable de acero?'] },
    { refs: ['Caparazón de tortuga', 'Mueble de exterior'], q: ['¿Cómo protege el caparazón con placas separadas por juntas flexibles?', '¿Qué partes del mueble deben resistir sol y lluvia y cuáles pueden ser reemplazables?', '¿Cómo drenaría el agua una superficie hecha de placas?'] },
    { refs: ['Mapa de metro', 'Sistema de estantería'], q: ['¿Qué reglas gráficas del mapa (líneas a 45°, nodos) podrías traducir a una estructura?', '¿Qué serían las "estaciones": cajones, repisas, iluminación?', '¿Cómo crecería el sistema sin perder orden visual?'] },
    { refs: ['Cáscara de huevo', 'Silla de una sola pieza'], q: ['¿Por qué una cáscara curva tan delgada soporta tanta presión?', '¿Qué curvatura mínima necesitaría el asiento para no flexionarse?', '¿Qué proceso (rotomoldeo, termoformado, contrachapado moldeado) haría posible la pieza única?'] },
  ];
  let surprise = null;
  const connIndex = dayNum(today) % CONNECTIONS.length;

  function surprisePool() {
    const out = [];
    const R = typeof RESOURCES !== 'undefined' ? RESOURCES : [];
    const M = typeof MOOD_CATALOG !== 'undefined' ? MOOD_CATALOG : [];
    const fav = new Set(get('tdl-fav', []) || []);
    R.forEach(r => out.push({ title: r.title, from: fav.has(r.url) ? 'Mis guardados' : 'El gran archivo', cat: r.cat, url: r.url, saved: fav.has(r.url) }));
    (get('tdl-mood', []) || []).forEach(id => { const m = M.find(x => x.id === id); if (m) out.push({ title: 'Moodboard ' + m.title, from: 'Mis guardados', cat: 'Moodboard', saved: true }); });
    return out;
  }
  function makeSurprise() {
    const pool = surprisePool(); if (pool.length < 2) return null;
    const n = Math.random() < .5 ? 2 : 3, saved = shuffle(pool.filter(p => p.saved)), picks = [];
    if (saved.length) picks.push(saved[0]);
    for (const p of shuffle(pool)) { if (picks.length >= n) break; if (!picks.includes(p) && !picks.some(x => x.cat === p.cat)) picks.push(p); }
    const [a, b, c] = picks.map(p => p.title);
    const q = [`¿Qué tiene «${a}» que le falta a «${b}»? Escribe una sola cualidad: forma, material, gesto o forma de uso.`, `Imagina «${b}» construido con la lógica de «${a}»: ¿qué cambiaría primero, la estructura, la superficie o la manera de usarlo?`];
    if (c) q.push(`¿Qué aporta «${c}» que resuelva el conflicto entre las otras dos?`); else q.push('¿Para qué usuario y en qué lugar tendría sentido esta mezcla?');
    return { refs: picks, q };
  }

  function connectionCard(c, tag) {
    const names = c.refs.map(r => typeof r === 'string' ? r : r.title);
    const title = names.join(' + ');
    return `<article class="gc-card"><span class="gc-tag">${e(tag)}</span><div class="gc-chain">${c.refs.map(r => `<span>${e(typeof r === 'string' ? r : r.title)}${typeof r === 'object' ? `<small>${e(r.from)}</small>` : ''}</span>`).join('<i>+</i>')}</div>
      <h4>Preguntas para experimentar</h4><ol class="gc-q">${c.q.map(x => `<li>${e(x)}</li>`).join('')}</ol>
      <details class="gc-check"><summary>Antes de decir que funciona, analiza: materiales · cargas · procesos · costos</summary><ul>${CHECK.map(x => `<li>${e(x)}</li>`).join('')}</ul><p>Esta combinación es un punto de partida para experimentar, no una solución comprobada.</p></details>
      <div class="gc-actions">${lab({ kind: 'Creative Connection', title, summary: 'Combinación improbable para experimentar: ' + title + '. ' + c.q.join(' '), topic: 'Creative Connections' })}</div></article>`;
  }
  function renderConnections() {
    const box = root.querySelector('#gym-connections .gc-body');
    const list = CONNECTIONS.map((c, i) => `<button type="button" class="gc-pill${i === connIndex && !surprise ? ' on' : ''}" data-conn="${i}">${e(c.refs.join(' + '))}</button>`).join('');
    const chosen = surprise ? connectionCard(surprise, '✦ Surprise Me') : connectionCard(CONNECTIONS[box.dataset.i ?? connIndex], 'Combinación ' + (Number(box.dataset.i ?? connIndex) + 1) + ' de ' + CONNECTIONS.length);
    box.innerHTML = `<div class="gc-layout"><div>${chosen}</div><aside class="gc-side"><button type="button" class="gc-surprise" data-surprise>✦ Surprise Me</button><p class="gym-hint">Elige 2 o 3 referencias al azar de tu archivo y tus guardados.</p><h4>O elige una combinación</h4><div class="gc-pills">${list}</div></aside></div>`;
  }

  // ---------------- 2. DESIGN DETECTIVE ----------------
  const OBJECTS = [
    { name: 'Silla Wassily (B3)', type: 'Silla', designer: 'Marcel Breuer', era: '1920s', year: '1925', material: 'Tubo de acero y cuero', clue: 'Su autor se inspiró, según la historia, en el manillar de una bicicleta.', story: 'Marcel Breuer la diseñó en la Bauhaus en 1925. Fue una de las primeras sillas de tubo de acero curvado: una estructura ligera y casi transparente con asiento y respaldo de tela o cuero tensados.' },
    { name: 'Silla Panton', type: 'Silla', designer: 'Verner Panton', era: '1960s', year: '1960 (producción 1967)', material: 'Plástico moldeado de una pieza', clue: 'Es una silla en voladizo sin patas traseras, hecha de una sola pieza.', story: 'Verner Panton la dibujó a finales de los años cincuenta y se produjo en 1967 con Vitra. Fue la primera silla en voladizo de plástico moldeado en una sola pieza, sin uniones ni piezas añadidas.' },
    { name: 'Lounge Chair & Ottoman', type: 'Sillón', designer: 'Charles y Ray Eames', era: '1950s', year: '1956', material: 'Contrachapado moldeado y cuero', clue: 'Sus autores querían la calidez de un viejo guante de béisbol.', story: 'Los Eames la presentaron en 1956 con Herman Miller. Combina carcasas de contrachapado moldeado, cojines de cuero y una base giratoria de aluminio.' },
    { name: 'Silla Tulip', type: 'Silla', designer: 'Eero Saarinen', era: '1950s', year: '1955–1956', material: 'Fibra de vidrio y aluminio fundido', clue: 'Su autor quería acabar con el "bosque de patas" bajo las mesas.', story: 'Eero Saarinen diseñó la familia Pedestal para Knoll. Una sola base de aluminio sostiene la carcasa, pensada como un todo visual sin patas.' },
    { name: 'Silla Nº 14', type: 'Silla', designer: 'Michael Thonet', era: '1850s', year: '1859', material: 'Madera de haya curvada al vapor', clue: 'Se enviaba desarmada: varias sillas cabían en una caja pequeña.', story: 'Michael Thonet perfeccionó el curvado de la haya al vapor. La Nº 14 tiene pocas piezas y unos tornillos, y se fabricó en millones de unidades: es uno de los primeros muebles industriales.' },
    { name: 'Silla Barcelona', type: 'Silla', designer: 'Ludwig Mies van der Rohe y Lilly Reich', era: '1920s', year: '1929', material: 'Acero y cuero', clue: 'Fue creada para un pabellón nacional en una exposición internacional.', story: 'Se diseñó para el Pabellón Alemán de la Exposición Internacional de Barcelona de 1929. Sus patas en X de acero evocan las sillas curules de la antigüedad.' },
    { name: 'Lámpara Arco', type: 'Lámpara', designer: 'Achille y Pier Giacomo Castiglioni', era: '1960s', year: '1962', material: 'Mármol y acero inoxidable', clue: 'Lleva la luz al centro de la mesa sin colgar del techo.', story: 'Los hermanos Castiglioni la diseñaron para Flos. Una base de mármol pesada equilibra un arco de acero. La base tiene un orificio para pasar un palo y moverla entre dos personas.' },
    { name: 'Taburete 60', type: 'Taburete', designer: 'Alvar Aalto', era: '1930s', year: '1933', material: 'Madera de abedul curvada', clue: 'Sus patas se doblan en forma de L gracias a ranuras en la madera.', story: 'Alvar Aalto desarrolló una técnica para curvar el abedul macizo cortando y encolando láminas en la zona del doblez. El taburete es apilable y sigue en producción desde 1933.' },
    { name: 'Butaque', type: 'Sillón', designer: 'Clara Porset', era: '1940s', year: 'décadas de 1940–1950', material: 'Madera y fibras naturales', clue: 'Es una diseñadora que reinterpretó un asiento tradicional de México.', story: 'Clara Porset estudió el butaque, un asiento bajo de origen colonial y popular en México, y lo transformó en una pieza moderna de líneas limpias. Usó maderas y tejidos de artesanos locales.' },
    { name: 'Silla Egg', type: 'Sillón', designer: 'Arne Jacobsen', era: '1950s', year: '1958', material: 'Espuma sobre carcasa de fibra de vidrio, tapizada', clue: 'Fue creada para el vestíbulo de un hotel en Copenhague.', story: 'Arne Jacobsen la diseñó para el hotel SAS Royal de Copenhague, del que también fue arquitecto. Su carcasa envolvente da privacidad en un espacio público.' },
    { name: 'Exprimidor Juicy Salif', type: 'Objeto', designer: 'Philippe Starck', era: '1990s', year: '1990', material: 'Aluminio fundido', clue: 'Su primer boceto nació, según la leyenda, en una servilleta de restaurante.', story: 'Philippe Starck lo diseñó para Alessi. Con sus tres patas largas parece un insecto, y se convirtió en un icono del diseño como objeto de conversación más que de uso.' },
    { name: 'Silla Red and Blue', type: 'Silla', designer: 'Gerrit Rietveld', era: '1910s', year: '1917–1918 (color en 1923)', material: 'Madera pintada', clue: 'Está hecha con listones y tableros estándar, y sus colores llegaron años después.', story: 'Gerrit Rietveld la construyó con piezas de madera estándar. Al pintarla con colores primarios se convirtió en un manifiesto del movimiento De Stijl.' },
    { name: 'Silla Wishbone (CH24)', type: 'Silla', designer: 'Hans J. Wegner', era: '1940s', year: '1949', material: 'Madera maciza y cuerda de papel', clue: 'Su respaldo en forma de Y le da nombre.', story: 'Hans J. Wegner se inspiró en retratos de mercaderes daneses sentados en sillas chinas de la dinastía Ming. Su asiento se teje a mano con unos 120 metros de cuerda de papel.' },
    { name: 'Lámparas Akari', type: 'Lámpara', designer: 'Isamu Noguchi', era: '1950s', year: '1951', material: 'Papel washi y bambú', clue: 'Su nombre significa "luz" en japonés y se pliegan para guardarse.', story: 'Isamu Noguchi las desarrolló con artesanos de Gifu, en Japón, a partir de las linternas de papel tradicionales. Hizo más de cien modelos.' },
    { name: 'Puf Sacco', type: 'Asiento', designer: 'Piero Gatti, Cesare Paolini y Franco Teodoro', era: '1960s', year: '1968', material: 'Bolitas de poliestireno en una funda', clue: 'No tiene forma fija: se adapta a quien se sienta.', story: 'Los tres diseñadores italianos lo presentaron con Zanotta en 1968. Es un asiento informal que toma la forma del cuerpo y cuestionó la idea de silla rígida.' },
    { name: 'Silla Superleggera', type: 'Silla', designer: 'Gio Ponti', era: '1950s', year: '1957', material: 'Madera de fresno y asiento tejido', clue: 'Pesa menos de dos kilos y, según la historia, sobrevivía a caídas desde varios pisos.', story: 'Gio Ponti refinó la silla tradicional de Chiavari para Cassina hasta llevarla al mínimo, con patas de sección triangular muy delgadas.' },
    { name: 'Silla Paimio (Nº 41)', type: 'Sillón', designer: 'Alvar Aalto', era: '1930s', year: '1931–1932', material: 'Contrachapado de abedul curvado', clue: 'Fue diseñada para pacientes con tuberculosis.', story: 'Aalto la creó para el sanatorio de Paimio, en Finlandia. Su inclinación pretendía facilitar la respiración, y el asiento de contrachapado de una sola lámina curvada era una innovación técnica.' },
    { name: 'Silla Louis Ghost', type: 'Silla', designer: 'Philippe Starck', era: '2000s', year: '2002', material: 'Policarbonato inyectado', clue: 'Tiene la silueta de una silla de época, pero es transparente.', story: 'Starck la diseñó para Kartell: reinterpreta una silla de estilo Luis XVI en una sola pieza de policarbonato transparente moldeado por inyección.' },
  ];
  const DET_KEY = 'tdl-detective';
  const QS = [['designer', '¿Quién la diseñó?'], ['era', '¿De qué época es?'], ['material', '¿De qué material es?']];
  function detectiveOf(k) {
    const r = rng(dayNum(k) * 7919);
    const o = OBJECTS[dayNum(k) % OBJECTS.length];
    const opts = {};
    QS.forEach(([f]) => { const others = shuffle([...new Set(OBJECTS.map(x => x[f]).filter(v => v !== o[f]))], r).slice(0, 2); opts[f] = shuffle([o[f], ...others], r); });
    return { o, opts };
  }
  function renderDetective() {
    const box = root.querySelector('#gym-detective .gc-body'), all = get(DET_KEY, {}) || {}, st = all[today] || { picks: {}, revealed: false };
    const { o, opts } = detectiveOf(today);
    const score = Object.values(all).reduce((n, d) => n + (d.correct || 0), 0), played = Object.values(all).filter(d => d.revealed).length;
    box.innerHTML = `<div class="dt-layout"><div class="dt-card"><span class="gc-tag">Caso del ${e(nice(today))}</span><div class="dt-mystery" aria-hidden="true">${st.revealed ? '✓' : '?'}</div><p class="dt-type">${e(o.type)} icónico</p><h4>${st.revealed ? e(o.name) : 'Objeto misterioso'}</h4><p class="dt-clue"><b>Pista:</b> ${e(o.clue)}</p></div>
      <div class="dt-qs">${QS.map(([f, label]) => `<fieldset><legend>${label}</legend><div class="dt-opts">${opts[f].map(v => { const picked = st.picks[f] === v, right = v === o[f]; const cls = st.revealed ? (right ? 'ok' : picked ? 'bad' : '') : picked ? 'on' : ''; return `<button type="button" class="${cls}" data-pick="${f}" data-v="${e(v)}" ${st.revealed ? 'disabled' : ''} aria-pressed="${picked}">${e(v)}${st.revealed && right ? ' ✓' : ''}${st.revealed && picked && !right ? ' ✗' : ''}</button>`; }).join('')}</div></fieldset>`).join('')}
      ${st.revealed ? `<div class="dt-reveal"><span class="gc-tag">Acertaste ${st.correct} de 3</span><h4>${e(o.name)}</h4><p class="dt-meta">${e(o.designer)} · ${e(o.year)} · ${e(o.material)}</p><p>${e(o.story)}</p>${lab({ kind: 'Design Detective', title: `${o.name} — ${o.designer}`, summary: `${o.story} Material: ${o.material}. Año: ${o.year}.`, topic: o.type })}</div>` : `<button type="button" class="gc-surprise" data-reveal>Revelar la respuesta</button><p class="gym-hint">Elige una opción en cada pregunta (o las que quieras) y revela el caso.</p>`}
      <p class="gym-hint">Casos resueltos: ${played} · Aciertos totales: ${score}. Mañana habrá un objeto nuevo.</p></div></div>`;
  }

  // ---------------- 3. RETO SEMANAL ----------------
  const WEEKLY = [
    { title: 'Una silla con un solo material', brief: 'Diseña una silla usando un único material, sin tornillos ni pegamento visibles.', constraints: ['Máximo 5 piezas', 'Dibuja la unión más difícil a escala 1:1', 'Indica cómo se apila o guarda'] },
    { title: 'Mueble de 60 × 60 cm', brief: 'Un mueble para un departamento pequeño que no ocupe más de 60 × 60 cm de piso y tenga dos funciones.', constraints: ['Dos funciones claras', 'Un movimiento (girar, plegar o deslizar)', 'Boceto en uso y guardado'] },
    { title: 'Copia la naturaleza, no la forma', brief: 'Elige un organismo y traduce su principio (no su apariencia) a una unión o superficie de mobiliario.', constraints: ['Nombra el principio en una frase', 'Sin formas literales de hojas o animales', '3 bocetos de evolución'] },
    { title: 'Rediseña un objeto de tu casa', brief: 'Toma un objeto cotidiano que te moleste usar y rediseña solo la parte que falla.', constraints: ['Foto o dibujo del original', 'Explica el problema en una línea', 'Cambia una sola cosa'] },
    { title: 'Diseño con sobrantes', brief: 'Imagina que solo tienes recortes de tablero de máximo 30 cm. Crea un objeto útil para una oficina.', constraints: ['Ninguna pieza mayor a 30 cm', 'Usa al menos 6 piezas', 'Calcula cuántos recortes usarías'] },
    { title: 'Lámpara de una lámina', brief: 'Diseña una lámpara a partir de una sola lámina (papel, metal o madera) cortada y doblada.', constraints: ['Una sola lámina', 'Dibuja el desplegado plano', 'Muestra cómo sale la luz'] },
    { title: 'El mueble que se arma sin herramientas', brief: 'Diseña un estante que cualquier persona pueda armar en menos de 5 minutos sin herramientas.', constraints: ['Cero herramientas', 'Instrucciones en 4 dibujos', 'Explica qué lo hace estable'] },
    { title: 'Un color, tres texturas', brief: 'Elige un solo color y diseña una pieza donde tres texturas distintas comuniquen su uso.', constraints: ['Un solo color', 'Tres texturas con función', 'Muestras de material o dibujo de detalle'] },
    { title: 'Asiento para esperar', brief: 'Diseña un asiento para una sala de espera pública: cómodo 20 minutos y fácil de limpiar.', constraints: ['Uso intenso', 'Sin rincones donde se acumule suciedad', 'Vista de perfil a escala'] },
    { title: 'Inspírate en un oficio', brief: 'Escoge un oficio artesanal mexicano (cestería, barro, herrería, laca) y aplícalo a una pieza contemporánea.', constraints: ['Nombra a la técnica y su región', 'Una pieza producible en serie', 'Detalle de la técnica'] },
    { title: 'Mueble que crece', brief: 'Diseña un mueble para un niño que se transforme y siga siendo útil cuando crezca.', constraints: ['Dos etapas de uso', 'Mismas piezas en ambas', 'Seguridad: sin pellizcos ni vuelcos'] },
    { title: 'Detalle 1:1', brief: 'Esta semana no diseñes un mueble completo: diseña una unión perfecta entre dos materiales distintos.', constraints: ['Dos materiales', 'Dibujo a escala real', 'Explica cómo se monta y desmonta'] },
  ];
  const DONE_KEY = 'tdl-gym-done';
  const weekStart = mondayOf(today), weekIdx = Math.floor((dayNum(weekStart) - 4) / 7);
  const thisWeek = WEEKLY[((weekIdx % WEEKLY.length) + WEEKLY.length) % WEEKLY.length];
  function weekSketches() {
    const out = [];
    (get('tdl-sketches', []) || []).forEach(s => { const t = tsOfId(s.id); if (t && s.img && dayKey(new Date(t)) >= weekStart) out.push({ img: s.img, title: s.title, day: dayKey(new Date(t)), from: 'Cuaderno' }); });
    (window.Lab ? Lab.list() : []).forEach(c => { if (c.create?.sketches?.length && dayKey(new Date(c.updated || c.created)) >= weekStart) c.create.sketches.forEach(img => out.push({ img, title: Lab.nameOf(c), day: dayKey(new Date(c.updated || c.created)), from: 'Ficha' })); });
    return out.sort((a, b) => a.day < b.day ? -1 : 1);
  }
  function renderWeekly() {
    const box = root.querySelector('#gym-weekly .gc-body'), done = get(DONE_KEY, {}) || {}, sk = weekSketches(), isSunday = weekday(today) === 6;
    const doneToday = !!done[today], weekDone = Object.keys(done).filter(k => k >= weekStart && done[k]?.weekly).length;
    box.innerHTML = `<div class="wk-layout"><article class="wk-card"><span class="gc-tag">Semana del ${e(nice(weekStart))} · nuevo cada lunes</span><h4>${e(thisWeek.title)}</h4><p>${e(thisWeek.brief)}</p><ul>${thisWeek.constraints.map(c => `<li>${e(c)}</li>`).join('')}</ul>
      <div class="gc-actions"><a class="gc-btn" href="/cuaderno#bocetos">✐ Dibujar en mi cuaderno</a><button type="button" class="gc-btn ${doneToday ? 'done' : 'ghost'}" data-done aria-pressed="${doneToday}">${doneToday ? '✓ Hoy trabajé en el reto' : 'Marcar: hoy trabajé en el reto'}</button>${lab({ kind: 'Reto semanal', title: thisWeek.title, summary: thisWeek.brief + ' Restricciones: ' + thisWeek.constraints.join('; '), topic: 'Creative Gym' })}</div>
      <div class="wk-days">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => { const k = addDays(weekStart, i); const on = done[k] || sk.some(s => s.day === k); return `<span class="${on ? 'on' : ''} ${k === today ? 'now' : ''}" title="${e(nice(k))}">${d}</span>`; }).join('')}</div>
      <p class="gym-hint">${weekDone} día${weekDone === 1 ? '' : 's'} marcado${weekDone === 1 ? '' : 's'} esta semana.</p></article>
      <div class="wk-gallery"><h4>${isSunday ? '☀ Galería del domingo' : 'Galería de la semana'}</h4><p class="gym-hint">${isSunday ? 'Tu semana en bocetos. Mira lo que cambió entre el lunes y hoy.' : `La galería se abre el domingo ${e(nice(addDays(weekStart, 6)))}. Llevas ${sk.length} boceto${sk.length === 1 ? '' : 's'} esta semana.`}</p>
      ${sk.length ? `<div class="wk-grid ${isSunday ? '' : 'preview'}">${(isSunday ? sk : sk.slice(-3)).map(s => `<figure><img src="${e(s.img)}" alt="${e(s.title)}" loading="lazy"><figcaption>${e(s.title)}<small>${e(nice(s.day, { weekday: 'short', day: 'numeric' }))} · ${e(s.from)}</small></figcaption></figure>`).join('')}</div>` : '<div class="wk-empty">Aún no hay bocetos esta semana. Dibuja en el cuaderno o en el laboratorio y aparecerán aquí.</div>'}</div></div>`;
  }

  // ---------------- 4. RACHA CREATIVA ----------------
  function activeDays() {
    const set = new Set(Object.keys(get(DONE_KEY, {}) || {}));
    (get('tdl-sketches', []) || []).forEach(s => { const t = tsOfId(s.id); if (t) set.add(dayKey(new Date(t))); });
    return set;
  }
  function renderStreak() {
    const box = root.querySelector('#gym-streak .gc-body'), days = activeDays();
    let k = days.has(today) ? today : addDays(today, -1), cur = 0;
    while (days.has(k)) { cur++; k = addDays(k, -1); }
    const sorted = [...days].sort(); let best = 0, run = 0, prev = null;
    sorted.forEach(d => { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; });
    const last = Array.from({ length: 21 }, (_, i) => addDays(today, i - 20));
    box.innerHTML = `<div class="st-layout"><div class="st-big"><b>${cur}</b><span>día${cur === 1 ? '' : 's'} seguido${cur === 1 ? '' : 's'}</span></div>
      <div><p class="st-msg">${days.has(today) ? '🔥 ¡Hoy ya cuenta! Vuelve mañana para seguir la racha.' : cur ? 'Haz un boceto o marca el reto hoy para no perder tu racha.' : 'Empieza hoy: haz un boceto en el cuaderno o marca el reto semanal.'}</p>
      <div class="st-dots" aria-label="Actividad de los últimos 21 días">${last.map(d => `<span class="${days.has(d) ? 'on' : ''} ${d === today ? 'now' : ''}" title="${e(nice(d))}${days.has(d) ? ' · activo' : ''}"></span>`).join('')}</div>
      <p class="gym-hint">Mejor racha: ${best} día${best === 1 ? '' : 's'} · Cuenta un día si guardas un boceto en el cuaderno o marcas que trabajaste en el reto.</p></div></div>`;
  }

  // ---------------- shell + events ----------------
  const block = (id, n, title, sub, color) => `<section class="gym-block" id="${id}" style="--g:${color}"><header><b>${n}</b><div><h3>${title}</h3><p>${sub}</p></div></header><div class="gc-body"></div></section>`;
  root.innerHTML = block('gym-connections', 1, 'Creative Connections', 'Combina 2 o 3 referencias improbables y experimenta con preguntas guía.', '#b8674f')
    + `<div class="gym-pair">${block('gym-detective', 2, 'Design Detective', 'Un objeto icónico cada día. Adivina el diseñador, la época y el material.', '#547ca2')}${block('gym-streak', 4, 'Racha creativa', 'Días seguidos haciendo un boceto o trabajando en el reto.', '#c98f2c')}</div>`
    + block('gym-weekly', 3, 'Reto semanal', 'Un ejercicio nuevo cada lunes y, el domingo, la galería de tus bocetos.', '#2f6b55');
  const renderAll = () => { renderConnections(); renderDetective(); renderWeekly(); renderStreak(); };
  renderAll();

  root.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b || b.matches('[data-lab]')) return;
    if (b.dataset.conn != null) { surprise = null; root.querySelector('#gym-connections .gc-body').dataset.i = b.dataset.conn; renderConnections(); }
    if (b.matches('[data-surprise]')) { surprise = makeSurprise(); if (!surprise) { say('Agrega recursos a tu archivo para usar Surprise Me'); return; } renderConnections(); }
    if (b.dataset.pick) { const all = get(DET_KEY, {}) || {}, st = all[today] || { picks: {}, revealed: false }; if (st.revealed) return; st.picks[b.dataset.pick] = b.dataset.v; all[today] = st; put(DET_KEY, all); renderDetective(); }
    if (b.matches('[data-reveal]')) { const all = get(DET_KEY, {}) || {}, st = all[today] || { picks: {} }, { o } = detectiveOf(today); st.revealed = true; st.correct = QS.filter(([f]) => st.picks?.[f] === o[f]).length; all[today] = st; put(DET_KEY, all); renderDetective(); }
    if (b.matches('[data-done]')) { const done = get(DONE_KEY, {}) || {}; if (done[today]) delete done[today]; else done[today] = { weekly: thisWeek.title }; put(DONE_KEY, done); renderWeekly(); renderStreak(); say(done[today] ? '✓ Día sumado a tu racha' : 'Marca quitada'); }
  });
  root.closest('section').querySelectorAll('.gym-tabs a[href^="#"]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  window.addEventListener('storage', ev => { if (['tdl-sketches', DONE_KEY, DET_KEY, 'tdl-fav', 'tdl-concepts'].includes(ev.key)) renderAll(); });
  document.addEventListener('lab:change', () => { renderWeekly(); });
})();
