import Papa from 'papaparse'

// Mapeamento exato com base no Excel (Lembrando que A = 0, B = 1...)
const COL = {
  consorcio: 1, // B: GRUPO
  num: 2,       // C: OBRA (Num)
  nome: 3,      // D: OBRA (Nome)
  pct: 4,       // E: % PART
  taxa_adm: 5,  // F: % ADM
  
  // Acumulado 2026
  a26_rec: 6,   // G: RECEITAS
  a26_desp: 7,  // H: DESPESAS
  a26_res: 8,   // I: RESULTADO
  a26_pct: 9,   // J: % 
  
  // Acumulado até Abr/26
  at_rec: 10,   // K: RECEITAS
  at_desp: 11,  // L: DESPESAS
  at_res: 12,   // M: RESULTADO
  
  // Previsibilidade 2026
  p_rec: 13,    // N: RECEITAS
  p_desp: 14,   // O: DESPESAS
  p_res: 15,    // P: RESULTADO
  
  // Aditivos/Prateleira
  ad_rec: 16,   // Q: RECEITAS
  ad_desp: 17,  // R: DESPESAS
  ad_res: 18,   // S: RESULTADO
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
  const rows = data.slice(3) // As linhas 0-2 são cabeçalhos

  return rows
    .filter(c => c[COL.nome] && String(c[COL.nome]).trim())
    .map(c => ({
      consorcio:  String(c[COL.consorcio] || '').trim(),
      num:        String(c[COL.num] || '').trim(),
      nome:       String(c[COL.nome] || '').trim(),
      pct:        parsePct(c[COL.pct]) ?? 1,
      taxa_adm:   String(c[COL.taxa_adm] || '').trim(),
      
      a26_rec:    parseMoney(c[COL.a26_rec]),
      a26_desp:   parseMoney(c[COL.a26_desp]),
      a26_res:    parseMoney(c[COL.a26_res]),
      a26_pct:    parsePct(c[COL.a26_pct]),
      
      at_rec:     parseMoney(c[COL.at_rec]),
      at_desp:    parseMoney(c[COL.at_desp]),
      at_res:     parseMoney(c[COL.at_res]),
      
      p_rec:      parseMoney(c[COL.p_rec]),
      p_desp:     parseMoney(c[COL.p_desp]),
      p_res:      parseMoney(c[COL.p_res]),
      
      ad_rec:     parseMoney(c[COL.ad_rec]),
      ad_desp:    parseMoney(c[COL.ad_desp]),
      ad_res:     parseMoney(c[COL.ad_res]),
    }))
}