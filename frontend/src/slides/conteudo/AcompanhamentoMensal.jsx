import { useState, useMemo, useRef } from 'react'
import NavBar from '../../components/NavBar'
import { PillGroup, Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody } from '../../components/Filtros'
import { TabelaAcompanhamento, TabelaAcumuladoAnual } from '../../components/tabelas'
import { PERIODO } from '../../config/periodo'

export default function AcompanhamentoMensal({ obras, goTo, current, total }) {
  const [metric,    setMetric]    = useState('geral')
  const [selGroups, setSelGroups] = useState(() => new Set(obras.map(o => o.consorcio).filter(Boolean)))
  const [selObras,  setSelObras]  = useState(() => new Set(obras.map(o => o.num)))

  const todasObras = useRef(obras).current
  const groups = useMemo(() => [...new Set(todasObras.map(o => o.consorcio).filter(Boolean))], [todasObras])

  const filtered = useMemo(() =>
    todasObras.filter(o => selGroups.has(o.consorcio) && selObras.has(o.num)),
    [todasObras, selGroups, selObras]
  )

  function toggleGroup(g, checked) {
    const ng = new Set(selGroups); if (checked) ng.add(g); else ng.delete(g); setSelGroups(ng)
    const no = new Set(selObras)
    todasObras.filter(o => o.consorcio === g).forEach(o => checked ? no.add(o.num) : no.delete(o.num))
    setSelObras(no)
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
            Obras <span style={{ color: 'var(--accent)' }}>›</span> Acompanhamento Mensal
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>
            {metric === 'geral' ? 'Acompanhamento Mensal (Geral)' : 'Acompanhamento Mensal (% Poros)'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              onAll={() => { setSelGroups(new Set(groups)); setSelObras(new Set(todasObras.map(o => o.num))) }}
              onNone={() => { setSelGroups(new Set()); setSelObras(new Set()) }}
            />
            <DropScrollBody>
              {groups.map(g => (
                <DropItem key={g} label={g} checked={selGroups.has(g)} onChange={c => toggleGroup(g, c)} />
              ))}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 36px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-dim)', fontSize: 13 }}>
              Nenhuma obra selecionada
            </div>
          : <TabelaAcumuladoAnual
              obras={filtered}
              obrasAll={todasObras}
              metric={metric}
            />
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}