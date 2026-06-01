import { useState, useMemo } from 'react'
import NavBar from '../components/NavBar'
import { PillGroup, Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody } from '../components/Filtros'
import { TabelaConsolidado } from '../components/Tabela'

export default function Consolidado({ obras, goTo, current, total }) {
  const [metric,    setMetric]    = useState('geral')
  const [sortMode,  setSortMode]  = useState('grupo')
  const [selGroups, setSelGroups] = useState(() => new Set(obras.map(o => o.consorcio).filter(Boolean)))
  const [selObras,  setSelObras]  = useState(() => new Set(obras.map(o => o.num)))

  const groups = useMemo(() => [...new Set(obras.map(o => o.consorcio).filter(Boolean))], [obras])
  const filtered = useMemo(() =>
    obras.filter(o => selGroups.has(o.consorcio) && selObras.has(o.num)),
    [obras, selGroups, selObras]
  )

  // Total Geral fixo: calculado sobre TODAS as obras, só muda com metric (Geral / % Poros)
  const totaisFixos = useMemo(() => {
    const isPoros = metric === 'poros'
    let rec = 0, desp = 0, res = 0
    obras.forEach(o => {
      const rawRec  = (o.at_rec  || 0) + (o.p_rec  || 0) + (o.ad_rec  || 0)
      const rawDesp = (o.at_desp || 0) + (o.p_desp || 0) + (o.ad_desp || 0)
      const rawRes  = (o.at_res  || 0) + (o.p_res  || 0) + (o.ad_res  || 0)
      const r = isPoros ? rawRec  * (o.pct ?? 1) : rawRec
      const d = isPoros ? rawDesp * (o.pct ?? 1) : rawDesp
      const s = isPoros ? rawRes  * (o.pct ?? 1) : rawRes
      rec  += isNaN(r) ? 0 : r
      desp += isNaN(d) ? 0 : d
      res  += isNaN(s) ? 0 : s
    })
    return { rec, desp, res, margin: rec ? res / rec : null }
  }, [obras, metric])

  function toggleGroup(g, checked) {
    const ng = new Set(selGroups); if (checked) ng.add(g); else ng.delete(g); setSelGroups(ng)
    const no = new Set(selObras); obras.filter(o => o.consorcio === g).forEach(o => checked ? no.add(o.num) : no.delete(o.num)); setSelObras(no)
  }
  function toggleObra(num, checked) {
    const n = new Set(selObras); if (checked) n.add(num); else n.delete(num); setSelObras(n)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{
        flexShrink: 0, padding: '14px 36px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>
            Obras <span style={{ color: 'var(--accent)' }}>›</span> Consolidado
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>
            {metric === 'geral' ? 'Consolidado Geral' : 'Consolidado % Poros'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PillGroup
            value={sortMode}
            onChange={setSortMode}
            options={[
              { value: 'grupo',      label: 'Grupo'   },
              { value: 'resultado',  label: 'ABC Resultado' },
            ]}
          />
          <Sep />
          <PillGroup
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'geral', label: 'Geral'   },
              { value: 'poros', label: '% Poros' },
            ]}
          />
          <Sep />

          <Dropdown label="Grupos" count={selGroups.size} totalCount={groups.length}>
            <DropActions
              onAll={() => { setSelGroups(new Set(groups)); setSelObras(new Set(obras.map(o => o.num))) }}
              onNone={() => { setSelGroups(new Set()); setSelObras(new Set()) }}
            />
            <DropScrollBody>
              {groups.map(g => (
                <DropItem key={g} label={g} checked={selGroups.has(g)} onChange={c => toggleGroup(g, c)} />
              ))}
            </DropScrollBody>
          </Dropdown>

          <Dropdown label="Obras" count={selObras.size} totalCount={obras.length}>
            <DropActions
              onAll={() => setSelObras(new Set(obras.map(o => o.num)))}
              onNone={() => setSelObras(new Set())}
            />
            <DropScrollBody>
              {groups.map(g => (
                <div key={g}>
                  <DropGroupLabel label={g} />
                  {obras.filter(o => o.consorcio === g).map(o => (
                    <DropItem key={o.num} label={<><b>{o.num}</b>&nbsp;{o.nome}</>}
                      checked={selObras.has(o.num)} onChange={c => toggleObra(o.num, c)} />
                  ))}
                </div>
              ))}
            </DropScrollBody>
          </Dropdown>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 36px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-dim)', fontSize: 13 }}>
              Nenhuma obra selecionada
            </div>
          : <TabelaConsolidado
              obras={filtered}
              totaisFixos={totaisFixos}
              metric={metric}
              sortMode={sortMode}
            />
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}
