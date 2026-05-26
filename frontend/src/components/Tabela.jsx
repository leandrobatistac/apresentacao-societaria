import { useState } from 'react'

// ── Group colors ─────────────────────────────────────────
const GROUP_COLORS = {
  'CONS. SP':    { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' }, // Roxo claro
  'CORTE':       { bg: '#fefce8', text: '#854d0e', border: '#fde047' },
  'POROS COMIM': { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
  'GOIÁS':       { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  'POROS':       { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
  'POROS MHEGA': { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
}
const gc = (name) => GROUP_COLORS[name] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }

// ── Helpers ──────────────────────────────────────────────
export function fmt(v) {
  if (v === null || v === undefined) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function fmtPct(v) {
  if (v === null || v === undefined || isNaN(v)) return '—'
  return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

export function applyPoros(v, obra) {
  if (v === null) return null
  return v * obra.pct
}

function resColor(v) {
  if (v === null || v === undefined) return 'inherit'
  if (v > 0) return 'var(--positive)'
  if (v < 0) return 'var(--negative)'
  return 'inherit'
}

// ── Badge de Grupo ───────────────────────────────────────
function GroupBadge({ name }) {
  const c = gc(name)
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '4px 0', width: 90, textAlign: 'center', margin: '0 auto',
      borderRadius: 6, fontSize: 10, fontWeight: 700,
      letterSpacing: '.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    }}>
      {name}
    </div>
  )
}

// ── Elementos Compartilhados (Vão e Células) ─────────────
const GAP = { width: 16, padding: 0, background: 'transparent', border: 'none' }

function TH({ children, span, width, roundTL, roundTR, bT, bL, bR }) {
  const bg = '#1e3a5f' // Padronizado para um tom único de azul
  return (
    <th colSpan={span} style={{
      width, background: bg, color: 'rgba(255,255,255,.8)',
      fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', padding: '6px 12px',
      textAlign: 'center', whiteSpace: 'nowrap',
      borderTopLeftRadius: roundTL ? 8 : 0,
      borderTopRightRadius: roundTR ? 8 : 0,
      borderTop: bT ? '1px solid var(--border)' : 'none',
      borderLeft: bL ? '1px solid var(--border)' : 'none',
      borderRight: bR ? '1px solid var(--border)' : '1px solid rgba(255,255,255,.06)',
      borderBottom: '1px solid rgba(255,255,255,.08)',
    }}>
      {children}
    </th>
  )
}

// ── ACUMULADO TABLE ──────────────────────────────────────
export function TabelaAcumulado({ obras, period, sortMode }) {
  const is26 = period === '2026'
  let tGRec = 0, tGDesp = 0, tGRes = 0
  let tPRec = 0, tPDesp = 0, tPRes = 0

  const rowsData = obras.map(o => {
    const gRec  = is26 ? o.a26_rec  : o.at_rec
    const gDesp = is26 ? o.a26_desp : o.at_desp
    const gRes  = is26 ? o.a26_res  : o.at_res
    const pRec  = applyPoros(gRec, o)
    const pDesp = applyPoros(gDesp, o)
    const pRes  = applyPoros(gRes, o)
    const gMargin = gRec ? (gRes / gRec) : (is26 ? o.a26_pct : null)
    const pMargin = pRec ? (pRes / pRec) : gMargin

    if (gRec  !== null) tGRec  += gRec
    if (gDesp !== null) tGDesp += gDesp
    if (gRes  !== null) tGRes  += gRes
    if (pRec  !== null) tPRec  += pRec
    if (pDesp !== null) tPDesp += pDesp
    if (pRes  !== null) tPRes  += pRes

    return { o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin }
  })

  if (sortMode === 'abc-geral') {
    rowsData.sort((a, b) => (b.gRes || 0) - (a.gRes || 0))
  } else if (sortMode === 'abc-poros') {
    rowsData.sort((a, b) => (b.pRes || 0) - (a.pRes || 0))
  } else {
    rowsData.sort((a, b) => {
      if (a.o.consorcio < b.o.consorcio) return -1
      if (a.o.consorcio > b.o.consorcio) return 1
      return 0
    })
  }

  const baseCell = { padding: '5px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', transition: 'background .1s', fontSize: 11 }
  const renderDataRow = ({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [hov, setHov] = useState(false)
    const bg = hov ? 'var(--surface2)' : 'var(--surface)'

    const td = (content, opts = {}) => (
      <td style={{
        ...baseCell, background: bg,
        textAlign: opts.alignLeft ? 'left' : 'center',
        color: opts.isRes ? resColor(opts.v) : opts.dim ? 'var(--text-dim)' : opts.muted ? 'var(--text-muted)' : 'var(--text)',
        fontWeight: opts.bold || opts.isRes ? 600 : 400,
        whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
        fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
        maxWidth: opts.maxWidth, overflow: opts.maxWidth ? 'hidden' : 'visible', textOverflow: opts.maxWidth ? 'ellipsis' : 'clip',
        borderLeft: opts.bL ? '1px solid var(--border)' : 'none',
        borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      }}>
        {content}
      </td>
    )

    return (
      <tr key={o.num} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        {/* Bloco Obra */}
        {td(<GroupBadge name={o.consorcio} />, { bL: true })}
        {td(o.num, { dim: true })}
        {td(o.nome, { bold: true, nowrap: true, maxWidth: 220, alignLeft: true })}
        {td((o.pct * 100).toFixed(0) + '%', { muted: true })}
        {td(o.taxa_adm || '—', { dim: true, bR: true })}
        <td style={GAP} />
        {/* Bloco Geral */}
        {td(fmt(gRec), { num: true, bL: true })}
        {td(fmt(gDesp), { num: true })}
        {td(fmt(gRes), { num: true, isRes: true, v: gRes })}
        {td(fmtPct(gMargin), { num: true, isRes: true, v: gMargin, bR: true })}
        <td style={GAP} />
        {/* Bloco % Poros */}
        {td(fmt(pRec), { num: true, bL: true })}
        {td(fmt(pDesp), { num: true })}
        {td(fmt(pRes), { num: true, isRes: true, v: pRes })}
        {td(fmtPct(pMargin), { num: true, isRes: true, v: pMargin, bR: true })}
      </tr>
    )
  }

  const totGMargin = tGRec ? (tGRes / tGRec) : null
  const totPMargin = tPRec ? (tPRes / tPRec) : null

  const totCell = (v, isPct, isRes, opts = {}) => (
    <td style={{
      padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
      color: isRes ? resColor(v) : 'var(--text)', borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      borderLeft: opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius: opts.rBL ? 8 : 0, borderBottomRightRadius: opts.rBR ? 8 : 0,
    }}>
      {isPct ? fmtPct(v) : fmt(v)}
    </td>
  )

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
        <thead>
          <tr>
            <TH span={5} bT bL bR roundTL roundTR>Obra</TH><td style={GAP}/>
            <TH span={4} bT bL bR roundTL roundTR>Geral</TH><td style={GAP}/>
            <TH span={4} bT bL bR roundTL roundTR>% Poros</TH>
          </tr>
          <tr>
            <TH width={115} bL>Grupo</TH>
            <TH width={40}>#</TH>
            <TH width="auto">Nome</TH>
            <TH width={70}>Part.</TH>
            <TH width={85} bR>Tx ADM</TH><td style={GAP}/>
            <TH bL>Receita</TH>
            <TH>Despesa</TH>
            <TH>Resultado</TH>
            <TH bR>%</TH><td style={GAP}/>
            <TH bL>Receita</TH>
            <TH>Despesa</TH>
            <TH>Resultado</TH>
            <TH bR>%</TH>
          </tr>
        </thead>
        <tbody>
          {rowsData.map(renderDataRow)}
          <tr>
            <td colSpan={5} style={{
              padding: '7px 14px', fontWeight: 700, fontSize: 11, color: 'var(--text)', textAlign: 'center',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
              borderBottomLeftRadius: 8, borderBottomRightRadius: 8, background: 'var(--surface2)',
            }}>Total Geral</td>
            <td style={GAP} />
            {totCell(tGRec, false, false, { bL: true, rBL: true })}
            {totCell(tGDesp, false, false)}
            {totCell(tGRes, false, true)}
            {totCell(totGMargin, true, true, { bR: true, rBR: true })}
            <td style={GAP} />
            {totCell(tPRec, false, false, { bL: true, rBL: true })}
            {totCell(tPDesp, false, false)}
            {totCell(tPRes, false, true)}
            {totCell(totPMargin, true, true, { bR: true, rBR: true })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── PREVISIBILIDADE TABLE ────────────────────────────────
export function TabelaPrevisibilidade({ obras, sortMode = 'grupo' }) {
  let tGRec = 0, tGDesp = 0, tGRes = 0
  let tPRec = 0, tPDesp = 0, tPRes = 0

  const rowsData = obras.reduce((acc, o) => {
    // Unificando Previsibilidade (p_) + Aditivos/Prateleira (ad_)
    const gRec  = (o.p_rec || 0) + (o.ad_rec || 0)
    const gDesp = (o.p_desp || 0) + (o.ad_desp || 0)
    const gRes  = (o.p_res || 0) + (o.ad_res || 0)
    
    // Filtro: Ignorar linha se for tudo zerado
    if (gRec === 0 && gDesp === 0 && gRes === 0) {
      return acc
    }
    
    const pRec  = applyPoros(gRec, o)
    const pDesp = applyPoros(gDesp, o)
    const pRes  = applyPoros(gRes, o)
    
    const gMargin = gRec ? (gRes / gRec) : null
    const pMargin = pRec ? (pRes / pRec) : null

    tGRec  += gRec
    tGDesp += gDesp
    tGRes  += gRes
    if (pRec  !== null) tPRec  += pRec
    if (pDesp !== null) tPDesp += pDesp
    if (pRes  !== null) tPRes  += pRes

    acc.push({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin })
    return acc
  }, [])

  if (sortMode === 'abc-geral') {
    rowsData.sort((a, b) => (b.gRes || 0) - (a.gRes || 0))
  } else if (sortMode === 'abc-poros') {
    rowsData.sort((a, b) => (b.pRes || 0) - (a.pRes || 0))
  } else {
    rowsData.sort((a, b) => {
      if (a.o.consorcio < b.o.consorcio) return -1
      if (a.o.consorcio > b.o.consorcio) return 1
      return 0
    })
  }

  const baseCell = { padding: '5px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', transition: 'background .1s', fontSize: 11 }
  const renderDataRow = ({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [hov, setHov] = useState(false)
    const bg = hov ? 'var(--surface2)' : 'var(--surface)'

    const td = (content, opts = {}) => (
      <td style={{
        ...baseCell, background: bg,
        textAlign: opts.alignLeft ? 'left' : 'center',
        color: opts.isRes ? resColor(opts.v) : opts.dim ? 'var(--text-dim)' : opts.muted ? 'var(--text-muted)' : 'var(--text)',
        fontWeight: opts.bold || opts.isRes ? 600 : 400,
        whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
        fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
        maxWidth: opts.maxWidth, overflow: opts.maxWidth ? 'hidden' : 'visible', textOverflow: opts.maxWidth ? 'ellipsis' : 'clip',
        borderLeft: opts.bL ? '1px solid var(--border)' : 'none',
        borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      }}>
        {content}
      </td>
    )

    return (
      <tr key={o.num} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        {/* Bloco Obra */}
        {td(<GroupBadge name={o.consorcio} />, { bL: true })}
        {td(o.num, { dim: true })}
        {td(o.nome, { bold: true, nowrap: true, maxWidth: 220, alignLeft: true })}
        {td((o.pct * 100).toFixed(0) + '%', { muted: true })}
        {td(o.taxa_adm || '—', { dim: true, bR: true })}
        <td style={GAP} />
        {/* Bloco Geral */}
        {td(fmt(gRec), { num: true, bL: true })}
        {td(fmt(gDesp), { num: true })}
        {td(fmt(gRes), { num: true, isRes: true, v: gRes })}
        {td(fmtPct(gMargin), { num: true, isRes: true, v: gMargin, bR: true })}
        <td style={GAP} />
        {/* Bloco % Poros */}
        {td(fmt(pRec), { num: true, bL: true })}
        {td(fmt(pDesp), { num: true })}
        {td(fmt(pRes), { num: true, isRes: true, v: pRes })}
        {td(fmtPct(pMargin), { num: true, isRes: true, v: pMargin, bR: true })}
      </tr>
    )
  }

  const totGMargin = tGRec ? (tGRes / tGRec) : null
  const totPMargin = tPRec ? (tPRes / tPRec) : null

  const totCell = (v, isPct, isRes, opts = {}) => (
    <td style={{
      padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
      color: isRes ? resColor(v) : 'var(--text)', borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      borderLeft: opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius: opts.rBL ? 8 : 0, borderBottomRightRadius: opts.rBR ? 8 : 0,
    }}>
      {isPct ? fmtPct(v) : fmt(v)}
    </td>
  )

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
        <thead>
          <tr>
            <TH span={5} bT bL bR roundTL roundTR>Obra</TH><td style={GAP}/>
            <TH span={4} bT bL bR roundTL roundTR>Geral</TH><td style={GAP}/>
            <TH span={4} bT bL bR roundTL roundTR>% Poros</TH>
          </tr>
          <tr>
            <TH width={115} bL>Grupo</TH>
            <TH width={40}>#</TH>
            <TH width="auto">Nome</TH>
            <TH width={70}>Part.</TH>
            <TH width={85} bR>Tx ADM</TH><td style={GAP}/>
            <TH bL>Receita</TH>
            <TH>Despesa</TH>
            <TH>Resultado</TH>
            <TH bR>% Res</TH><td style={GAP}/>
            <TH bL>Receita</TH>
            <TH>Despesa</TH>
            <TH>Resultado</TH>
            <TH bR>% Res</TH>
          </tr>
        </thead>
        <tbody>
          {rowsData.map(renderDataRow)}
          <tr>
            <td colSpan={5} style={{
              padding: '7px 14px', fontWeight: 700, fontSize: 11, color: 'var(--text)', textAlign: 'center',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
              borderBottomLeftRadius: 8, borderBottomRightRadius: 8, background: 'var(--surface2)',
            }}>Total Geral</td>
            <td style={GAP} />
            {totCell(tGRec, false, false, { bL: true, rBL: true })}
            {totCell(tGDesp, false, false)}
            {totCell(tGRes, false, true)}
            {totCell(totGMargin, true, true, { bR: true, rBR: true })}
            <td style={GAP} />
            {totCell(tPRec, false, false, { bL: true, rBL: true })}
            {totCell(tPDesp, false, false)}
            {totCell(tPRes, false, true)}
            {totCell(totPMargin, true, true, { bR: true, rBR: true })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}