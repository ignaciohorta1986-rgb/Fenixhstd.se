/* =============================================
   Önskeväggen — gemensamt för onskevagg.html (mobil) och onskevagg-skarm.html (storskärm)
   ============================================= */

// ── Inställningar (fylls i när Google-formuläret finns) ──
const ONSKEVAGG = {
  // Formulärets "formResponse"-adress och fältets entry-id
  formAction: '',
  entryId: '',
  // Publicerad CSV för fliken med GODKÄNDA önskningar (bara den fliken publiceras)
  approvedCsv: '',
};

function owParseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function owParseDate(s) {
  const m = s && s.match(/(\d{1,4})[-/.](\d{1,2})[-/.](\d{2,4})\D+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const [, a, b, c, h, mi, se] = m;
  const [y, mo, d] = a.length === 4 ? [a, b, c] : [c, b, a];
  return new Date(+y, +mo - 1, +d, +h, +mi, +(se || 0));
}

function owAgo(d) {
  if (!d) return '';
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'nyss';
  if (s < 3600) return `${Math.floor(s / 60)} min sedan`;
  if (s < 86400) return `${Math.floor(s / 3600)} tim sedan`;
  const days = Math.floor(s / 86400);
  return days === 1 ? 'i går' : `${days} dagar sedan`;
}

const OW_COLORS = ['linear-gradient(135deg,#ff4500,#ffd60a)', 'linear-gradient(135deg,#0055ff,#44aaff)',
                   'linear-gradient(135deg,#ff6b35,#ff4500)', 'linear-gradient(135deg,#44aaff,#ffd60a)'];

// Hämtar godkända önskningar, nyast först. Returnerar null om väggen inte är kopplad än.
async function owLoadApproved() {
  if (!ONSKEVAGG.approvedCsv) return null;
  const url = ONSKEVAGG.approvedCsv + (ONSKEVAGG.approvedCsv.includes('?') ? '&' : '?') + 't=' + Date.now();
  const r = await fetch(url);
  const rows = owParseCsv(await r.text()).filter(r => r.length >= 2 && r[1] && r[1].trim());
  return rows.slice(1).map(r => ({ date: owParseDate(r[0]), text: r[1].trim() }))
    .sort((a, b) => (b.date || 0) - (a.date || 0));
}

// Bygger en kommentar (texten sätts som text, aldrig som HTML)
function owComment(it, i) {
  const li = document.createElement('li');
  li.className = 'comment';
  const av = document.createElement('div');
  av.className = 'av'; av.textContent = '?'; av.setAttribute('aria-hidden', 'true');
  av.style.setProperty('--av', OW_COLORS[i % OW_COLORS.length]);
  const body = document.createElement('div');
  const meta = document.createElement('div'); meta.className = 'meta';
  const who = document.createElement('span'); who.className = 'who'; who.textContent = 'Anonym';
  const t = document.createElement('time'); t.textContent = owAgo(it.date);
  if (it.date) t.dateTime = it.date.toISOString();
  meta.append(who, t);
  const p = document.createElement('p'); p.textContent = it.text;
  body.append(meta, p);
  li.append(av, body);
  return li;
}

async function owSend(text) {
  if (!ONSKEVAGG.formAction || !ONSKEVAGG.entryId) throw new Error('inte kopplad');
  const body = new URLSearchParams({ [ONSKEVAGG.entryId]: text });
  await fetch(ONSKEVAGG.formAction, { method: 'POST', mode: 'no-cors', body });
}
