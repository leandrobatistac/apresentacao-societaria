import Papa from 'papaparse'

// Mapeamento exato com base no CSV exportado do Sheets
const COL = {
  consorcio: 1,   // B: GRUPO
  num:        2,  // C: OBRA (Num)
  nome:       3,  // D: OBRA (Nome)
  pct:        4,  // E: % PART
  taxa_adm:   5,  // F: % ADM

  // Acumulado até 2025 — cols 6–9
  ac25_rec:  6,
  ac25_desp: 7,
  ac25_res:  8,
  ac25_pct:  9,

  // Mensal 2026 — 3 colunas cada (sem %)
  jan_rec:  10, jan_desp:  11, jan_res:  12,
  fev_rec:  13, fev_desp:  14, fev_res:  15,
  mar_rec:  16, mar_desp:  17, mar_res:  18,
  abr_rec:  19, abr_desp:  20, abr_res:  21,

  // Acumulado em 2026 — cols 22–25
  a26_rec:  22,
  a26_desp: 23,
  a26_res:  24,
  a26_pct:  25,

  // Acumulado até Abr/26 — cols 26–28
  at_rec:  26,
  at_desp: 27,
  at_res:  28,

  // Previsibilidade 2026 — cols 29–31
  p_rec:  29,
  p_desp: 30,
  p_res:  31,

  // Aditivos / Prateleira — cols 32–34
  ad_rec:  32,
  ad_desp: 33,
  ad_res:  34,

  // Previsibilidade 2027 — col 35
  p27: 35,
}

function parseMoney(s) {
  if (!s) return null
  s = String(s).trim().replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function parsePct(s) {
  if (!s) return null
  s = String(s).trim().replace('%', '').replace(',', '.')
  const n = parseFloat(s) / 100
  return isNaN(n) ? null : n
}

export function parseObrasCSV(csvText) {
  const { data } = Papa.parse(csvText, { skipEmptyLines: false })
  const rows = data.slice(3) // linhas 0–2 são cabeçalhos

  return rows
    .filter(c => c[COL.nome] && String(c[COL.nome]).trim())
    .map(c => ({
      consorcio: String(c[COL.consorcio] || '').trim(),
      num:       String(c[COL.num]       || '').trim(),
      nome:      String(c[COL.nome]      || '').trim(),
      pct:       parsePct(c[COL.pct])  ?? 1,
      taxa_adm:  String(c[COL.taxa_adm] || '').trim(),

      // Acumulado até 2025
      ac25_rec:  parseMoney(c[COL.ac25_rec]),
      ac25_desp: parseMoney(c[COL.ac25_desp]),
      ac25_res:  parseMoney(c[COL.ac25_res]),
      ac25_pct:  parsePct(c[COL.ac25_pct]),

      // Mensal 2026
      jan_rec:  parseMoney(c[COL.jan_rec]),
      jan_desp: parseMoney(c[COL.jan_desp]),
      jan_res:  parseMoney(c[COL.jan_res]),

      fev_rec:  parseMoney(c[COL.fev_rec]),
      fev_desp: parseMoney(c[COL.fev_desp]),
      fev_res:  parseMoney(c[COL.fev_res]),

      mar_rec:  parseMoney(c[COL.mar_rec]),
      mar_desp: parseMoney(c[COL.mar_desp]),
      mar_res:  parseMoney(c[COL.mar_res]),

      abr_rec:  parseMoney(c[COL.abr_rec]),
      abr_desp: parseMoney(c[COL.abr_desp]),
      abr_res:  parseMoney(c[COL.abr_res]),

      // Acumulado em 2026
      a26_rec:  parseMoney(c[COL.a26_rec]),
      a26_desp: parseMoney(c[COL.a26_desp]),
      a26_res:  parseMoney(c[COL.a26_res]),
      a26_pct:  parsePct(c[COL.a26_pct]),

      // Acumulado até Abr/26
      at_rec:  parseMoney(c[COL.at_rec]),
      at_desp: parseMoney(c[COL.at_desp]),
      at_res:  parseMoney(c[COL.at_res]),

      // Previsibilidade 2026
      p_rec:  parseMoney(c[COL.p_rec]),
      p_desp: parseMoney(c[COL.p_desp]),
      p_res:  parseMoney(c[COL.p_res]),

      // Aditivos / Prateleira
      ad_rec:  parseMoney(c[COL.ad_rec]),
      ad_desp: parseMoney(c[COL.ad_desp]),
      ad_res:  parseMoney(c[COL.ad_res]),

      // Previsibilidade 2027
      p27: parseMoney(c[COL.p27]),
    }))
}
