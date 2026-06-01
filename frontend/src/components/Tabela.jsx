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

// Ordem canônica dos grupos
const GROUP_ORDER = ['POROS', 'GOIÁS', 'POROS COMIM', 'CONS. SP', 'CORTE', 'POROS MHEGA']

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

// Retorna true se a obra tem todos os campos financeiros zerados/nulos
function isObraZerada(o) {
  const fields = [
    'jan_rec','jan_desp','jan_res',
    'fev_rec','fev_desp','fev_res',
    'mar_rec','mar_desp','mar_res',
    'abr_rec','abr_desp','abr_res',
    'mai_rec','mai_desp','mai_res',
    'jun_rec','jun_desp','jun_res',
    'jul_rec','jul_desp','jul_res',
    'ago_rec','ago_desp','ago_res',
    'set_rec','set_desp','set_res',
    'out_rec','out_desp','out_res',
    'nov_rec','nov_desp','nov_res',
    'dez_rec','dez_desp','dez_res',
    'at_rec','at_desp','at_res',
    'p_rec','p_desp','p_res',
    'ad_rec','ad_desp','ad_res',
  ]
  return fields.every(f => !o[f])
}

// Ordena grupos conforme GROUP_ORDER
function groupSortKey(name) {
  const idx = GROUP_ORDER.indexOf(name)
  return idx === -1 ? 999 : idx
}

// ── Badge de Grupo ────────────────────────────────────────
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

const GAP = { width: 10, padding: 0, background: 'transparent', border: 'none' }
const GapTD  = ()  => <td style={GAP}/>
const GapTH  = ()  => <th style={GAP}/>

// Linha separadora antes do Total Geral
function SeparatorRow({ colCount }) {
  return (
    <tr>
      <td colSpan={colCount} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} />
    </tr>
  )
}

function TH({ children, span, roundTL, roundTR }) {
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
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius:  opts.rBL ? 8 : 0,
      borderBottomRightRadius: opts.rBR ? 8 : 0,
    }}>
      {content}
    </td>
  )
}

// ── ACUMULADO ────────────────────────────────────────────
const PERIODO_MESES = ['jan', 'fev', 'mar']
const MES_ATUAL     = 'abr'
const LABEL_PERIODO = 'Jan a Mar/26'
const LABEL_MES     = 'Abr/2026'
const LABEL_TOTAL   = 'Até Abr/26'

function somaPeríodo(o, campo) {
  return PERIODO_MESES.reduce((acc, m) => acc + (o[`${m}_${campo}`] ?? 0), 0)
}

function AcumColGroup() {
  return (
    <colgroup>
      <col style={{ width: 100 }} />
      <col style={{ width: 40  }} />
      <col style={{ width: 126 }} />
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
      <col style={{ width: 10  }} />
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
        <TH span={3} roundTL roundTR>Obra</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{LABEL_PERIODO}</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{LABEL_MES}</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{LABEL_TOTAL}</TH>
      </tr>
      <tr>
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <GapTH/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
        <GapTH/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
        <GapTH/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
      </tr>
    </thead>
  )
}

function AcumRow({ o, pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin, tRec, tDesp, tRes, tMargin }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />, { bL: true })}
      {td(o.num, { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 240, alignLeft: true, bR: true })}
      <GapTD/>
      {td(fmt(pRec),    { num: true, bL: true })}
      {td(fmt(pDesp),   { num: true })}
      {td(fmt(pRes),    { num: true })}
      {td(fmtPct(pMargin), { num: true, bR: true })}
      <GapTD/>
      {td(fmt(mRec),    { num: true, bL: true })}
      {td(fmt(mDesp),   { num: true })}
      {td(fmt(mRes),    { num: true })}
      {td(fmtPct(mMargin), { num: true, bR: true })}
      <GapTD/>
      {td(fmt(tRec),    { num: true, bL: true })}
      {td(fmt(tDesp),   { num: true })}
      {td(fmt(tRes),    { num: true })}
      {td(fmtPct(tMargin), { num: true, bR: true })}
    </tr>
  )
}

function AcumSubTotalRow({ group, pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin, tRec, tDesp, tRes, tMargin }) {
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
      <td colSpan={3} style={s({ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' })}>Total {group}</td>
      <td style={GAP}/>
      <td style={s({ borderLeft: '1px solid var(--border)' })}>{fmt(pRec)}</td>
      <td style={s()}>{fmt(pDesp)}</td>
      <td style={s()}>{fmt(pRes)}</td>
      <td style={s({ borderRight: '1px solid var(--border)' })}>{fmtPct(pMargin)}</td>
      <td style={GAP}/>
      <td style={s({ borderLeft: '1px solid var(--border)' })}>{fmt(mRec)}</td>
      <td style={s()}>{fmt(mDesp)}</td>
      <td style={s()}>{fmt(mRes)}</td>
      <td style={s({ borderRight: '1px solid var(--border)' })}>{fmtPct(mMargin)}</td>
      <td style={GAP}/>
      <td style={s({ borderLeft: '1px solid var(--border)' })}>{fmt(tRec)}</td>
      <td style={s()}>{fmt(tDesp)}</td>
      <td style={s()}>{fmt(tRes)}</td>
      <td style={s({ borderRight: '1px solid var(--border)' })}>{fmtPct(tMargin)}</td>
    </tr>
  )
}

function AcumTotRow({ pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin, tRec, tDesp, tRes, tMargin }) {
  const base = {
    padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  }
  const cell = (v, isPct, extra = {}) => (
    <td style={{ ...base, ...extra }}>{isPct ? fmtPct(v) : fmt(v)}</td>
  )
  return (
    <tr>
      <td colSpan={3} style={{ ...base, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>Total Geral</td>
      <td style={GAP}/>
      {cell(pRec,    false, { borderBottomLeftRadius: 8 })}
      {cell(pDesp,   false)}
      {cell(pRes,    false)}
      {cell(pMargin, true,  { borderBottomRightRadius: 8 })}
      <td style={GAP}/>
      {cell(mRec,    false, { borderBottomLeftRadius: 8 })}
      {cell(mDesp,   false)}
      {cell(mRes,    false)}
      {cell(mMargin, true,  { borderBottomRightRadius: 8 })}
      <td style={GAP}/>
      {cell(tRec,    false, { borderBottomLeftRadius: 8 })}
      {cell(tDesp,   false)}
      {cell(tRes,    false)}
      {cell(tMargin, true,  { borderBottomRightRadius: 8 })}
    </tr>
  )
}

// obras     = obras já filtradas (para exibição)
// obrasAll  = todas as obras (para Total Geral fixo)
export function TabelaAcumulado({ obras, obrasAll, metric }) {
  const isPoros = metric === 'poros'
  const ap = (v, o) => isPoros ? applyPoros(v, o) : v

  // ── Total Geral fixo: usa obrasAll sem filtro e sem obras zeradas ──
  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))
  let tPRec=0, tPDesp=0, tPRes=0
  let tMRec=0, tMDesp=0, tMRes=0
  let tTRec=0, tTDesp=0, tTRes=0

  obrasAllAtivas.forEach(o => {
    tPRec  += ap(somaPeríodo(o, 'rec'),  o) ?? 0
    tPDesp += ap(somaPeríodo(o, 'desp'), o) ?? 0
    tPRes  += ap(somaPeríodo(o, 'res'),  o) ?? 0
    tMRec  += ap(o[`${MES_ATUAL}_rec`]  ?? null, o) ?? 0
    tMDesp += ap(o[`${MES_ATUAL}_desp`] ?? null, o) ?? 0
    tMRes  += ap(o[`${MES_ATUAL}_res`]  ?? null, o) ?? 0
    tTRec  += ap(o.at_rec,  o) ?? 0
    tTDesp += ap(o.at_desp, o) ?? 0
    tTRes  += ap(o.at_res,  o) ?? 0
  })

  // ── Linhas visíveis: obras filtradas, sem zeradas ──
  const obrasVisiveis = obras.filter(o => !isObraZerada(o))

  const rowsData = obrasVisiveis.map(o => {
    const pRec  = ap(somaPeríodo(o, 'rec'),  o)
    const pDesp = ap(somaPeríodo(o, 'desp'), o)
    const pRes  = ap(somaPeríodo(o, 'res'),  o)
    const mRec  = ap(o[`${MES_ATUAL}_rec`]  ?? null, o)
    const mDesp = ap(o[`${MES_ATUAL}_desp`] ?? null, o)
    const mRes  = ap(o[`${MES_ATUAL}_res`]  ?? null, o)
    const tRec  = ap(o.at_rec,  o)
    const tDesp = ap(o.at_desp, o)
    const tRes  = ap(o.at_res,  o)
    return {
      o,
      pRec, pDesp, pRes, pMargin: pRec ? pRes / pRec : null,
      mRec, mDesp, mRes, mMargin: mRec ? mRes / mRec : null,
      tRec, tDesp, tRes, tMargin: tRec ? tRes / tRec : null,
    }
  })

  // Ordena por ordem canônica de grupo
  rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const byGroup = rowsData.reduce((acc, row) => {
    const g = row.o.consorcio; if (!acc[g]) acc[g] = []; acc[g].push(row); return acc
  }, {})

  // Garante que os grupos aparecem na ordem canônica
  const groupEntries = GROUP_ORDER
    .filter(g => byGroup[g])
    .map(g => [g, byGroup[g]])

  // Adiciona grupos não previstos no GROUP_ORDER ao final
  Object.keys(byGroup).forEach(g => {
    if (!GROUP_ORDER.includes(g)) groupEntries.push([g, byGroup[g]])
  })

  const rows = groupEntries.flatMap(([group, rows]) => {
    let gPRec=0, gPDesp=0, gPRes=0, gMRec=0, gMDesp=0, gMRes=0, gTRec=0, gTDesp=0, gTRes=0
    rows.forEach(r => {
      gPRec += r.pRec??0; gPDesp += r.pDesp??0; gPRes += r.pRes??0
      gMRec += r.mRec??0; gMDesp += r.mDesp??0; gMRes += r.mRes??0
      gTRec += r.tRec??0; gTDesp += r.tDesp??0; gTRes += r.tRes??0
    })
    return [
      ...rows.map(r => <AcumRow key={r.o.num} {...r}/>),
      <AcumSubTotalRow key={`sub-${group}`} group={group}
        pRec={gPRec} pDesp={gPDesp} pRes={gPRes} pMargin={gPRec ? gPRes/gPRec : null}
        mRec={gMRec} mDesp={gMDesp} mRes={gMRes} mMargin={gMRec ? gMRes/gMRec : null}
        tRec={gTRec} tDesp={gTDesp} tRes={gTRes} tMargin={gTRec ? gTRes/gTRec : null}
      />,
    ]
  })

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <AcumColGroup />
        <AcumHead />
        <tbody>
          {rows}
          {/* Separador antes do Total Geral */}
          <tr><td colSpan={18} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <AcumTotRow
            pRec={tPRec} pDesp={tPDesp} pRes={tPRes} pMargin={tPRec ? tPRes/tPRec : null}
            mRec={tMRec} mDesp={tMDesp} mRes={tMRes} mMargin={tMRec ? tMRes/tMRec : null}
            tRec={tTRec} tDesp={tTDesp} tRes={tTRes} tMargin={tTRec ? tTRes/tTRec : null}
          />
        </tbody>
      </table>
    </div>
  )
}

// ── PREVISIBILIDADE ───────────────────────────────────────
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
        <TH>% Unit.</TH>
        <TH>% Acum.</TH>
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

// obras     = obras já filtradas
// obrasAll  = todas as obras (Total Geral fixo)
export function TabelaPrevisibilidade({ obras, obrasAll, sortMode = 'grupo' }) {

  // ── Total Geral fixo ──
  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))
  let tGRec=0, tGDesp=0, tGRes=0, tPRec=0, tPDesp=0, tPRes=0

  obrasAllAtivas.forEach(o => {
    const gRec  = (o.p_rec  || 0) + (o.ad_rec  || 0)
    const gDesp = (o.p_desp || 0) + (o.ad_desp || 0)
    const gRes  = (o.p_res  || 0) + (o.ad_res  || 0)
    if (gRec === 0 && gDesp === 0 && gRes === 0) return
    tGRec += gRec; tGDesp += gDesp; tGRes += gRes
    const pRec  = applyPoros(gRec, o)
    const pDesp = applyPoros(gDesp, o)
    const pRes  = applyPoros(gRes, o)
    if (pRec  !== null) tPRec  += pRec
    if (pDesp !== null) tPDesp += pDesp
    if (pRes  !== null) tPRes  += pRes
  })

  const totGMargin = tGRec ? (tGRes / tGRec) : null
  const totPMargin = tPRec ? (tPRes / tPRec) : null

  // ── Linhas visíveis ──
  const obrasVisiveis = obras.filter(o => !isObraZerada(o))

  const rowsData = obrasVisiveis.reduce((acc, o) => {
    const gRec  = (o.p_rec  || 0) + (o.ad_rec  || 0)
    const gDesp = (o.p_desp || 0) + (o.ad_desp || 0)
    const gRes  = (o.p_res  || 0) + (o.ad_res  || 0)
    if (gRec === 0 && gDesp === 0 && gRes === 0) return acc
    const pRec  = applyPoros(gRec, o)
    const pDesp = applyPoros(gDesp, o)
    const pRes  = applyPoros(gRes, o)
    const gMargin = gRec ? (gRes / gRec) : null
    const pMargin = pRec ? (pRes / pRec) : null
    acc.push({ o, gRec, gDesp, gRes, gMargin, pRec, pDesp, pRes, pMargin })
    return acc
  }, [])

  if (sortMode === 'abc-geral')      rowsData.sort((a, b) => (b.gRes || 0) - (a.gRes || 0))
  else if (sortMode === 'abc-poros') rowsData.sort((a, b) => (b.pRes || 0) - (a.pRes || 0))
  else                               rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  let cumSum = 0
  const rowsWithAbc = rowsData.map(row => {
    const abcPct = tPRes ? (row.pRes / tPRes) : null
    cumSum += abcPct || 0
    return { ...row, abcPct, abcCum: cumSum }
  })

  const totCell = (v, isPct, extra = {}) => (
    <td style={{
      padding: '7px 12px', fontWeight: 700, fontSize: 11,
      color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      ...extra,
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
          {/* Separador antes do Total Geral */}
          <tr><td colSpan={15} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
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

// obras        = obras já filtradas (para exibição das linhas)
// totaisFixos  = { rec, desp, res, margin } calculado no pai sobre TODAS as obras
// metric       = 'geral' | 'poros'  (usado só para calcular as linhas visíveis)
export function TabelaConsolidado({ obras, totaisFixos, metric, sortMode }) {
  const isPoros = metric === 'poros'

  // ── Linhas visíveis: obras filtradas, sem zeradas ──
  const obrasVisiveis = obras.filter(o => !isObraZerada(o))

  const rowsData = obrasVisiveis.map(o => {
    const rawRec  = (o.at_rec  || 0) + (o.p_rec  || 0) + (o.ad_rec  || 0)
    const rawDesp = (o.at_desp || 0) + (o.p_desp || 0) + (o.ad_desp || 0)
    const rawRes  = (o.at_res  || 0) + (o.p_res  || 0) + (o.ad_res  || 0)
    const rec  = isPoros ? (rawRec  * (o.pct ?? 1)) : rawRec
    const desp = isPoros ? (rawDesp * (o.pct ?? 1)) : rawDesp
    const res  = isPoros ? (rawRes  * (o.pct ?? 1)) : rawRes
    const margin = rec ? (res / rec) : null
    return { o, rec, desp, res, margin }
  })

  if (sortMode === 'resultado') rowsData.sort((a, b) => (b.res || 0) - (a.res || 0))
  else                          rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const renderRows = () => {
    if (sortMode !== 'grupo') return rowsData.map(r => <ConsolidadoRow key={r.o.num} {...r} />)

    const byGroup = rowsData.reduce((acc, row) => {
      const g = row.o.consorcio; if (!acc[g]) acc[g] = []; acc[g].push(row); return acc
    }, {})

    const groupEntries = GROUP_ORDER
      .filter(g => byGroup[g])
      .map(g => [g, byGroup[g]])
    Object.keys(byGroup).forEach(g => {
      if (!GROUP_ORDER.includes(g)) groupEntries.push([g, byGroup[g]])
    })

    return groupEntries.flatMap(([group, rows]) => {
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

  // Total Geral vem pronto do pai — imune a qualquer filtro
  const tRec    = totaisFixos?.rec    ?? 0
  const tDesp   = totaisFixos?.desp   ?? 0
  const tRes    = totaisFixos?.res    ?? 0
  const tMargin = totaisFixos?.margin ?? null

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
          {/* Separador antes do Total Geral */}
          <tr><td colSpan={7} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <tr>
            <td colSpan={3} style={totStyle({ borderBottomLeftRadius: 8 })}>Total Geral</td>
            <td style={totStyle()}>{fmt(tRec)}</td>
            <td style={totStyle()}>{fmt(tDesp)}</td>
            <td style={totStyle()}>{fmt(tRes)}</td>
            <td style={totStyle({ borderBottomRightRadius: 8 })}>{fmtPct(tMargin)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
