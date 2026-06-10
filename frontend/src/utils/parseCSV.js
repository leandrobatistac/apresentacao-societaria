import Papa from 'papaparse'

const COL = {
  consorcio: 1,
  num:       2,
  nome:      3,
  pct:       4,
  taxa_adm:  5,

  // Acumulado até 2025
  ac25_rec:  6,
  ac25_desp: 7,
  ac25_res:  8,
  ac25_pct:  9,

  // Mensal 2026
  jan_rec:  10, jan_desp:  11, jan_res:  12,
  fev_rec:  13, fev_desp:  14, fev_res:  15,
  mar_rec:  16, mar_desp:  17, mar_res:  18,
  abr_rec:  19, abr_desp:  20, abr_res:  21,
  mai_rec:  22, mai_desp:  23, mai_res:  24,
  jun_rec:  25, jun_desp:  26, jun_res:  27,
  jul_rec:  28, jul_desp:  29, jul_res:  30,
  ago_rec:  31, ago_desp:  32, ago_res:  33,
  set_rec:  34, set_desp:  35, set_res:  36,
  out_rec:  37, out_desp:  38, out_res:  39,
  nov_rec:  40, nov_desp:  41, nov_res:  42,
  dez_rec:  43, dez_desp:  44, dez_res:  45,

  // Acumulado em 2026
  a26_rec:  46, a26_desp: 47, a26_res: 48, a26_pct: 49,

  // Acumulado até Dez/26
  at_rec:  50, at_desp: 51, at_res: 52, at_pct: 53,

  // Previsibilidade 2026
  p_rec:  54, p_desp: 55, p_res: 56,

  // Aditivos / Prateleira
  ad_rec:  57, ad_desp: 58, ad_res: 59,

  // Previsibilidade 2027
  p27: 60,

  // Resultado Geral
  res_geral:     61,
  res_geral_pct: 62,
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
  const rows = data.slice(3)

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
      jan_rec:  parseMoney(c[COL.jan_rec]),  jan_desp:  parseMoney(c[COL.jan_desp]),  jan_res:  parseMoney(c[COL.jan_res]),
      fev_rec:  parseMoney(c[COL.fev_rec]),  fev_desp:  parseMoney(c[COL.fev_desp]),  fev_res:  parseMoney(c[COL.fev_res]),
      mar_rec:  parseMoney(c[COL.mar_rec]),  mar_desp:  parseMoney(c[COL.mar_desp]),  mar_res:  parseMoney(c[COL.mar_res]),
      abr_rec:  parseMoney(c[COL.abr_rec]),  abr_desp:  parseMoney(c[COL.abr_desp]),  abr_res:  parseMoney(c[COL.abr_res]),
      mai_rec:  parseMoney(c[COL.mai_rec]),  mai_desp:  parseMoney(c[COL.mai_desp]),  mai_res:  parseMoney(c[COL.mai_res]),
      jun_rec:  parseMoney(c[COL.jun_rec]),  jun_desp:  parseMoney(c[COL.jun_desp]),  jun_res:  parseMoney(c[COL.jun_res]),
      jul_rec:  parseMoney(c[COL.jul_rec]),  jul_desp:  parseMoney(c[COL.jul_desp]),  jul_res:  parseMoney(c[COL.jul_res]),
      ago_rec:  parseMoney(c[COL.ago_rec]),  ago_desp:  parseMoney(c[COL.ago_desp]),  ago_res:  parseMoney(c[COL.ago_res]),
      set_rec:  parseMoney(c[COL.set_rec]),  set_desp:  parseMoney(c[COL.set_desp]),  set_res:  parseMoney(c[COL.set_res]),
      out_rec:  parseMoney(c[COL.out_rec]),  out_desp:  parseMoney(c[COL.out_desp]),  out_res:  parseMoney(c[COL.out_res]),
      nov_rec:  parseMoney(c[COL.nov_rec]),  nov_desp:  parseMoney(c[COL.nov_desp]),  nov_res:  parseMoney(c[COL.nov_res]),
      dez_rec:  parseMoney(c[COL.dez_rec]),  dez_desp:  parseMoney(c[COL.dez_desp]),  dez_res:  parseMoney(c[COL.dez_res]),

      // Acumulado em 2026
      a26_rec:  parseMoney(c[COL.a26_rec]),
      a26_desp: parseMoney(c[COL.a26_desp]),
      a26_res:  parseMoney(c[COL.a26_res]),
      a26_pct:  parsePct(c[COL.a26_pct]),

      // Acumulado até Dez/26
      at_rec:  parseMoney(c[COL.at_rec]),
      at_desp: parseMoney(c[COL.at_desp]),
      at_res:  parseMoney(c[COL.at_res]),
      at_pct:  parsePct(c[COL.at_pct]),

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

      // Resultado Geral
      res_geral:     parseMoney(c[COL.res_geral]),
      res_geral_pct: parsePct(c[COL.res_geral_pct]),
    }))
}