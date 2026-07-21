import { useState, useMemo, useEffect, Fragment } from 'react'
import NavBar from '../../components/NavBar'
import { Sep, Dropdown, DropItem, DropGroupLabel, DropActions, DropScrollBody, PillGroup } from '../../components/Filtros'
import { fmt, groupSortKey, GroupBadge, applyPoros, s } from '../../components/tabelas/shared'

const API = 'http://localhost:3001/api/previsto-realizado'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// PRATELEIRA e OUTROS sempre depois de dez — nessa ordem
const ORDEM_EXTRA = { PRATELEIRA: 100, OUTROS: 101 }

const COL_GRUPO = s(112)
const COL_NUM   = s(42)
const COL_NOME  = s(190)
const COL_VALOR = s(96)
const COL_TOTAL = s(104)
const GAP_W     = s(10)

const GAP = { width: GAP_W, padding: 0, background: 'transparent', border: 'none' }

// ── Parsing ──────────────────────────────────────────────

// CSV simples, respeitando aspas (os valores vêm entre aspas por causa da vírgula decimal)
function parseCsv(text) {
  const linhas = []
  let campo = '', linha = [], dentroAspas = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (dentroAspas) {
      if (c === '"' && text[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') dentroAspas = false
      else campo += c
    } else if (c === '"') dentroAspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = '' }
    else if (c !== '\r') campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  return linhas
}

// " R$  840.045,13 " → 840045.13    |    " R$  (1.176.798,01)" → -1176798.01
function parseValor(bruto) {
  const txt = String(bruto || '').trim()
  if (!txt) return 0
  // Negativo pode vir como (1.234,56) — formato contábil — ou como -1.234,56
  const negativo = txt.includes('(') || /-/.test(txt)
  const limpo = txt.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')
  if (!limpo) return 0
  const n = parseFloat(limpo)
  if (isNaN(n)) return 0
  return negativo ? -Math.abs(n) : n
}

// 'jun./26' → { chave: 'JUN/26', ordem: 5 }   |   'PRATELEIRA' → { chave: 'PRATELEIRA', ordem: 100 }
function parseReferencia(bruto) {
  const txt = String(bruto || '').trim().toLowerCase().replace(/\./g, '')
  const m = txt.match(/^([a-zç]{3})\/(\d{2,4})$/)
  if (m) {
    const idx = MESES.indexOf(m[1])
    if (idx !== -1) return { chave: `${m[1].toUpperCase()}/${m[2]}`, ordem: idx }
  }
  const upper = txt.toUpperCase()
  return { chave: upper, ordem: ORDEM_EXTRA[upper] ?? 999 }
}

// Normaliza texto pra comparar cabeçalho (tira acento, espaço extra, caixa)
function normalizarCabecalho(txt) {
  return String(txt || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().toUpperCase().replace(/\s+/g, ' ')
}

// Transforma as linhas cruas da planilha numa estrutura consultável.
// A DESCRIÇÃO é a categoria (RECEITAS / DESPESAS / IMPOSTO / ...) — não entra no quadro:
// as linhas são somadas por obra + referência, dando o resultado líquido de cada célula.
function processarDados(csvTexto) {
  const todas = parseCsv(csvTexto)

  // Localiza a linha de cabeçalho e a posição de cada coluna pelo nome, em vez de
  // assumir posições fixas — assim não quebra se a planilha ganhar ou perder
  // linhas/colunas em branco na exportação.
  let idxCabecalho = -1, col = null

  for (let i = 0; i < todas.length && i < 20; i++) {
    const celulas = todas[i].map(normalizarCabecalho)
    const num = celulas.indexOf('NUM OBRA')
    if (num === -1) continue

    idxCabecalho = i
    col = {
      num,
      mesApe:     celulas.indexOf('MES APE'),
      tipo:       celulas.indexOf('TIPO'),
      referencia: celulas.indexOf('REFERENCIA'),
      valor:      celulas.indexOf('VALOR'),
    }
    break
  }

  if (!col || Object.values(col).some(i => i === -1)) {
    throw new Error('Cabeçalho não encontrado (esperado: NUM OBRA, MÊS APE, TIPO, REFERÊNCIA, VALOR)')
  }

  const valores = {}   // chave composta → soma
  const refs    = {}   // referência → ordem de exibição
  const apesSet = new Set()

  todas.slice(idxCabecalho + 1).forEach(l => {
    const num = String(l[col.num] || '').trim()
    if (!num) return

    const mesApe = String(l[col.mesApe] || '').trim()
    const tipo   = String(l[col.tipo]   || '').trim().toUpperCase()
    const { chave, ordem } = parseReferencia(l[col.referencia])
    const valor  = parseValor(l[col.valor])

    if (!chave) return
    refs[chave] = ordem

    if (tipo === 'PREVISTO') {
      if (!mesApe) return   // Previsto sem mês de APE não tem como ser posicionado
      apesSet.add(Number(mesApe))
      const k = `${num}|${chave}|P|${mesApe}`
      valores[k] = (valores[k] || 0) + valor
    } else if (tipo === 'REALIZADO') {
      // Realizado não tem mês de APE: é fato consumado, vale pra qualquer APE selecionada
      const k = `${num}|${chave}|R`
      valores[k] = (valores[k] || 0) + valor
    }
  })

  return { valores, refs, apes: [...apesSet].sort((a, b) => a - b) }
}

// ── Célula ───────────────────────────────────────────────
function Valor({ v }) {
  if (v === null || v === undefined || v === 0) {
    return <span style={{ color: 'var(--text-dim)' }}>—</span>
  }
  return (
    <span style={{ color: v < 0 ? 'var(--negative)' : 'var(--text)' }}>
      {fmt(Math.round(v))}
    </span>
  )
}

// ── Componente ───────────────────────────────────────────
export default function PrevistoRealizado({ obras, goTo, current, total }) {
  const [dados,     setDados]     = useState(null)
  const [erro,      setErro]      = useState(null)
  const [mesApe,    setMesApe]    = useState(null)
  const [metric,    setMetric]    = useState('geral')
  const [selGroups, setSelGroups] = useState(null)
  const [selObras,  setSelObras]  = useState(null)

  useEffect(() => {
    fetch(API)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
      .then(txt => setDados(processarDados(txt)))
      .catch(e => setErro(e.message))
  }, [])

  // Assim que os dados chegam, seleciona a APE mais recente por padrão
  useEffect(() => {
    if (dados && mesApe === null && dados.apes.length) {
      setMesApe(dados.apes[dados.apes.length - 1])
    }
  }, [dados, mesApe])

  const groups = useMemo(
    () => [...new Set(obras.map(o => o.consorcio).filter(Boolean))],
    [obras]
  )

  // Referências visíveis: meses posteriores ao mês da APE, depois Prateleira e Outros
  const refsVisiveis = useMemo(() => {
    if (!dados || mesApe === null) return []
    return Object.keys(dados.refs)
      .filter(k => dados.refs[k] >= 100 || dados.refs[k] > mesApe - 1)
      .sort((a, b) => dados.refs[a] - dados.refs[b])
      .map(chave => ({ chave, ordem: dados.refs[chave] }))
  }, [dados, mesApe])

  // O mês de análise é o primeiro mês após a APE — ganha quadro próprio, com Previsto e Realizado
  const mesAnalise = useMemo(
    () => refsVisiveis.find(r => r.ordem === mesApe) || null,
    [refsVisiveis, mesApe]
  )

  // Todo o resto (meses seguintes + Prateleira + Outros) mora no terceiro quadro, só com Previsto
  const demais = useMemo(
    () => refsVisiveis.filter(r => r.ordem !== mesApe),
    [refsVisiveis, mesApe]
  )

  // Meses já fechados (anteriores ao mês de análise) que tenham Realizado lançado.
  // Colapsam num acumulado só, pra tabela não crescer uma coluna a cada mês que passa.
  const historico = useMemo(() => {
    if (!dados || mesApe === null) return null
    const meses = Object.keys(dados.refs)
      .filter(k => dados.refs[k] < mesApe && dados.refs[k] < 100)
      .filter(k => obras.some(o => dados.valores[`${o.num}|${k}|R`] !== undefined))
      .sort((a, b) => dados.refs[a] - dados.refs[b])

    if (!meses.length) return null
    return {
      meses,
      titulo: meses.length === 1 ? meses[0] : `${meses[0]} a ${meses[meses.length - 1]}`,
    }
  }, [dados, mesApe, obras])

  // Linhas: só obras que aparecem na planilha, na ordem de grupo do resto do app
  const linhas = useMemo(() => {
    if (!dados || mesApe === null || !refsVisiveis.length) return []

    return obras
      .filter(o => {
        if (selGroups && !selGroups.has(o.consorcio)) return false
        if (selObras  && !selObras.has(o.num))        return false
        return refsVisiveis.some(r =>
          dados.valores[`${o.num}|${r.chave}|P|${mesApe}`] !== undefined ||
          dados.valores[`${o.num}|${r.chave}|R`]           !== undefined
        )
      })
      .sort((a, b) => groupSortKey(a.consorcio) - groupSortKey(b.consorcio))
      .map(o => {
        // No modo "% Poros", cada valor é multiplicado pelo percentual da obra
        const ap = (v) => (v === undefined ? undefined
                        : metric === 'poros' ? applyPoros(v, o) : v)

        const cel = {}
        refsVisiveis.forEach(r => {
          cel[r.chave] = {
            prev: ap(dados.valores[`${o.num}|${r.chave}|P|${mesApe}`]),
            real: ap(dados.valores[`${o.num}|${r.chave}|R`]),
          }
        })
        const totalPrev = refsVisiveis.reduce((acc, r) => acc + (cel[r.chave].prev ?? 0), 0)

        // Acumulado dos meses já fechados
        let acumulado = null
        if (historico) {
          historico.meses.forEach(m => {
            const v = ap(dados.valores[`${o.num}|${m}|R`])
            if (v !== undefined) acumulado = (acumulado ?? 0) + v
          })
        }

        return { o, cel, totalPrev, acumulado }
      })
  }, [dados, mesApe, refsVisiveis, obras, selGroups, selObras, historico, metric])

  const totais = useMemo(() => {
    const porRef = {}
    refsVisiveis.forEach(r => {
      let prev = 0, real = 0
      linhas.forEach(l => { prev += l.cel[r.chave].prev ?? 0; real += l.cel[r.chave].real ?? 0 })
      porRef[r.chave] = { prev, real }
    })
    const geral     = linhas.reduce((acc, l) => acc + l.totalPrev, 0)
    const acumulado = linhas.reduce((acc, l) => acc + (l.acumulado ?? 0), 0)
    return { porRef, geral, acumulado }
  }, [refsVisiveis, linhas])

  // ── Estilos ────────────────────────────────────────────
  const HDR = '#1e3a5f'
  const R   = s(8)

  const thBase = {
    background: HDR, color: 'rgba(255,255,255,.8)',
    fontSize: s(10.5), fontWeight: 600, letterSpacing: '.08em',
    textTransform: 'uppercase', padding: `${s(6)}px ${s(9)}px`,
    textAlign: 'center', whiteSpace: 'nowrap',
  }

  const cellBase = {
    padding: `${s(4)}px ${s(9)}px`,
    borderBottom: '1px solid var(--border)',
    textAlign: 'center', verticalAlign: 'middle',
    fontSize: s(11.5), fontVariantNumeric: 'tabular-nums',
    background: 'var(--surface)', whiteSpace: 'nowrap',
  }

  const totBase = {
    padding: `${s(8)}px ${s(9)}px`, fontWeight: 700, fontSize: s(11.5),
    color: 'rgba(255,255,255,.9)', background: HDR,
    textAlign: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
  }

  // Cada quadro é uma caixa fechada nos quatro cantos
  const cantosTopo = { borderTopLeftRadius: R, borderTopRightRadius: R }
  const rodape = (esq, dir) => ({
    borderBottomLeftRadius:  esq ? R : 0,
    borderBottomRightRadius: dir ? R : 0,
  })

  // 3 obra [+ gap + 1 histórico] + gap + 2 (prev/real) + gap + demais + total
  const nDemais    = demais.length + 1   // +1 = coluna Total por Obra
  const colsHist   = historico ? 2 : 0   // gap + coluna
  const totalCols  = 3 + colsHist + 1 + 2 + 1 + nDemais
  const tableWidth = COL_GRUPO + COL_NUM + COL_NOME
                   + (historico ? GAP_W + COL_VALOR : 0)
                   + GAP_W + (2 * COL_VALOR)
                   + GAP_W + (demais.length * COL_VALOR) + COL_TOTAL

  const labelApe = (a) => {
    const m = MESES[a - 1]
    return m ? `APE ${m.charAt(0).toUpperCase() + m.slice(1)}` : `APE ${a}`
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <div style={{
        flexShrink:0, padding:'14px 36px',
        borderBottom:'1px solid var(--border)', background:'var(--surface)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
      }}>
        <div>
          <div style={{ fontSize:9.5, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:4 }}>
            Obras <span style={{ color:'var(--accent)' }}>›</span> Previsto / Realizado
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--navy)', lineHeight:1 }}>
            {metric === 'geral'
              ? 'Quadro Resumo — Previsto / Realizado (Geral)'
              : 'Quadro Resumo — Previsto / Realizado (% Poros)'}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <PillGroup
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'geral', label: 'Geral'   },
              { value: 'poros', label: '% Poros' },
            ]}
          />
          <Sep/>

          {dados && dados.apes.length > 0 && (
            <>
              <PillGroup
                value={mesApe}
                onChange={setMesApe}
                options={dados.apes.map(a => ({ value: a, label: labelApe(a) }))}
              />
              <Sep/>
            </>
          )}

          <Dropdown label="Grupos" count={(selGroups || new Set(groups)).size} totalCount={groups.length}>
            <DropActions
              onAll={() => { setSelGroups(new Set(groups)); setSelObras(null) }}
              onNone={() => { setSelGroups(new Set()); setSelObras(new Set()) }}
            />
            <DropScrollBody>
              {groups.map(g => {
                const sel = selGroups || new Set(groups)
                return (
                  <DropItem key={g} label={g} checked={sel.has(g)} onChange={c => {
                    const n = new Set(sel)
                    if (c) n.add(g); else n.delete(g)
                    setSelGroups(n)
                  }}/>
                )
              })}
            </DropScrollBody>
          </Dropdown>

          <Dropdown label="Obras" count={(selObras || new Set(obras.map(o => o.num))).size} totalCount={obras.length}>
            <DropActions
              onAll={() => setSelObras(new Set(obras.map(o => o.num)))}
              onNone={() => setSelObras(new Set())}
            />
            <DropScrollBody>
              {groups.map(g => (
                <div key={g}>
                  <DropGroupLabel label={g}/>
                  {obras.filter(o => o.consorcio === g).map(o => {
                    const sel = selObras || new Set(obras.map(x => x.num))
                    return (
                      <DropItem key={o.num} label={<><b>{o.num}</b>&nbsp;{o.nome}</>}
                        checked={sel.has(o.num)} onChange={c => {
                          const n = new Set(sel)
                          if (c) n.add(o.num); else n.delete(o.num)
                          setSelObras(n)
                        }}/>
                    )
                  })}
                </div>
              ))}
            </DropScrollBody>
          </Dropdown>
        </div>
      </div>

      <div style={{ flex:1, minHeight:0, padding:`${s(21)}px ${s(36)}px ${s(40)}px`, display:'flex', flexDirection:'column' }}>
        {erro
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--negative)', fontSize:s(14) }}>Erro ao carregar: {erro}</div>
          : !dados
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(14) }}>Carregando…</div>
          : !mesAnalise
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(14) }}>Nenhum dado para esta APE</div>
          : !linhas.length
          ? <div style={{ textAlign:'center', padding:s(58), color:'var(--text-dim)', fontSize:s(14) }}>Nenhuma obra selecionada</div>
          : (
            <div style={{ flex:1, minHeight:0, overflowY:'auto', overflowX:'auto' }}>
              <div style={{ width: tableWidth, margin:'0 auto' }}>
                <table style={{ borderCollapse:'separate', borderSpacing:0, tableLayout:'fixed', width: tableWidth }}>
                  <colgroup>
                    <col style={{ width: COL_GRUPO }}/>
                    <col style={{ width: COL_NUM   }}/>
                    <col style={{ width: COL_NOME  }}/>
                    {historico && <>
                      <col style={{ width: GAP_W }}/>
                      <col style={{ width: COL_VALOR }}/>
                    </>}
                    <col style={{ width: GAP_W }}/>
                    <col style={{ width: COL_VALOR }}/>
                    <col style={{ width: COL_VALOR }}/>
                    <col style={{ width: GAP_W }}/>
                    {demais.map(r => <col key={r.chave} style={{ width: COL_VALOR }}/>)}
                    <col style={{ width: COL_TOTAL }}/>
                  </colgroup>

                  <thead style={{ position:'sticky', top:0, zIndex:10 }}>
                    {/* Nível 1 — títulos dos três quadros */}
                    <tr>
                      <th colSpan={3} style={{ ...thBase, ...cantosTopo }}>Obra</th>
                      {historico && <>
                        <th style={GAP}/>
                        <th style={{ ...thBase, ...cantosTopo }}>Realizado</th>
                      </>}
                      <th style={GAP}/>
                      <th colSpan={2} style={{ ...thBase, ...cantosTopo }}>{mesAnalise.chave}</th>
                      <th style={GAP}/>
                      <th colSpan={nDemais} style={{ ...thBase, ...cantosTopo }}>
                        Previsto para os demais meses de 2026
                      </th>
                    </tr>

                    {/* Nível 2 — colunas */}
                    <tr>
                      <th style={thBase}>Grupo</th>
                      <th style={thBase}>Nº</th>
                      <th style={thBase}>Nome</th>
                      {historico && <>
                        <th style={GAP}/>
                        <th style={thBase}>{historico.titulo}</th>
                      </>}
                      <th style={GAP}/>
                      <th style={thBase}>Previsto</th>
                      <th style={thBase}>Realizado</th>
                      <th style={GAP}/>
                      {demais.map(r => <th key={r.chave} style={thBase}>{r.chave}</th>)}
                      <th style={{ ...thBase, whiteSpace:'normal', lineHeight:1.3 }}>Total por Obra</th>
                    </tr>
                  </thead>

                  <tbody>
                    {linhas.map(({ o, cel, totalPrev, acumulado }) => (
                      <tr key={o.num}>
                        <td style={cellBase}><GroupBadge name={o.consorcio}/></td>
                        <td style={{ ...cellBase, fontWeight:700 }}>{o.num}</td>
                        <td style={{ ...cellBase, textAlign:'left', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis' }}>
                          {o.nome}
                        </td>
                        {historico && <>
                          <td style={GAP}/>
                          <td style={{ ...cellBase, background:'var(--surface2)' }}><Valor v={acumulado}/></td>
                        </>}
                        <td style={GAP}/>
                        <td style={cellBase}><Valor v={cel[mesAnalise.chave].prev}/></td>
                        <td style={cellBase}><Valor v={cel[mesAnalise.chave].real}/></td>
                        <td style={GAP}/>
                        {demais.map(r => (
                          <td key={r.chave} style={cellBase}><Valor v={cel[r.chave].prev}/></td>
                        ))}
                        <td style={{ ...cellBase, fontWeight:700, background:'var(--surface2)' }}>
                          <Valor v={totalPrev}/>
                        </td>
                      </tr>
                    ))}

                    <tr><td colSpan={totalCols} style={{ height:s(7), padding:0, background:'transparent', border:'none' }}/></tr>

                    <tr>
                      <td colSpan={3} style={{ ...totBase, ...rodape(true, true) }}>Total Geral</td>
                      {historico && <>
                        <td style={GAP}/>
                        <td style={{ ...totBase, ...rodape(true, true) }}>{fmt(Math.round(totais.acumulado))}</td>
                      </>}
                      <td style={GAP}/>
                      <td style={{ ...totBase, ...rodape(true, false) }}>{fmt(Math.round(totais.porRef[mesAnalise.chave].prev))}</td>
                      <td style={{ ...totBase, ...rodape(false, true) }}>{fmt(Math.round(totais.porRef[mesAnalise.chave].real))}</td>
                      <td style={GAP}/>
                      {demais.map((r, i) => (
                        <td key={r.chave} style={{ ...totBase, ...rodape(i === 0, false) }}>
                          {fmt(Math.round(totais.porRef[r.chave].prev))}
                        </td>
                      ))}
                      <td style={{ ...totBase, ...rodape(false, true) }}>{fmt(Math.round(totais.geral))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      </div>

      <NavBar current={current} total={total} goTo={goTo}/>
    </div>
  )
}
