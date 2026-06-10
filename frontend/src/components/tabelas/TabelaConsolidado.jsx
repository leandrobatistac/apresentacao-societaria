import { useState } from 'react'
import {
  fmt, fmtPct, isObraZerada, groupSortKey, gc,
  GroupBadge, TH, makeTd, GROUP_ORDER,
} from './shared'

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
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
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
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...extra,
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

export function TabelaConsolidado({ obras, totaisFixos, metric, sortMode }) {
  const isPoros = metric === 'poros'
  const obrasVisiveis = obras.filter(o => !isObraZerada(o))

  const rowsData = obrasVisiveis.map(o => {
    const rawRec  = (o.at_rec  || 0) + (o.p_rec  || 0) + (o.ad_rec  || 0)
    const rawDesp = (o.at_desp || 0) + (o.p_desp || 0) + (o.ad_desp || 0)
    const rawRes  = (o.at_res  || 0) + (o.p_res  || 0) + (o.ad_res  || 0)
    const rec  = isPoros ? rawRec  * (o.pct ?? 1) : rawRec
    const desp = isPoros ? rawDesp * (o.pct ?? 1) : rawDesp
    const res  = isPoros ? rawRes  * (o.pct ?? 1) : rawRes
    return { o, rec, desp, res, margin: rec ? res/rec : null }
  })

  if (sortMode === 'resultado') rowsData.sort((a, b) => (b.res || 0) - (a.res || 0))
  else                          rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const renderRows = () => {
    if (sortMode !== 'grupo') return rowsData.map(r => <ConsolidadoRow key={r.o.num} {...r} />)
    const byGroup = rowsData.reduce((acc, row) => {
      const g = row.o.consorcio; if (!acc[g]) acc[g] = []; acc[g].push(row); return acc
    }, {})
    const entries = GROUP_ORDER.filter(g => byGroup[g]).map(g => [g, byGroup[g]])
    Object.keys(byGroup).forEach(g => { if (!GROUP_ORDER.includes(g)) entries.push([g, byGroup[g]]) })
    return entries.flatMap(([group, rows]) => {
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

  const tRec    = totaisFixos?.rec    ?? 0
  const tDesp   = totaisFixos?.desp   ?? 0
  const tRes    = totaisFixos?.res    ?? 0
  const tMargin = totaisFixos?.margin ?? null
  const totStyle = (extra = {}) => ({
    padding: '7px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...extra,
  })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <ConsolidadoColGroup />
        <ConsolidadoHead />
        <tbody>
          {renderRows()}
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