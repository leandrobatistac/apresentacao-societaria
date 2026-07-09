import { useState } from 'react'
import {
  fmt, fmtPct, applyPoros, groupSortKey, s,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd,
} from './shared'

const PGAP = { width: s(10), padding: 0, background: 'transparent', border: 'none' }

function Prev2027ColGroup() {
  return (
    <colgroup>
      <col style={{ width: s(100) }} />
      <col style={{ width: s(40)  }} />
      <col style={{ width: s(150) }} />
      <col style={{ width: s(10)  }} />
      <col style={{ width: s(145) }} /> {/* Backlog Geral — um pouco mais larga que o padrão */}
      <col style={{ width: s(145) }} /> {/* Backlog % Poros — idem */}
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

  const totCell = (v, extra = {}) => {
    const { borderBottomLeftRadius = 0, borderBottomRightRadius = 0 } = extra
    return (
      <td style={{ padding: 0, border: 'none' }}>
        <div style={{
          padding: `${s(7)}px ${s(12)}px`, fontWeight: 700, fontSize: s(11),
          color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
          fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
          borderBottomLeftRadius, borderBottomRightRadius,
        }}>
          {fmt(v)}
        </div>
      </td>
    )
  }

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <Prev2027ColGroup />
        <Prev2027Head />
        <tbody>
          {rowsData.map(row => <Prev2027Row key={row.o.num} {...row} />)}
          <tr><td colSpan={6} style={{ height: s(6), padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <tr>
            <td colSpan={3} style={{ padding: 0, border: 'none' }}>
              <div style={{ padding:`${s(7)}px ${s(14)}px`, fontWeight:700, fontSize:s(11), color:'rgba(255,255,255,.9)', textAlign:'center', background:'#1e3a5f', borderBottomLeftRadius:s(8), borderBottomRightRadius:s(8) }}>Total Geral</div>
            </td>
            <td style={PGAP}/>
            {totCell(ttRec,      { borderBottomLeftRadius: s(8) })}
            {totCell(ttPorosRec, { borderBottomRightRadius: s(8) })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
