import { useState, useMemo } from 'react'
import NavBar from '../components/NavBar'
import { PillGroup, Sep, Dropdown, DropItem, DropActions, DropScrollBody } from '../components/Filtros'

// ── % Poros por grupo ────────────────────────────────────
const GROUP_PCT = {
  'GRUPO POROS':                 1.0,
  'GRUPO POROS / CORTE':         0.5,
  'GRUPO POROS / CORTE / COMIM': 1 / 3,
  'GRUPO POROS / COMIM':         0.5,
}

const GROUP_COLORS = {
  'GRUPO POROS':                 { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', accent: '#3b82f6' },
  'GRUPO POROS / CORTE':         { bg: '#fefce8', text: '#854d0e', border: '#fde047', accent: '#eab308' },
  'GRUPO POROS / CORTE / COMIM': { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', accent: '#64748b' },
  'GRUPO POROS / COMIM':         { bg: '#ffe4e6', text: '#881337', border: '#fca5a5', accent: '#e11d48' },
}

const BADGE_LABELS = {
  'GRUPO POROS':                 'POROS',
  'GRUPO POROS / CORTE':         'POROS / CORTE',
  'GRUPO POROS / CORTE / COMIM': 'POROS / CORTE / COMIM',
  'GRUPO POROS / COMIM':         'POROS / COMIM',
}

const gc = (n) => GROUP_COLORS[n] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', accent: '#64748b' }

// ── Helpers ──────────────────────────────────────────────
function fmt(v) {
  if (v === null || v === undefined) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtPct(res, rec) {
  if (res === null || !rec) return null
  return (res / rec * 100).toFixed(1) + '%'
}
function resColor(v) {
  if (v === null || v === undefined) return 'inherit'
  return v > 0 ? 'var(--positive)' : v < 0 ? 'var(--negative)' : 'inherit'
}
function pctColors(s) {
  if (!s) return { bg: '#f1f5f9', color: 'var(--text-dim)' }
  const n = parseFloat(String(s).replace('%', '').replace(',', '.'))
  if (isNaN(n)) return { bg: '#f1f5f9', color: 'var(--text-dim)' }
  if (n > 0) return { bg: 'var(--positive-bg)', color: 'var(--positive)' }
  if (n < 0) return { bg: 'var(--negative-bg)', color: 'var(--negative)' }
  return { bg: '#f1f5f9', color: 'var(--text-dim)' }
}

const BADGE_W = 165
const GAP = { width: 12, padding: 0, background: 'transparent', border: 'none' }

function GroupBadge({ name }) {
  const c = gc(name)
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '3px 0', width: BADGE_W, textAlign: 'center', margin: '0 auto',
      borderRadius: 5, fontSize: 9.5, fontWeight: 700,
      letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      {BADGE_LABELS[name] || name}
    </div>
  )
}

function PctBadge({ value }) {
  if (!value) return <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</span>
  const c = pctColors(value)
  return (
    <span style={{
      display: 'inline-block', minWidth: 58, textAlign: 'center',
      padding: '2px 6px', borderRadius: 4,
      fontSize: 10.5, fontWeight: 600,
      background: c.bg, color: c.color,
    }}>{value}</span>
  )
}

function TH({ children, span, bL, bR, bT, roundTL, roundTR, width }) {
  return (
    <th colSpan={span} style={{
      width,
      background: '#1e3a5f',
      color: 'rgba(255,255,255,.8)',
      fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', padding: '6px 12px',
      textAlign: 'center', whiteSpace: 'nowrap',
      borderTopLeftRadius:  roundTL ? 8 : 0,
      borderTopRightRadius: roundTR ? 8 : 0,
      borderTop:    bT ? '1px solid var(--border)' : 'none',
      borderLeft:   bL ? '1px solid var(--border)' : 'none',
      borderRight:  bR ? '1px solid var(--border)' : '1px solid rgba(255,255,255,.06)',
      borderBottom: '1px solid rgba(255,255,255,.08)',
    }}>{children}</th>
  )
}

const baseCell = { padding: '6px 10px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', transition: 'background .1s', fontSize: 12 }

function EquipRow({ item }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const pct = GROUP_PCT[item.group] || 1
  const pRec  = item.rec  !== null ? item.rec  * pct : null
  const pDesp = item.desp !== null ? item.desp * pct : null
  const pRes  = item.res  !== null ? item.res  * pct : null
  const gPct  = item.pctStr || fmtPct(item.res, item.rec)
  const pPct  = fmtPct(pRes, pRec)

  const td = (content, opts = {}) => (
    <td style={{
      ...baseCell, background: bg,
      textAlign: opts.alignLeft ? 'left' : 'center',
      color: opts.res ? resColor(opts.v) : opts.dim ? 'var(--text-dim)' : 'var(--text)',
      fontWeight: opts.bold || opts.res ? 600 : 400,
      whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
      fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
      fontStyle: item.isDiversa ? 'italic' : 'normal',
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
    }}>{content}</td>
  )

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {td(<GroupBadge name={item.group}/>, { bL: true })}
      {td(item.code || '—', { dim: true })}
      {td(item.nome, { bold: true, nowrap: true, alignLeft: true })}
      <td style={GAP}/>
      {td(fmt(item.rec),  { num: true, bL: true })}
      {td(fmt(item.desp), { num: true })}
      {td(fmt(item.res),  { num: true, res: true, v: item.res })}
      {td(<PctBadge value={gPct}/>, { bR: true })}
      <td style={GAP}/>
      {td(fmt(pRec),  { num: true, bL: true })}
      {td(fmt(pDesp), { num: true })}
      {td(fmt(pRes),  { num: true, res: true, v: pRes })}
      {td(<PctBadge value={pPct}/>, { bR: true })}
    </tr>
  )
}

function DiversasHeader() {
  return (
    <tr>
      <td colSpan={13} style={{
        padding: '8px 14px',
        background: 'var(--surface2)',
        fontSize: 10, fontWeight: 700,
        letterSpacing: '.1em', textTransform: 'uppercase',
        color: 'var(--text-muted)',
        borderTop: '2px solid var(--border2)',
        borderBottom: '1px solid var(--border)',
      }}>
        ▾ Receitas / Despesas Diversas
      </td>
    </tr>
  )
}

function TotalRow({ gRec, gDesp, gRes, pRec, pDesp, pRes }) {
  const totCell = (v, isPct, isRes, opts = {}) => (
    <td style={{
      padding: '7px 10px', textAlign: 'center', fontWeight: 700, fontSize: 12,
      color: isRes ? resColor(v) : 'var(--text)',
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      background: 'var(--surface2)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius:  opts.rBL ? 8 : 0,
      borderBottomRightRadius: opts.rBR ? 8 : 0,
    }}>
      {isPct ? (v ? <PctBadge value={v}/> : '—') : fmt(v)}
    </td>
  )
  return (
    <tr>
      <td colSpan={3} style={{
        padding: '7px 12px', fontWeight: 700, fontSize: 12, color: 'var(--text)', textAlign: 'center',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
        borderBottomLeftRadius: 8, borderBottomRightRadius: 8, background: 'var(--surface2)',
      }}>Total Geral</td>
      <td style={GAP}/>
      {totCell(gRec,  false, false, { bL: true, rBL: true })}
      {totCell(gDesp, false, false)}
      {totCell(gRes,  false, true)}
      {totCell(fmtPct(gRes, gRec), true, false, { bR: true, rBR: true })}
      <td style={GAP}/>
      {totCell(pRec,  false, false, { bL: true, rBL: true })}
      {totCell(pDesp, false, false)}
      {totCell(pRes,  false, true)}
      {totCell(fmtPct(pRes, pRec), true, false, { bR: true, rBR: true })}
    </tr>
  )
}

function Sidebar({ groups, active, onChange }) {
  return (
    <div style={{ flexShrink: 0, width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px 12px' }}>Grupos</div>
      {groups.map(g => {
        const isActive = active === g.name
        const c = gc(g.name)
        const equipCount = g.equipamentos.length + (g.diversas?.filter(d => !d.isHeader).length || 0)
        return (
          <button key={g.name} onClick={() => onChange(g.name)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 8, background: isActive ? c.bg : 'transparent', cursor: 'pointer', transition: 'all .15s', textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: isActive ? c.accent : 'transparent', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? c.text : 'var(--text)', letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{BADGE_LABELS[g.name] || g.name}</div>
              <div style={{ fontSize: 10, marginTop: 2, color: isActive ? c.text : 'var(--text-dim)', opacity: isActive ? .8 : 1 }}>{equipCount} {equipCount === 1 ? 'item' : 'equipamentos'}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function Equipamentos({ groups, goTo, current, total }) {
  const [activeGroup, setActiveGroup] = useState('GRUPO POROS')
  const [sortMode,    setSortMode]    = useState('grupo')
  const [selEquips,   setSelEquips]   = useState(() => new Set())
  const groupData = useMemo(() => groups.find(g => g.name === activeGroup), [groups, activeGroup])
  const equipItems = useMemo(() => {
    if (!groupData) return []
    return groupData.equipamentos.map(eq => ({ group: groupData.name, code: eq.code, nome: eq.nome, rec: eq.rec, desp: eq.desp, res: eq.res, pctStr: eq.pct, isDiversa: false }))
  }, [groupData])
  const diversasItems = useMemo(() => {
    if (!groupData) return []
    return (groupData.diversas || []).filter(d => !d.isHeader).map(d => ({ group: groupData.name, code: null, nome: d.nome, rec: d.rec, desp: d.desp, res: null, pctStr: null, isDiversa: true }))
  }, [groupData])

  useMemo(() => {
    const keys = equipItems.map(i => `${i.group}::${i.code || i.nome}`)
    setSelEquips(new Set(keys))
  }, [activeGroup, equipItems.length])

  const filteredEquip = useMemo(() => {
    const f = equipItems.filter(i => {
      if (!selEquips.has(`${i.group}::${i.code || i.nome}`)) return false
      const hasData = (i.rec !== null && i.rec !== 0) || (i.desp !== null && i.desp !== 0) || (i.res !== null && i.res !== 0)
      return hasData
    })
    if (sortMode === 'abc-geral') return [...f].sort((a, b) => (b.res || 0) - (a.res || 0))
    if (sortMode === 'abc-poros') {
      return [...f].sort((a, b) => {
        const pct = GROUP_PCT[a.group] || 1
        return ((b.res || 0) * pct) - ((a.res || 0) * pct)
      })
    }
    return f
  }, [equipItems, selEquips, sortMode])

  const totals = useMemo(() => {
    let tGRec = 0, tGDesp = 0, tPRec = 0, tPDesp = 0
    const pct = GROUP_PCT[activeGroup] || 1
    ;[...filteredEquip, ...diversasItems].forEach(i => {
      if (i.rec  !== null) { tGRec  += i.rec;  tPRec  += i.rec  * pct }
      if (i.desp !== null) { tGDesp += i.desp; tPDesp += i.desp * pct }
    })
    const tGRes = tGRec - tGDesp
    const tPRes = tPRec - tPDesp
    return { tGRec, tGDesp, tGRes, tPRec, tPDesp, tPRes }
  }, [filteredEquip, diversasItems, activeGroup])

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <div style={{ flexShrink:0, padding:'14px 36px', borderBottom:'1px solid var(--border)', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <div>
          <div style={{ fontSize:9.5, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:3 }}>Obra 1000 <span style={{ color:'var(--accent)' }}>›</span> Equipamentos</div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>{BADGE_LABELS[activeGroup] || activeGroup}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <PillGroup value={sortMode} onChange={setSortMode} options={[ { value:'grupo', label:'Por Grupo' }, { value:'abc-geral', label:'ABC · Geral' }, { value:'abc-poros', label:'ABC · % Poros' } ]}/>
          <Sep/>
          <Dropdown label="Equipamentos" count={selEquips.size} totalCount={equipItems.length}>
            <DropActions onAll={() => setSelEquips(new Set(equipItems.map(i => `${i.group}::${i.code || i.nome}`)))} onNone={() => setSelEquips(new Set())}/>
            <DropScrollBody>
              {equipItems.map(i => {
                const k = `${i.group}::${i.code || i.nome}`
                return <DropItem key={k} label={<><b>{i.code}</b>&nbsp;{i.nome}</>} checked={selEquips.has(k)} onChange={c => { const n = new Set(selEquips); if (c) n.add(k); else n.delete(k); setSelEquips(n) }}/>
              })}
            </DropScrollBody>
          </Dropdown>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <Sidebar groups={groups} active={activeGroup} onChange={setActiveGroup}/>
        <div style={{ flex:1, overflowY:'auto', padding:'18px 36px' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, tableLayout:'auto' }}>
            <thead>
              <tr>
                <TH span={3} bT bL bR roundTL roundTR>Equipamento</TH>
                <td style={GAP}/>
                <TH span={4} bT bL bR roundTL roundTR>Geral</TH>
                <td style={GAP}/>
                <TH span={4} bT bL bR roundTL roundTR>% Poros</TH>
              </tr>
              <tr>
                <TH bL width={BADGE_W + 24}>Grupo</TH>
                <TH width={70}>Frota</TH>
                <TH>Descrição</TH>
                <td style={GAP}/>
                <TH bL>Receita</TH>
                <TH>Despesa</TH>
                <TH>Resultado</TH>
                <TH bR>%</TH>
                <td style={GAP}/>
                <TH bL>Receita</TH>
                <TH>Despesa</TH>
                <TH>Resultado</TH>
                <TH bR>%</TH>
              </tr>
            </thead>
            <tbody>
              {filteredEquip.map((item, i) => <EquipRow key={`e-${item.code || item.nome}-${i}`} item={item}/>)}
              {diversasItems.length > 0 && (
                <>
                  <DiversasHeader/>
                  {diversasItems.map((item, i) => <EquipRow key={`d-${item.nome}-${i}`} item={item}/>)}
                </>
              )}
              <TotalRow gRec={totals.tGRec} gDesp={totals.tGDesp} gRes={totals.tGRes} pRec={totals.tPRec} pDesp={totals.tPDesp} pRes={totals.tPRes}/>
            </tbody>
          </table>
        </div>
      </div>
      <NavBar current={current} total={total} goTo={goTo}/>
    </div>
  )
}