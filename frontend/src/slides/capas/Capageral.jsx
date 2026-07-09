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
          filter: 'brightness(.82) saturate(.95)',
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
              rgba(30,58,95,.95) 0%,
              rgba(30,58,95,.90) 22%,
              rgba(30,58,95,.72) 42%,
              rgba(30,58,95,.30) 68%,
              rgba(30,58,95,.08) 100%
            )
          `,
        }}
      />

      {/* OVERLAY SUAVE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,.12), transparent 25%, transparent 75%, rgba(0,0,0,.25))',
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
            maxWidth: 780,
            marginTop: '-60px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(37,99,235,.12)',
              border: '1px solid rgba(255,255,255,.12)',
              backdropFilter: 'blur(10px)',
              marginBottom: 26,
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
              fontWeight: 700,
              fontSize: 'clamp(42px, 4vw, 68px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              textShadow: '0 8px 24px rgba(0,0,0,.25)',
            }}
          >
            Resultado de Obras,
            <br />
            Equipamentos e Financeiro
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
              padding: '22px 28px',
              borderRadius: 18,
              background: 'rgba(15,23,42,.42)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.5)',
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