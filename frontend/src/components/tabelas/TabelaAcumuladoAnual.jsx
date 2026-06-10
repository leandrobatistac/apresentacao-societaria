import { useState } from 'react'
import { PERIODO } from '../../config/periodo'
import {
  fmt, fmtPct, applyPoros, isObraZerada, groupSortKey, gc,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd, buildGroupEntries,
} from './shared'

function AcumAnualColGroup() {
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
    </colgroup>
  )
}

function AcumAnualHead() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>Acumulado em 2026</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{PERIODO.labelAte}</TH>
      </tr>
      <tr>
        <TH>Grupo</TH><TH>#</TH><TH>Nome</TH>
        <GapTH/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
        <GapTH/>
        <TH>Receita</TH><TH>Despesa</TH><TH>Resultado</TH><TH>% Res</TH>
      </tr>
    </thead>
  )
}

function AcumAnualRow({ o, aRec, aDesp, aRes, aMargin, hRec, hDesp, hRes, hMargin }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />, { bL: true })}
      {td(o.num,  { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 240, alignLeft: true, bR: true })}
      <GapTD/>
      {td(fmt(aRec),       { num: true, bL: true })}
      {td(fmt(aDesp),      { num: true })}
      {td(fmt(aRes),       { num: true })}
      {td(fmtPct(aMargin), { num: true, bR: true })}
      <GapTD/>
      {td(fmt(hRec),       { num: true, bL: true })}
      {td(fmt(hDesp),      { num: true })}
      {td(fmt(hRes),       { num: true })}
      {td(fmtPct(hMargin), { num: true, bR: true })}
    </tr>
  )
}

function AcumAnualSubTotalRow({ group, aRec, aDesp, aRes, aMargin, hRec, hDesp, hRes, hMargin }) {
  const c = gc(group)
  const s = (extra = {}) => ({
    padding: '5px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    background: c.bg, color: c.text,
    borderBottom: '1px solid var(--border)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    ...extra,
  })
  return (
    <tr>
      <td colSpan={3} style={s({ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' })}>Total {group}</td>
      <td style={GAP}/>
      <td style={s({ borderLeft: '1px solid var(--border)' })}>{fmt(aRec)}</td>
      <td style={s()}>{fmt(aDesp)}</td>
      <td style={s()}>{fmt(aRes)}</td>
      <td style={s({ borderRight: '1px solid var(--border)' })}>{fmtPct(aMargin)}</td>
      <td style={GAP}/>
      <td style={s({ borderLeft: '1px solid var(--border)' })}>{fmt(hRec)}</td>
      <td style={s()}>{fmt(hDesp)}</td>
      <td style={s()}>{fmt(hRes)}</td>
      <td style={s({ borderRight: '1px solid var(--border)' })}>{fmtPct(hMargin)}</td>
    </tr>
  )
}

function AcumAnualTotRow({ aRec, aDesp, aRes, aMargin, hRec, hDesp, hRes, hMargin }) {
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
      {cell(aRec,    false, { borderBottomLeftRadius: 8 })}
      {cell(aDesp,   false)}
      {cell(aRes,    false)}
      {cell(aMargin, true,  { borderBottomRightRadius: 8 })}
      <td style={GAP}/>
      {cell(hRec,    false, { borderBottomLeftRadius: 8 })}
      {cell(hDesp,   false)}
      {cell(hRes,    false)}
      {cell(hMargin, true,  { borderBottomRightRadius: 8 })}
    </tr>
  )
}

export function TabelaAcumuladoAnual({ obras, obrasAll, metric }) {
  const isPoros = metric === 'poros'
  const ap = (v, o) => isPoros ? applyPoros(v, o) : v

  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))
  let tARec=0, tADesp=0, tARes=0, tHRec=0, tHDesp=0, tHRes=0

  obrasAllAtivas.forEach(o => {
    tARec  += ap(o.a26_rec,  o) ?? 0
    tADesp += ap(o.a26_desp, o) ?? 0
    tARes  += ap(o.a26_res,  o) ?? 0
    tHRec  += ap(o.at_rec,   o) ?? 0
    tHDesp += ap(o.at_desp,  o) ?? 0
    tHRes  += ap(o.at_res,   o) ?? 0
  })

  const rowsData = obras.filter(o => !isObraZerada(o)).map(o => {
    const aRec  = ap(o.a26_rec,  o)
    const aDesp = ap(o.a26_desp, o)
    const aRes  = ap(o.a26_res,  o)
    const hRec  = ap(o.at_rec,   o)
    const hDesp = ap(o.at_desp,  o)
    const hRes  = ap(o.at_res,   o)
    return {
      o,
      aRec, aDesp, aRes, aMargin: aRec ? aRes / aRec : null,
      hRec, hDesp, hRes, hMargin: hRec ? hRes / hRec : null,
    }
  })

  rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const rows = buildGroupEntries(rowsData).flatMap(([group, rows]) => {
    let gARec=0, gADesp=0, gARes=0, gHRec=0, gHDesp=0, gHRes=0
    rows.forEach(r => {
      gARec += r.aRec??0; gADesp += r.aDesp??0; gARes += r.aRes??0
      gHRec += r.hRec??0; gHDesp += r.hDesp??0; gHRes += r.hRes??0
    })
    return [
      ...rows.map(r => <AcumAnualRow key={r.o.num} {...r}/>),
      <AcumAnualSubTotalRow key={`sub-${group}`} group={group}
        aRec={gARec} aDesp={gADesp} aRes={gARes} aMargin={gARec ? gARes/gARec : null}
        hRec={gHRec} hDesp={gHDesp} hRes={gHRes} hMargin={gHRec ? gHRes/gHRec : null}
      />,
    ]
  })

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <AcumAnualColGroup />
        <AcumAnualHead />
        <tbody>
          {rows}
          <tr><td colSpan={13} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <AcumAnualTotRow
            aRec={tARec} aDesp={tADesp} aRes={tARes} aMargin={tARec ? tARes/tARec : null}
            hRec={tHRec} hDesp={tHDesp} hRes={tHRes} hMargin={tHRec ? tHRes/tHRec : null}
          />
        </tbody>
      </table>
    </div>
  )
}