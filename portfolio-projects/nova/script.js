/* NOVA — motor agêntico local
   Pipeline: entender → ler contexto → montar plano → pedir permissão → executar (reversível).
   Tudo roda no navegador: sem servidor, sem modelo externo. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORE = 'nova_workspace_v1';
  const CFG = 'nova_config_v1';
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  /* ================= util ================= */

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  function rotuloData(isoStr) {
    const d = fromIso(isoStr);
    const diff = Math.round((d - hoje()) / 86400000);
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    if (diff === -1) return 'ontem';
    if (diff < 0) return `atrasada · ${Math.abs(diff)}d`;
    if (diff < 7) return DIAS[d.getDay()];
    return `${d.getDate()} ${MESES[d.getMonth()]}`;
  }

  const money = (v) =>
    (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ================= estado ================= */

  function seed() {
    const h = hoje();
    return {
      tarefas: [
        { id: uid(), titulo: 'Fechar proposta do cliente novo', data: iso(addDias(h, -2)), prioridade: 'alta', feita: false },
        { id: uid(), titulo: 'Revisar o relatório do trimestre', data: iso(addDias(h, -1)), prioridade: 'media', feita: false },
        { id: uid(), titulo: 'Responder e-mails pendentes', data: iso(h), prioridade: 'media', feita: false },
        { id: uid(), titulo: 'Preparar apresentação de sexta', data: iso(addDias(h, 2)), prioridade: 'alta', feita: false },
        { id: uid(), titulo: 'Atualizar currículo', data: iso(addDias(h, 5)), prioridade: 'baixa', feita: false },
        { id: uid(), titulo: 'Pagar a conta de luz', data: iso(addDias(h, -3)), prioridade: 'alta', feita: true },
      ],
      agenda: [
        { id: uid(), titulo: 'Reunião de alinhamento', data: iso(addDias(h, 1)), hora: '10:00', dur: 60, foco: false },
        { id: uid(), titulo: 'Consulta médica', data: iso(addDias(h, 1)), hora: '15:30', dur: 60, foco: false },
        { id: uid(), titulo: 'Call com fornecedor', data: iso(addDias(h, 3)), hora: '14:00', dur: 30, foco: false },
      ],
      metas: [
        { id: uid(), titulo: 'Ler 12 livros no ano', alvo: 12, atual: 7, unidade: 'livros' },
        { id: uid(), titulo: 'Guardar R$ 6.000', alvo: 6000, atual: 2400, unidade: 'R$' },
      ],
      habitos: [
        { id: uid(), titulo: 'Beber 2L de água', dias: [1, 1, 1, 0, 1, 1, 0], hoje: false },
        { id: uid(), titulo: 'Exercício 30 min', dias: [1, 0, 1, 1, 0, 1, 0], hoje: false },
      ],
      financas: [
        { id: uid(), titulo: 'Salário', valor: 4200, tipo: 'entrada', data: iso(addDias(h, -8)) },
        { id: uid(), titulo: 'Mercado', valor: -520, tipo: 'saida', data: iso(addDias(h, -5)) },
        { id: uid(), titulo: 'Aluguel', valor: -1600, tipo: 'saida', data: iso(addDias(h, -4)) },
        { id: uid(), titulo: 'Freela de design', valor: 900, tipo: 'entrada', data: iso(addDias(h, -2)) },
      ],
      log: [],
    };
  }

  let state = load();
  let config = loadCfg();
  let undoStack = [];

  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage bloqueado: segue com o seed */ }
    return seed();
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function loadCfg() {
    try {
      const raw = localStorage.getItem(CFG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { nome: 'Luna', dono: '', modo: 'copiloto', criada: false };
  }
  function saveCfg() {
    try { localStorage.setItem(CFG, JSON.stringify(config)); } catch (e) {}
  }

  /* ================= extração de entidades ================= */

  function extrairData(txt) {
    const t = norm(txt);
    const h = hoje();

    if (/\bdepois de amanha\b/.test(t)) return { iso: iso(addDias(h, 2)), achou: 'depois de amanhã' };
    if (/\bamanha\b/.test(t)) return { iso: iso(addDias(h, 1)), achou: 'amanhã' };
    if (/\bhoje\b/.test(t)) return { iso: iso(h), achou: 'hoje' };
    if (/\b(semana que vem|proxima semana|semana seguinte)\b/.test(t)) return { iso: iso(addDias(h, 7)), achou: 'semana que vem' };

    const nomes = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    for (let i = 0; i < nomes.length; i++) {
      if (new RegExp(`\\b${nomes[i]}(\\-feira| feira)?\\b`).test(t)) {
        let delta = (i - h.getDay() + 7) % 7;
        if (delta === 0) delta = 7;
        return { iso: iso(addDias(h, delta)), achou: DIAS[i] };
      }
    }

    let m = t.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);
    if (m) {
      const d = new Date(h.getFullYear(), Number(m[2]) - 1, Number(m[1]));
      if (d < h) d.setFullYear(d.getFullYear() + 1);
      return { iso: iso(d), achou: m[0] };
    }
    m = t.match(/\bdia\s+(\d{1,2})\b/);
    if (m) {
      const d = new Date(h.getFullYear(), h.getMonth(), Number(m[1]));
      if (d < h) d.setMonth(d.getMonth() + 1);
      return { iso: iso(d), achou: m[0] };
    }
    if (/\bem (\d+) dias?\b/.test(t)) {
      const n = Number(t.match(/\bem (\d+) dias?\b/)[1]);
      return { iso: iso(addDias(h, n)), achou: `em ${n} dias` };
    }
    return null;
  }

  /* Hora e duração disputam o mesmo texto ("15h" é horário, "de 2h" é duração).
     Resolvo a duração primeiro, removo o trecho dela, e só então procuro o horário. */
  function extrairTempo(txt) {
    let t = norm(txt);
    let dur = null;

    const padroesDur = [
      /\b(?:de|por|durante)\s+(\d{1,2})\s*h\s*(\d{2})\b/,
      /\b(?:de|por|durante)\s+(\d{1,2})\s*(?:h|horas?)\b/,
      /\b(\d{1,3})\s*(?:min|minutos?)\b/,
      /\b(?:de|por|durante)\s+(uma|duas|tres)\s+horas?\b/,
    ];
    for (let i = 0; i < padroesDur.length; i++) {
      const m = t.match(padroesDur[i]);
      if (!m) continue;
      if (i === 0) dur = Number(m[1]) * 60 + Number(m[2]);
      else if (i === 1) dur = Number(m[1]) * 60;
      else if (i === 2) dur = Number(m[1]);
      else dur = { uma: 60, duas: 120, tres: 180 }[m[1]];
      t = t.replace(m[0], ' ');
      break;
    }

    let hora = null;
    let m = t.match(/\b(\d{1,2})\s*[:h]\s*(\d{2})\b/);
    if (m) hora = `${String(m[1]).padStart(2, '0')}:${m[2]}`;
    else if ((m = t.match(/\b(\d{1,2})\s*h\b/))) hora = `${String(m[1]).padStart(2, '0')}:00`;
    else if ((m = t.match(/\bas (\d{1,2})\b/))) hora = `${String(m[1]).padStart(2, '0')}:00`;
    else if (/\bmeio-?dia\b/.test(t)) hora = '12:00';
    else if (/\bde manha\b/.test(t)) hora = '09:00';
    else if (/\ba tarde\b|\bde tarde\b/.test(t)) hora = '14:00';
    else if (/\ba noite\b|\bde noite\b/.test(t)) hora = '19:00';

    return { hora, dur };
  }

  function extrairValor(txt) {
    const t = norm(txt);
    const m = t.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s*(?:reais|conto|pila)?/);
    if (!m) return null;
    if (!/r\$|reais|conto|pila|gast|paguei|receb|entrou|comprei|custou|invest/.test(t)) {
      if (!m[0].includes('r$')) return null;
    }
    const inteiro = Number(m[1].replace(/\./g, ''));
    const cents = m[2] ? Number(m[2].padEnd(2, '0')) / 100 : 0;
    return inteiro + cents;
  }

  function extrairPrioridade(txt) {
    const t = norm(txt);
    if (/\burgente\b|\bprioridade alta\b|\bimportante\b|\bpra ontem\b/.test(t)) return 'alta';
    if (/\bprioridade baixa\b|\bquando der\b|\bsem pressa\b/.test(t)) return 'baixa';
    return 'media';
  }

  /* limpa o texto para virar título: tira verbo de comando, datas e ruído */
  function tituloDe(txt, extras = []) {
    let s = txt.trim();
    const prefixos = [
      /^(por favor,?\s*)/i,
      /^(um |uma |o |a )/i,
      /^(nov[ao] )?(tarefa|task|lembrete|compromisso|evento|meta|habito|hábito)\s*(de|:|para|pra)?\s*/i,
      /^(adiciona|adicionar|adicione|cria|criar|crie|coloca|colocar|marca|marcar|agenda|agendar|anota|anotar|lembra|lembrar|preciso|quero|me lembre|bota|botar|registra|registrar|gastei|paguei|recebi|entrou|ganhei|comprei|custou|faturei)\s*/i,
    ];
    // várias passadas: "adiciona tarefa X" precisa perder o verbo E o substantivo
    for (let i = 0; i < 4; i++) {
      const antes = s;
      prefixos.forEach((r) => { s = s.replace(r, '').trim(); });
      if (s === antes) break;
    }
    s = s.replace(/\b(por favor|pfv|pls)\b/gi, '');
    extras.forEach((e) => { if (e) s = s.replace(new RegExp(e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ''); });

    // \b não funciona depois de letra acentuada ("amanhã," não casaria com /\bamanhã\b/),
    // então delimito com espaço/pontuação em vez de usar \b.
    const tira = (alternativas) =>
      new RegExp(`(^|[\\s,;])(?:${alternativas})(?=[\\s,;.!?]|$)`, 'gi');

    s = s
      .replace(/(?:r\$\s*)?\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+,\d{2}|r\$\s*\d+/gi, ' ')
      .replace(tira('hoje|amanh[aã]|depois de amanh[aã]|semana que vem|pr[oó]xima semana'), '$1')
      .replace(tira('(?:segunda|ter[çc]a|quarta|quinta|sexta|s[aá]bado|domingo)(?:-feira| feira)?'), '$1')
      .replace(tira('dia \\d{1,2}'), '$1')
      .replace(tira('\\d{1,2}\\s*\\/\\s*\\d{1,2}'), '$1')
      .replace(tira('\\d{1,2}\\s*[:h]\\s*\\d{2}'), '$1')
      .replace(tira('\\d{1,2}\\s*h'), '$1')
      .replace(tira('(?:as|às)\\s+\\d{1,2}'), '$1')
      .replace(tira('(?:de|à|a)\\s*(?:manh[aã]|tarde|noite)|meio-?\\s?dia'), '$1')
      .replace(tira('urgente|importante|prioridade (?:alta|baixa|m[eé]dia)|sem pressa|quando der'), '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s,;:.-]+|[\s,;:.-]+$/g, '')
      .trim()
      // preposição solta que sobrou na frente ("no mercado" → "mercado") ou no fim ("... pra")
      .replace(/^(de|do|da|para|pra|no|na|em|com|que|um|uma|o|a)\s+/i, '')
      .replace(/\s+(de|do|da|para|pra|no|na|em|com|e|a|o)$/i, '')
      .trim();
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* acha uma tarefa pelo texto (fuzzy por palavras em comum) */
  function acharTarefa(txt) {
    const alvo = norm(txt);
    const palavras = alvo.split(/\s+/).filter((w) => w.length > 3);
    let melhor = null, melhorScore = 0;
    state.tarefas.filter((t) => !t.feita).forEach((t) => {
      const tn = norm(t.titulo);
      let score = 0;
      palavras.forEach((w) => { if (tn.includes(w)) score += w.length; });
      if (tn.includes(alvo) && alvo.length > 4) score += 20;
      if (score > melhorScore) { melhorScore = score; melhor = t; }
    });
    return melhorScore >= 4 ? melhor : null;
  }

  function acharHabito(txt) {
    const alvo = norm(txt);
    let melhor = null, melhorScore = 0;
    state.habitos.forEach((hb) => {
      const palavras = norm(hb.titulo).split(/\s+/).filter((w) => w.length > 2 && !/^\d/.test(w));
      let score = 0;
      palavras.forEach((w) => { if (alvo.includes(w)) score += w.length; });
      if (score > melhorScore) { melhorScore = score; melhor = hb; }
    });
    return melhorScore >= 4 ? melhor : null;
  }

  /* ================= intenções ================= */

  const INTENTS = [
    { id: 'desfazer',      req: [/\bdesfaz|desfazer|volta atras|cancela a ultima\b/] },
    { id: 'ajuda',         req: [/\bajuda\b|\bo que voce (faz|sabe)\b|\bcomo funciona\b|\bo que da pra fazer\b|\bcomandos\b/] },
    { id: 'organizar_semana', req: [/\b(organiz|arrum|planej|ajeit|otimiz)\w*\b[^.]*\bsemana\b|\bsemana\b[^.]*\b(organiz|arrum|planej)\w*/] },
    { id: 'resumo_semana', req: [/\b(como (esta|ta)|resumo d[ao]|visao d[ao]|panorama)\b.*\bsemana\b/] },
    { id: 'resumo_dia',    req: [/\b(o que|oq).*(hoje|pra hoje|para hoje)\b|\bmeu dia\b|\bresumo do dia\b|\bagenda de hoje\b|\bcomo (esta|ta) meu dia\b/] },
    { id: 'resumo_financas', req: [/\b(financ|quanto (eu )?gast|meu saldo|saldo do mes|quanto sobrou|como (estao|tao) (minhas )?financ)/] },
    { id: 'registrar_gasto', req: [/\b(gastei|paguei|comprei|custou|saiu|torrei)\b/], needValor: true },
    { id: 'registrar_receita', req: [/\b(recebi|entrou|ganhei|caiu|faturei)\b/], needValor: true },
    { id: 'marcar_habito', req: [/\b(fiz|completei|cumpri|bati)\b.*\b(habito|meta diaria)\b|\bmarca(r)? (o )?habito\b/] },
    { id: 'criar_habito',  req: [/\b(habito|todo dia|todos os dias|diariamente|toda manha|toda noite)\b/] },
    { id: 'criar_meta',    req: [/\b(meta|objetivo)\b|\bquero (ler|economizar|guardar|juntar|correr|perder)\b/] },
    { id: 'concluir_tarefa', req: [/\b(conclui|concluir|terminei|finalizei|acabei|fiz|feito|pronto|marca como feit|risca)\b/] },
    { id: 'adiar_tarefa',  req: [/\b(adia|adiar|empurra|move|mover|remarca|passa)\b/] },
    { id: 'bloco_foco',    req: [/\b(bloco de foco|tempo de foco|foco|concentra)\b/] },
    { id: 'criar_evento',  req: [/\b(reuniao|consulta|call|compromisso|evento|encontro|almoco|jantar|entrevista|aula|treino|dentista|medico)\b/] },
    { id: 'criar_tarefa',  req: [/\b(tarefa|adiciona|adicionar|cria|criar|anota|anotar|lembra|lembrar|preciso|coloca|bota|nova tarefa)\b/] },
    { id: 'limpar_feitas', req: [/\blimpa(r)?\b.*\b(feitas|concluidas|prontas)\b|\bapaga(r)? (as )?concluidas\b/] },
  ];

  function entender(texto) {
    const t = norm(texto);
    const valor = extrairValor(texto);

    for (const it of INTENTS) {
      const bate = it.req.some((r) => r.test(t));
      if (!bate) continue;
      if (it.needValor && valor === null) continue;
      return { id: it.id, confianca: 0.9 };
    }
    if (valor !== null && /\bno |na |com |de /.test(t)) return { id: 'registrar_gasto', confianca: 0.55 };
    return { id: null, confianca: 0 };
  }

  /* ================= planejamento ================= */

  const abertas = () => state.tarefas.filter((t) => !t.feita);
  const atrasadas = () => abertas().filter((t) => fromIso(t.data) < hoje());
  const doDia = (isoStr) => abertas().filter((t) => t.data === isoStr);
  const eventosDe = (isoStr) => state.agenda.filter((e) => e.data === isoStr).sort((a, b) => a.hora.localeCompare(b.hora));

  function planejar(texto) {
    const { id, confianca } = entender(texto);
    const data = extrairData(texto);
    const { hora, dur } = extrairTempo(texto);
    const valor = extrairValor(texto);
    const h = hoje();

    switch (id) {
      case 'ajuda':
        return {
          fala: 'Eu leio o seu workspace e executo mudanças de verdade. Alguns exemplos do que entendo:',
          dicas: ['Organize minha semana', 'Adiciona tarefa revisar contrato pra sexta', 'Reunião com o time quarta 15h', 'Gastei 80 no mercado', 'Meta: guardar 6000', 'O que eu tenho pra hoje?'],
        };

      case 'desfazer':
        return { fala: undoStack.length ? 'Desfazendo a última execução.' : 'Não há nada para desfazer ainda.', acao: undoStack.length ? 'undo' : null };

      case 'resumo_dia': {
        const tar = doDia(iso(h));
        const atr = atrasadas();
        const evs = eventosDe(iso(h));
        const linhas = [];
        linhas.push(`${tar.length} tarefa${tar.length === 1 ? '' : 's'} para hoje`);
        if (atr.length) linhas.push(`${atr.length} atrasada${atr.length === 1 ? '' : 's'}`);
        linhas.push(`${evs.length} compromisso${evs.length === 1 ? '' : 's'}`);
        let fala = `Contexto de hoje: ${linhas.join(', ')}.`;
        if (evs.length) fala += ` O primeiro é ${evs[0].titulo} às ${evs[0].hora}.`;
        if (atr.length) fala += ` Quer que eu puxe as atrasadas para hoje?`;
        return { fala, dicas: atr.length ? ['Organize minha semana'] : [] };
      }

      case 'resumo_semana': {
        const fim = addDias(h, 7);
        const tar = abertas().filter((t) => fromIso(t.data) < fim);
        const evs = state.agenda.filter((e) => fromIso(e.data) >= h && fromIso(e.data) < fim);
        return {
          fala: `Nos próximos 7 dias: ${tar.length} tarefas abertas e ${evs.length} compromissos. ${atrasadas().length} tarefa(s) estão atrasadas.`,
          dicas: ['Organize minha semana'],
        };
      }

      case 'organizar_semana': {
        const atr = atrasadas();
        const ops = [];
        atr.slice(0, 4).forEach((t, i) => {
          const nova = iso(addDias(h, t.prioridade === 'alta' ? 0 : Math.min(i + 1, 3)));
          ops.push({
            tipo: 'task.move', id: t.id, data: nova, risco: 'medio',
            label: `Reagendar “${t.titulo}” para ${rotuloData(nova)}`,
          });
        });

        const temFoco = state.agenda.some((e) => e.foco && fromIso(e.data) >= h);
        if (!temFoco) {
          const alvo = iso(addDias(h, 1));
          ops.push({
            tipo: 'event.add', risco: 'baixo',
            payload: { titulo: 'Bloco de foco', data: alvo, hora: '08:30', dur: 90, foco: true },
            label: `Criar bloco de foco de 1h30 ${rotuloData(alvo)} às 08:30`,
          });
        }

        // não mexer de novo em quem o plano já reagendou acima
        const jaNoPlano = new Set(ops.filter((o) => o.id).map((o) => o.id));
        const prioritarias = abertas()
          .filter((t) => !jaNoPlano.has(t.id) && t.prioridade !== 'alta' && fromIso(t.data) <= addDias(h, 1))
          .slice(0, 1);
        prioritarias.forEach((t) => {
          const nova = iso(addDias(h, 4));
          ops.push({
            tipo: 'task.move', id: t.id, data: nova, risco: 'medio',
            label: `Adiar “${t.titulo}” para ${rotuloData(nova)} e abrir espaço`,
          });
        });

        if (!ops.length) return { fala: 'Sua semana já está organizada: nenhuma tarefa atrasada e você tem bloco de foco marcado.' };

        return {
          contexto: `${abertas().length} tarefas abertas · ${atr.length} atrasadas · ${state.agenda.length} eventos`,
          fala: 'Li sua semana e montei um plano para desafogar os atrasos e proteger um espaço de foco.',
          ops,
        };
      }

      case 'criar_tarefa': {
        const titulo = tituloDe(texto);
        if (!titulo) return { fala: 'Entendi que é uma tarefa, mas não peguei o nome dela. Pode repetir? Ex.: “adiciona tarefa revisar contrato pra sexta”.' };
        const quando = data ? data.iso : iso(h);
        const pri = extrairPrioridade(texto);
        return {
          contexto: `${abertas().length} tarefas abertas`,
          fala: `Vou criar essa tarefa para ${rotuloData(quando)}.`,
          ops: [{
            tipo: 'task.add', risco: 'baixo',
            payload: { titulo, data: quando, prioridade: pri, feita: false },
            label: `Criar tarefa “${titulo}” · ${rotuloData(quando)} · prioridade ${pri}`,
          }],
        };
      }

      case 'concluir_tarefa': {
        const alvo = acharTarefa(texto);
        if (!alvo) {
          // "marca beber água como feito" é hábito, não tarefa — tento por lá antes de desistir
          const hb = acharHabito(texto);
          if (hb) {
            if (hb.hoje) return { fala: `“${hb.titulo}” já está marcado como feito hoje.` };
            return {
              fala: `Isso é um hábito seu: “${hb.titulo}”.`,
              ops: [{ tipo: 'habit.check', id: hb.id, risco: 'baixo', label: `Marcar hábito “${hb.titulo}” como feito hoje` }],
            };
          }
          return {
            fala: 'Não achei essa tarefa entre as abertas. Qual delas você concluiu?',
            dicas: abertas().slice(0, 3).map((t) => `Concluí ${t.titulo.toLowerCase()}`),
          };
        }
        return {
          fala: `Encontrei: “${alvo.titulo}”.`,
          ops: [{ tipo: 'task.done', id: alvo.id, risco: 'baixo', label: `Marcar “${alvo.titulo}” como concluída` }],
        };
      }

      case 'adiar_tarefa': {
        const alvo = acharTarefa(texto);
        if (!alvo) {
          return {
            fala: 'Qual tarefa você quer mover? Me diz o nome dela.',
            dicas: abertas().slice(0, 3).map((t) => `Adia ${t.titulo.toLowerCase()} pra sexta`),
          };
        }
        const nova = data ? data.iso : iso(addDias(h, 1));
        return {
          fala: `Vou mover “${alvo.titulo}”.`,
          ops: [{ tipo: 'task.move', id: alvo.id, data: nova, risco: 'medio', label: `Mover “${alvo.titulo}” de ${rotuloData(alvo.data)} para ${rotuloData(nova)}` }],
        };
      }

      case 'criar_evento': {
        const titulo = tituloDe(texto) || 'Compromisso';
        const quando = data ? data.iso : iso(addDias(h, 1));
        const hr = hora || '10:00';
        const conflito = eventosDe(quando).find((e) => e.hora === hr);
        return {
          contexto: conflito ? `Conflito com “${conflito.titulo}” no mesmo horário` : `${eventosDe(quando).length} evento(s) nesse dia`,
          fala: conflito
            ? `Atenção: já existe “${conflito.titulo}” ${rotuloData(quando)} às ${hr}. Posso marcar mesmo assim.`
            : `Vou marcar isso ${rotuloData(quando)} às ${hr}.`,
          ops: [{
            tipo: 'event.add', risco: 'medio',
            payload: { titulo, data: quando, hora: hr, dur: dur || 60, foco: false },
            label: `Criar “${titulo}” · ${rotuloData(quando)} às ${hr} · ${dur || 60} min`,
          }],
        };
      }

      case 'bloco_foco': {
        const quando = data ? data.iso : iso(addDias(h, 1));
        const hr = hora || '08:30';
        const minutos = dur || 90;
        const titulo = tituloDe(texto) || 'Bloco de foco';
        return {
          fala: `Reservando ${minutos} minutos de foco ${rotuloData(quando)}.`,
          ops: [{
            tipo: 'event.add', risco: 'baixo',
            payload: { titulo: titulo.length > 3 ? titulo : 'Bloco de foco', data: quando, hora: hr, dur: minutos, foco: true },
            label: `Criar bloco de foco · ${rotuloData(quando)} às ${hr} · ${minutos} min`,
          }],
        };
      }

      case 'criar_meta': {
        const num = texto.match(/\b(\d{1,3}(?:\.\d{3})*|\d+)\b/);
        const alvo = num ? Number(num[1].replace(/\./g, '')) : 10;
        const titulo = tituloDe(texto.replace(/^meta:?\s*/i, ''), [num ? num[0] : '']) || 'Nova meta';
        const unidade = /r\$|reais|economiz|guard|junt/i.test(texto) ? 'R$' : '';
        return {
          fala: 'Vou criar essa meta e acompanhar o progresso dela.',
          ops: [{
            tipo: 'goal.add', risco: 'baixo',
            payload: { titulo, alvo, atual: 0, unidade },
            label: `Criar meta “${titulo}” · alvo ${unidade ? money(alvo) : alvo}`,
          }],
        };
      }

      case 'criar_habito': {
        const titulo = tituloDe(texto.replace(/\b(todo dia|todos os dias|diariamente|toda manha|toda manhã|toda noite|habito|hábito)\b/gi, '')) || 'Novo hábito';
        return {
          fala: 'Vou acompanhar esse hábito todo dia.',
          ops: [{
            tipo: 'habit.add', risco: 'baixo',
            payload: { titulo, dias: [0, 0, 0, 0, 0, 0, 0], hoje: false },
            label: `Criar hábito “${titulo}” com acompanhamento diário`,
          }],
        };
      }

      case 'marcar_habito': {
        const alvo = acharHabito(texto) || state.habitos.find((hb) => !hb.hoje);
        if (!alvo) return { fala: 'Todos os hábitos de hoje já estão marcados.' };
        if (alvo.hoje) return { fala: `“${alvo.titulo}” já está marcado como feito hoje.` };
        return {
          fala: `Marcando “${alvo.titulo}”.`,
          ops: [{ tipo: 'habit.check', id: alvo.id, risco: 'baixo', label: `Marcar hábito “${alvo.titulo}” como feito hoje` }],
        };
      }

      case 'registrar_gasto': {
        const titulo = tituloDe(texto, [String(valor)]) || 'Gasto';
        return {
          contexto: `Saldo atual ${money(saldo())}`,
          fala: `Registrando uma saída de ${money(valor)}.`,
          ops: [{
            tipo: 'fin.add', risco: 'baixo',
            payload: { titulo, valor: -Math.abs(valor), tipo: 'saida', data: data ? data.iso : iso(h) },
            label: `Registrar saída “${titulo}” · ${money(-Math.abs(valor))}`,
          }],
        };
      }

      case 'registrar_receita': {
        const titulo = tituloDe(texto, [String(valor)]) || 'Entrada';
        return {
          contexto: `Saldo atual ${money(saldo())}`,
          fala: `Registrando uma entrada de ${money(valor)}.`,
          ops: [{
            tipo: 'fin.add', risco: 'baixo',
            payload: { titulo, valor: Math.abs(valor), tipo: 'entrada', data: data ? data.iso : iso(h) },
            label: `Registrar entrada “${titulo}” · ${money(Math.abs(valor))}`,
          }],
        };
      }

      case 'resumo_financas': {
        const ent = state.financas.filter((f) => f.valor > 0).reduce((s, f) => s + f.valor, 0);
        const sai = state.financas.filter((f) => f.valor < 0).reduce((s, f) => s + f.valor, 0);
        const maior = state.financas.filter((f) => f.valor < 0).sort((a, b) => a.valor - b.valor)[0];
        let fala = `Entradas ${money(ent)}, saídas ${money(sai)}. Saldo de ${money(ent + sai)}.`;
        if (maior) fala += ` A maior saída foi “${maior.titulo}” (${money(maior.valor)}).`;
        return { fala };
      }

      case 'limpar_feitas': {
        const feitas = state.tarefas.filter((t) => t.feita);
        if (!feitas.length) return { fala: 'Não há tarefas concluídas para limpar.' };
        return {
          fala: `Encontrei ${feitas.length} tarefa(s) concluída(s).`,
          ops: [{ tipo: 'task.clear', risco: 'medio', label: `Remover ${feitas.length} tarefa(s) concluída(s) da lista` }],
        };
      }

      default:
        return {
          fala: confianca > 0
            ? 'Entendi mais ou menos, mas prefiro confirmar a ter certeza errada. Pode reformular?'
            : 'Ainda não sei fazer isso. Posso cuidar de tarefas, agenda, metas, hábitos e finanças — tenta um destes:',
          dicas: ['Organize minha semana', 'O que eu tenho pra hoje?', 'Gastei 80 no mercado', 'Reunião com o time quarta 15h'],
        };
    }
  }

  const saldo = () => state.financas.reduce((s, f) => s + f.valor, 0);

  /* ================= execução ================= */

  function executar(ops) {
    undoStack.push(clone(state));
    if (undoStack.length > 20) undoStack.shift();
    const tocados = [];

    ops.forEach((op) => {
      switch (op.tipo) {
        case 'task.add': {
          const t = { id: uid(), ...op.payload };
          state.tarefas.unshift(t); tocados.push(t.id); break;
        }
        case 'task.done': {
          const t = state.tarefas.find((x) => x.id === op.id);
          if (t) { t.feita = true; tocados.push(t.id); } break;
        }
        case 'task.move': {
          const t = state.tarefas.find((x) => x.id === op.id);
          if (t) { t.data = op.data; tocados.push(t.id); } break;
        }
        case 'task.clear':
          state.tarefas = state.tarefas.filter((t) => !t.feita); break;
        case 'event.add': {
          const e = { id: uid(), ...op.payload };
          state.agenda.push(e);
          state.agenda.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
          tocados.push(e.id); break;
        }
        case 'goal.add': {
          const g = { id: uid(), ...op.payload };
          state.metas.push(g); tocados.push(g.id); break;
        }
        case 'habit.add': {
          const hb = { id: uid(), ...op.payload };
          state.habitos.push(hb); tocados.push(hb.id); break;
        }
        case 'habit.check': {
          const hb = state.habitos.find((x) => x.id === op.id);
          if (hb) { hb.hoje = true; hb.dias = hb.dias.slice(1).concat(1); tocados.push(hb.id); } break;
        }
        case 'fin.add': {
          const f = { id: uid(), ...op.payload };
          state.financas.unshift(f); tocados.push(f.id); break;
        }
      }
    });

    state.log.unshift({
      t: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      texto: ops.map((o) => o.label).join(' · '),
      n: ops.length,
    });
    if (state.log.length > 60) state.log.pop();

    save();
    renderTudo(tocados);
    $('#btn-undo').disabled = false;
  }

  function desfazer() {
    if (!undoStack.length) return false;
    state = undoStack.pop();
    save();
    renderTudo();
    $('#btn-undo').disabled = !undoStack.length;
    return true;
  }

  /* ================= chat ================= */

  const chat = $('#chat');

  function bolha(tipo, html) {
    const wrap = document.createElement('div');
    wrap.className = `msg msg-${tipo}`;
    wrap.innerHTML = `<div class="msg-text">${html}</div>`;
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
    return wrap;
  }

  function pensando() {
    const el = document.createElement('div');
    el.className = 'msg msg-ai';
    el.innerHTML = '<div class="msg-text thinking"><span></span><span></span><span></span></div>';
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function renderPlano(wrap, plano, ms) {
    const auto = config.modo === 'autonomo' && plano.ops.every((o) => o.risco === 'baixo');
    const box = document.createElement('div');
    box.className = 'plan';
    box.innerHTML = `
      <div class="plan-head">
        <svg viewBox="0 0 24 24" fill="none" style="width:13px;height:13px" aria-hidden="true"><path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Plano · ${plano.ops.length} operação${plano.ops.length === 1 ? '' : 'ões'} · ${ms}ms
      </div>
      <ul class="plan-ops">
        ${plano.ops.map((o) => `
          <li class="plan-op">
            <span class="plan-op-dot"></span>
            <span>${esc(o.label)}</span>
            <span class="plan-op-risk risk-${o.risco}">${o.risco}</span>
          </li>`).join('')}
      </ul>
      <div class="plan-actions"></div>`;
    wrap.appendChild(box);

    const acoes = $('.plan-actions', box);

    if (auto) {
      executar(plano.ops);
      box.classList.add('is-done');
      $('.plan-head', box).innerHTML = `✓ Executado automaticamente · risco baixo · ${ms}ms`;
      acoes.innerHTML = '<button class="btn btn-quiet btn-sm" type="button" data-undo>Desfazer</button>';
      $('[data-undo]', acoes).addEventListener('click', () => {
        if (desfazer()) { toast('Desfeito'); box.classList.remove('is-done'); box.classList.add('is-refused'); $('.plan-head', box).textContent = 'Execução desfeita'; acoes.innerHTML = ''; }
      });
      toast('Executado automaticamente');
    } else {
      const aprovar = document.createElement('button');
      aprovar.className = 'btn btn-primary btn-sm';
      aprovar.type = 'button';
      aprovar.textContent = 'Aprovar e executar';
      const recusar = document.createElement('button');
      recusar.className = 'btn btn-quiet btn-sm';
      recusar.type = 'button';
      recusar.textContent = 'Agora não';
      acoes.append(aprovar, recusar);

      aprovar.addEventListener('click', () => {
        executar(plano.ops);
        box.classList.add('is-done');
        $('.plan-head', box).innerHTML = `✓ Executado · ${plano.ops.length} operação${plano.ops.length === 1 ? '' : 'ões'} · reversível`;
        acoes.innerHTML = '<button class="btn btn-quiet btn-sm" type="button" data-undo>Desfazer</button>';
        $('[data-undo]', acoes).addEventListener('click', () => {
          if (desfazer()) { toast('Desfeito'); box.classList.add('is-refused'); box.classList.remove('is-done'); $('.plan-head', box).textContent = 'Execução desfeita'; acoes.innerHTML = ''; }
        });
        toast('Plano executado');
      });

      recusar.addEventListener('click', () => {
        box.classList.add('is-refused');
        $('.plan-head', box).textContent = 'Plano recusado — nada foi alterado';
        acoes.innerHTML = '';
      });
    }
    chat.scrollTop = chat.scrollHeight;
  }

  function responder(texto) {
    bolha('user', esc(texto));
    const t0 = performance.now();
    const plano = planejar(texto);
    const carregando = pensando();

    setTimeout(() => {
      const ms = Math.max(1, Math.round(performance.now() - t0));
      carregando.remove();

      const wrap = document.createElement('div');
      wrap.className = 'msg msg-ai';
      const partes = [];
      if (plano.contexto) partes.push(`<div class="msg-text" style="font-family:var(--mono);font-size:.76rem;color:var(--dim)">contexto · ${esc(plano.contexto)}</div>`);
      partes.push(`<div class="msg-text">${esc(plano.fala)}</div>`);
      wrap.innerHTML = partes.join('');
      chat.appendChild(wrap);

      if (plano.acao === 'undo') {
        if (desfazer()) toast('Desfeito');
      }
      if (plano.ops && plano.ops.length) renderPlano(wrap, plano, ms);
      if (plano.dicas && plano.dicas.length) renderDicas(plano.dicas);

      $('#proof-latency').textContent = ms + 'ms';
      $('#agent-status').textContent = `Última resposta em ${ms}ms · ${abertas().length} tarefas abertas`;
      chat.scrollTop = chat.scrollHeight;
    }, reduceMotion ? 0 : 110);
  }

  function renderDicas(lista) {
    const box = $('#suggestions');
    box.innerHTML = '';
    lista.forEach((d) => {
      const b = document.createElement('button');
      b.className = 'chip-btn';
      b.type = 'button';
      b.textContent = d;
      b.addEventListener('click', () => { $('#input').value = d; $('#composer').requestSubmit(); });
      box.appendChild(b);
    });
  }

  /* ================= render do estado ================= */

  function icone() {
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function renderTarefas(tocados = []) {
    const ul = $('#list-tarefas');
    const ordem = [...state.tarefas].sort((a, b) => (a.feita - b.feita) || a.data.localeCompare(b.data));
    if (!ordem.length) { ul.innerHTML = '<li class="empty">Nenhuma tarefa. Peça para a sua IA criar uma.</li>'; return; }
    ul.innerHTML = ordem.map((t) => `
      <li class="item ${t.feita ? 'is-done' : ''} ${tocados.includes(t.id) ? 'just-changed' : ''}" data-id="${t.id}">
        <button class="item-check" type="button" data-toggle="${t.id}" aria-label="${t.feita ? 'Reabrir' : 'Concluir'} tarefa">${icone()}</button>
        <div class="item-main">
          <span class="item-title">${esc(t.titulo)}</span>
          <span class="item-meta">
            <span>${rotuloData(t.data)}</span>
            <span class="tag tag-${t.prioridade}">${t.prioridade}</span>
          </span>
        </div>
        <button class="item-x" type="button" data-del-tarefa="${t.id}" aria-label="Remover tarefa">×</button>
      </li>`).join('');
  }

  function renderAgenda(tocados = []) {
    const ul = $('#list-agenda');
    const futuros = [...state.agenda].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
    if (!futuros.length) { ul.innerHTML = '<li class="empty">Agenda vazia.</li>'; return; }
    ul.innerHTML = futuros.map((e) => `
      <li class="item ${tocados.includes(e.id) ? 'just-changed' : ''}">
        <div class="item-main">
          <span class="item-title">${esc(e.titulo)}</span>
          <span class="item-meta">
            <span>${rotuloData(e.data)} · ${e.hora}</span>
            <span>${e.dur} min</span>
            ${e.foco ? '<span class="tag tag-foco">foco</span>' : ''}
          </span>
        </div>
        <button class="item-x" type="button" data-del-evento="${e.id}" aria-label="Remover evento">×</button>
      </li>`).join('');
  }

  function renderMetas(tocados = []) {
    const ul = $('#list-metas');
    if (!state.metas.length) { ul.innerHTML = '<li class="empty">Nenhuma meta ativa.</li>'; return; }
    ul.innerHTML = state.metas.map((m) => {
      const pct = Math.min(100, Math.round((m.atual / m.alvo) * 100));
      const fmt = (v) => (m.unidade === 'R$' ? money(v) : `${v}${m.unidade ? ' ' + m.unidade : ''}`);
      return `
      <li class="item ${tocados.includes(m.id) ? 'just-changed' : ''}" style="flex-direction:column;align-items:stretch;gap:6px">
        <div style="display:flex;gap:10px;align-items:baseline">
          <span class="item-title" style="flex:1">${esc(m.titulo)}</span>
          <span class="item-meta">${pct}%</span>
          <button class="item-x" type="button" data-del-meta="${m.id}" aria-label="Remover meta">×</button>
        </div>
        <span class="item-meta">${fmt(m.atual)} de ${fmt(m.alvo)}</span>
        <div class="bar"><span class="bar-fill" style="width:${pct}%"></span></div>
      </li>`;
    }).join('');
  }

  function renderHabitos(tocados = []) {
    const ul = $('#list-habitos');
    if (!state.habitos.length) { ul.innerHTML = '<li class="empty">Nenhum hábito em acompanhamento.</li>'; return; }
    ul.innerHTML = state.habitos.map((hb) => `
      <li class="item ${tocados.includes(hb.id) ? 'just-changed' : ''}">
        <button class="item-check ${hb.hoje ? '' : ''}" type="button" data-habito="${hb.id}" aria-label="Marcar hábito"
          style="${hb.hoje ? 'background:var(--mint);border-color:var(--mint);color:#06281c' : ''}">${icone()}</button>
        <div class="item-main">
          <span class="item-title">${esc(hb.titulo)}</span>
          <span class="item-meta">
            <span class="streak">${hb.dias.map((d) => `<i class="${d ? 'on' : ''}"></i>`).join('')}</span>
            <span>${hb.dias.filter(Boolean).length}/7 dias</span>
          </span>
        </div>
        <button class="item-x" type="button" data-del-habito="${hb.id}" aria-label="Remover hábito">×</button>
      </li>`).join('');
  }

  function renderFinancas(tocados = []) {
    const ent = state.financas.filter((f) => f.valor > 0).reduce((s, f) => s + f.valor, 0);
    const sai = state.financas.filter((f) => f.valor < 0).reduce((s, f) => s + f.valor, 0);
    $('#fin-summary').innerHTML = `
      <div class="fin-box fin-in"><span>Entradas</span><strong>${money(ent)}</strong></div>
      <div class="fin-box fin-out"><span>Saídas</span><strong>${money(sai)}</strong></div>
      <div class="fin-box"><span>Saldo</span><strong>${money(ent + sai)}</strong></div>`;

    const ul = $('#list-financas');
    if (!state.financas.length) { ul.innerHTML = '<li class="empty">Nenhum lançamento.</li>'; return; }
    ul.innerHTML = state.financas.map((f) => `
      <li class="item ${tocados.includes(f.id) ? 'just-changed' : ''}">
        <div class="item-main">
          <span class="item-title">${esc(f.titulo)}</span>
          <span class="item-meta">${rotuloData(f.data)}</span>
        </div>
        <strong style="font-size:.86rem;font-variant-numeric:tabular-nums;color:${f.valor > 0 ? 'var(--mint)' : 'var(--rose)'}">${money(f.valor)}</strong>
        <button class="item-x" type="button" data-del-fin="${f.id}" aria-label="Remover lançamento">×</button>
      </li>`).join('');
  }

  function renderContadores() {
    const set = (k, v) => { const el = $(`[data-count="${k}"]`); if (el) el.textContent = v; };
    set('tarefas', abertas().length);
    set('agenda', state.agenda.length);
    set('metas', state.metas.length);
    set('habitos', state.habitos.length);
    set('financas', money(saldo()));
  }

  function renderLog() {
    const html = state.log.length
      ? state.log.map((l) => `<li class="audit-item"><span class="audit-time">${l.t}</span><span class="audit-text">${esc(l.texto)}</span></li>`).join('')
      : '<li class="audit-item"><span class="audit-text" style="color:var(--dim)">Nenhuma ação ainda. Dê um comando para a sua IA.</span></li>';
    $('#audit-list').innerHTML = html;
    $('#log-list').innerHTML = html;
  }

  function renderTudo(tocados = []) {
    renderTarefas(tocados);
    renderAgenda(tocados);
    renderMetas(tocados);
    renderHabitos(tocados);
    renderFinancas(tocados);
    renderContadores();
    renderLog();
  }

  /* ================= toast ================= */

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-on');
      setTimeout(() => { el.hidden = true; }, 300);
    }, 2200);
  }

  /* ================= identidade ================= */

  function aplicarConfig() {
    const papel = config.dono ? `Assistente de ${config.dono}` : 'Sua assistente';
    const modoLabel = config.modo === 'autonomo' ? 'autônomo' : 'copiloto';
    $('#agent-name').textContent = config.nome;
    $('#demo-name').textContent = config.nome;
    $('#demo-role').textContent = `${papel} · modo ${modoLabel}`;
    $$('.mode-opt').forEach((b) => {
      const on = b.dataset.mode === config.modo;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    });
    $('#mode-hint').textContent = config.modo === 'copiloto'
      ? 'Pede permissão para tudo'
      : 'Age sozinha no que é de risco baixo';
  }

  /* ================= demo do hero ================= */

  const DEMOS = {
    'Organize minha semana': [
      { t: 'Contexto identificado', s: () => `${abertas().length} tarefas abertas · ${atrasadas().length} atrasadas`, ok: true },
      { t: 'Plano criado', s: () => 'Reagendar tarefas atrasadas, criar 1 bloco de foco', ok: true },
      { t: 'Aguardando permissão', s: () => 'Alterar 3 itens da sua semana', ok: false },
      { t: 'Executado', s: () => 'Alterações aplicadas · reversível', ok: true, muted: true },
    ],
    'Como estão minhas finanças?': [
      { t: 'Contexto identificado', s: () => `${state.financas.length} lançamentos no período`, ok: true },
      { t: 'Cálculo pronto', s: () => `Saldo de ${money(saldo())}`, ok: true },
      { t: 'Somente leitura', s: () => 'Nenhuma alteração necessária', ok: true, muted: true },
    ],
    'O que eu tenho pra hoje?': [
      { t: 'Contexto identificado', s: () => `${doDia(iso(hoje())).length} tarefas · ${eventosDe(iso(hoje())).length} compromissos`, ok: true },
      { t: 'Prioridade definida', s: () => 'Tarefas de alta prioridade primeiro', ok: true },
      { t: 'Somente leitura', s: () => 'Nenhuma alteração necessária', ok: true, muted: true },
    ],
  };

  let demoTimers = [];
  function rodarDemo(chave) {
    demoTimers.forEach(clearTimeout);
    demoTimers = [];
    $('#demo-request').textContent = chave;
    const trace = $('#demo-trace');
    trace.innerHTML = '';
    const passos = DEMOS[chave] || DEMOS['Organize minha semana'];
    passos.forEach((p, i) => {
      demoTimers.push(setTimeout(() => {
        const el = document.createElement('div');
        el.className = `trace-step ${p.ok ? '' : 'is-pending'} ${p.muted ? 'is-muted' : ''}`;
        el.innerHTML = `
          <span class="trace-icon">${p.ok ? '✓' : '–'}</span>
          <span class="trace-text"><strong>${p.t}</strong><span>${p.s()}</span></span>`;
        trace.appendChild(el);
      }, reduceMotion ? 0 : i * 420));
    });
  }

  /* ================= wiring ================= */

  function init() {
    aplicarConfig();
    renderTudo();
    rodarDemo('Organize minha semana');
    renderDicas(['Organize minha semana', 'O que eu tenho pra hoje?', 'Gastei 80 no mercado']);

    bolha('ai', `Oi${config.dono ? ', ' + esc(config.dono) : ''}! Eu sou a ${esc(config.nome)}. Já li seu workspace: <strong>${abertas().length} tarefas abertas</strong>, ${atrasadas().length} atrasada(s) e ${state.agenda.length} compromissos. O que você quer resolver primeiro?`);

    $('#btn-undo').disabled = true;

    // composer
    $('#composer').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#input').value.trim();
      if (!v) return;
      $('#input').value = '';
      $('#suggestions').innerHTML = '';
      responder(v);
    });

    // demo chips
    $$('[data-demo]').forEach((b) => b.addEventListener('click', () => rodarDemo(b.dataset.demo)));

    // modo
    $$('.mode-opt').forEach((b) => b.addEventListener('click', () => {
      config.modo = b.dataset.mode;
      saveCfg(); aplicarConfig();
      toast(config.modo === 'autonomo' ? 'Modo autônomo: ações de risco baixo sem perguntar' : 'Modo copiloto: pede permissão para tudo');
    }));

    // abas
    $$('.state-tab').forEach((b) => b.addEventListener('click', () => {
      $$('.state-tab').forEach((x) => { x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
      $$('.state-panel').forEach((p) => p.classList.toggle('is-on', p.dataset.panel === b.dataset.tab));
    }));

    // cards de domínio levam para a aba
    $$('[data-domain]').forEach((c) => c.addEventListener('click', () => {
      const alvo = $(`.state-tab[data-tab="${c.dataset.domain}"]`);
      if (alvo) alvo.click();
      $('#workspace').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }));

    // interações nas listas
    $('.state-body').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const acoes = {
        toggle: (id) => { const t = state.tarefas.find((x) => x.id === id); if (t) t.feita = !t.feita; },
        delTarefa: (id) => { state.tarefas = state.tarefas.filter((x) => x.id !== id); },
        delEvento: (id) => { state.agenda = state.agenda.filter((x) => x.id !== id); },
        delMeta: (id) => { state.metas = state.metas.filter((x) => x.id !== id); },
        delHabito: (id) => { state.habitos = state.habitos.filter((x) => x.id !== id); },
        delFin: (id) => { state.financas = state.financas.filter((x) => x.id !== id); },
        habito: (id) => { const hb = state.habitos.find((x) => x.id === id); if (hb && !hb.hoje) { hb.hoje = true; hb.dias = hb.dias.slice(1).concat(1); } },
      };
      const mapa = [
        ['toggle', btn.dataset.toggle], ['delTarefa', btn.dataset.delTarefa], ['delEvento', btn.dataset.delEvento],
        ['delMeta', btn.dataset.delMeta], ['delHabito', btn.dataset.delHabito], ['delFin', btn.dataset.delFin],
        ['habito', btn.dataset.habito],
      ];
      for (const [k, id] of mapa) {
        if (id) {
          undoStack.push(clone(state));
          acoes[k](id);
          save(); renderTudo(); $('#btn-undo').disabled = false;
          return;
        }
      }
    });

    // rodapé do estado
    $('#btn-undo').addEventListener('click', () => { if (desfazer()) toast('Desfeito'); });
    $('#btn-log').addEventListener('click', () => abrir('#modal-log'));
    $('#btn-reset').addEventListener('click', () => {
      undoStack.push(clone(state));
      state = seed(); save(); renderTudo();
      chat.innerHTML = '';
      bolha('ai', `Workspace reiniciado. Sou a ${esc(config.nome)} — me diz o que precisa.`);
      $('#btn-undo').disabled = false;
      toast('Demo reiniciada');
    });

    // modal config
    const abrirConfig = () => {
      $('#cfg-name').value = config.nome;
      $('#cfg-owner').value = config.dono;
      const r = document.querySelector(`input[name="cfg-mode"][value="${config.modo}"]`);
      if (r) r.checked = true;
      abrir('#modal-config');
      setTimeout(() => $('#cfg-name').focus(), 60);
    };
    ['#cta-criar', '#hero-criar', '#cta-final', '#btn-config'].forEach((s) => {
      const el = $(s); if (el) el.addEventListener('click', abrirConfig);
    });

    $('#form-config').addEventListener('submit', (e) => {
      e.preventDefault();
      config.nome = ($('#cfg-name').value.trim() || 'Luna').slice(0, 18);
      config.dono = $('#cfg-owner').value.trim().slice(0, 18);
      config.modo = document.querySelector('input[name="cfg-mode"]:checked').value;
      config.criada = true;
      saveCfg(); aplicarConfig(); fechar('#modal-config');
      chat.innerHTML = '';
      bolha('ai', `Prontinho${config.dono ? ', ' + esc(config.dono) : ''}. Sou a <strong>${esc(config.nome)}</strong>, no modo ${config.modo === 'autonomo' ? 'autônomo' : 'copiloto'}. Já estou de olho em ${abertas().length} tarefas abertas — manda o primeiro comando.`);
      renderDicas(['Organize minha semana', 'O que eu tenho pra hoje?']);
      toast(`${config.nome} está pronta`);
      $('#workspace').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    // modais
    $$('[data-close]').forEach((b) => b.addEventListener('click', () => {
      const m = b.closest('.modal'); if (m) fechar('#' + m.id);
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') $$('.modal:not([hidden])').forEach((m) => fechar('#' + m.id));
    });

    // scroll suave dos botões
    $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
      const alvo = $(b.dataset.scroll);
      if (alvo) alvo.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }));

    // nav
    const navToggle = $('#nav-toggle'), navLinks = $('#nav-links');
    navToggle.addEventListener('click', () => {
      const aberto = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', aberto);
      navToggle.setAttribute('aria-expanded', String(aberto));
    });
    $$('#nav-links a').forEach((a) => a.addEventListener('click', () => {
      navLinks.classList.remove('open'); navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));

    let scrollAgendado = false;
    window.addEventListener('scroll', () => {
      if (scrollAgendado) return;
      scrollAgendado = true;
      setTimeout(() => {
        $('#site-header').classList.toggle('scrolled', window.scrollY > 16);
        scrollAgendado = false;
      }, 60);
    });

    // reveal
    const alvos = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('is-visible'));
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.style.transitionDelay = `${(Number(en.target.dataset.delay) || 0) * 90}ms`;
          en.target.classList.add('is-visible');
          obs.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
      alvos.forEach((el) => obs.observe(el));
    }
  }

  function abrir(sel) { const m = $(sel); if (m) { m.hidden = false; document.body.style.overflow = 'hidden'; } }
  function fechar(sel) { const m = $(sel); if (m) { m.hidden = true; document.body.style.overflow = ''; } }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
