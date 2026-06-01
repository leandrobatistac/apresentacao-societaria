import Papa from 'papaparse'

// Ordem das seções no CSV corresponde aos grupos
const GRUPOS = [
  'GRUPO POROS',
  'GRUPO POROS / CORTE',
  'GRUPO POROS / CORTE / COMIM',
  'GRUPO POROS / COMIM',
]

// "R$ 700.000,00" → 700000
function parseMoney(s) {
  if (!s) return null
  s = String(s).trim().replace('R$', '').trim().replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

export function parsePatrimonioCSV(csvText) {
  const { data } = Papa.parse(csvText, { skipEmptyLines: false })

  const grupos = []
  let grupoIdx = -1
  let itens    = []

  for (const row of data) {
    const col1 = String(row[1] || '').trim()
    const col5 = String(row[5] || '').trim()

    // Nova seção — linha de cabeçalho (FROTA na col 1)
    if (col1 === 'FROTA') {
      if (grupoIdx >= 0 && itens.length > 0) {
        grupos.push({ grupo: GRUPOS[grupoIdx], itens })
      }
      grupoIdx++
      itens = []
      continue
    }

    // Linha de total — ignora
    if (col5 === 'TOTAL') continue

    // Linha de dado válido (col 1 não vazio e tem valor)
    if (col1 && col1 !== '' && grupoIdx >= 0) {
      itens.push({
        frota:        col1,
        ano:          String(row[2] || '').trim(),
        equipamento:  String(row[3] || '').trim(),
        modelo:       String(row[4] || '').trim(),
        proprietario: col5,
        valorMercado: parseMoney(row[6]),
        valorPoros:   parseMoney(row[7]),
      })
    }
  }

  // Última seção
  if (grupoIdx >= 0 && itens.length > 0) {
    grupos.push({ grupo: GRUPOS[grupoIdx], itens })
  }

  return grupos
}
