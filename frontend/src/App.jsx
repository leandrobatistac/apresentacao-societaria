import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useObras } from './hooks/useObras'
import { useObra1000 } from './hooks/useObra1000'
import { usePatrimonio } from './hooks/usePatrimonio'
import CapaGeral               from './slides/capas/CapaGeral'
import CapaObras               from './slides/capas/CapaObras'
import CapaPrevisibilidade     from './slides/capas/CapaPrevisibilidade'
import CapaEquipamentos        from './slides/capas/CapaEquipamentos'
import CapaConsolidado         from './slides/capas/CapaConsolidado'
import AcompanhamentoMensal    from './slides/conteudo/AcompanhamentoMensal'
import AcumuladoAnualHistorico from './slides/conteudo/AcumuladoAnualHistorico'
import Previsibilidade         from './slides/conteudo/Previsibilidade'
import Equipamentos            from './slides/conteudo/Equipamentos'
import Consolidado             from './slides/conteudo/Consolidado'
import CapaAcumulado from './slides/capas/CapaAcumulado'
import CapaPrevisibilidade2027 from './slides/capas/CapaPrevisibilidade2027'
import Previsibilidade2027     from './slides/conteudo/Previsibilidade2027'
import CapaTimeline  from './slides/capas/CapaTimeline'
import TimelineObras from './slides/conteudo/TimelineObras'
import ComparativoMensalObras from './slides/conteudo/ComparativoMensalObras'
import PrevistoRealizado from './slides/conteudo/PrevistoRealizado'

const TOTAL = 15

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
  const { obras,      loading: l1, error: e1 } = useObras()
  const { groups,     loading: l2, error: e2 } = useObra1000()
  const { patrimonio, loading: l3, error: e3 } = usePatrimonio()

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

  if (l1 || l2 || l3) return <LoadingScreen />
  if (e1 || e2 || e3) return <ErrorScreen error={e1 || e2 || e3} />

  const nav = { goTo, current, total: TOTAL }

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:'var(--bg)',position:'relative'}}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={current} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration:.32, ease:[.4,0,.2,1] }}
          style={{ position:'absolute', inset:0 }}
        >
          {current === 0  && <CapaGeral                obras={obras}                           {...nav} />}
          {current === 1  && <CapaObras                                                         {...nav} />}
          {current === 2  && <AcompanhamentoMensal      obras={obras}                           {...nav} />}
          {current === 3  && <CapaAcumulado                                                     {...nav} />}
          {current === 4  && <AcumuladoAnualHistorico   obras={obras}                           {...nav} />}
          {current === 5  && <CapaPrevisibilidade                                               {...nav} />}
          {current === 6  && <Previsibilidade           obras={obras}                           {...nav} />}
          {current === 7 && <PrevistoRealizado obras={obras} {...nav} />}
          {current === 8  && <CapaPrevisibilidade2027                                           {...nav} />}
          {current === 9  && <Previsibilidade2027       obras={obras}                           {...nav} />}
          {current === 10  && <CapaTimeline                                                      {...nav} />}
          {current === 11 && <TimelineObras             obras={obras}                           {...nav} />}
          {current === 12 && <ComparativoMensalObras             obras={obras}                           {...nav} />}
          {current === 13 && <CapaEquipamentos                                                  {...nav} />}
          {current === 14 && <Equipamentos              groups={groups} patrimonio={patrimonio}  {...nav} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}