import { useState } from 'react'
import {
  fmt, fmtPct, applyPoros, isObraZerada, groupSortKey, s,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd, baseCell,
} from './shared'

const PGAP = { width: s(10), padding: 0, background: 'transparent', border: 'none' }

function PrevColGroup() {
  return (
    <colgroup>
      <col style={{ width: s(100) }} /> {/* Grupo */}
      <col style={{ width: s(40)  }} /> {/* # */}
      <col style={{ width: s(150) }} /> {/* Nome */}
      <col style={{ width: s(10)  }} /> {/* gap */}
      <col style={{ width: s(100) }} /> {/* Prev Rec */}
      <col style={{ width: s(100) }} /> {/* Prev Desp */}
      <col style={{ width: s(100) }} /> {/* Prev Res */}
      <col style={{ width: s(10)  }} /> {/* gap */}
      <col style={{ width: s(100) }} /> {/* Adit Rec */}
      <col style={{ width: s(100) }} /> {/* Adit Desp */}
      <col style={{ width: s(100) }} /> {/* Adit Res */}
      <col style={{ width: s(10)  }} /> {/* gap */}
      <col style={{ width: s(100) }} /> {/* Total Rec */}
      <col style={{ width: s(100) }} /> {/* Total Desp */}
      <col style={{ width: s(100) }} /> {/* Total Res */}
      <col style={{ width: s(70)  }} /> {/* Total % Res */}
      <col style={{ width: s(70)  }} /> {/* % Unit */}
      <col style={{ width: s(70)  }} /> {/* % Acum */}
    </colgroup>
  )
}

function PrevHead({ isPoros }) {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <td style={PGAP}/>
        <TH span={3} roundTL roundTR>Previsibilidade 2026</TH>
        <td style={PGAP}/>
        <TH span={3} roundTL roundTR>Aditivos / Prateleira</TH>
        <td style={PGAP}/>
        <TH span={6} roundTL roundTR>{`Total ${isPoros ? '(% Poros)' : '(Geral)'}`}</TH>
      </tr>
      <tr>
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
        <TH>% Unit.</TH><TH>% Acum.</TH>
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

function PrevRow({ o,
  pRec, pDesp, pRes,
  aRec, aDesp, aRes,
  dispRec, dispDesp, dispRes, dispMargin,
  abcPct, abcCum,
}) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />)}
      {td(o.num,  { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 150, alignLeft: true })}
      <td style={PGAP}/>
      {td(fmt(pRec),  { num: true, bL: true })}
      {td(fmt(pDesp), { num: true })}
      {td(fmt(pRes),  { num: true, bR: true })}
      <td style={PGAP}/>
      {td(fmt(aRec),  { num: true, bL: true })}
      {td(fmt(aDesp), { num: true })}
      {td(fmt(aRes),  { num: true, bR: true })}
      <td style={PGAP}/>
      {td(fmt(dispRec),       { num: true, bL: true })}
      {td(fmt(dispDesp),      { num: true })}
      {td(fmt(dispRes),       { num: true })}
      {td(fmtPct(dispMargin), { num: true, bR: true })}
      <td style={abcCell(hov)}>{fmtPct(abcPct)}</td>
      <td style={abcCell(hov)}>{fmtPct(abcCum)}</td>
    </tr>
  )
}

export function TabelaPrevisibilidade({ obras, obrasAll, sortMode = 'abc', metric = 'poros' }) {
  const isPoros = metric === 'poros'
  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))

  // ── Totais fixos (sempre calculamos os dois lados; escolhemos qual mostrar depois) ──
  let ttPRec=0, ttPDesp=0, ttPRes=0
  let ttARec=0, ttADesp=0, ttARes=0
  let ttTRec=0, ttTDesp=0, ttTRes=0
  let ttPorosRec=0, ttPorosDesp=0, ttPorosRes=0

  obrasAllAtivas.forEach(o => {
    const pRec = o.p_rec  || 0; const pDesp = o.p_desp || 0; const pRes = o.p_res  || 0
    const aRec = o.ad_rec || 0; const aDesp = o.ad_desp|| 0; const aRes = o.ad_res || 0
    const tRec = pRec + aRec;   const tDesp = pDesp + aDesp; const tRes = pRes + aRes
    if (tRec === 0 && tDesp === 0 && tRes === 0) return
    ttPRec += pRec; ttPDesp += pDesp; ttPRes += pRes
    ttARec += aRec; ttADesp += aDesp; ttARes += aRes
    ttTRec += tRec; ttTDesp += tDesp; ttTRes += tRes
    const pr = applyPoros(tRec, o); const pd = applyPoros(tDesp, o); const ps = applyPoros(tRes, o)
    if (pr !== null) ttPorosRec  += pr
    if (pd !== null) ttPorosDesp += pd
    if (ps !== null) ttPorosRes  += ps
  })

  // Total exibido no painel "Total", conforme o filtro de métrica
  const ttDispRec  = isPoros ? ttPorosRec  : ttTRec
  const ttDispDesp = isPoros ? ttPorosDesp : ttTDesp
  const ttDispRes  = isPoros ? ttPorosRes  : ttTRes
  const ttDispMargin = ttDispRec ? ttDispRes / ttDispRec : null

  // ── Linhas visíveis ──
  const rowsData = obras.filter(o => !isObraZerada(o)).reduce((acc, o) => {
    const pRec = o.p_rec  || 0; const pDesp = o.p_desp || 0; const pRes = o.p_res  || 0
    const aRec = o.ad_rec || 0; const aDesp = o.ad_desp|| 0; const aRes = o.ad_res || 0
    const tRec = pRec + aRec;   const tDesp = pDesp + aDesp; const tRes = pRes + aRes
    if (tRec === 0 && tDesp === 0 && tRes === 0) return acc
    const porosRec  = applyPoros(tRec,  o)
    const porosDesp = applyPoros(tDesp, o)
    const porosRes  = applyPoros(tRes,  o)

    // Valores do painel "Total", conforme o filtro de métrica
    const dispRec    = isPoros ? porosRec    : tRec
    const dispDesp   = isPoros ? porosDesp   : tDesp
    const dispRes    = isPoros ? porosRes    : tRes
    const dispMargin = dispRec ? dispRes / dispRec : null

    acc.push({
      o,
      pRec, pDesp, pRes,
      aRec, aDesp, aRes,
      dispRec, dispDesp, dispRes, dispMargin,
    })
    return acc
  }, [])

  if (sortMode === 'abc') rowsData.sort((a, b) => (b.dispRes || 0) - (a.dispRes || 0))
  else                    rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  let cumSum = 0
  const rowsWithAbc = rowsData.map(row => {
    const abcPct = ttDispRes ? (row.dispRes / ttDispRes) : null
    cumSum += abcPct || 0
    return { ...row, abcPct, abcCum: cumSum }
  })

  const totCell = (v, isPct, extra = {}) => {
    const { borderBottomLeftRadius = 0, borderBottomRightRadius = 0 } = extra
    return (
      <td style={{ padding: 0, border: 'none' }}>
        <div style={{
          padding: `${s(7)}px ${s(12)}px`, fontWeight: 700, fontSize: s(11),
          color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
          fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
          borderBottomLeftRadius, borderBottomRightRadius,
        }}>
          {isPct ? fmtPct(v) : fmt(v)}
        </div>
      </td>
    )
  }

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <PrevColGroup />
        <PrevHead isPoros={isPoros} />
        <tbody>
          {rowsWithAbc.map(row => <PrevRow key={row.o.num} {...row} />)}
          <tr><td colSpan={18} style={{ height: s(6), padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <tr>
            <td colSpan={3} style={{ padding: 0, border: 'none' }}>
              <div style={{ padding:`${s(7)}px ${s(14)}px`, fontWeight:700, fontSize:s(11), color:'rgba(255,255,255,.9)', textAlign:'center', background:'#1e3a5f', borderBottomLeftRadius:s(8), borderBottomRightRadius:s(8) }}>Total Geral</div>
            </td>
            <td style={PGAP}/>
            {totCell(ttPRec,  false, { borderBottomLeftRadius: s(8) })}{totCell(ttPDesp, false)}{totCell(ttPRes,  false, { borderBottomRightRadius: s(8) })}
            <td style={PGAP}/>
            {totCell(ttARec,  false, { borderBottomLeftRadius: s(8) })}{totCell(ttADesp, false)}{totCell(ttARes,  false, { borderBottomRightRadius: s(8) })}
            <td style={PGAP}/>
            {totCell(ttDispRec,  false, { borderBottomLeftRadius: s(8) })}{totCell(ttDispDesp, false)}{totCell(ttDispRes,  false)}
            {totCell(ttDispMargin, true)}
            <td style={{ padding: 0, border: 'none' }}>
              <div style={{ padding:`${s(7)}px ${s(12)}px`, textAlign:'center', fontWeight:700, fontSize:s(11), background:'#1e3a5f', color:'rgba(255,255,255,.9)' }}>100%</div>
            </td>
            <td style={{ padding: 0, border: 'none' }}>
              <div style={{ padding:`${s(7)}px ${s(12)}px`, textAlign:'center', fontWeight:700, fontSize:s(11), background:'#1e3a5f', color:'rgba(255,255,255,.9)', borderBottomRightRadius:s(8) }}>100%</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
