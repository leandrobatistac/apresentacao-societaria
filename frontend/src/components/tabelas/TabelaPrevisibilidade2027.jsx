import { useState } from 'react'
import {
  fmt, fmtPct, applyPoros, groupSortKey,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd,
} from './shared'

const PGAP = { width: 10, padding: 0, background: 'transparent', border: 'none' }

function Prev2027ColGroup() {
  return (
    <colgroup>
      <col style={{ width: 100 }} />
      <col style={{ width: 40  }} />
      <col style={{ width: 150 }} />
      <col style={{ width: 10  }} />
      <col style={{ width: 130 }} />
      <col style={{ width: 130 }} />
    </colgroup>
  )
}

function Prev2027Head() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <td style={PGAP}/>
        <TH span={2} roundTL roundTR>Backlog 2027</TH>
      </tr>
      <tr>
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <td style={PGAP}/>
        <TH>Geral</TH>
        <TH>% Poros</TH>
      </tr>
    </thead>
  )
}

function Prev2027Row({ o, rec, porosRec }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />)}
      {td(o.num,  { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 150, alignLeft: true })}
      <td style={PGAP}/>
      {td(fmt(rec),      { num: true, bL: true })}
      {td(fmt(porosRec), { num: true, bR: true })}
    </tr>
  )
}

export function TabelaPrevisibilidade2027({ obras, obrasAll }) {
  const hasP27 = o => o.p27 !== null && o.p27 !== undefined

  let ttRec = 0, ttPorosRec = 0
  ;(obrasAll || obras).filter(hasP27).forEach(o => {
    ttRec += o.p27
    const pr = applyPoros(o.p27, o)
    if (pr !== null) ttPorosRec += pr
  })

  const rowsData = obras
    .filter(hasP27)
    .map(o => ({
      o,
      rec:      o.p27,
      porosRec: applyPoros(o.p27, o),
    }))

  rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const totCell = (v, extra = {}) => (
    <td style={{
      padding: '7px 12px', fontWeight: 700, fontSize: 11,
      color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...extra,
    }}>
      {fmt(v)}
    </td>
  )

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <Prev2027ColGroup />
        <Prev2027Head />
        <tbody>
          {rowsData.map(row => <Prev2027Row key={row.o.num} {...row} />)}
          <tr><td colSpan={6} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <tr>
            <td colSpan={3} style={{ padding:'7px 14px', fontWeight:700, fontSize:11, color:'rgba(255,255,255,.9)', textAlign:'center', background:'#1e3a5f', borderBottomLeftRadius:8 }}>Total Geral</td>
            <td style={PGAP}/>
            {totCell(ttRec,      { bL: true })}
            {totCell(ttPorosRec, { bR: true, borderBottomRightRadius: 8 })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}