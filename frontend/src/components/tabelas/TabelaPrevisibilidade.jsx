import { useState } from 'react'
import {
  fmt, fmtPct, applyPoros, isObraZerada, groupSortKey,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd, baseCell,
} from './shared'

const PGAP = { width: 10, padding: 0, background: 'transparent', border: 'none' }

function PrevColGroup() {
  return (
    <colgroup>
      <col style={{ width: 100 }} /> {/* Grupo */}
      <col style={{ width: 40  }} /> {/* # */}
      <col style={{ width: 150 }} /> {/* Nome */}
      <col style={{ width: 10  }} /> {/* gap */}
      <col style={{ width: 100 }} /> {/* Prev Rec */}
      <col style={{ width: 100 }} /> {/* Prev Desp */}
      <col style={{ width: 100 }} /> {/* Prev Res */}
      <col style={{ width: 10  }} /> {/* gap */}
      <col style={{ width: 100 }} /> {/* Adic Rec */}
      <col style={{ width: 100 }} /> {/* Adic Desp */}
      <col style={{ width: 100 }} /> {/* Adic Res */}
      <col style={{ width: 10  }} /> {/* gap */}
      <col style={{ width: 100 }} /> {/* Total Rec */}
      <col style={{ width: 100 }} /> {/* Total Desp */}
      <col style={{ width: 100 }} /> {/* Total Res */}
      <col style={{ width: 70  }} /> {/* % Res */}
      <col style={{ width: 10  }} /> {/* gap */}
      <col style={{ width: 100 }} /> {/* Poros Rec */}
      <col style={{ width: 100 }} /> {/* Poros Desp */}
      <col style={{ width: 100 }} /> {/* Poros Res */}
      <col style={{ width: 70  }} /> {/* % Res */}
      <col style={{ width: 70  }} /> {/* % Unit */}
      <col style={{ width: 70  }} /> {/* % Acum */}
    </colgroup>
  )
}

function PrevHead() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <td style={PGAP}/>
        <TH span={3} roundTL roundTR>Previsibilidade 2026</TH>
        <td style={PGAP}/>
        <TH span={3} roundTL roundTR>Aditivos / Prateleira</TH>
        <td style={PGAP}/>
        <TH span={4} roundTL roundTR>Total Geral</TH>
        <td style={PGAP}/>
        <TH span={6} roundTL roundTR>% Poros</TH>
      </tr>
      <tr>
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH>
        <td style={PGAP}/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
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
  tRec, tDesp, tRes, tMargin,
  porosRec, porosDesp, porosRes, porosMargin,
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
      {td(fmt(pRec),          { num: true, bL: true })}
      {td(fmt(pDesp),         { num: true })}
      {td(fmt(pRes),          { num: true, bR: true })}
      <td style={PGAP}/>
      {td(fmt(aRec),          { num: true, bL: true })}
      {td(fmt(aDesp),         { num: true })}
      {td(fmt(aRes),          { num: true, bR: true })}
      <td style={PGAP}/>
      {td(fmt(tRec),          { num: true, bL: true })}
      {td(fmt(tDesp),         { num: true })}
      {td(fmt(tRes),          { num: true })}
      {td(fmtPct(tMargin),    { num: true, bR: true })}
      <td style={PGAP}/>
      {td(fmt(porosRec),      { num: true, bL: true })}
      {td(fmt(porosDesp),     { num: true })}
      {td(fmt(porosRes),      { num: true })}
      {td(fmtPct(porosMargin),{ num: true })}
      <td style={abcCell(hov)}>{fmtPct(abcPct)}</td>
      <td style={abcCell(hov)}>{fmtPct(abcCum)}</td>
    </tr>
  )
}

export function TabelaPrevisibilidade({ obras, obrasAll, sortMode = 'grupo' }) {
  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))

  // ── Totais fixos ──
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

  // ── Linhas visíveis ──
  const rowsData = obras.filter(o => !isObraZerada(o)).reduce((acc, o) => {
    const pRec = o.p_rec  || 0; const pDesp = o.p_desp || 0; const pRes = o.p_res  || 0
    const aRec = o.ad_rec || 0; const aDesp = o.ad_desp|| 0; const aRes = o.ad_res || 0
    const tRec = pRec + aRec;   const tDesp = pDesp + aDesp; const tRes = pRes + aRes
    if (tRec === 0 && tDesp === 0 && tRes === 0) return acc
    const porosRec  = applyPoros(tRec,  o)
    const porosDesp = applyPoros(tDesp, o)
    const porosRes  = applyPoros(tRes,  o)
    acc.push({
      o,
      pRec, pDesp, pRes,
      aRec, aDesp, aRes,
      tRec, tDesp, tRes, tMargin: tRec ? tRes/tRec : null,
      porosRec, porosDesp, porosRes, porosMargin: porosRec ? porosRes/porosRec : null,
    })
    return acc
  }, [])

  if (sortMode === 'abc-geral')      rowsData.sort((a, b) => (b.tRes    || 0) - (a.tRes    || 0))
  else if (sortMode === 'abc-poros') rowsData.sort((a, b) => (b.porosRes || 0) - (a.porosRes || 0))
  else                               rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  let cumSum = 0
  const rowsWithAbc = rowsData.map(row => {
    const abcPct = ttPorosRes ? (row.porosRes / ttPorosRes) : null
    cumSum += abcPct || 0
    return { ...row, abcPct, abcCum: cumSum }
  })

  const totCell = (v, isPct, extra = {}) => (
    <td style={{
      padding: '7px 12px', fontWeight: 700, fontSize: 11,
      color: 'rgba(255,255,255,.9)', textAlign: 'center', background: '#1e3a5f',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...extra,
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
          <tr><td colSpan={23} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <tr>
            <td colSpan={3} style={{ padding:'7px 14px', fontWeight:700, fontSize:11, color:'rgba(255,255,255,.9)', textAlign:'center', background:'#1e3a5f', borderBottomLeftRadius:8 }}>Total Geral</td>
            <td style={PGAP}/>
            {totCell(ttPRec,  false, { bL: true })}{totCell(ttPDesp, false)}{totCell(ttPRes,  false, { bR: true })}
            <td style={PGAP}/>
            {totCell(ttARec,  false, { bL: true })}{totCell(ttADesp, false)}{totCell(ttARes,  false, { bR: true })}
            <td style={PGAP}/>
            {totCell(ttTRec,  false, { bL: true })}{totCell(ttTDesp, false)}{totCell(ttTRes,  false)}
            {totCell(ttTRec ? ttTRes/ttTRec : null, true)}
            <td style={PGAP}/>
            {totCell(ttPorosRec, false, { bL: true })}{totCell(ttPorosDesp, false)}{totCell(ttPorosRes, false)}
            {totCell(ttPorosRec ? ttPorosRes/ttPorosRec : null, true)}
            <td style={{ padding:'7px 12px', textAlign:'center', fontWeight:700, fontSize:11, background:'#1e3a5f', color:'rgba(255,255,255,.9)' }}>100%</td>
            <td style={{ padding:'7px 12px', textAlign:'center', fontWeight:700, fontSize:11, background:'#1e3a5f', color:'rgba(255,255,255,.9)', borderBottomRightRadius:8 }}>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}