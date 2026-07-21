export const PERIODO = {

  // Título do 1º quadro da tabela de Acompanhamento Mensal
  // Exemplo: '1º Trimestre', '1º Quadrimestre', '1º Semestre'
  labelPeriodo: '1º Quinquemestre ',

  // Meses que compõem o período acumulado acima (usados para somar Jan+Fev+Mar etc.)
  // Adicionar o mês anterior ao mês atual a cada virada
  // Exemplo em Maio: ['jan', 'fev', 'mar', 'abr']
  meses: ['jan', 'fev', 'mar','abr','mai'],

  // Título do 2º quadro da tabela de Acompanhamento Mensal
  // Também aparece como referência na CapaAcumulado
  // Exemplo: 'Mai/2026', 'Jun/2026'
  labelMes: 'Jun/2026',

  // Chave do mês atual — usada para buscar os campos corretos no parse
  // (ex: o[`${mes}_rec`], o[`${mes}_desp`], o[`${mes}_res`])
  // Deve bater com as colunas do parseCSV: 'jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'
  mes: 'jun',

  // Título do 2º quadro da tabela de Acumulado Anual e Histórico
  // Deve refletir o mês atual
  // Exemplo em Maio: 'Acumulado até Mai/26'
  labelAte: 'Acumulado Geral até Jun/26',

  // Meses já realizados a partir de Abril — controla o filtro e as colunas
  // visíveis na Timeline. Adicionar o novo mês a cada virada.
  // Exemplo em Junho: ['abr', 'mai', 'jun']
  // Nunca incluir Jan/Fev/Mar aqui — eles são fixos na Timeline
  mesesRealizados: ['abr','mai','jun'],

}
