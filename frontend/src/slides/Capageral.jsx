import NavBar from '../components/NavBar'

const FOTO = '/foto-obra1.jpeg'
const AZUL_PADRAO = '#1e3a5f'

export default function CapaGeral({ obras, goTo, current, total }) {
  const groups = [...new Set(obras.map(o => o.consorcio).filter(Boolean))]

  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      background:'var(--surface)',
    }}>
      {/* Main area */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* LEFT — conteúdo */}
        <div style={{
          flex:'0 0 50%',
          background: AZUL_PADRAO,
          display:'flex', flexDirection:'column',
          justifyContent:'center',
          padding:'0 7%',
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Decoração de fundo */}
          <div style={{
            position:'absolute', bottom:-120, left:-80,
            width:400, height:400, borderRadius:'50%',
            border:'1px solid rgba(255,255,255,.06)',
            pointerEvents:'none',
          }}/>
          <div style={{
            position:'absolute', bottom:-60, left:-40,
            width:260, height:260, borderRadius:'50%',
            border:'1px solid rgba(255,255,255,.04)',
            pointerEvents:'none',
          }}/>

          {/* Logo */}
          <div style={{ marginBottom:40 }}>
            <img
              src="/logo.png"
              alt="Poros"
              style={{ height:52, objectFit:'contain', filter:'brightness(0) invert(1)' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div style={{ display:'none', fontSize:18, fontWeight:700, color:'#fff', letterSpacing:'.08em' }}>
              POROS
            </div>
          </div>

          {/* Linha */}
          <div style={{ width:40, height:2, background:'rgba(255,255,255,.25)', marginBottom:28 }}/>

          {/* Título */}
          <div style={{
            fontSize:'clamp(28px, 3.5vw, 46px)',
            fontWeight:700, color:'#fff',
            lineHeight:1.15, letterSpacing:'-.01em',
            marginBottom:10,
          }}>
            Apresentação<br/>Societária
          </div>

          <div style={{
            fontSize:14, fontWeight:400,
            color:'rgba(255,255,255,.55)',
            marginBottom:48,
            letterSpacing:'.01em',
          }}>
            Resultado de Obras, Equipamentos e Indicadores Financeiros
          </div>

          {/* Meta */}
          <div style={{ display:'flex', gap:32 }}>
            {[
              { label:'Referência', value:'ABR / 2026' },
            ].map((item, i) => (
              <div key={i} style={{
                paddingRight: i < 2 ? 32 : 0,
                borderRight: i < 2 ? '1px solid rgba(255,255,255,.1)' : 'none',
              }}>
                <div style={{
                  fontSize:9, fontWeight:600, letterSpacing:'.15em',
                  textTransform:'uppercase', color:'rgba(255,255,255,.35)',
                  marginBottom:5,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize:15, fontWeight:600, color:'rgba(255,255,255,.85)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — foto */}
        <div style={{
          flex:'0 0 50%',
          position:'relative',
          overflow:'hidden',
        }}>
          <img
            src={FOTO}
            alt="Obra"
            style={{
              width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center',
              display:'block',
            }}
          />
          {/* Overlay gradiente */}
          <div style={{
            position:'absolute', inset:0,
            background:`linear-gradient(to right, ${AZUL_PADRAO} 0%, transparent 30%)`,
          }}/>
        </div>
      </div>

      <NavBar current={current} total={total} goTo={goTo} />
    </div>
  )
}