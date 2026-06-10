import { useState, useMemo } from 'react'
import NavBar from '../../components/NavBar'
import { PillGroup, Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody } from '../../components/Filtros'
import { TabelaPrevisibilidade } from '../../components/tabelas'

export default function Previsibilidade({ obras, goTo, current, total }) {
  const [sortMode,  setSortMode]  = useState('grupo')
  const [selGroups, setSelGroups] = useState(() => new Set(obras.map(o => o.consorcio).filter(Boolean)))
  const [selObras,  setSelObras]  = useState(() => new Set(obras.map(o => o.num)))

  const groups = useMemo(() => [...new Set(obras.map(o => o.consorcio).filter(Boolean))], [obras])
  const filtered = useMemo(() => obras.filter(o => selGroups.has(o.consorcio) && selObras.has(o.num)), [obras, selGroups, selObras])

  function toggleGroup(g, checked) {
    setSelGroups(prev => {
      const ng = new Set(prev)
      if (checked) ng.add(g); else ng.delete(g)
      return ng
    })
    setSelObras(prev => {
      const no = new Set(prev)
      obras.filter(o => o.consorcio === g).forEach(o => {
        if (checked) no.add(o.num); else no.delete(o.num)
      })
      return no
    })
  }

  function toggleObra(num, checked) {
    setSelObras(prev => {
      const n = new Set(prev)
      if (checked) n.add(num); else n.delete(num)
      return n
    })
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
            Obras <span style={{ color:'var(--accent)' }}>›</span> Previsibilidade
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>
            Previsibilidade 2026 + Aditivos + Prateleira
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <PillGroup
            value={sortMode}
            onChange={setSortMode}
            options={[
              { value: 'grupo',     label: 'Por Grupo'    },
              { value: 'abc-geral', label: 'ABC - Geral'  },
              { value: 'abc-poros', label: 'ABC - % Poros'},
            ]}
          />
          <Sep/>

          <Dropdown label="Grupos" count={selGroups.size} totalCount={groups.length}>
            <DropActions
              onAll={() => { setSelGroups(new Set(groups)); setSelObras(new Set(obras.map(o => o.num))) }}
              onNone={() => { setSelGroups(new Set()); setSelObras(new Set()) }}
            />
            <DropScrollBody>
              {groups.map(g => (
                <DropItem key={g} label={g} checked={selGroups.has(g)} onChange={c => toggleGroup(g, c)}/>
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
                  <DropGroupLabel label={g}/>
                  {obras.filter(o => o.consorcio === g).map(o => (
                    <DropItem key={o.num} label={<><b>{o.num}</b>&nbsp;{o.nome}</>}
                      checked={selObras.has(o.num)} onChange={c => toggleObra(o.num, c)}/>
                  ))}
                </div>
              ))}
            </DropScrollBody>
          </Dropdown>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 36px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign:'center', padding:48, color:'var(--text-dim)', fontSize:13 }}>Nenhuma obra selecionada</div>
          : <TabelaPrevisibilidade obras={filtered} sortMode={sortMode}/>
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo}/>
    </div>
  )
}
