import { useState, useMemo, useRef } from 'react'
import NavBar from '../../components/NavBar'
import { Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody, PillGroup } from '../../components/Filtros'
import { PERIODO } from '../../config/periodo'
import { fmt, applyPoros, GroupBadge, groupSortKey, s } from '../../components/tabelas/shared'
import { EVOLUCAO_TOTAL_GERAL } from '../../config/evolucaoMensal'

const ALL_MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const LABELS    = { jan:'Jan', fev:'Fev', mar:'Mar', abr:'Abr', mai:'Mai', jun:'Jun', jul:'Jul', ago:'Ago', set:'Set', out:'Out', nov:'Nov', dez:'Dez' }

const COL_GRUPO = s(125)
const COL_NUM   = s(50)
const COL_NOME  = s(217)
const COL_MES   = s(103)
const COL_TRAS  = COL_MES * 3   // bloco "pra trás" — sempre 3 colunas de largura, não importa quantos meses entram
const COL_ATUAL = COL_MES       // mês atual — sempre 1 coluna
const COL_FRENTE= COL_MES * 3   // bloco "previsibilidade" — sempre 3 colunas de largura
const COL_TOTAL = s(103)
const BADGE_W   = s(85)

function mesesTrasDe(mesFiltro) {
  const idx = ALL_MESES.indexOf(mesFiltro)
  return ALL_MESES.slice(0, idx)
}
function mesesFrenteDe(mesFiltro) {
  const idx = ALL_MESES.indexOf(mesFiltro)
  return ALL_MESES.slice(idx + 1)
}

// Título dinâmico do bloco: "Jan a Abr" (2+ meses), "Jan" (1 mês) ou "—" (vazio, ex: mês atual = Jan/Dez)
function rangeLabel(meses) {
  if (meses.length === 0) return '—'
  if (meses.length === 1) return LABELS[meses[0]]
  return `${LABELS[meses[0]]} a ${LABELS[meses[meses.length - 1]]}`
}

function badgeRes(res) {
  if (res === null || res === undefined) return null
  const pos = res >= 0
  return {
    bg:     pos ? '#dcfce7' : '#fee2e2',
    text:   pos ? '#166534' : '#991b1b',
    border: pos ? '#86efac' : '#fca5a5',
  }
}

const PREV_STYLE    = { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
const NO_PREV_STYLE = { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' }

function getPrev(o) {
  return (o.p_res || 0) + (o.ad_res || 0)
}

// Soma do "resultado" de um obra ao longo de uma lista de meses (usado tanto pro bloco "trás" quanto pros totais)
function somaMeses(o, meses, ap) {
  const vals = meses.map(m => ap(o[`${m}_res`] ?? null, o))
  const soma = vals.reduce((a, v) => a + (v ?? 0), 0)
  const tem  = vals.some(v => v !== null)
  return { soma, tem }
}

function calcTotal(o, mesFiltro, ap) {
  const { soma: somaTras } = somaMeses(o, mesesTrasDe(mesFiltro), ap)
  const valAtual = ap(o[`${mesFiltro}_res`] ?? null, o) ?? 0
  const prevVal  = ap(getPrev(o) || null, o) ?? 0
  return somaTras + valAtual + prevVal
}

function TimelineRow({ o, mesFiltro, metric }) {
  const [hov, setHov] = useState(false)
  const ap = (v) => metric === 'poros' ? applyPoros(v, o) : v

  const mesesTras   = mesesTrasDe(mesFiltro)
  const { soma: somaTras, tem: temTras } = somaMeses(o, mesesTras, (v) => ap(v))

  const valAtual = ap(o[`${mesFiltro}_res`] ?? null)

  const prevRaw = getPrev(o)
  const prevVal = ap(prevRaw || null)
  const hasPrev = prevRaw !== 0

  const total    = somaTras + (valAtual ?? 0) + (prevVal ?? 0)
  const totalPos = total >= 0

  const cellStyle = (extra = {}) => ({
    padding: `${s(6)}px ${s(5)}px`,
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    background: hov ? 'var(--surface2)' : 'var(--surface)',
    ...extra,
  })

  const resBadge = (val) => {
    const c = badgeRes(val)
    const style = (val !== null && c) ? c : NO_PREV_STYLE
    return (
      <div style={{
        width: BADGE_W, margin: '0 auto',
        background: style.bg, color: style.text, border: `1px solid ${style.border}`,
        borderRadius: s(7), padding: `${s(4)}px 0`,
        fontSize: s(11), fontWeight: 700,
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {(val === null || val === undefined) ? '—' : fmt(val)}
      </div>
    )
  }

  const barBadge = (val, style) => (
    <div style={{
      background: style.bg, color: style.text,
      border: `1px solid ${style.border}`,
      borderRadius: s(7), padding: `${s(4)}px ${s(13)}px`,
      fontSize: s(11), fontWeight: 700,
      whiteSpace: 'nowrap', textAlign: 'center',
      width: '100%', boxSizing: 'border-box',
    }}>
      {val}
    </div>
  )

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <td style={cellStyle({ padding: `${s(6)}px ${s(9)}px` })}>
        <GroupBadge name={o.consorcio} />
      </td>
      <td style={cellStyle({ fontWeight: 700, fontSize: s(12), color: 'var(--text)', textAlign: 'center' })}>
        {o.num}
      </td>
      <td style={cellStyle({ padding: `${s(6)}px ${s(13)}px`, fontWeight: 600, fontSize: s(12), color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
        {o.nome}
      </td>

      {/* Pra trás — bloco fixo de 3 colunas, badge acumulada */}
      <td style={cellStyle({ padding: `${s(6)}px ${s(7)}px` })}>
        {temTras
          ? barBadge(fmt(somaTras), badgeRes(somaTras) || NO_PREV_STYLE)
          : barBadge('—', NO_PREV_STYLE)
        }
      </td>

      {/* Mês atual — 1 coluna, badge individual */}
      <td style={cellStyle({ textAlign: 'center' })}>
        {resBadge(valAtual)}
      </td>

      {/* Previsibilidade (pra frente) — bloco fixo de 3 colunas */}
      <td style={cellStyle({ padding: `${s(6)}px ${s(7)}px` })}>
        {hasPrev
          ? barBadge(fmt(prevVal), PREV_STYLE)
          : barBadge('—', NO_PREV_STYLE)
        }
      </td>

      {/* Total */}
      <td style={cellStyle({ textAlign: 'center' })}>
        <div style={{
          width: BADGE_W, margin: '0 auto',
          background: totalPos ? '#dcfce7' : '#fee2e2',
          color:      totalPos ? '#166534' : '#991b1b',
          border:     `1px solid ${totalPos ? '#86efac' : '#fca5a5'}`,
          borderRadius: s(7), padding: `${s(4)}px 0`,
          fontSize: s(11), fontWeight: 700,
          whiteSpace: 'nowrap', textAlign: 'center',
        }}>
          {fmt(total)}
        </div>
      </td>
    </tr>
  )
}

function TotaisRow({ obras, mesFiltro, metric }) {
  const ap = (v, o) => metric === 'poros' ? applyPoros(v, o) : v
  const mesesTras = mesesTrasDe(mesFiltro)

  const totTras  = obras.reduce((acc, o) => acc + somaMeses(o, mesesTras, ap).soma, 0)
  const totAtual = obras.reduce((acc, o) => acc + (ap(o[`${mesFiltro}_res`] ?? null, o) ?? 0), 0)
  const totPrev  = obras.reduce((acc, o) => acc + (ap(getPrev(o) || null, o) ?? 0), 0)
  const totGeral = totTras + totAtual + totPrev

  const base = {
    padding: `${s(8)}px ${s(5)}px`, fontWeight: 700, fontSize: s(12),
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    textAlign: 'center', whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <tr>
      <td colSpan={3} style={{ ...base, borderBottomLeftRadius: s(10), padding: `${s(8)}px ${s(13)}px` }}>Total Geral</td>
      <td style={base}>{fmt(totTras)}</td>
      <td style={base}>{fmt(totAtual)}</td>
      <td style={base}>{fmt(totPrev)}</td>
      <td style={{ ...base, borderBottomRightRadius: s(10) }}>{fmt(totGeral)}</td>
    </tr>
  )
}

// Linha "Evolução Mensal": título numa linha própria (largura total), e os 12 meses reais em outra
// linha logo abaixo (também largura total) — dá mais espaço pros 12 badges do início ao fim.
function EvolucaoRow({ metric }) {
  const titleStyle = {
    padding: `${s(9)}px ${s(13)}px`,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    fontWeight: 700, color: 'var(--navy)', fontSize: s(11),
    letterSpacing: '.06em', textTransform: 'uppercase',
    whiteSpace: 'nowrap', textAlign: 'center',
    borderTopLeftRadius: s(10), borderTopRightRadius: s(10),
  }

  const bodyStyle = {
    padding: `${s(9)}px ${s(7)}px`,
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    borderBottomLeftRadius: s(10), borderBottomRightRadius: s(10),
  }

  const evoBadge = (val) => {
    const c = badgeRes(val)
    const style = (val !== null && val !== undefined && c) ? c : NO_PREV_STYLE
    return (
      <div style={{
        width: '90%', margin: '0 auto',
        background: style.bg, color: style.text, border: `1px solid ${style.border}`,
        borderRadius: s(6), padding: `${s(4)}px 0`,
        fontSize: s(10), fontWeight: 700,
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {(val === null || val === undefined) ? '—' : fmt(val)}
      </div>
    )
  }

  return (
    <>
      <tr>
        <td colSpan={7} style={titleStyle}>Evolução Mensal</td>
      </tr>
      <tr>
        <td colSpan={7} style={bodyStyle}>
          <div style={{ display: 'flex', width: '100%' }}>
            {ALL_MESES.map(m => {
              const val = EVOLUCAO_TOTAL_GERAL[m]?.[metric] ?? null
              return (
                <div key={m} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: s(8), fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: s(2) }}>
                    {LABELS[m]}
                  </div>
                  {evoBadge(val)}
                </div>
              )
            })}
          </div>
        </td>
      </tr>
    </>
  )
}

export default function TimelineObras({ obras, goTo, current, total }) {
  const mesFiltro = PERIODO.mesesRealizados[PERIODO.mesesRealizados.length - 1]

  const [sortMode,  setSortMode]  = useState('grupo')
  const [metric,    setMetric]    = useState('geral')
  const [selGroups, setSelGroups] = useState(() => new Set(obras.map(o => o.consorcio).filter(Boolean)))
  const [selObras,  setSelObras]  = useState(() => new Set(obras.map(o => o.num)))

  const todasObras = useRef(obras).current
  const groups = useMemo(() => [...new Set(todasObras.map(o => o.consorcio).filter(Boolean))], [todasObras])

  const ap = (v, o) => metric === 'poros' ? applyPoros(v, o) : v

  const filtered = useMemo(() => {
    const mesesTras = mesesTrasDe(mesFiltro)
    const lista = todasObras.filter(o => {
      if (!selGroups.has(o.consorcio) || !selObras.has(o.num)) return false
      const temRes  = [...mesesTras, mesFiltro].some(m => o[`${m}_res`])
      const temPrev = getPrev(o) !== 0
      return temRes || temPrev
    })

    if (sortMode === 'abc') {
      return [...lista].sort((a, b) =>
        calcTotal(b, mesFiltro, ap) - calcTotal(a, mesFiltro, ap)
      )
    }
    return [...lista].sort((a, b) => groupSortKey(a.consorcio) - groupSortKey(b.consorcio))
  }, [todasObras, selGroups, selObras, sortMode, metric])

  function toggleGroup(g, checked) {
    const ng = new Set(selGroups); if (checked) ng.add(g); else ng.delete(g); setSelGroups(ng)
    const no = new Set(selObras)
    todasObras.filter(o => o.consorcio === g).forEach(o => checked ? no.add(o.num) : no.delete(o.num))
    setSelObras(no)
  }
  function toggleObra(num, checked) {
    const n = new Set(selObras); if (checked) n.add(num); else n.delete(num); setSelObras(n)
  }

  const mesesTras   = mesesTrasDe(mesFiltro)
  const mesesFrente = mesesFrenteDe(mesFiltro)
  const tableWidth  = COL_GRUPO + COL_NUM + COL_NOME + COL_TRAS + COL_ATUAL + COL_FRENTE + COL_TOTAL

  const thStyle = {
    background: '#1e3a5f', color: 'rgba(255,255,255,.8)',
    fontSize: s(12), fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', padding: `${s(7)}px ${s(9)}px`,
    textAlign: 'center', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <div style={{
        flexShrink:0, padding:'14px 36px',
        borderBottom:'1px solid var(--border)', background:'var(--surface)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
      }}>
        <div>
          <div style={{ fontSize:9.5, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:4 }}>
            Obras <span style={{ color:'var(--accent)' }}>›</span> Timeline
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>
            {metric === 'geral' ? 'Timeline de Resultados (Geral)' : 'Timeline de Resultados (% Poros)'}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <PillGroup
            value={sortMode}
            onChange={setSortMode}
            options={[
              { value: 'grupo', label: 'Por Grupo' },
              { value: 'abc',   label: 'ABC'        },
            ]}
          />
          <Sep/>
          <PillGroup
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'geral', label: 'Geral'   },
              { value: 'poros', label: '% Poros' },
            ]}
          />
          <Sep/>
          <Dropdown label="Grupos" count={selGroups.size} totalCount={groups.length}>
            <DropActions
              onAll={() => { setSelGroups(new Set(groups)); setSelObras(new Set(todasObras.map(o => o.num))) }}
              onNone={() => { setSelGroups(new Set()); setSelObras(new Set()) }}
            />
            <DropScrollBody>
              {groups.map(g => <DropItem key={g} label={g} checked={selGroups.has(g)} onChange={c => toggleGroup(g, c)} />)}
            </DropScrollBody>
          </Dropdown>
          <Dropdown label="Obras" count={selObras.size} totalCount={todasObras.length}>
            <DropActions
              onAll={() => setSelObras(new Set(todasObras.map(o => o.num)))}
              onNone={() => setSelObras(new Set())}
            />
            <DropScrollBody>
              {groups.map(g => (
                <div key={g}>
                  <DropGroupLabel label={g} />
                  {todasObras.filter(o => o.consorcio === g).map(o => (
                    <DropItem key={o.num} label={<><b>{o.num}</b>&nbsp;{o.nome}</>}
                      checked={selObras.has(o.num)} onChange={c => toggleObra(o.num, c)} />
                  ))}
                </div>
              ))}
            </DropScrollBody>
          </Dropdown>
        </div>
      </div>

      <div style={{ flex:1, minHeight:0, padding:`${s(21)}px ${s(41)}px ${s(40)}px`, display:'flex', flexDirection:'column' }}>
        {filtered.length === 0
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(16) }}>Nenhuma obra selecionada</div>
          : (
            <div style={{ flex:1, minHeight:0, overflowY:'auto', overflowX:'auto' }}>
              <div style={{ width: tableWidth, margin: '0 auto' }}>
                <table style={{ borderCollapse:'separate', borderSpacing:0, tableLayout:'fixed', width: tableWidth }}>
                  <colgroup>
                    <col style={{ width: COL_GRUPO  }}/>
                    <col style={{ width: COL_NUM    }}/>
                    <col style={{ width: COL_NOME   }}/>
                    <col style={{ width: COL_TRAS   }}/>
                    <col style={{ width: COL_ATUAL  }}/>
                    <col style={{ width: COL_FRENTE }}/>
                    <col style={{ width: COL_TOTAL  }}/>
                  </colgroup>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ ...thStyle, borderTopLeftRadius: s(10) }}>Grupo</th>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Nome</th>
                      <th style={thStyle}>{rangeLabel(mesesTras)}</th>
                      <th style={thStyle}>{LABELS[mesFiltro]}</th>
                      <th style={thStyle}>{rangeLabel(mesesFrente)}</th>
                      <th style={{ ...thStyle, borderTopRightRadius: s(10) }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <TimelineRow key={o.num} o={o} mesFiltro={mesFiltro} metric={metric} />
                    ))}
                    <tr><td colSpan={7} style={{ height:s(7), padding:0, background:'transparent', border:'none' }}/></tr>
                    <TotaisRow obras={filtered} mesFiltro={mesFiltro} metric={metric} />
                    <tr><td colSpan={7} style={{ height:s(13), padding:0, background:'transparent', border:'none' }}/></tr>
                    <EvolucaoRow metric={metric} />
                    <tr><td colSpan={7} style={{ height:s(24), padding:0, background:'transparent', border:'none' }}/></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}
