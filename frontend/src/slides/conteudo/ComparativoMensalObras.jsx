import { useState, useMemo, useRef } from 'react'
import NavBar from '../../components/NavBar'
import { Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody, PillGroup } from '../../components/Filtros'
import { fmt, GroupBadge, groupSortKey, s } from '../../components/tabelas/shared'
import { EVOLUCAO_POR_OBRA } from '../../config/evolucaoMensal'

const LABELS    = { jan:'Jan', fev:'Fev', mar:'Mar', abr:'Abr', mai:'Mai', jun:'Jun', jul:'Jul', ago:'Ago', set:'Set', out:'Out', nov:'Nov', dez:'Dez' }
const ALL_MESES = Object.keys(LABELS)

const COL_GRUPO = s(125)
const COL_NUM   = s(50)
const COL_NOME  = s(217)
const COL_MES   = s(103)
const BADGE_W   = s(85)

function badgeStyle(val) {
  if (val === null || val === undefined) return { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' }
  return val >= 0
    ? { bg: '#dcfce7', text: '#166534', border: '#86efac' }
    : { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
}

function Badge({ val }) {
  const c = badgeStyle(val)
  return (
    <div style={{
      width: BADGE_W, margin: '0 auto',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: s(7), padding: `${s(4)}px 0`,
      fontSize: s(11), fontWeight: 700,
      whiteSpace: 'nowrap', textAlign: 'center',
    }}>
      {(val === null || val === undefined) ? '—' : fmt(val)}
    </div>
  )
}

function Row({ o, mesesVisiveis, metric }) {
  const [hov, setHov] = useState(false)
  const cellStyle = (extra = {}) => ({
    padding: `${s(6)}px ${s(9)}px`,
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    background: hov ? 'var(--surface2)' : 'var(--surface)',
    ...extra,
  })

  const cells = mesesVisiveis.map(m => {
    const entry = EVOLUCAO_POR_OBRA[m]?.[o.num]
    const val = entry ? entry[metric] : null
    return (
      <td key={m} style={cellStyle({ textAlign: 'center' })}>
        <Badge val={val} />
      </td>
    )
  })

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <td style={cellStyle()}>
        <GroupBadge name={o.consorcio} />
      </td>
      <td style={cellStyle({ fontWeight: 700, fontSize: s(12), color: 'var(--text)', textAlign: 'center' })}>
        {o.num}
      </td>
      <td style={cellStyle({ padding: `${s(6)}px ${s(13)}px`, fontWeight: 600, fontSize: s(12), color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
        {o.nome}
      </td>
      {cells}
    </tr>
  )
}

function TotaisRow({ obras, mesesVisiveis, metric }) {
  const base = {
    padding: `${s(8)}px ${s(5)}px`, fontWeight: 700, fontSize: s(12),
    color: 'rgba(255,255,255,.9)', background: '#1e3a5f',
    textAlign: 'center', whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }

  const totPorMes = mesesVisiveis.map(m =>
    obras.reduce((acc, o) => {
      const entry = EVOLUCAO_POR_OBRA[m]?.[o.num]
      const val = entry ? entry[metric] : null
      return acc + (val ?? 0)
    }, 0)
  )

  return (
    <tr>
      <td colSpan={3} style={{ ...base, borderBottomLeftRadius: s(10), padding: `${s(8)}px ${s(13)}px` }}>Total do Mês</td>
      {totPorMes.map((v, i) => (
        <td
          key={mesesVisiveis[i]}
          style={i === totPorMes.length - 1 ? { ...base, borderBottomRightRadius: s(10) } : base}
        >
          {fmt(v)}
        </td>
      ))}
    </tr>
  )
}

export default function ComparativoMensalObras({ obras, goTo, current, total }) {
  const [metric,    setMetric]    = useState('geral')
  const [selGroups, setSelGroups] = useState(() => new Set(obras.map(o => o.consorcio).filter(Boolean)))
  const [selObras,  setSelObras]  = useState(() => new Set(obras.map(o => o.num)))

  const todasObras = useRef(obras).current
  const groups = useMemo(() => [...new Set(todasObras.map(o => o.consorcio).filter(Boolean))], [todasObras])

  // Só entram os meses que já têm pelo menos uma obra lançada em EVOLUCAO_POR_OBRA
  const mesesVisiveis = useMemo(
    () => ALL_MESES.filter(m => Object.keys(EVOLUCAO_POR_OBRA[m] || {}).length > 0),
    []
  )

  const filtered = useMemo(() => {
    const lista = todasObras.filter(o => {
      if (!selGroups.has(o.consorcio) || !selObras.has(o.num)) return false
      // só mostra a obra se ela tiver algum valor real (diferente de zero/null) em algum dos meses visíveis
      return mesesVisiveis.some(m => {
        const entry = EVOLUCAO_POR_OBRA[m]?.[o.num]
        return entry ? (!!entry.geral || !!entry.poros) : false
      })
    })
    return [...lista].sort((a, b) => groupSortKey(a.consorcio) - groupSortKey(b.consorcio))
  }, [todasObras, selGroups, selObras, mesesVisiveis])

  function toggleGroup(g, checked) {
    const ng = new Set(selGroups); if (checked) ng.add(g); else ng.delete(g); setSelGroups(ng)
    const no = new Set(selObras)
    todasObras.filter(o => o.consorcio === g).forEach(o => checked ? no.add(o.num) : no.delete(o.num))
    setSelObras(no)
  }
  function toggleObra(num, checked) {
    const n = new Set(selObras); if (checked) n.add(num); else n.delete(num); setSelObras(n)
  }

  const tableWidth = COL_GRUPO + COL_NUM + COL_NOME + (mesesVisiveis.length * COL_MES)
  const totalCols  = 3 + mesesVisiveis.length

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
            Obras <span style={{ color:'var(--accent)' }}>›</span> Comparativo Mensal
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>
            {metric === 'geral' ? 'Projeção para o ano de 2026 (Geral)' : 'Projeção para o ano de 2026 (% Poros)'}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
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
        {mesesVisiveis.length === 0
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(16) }}>Nenhum mês fechado ainda</div>
          : filtered.length === 0
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(16) }}>Nenhuma obra selecionada</div>
          : (
            <div style={{ flex:1, minHeight:0, overflowY:'auto', overflowX:'auto' }}>
              <div style={{ width: tableWidth, margin: '0 auto' }}>
                <table style={{ borderCollapse:'separate', borderSpacing:0, tableLayout:'fixed', width: tableWidth }}>
                  <colgroup>
                    <col style={{ width: COL_GRUPO }}/>
                    <col style={{ width: COL_NUM   }}/>
                    <col style={{ width: COL_NOME  }}/>
                    {mesesVisiveis.map(m => <col key={m} style={{ width: COL_MES }}/>)}
                  </colgroup>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th colSpan={3} style={{ ...thStyle, borderTopLeftRadius: s(10) }}>Obra</th>
                      <th colSpan={mesesVisiveis.length} style={{ ...thStyle, borderTopRightRadius: s(10), whiteSpace: 'normal', lineHeight: 1.3 }}>
                        Projeção para 2026
                      </th>
                    </tr>
                    <tr>
                      <th style={thStyle}>Grupo</th>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Nome</th>
                      {mesesVisiveis.map(m => <th key={m} style={thStyle}>{LABELS[m]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <Row key={o.num} o={o} mesesVisiveis={mesesVisiveis} metric={metric} />
                    ))}
                    <tr><td colSpan={totalCols} style={{ height: s(7), padding: 0, background: 'transparent', border: 'none' }}/></tr>
                    <TotaisRow obras={filtered} mesesVisiveis={mesesVisiveis} metric={metric} />
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
