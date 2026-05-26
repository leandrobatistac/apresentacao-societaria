export default function NavBar({ current, total, goTo }) {
  return (
    <div style={{
      flexShrink:0, height:52,
      borderTop:'1px solid var(--border)',
      background:'var(--surface)',
      display:'flex', alignItems:'center',
      justifyContent:'space-between',
      padding:'0 40px',
    }}>
      <button onClick={() => goTo(current - 1)} disabled={current === 0} style={btn(current === 0)}>‹</button>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 22 : 7, height:7,
            borderRadius:4, border:'none', cursor:'pointer', padding:0,
            background: i === current ? 'var(--navy)' : 'var(--border2)',
            transition:'all .25s ease',
          }}/>
        ))}
      </div>

      <button onClick={() => goTo(current + 1)} disabled={current === total-1} style={btn(current === total-1)}>›</button>
    </div>
  )
}

const btn = (disabled) => ({
  width:34, height:34, borderRadius:'50%',
  border:'1px solid var(--border)',
  background: disabled ? 'transparent' : 'var(--surface2)',
  color: disabled ? 'var(--text-dim)' : 'var(--text-muted)',
  fontSize:20, lineHeight:1, cursor: disabled ? 'default' : 'pointer',
  display:'grid', placeItems:'center',
  opacity: disabled ? .35 : 1,
  transition:'all .15s',
})
