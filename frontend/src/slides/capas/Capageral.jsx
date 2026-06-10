import NavBar from '../../components/NavBar'

const FOTO   = '/foto-obra3.jpeg'
const NAVY   = '#1e3a5f'   // azul referência
const DARK   = '#00aeff'   // azul escuro original → usado no label
const ACCENT = '#2563eb'

export default function CapaGeral({ obras, goTo, current, total }) {
  const groups = [...new Set(obras.map(o => o.consorcio).filter(Boolean))]

  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      background: NAVY,
    }}>
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {/* Linha flat única */}
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          height:3, background: ACCENT,
          zIndex:10, pointerEvents:'none',
        }}/>

        {/* ── ESQUERDA ── */}
        <div style={{
          flex:'0 0 52%',
          background: NAVY,
          display:'flex', flexDirection:'column',
          justifyContent:'space-between',
          padding:'52px 7% 40px',
          position:'relative',
          overflow:'hidden',
          zIndex:1,
        }}>
          {/* Decorações */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
            <div style={{
              position:'absolute', bottom:-180, left:-180,
              width:520, height:520, borderRadius:'50%',
              border:'1px solid rgba(255,255,255,.04)',
            }}/>
            <div style={{
              position:'absolute', bottom:-110, left:-110,
              width:360, height:360, borderRadius:'50%',
              border:'1px solid rgba(255,255,255,.03)',
            }}/>
          </div>

          {/* Logo */}
          <div style={{ position:'relative' }}>
            <img
              src="/logo.png"
              alt="Poros"
              style={{
                height:76, objectFit:'contain', objectPosition:'left',
                filter:'brightness(0) invert(1)', display:'block', opacity:.95,
              }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div style={{ display:'none', fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'.12em' }}>
              POROS
            </div>
          </div>

          {/* Título */}
          <div style={{ position:'relative', flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-start', paddingTop:72 }}>
            {/* Label em azul escuro */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              fontSize:12, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase',
              color: DARK, marginBottom:20,
            }}>
              <div style={{ width:20, height:1, background: DARK }}/>
              Apresentação Societária
            </div>

            <div style={{
              fontSize:'clamp(28px, 3.2vw, 46px)',
              fontWeight:700, color:'#fff',
              lineHeight:1.15, letterSpacing:'-.02em',
              marginBottom:14,
            }}>
              Resultado de Obras,<br/>Equipamentos e Financeiro
            </div>
          </div>

          {/* Meta */}
          <div style={{
            position:'relative',
            borderTop:'1px solid rgba(255,255,255,.08)',
            paddingTop:24,
            display:'flex', alignItems:'center', gap:0,
          }}>
            {[
              { label:'Referência', value:'ABR / 2026' },
            ].map((item, i) => (
              <div key={i} style={{ paddingRight: i < 2 ? 32 : 0, borderRight: 'none' }}>
                <div style={{
                  fontSize:9, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase',
                  color:'rgba(255,255,255,.3)', marginBottom:6,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize:16, fontWeight:600, color:'#fff', letterSpacing:'.02em' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DIREITA — Foto ── */}
        <div style={{ flex:'0 0 48%', position:'relative', overflow:'hidden' }}>
          <img
            src={FOTO}
            alt="Obra"
            style={{
              width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center',
              display:'block',
              filter:'brightness(.72) saturate(.85)',
            }}
          />
          <div style={{
            position:'absolute', inset:0,
            background:`linear-gradient(to right, ${NAVY} 0%, rgba(30,58,95,.45) 32%, transparent 68%)`,
          }}/>
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to bottom, rgba(30,58,95,.35) 0%, transparent 25%, transparent 72%, rgba(30,58,95,.25) 100%)',
          }}/>
        </div>

      </div>

      <NavBar current={current} total={total} goTo={goTo}/>
    </div>
  )
}
