import NavBar from '../../components/NavBar'

export default function CapaPrevisibilidade2027({ goTo, current, total }) {
  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      background:'var(--surface)',
    }}>
      <div style={{
        flex:1,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(135deg, var(--surface) 0%, #e8f0fb 100%)',
        }}/>
        <div style={{
          position:'absolute', left:'10%', top:0, bottom:0,
          width:1, background:'linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)',
        }}/>
        <div style={{
          position:'absolute', right:'10%', top:0, bottom:0,
          width:1, background:'linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)',
        }}/>

        <div style={{ position:'relative', textAlign:'center', padding:'0 10%' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            fontSize:10, fontWeight:600, letterSpacing:'.2em',
            textTransform:'uppercase', color:'var(--navy-light)',
            marginBottom:24,
            background:'rgba(37,99,235,.08)',
            padding:'5px 14px', borderRadius:20,
          }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)' }}/>
            Obras
          </div>

          <div style={{
            fontSize:'clamp(26px, 3.5vw, 44px)',
            fontWeight:700, color:'var(--navy)',
            lineHeight:1.2, letterSpacing:'-.02em',
            marginBottom:16,
          }}>
            Resultado de Obras<br/>
            <span style={{ color:'var(--navy-light)', fontWeight:500 }}>Backlog 2027</span>
          </div>

          <div style={{
            width:48, height:2,
            background:'linear-gradient(to right, transparent, var(--navy), transparent)',
            margin:'24px auto',
          }}/>

          <div style={{
            fontSize:13, fontWeight:500,
            color:'var(--text-muted)', letterSpacing:'.06em',
          }}>
            Previsão de receita
          </div>
        </div>
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}