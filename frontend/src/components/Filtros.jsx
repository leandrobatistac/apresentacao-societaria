import { useState, useRef, useEffect } from 'react'

export function PillGroup({ options, value, onChange }) {
  return (
    <div style={{
      display:'flex', background:'var(--surface2)',
      border:'1px solid var(--border)', borderRadius:8, padding:3, gap:2,
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding:'4px 13px', borderRadius:6, border:'none',
          fontSize:11.5, fontWeight:500, cursor:'pointer',
          background: value === opt.value ? 'var(--navy)' : 'transparent',
          color: value === opt.value ? '#fff' : 'var(--text-muted)',
          transition:'all .18s', whiteSpace:'nowrap',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ value, onChange, label }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
      <div style={{
        width:32, height:17, borderRadius:9,
        background: value ? 'var(--navy)' : 'var(--border2)',
        border:`1px solid ${value ? 'var(--navy)' : 'var(--border2)'}`,
        position:'relative', transition:'all .2s', flexShrink:0,
      }}>
        <div style={{
          position:'absolute', width:11, height:11, borderRadius:'50%',
          background: value ? '#fff' : 'var(--text-dim)',
          top:2, left: value ? 17 : 2, transition:'left .2s',
          boxShadow:'0 1px 3px rgba(0,0,0,.15)',
        }}/>
      </div>
      <span style={{
        fontSize:12, fontWeight:500,
        color: value ? 'var(--navy)' : 'var(--text-muted)',
        userSelect:'none',
      }}>{label}</span>
    </div>
  )
}

export function Sep() {
  return <div style={{ width:1, height:20, background:'var(--border)' }}/>
}

export function Dropdown({ label, count, totalCount, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const allSel = count === totalCount
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'5px 11px',
        border:`1px solid ${open ? 'var(--navy)' : 'var(--border)'}`,
        borderRadius:8, background:'var(--surface)',
        fontSize:12, fontWeight:500,
        color: open ? 'var(--navy)' : 'var(--text-muted)',
        cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap',
      }}>
        {label}
        {!allSel && (
          <span style={{
            background:'var(--navy)', color:'#fff',
            borderRadius:4, padding:'0 5px', fontSize:10, fontWeight:700,
          }}>{count}</span>
        )}
        <span style={{ fontSize:9, color:'var(--text-dim)', transition:'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0,
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:10, boxShadow:'0 12px 40px rgba(0,0,0,.12)',
          minWidth:230, zIndex:200,
          display:'flex', flexDirection:'column',
          maxHeight:320,
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Área rolável dentro do dropdown
export function DropScrollBody({ children }) {
  return (
    <div style={{ overflowY:'auto', flex:1 }}>
      {children}
    </div>
  )
}

export function DropItem({ label, checked, onChange }) {
  return (
    <label style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'6px 12px', fontSize:12, cursor:'pointer',
      color:'var(--text-muted)', transition:'background .1s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor:'var(--navy)', cursor:'pointer' }}/>
      {label}
    </label>
  )
}

export function DropGroupLabel({ label }) {
  return (
    <div style={{
      padding:'6px 12px 3px', fontSize:9.5, fontWeight:700,
      letterSpacing:'.1em', textTransform:'uppercase',
      color:'var(--text-dim)', background:'var(--surface2)',
    }}>{label}</div>
  )
}

export function DropActions({ onAll, onNone }) {
  return (
    <div style={{
      display:'flex', gap:4, padding:'6px 8px',
      borderBottom:'1px solid var(--border)',
      flexShrink: 0,
    }}>
      {[['Todos', onAll], ['Limpar', onNone]].map(([lbl, fn]) => (
        <button key={lbl} onClick={fn} style={{
          flex:1, padding:'4px 8px', border:'1px solid var(--border)',
          borderRadius:6, fontSize:11, cursor:'pointer',
          background:'transparent', color:'var(--text-muted)',
          transition:'all .12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--navy)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' }}
        >{lbl}</button>
      ))}
    </div>
  )
}
