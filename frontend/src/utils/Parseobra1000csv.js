import Papa from 'papaparse'

function parseMoney(s) {
  if (!s) return null
  s = String(s).trim().replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').replace(/-\s*$/, '').trim()
  if (!s || s === '-') return null
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function parsePctStr(s) {
  if (!s) return null
  s = String(s).trim()
  if (!s || s === '-') return null
  return s.includes('%') ? s : s + '%'
}

const GROUPS_DEF = [
  { name: 'GRUPO POROS',                 offset: 1  },
  { name: 'GRUPO POROS / CORTE',         offset: 8  },
  { name: 'GRUPO POROS / CORTE / COMIM', offset: 15 },
  { name: 'GRUPO POROS / COMIM',         offset: 22 },
]

// Detecta qualquer linha que pertença à seção Diversas
function isDiversaItem(code, nome) {
  const v = ((code || '') + ' ' + (nome || '')).toLowerCase()
  return v.includes('diversa')    // pega Diversas, Diversa
      || v.includes('indireta')   // pega Indireta, Indiretas
}

export function parseObra1000CSV(csvText) {
  const { data } = Papa.parse(csvText, { skipEmptyLines: false })

  const groups = GROUPS_DEF.map(({ name, offset }) => {
    // Total — row 4
    const totRow = data[4] || []
    const total = {
      rec:  parseMoney(totRow[offset + 2]),
      desp: parseMoney(totRow[offset + 3]),
      res:  parseMoney(totRow[offset + 4]),
      pct:  parsePctStr(totRow[offset + 5]),
    }

    // Subtotal Equipamentos — row 6
    const equip_total = {
      rec:  parseMoney((data[6] || [])[offset + 2]),
      desp: parseMoney((data[6] || [])[offset + 3]),
      res:  parseMoney((data[6] || [])[offset + 4]),
      pct:  parsePctStr((data[6] || [])[offset + 5]),
    }

    // Equipamentos — rows 7+
    const equipamentos = []
    for (let r = 7; r < data.length; r++) {
      const row = data[r]
      const code = String(row[offset] || '').trim()
      const nome = String(row[offset + 1] || '').trim()
      if (!code && !nome) continue

      // Pula QUALQUER linha que seja da seção Diversas
      if (isDiversaItem(code, nome)) continue

      equipamentos.push({
        code, nome,
        rec:  parseMoney(row[offset + 2]),
        desp: parseMoney(row[offset + 3]),
        res:  parseMoney(row[offset + 4]),
        pct:  parsePctStr(row[offset + 5]),
      })
    }

    return { name, total, equip_total, equipamentos, diversas: [] }
  })

  // Diversas — só no grupo POROS (lê das colunas 1-6)
  for (let r = 7; r < data.length; r++) {
    const row = data[r]
    const col1 = String(row[1] || '').trim()
    if (!col1 || !isDiversaItem(col1, '')) continue

    const isHeader = col1.toLowerCase().includes('receitas/despesas diversas')
    groups[0].diversas.push({
      nome: col1,
      rec:  parseMoney(row[3]),
      desp: parseMoney(row[4]),
      isHeader,
    })
  }

  return groups
}
