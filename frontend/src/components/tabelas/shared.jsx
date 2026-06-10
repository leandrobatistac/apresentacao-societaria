import { useState } from 'react'

export const GROUP_COLORS = {
  'CONS. SP':    { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  'CORTE':       { bg: '#fefce8', text: '#854d0e', border: '#fde047' },
  'POROS COMIM': { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
  'GOIÁS':       { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  'POROS':       { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
  'POROS MHEGA': { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
}

export const GROUP_ORDER = ['POROS', 'GOIÁS', 'POROS COMIM', 'CONS. SP', 'CORTE', 'POROS MHEGA']

export const gc = (name) => GROUP_COLORS[name] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }

export function fmt(v) {
  if (v === null || v === undefined || v === 0) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function fmtPct(v) {
  if (v === null || v === undefined || isNaN(v)) return '—'
  return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

export function applyPoros(v, obra) {
  if (v === null) return null
  return v * obra.pct
}

export function isObraZerada(o) {
  const fields = [
    'jan_rec','jan_desp','jan_res','fev_rec','fev_desp','fev_res',
    'mar_rec','mar_desp','mar_res','abr_rec','abr_desp','abr_res',
    'mai_rec','mai_desp','mai_res','jun_rec','jun_desp','jun_res',
    'jul_rec','jul_desp','jul_res','ago_rec','ago_desp','ago_res',
    'set_rec','set_desp','set_res','out_rec','out_desp','out_res',
    'nov_rec','nov_desp','nov_res','dez_rec','dez_desp','dez_res',
    'at_rec','at_desp','at_res','p_rec','p_desp','p_res','ad_rec','ad_desp','ad_res',
  ]
  return fields.every(f => !o[f])
}

export function groupSortKey(name) {
  const idx = GROUP_ORDER.indexOf(name)
  return idx === -1 ? 999 : idx
}

export function GroupBadge({ name }) {
  const c = gc(name)
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '3px 0', width: 96, textAlign: 'center', margin: '0 auto',
      borderRadius: 6, fontSize: 10, fontWeight: 700,
      letterSpacing: '.05em', whiteSpace: 'nowrap',
    }}>
      {name}
    </div>
  )
}

export const baseCell = {
  padding: '5px 12px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
  transition: 'background .1s',
  fontSize: 11,
}

export const GAP = { width: 10, padding: 0, background: 'transparent', border: 'none' }
export const GapTD = () => <td style={GAP}/>
export const GapTH = () => <th style={GAP}/>

export function TH({ children, span, roundTL, roundTR }) {
  return (
    <th colSpan={span} style={{
      background: '#1e3a5f',
      color: 'rgba(255,255,255,.8)',
      fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', padding: '6px 12px',
      textAlign: 'center', whiteSpace: 'nowrap',
      borderTopLeftRadius:  roundTL ? 8 : 0,
      borderTopRightRadius: roundTR ? 8 : 0,
    }}>
      {children}
    </th>
  )
}

export function makeTd(bg) {
  return (content, opts = {}) => (
    <td style={{
      ...baseCell, background: bg,
      textAlign: opts.alignLeft ? 'left' : 'center',
      color: opts.dim ? 'var(--text-dim)' : opts.bold ? 'var(--text)' : '#000000',
      fontWeight: opts.bold || opts.isRes ? 600 : 400,
      whiteSpace: opts.nowrap ? 'nowrap' : 'normal',
      fontVariantNumeric: opts.num ? 'tabular-nums' : undefined,
      maxWidth: opts.maxWidth,
      overflow: opts.maxWidth ? 'hidden' : 'visible',
      textOverflow: opts.maxWidth ? 'ellipsis' : 'clip',
      borderLeft:  opts.bL ? '1px solid var(--border)' : 'none',
      borderRight: opts.bR ? '1px solid var(--border)' : 'none',
      borderBottomLeftRadius:  opts.rBL ? 8 : 0,
      borderBottomRightRadius: opts.rBR ? 8 : 0,
    }}>
      {content}
    </td>
  )
}

export function buildGroupEntries(rowsData) {
  const byGroup = rowsData.reduce((acc, row) => {
    const g = row.o.consorcio; if (!acc[g]) acc[g] = []; acc[g].push(row); return acc
  }, {})
  const entries = GROUP_ORDER.filter(g => byGroup[g]).map(g => [g, byGroup[g]])
  Object.keys(byGroup).forEach(g => {
    if (!GROUP_ORDER.includes(g)) entries.push([g, byGroup[g]])
  })
  return entries
}