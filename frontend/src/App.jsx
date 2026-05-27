import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useObras } from './hooks/useObras'
import { useObra1000 } from './hooks/useObra1000'
import CapaGeral from './slides/CapaGeral'
import CapaObras from './slides/CapaObras'
import Acumulado from './slides/Acumulado'
import Previsibilidade from './slides/Previsibilidade'
import CapaPrevisibilidade from './slides/CapaPrevisibilidade'
import CapaEquipamentos from './slides/CapaEquipamentos'
import Equipamentos from './slides/Equipamentos'

const TOTAL = 7

const variants = {
  enter:  (d) => ({ opacity: 0, x: d > 0 ? 50 : -50 }),
  center: ()  => ({ opacity: 1, x: 0 }),
  exit:   (d) => ({ opacity: 0, x: d > 0 ? -50 : 50 }),
}

function LoadingScreen() {
  return (
    <div style={{
      width:'100vw',height:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',background:'var(--bg)',gap:16,
    }}>
      <div style={{
        width:36,height:36,border:'3px solid var(--border)',
        borderTopColor:'var(--navy)',borderRadius:'50%',
        animation:'spin .7s linear infinite',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{fontSize:11,color:'var(--text-dim)',letterSpacing:'.1em',fontWeight:500}}>
        CARREGANDO
      </span>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div style={{
      width:'100vw',height:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',background:'var(--bg)',gap:8,
    }}>
      <span style={{fontSize:13,color:'var(--negative)',fontWeight:600}}>Erro ao carregar dados</span>
      <span style={{fontSize:11,color:'var(--text-dim)'}}>Verifique se o backend está rodando (localhost:3001)</span>
      <code style={{fontSize:10,color:'var(--text-muted)',marginTop:8}}>{error}</code>
    </div>
  )
}

export default function App() {
  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState(1)
  const { obras, loading: l1, error: e1 } = useObras()
  const { groups, loading: l2, error: e2 } = useObra1000()

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= TOTAL) return
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  goTo(current - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [current, goTo])

  if (l1 || l2) return <LoadingScreen />
  if (e1 || e2) return <ErrorScreen error={e1 || e2} />

  const nav = { goTo, current, total: TOTAL }

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:'var(--bg)',position:'relative'}}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={current} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration:.32, ease:[.4,0,.2,1] }}
          style={{ position:'absolute', inset:0 }}
        >
          {current === 0 && <CapaGeral          obras={obras}   {...nav} />}
          {current === 1 && <CapaObras                          {...nav} />}
          {current === 2 && <Acumulado          obras={obras}   {...nav} />}
          {current === 3 && <CapaPrevisibilidade                {...nav} />}
          {current === 4 && <Previsibilidade    obras={obras}   {...nav} />}
          {current === 5 && <CapaEquipamentos                   {...nav} />}
          {current === 6 && <Equipamentos       groups={groups} {...nav} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
