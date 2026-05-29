import { useState } from 'react'

// ── Group colors ─────────────────────────────────────────
const GROUP_COLORS = {
  'CONS. SP':    { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
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

// ── Badge de Grupo — sem truncagem ───────────────────────
function GroupBadge({ name }) {
  const c = gc(name)
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '3px 0', width: 96, textAlign: 'center', margin: '0 auto',
      borderRadius: 6, fontSize: 10, fontWeight: 700,
      letterSpacing: '.05em', whiteSpace: 'nowrap',
    }}>
      {name}
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────
const baseCell = {
  padding: '5px 12px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
  transition: 'background .1s',
  fontSize: 11,
}

function TH({ children, span, roundTL, roundTR, divL }) {
  return (
    <th colSpan={span} style={{
      background: '#1e3a5f',
      color: 'rgba(255,255,255,.8)',
      fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', padding: '6px 12px',
      textAlign: 'center', whiteSpace: 'nowrap',
      borderTopLeftRadius:  roundTL ? 8 : 0,
      borderTopRightRadius: roundTR ? 8 : 0,
    }}>
      {children}
    </th>
  )
}

function makeTd(bg) {
  return (content, opts = {}) => (
    <td style={{
      ...baseCell, background: bg,
      textAlign: opts.alignLeft ? 'left' : 'center',
      color: opts.dim ? 'var(--text-dim)' : 'var(--text)',
      fontWeight: opts.bold || opts.isRes ? 600 : 400,
      whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
      fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
      maxWidth: opts.maxWidth,
      overflow: opts.maxWidth ? 'hidden' : 'visible',
      textOverflow: opts.maxWidth ? 'ellipsis' : 'clip',
      borderLeft: opts.divL ? '1px solid var(--border)' : 'none',
    }}>
      {content}
    </td>
  )
}

// ── Colgroup ──────────────────────────────────────────────
function AcumColGroup() {
  return (
    <colgroup>
      <col style={{ width: 100 }} />
      <col style={{ width: 40  }} />
      <col style={{ width: 126 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 76  }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 76  }} />
    </colgroup>
  )
}

function AcumHead() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL>Obra</TH>
        <TH span={4} divL>2026</TH>
        <TH span={4} divL roundTR>Acumulado até Abr/26</TH>
      </tr>
      <tr>
        <TH>Grupo</TH>
        <TH>#</TH>
        <TH>Nome</TH>
        <TH divL>Receita</TH>
        <TH>Despesa</TH>
        <TH>Resultado</TH>
        <TH>% Res</TH>
        <TH divL>Receita</TH>
        <TH>Despesa</TH>
        <TH>Resultado</TH>
        <TH>% Res</TH>
      </tr>
    </thead>
  )
}

function AcumRow({ o, aRec, aDesp, aRes, aMargin, tRec, tDesp, tRes, tMargin }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />)}
      {td(o.num, { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 240, alignLeft: true })}
      {td(fmt(aRec),       { num: true, divL: true })}
      {td(fmt(aDesp),      { num: true })}
      {td(fmt(aRes),       { num: true })}
      {td(fmtPct(aMargin), { num: true })}
      {td(fmt(tRec),       { num: true, divL: true })}
      {td(fmt(tDesp),      { num: true })}
      {td(fmt(tRes),       { num: true })}
      {td(fmtPct(tMargin), { num: true })}
    </tr>
  )
}

function SubTotalRow({ group, aRec, aDesp, aRes, aMargin, tRec, tDesp, tRes, tMargin }) {
  const c = gc(group)
  const subStyle = (divL) => ({
    padding: '5px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    background: c.bg, color: c.text,
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    borderLeft: divL ? '1px solid var(--border)' : 'none',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  })
  return (
    <tr>
      <td colSpan={3} style={{ ...subStyle(false), textAlign: 'center' }}>Total {group}</td>
      <td style={subStyle(true)}>{fmt(aRec)}</td>
      <td style={subStyle(false)}>{fmt(aDesp)}</td>
      <td style={subStyle(false)}>{fmt(aRes)}</td>
      <td style={subStyle(false)}>{fmtPct(aMargin)}</td>
      <td style={subStyle(true)}>{fmt(tRec)}</td>
      <td style={subStyle(false)}>{fmt(tDesp)}</td>
      <td style={subStyle(false)}>{fmt(tRes)}</td>
      <td style={subStyle(false)}>{fmtPct(tMargin)}</td>
    </tr>
  )
}

function TotRow({ aRec, aDesp, aRes, aMargin, tRec, tDesp, tRes, tMargin }) {
  const cell = (v, isPct) => (
    <td style={{
      padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
      color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    }}>
      {isPct ? fmtPct(v) : fmt(v)}
    </td>
  )
  return (
    <tr>
      <td colSpan={3} style={{
        padding: '7px 14px', fontWeight: 700, fontSize: 11,
        color: 'rgba(255,255,255,.9)', textAlign: 'center',
        background: '#1e3a5f', borderBottomLeftRadius: 8,
      }}>Total Geral</td>
      {cell(aRec,    false)}
      {cell(aDesp,   false)}
      {cell(aRes,    false)}
      {cell(aMargin, true)}
      {cell(tRec,    false)}
      {cell(tDesp,   false)}
      {cell(tRes,    false)}
      <td style={{
        padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
        color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        borderBottomRightRadius: 8,
      }}>{fmtPct(tMargin)}</td>
    </tr>
  )
}

export function TabelaAcumulado({ obras, metric, sortMode }) {
  const isPoros = metric === 'poros'
  let tARec=0, tADesp=0, tARes=0, tTRec=0, tTDesp=0, tTRes=0

  const rowsData = obras.map(o => {
    const aRec  = isPoros ? applyPoros(o.a26_rec,  o) : o.a26_rec
    const aDesp = isPoros ? applyPoros(o.a26_desp, o) : o.a26_desp
    const aRes  = isPoros ? applyPoros(o.a26_res,  o) : o.a26_res
    const tRec  = isPoros ? applyPoros(o.at_rec,   o) : o.at_rec
    const tDesp = isPoros ? applyPoros(o.at_desp,  o) : o.at_desp
    const tRes  = isPoros ? applyPoros(o.at_res,   o) : o.at_res
    const aMargin = aRec ? (aRes / aRec) : (isPoros ? null : o.a26_pct)
    const tMargin = tRec ? (tRes / tRec) : null
    if (aRec  !== null) tARec  += aRec
    if (aDesp !== null) tADesp += aDesp
    if (aRes  !== null) tARes  += aRes
    if (tRec  !== null) tTRec  += tRec
    if (tDesp !== null) tTDesp += tDesp
    if (tRes  !== null) tTRes  += tRes
    return { o, aRec, aDesp, aRes, aMargin, tRec, tDesp, tRes, tMargin }
  })

  if (sortMode === '2026')       rowsData.sort((a, b) => (b.aRes || 0) - (a.aRes || 0))
  else if (sortMode === 'total') rowsData.sort((a, b) => (b.tRes || 0) - (a.tRes || 0))
  else                           rowsData.sort((a, b) => a.o.consorcio.localeCompare(b.o.consorcio))

  const totAMargin = tARec ? (tARes / tARec) : null
  const totTMargin = tTRec ? (tTRes / tTRec) : null

  const renderRows = () => {
    if (sortMode !== 'grupo') return rowsData.map(row => <AcumRow key={row.o.num} {...row} />)
    const byGroup = rowsData.reduce((acc, row) => {
      const g = row.o.consorcio
      if (!acc[g]) acc[g] = []
      acc[g].push(row)
      return acc
    }, {})
    return Object.entries(byGroup).flatMap(([group, rows]) => {
      let gARec=0, gADesp=0, gARes=0, gTRec=0, gTDesp=0, gTRes=0
      rows.forEach(r => {
        if (r.aRec  !== null) gARec  += r.aRec
        if (r.aDesp !== null) gADesp += r.aDesp
        if (r.aRes  !== null) gARes  += r.aRes
        if (r.tRec  !== null) gTRec  += r.tRec
        if (r.tDesp !== null) gTDesp += r.tDesp
        if (r.tRes  !== null) gTRes  += r.tRes
      })
      return [
        ...rows.map(row => <AcumRow key={row.o.num} {...row} />),
        <SubTotalRow key={`sub-${group}`} group={group}
          aRec={gARec} aDesp={gADesp} aRes={gARes} aMargin={gARec ? gARes/gARec : null}
          tRec={gTRec} tDesp={gTDesp} tRes={gTRes} tMargin={gTRec ? gTRes/gTRec : null}
        />,
      ]
    })
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <AcumColGroup />
        <AcumHead />
        <tbody>
          {renderRows()}
          <TotRow aRec={tARec} aDesp={tADesp} aRes={tARes} aMargin={totAMargin}
                  tRec={tTRec} tDesp={tTDesp} tRes={tTRes} tMargin={totTMargin} />
        </tbody>
      </table>
    </div>
  )
}

// ── PREVISIBILIDADE TABLE — INTOCADA ──────────────────────
const PGAP = { width: 10, padding: 0, background: 'transparent', border: 'none' }

function PrevColGroup() {
  return (
    <colgroup>
      <col style={{ width: 100 }} />
      <col style={{ width: 40  }} />
      <col style={{ width: 150 }} />
      <col style={{ width: 10  }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 76  }} />
      <col style={{ width: 10  }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 110 }} />
      <col style={{ width: 76  }} />
      <col style={{ width: 76  }} />
      <col style={{ width: 80  }} />
    </colgroup>
  )
}

function PrevHead() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <td style={PGAP}/>
        <TH span={4} roundTL roundTR>Geral</TH>
        <td style={PGAP}/>
        <TH span={6} roundTL roundTR>% Poros</TH>
      </tr>
      <tr>
        <TH>Grupo</TH>
        <TH>#</TH>
        <TH>Nome</TH>
        <td style={PGAP}/>
        <TH>Receita</TH>
        <TH>Despesa</TH>
        <TH>Resultado</TH>
        <TH>% Res</TH>
        <td style={PGAP}/>
        <TH>Receita</TH>
        <TH>Despesa</TH>
        <TH>Resultado</TH>
        <TH>% Res</TH>
        <TH>ABC %</TH>
        <TH>ABC Acum.</TH>
      </tr>
    </thead>
  )
}

const abcCell = (hov) => ({
  ...baseCell,
  background: hov ? '#bfdbfe' : '#dbeafe',
  color: '#1e40af', fontWeight: 700,
  textAlign: 'center', fontVariantNumeric: 'tabular-nums',
  borderBottom: '1px solid var(--border)',
})

function PrevRow({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin, abcPct, abcCum }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />)}
      {td(o.num, { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 150, alignLeft: true })}
      <td style={PGAP}/>
      {td(fmt(gRec),       { num: true })}
      {td(fmt(gDesp),      { num: true })}
      {td(fmt(gRes),       { num: true })}
      {td(fmtPct(gMargin), { num: true })}
      <td style={PGAP}/>
      {td(fmt(pRec),       { num: true })}
      {td(fmt(pDesp),      { num: true })}
      {td(fmt(pRes),       { num: true })}
      {td(fmtPct(pMargin), { num: true })}
      <td style={abcCell(hov)}>{fmtPct(abcPct)}</td>
      <td style={abcCell(hov)}>{fmtPct(abcCum)}</td>
    </tr>
  )
}

export function TabelaPrevisibilidade({ obras, sortMode = 'grupo' }) {
  let tGRec=0, tGDesp=0, tGRes=0, tPRec=0, tPDesp=0, tPRes=0

  const rowsData = obras.reduce((acc, o) => {
    const gRec  = (o.p_rec  || 0) + (o.ad_rec  || 0)
    const gDesp = (o.p_desp || 0) + (o.ad_desp || 0)
    const gRes  = (o.p_res  || 0) + (o.ad_res  || 0)
    if (gRec === 0 && gDesp === 0 && gRes === 0) return acc
    const pRec  = applyPoros(gRec, o)
    const pDesp = applyPoros(gDesp, o)
    const pRes  = applyPoros(gRes, o)
    const gMargin = gRec ? (gRes / gRec) : null
    const pMargin = pRec ? (pRes / pRec) : null
    tGRec += gRec; tGDesp += gDesp; tGRes += gRes
    if (pRec  !== null) tPRec  += pRec
    if (pDesp !== null) tPDesp += pDesp
    if (pRes  !== null) tPRes  += pRes
    acc.push({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin })
    return acc
  }, [])

  if (sortMode === 'abc-geral')      rowsData.sort((a, b) => (b.gRes || 0) - (a.gRes || 0))
  else if (sortMode === 'abc-poros') rowsData.sort((a, b) => (b.pRes || 0) - (a.pRes || 0))
  else                               rowsData.sort((a, b) => a.o.consorcio.localeCompare(b.o.consorcio))

  const totGMargin = tGRec ? (tGRes / tGRec) : null
  const totPMargin = tPRec ? (tPRes / tPRec) : null

  let cumSum = 0
  const rowsWithAbc = rowsData.map(row => {
    const abcPct = tPRes ? (row.pRes / tPRes) : null
    cumSum += abcPct || 0
    return { ...row, abcPct, abcCum: cumSum }
  })

  const totCell = (v, isPct) => (
    <td style={{
      padding: '7px 12px', fontWeight: 700, fontSize: 11,
      color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    }}>
      {isPct ? fmtPct(v) : fmt(v)}
    </td>
  )

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <PrevColGroup />
        <PrevHead />
        <tbody>
          {rowsWithAbc.map(row => <PrevRow key={row.o.num} {...row} />)}
          <tr>
            <td colSpan={3} style={{ padding:'7px 14px', fontWeight:700, fontSize:11, color:'rgba(255,255,255,.9)', textAlign:'center', background:'#1e3a5f', borderBottomLeftRadius:8 }}>Total Geral</td>
            <td style={PGAP}/>
            {totCell(tGRec, false)}{totCell(tGDesp, false)}{totCell(tGRes, false)}{totCell(totGMargin, true)}
            <td style={PGAP}/>
            {totCell(tPRec, false)}{totCell(tPDesp, false)}{totCell(tPRes, false)}{totCell(totPMargin, true)}
            <td style={{ padding:'7px 12px', textAlign:'center', fontWeight:700, fontSize:11, background:'#1e3a5f', color:'rgba(255,255,255,.9)' }}>100%</td>
            <td style={{ padding:'7px 12px', textAlign:'center', fontWeight:700, fontSize:11, background:'#1e3a5f', color:'rgba(255,255,255,.9)', borderBottomRightRadius:8 }}>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── CONSOLIDADO ───────────────────────────────────────────
function ConsolidadoColGroup() {
  return (
    <colgroup>
      <col style={{ width: 60  }} />
      <col style={{ width: 20  }} />
      <col style={{ width: 120 }} />
      <col style={{ width: 80  }} />
      <col style={{ width: 80  }} />
      <col style={{ width: 80  }} />
      <col style={{ width: 40  }} />
    </colgroup>
  )
}

function ConsolidadoHead() {
  return (
    <thead>
      <tr>
        <TH span={7} roundTL roundTR>Consolidado — Acumulado + Previsibilidade + Prateleira + Aditivos</TH>
      </tr>
      <tr>
        <TH>Grupo</TH>
        <TH>#</TH>
        <TH>Nome</TH>
        <TH>Receita</TH>
        <TH>Despesa</TH>
        <TH>Resultado</TH>
        <TH>% Res</TH>
      </tr>
    </thead>
  )
}

function ConsolidadoRow({ o, rec, desp, res, margin }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />)}
      {td(o.num,  { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 170, alignLeft: true })}
      {td(fmt(rec),       { num: true })}
      {td(fmt(desp),      { num: true })}
      {td(fmt(res),       { num: true })}
      {td(fmtPct(margin), { num: true })}
    </tr>
  )
}

function ConsolidadoSubTotal({ group, rec, desp, res, margin }) {
  const c = gc(group)
  const s = (extra = {}) => ({
    padding: '5px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    background: c.bg, color: c.text,
    borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    ...extra,
  })
  return (
    <tr>
      <td colSpan={3} style={{ ...s(), textAlign: 'center' }}>Total {group}</td>
      <td style={s()}>{fmt(rec)}</td>
      <td style={s()}>{fmt(desp)}</td>
      <td style={s()}>{fmt(res)}</td>
      <td style={s()}>{fmtPct(margin)}</td>
    </tr>
  )
}

export function TabelaConsolidado({ obras, metric, sortMode }) {
  const isPoros = metric === 'poros'
  let tRec=0, tDesp=0, tRes=0

  const rowsData = obras.map(o => {
    const rawRec  = (o.at_rec  || 0) + (o.p_rec  || 0) + (o.ad_rec  || 0)
    const rawDesp = (o.at_desp || 0) + (o.p_desp || 0) + (o.ad_desp || 0)
    const rawRes  = (o.at_res  || 0) + (o.p_res  || 0) + (o.ad_res  || 0)
    const rec   = isPoros ? applyPoros(rawRec,  o) : rawRec
    const desp  = isPoros ? applyPoros(rawDesp, o) : rawDesp
    const res   = isPoros ? applyPoros(rawRes,  o) : rawRes
    const margin = rec ? (res / rec) : null
    tRec += rec; tDesp += desp; tRes += res
    return { o, rec, desp, res, margin }
  })

  if (sortMode === 'resultado') rowsData.sort((a, b) => (b.res || 0) - (a.res || 0))
  else                          rowsData.sort((a, b) => a.o.consorcio.localeCompare(b.o.consorcio))

  const totMargin = tRec ? (tRes / tRec) : null

  const renderRows = () => {
    if (sortMode !== 'grupo') return rowsData.map(r => <ConsolidadoRow key={r.o.num} {...r} />)
    const byGroup = rowsData.reduce((acc, row) => {
      const g = row.o.consorcio
      if (!acc[g]) acc[g] = []
      acc[g].push(row)
      return acc
    }, {})
    return Object.entries(byGroup).flatMap(([group, rows]) => {
      let gRec=0, gDesp=0, gRes=0
      rows.forEach(r => { gRec += r.rec; gDesp += r.desp; gRes += r.res })
      return [
        ...rows.map(r => <ConsolidadoRow key={r.o.num} {...r} />),
        <ConsolidadoSubTotal key={`sub-${group}`} group={group}
          rec={gRec} desp={gDesp} res={gRes} margin={gRec ? gRes/gRec : null}
        />,
      ]
    })
  }

  const totStyle = (extra = {}) => ({
    padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    ...extra,
  })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <ConsolidadoColGroup />
        <ConsolidadoHead />
        <tbody>
          {renderRows()}
          <tr>
            <td colSpan={3} style={totStyle({ borderBottomLeftRadius: 8 })}>Total Geral</td>
            <td style={totStyle()}>{fmt(tRec)}</td>
            <td style={totStyle()}>{fmt(tDesp)}</td>
            <td style={totStyle()}>{fmt(tRes)}</td>
            <td style={totStyle({ borderBottomRightRadius: 8 })}>{fmtPct(totMargin)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
