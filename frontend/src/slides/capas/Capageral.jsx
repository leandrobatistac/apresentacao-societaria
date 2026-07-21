
import NavBar from '../../components/NavBar'
import { PERIODO } from '../../config/periodo'

const FOTO = '/foto-obra3.jpg'

const NAVY = '#1e3a5f'
const ACCENT = '#2563eb'

export default function CapaGeral({ goTo, current, total }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: NAVY,
      }}
    >
      {/* FOTO */}
      <img
        src={FOTO}
        alt="Obra"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(.85) saturate(1)',
        }}
      />

      {/* GLOW MODERNO */}
      <div
        style={{
          position: 'absolute',
          width: 750,
          height: 750,
          borderRadius: '50%',
          background: 'rgba(37,99,235,.18)',
          filter: 'blur(150px)',
          top: -250,
          left: -180,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* OVERLAY PRINCIPAL */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(
              90deg,
              rgba(15,23,42,.96) 0%,
              rgba(15,23,42,.88) 18%,
              rgba(15,23,42,.58) 40%,
              rgba(15,23,42,.18) 70%,
              rgba(15,23,42,.02) 100%
            )
          `,
          zIndex: 2,
        }}
      />

      {/* OVERLAY SUAVE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,.08), transparent 25%, transparent 75%, rgba(0,0,0,.25))',
          zIndex: 3,
        }}
      />

      {/* LINHA SUPERIOR */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: ACCENT,
          zIndex: 10,
        }}
      />

      {/* CONTEÚDO */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          height: 'calc(100% - 42px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 6%',
        }}
      >
        {/* TOPO */}
        <div>
          <img
            src="/logo.png"
            alt="Poros"
            style={{
              height: 82,
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
              opacity: 0.95,
            }}
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />

          <div
            style={{
              display: 'none',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            POROS
          </div>
        </div>

        {/* CENTRO */}
        <div
          style={{
            maxWidth: 820,
            marginTop: '-60px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0,0,0,.18)',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: ACCENT,
              }}
            />

            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: '#dbeafe',
              }}
            >
              Apresentação de GPE
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              color: '#fff',
              fontWeight: 800,
              fontSize: 'clamp(46px, 4.4vw, 72px)',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              textShadow: '0 12px 40px rgba(0,0,0,.35)',
            }}
          >
            Resultado de Obras,
            <br />
            <span
              style={{
                color: '#60a5fa',
              }}
            >
              Equipamentos
            </span>{' '}
            e Financeiro
          </h1>
        </div>

        {/* RODAPÉ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '22px 28px 22px 34px',
              borderRadius: 18,
              background: 'rgba(255,255,255,.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,.12)',
              boxShadow: '0 12px 30px rgba(0,0,0,.18)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: ACCENT,
              }}
            />

            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.55)',
                marginBottom: 6,
              }}
            >
              Referência
            </div>

            <div
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {PERIODO.labelMes}
            </div>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
        }}
      >
        <NavBar current={current} total={total} goTo={goTo} />
      </div>
    </div>
  )
}
