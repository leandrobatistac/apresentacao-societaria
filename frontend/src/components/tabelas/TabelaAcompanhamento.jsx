import { useState } from 'react'
import { PERIODO } from '../../config/periodo'
import {
  fmt, fmtPct, applyPoros, isObraZerada, groupSortKey, gc,
  GroupBadge, GAP, GapTD, GapTH, TH, makeTd, buildGroupEntries,
} from './shared'

function AcompColGroup() {
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

function AcompHead() {
  return (
    <thead>
      <tr>
        <TH span={3} roundTL roundTR>Obra</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{PERIODO.labelPeriodo}</TH>
        <GapTH/>
        <TH span={4} roundTL roundTR>{PERIODO.labelMes}</TH>
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

function AcompRow({ o, pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const td = makeTd(bg)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={o.consorcio} />, { bL: true })}
      {td(o.num,  { bold: true })}
      {td(o.nome, { bold: true, nowrap: true, maxWidth: 240, alignLeft: true, bR: true })}
      <GapTD/>
      {td(fmt(pRec),       { num: true, bL: true })}
      {td(fmt(pDesp),      { num: true })}
      {td(fmt(pRes),       { num: true })}
      {td(fmtPct(pMargin), { num: true, bR: true })}
      <GapTD/>
      {td(fmt(mRec),       { num: true, bL: true })}
      {td(fmt(mDesp),      { num: true })}
      {td(fmt(mRes),       { num: true })}
      {td(fmtPct(mMargin), { num: true, bR: true })}
    </tr>
  )
}

function AcompSubTotalRow({ group, pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin }) {
  const col = gc(group)
  const s = (extra = {}) => ({
    padding: '5px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    background: col.bg, color: col.text,
    borderBottom: '1px solid var(--border)',
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
    </tr>
  )
}

function AcompTotRow({ pRec, pDesp, pRes, pMargin, mRec, mDesp, mRes, mMargin }) {
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
    </tr>
  )
}

function somaPeríodo(o, campo) {
  return PERIODO.meses.reduce((acc, m) => acc + (o[`${m}_${campo}`] ?? 0), 0)
}

export function TabelaAcompanhamento({ obras, obrasAll, metric }) {
  const isPoros = metric === 'poros'
  const ap = (v, o) => isPoros ? applyPoros(v, o) : v

  const obrasAllAtivas = (obrasAll || obras).filter(o => !isObraZerada(o))
  let tPRec=0, tPDesp=0, tPRes=0, tMRec=0, tMDesp=0, tMRes=0

  obrasAllAtivas.forEach(o => {
    tPRec  += ap(somaPeríodo(o, 'rec'),  o) ?? 0
    tPDesp += ap(somaPeríodo(o, 'desp'), o) ?? 0
    tPRes  += ap(somaPeríodo(o, 'res'),  o) ?? 0
    tMRec  += ap(o[`${PERIODO.mes}_rec`]  ?? null, o) ?? 0
    tMDesp += ap(o[`${PERIODO.mes}_desp`] ?? null, o) ?? 0
    tMRes  += ap(o[`${PERIODO.mes}_res`]  ?? null, o) ?? 0
  })

  const rowsData = obras.filter(o => !isObraZerada(o)).map(o => {
    const pRec  = ap(somaPeríodo(o, 'rec'),  o)
    const pDesp = ap(somaPeríodo(o, 'desp'), o)
    const pRes  = ap(somaPeríodo(o, 'res'),  o)
    const mRec  = ap(o[`${PERIODO.mes}_rec`]  ?? null, o)
    const mDesp = ap(o[`${PERIODO.mes}_desp`] ?? null, o)
    const mRes  = ap(o[`${PERIODO.mes}_res`]  ?? null, o)
    return {
      o,
      pRec, pDesp, pRes, pMargin: pRec ? pRes / pRec : null,
      mRec, mDesp, mRes, mMargin: mRec ? mRes / mRec : null,
    }
  })

  rowsData.sort((a, b) => groupSortKey(a.o.consorcio) - groupSortKey(b.o.consorcio))

  const rows = buildGroupEntries(rowsData).flatMap(([group, rows]) => {
    let gPRec=0, gPDesp=0, gPRes=0, gMRec=0, gMDesp=0, gMRes=0
    rows.forEach(r => {
      gPRec += r.pRec??0; gPDesp += r.pDesp??0; gPRes += r.pRes??0
      gMRec += r.mRec??0; gMDesp += r.mDesp??0; gMRes += r.mRes??0
    })
    return [
      ...rows.map(r => <AcompRow key={r.o.num} {...r}/>),
      <AcompSubTotalRow key={`sub-${group}`} group={group}
        pRec={gPRec} pDesp={gPDesp} pRes={gPRes} pMargin={gPRec ? gPRes/gPRec : null}
        mRec={gMRec} mDesp={gMDesp} mRes={gMRes} mMargin={gMRec ? gMRes/gMRec : null}
      />,
    ]
  })

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
        <AcompColGroup />
        <AcompHead />
        <tbody>
          {rows}
          <tr><td colSpan={13} style={{ height: 6, padding: 0, background: 'transparent', border: 'none' }} /></tr>
          <AcompTotRow
            pRec={tPRec} pDesp={tPDesp} pRes={tPRes} pMargin={tPRec ? tPRes/tPRec : null}
            mRec={tMRec} mDesp={tMDesp} mRes={tMRes} mMargin={tMRec ? tMRes/tMRec : null}
          />
        </tbody>
      </table>
    </div>
  )
}