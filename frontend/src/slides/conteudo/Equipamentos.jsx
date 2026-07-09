import { useState, useMemo } from 'react'
import NavBar from '../../components/NavBar'
import { PillGroup, Sep, Dropdown, DropItem, DropActions, DropScrollBody } from '../../components/Filtros'

// ── Escala ───────────────────────────────────────────────
// Mesma abordagem das outras tabelas do projeto: sem zoom/transform,
// os valores em px já nascem escalados em 25%.
const SCALE = 1.25
const s = (n) => Math.round(n * SCALE)

// ── Constantes ───────────────────────────────────────────
const GROUP_PCT = {
  'GRUPO POROS':                 1.0,
  'GRUPO POROS / CORTE':         0.5,
  'GRUPO POROS / CORTE / COMIM': 1 / 3,
  'GRUPO POROS / COMIM':         0.5,
}

const GROUP_ORDER = [
  'GRUPO POROS',
  'GRUPO POROS / CORTE / COMIM',
  'GRUPO POROS / COMIM',
  'GRUPO POROS / CORTE',
]

const GROUP_COLORS = {
  'GRUPO POROS':                 { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', accent: '#3b82f6' },
  'GRUPO POROS / CORTE':         { bg: '#fefce8', text: '#854d0e', border: '#fde047', accent: '#eab308' },
  'GRUPO POROS / CORTE / COMIM': { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe', accent: '#a855f7' },
  'GRUPO POROS / COMIM':         { bg: '#c9e6ec', text: '#0d2f3a', border: '#4a7f91' },
}

const BADGE_LABELS = {
  'GRUPO POROS':                 'POROS',
  'GRUPO POROS / CORTE':         'POROS / CORTE',
  'GRUPO POROS / CORTE / COMIM': 'POROS / CORTE / COMIM',
  'GRUPO POROS / COMIM':         'POROS / COMIM',
}

const gc = (n) => GROUP_COLORS[n] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', accent: '#64748b' }

// ── Equipamentos vendidos ─────────────────────────────────
const VENDIDOS = new Set(['TE02', 'CB21', 'CB23', 'CB26'])

// ── Monta lookup de patrimônio: frota → { valorMercado, valorPoros } ──
function buildPatrimonioMap(patrimonio = []) {
  const map = {}
  patrimonio.forEach(grupo => {
    grupo.itens.forEach(item => {
      map[item.frota] = {
        valorMercado: item.valorMercado,
        valorPoros:   item.valorPoros,
      }
    })
  })
  return map
}

const BADGE_W = s(165)
const HDR = '#1e3a5f'

// ── Helpers ──────────────────────────────────────────────
const fmt = (v) => (v === null || v === undefined) ? '—'
  : v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtPct = (res, rec) => (!rec || res === null || res === undefined) ? null
  : (res / rec * 100).toFixed(1) + '%'

const resColor = (v) => (v === null || v === undefined) ? 'inherit'
  : v > 0 ? 'var(--positive)' : v < 0 ? 'var(--negative)' : 'inherit'

const pctColors = (str) => {
  if (!str) return { bg: '#f1f5f9', color: 'var(--text-dim)' }
  const n = parseFloat(String(str).replace('%', '').replace(',', '.'))
  if (isNaN(n))  return { bg: '#f1f5f9', color: 'var(--text-dim)' }
  if (n > 0) return { bg: 'var(--positive-bg)', color: 'var(--positive)' }
  if (n < 0) return { bg: 'var(--negative-bg)', color: 'var(--negative)' }
  return { bg: '#f1f5f9', color: 'var(--text-dim)' }
}

const calcRes = (rec, desp) => {
  if (rec === null && desp === null) return null
  return (rec ?? 0) - (desp ?? 0)
}

const hasData = (eq) => (eq.rec ?? 0) !== 0 || (eq.desp ?? 0) !== 0

// ── Larguras das colunas ──────────────────────────────────
// Definidas cruas (pré-escala) num array só, pra <colgroup> e a largura
// total da tabela sempre baterem — sem precisar somar números em dois
// lugares diferentes.
const RESUMO_COL_RAW = [220, 12, 90, 90, 90, 85, 12, 90, 90, 90, 85]
const DETAIL_COL_RAW = [200, 60, 150, 90, 12, 90, 90, 90, 85, 12, 90, 90, 90, 85]

const RESUMO_COLS = RESUMO_COL_RAW.map(s)
const DETAIL_COLS = DETAIL_COL_RAW.map(s)

// ── Colgroup ─────────────────────────────────────────────
function TableColGroup({ isResumo }) {
  const widths = isResumo ? RESUMO_COLS : DETAIL_COLS
  return (
    <colgroup>
      {widths.map((w, i) => <col key={i} style={{ width: w }}/>)}
    </colgroup>
  )
}

// ── Estilo dos <th> ──────────────────────────────────────
const thBase = {
  background: HDR,
  color: 'rgba(255,255,255,.85)',
  fontSize: s(11), fontWeight: 600,
  letterSpacing: '.08em', textTransform: 'uppercase',
  padding: `${s(7)}px ${s(12)}px`, textAlign: 'center', whiteSpace: 'nowrap',
}

function TH({ children, span, rowSpan, bL, bR, bT, roundTL, roundTR }) {
  return (
    <th colSpan={span || 1} rowSpan={rowSpan || 1} style={{
      ...thBase,
      borderTopLeftRadius:  roundTL ? s(8) : 0,
      borderTopRightRadius: roundTR ? s(8) : 0,
      borderTop:    bT ? '1px solid var(--border)' : 'none',
      borderLeft:   bL ? '1px solid var(--border)' : 'none',
      borderRight:  bR ? '1px solid var(--border)' : 'none',
      borderBottom: 'none',
    }}>{children}</th>
  )
}

function TH2({ children, bL, bR }) {
  return (
    <th style={{
      ...thBase,
      borderTop:    'none',
      borderLeft:   bL ? '1px solid var(--border)' : 'none',
      borderRight:  bR ? '1px solid var(--border)' : 'none',
      borderBottom: 'none',
    }}>{children}</th>
  )
}

const GAP_STYLE = { width: s(12), padding: 0, background: 'transparent', border: 'none' }
const GapTD = () => <td style={GAP_STYLE}/>
const GapTH = () => <th style={{ ...GAP_STYLE, background: 'transparent' }}/>

// ── Badges ───────────────────────────────────────────────
function GroupBadge({ name }) {
  const c = gc(name)
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: `${s(3)}px 0`, width: BADGE_W, textAlign: 'center', margin: '0 auto',
      borderRadius: s(5), fontSize: s(9.5), fontWeight: 700,
      letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      {BADGE_LABELS[name] || name}
    </div>
  )
}

function PctBadge({ value }) {
  if (!value) return <span style={{ color: 'var(--text-dim)', fontSize: s(11) }}>—</span>
  const c = pctColors(value)
  return (
    <span style={{
      display: 'inline-block', minWidth: s(58), textAlign: 'center',
      padding: `${s(2)}px ${s(6)}px`, borderRadius: s(4),
      fontSize: s(10.5), fontWeight: 600,
      background: c.bg, color: c.color,
    }}>{value}</span>
  )
}

// ── Linha de dados ───────────────────────────────────────
const cellBase = {
  padding: `${s(6)}px ${s(10)}px`,
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
  fontSize: s(12),
  transition: 'background .1s',
}

function EquipRow({ item, isResumo, patrimonioMap = {} }) {
  const [hov, setHov] = useState(false)
  const bg = hov ? 'var(--surface2)' : 'var(--surface)'
  const pct = GROUP_PCT[item.group] || 1

  const gRes  = calcRes(item.rec, item.desp)
  const pRec  = item.rec  !== null ? item.rec  * pct : null
  const pDesp = item.desp !== null ? item.desp * pct : null
  const pRes  = calcRes(pRec, pDesp)

  const pat     = patrimonioMap[item.code] || null
  const vendido = VENDIDOS.has(item.code)

  const td = (content, opts = {}) => (
    <td style={{
      ...cellBase, background: bg,
      textAlign: opts.left ? 'left' : 'center',
      color: opts.res ? resColor(opts.v) : opts.dim ? 'var(--text-dim)' : 'var(--text)',
      fontWeight: opts.bold || opts.res ? 600 : 400,
      whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
      fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
    }}>{content}</td>
  )

  const frotaBadge = vendido ? (
    <span style={{
      display: 'inline-block', padding: `${s(1)}px ${s(6)}px`, borderRadius: s(4),
      background: '#fef08a', color: '#854d0e', border: '1px solid #fde047',
      fontSize: s(10), fontWeight: 700, letterSpacing: '.04em',
    }}>{item.code || '—'}</span>
  ) : (item.code || '—')

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {isResumo ? (
        td(<GroupBadge name={item.group}/>, { bL: true, bR: true })
      ) : (
        <>
          {td(<GroupBadge name={item.group}/>, { bL: true })}
          {td(frotaBadge, { bold: !vendido, nowrap: true })}
          {td(item.nome, { bold: true, left: true, nowrap: true })}
          {td(pat ? fmt(pat.valorPoros) : '—', { num: true, dim: !pat, bR: true })}
        </>
      )}
      <GapTD/>
      {td(fmt(item.rec),  { num: true, bL: true })}
      {td(fmt(item.desp), { num: true })}
      {td(fmt(gRes),      { num: true, res: true, v: gRes })}
      {td(<PctBadge value={fmtPct(gRes, item.rec)}/>, { bR: true })}
      <GapTD/>
      {td(fmt(pRec),  { num: true, bL: true })}
      {td(fmt(pDesp), { num: true })}
      {td(fmt(pRes),  { num: true, res: true, v: pRes })}
      {td(<PctBadge value={fmtPct(pRes, pRec)}/>, { bR: true })}
    </tr>
  )
}

// ── Linha de espaço ──────────────────────────────────────
function SpacerRow({ cols }) {
  return (
    <tr><td colSpan={cols} style={{ padding: `${s(6)}px 0`, border: 'none', background: 'var(--bg)' }}/></tr>
  )
}

// ── Cabeçalho da seção Diversas ──────────────────────────
function DiversasHeader({ cols }) {
  return (
    <tr>
      <td colSpan={cols} style={{
        padding: `${s(6)}px ${s(12)}px`,
        background: HDR, color: 'rgba(255,255,255,.85)',
        fontSize: s(11), fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', textAlign: 'center',
        borderRadius: `${s(8)}px ${s(8)}px 0 0`,
      }}>
        Receitas / Despesas Diversas
      </td>
    </tr>
  )
}

// ── Linha de total ───────────────────────────────────────
function TotalRow({ gRec, gDesp, gRes, pRec, pDesp, pRes, labelCols, patTotal }) {
  const tc = (content, opts = {}) => (
    <td style={{
      padding: `${s(7)}px ${s(10)}px`, textAlign: 'center',
      fontWeight: 700, fontSize: s(12),
      color: opts.res ? resColor(opts.v) : 'var(--text)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface2)',
      fontVariantNumeric: 'tabular-nums',
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius:  opts.rBL ? s(8) : 0,
      borderBottomRightRadius: opts.rBR ? s(8) : 0,
    }}>{content}</td>
  )
  const semPatTotal = patTotal === undefined
  return (
    <tr>
      <td colSpan={labelCols} style={{
        padding: `${s(7)}px ${s(12)}px`, fontWeight: 700, fontSize: s(12),
        color: 'var(--text)', textAlign: 'center',
        background: 'var(--surface2)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        borderRight: 'none',
        borderBottomLeftRadius: s(8),
        borderBottomRightRadius: semPatTotal ? s(8) : 0,
      }}>Total Geral</td>
      {!semPatTotal && tc(fmt(patTotal), { bR: true, rBR: true })}
      <GapTD/>
      {tc(fmt(gRec),  { bL: true, rBL: true })}
      {tc(fmt(gDesp))}
      {tc(fmt(gRes),  { res: true, v: gRes })}
      {tc(<PctBadge value={fmtPct(gRes, gRec)}/>, { bR: true, rBR: true })}
      <GapTD/>
      {tc(fmt(pRec),  { bL: true, rBL: true })}
      {tc(fmt(pDesp))}
      {tc(fmt(pRes),  { res: true, v: pRes })}
      {tc(<PctBadge value={fmtPct(pRes, pRec)}/>, { bR: true, rBR: true })}
    </tr>
  )
}

// ── Tabela principal ─────────────────────────────────────
function MainTable({ isResumo, children }) {
  const COLS       = isResumo ? 11 : 14
  const LABEL_COLS = isResumo ? 1  : 3
  const tableWidth = (isResumo ? RESUMO_COLS : DETAIL_COLS).reduce((a, b) => a + b, 0)

  return (
    <div style={{ width: tableWidth, margin: '0 auto' }}>
      <table style={{
        width: tableWidth,
        borderCollapse: 'separate',
        borderSpacing: 0,
        tableLayout: 'fixed',
      }}>
        <TableColGroup isResumo={isResumo}/>
        <thead>
          <tr>
            <TH span={isResumo ? LABEL_COLS : LABEL_COLS + 1} rowSpan={isResumo ? 2 : 1} bT bL bR roundTL roundTR>
              {isResumo ? 'Grupo' : 'Equipamento'}
            </TH>
            <GapTH/>
            <TH span={4} bT bL bR roundTL roundTR>Geral</TH>
            <GapTH/>
            <TH span={4} bT bL bR roundTL roundTR>% Poros</TH>
          </tr>
          <tr>
            {!isResumo && (
              <>
                <TH2 bL>Grupo</TH2>
                <TH2>Frota</TH2>
                <TH2>Descrição</TH2>
                <TH2 bR>R$ Poros</TH2>
              </>
            )}
            <GapTH/>
            <TH2 bL>Receita</TH2>
            <TH2>Despesa</TH2>
            <TH2>Resultado</TH2>
            <TH2 bR>%</TH2>
            <GapTH/>
            <TH2 bL>Receita</TH2>
            <TH2>Despesa</TH2>
            <TH2>Resultado</TH2>
            <TH2 bR>%</TH2>
          </tr>
        </thead>
        <tbody>
          {typeof children === 'function' ? children({ COLS, LABEL_COLS }) : children}
        </tbody>
      </table>
    </div>
  )
}

// ── Tela Resumo Geral ────────────────────────────────────
function ResumoGeral({ groups }) {
  const ordered = useMemo(
    () => GROUP_ORDER.map(n => groups.find(g => g.name === n)).filter(Boolean),
    [groups]
  )

  const items = ordered.map(g => {
    const pct = GROUP_PCT[g.name] || 1
    const all = [...(g.equipamentos || []), ...(g.diversas || []).filter(d => !d.isHeader)]
    let rec = 0, desp = 0
    all.forEach(i => { rec += i.rec ?? 0; desp += i.desp ?? 0 })
    return { group: g.name, rec, desp, pct }
  })

  let tGRec = 0, tGDesp = 0, tPRec = 0, tPDesp = 0
  items.forEach(i => {
    tGRec  += i.rec;         tGDesp  += i.desp
    tPRec  += i.rec * i.pct; tPDesp  += i.desp * i.pct
  })

  return (
    <MainTable isResumo>
      {({ COLS, LABEL_COLS }) => (
        <>
          {items.map(item => (
            <EquipRow key={item.group} item={item} isResumo/>
          ))}
          <TotalRow
            gRec={tGRec} gDesp={tGDesp} gRes={tGRec - tGDesp}
            pRec={tPRec} pDesp={tPDesp} pRes={tPRec - tPDesp}
            labelCols={LABEL_COLS}
          />
        </>
      )}
    </MainTable>
  )
}

// ── Tela de detalhe de grupo ─────────────────────────────
function GrupoDetalhe({ groupData, sortMode, selEquips, patrimonioMap }) {
  const pct = GROUP_PCT[groupData.name] || 1

  const equipItems = useMemo(() => (groupData.equipamentos || []).map(eq => ({
    group: groupData.name, code: eq.code, nome: eq.nome,
    rec: eq.rec ?? null, desp: eq.desp ?? null,
  })), [groupData])

  const diversasItems = useMemo(() => (groupData.diversas || [])
    .filter(d => !d.isHeader)
    .map(d => ({
      group: groupData.name, code: null, nome: d.nome,
      rec: d.rec ?? null, desp: d.desp ?? null,
    })), [groupData])

  const filteredEquip = useMemo(() => {
    const f = equipItems.filter(i =>
      selEquips.has(`${i.group}::${i.code || i.nome}`) && hasData(i)
    )
    if (sortMode === 'abc-geral')
      return [...f].sort((a, b) => (calcRes(b.rec, b.desp) ?? 0) - (calcRes(a.rec, a.desp) ?? 0))
    if (sortMode === 'abc-poros')
      return [...f].sort((a, b) =>
        ((calcRes(b.rec, b.desp) ?? 0) * pct) - ((calcRes(a.rec, a.desp) ?? 0) * pct)
      )
    return f
  }, [equipItems, selEquips, sortMode, pct])

  const totals = useMemo(() => {
    let tGRec = 0, tGDesp = 0, tPatPoros = 0
    ;[...filteredEquip, ...diversasItems].forEach(i => {
      tGRec  += i.rec  ?? 0
      tGDesp += i.desp ?? 0
      const pat = patrimonioMap[i.code]
      if (pat?.valorPoros) tPatPoros += pat.valorPoros
    })
    const tGRes = tGRec - tGDesp
    return {
      tGRec, tGDesp, tGRes,
      tPRec:  tGRec  * pct,
      tPDesp: tGDesp * pct,
      tPRes:  tGRes  * pct,
      tPatPoros,
    }
  }, [filteredEquip, diversasItems, pct, patrimonioMap])

  return (
    <MainTable>
      {({ COLS, LABEL_COLS }) => (
        <>
          {filteredEquip.map((item, i) => (
            <EquipRow key={`e-${item.code || item.nome}-${i}`} item={item} patrimonioMap={patrimonioMap}/>
          ))}

          {diversasItems.length > 0 && (
            <>
              <SpacerRow cols={COLS}/>
              <DiversasHeader cols={COLS}/>
              {diversasItems.map((item, i) => (
                <EquipRow key={`d-${item.nome}-${i}`} item={item} patrimonioMap={patrimonioMap}/>
              ))}
            </>
          )}

          <TotalRow
            gRec={totals.tGRec} gDesp={totals.tGDesp} gRes={totals.tGRes}
            pRec={totals.tPRec} pDesp={totals.tPDesp} pRes={totals.tPRes}
            labelCols={LABEL_COLS}
            patTotal={totals.tPatPoros}
          />
        </>
      )}
    </MainTable>
  )
}

// ── Sidebar (sem escala — é navegação, fica no tamanho normal) ──
function Sidebar({ groups, active, onChange }) {
  const ordered = useMemo(
    () => GROUP_ORDER.map(n => groups.find(g => g.name === n)).filter(Boolean),
    [groups]
  )

  return (
    <div style={{
      flexShrink: 0, width: 220,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      padding: '20px 14px', display: 'flex', flexDirection: 'column',
      gap: 4, overflowY: 'auto',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px 8px' }}>Visão</div>

      <SidebarItem
        label="Resumo Geral"
        sub="Todos os grupos"
        isActive={active === '__resumo__'}
        accent="#0284c7"
        activeBg="#e0f2fe"
        activeText="#0c4a6e"
        onClick={() => onChange('__resumo__')}
      />

      <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }}/>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px 6px' }}>Grupos</div>

      {ordered.map(g => {
        const c = gc(g.name)
        const isActive = active === g.name
        const count = (g.equipamentos || []).filter(hasData).length
        return (
          <SidebarItem
            key={g.name}
            label={BADGE_LABELS[g.name] || g.name}
            sub={`${count} ${count === 1 ? 'equipamento' : 'equipamentos'}`}
            isActive={isActive}
            accent={c.accent}
            activeBg={c.bg}
            activeText={c.text}
            onClick={() => onChange(g.name)}
          />
        )
      })}
    </div>
  )
}

function SidebarItem({ label, sub, isActive, accent, activeBg, activeText, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', border: 'none', borderRadius: 8,
      background: isActive ? activeBg : 'transparent',
      cursor: 'pointer', transition: 'all .15s',
      textAlign: 'left', fontFamily: 'inherit',
    }}>
      <div style={{ width: 4, height: 24, borderRadius: 2, background: isActive ? accent : 'transparent', flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? activeText : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: 10, marginTop: 2, color: isActive ? activeText : 'var(--text-dim)', opacity: isActive ? .75 : 1 }}>{sub}</div>
      </div>
    </button>
  )
}

// ── Componente principal ─────────────────────────────────
export default function Equipamentos({ groups, patrimonio = [], goTo, current, total }) {
  const [active,    setActive]    = useState('__resumo__')
  const [sortMode,  setSortMode]  = useState('grupo')
  const [selEquips, setSelEquips] = useState(() => new Set())

  const patrimonioMap = useMemo(() => buildPatrimonioMap(patrimonio), [patrimonio])

  const groupData = useMemo(() => groups.find(g => g.name === active), [groups, active])

  const equipItems = useMemo(() => {
    if (!groupData) return []
    return groupData.equipamentos.map(eq => ({
      group: groupData.name, code: eq.code, nome: eq.nome,
      rec: eq.rec ?? null, desp: eq.desp ?? null,
    }))
  }, [groupData])

  useMemo(() => {
    if (!groupData) return
    setSelEquips(new Set(equipItems.map(i => `${i.group}::${i.code || i.nome}`)))
  }, [active, equipItems.length])

  const isResumo = active === '__resumo__'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Topbar — sem escala, mesmo tamanho do resto do app */}
      <div style={{
        flexShrink: 0, padding: '14px 36px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>
            Obra 1000 <span style={{ color: 'var(--accent)' }}>›</span> Equipamentos
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>
            {isResumo ? 'Resumo Geral' : (BADGE_LABELS[active] || active)}
          </div>
        </div>

        {!isResumo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PillGroup value={sortMode} onChange={setSortMode} options={[
              { value: 'grupo',     label: 'Por Grupo' },
              { value: 'abc-geral', label: 'ABC · Geral' },
              { value: 'abc-poros', label: 'ABC · % Poros' },
            ]}/>
            <Sep/>
            <Dropdown label="Equipamentos" count={selEquips.size} totalCount={equipItems.length}>
              <DropActions
                onAll={() => setSelEquips(new Set(equipItems.map(i => `${i.group}::${i.code || i.nome}`)))}
                onNone={() => setSelEquips(new Set())}
              />
              <DropScrollBody>
                {equipItems.map(i => {
                  const k = `${i.group}::${i.code || i.nome}`
                  return (
                    <DropItem key={k}
                      label={<><b>{i.code}</b>&nbsp;{i.nome}</>}
                      checked={selEquips.has(k)}
                      onChange={c => {
                        const n = new Set(selEquips)
                        if (c) n.add(k); else n.delete(k)
                        setSelEquips(n)
                      }}
                    />
                  )
                })}
              </DropScrollBody>
            </Dropdown>
          </div>
        )}
      </div>

      {/* Corpo */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <Sidebar groups={groups} active={active} onChange={setActive}/>

        <div style={{ flex: 1, minHeight: 0, padding: '18px 36px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
            {isResumo ? (
              <ResumoGeral groups={groups}/>
            ) : groupData ? (
              <GrupoDetalhe
                groupData={groupData}
                sortMode={sortMode}
                selEquips={selEquips}
                patrimonioMap={patrimonioMap}
              />
            ) : null}
          </div>
        </div>
      </div>

      <NavBar current={current} total={total} goTo={goTo}/>
    </div>
  )
}
