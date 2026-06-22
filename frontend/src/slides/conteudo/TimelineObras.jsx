import { useState, useMemo, useRef } from 'react'
import NavBar from '../../components/NavBar'
import { Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody, PillGroup } from '../../components/Filtros'
import { PERIODO } from '../../config/periodo'
import { fmt, applyPoros, GroupBadge, groupSortKey } from '../../components/tabelas/shared'
import { EVOLUCAO_TOTAL_GERAL } from '../../config/evolucaoMensal'

const TODOS_MESES_ANO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const LABELS          = { jan:'Jan', fev:'Fev', mar:'Mar', abr:'Abr', mai:'Mai', jun:'Jun', jul:'Jul', ago:'Ago', set:'Set', out:'Out', nov:'Nov', dez:'Dez' }

// MESES_FIXOS vem do config — meses que entram agrupados na badge acumulada (Jan...Abr, por ex.)
// MESES_ANO é o restante do ano, meses individuais que aparecem na timeline
const MESES_FIXOS = PERIODO.meses
const MESES_ANO   = TODOS_MESES_ANO.filter(m => !MESES_FIXOS.includes(m))

const COL_GRUPO = 125
const COL_NUM   = 50
const COL_NOME  = 217
const COL_MES   = 103
const COL_TOTAL = 103
const BADGE_W   = 85

const TODOS_MESES = [...MESES_FIXOS, ...MESES_ANO]

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

function calcTotal(o, mesFiltro, ap) {
  const idxFiltro   = MESES_ANO.indexOf(mesFiltro)
  const mesesFeitos = MESES_ANO.slice(0, idxFiltro + 1)
  const resFixos    = MESES_FIXOS.map(m => ap(o[`${m}_res`] ?? null, o) ?? 0)
  const resFeitos   = mesesFeitos.map(m => ap(o[`${m}_res`] ?? null, o) ?? 0)
  const prev        = ap(getPrev(o) || null, o) ?? 0
  return [...resFixos, ...resFeitos, prev].reduce((a, b) => a + b, 0)
}

function TimelineRow({ o, mesFiltro, metric }) {
  const [hov, setHov] = useState(false)

  const idxFiltro    = MESES_ANO.indexOf(mesFiltro)
  const mesesFeitos  = MESES_ANO.slice(0, idxFiltro + 1)
  const mesesRestant = MESES_ANO.slice(idxFiltro + 1)

  const ap = (v) => metric === 'poros' ? applyPoros(v, o) : v

  const resFixos  = MESES_FIXOS.map(m => ap(o[`${m}_res`] ?? null))
  const resFeitos = mesesFeitos.map(m => ap(o[`${m}_res`] ?? null))
  const prevRaw   = getPrev(o)
  const prevVal   = ap(prevRaw || null)
  const hasPrev   = prevRaw !== 0

  const somaFixos = resFixos.reduce((a, v) => a + (v ?? 0), 0)
  const temFixos  = resFixos.some(v => v !== null)

  const total    = [somaFixos, ...resFeitos.map(v => v ?? 0), prevVal ?? 0].reduce((a, b) => a + b, 0)
  const totalPos = total >= 0

  const cellStyle = (extra = {}) => ({
    padding: '6px 5px',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    background: hov ? 'var(--surface2)' : 'var(--surface)',
    ...extra,
  })

const resBadge = (val) => {
  const c = badgeRes(val)
  if (val !== null && c) {
    return (
      <div style={{
        width: BADGE_W, margin: '0 auto',
        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
        borderRadius: 7, padding: '4px 0',
        fontSize: 11, fontWeight: 700,
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {fmt(val)}
      </div>
    )
  }
  return (
    <div style={{
      width: BADGE_W, margin: '0 auto',
      background: NO_PREV_STYLE.bg, color: NO_PREV_STYLE.text,
      border: `1px solid ${NO_PREV_STYLE.border}`,
      borderRadius: 7, padding: '4px 0',
      fontSize: 11, fontWeight: 700,
      whiteSpace: 'nowrap', textAlign: 'center',
    }}>
      —
    </div>
  )
}

  const barBadge = (val, style) => (
    <div style={{
      background: style.bg, color: style.text,
      border: `1px solid ${style.border}`,
      borderRadius: 7, padding: '4px 13px',
      fontSize: 11, fontWeight: 700,
      whiteSpace: 'nowrap', textAlign: 'center',
      width: '100%', boxSizing: 'border-box',
    }}>
      {val}
    </div>
  )

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <td style={cellStyle({ padding: '6px 9px' })}>
        <GroupBadge name={o.consorcio} />
      </td>
      <td style={cellStyle({ fontWeight: 700, fontSize: 12, color: 'var(--text)', textAlign: 'center' })}>
        {o.num}
      </td>
      <td style={cellStyle({ padding: '6px 13px', fontWeight: 600, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
        {o.nome}
      </td>

      {/* Meses fixos (PERIODO.meses) — badge acumulada com colSpan dinâmico */}
      <td colSpan={MESES_FIXOS.length} style={cellStyle({ padding: '6px 7px' })}>
        {temFixos
          ? barBadge(fmt(somaFixos), badgeRes(somaFixos) || NO_PREV_STYLE)
          : barBadge('—', NO_PREV_STYLE)
        }
      </td>

      {/* Mês atual até mesFiltro — badges individuais */}
      {resFeitos.map((val, i) => (
        <td key={mesesFeitos[i]} style={cellStyle({ textAlign: 'center' })}>
          {resBadge(val)}
        </td>
      ))}

      {/* Meses restantes — previsibilidade ou badge cinza */}
      {mesesRestant.length > 0 && (
        hasPrev
          ? <td colSpan={mesesRestant.length} style={cellStyle({ padding: '6px 7px' })}>
              {barBadge(fmt(prevVal), PREV_STYLE)}
            </td>
          : <td colSpan={mesesRestant.length} style={cellStyle({ padding: '6px 7px' })}>
              {barBadge('—', NO_PREV_STYLE)}
            </td>
      )}

      {/* Total */}
      <td style={cellStyle({ textAlign: 'center' })}>
        <div style={{
          width: BADGE_W, margin: '0 auto',
          background: totalPos ? '#dcfce7' : '#fee2e2',
          color:      totalPos ? '#166534' : '#991b1b',
          border:     `1px solid ${totalPos ? '#86efac' : '#fca5a5'}`,
          borderRadius: 7, padding: '4px 0',
          fontSize: 11, fontWeight: 700,
          whiteSpace: 'nowrap', textAlign: 'center',
        }}>
          {fmt(total)}
        </div>
      </td>
    </tr>
  )
}

function TotaisRow({ obras, mesFiltro, metric }) {
  const idxFiltro   = MESES_ANO.indexOf(mesFiltro)
  const mesesFeitos = MESES_ANO.slice(0, idxFiltro + 1)
  const mesesRest   = MESES_ANO.slice(idxFiltro + 1)
  const ap = (v, o) => metric === 'poros' ? applyPoros(v, o) : v

  const totFixos  = MESES_FIXOS.map(m => obras.reduce((acc, o) => acc + (ap(o[`${m}_res`] ?? null, o) ?? 0), 0))
  const totFeitos = mesesFeitos.map(m => obras.reduce((acc, o) => acc + (ap(o[`${m}_res`] ?? null, o) ?? 0), 0))
  const totPrev   = obras.reduce((acc, o) => acc + (ap(getPrev(o) || null, o) ?? 0), 0)
  const totGeral  = [...totFixos, ...totFeitos, totPrev].reduce((a, b) => a + b, 0)

  const base = {
    padding: '8px 5px', fontWeight: 700, fontSize: 12,
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    textAlign: 'center', whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <tr>
      <td colSpan={3} style={{ ...base, borderBottomLeftRadius: 10, padding: '8px 13px' }}>Total Geral</td>
      {/* Meses fixos acumulados numa célula só */}
      <td colSpan={MESES_FIXOS.length} style={base}>{fmt(totFixos.reduce((a, b) => a + b, 0))}</td>
      {totFeitos.map((v, i) => <td key={`r${i}`} style={base}>{fmt(v)}</td>)}
      {mesesRest.length > 0 && <td colSpan={mesesRest.length} style={base}>{fmt(totPrev)}</td>}
      <td style={{ ...base, borderBottomRightRadius: 10 }}>{fmt(totGeral)}</td>
    </tr>
  )
}

function EvolucaoRow({ mesFiltro, metric }) {
  const idxFiltro    = MESES_ANO.indexOf(mesFiltro)
  const mesesVisiveis = new Set([...MESES_FIXOS, ...MESES_ANO.slice(0, idxFiltro + 1)])

  const wrapStyle = {
    padding: '9px 5px',
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  }

  const labelStyle = {
    ...wrapStyle,
    padding: '9px 13px',
    fontWeight: 700, color: 'var(--navy)', fontSize: 11,
    letterSpacing: '.06em', textTransform: 'uppercase',
    whiteSpace: 'nowrap', textAlign: 'center',
    borderLeft: '1px solid var(--border)',
    borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
  }

  const evoBadge = (val) => {
    const c = badgeRes(val)
    const style = (val !== null && val !== undefined && c) ? c : NO_PREV_STYLE
    return (
      <div style={{
        width: BADGE_W, margin: '0 auto',
        background: style.bg, color: style.text, border: `1px solid ${style.border}`,
        borderRadius: 7, padding: '4px 0',
        fontSize: 11, fontWeight: 700,
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {(val === null || val === undefined) ? '—' : fmt(val)}
      </div>
    )
  }

  return (
    <tr>
      <td colSpan={3} style={labelStyle}>
        Evolução Mensal
      </td>
      {TODOS_MESES.map(m => {
        const visivel = mesesVisiveis.has(m)
        const val = EVOLUCAO_TOTAL_GERAL[m]?.[metric] ?? null
        return (
          <td key={m} style={{ ...wrapStyle, textAlign: 'center' }}>
            {visivel ? evoBadge(val) : null}
          </td>
        )
      })}
      <td style={{ ...wrapStyle, borderRight: '1px solid var(--border)', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}></td>
    </tr>
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
    const idxFiltro   = MESES_ANO.indexOf(mesFiltro)
    const mesesFeitos = [...MESES_FIXOS, ...MESES_ANO.slice(0, idxFiltro + 1)]
    const lista = todasObras.filter(o => {
      if (!selGroups.has(o.consorcio) || !selObras.has(o.num)) return false
      const temRes  = mesesFeitos.some(m => o[`${m}_res`])
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

  const idxFiltro    = MESES_ANO.indexOf(mesFiltro)
  const mesesFeitos  = MESES_ANO.slice(0, idxFiltro + 1)
  const mesesRestant = MESES_ANO.slice(idxFiltro + 1)
  const tableWidth   = COL_GRUPO + COL_NUM + COL_NOME + (TODOS_MESES.length * COL_MES) + COL_TOTAL

  const thStyle = {
    background: '#1e3a5f', color: 'rgba(255,255,255,.8)',
    fontSize: 12, fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', padding: '7px 9px',
    textAlign: 'center', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <div style={{
        flexShrink:0, padding:'16px 41px',
        borderBottom:'1px solid var(--border)', background:'var(--surface)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:18,
      }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:4 }}>
            Obras <span style={{ color:'var(--accent)' }}>›</span> Timeline
          </div>
          <div style={{ fontSize:23, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>
            {metric === 'geral' ? 'Timeline de Resultados (Geral)' : 'Timeline de Resultados (% Poros)'}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:13 }}>
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

      <div style={{ flex:1, overflowY:'auto', overflowX:'auto', padding:'21px 41px 40px', display:'flex', justifyContent:'center' }}>
        {filtered.length === 0
          ? <div style={{ textAlign:'center', padding:58, color:'var(--text-dim)', fontSize:16 }}>Nenhuma obra selecionada</div>
          : (
            <div style={{ width: tableWidth }}>
              <table style={{ borderCollapse:'separate', borderSpacing:0, tableLayout:'fixed', width: tableWidth }}>
                <colgroup>
                  <col style={{ width: COL_GRUPO }}/>
                  <col style={{ width: COL_NUM   }}/>
                  <col style={{ width: COL_NOME  }}/>
                  {TODOS_MESES.map(m => <col key={m} style={{ width: COL_MES }}/>)}
                  <col style={{ width: COL_TOTAL }}/>
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, borderTopLeftRadius: 10 }}>Grupo</th>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Nome</th>
                    {/* Meses fixos — cabeçalho individual mas badge acumulada */}
                    {MESES_FIXOS.map(m  => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    {mesesFeitos.map(m  => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    {mesesRestant.map(m => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    <th style={{ ...thStyle, borderTopRightRadius: 10 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <TimelineRow key={o.num} o={o} mesFiltro={mesFiltro} metric={metric} />
                  ))}
                  <tr><td colSpan={3 + TODOS_MESES.length + 1} style={{ height:7, padding:0, background:'transparent', border:'none' }}/></tr>
                  <TotaisRow obras={filtered} mesFiltro={mesFiltro} metric={metric} />
                  <tr><td colSpan={3 + TODOS_MESES.length + 1} style={{ height:13, padding:0, background:'transparent', border:'none' }}/></tr>
                  <EvolucaoRow mesFiltro={mesFiltro} metric={metric} />
                  <tr><td colSpan={3 + TODOS_MESES.length + 1} style={{ height:24, padding:0, background:'transparent', border:'none' }}/></tr>
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}
