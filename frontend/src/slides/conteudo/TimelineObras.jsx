import { useState, useMemo, useRef } from 'react'
import NavBar from '../../components/NavBar'
import { Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody, PillGroup } from '../../components/Filtros'
import { PERIODO } from '../../config/periodo'
import { fmt, applyPoros, GroupBadge, groupSortKey } from '../../components/tabelas/shared'

const MESES_FIXOS = ['jan', 'fev', 'mar']
const MESES_ANO   = ['abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const LABELS      = { jan:'Jan', fev:'Fev', mar:'Mar', abr:'Abr', mai:'Mai', jun:'Jun', jul:'Jul', ago:'Ago', set:'Set', out:'Out', nov:'Nov', dez:'Dez' }

const COL_GRUPO = 110
const COL_NUM   = 44
const COL_NOME  = 190
const COL_MES   = 90
const COL_TOTAL = 90
const BADGE_W   = 74

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

  const total    = [...resFixos.map(v => v ?? 0), ...resFeitos.map(v => v ?? 0), prevVal ?? 0].reduce((a, b) => a + b, 0)
  const totalPos = total >= 0

  const cellStyle = (extra = {}) => ({
    padding: '5px 4px',
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
          borderRadius: 6, padding: '3px 0',
          fontSize: 10, fontWeight: 700,
          whiteSpace: 'nowrap', textAlign: 'center',
        }}>
          {fmt(val)}
        </div>
      )
    }
    return <span style={{ color: 'var(--text-dim)', fontSize: 11, display: 'block', textAlign: 'center' }}>—</span>
  }

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <td style={cellStyle({ padding: '5px 8px' })}>
        <GroupBadge name={o.consorcio} />
      </td>
      <td style={cellStyle({ fontWeight: 700, fontSize: 11, color: 'var(--text)', textAlign: 'center' })}>
        {o.num}
      </td>
      <td style={cellStyle({ padding: '5px 12px', fontWeight: 600, fontSize: 11, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
        {o.nome}
      </td>

      {resFixos.map((val, i) => (
        <td key={MESES_FIXOS[i]} style={cellStyle({ textAlign: 'center' })}>
          {resBadge(val)}
        </td>
      ))}

      {resFeitos.map((val, i) => (
        <td key={mesesFeitos[i]} style={cellStyle({ textAlign: 'center' })}>
          {resBadge(val)}
        </td>
      ))}

      {mesesRestant.length > 0 && (
        hasPrev ? (
          <td colSpan={mesesRestant.length} style={cellStyle({ padding: '5px 6px' })}>
            <div style={{
              background: PREV_STYLE.bg, color: PREV_STYLE.text,
              border: `1px solid ${PREV_STYLE.border}`,
              borderRadius: 6, padding: '3px 12px',
              fontSize: 10, fontWeight: 700,
              whiteSpace: 'nowrap', textAlign: 'center',
              width: '100%', boxSizing: 'border-box',
            }}>
              {fmt(prevVal)}
            </div>
          </td>
        ) : (
          <td colSpan={mesesRestant.length} style={cellStyle({ padding: '5px 6px' })}>
            <div style={{
              background: NO_PREV_STYLE.bg, color: NO_PREV_STYLE.text,
              border: `1px solid ${NO_PREV_STYLE.border}`,
              borderRadius: 6, padding: '3px 12px',
              fontSize: 10, fontWeight: 700,
              whiteSpace: 'nowrap', textAlign: 'center',
              width: '100%', boxSizing: 'border-box',
            }}>
              —
            </div>
          </td>
        )
      )}

      <td style={cellStyle({ textAlign: 'center' })}>
        <div style={{
          width: BADGE_W, margin: '0 auto',
          background: totalPos ? '#dcfce7' : '#fee2e2',
          color:      totalPos ? '#166534' : '#991b1b',
          border:     `1px solid ${totalPos ? '#86efac' : '#fca5a5'}`,
          borderRadius: 6, padding: '3px 0',
          fontSize: 10, fontWeight: 700,
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
    padding: '7px 4px', fontWeight: 700, fontSize: 11,
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    textAlign: 'center', whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <tr>
      <td colSpan={3} style={{ ...base, borderBottomLeftRadius: 8, padding: '7px 12px' }}>Total Geral</td>
      {totFixos.map((v, i)  => <td key={`f${i}`} style={base}>{fmt(v)}</td>)}
      {totFeitos.map((v, i) => <td key={`r${i}`} style={base}>{fmt(v)}</td>)}
      {mesesRest.length > 0 && <td colSpan={mesesRest.length} style={base}>{fmt(totPrev)}</td>}
      <td style={{ ...base, borderBottomRightRadius: 8 }}>{fmt(totGeral)}</td>
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
    fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', padding: '6px 8px',
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
          <div style={{ fontSize:9.5, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:3 }}>
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

      <div style={{ flex:1, overflowY:'auto', overflowX:'auto', padding:'18px 36px', display:'flex', justifyContent:'center' }}>
        {filtered.length === 0
          ? <div style={{ textAlign:'center', padding:48, color:'var(--text-dim)', fontSize:13 }}>Nenhuma obra selecionada</div>
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
                    <th style={{ ...thStyle, borderTopLeftRadius: 8 }}>Grupo</th>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Nome</th>
                    {MESES_FIXOS.map(m  => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    {mesesFeitos.map(m  => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    {mesesRestant.map(m => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    <th style={{ ...thStyle, borderTopRightRadius: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <TimelineRow key={o.num} o={o} mesFiltro={mesFiltro} metric={metric} />
                  ))}
                  <tr><td colSpan={3 + TODOS_MESES.length + 1} style={{ height:6, padding:0, background:'transparent', border:'none' }}/></tr>
                  <TotaisRow obras={filtered} mesFiltro={mesFiltro} metric={metric} />
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