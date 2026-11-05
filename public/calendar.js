/* The Design Library — helpers to send goals and visits to a calendar without
   connecting any Google account: a prefilled Google Calendar link (the user
   only presses Guardar) and .ics files for Apple Calendar, Outlook or bulk import.
   Item shape: { id, title, date:'YYYY-MM-DD', time:'HH:MM'|'' , dur:minutes, place, details, url } */
(function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } };
  const parseDate = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const compact = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); };
  const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const validTime = s => /^\d{2}:\d{2}$/.test(s || '');

  // Local start/end Date objects for a timed item.
  function range(it) {
    const [h, mi] = it.time.split(':').map(Number);
    const start = parseDate(it.date); start.setHours(h, mi, 0, 0);
    const end = new Date(start.getTime() + (Number(it.dur) > 0 ? Number(it.dur) : 60) * 60000);
    return [start, end];
  }
  const localStamp = d => `${compact(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const utcStamp = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  function fullDetails(it) {
    return [it.details, it.url ? 'Abrir en mi Design Library: ' + it.url : ''].filter(Boolean).join('\n\n');
  }

  // https://calendar.google.com/calendar/render?action=TEMPLATE… opens the app or web
  // with the event filled in. Local times + ctz keep the hour right for this device.
  function googleUrl(it) {
    if (!validDate(it.date)) return '';
    const p = new URLSearchParams({ action: 'TEMPLATE', text: it.title || 'Objetivo' });
    if (validTime(it.time)) {
      const [s, e] = range(it);
      p.set('dates', `${localStamp(s)}/${localStamp(e)}`);
      const zone = tz(); if (zone) p.set('ctz', zone);
    } else {
      p.set('dates', `${compact(parseDate(it.date))}/${compact(parseDate(addDays(it.date, 1)))}`);
    }
    const det = fullDetails(it); if (det) p.set('details', det.slice(0, 1800));
    if (it.place) p.set('location', it.place);
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }

  const icsText = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
  // RFC 5545 line folding at 75 octets.
  function fold(line) {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const out = []; let cur = '', size = 0;
    for (const ch of line) {
      const n = new TextEncoder().encode(ch).length;
      if (size + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; size = 0; }
      cur += ch; size += n;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  function ics(items) {
    const now = utcStamp(new Date());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Design Library//Mesa de trabajo//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (const it of items) {
      if (!validDate(it.date)) continue;
      lines.push('BEGIN:VEVENT', `UID:${it.id}@the-design-library`, `DTSTAMP:${now}`);
      if (validTime(it.time)) { const [s, e] = range(it); lines.push(`DTSTART:${utcStamp(s)}`, `DTEND:${utcStamp(e)}`); }
      else lines.push(`DTSTART;VALUE=DATE:${compact(parseDate(it.date))}`, `DTEND;VALUE=DATE:${compact(parseDate(addDays(it.date, 1)))}`);
      lines.push(`SUMMARY:${icsText(it.title || 'Objetivo')}`);
      const det = fullDetails(it); if (det) lines.push(`DESCRIPTION:${icsText(det)}`);
      if (it.place) lines.push(`LOCATION:${icsText(it.place)}`);
      if (it.url) lines.push(`URL:${it.url}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function downloadIcs(items, name) {
    const dated = items.filter(i => validDate(i.date));
    if (!dated.length) return 0;
    const blob = new Blob([ics(dated)], { type: 'text/calendar;charset=utf-8' });
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = (name || 'mesa-de-trabajo').replace(/[^\w.-]+/g, '-').toLowerCase() + '.ics';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 800);
    return dated.length;
  }
  // What a calendar copy depends on: if this changes after adding, the copy is stale.
  const signature = it => [it.date || '', it.time || '', it.dur || '', it.title || ''].join('|');

  window.TDLCal = { googleUrl, ics, downloadIcs, signature, tz, iso, parseDate, addDays, validDate, validTime,
    help: 'El evento se guarda en tu calendario cuando pulsas Guardar en Google Calendar. Si después cambias algo aquí, no se actualiza solo: vuelve a añadirlo.' };
})();
/* "＋ Duda": saves a loose question linked to a material or concept card. */
(function () {
  const TOPICS = ['Materiales', 'Procesos de fabricación', 'Costos y mínimos', 'Tiempos de entrega', 'Acabados y calidad', 'Sostenibilidad', 'Otros'];
  window.addDuda = function (ref, topic) {
    const text = prompt(`Tu duda sobre ${ref.label}:`, '');
    if (!text || !text.trim()) return;
    let list; try { list = JSON.parse(localStorage.getItem('tdl-dudas')); } catch { list = null; }
    if (!Array.isArray(list)) list = [];
    list.push({ type: 'q', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), topic: TOPICS.includes(topic) ? topic : 'Otros', text: text.trim().slice(0, 400), status: 'pendiente', answer: '', ref, updated: Date.now() });
    try { localStorage.setItem('tdl-dudas', JSON.stringify(list)); } catch { return; }
    try { window.dispatchEvent(new StorageEvent('storage', { key: 'tdl-dudas' })); } catch { /* ignore */ }
    const t = document.getElementById('toast');
    if (t) { t.textContent = 'Duda guardada en Cuaderno → Dudas y visitas'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600); }
  };
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('[data-duda]'); if (!b) return;
    try { const d = JSON.parse(b.dataset.duda); window.addDuda(d.ref, d.topic); } catch { /* ignore */ }
  });
})();
