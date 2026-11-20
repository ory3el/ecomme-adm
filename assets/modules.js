(() => {
const A = window.Admin, { sb, h, $ } = A;
const IC = { dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z', stores: 'M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6', products: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  flag: 'M5 21V4M5 4h12l-2 4 2 4H5', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  orders: 'M6 2L3 6v14h18V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0', wallet: 'M3 7h18v13H3zM3 7l2-3h14l2 3M16 13h2', tag: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01', chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  team: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', card: 'M2 5h20v14H2zM2 10h20' };
A.icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n] || IC.list}"/></svg>`;
A.navItem = i => { const a = h('a', { href: '#' + i[0], id: 'n-' + i[0], title: i[1], innerHTML: A.icon(i[3]) + '<span></span>' }); a.lastChild.textContent = i[1]; return a; };
const brl = v => v == null ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dt = v => v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const ST = { pending: 'Pendente', under_review: 'Em análise', resolved: 'Procedente', dismissed: 'Improcedente', active: 'Ativo', paused: 'Pausado', requested: 'Solicitado', processing: 'Em processamento', paid: 'Pago', rejected: 'Rejeitado',
  in_review: 'Em análise', implemented: 'Implementado', declined: 'Recusado', accepted: 'Aceita', countered: 'Contraproposta', counter_accepted: 'Contraproposta aceita', counter_rejected: 'Contraproposta recusada',
  awaiting_payment: 'Aguardando pagamento', transit: 'Em trânsito', delivered: 'Entregue', returned: 'Devolução', cancelled: 'Cancelado', canceled: 'Cancelada', expired: 'Expirada', failed: 'Falhou', past_due: 'Em atraso' };
const RS = { counterfeit: 'Falsificado', prohibited: 'Proibido', misleading: 'Enganoso', intellectual_property: 'Propriedade intelectual', inappropriate: 'Impróprio', wrong_category: 'Categoria errada', other: 'Outro',
  spam: 'Spam', offensive: 'Ofensivo', false_information: 'Informação falsa', irrelevant: 'Irrelevante', fake_review: 'Avaliação falsa' };
const E = { reason_required: 'Informe o motivo (mín. 5 caracteres).', no_stock: 'Produto sem estoque não pode ser reativado.', already_paused: 'Produto já está pausado.', cannot_target_operator: 'Não é possível agir sobre operadores.',
  invalid_transition: 'Transição de status não permitida.', invalid_url: 'Link inválido (use um caminho interno, ex.: /pedidos).', invalid_message: 'Título e mensagem são obrigatórios.', invalid_name: 'Nome inválido.', cannot_edit_self: 'Você não pode alterar a si mesmo.' };
const err = e => E[e?.message] || A.errMsg(e);
const badge = s => h('span', { className: 'badge b-' + s, textContent: ST[s] || s || '—' });
const rsn = v => String(v || '').split(', ').map(x => RS[x] || x).join(', ');
A.toast = (m, bad) => { const t = h('div', { className: 'toast' + (bad ? ' bad' : ''), textContent: m }); document.body.append(t); setTimeout(() => t.remove(), 3500); };
const cell = v => v instanceof Node ? v : document.createTextNode(v == null || v === '' ? '—' : v);

async function detail(m, r, reload) {
  const d = $('#dlg'), acts = h('div', { className: 'bar' }), hist = h('div', { className: 'hist' });
  const dl = h('dl', {}, ...m.fields(r).flatMap(([k, v]) => [h('dt', { textContent: k }), h('dd', {}, cell(v))]));
  const close = h('button', { className: 'ghost', textContent: 'Fechar', onclick: () => d.close() });
  const menu = () => acts.replaceChildren(...(m.actions || []).filter(a => A.can(a.perm) && (!a.show || a.show(r))).map(a =>
    h('button', { className: 'btn' + (a.bad ? ' bad' : ''), textContent: a.label, onclick: () => step(a) })), close);
  const step = a => {
    const rk = 'reasonKey' in a ? a.reasonKey : 'p_reason';
    const ins = (a.inputs || []).map(i => [i, h(i.multi ? 'textarea' : 'input', { value: i.get ? i.get(r) ?? '' : '', placeholder: i.label, rows: 3 })]);
    const why = h('textarea', { rows: 2, placeholder: 'Motivo / justificativa (mín. 5 caracteres)' }), msg = h('p', { className: 'err' });
    const go = h('button', { className: 'btn' + (a.bad ? ' bad' : ''), textContent: 'Confirmar: ' + a.label, onclick: async () => {
      go.disabled = true;
      const args = Object.assign({}, a.args(r), ...ins.map(([i, e]) => ({ [i.k]: e.value })), rk ? { [rk]: why.value } : {});
      const { data, error } = await sb.rpc(a.rpc, args);
      if (error) { go.disabled = false; return msg.textContent = err(error); }
      if (a.display) { dl.append(...Object.entries(data || {}).flatMap(([k, v]) => [h('dt', { textContent: k }), h('dd', { textContent: String(v) })])); return menu(); }
      d.close(); A.toast('Ação concluída.'); reload();
    } });
    acts.replaceChildren(h('p', { className: 'muted', textContent: `Confirmar a ação “${a.label}”?` }), ...ins.flatMap(([i, e]) => [h('label', { className: 'muted', textContent: i.label }), e]),
      ...(rk ? [why] : []), msg, h('div', { className: 'bar' }, go, h('button', { className: 'ghost', textContent: 'Voltar', onclick: menu })));
  };
  d.replaceChildren(h('h2', { textContent: m.name(r) }), dl, ...(m.hist ? [hist] : []), acts); menu(); d.showModal();
  if (m.hist) { const { data } = await sb.rpc('admin_history', { p_entity: m.hist, p_id: String(r.id) });
    hist.replaceChildren(h('b', { textContent: 'Histórico de ações' }), ...(data?.length ? data.map(x => h('div', { textContent: `${dt(x.created_at)} · ${x.operator_email} · ${x.action}${x.reason ? ' — ' + x.reason : ''}` })) : [h('div', { className: 'muted', textContent: 'Sem ações registradas.' })])); }
}

function listModule(m) {
  A.mods.push(m);
  A.routes[m.id] = () => {
    const PAGE = 20, q = new URLSearchParams(location.hash.split('?')[1] || ''); let page = 0, t;
    const sel = h('select', {}, h('option', { value: '', textContent: 'Todos os status' }), ...(m.statuses || []).map(s => h('option', { value: s, textContent: ST[s] || s })));
    sel.value = q.get('s') || '';
    const inp = h('input', { placeholder: 'Pesquisar…' }), rl = h('button', { className: 'ghost', textContent: '↻ Atualizar' }), box = h('div', { className: 'tbl' }), pg = h('div', { className: 'bar' });
    $('#view').replaceChildren(h('h1', { textContent: m.title }), h('div', { className: 'bar' }, ...(m.statuses ? [sel] : []), inp, rl), box, pg);
    const load = async () => {
      box.replaceChildren(h('div', { className: 'skel' }), h('div', { className: 'skel' }));
      const { data, error } = await sb.rpc('admin_list', { p_kind: m.kind, p_status: sel.value || null, p_search: inp.value, p_limit: PAGE, p_offset: page * PAGE });
      pg.replaceChildren();
      if (error) return box.replaceChildren(h('p', { className: 'err', textContent: err(error) }));
      if (!data.rows.length) return box.replaceChildren(h('p', { className: 'muted', style: 'padding:16px', textContent: 'Nenhum registro encontrado.' }));
      box.replaceChildren(h('table', {}, h('tr', {}, ...m.cols.map(c => h('th', { textContent: c[1] }))), ...data.rows.map(r => {
        const tr = h('tr', { className: 'row' }, ...m.cols.map(c => h('td', {}, cell(c[2] ? c[2](r[c[0]], r) : r[c[0]])))); tr.onclick = () => detail(m, r, load); return tr; })));
      const pages = Math.max(1, Math.ceil(data.total / PAGE));
      pg.append(h('button', { className: 'ghost', textContent: '‹ Anterior', disabled: page === 0, onclick: () => { page--; load(); } }), h('span', { className: 'muted', textContent: `Página ${page + 1} de ${pages} · ${data.total} registros` }),
        h('button', { className: 'ghost', textContent: 'Próxima ›', disabled: page + 1 >= pages, onclick: () => { page++; load(); } }));
    };
    sel.onchange = () => { page = 0; load(); }; inp.oninput = () => { clearTimeout(t); t = setTimeout(() => { page = 0; load(); }, 350); }; rl.onclick = load; load();
  };
}
const st = (label, s, extra = {}) => ({ label, rpc: 'admin_report_action', perm: 'reports.resolve', args: r => ({ p_id: r.id, p_status: s, ...extra }), show: r => ['pending', 'under_review'].includes(r.status) && (s !== 'under_review' || r.status === 'pending'), ...extra.o });
const stat = r => badge(r.status);
const susp = r => r.banned_until && new Date(r.banned_until) > new Date();

listModule({ id: 'products', title: 'Produtos', icon: 'products', perm: 'products.view', kind: 'products', statuses: ['active', 'paused'], hist: 'products', name: r => r.name,
  cols: [['name', 'Produto'], ['loja', 'Loja'], ['price', 'Preço', brl], ['stock', 'Estoque'], ['badge', 'Status', (v, r) => badge(v === 'paused' ? 'paused' : 'active')]],
  fields: r => [['ID', r.id], ['Marca', r.brand], ['Loja', r.loja], ['Preço', brl(r.price)], ['Estoque', r.stock], ['Selo', r.badge], ['Descrição', r.descricao], ['Criado em', dt(r.created_at)]],
  actions: [{ label: 'Editar', perm: 'products.moderate', rpc: 'admin_product_edit', args: r => ({ p_id: r.id }), inputs: [{ k: 'p_name', label: 'Nome', get: r => r.name }, { k: 'p_brand', label: 'Marca', get: r => r.brand }, { k: 'p_desc', label: 'Descrição', multi: 1, get: r => r.descricao }] },
    { label: 'Pausar', perm: 'products.moderate', rpc: 'admin_product_action', args: r => ({ p_id: r.id, p_action: 'pause' }), show: r => r.badge !== 'paused' },
    { label: 'Reativar', perm: 'products.moderate', rpc: 'admin_product_action', args: r => ({ p_id: r.id, p_action: 'reactivate' }), show: r => r.badge === 'paused', reasonKey: 'p_reason' },
    { label: 'Excluir', bad: 1, perm: 'products.moderate', rpc: 'admin_product_action', args: r => ({ p_id: r.id, p_action: 'delete' }) }] });
listModule({ id: 'reports', title: 'Denúncias de produtos', icon: 'flag', perm: 'reports.view', kind: 'product_reports', statuses: ['pending', 'under_review', 'resolved', 'dismissed'], hist: 'product_reports', name: r => r.product_name || 'Produto removido',
  cols: [['product_name', 'Produto'], ['loja', 'Loja'], ['reason', 'Motivo', v => RS[v] || v], ['status', 'Status', (v, r) => stat(r)], ['total_product_reports', 'Total'], ['created_at', 'Data', dt]],
  fields: r => [['Produto', r.product_name], ['ID produto', r.product_id], ['Loja', r.loja], ['Motivo', RS[r.reason] || r.reason], ['Detalhes', r.details], ['Denúncias do produto', r.total_product_reports], ['Status', stat(r)], ['Recebida', dt(r.created_at)], ['Atualizada', dt(r.updated_at)]],
  actions: [st('Marcar em análise', 'under_review'), st('Improcedente', 'dismissed'), st('Procedente', 'resolved'),
    { ...st('Procedente + pausar anúncio', 'resolved'), bad: 1, args: r => ({ p_id: r.id, p_status: 'resolved', p_pause: true }) }] });
const rv = (label, a, bad) => ({ label, bad, perm: 'reviews.moderate', rpc: 'admin_review_action', args: r => ({ p_review: r.id, p_action: a }), show: r => a === 'remove' ? r.exists_now : true });
listModule({ id: 'review-reports', title: 'Denúncias de avaliações', icon: 'star', perm: 'reports.view', kind: 'review_reports', statuses: ['pending', 'under_review', 'resolved', 'dismissed'], hist: 'product_reviews', name: r => r.title ?? r.snapshot?.title ?? 'Avaliação',
  cols: [['title', 'Avaliação', (v, r) => v ?? r.snapshot?.title ?? '—'], ['reviewer_name', 'Autor'], ['reasons', 'Motivos', rsn], ['n', 'Denúncias'], ['status', 'Status', (v, r) => stat(r)]],
  fields: r => [['Nota', r.rating ?? r.snapshot?.rating], ['Comentário', r.comment ?? r.snapshot?.comment], ['Autor', r.reviewer_name ?? r.snapshot?.reviewer_name], ['Produto', r.product_id], ['Motivos', rsn(r.reasons)], ['Detalhes', r.details],
    ['Denúncias', r.n], ['Situação', r.exists_now ? 'Avaliação publicada' : 'Avaliação já removida'], ['Status', stat(r)], ['Última decisão', r.note]],
  actions: [rv('Marcar em análise', 'under_review'), rv('Arquivar (improcedente)', 'dismissed'), rv('Remover avaliação', 'remove', 1)] });
listModule({ id: 'users', title: 'Usuários', icon: 'users', perm: 'users.view', kind: 'users', statuses: ['active', 'paused'], hist: 'profiles', name: r => r.full_name || r.email,
  cols: [['full_name', 'Nome'], ['email', 'E-mail'], ['phone', 'Telefone'], ['status', 'Conta', (v, r) => badge(susp(r) ? 'paused' : v)], ['created_at', 'Cadastro', dt]],
  fields: r => [['ID', r.id], ['Nome', r.full_name], ['E-mail', r.email], ['Telefone (mascarado)', r.phone], ['Conta', badge(susp(r) ? 'paused' : r.status)], ['Cadastro', dt(r.created_at)], ['Último acesso', dt(r.last_sign_in_at)]],
  actions: [{ label: 'Suspender conta', bad: 1, perm: 'users.suspend', rpc: 'admin_user_action', args: r => ({ p_user: r.id, p_action: 'suspend' }), show: r => !susp(r) && r.status !== 'paused' },
    { label: 'Reativar conta', perm: 'users.suspend', rpc: 'admin_user_action', args: r => ({ p_user: r.id, p_action: 'reactivate' }), show: r => susp(r) || r.status === 'paused' },
    { label: 'Enviar aviso', perm: 'notifications.send', rpc: 'admin_notify', reasonKey: null, args: r => ({ p_user: r.id }), inputs: [{ k: 'p_title', label: 'Título' }, { k: 'p_body', label: 'Mensagem', multi: 1 }, { k: 'p_url', label: 'Link interno (opcional, ex.: /pedidos)' }] }] });
listModule({ id: 'orders', title: 'Pedidos e devoluções', icon: 'orders', perm: 'orders.view', kind: 'orders', statuses: ['awaiting_payment', 'pending', 'transit', 'delivered', 'returned', 'cancelled'], name: r => 'Pedido ' + r.code,
  cols: [['code', 'Código'], ['loja', 'Loja'], ['customer_name', 'Comprador'], ['total', 'Total', brl], ['status', 'Status', badge], ['created_at', 'Data', dt]],
  fields: r => [['Loja', r.loja], ['Comprador', r.customer_name], ['Destino', [r.ship_city, r.ship_state].filter(Boolean).join('/')], ['Status', badge(r.status)], ['Total', brl(r.total)], ['Frete', brl(r.shipping_cost)], ['Rastreio', r.tracking_code],
    ['Pago em', dt(r.paid_at)], ['Devolução solicitada', dt(r.return_requested_at)], ['Devolução aprovada', dt(r.return_approved_at)], ['Itens', h('div', {}, ...(r.items || []).map(i => h('div', { textContent: `${i.qty}× ${i.name} — ${brl(i.unit_price)}` })))]] });
listModule({ id: 'payouts', title: 'Saques', icon: 'wallet', perm: 'finance.view', kind: 'payouts', statuses: ['requested', 'processing', 'paid', 'rejected'], hist: 'seller_payout_requests', name: r => 'Saque ' + brl(r.amount),
  cols: [['loja', 'Loja'], ['amount', 'Valor', brl], ['method', 'Método'], ['status', 'Status', badge], ['created_at', 'Solicitado', dt]],
  fields: r => [['Loja', r.loja], ['Valor', brl(r.amount)], ['Método', r.method], ['Status', badge(r.status)], ['Nota', r.note], ['Solicitado', dt(r.created_at)], ['Processado', dt(r.processed_at)]],
  actions: [{ label: 'Ver dados de recebimento', perm: 'finance.destination', rpc: 'admin_payout_destination', display: 1, show: r => ['requested', 'processing'].includes(r.status), args: r => ({ p_id: r.id }) },
    ...[['Iniciar processamento', 'processing', 'requested'], ['Marcar como pago (após transferência real)', 'paid', 'processing']].map(([l, s, f]) => ({ label: l, perm: 'finance.payouts', rpc: 'admin_payout_set', reasonKey: 'p_note', args: r => ({ p_id: r.id, p_status: s }), show: r => r.status === f })),
    { label: 'Rejeitar', bad: 1, perm: 'finance.payouts', rpc: 'admin_payout_set', reasonKey: 'p_note', args: r => ({ p_id: r.id, p_status: 'rejected' }), show: r => ['requested', 'processing'].includes(r.status) }] });
listModule({ id: 'subscriptions', title: 'Assinaturas', icon: 'card', perm: 'finance.view', kind: 'subscriptions', statuses: ['pending', 'awaiting_payment', 'active', 'past_due', 'canceled', 'expired', 'failed'], name: r => r.email || 'Assinatura',
  cols: [['email', 'Usuário'], ['plan_code', 'Plano'], ['billing_cycle', 'Ciclo'], ['amount', 'Valor', brl], ['status', 'Status', badge], ['current_period_end', 'Válida até', dt]],
  fields: r => [['Usuário', r.email], ['Plano', r.plan_code], ['Ciclo', r.billing_cycle], ['Valor', brl(r.amount)], ['Status', badge(r.status)], ['Último pagamento', r.last_payment_status], ['Cancela no fim do período', r.cancel_at_period_end ? 'Sim' : 'Não'], ['Válida até', dt(r.current_period_end)]] });
listModule({ id: 'offers', title: 'Ofertas', icon: 'tag', perm: 'offers.view', kind: 'offers', statuses: ['pending', 'accepted', 'rejected', 'countered', 'counter_accepted', 'counter_rejected'], name: r => r.product_name,
  cols: [['product_name', 'Produto'], ['comprador', 'Comprador'], ['vendedor', 'Vendedor'], ['offer_price', 'Oferta', brl], ['status', 'Status', badge], ['created_at', 'Data', dt]],
  fields: r => [['Produto', r.product_name], ['Preço', brl(r.product_price)], ['Oferta', brl(r.offer_price)], ['Contraproposta', brl(r.counter_offer_price)], ['Comprador', r.comprador], ['Vendedor', r.vendedor], ['Msg. comprador', r.buyer_message], ['Msg. vendedor', r.seller_message], ['Status', badge(r.status)], ['Atualizada', dt(r.updated_at)]] });
const fb = (l, s) => ({ label: l, perm: 'feedback.manage', rpc: 'admin_feedback_set', reasonKey: 'p_note', args: r => ({ p_id: r.id, p_status: s }), show: r => r.status !== s });
listModule({ id: 'feedback', title: 'Feedbacks', icon: 'chat', perm: 'feedback.view', kind: 'feedback', statuses: ['pending', 'in_review', 'implemented', 'declined'], hist: 'user_feedback', name: r => r.title,
  cols: [['title', 'Título'], ['type', 'Tipo'], ['category', 'Categoria'], ['autor', 'Autor'], ['status', 'Status', badge], ['created_at', 'Data', dt]],
  fields: r => [['Título', r.title], ['Descrição', r.description], ['Tipo', r.type], ['Categoria', r.category], ['Autor', r.autor], ['Anexos', r.anexos], ['Status', badge(r.status)], ['Enviado', dt(r.created_at)]],
  actions: [fb('Em análise', 'in_review'), fb('Implementado', 'implemented'), fb('Recusar', 'declined')] });
listModule({ id: 'audit', title: 'Auditoria', icon: 'list', perm: 'audit.view', kind: 'audit', name: r => r.action,
  cols: [['created_at', 'Quando', dt], ['operator_email', 'Operador'], ['action', 'Ação'], ['entity', 'Entidade'], ['reason', 'Motivo']],
  fields: r => [['Quando', dt(r.created_at)], ['Operador', r.operator_email], ['Ação', r.action], ['Entidade', r.entity + ' / ' + r.entity_id], ['Motivo', r.reason], ['Antes', JSON.stringify(r.old_value)], ['Depois', JSON.stringify(r.new_value)]] });

// Equipe (somente Gerente; validado no servidor)
const PERMS = ['dashboard.view', 'stores.view', 'stores.approve', 'stores.suspend', 'products.view', 'products.moderate', 'reports.view', 'reports.resolve', 'reviews.moderate', 'users.view', 'users.suspend', 'orders.view', 'finance.view', 'finance.payouts', 'finance.destination', 'offers.view', 'feedback.view', 'feedback.manage', 'notifications.send', 'audit.view'];
A.mods.push({ id: 'team', title: 'Equipe', icon: 'team', perm: 'team.manage' });
A.routes.team = async () => {
  const box = h('div', { className: 'tbl' }), v = $('#view');
  const form = (u = {}) => {
    const d = $('#dlg'), em = h('input', { placeholder: 'E-mail Google', value: u.email || '', disabled: !!u.email }), role = h('select', {}, h('option', { value: 'collaborator', textContent: 'Funcionário (Collaborator)' }), h('option', { value: 'admin', textContent: 'Gerente (Admin)' }));
    role.value = u.role || 'collaborator'; const act = h('input', { type: 'checkbox', checked: u.active !== false }), msg = h('p', { className: 'err' });
    const cbs = PERMS.map(p => [p, h('input', { type: 'checkbox', checked: (u.permissions || []).includes(p) })]);
    d.replaceChildren(h('h2', { textContent: u.email ? 'Editar membro' : 'Adicionar membro' }), em, role, h('label', {}, act, ' Acesso ativo'), h('p', { className: 'muted', textContent: 'Permissões (Gerentes têm acesso total):' }),
      h('div', { className: 'perms' }, ...cbs.map(([p, c]) => h('label', {}, c, p))), msg, h('div', { className: 'bar' },
        h('button', { className: 'btn', textContent: 'Salvar', onclick: async () => {
          const { error } = await sb.rpc('admin_set_team_member', { p_email: em.value, p_role: role.value, p_permissions: cbs.filter(x => x[1].checked).map(x => x[0]), p_active: act.checked });
          if (error) return msg.textContent = err(error); d.close(); A.toast('Equipe atualizada.'); load(); } }), h('button', { className: 'ghost', textContent: 'Cancelar', onclick: () => d.close() }))); d.showModal();
  };
  const load = async () => {
    box.replaceChildren(h('div', { className: 'skel' }));
    const { data, error } = await sb.rpc('admin_list_team');
    if (error) return box.replaceChildren(h('p', { className: 'err', textContent: err(error) }));
    box.replaceChildren(h('table', {}, h('tr', {}, ...['E-mail', 'Cargo', 'Status', 'Último acesso', 'Permissões'].map(x => h('th', { textContent: x }))), ...data.map(u => {
      const tr = h('tr', { className: 'row' }, h('td', { textContent: u.email }), h('td', { textContent: u.role === 'admin' ? 'Gerente' : 'Funcionário' }), h('td', {}, badge(u.active ? 'active' : 'paused')), h('td', { textContent: dt(u.last_login_at) }), h('td', { textContent: u.role === 'admin' ? 'Todas' : (u.permissions || []).length }));
      tr.onclick = () => form(u); return tr; })));
  };
  v.replaceChildren(h('h1', { textContent: 'Equipe' }), h('div', { className: 'bar' }, h('button', { className: 'btn', textContent: '+ Adicionar membro', onclick: () => form() })), box); load();
};

A.afterDashboard = async v => {
  if (!A.can('dashboard.view')) return;
  let days = 30, met = 'orders'; const box = h('div', { className: 'card chart' }), body = h('div'); v.append(box);
  const M = { orders: 'Pedidos', users: 'Novos usuários', stores: 'Novas lojas' };
  const sel = h('select', {}, ...[7, 30, 90].map(n => h('option', { value: n, textContent: n + ' dias' }))); sel.value = 30;
  const draw = async () => {
    body.replaceChildren(h('div', { className: 'skel' }));
    const { data, error } = await sb.rpc('admin_dashboard_series', { p_days: days });
    if (error) return body.replaceChildren(h('p', { className: 'err', textContent: err(error) }));
    const vals = data.map(x => +x[met] || 0), mx = Math.max(1, ...vals), w = 600 / vals.length;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 600 150');
    vals.forEach((n, i) => { const r = document.createElementNS(svg.namespaceURI, 'rect'), hh = n / mx * 130; r.setAttribute('x', i * w + 1); r.setAttribute('y', 145 - hh); r.setAttribute('width', Math.max(1, w - 2)); r.setAttribute('height', Math.max(hh, 1)); r.setAttribute('rx', 2);
      const ti = document.createElementNS(svg.namespaceURI, 'title'); ti.textContent = `${data[i].d}: ${n}`; r.append(ti); svg.append(r); });
    body.replaceChildren(h('p', { className: 'muted', textContent: `${M[met]} no período: ${vals.reduce((a, b) => a + b, 0)}` }), svg);
  };
  sel.onchange = () => { days = +sel.value; draw(); };
  box.append(h('div', { className: 'bar' }, ...Object.entries(M).map(([k, l]) => h('button', { className: 'ghost', textContent: l, onclick: () => { met = k; draw(); } })), sel), body); draw();
};

const sh = document.querySelector('.shell'); try { if (localStorage.getItem('ecomme-nav') === '1') sh.classList.add('collapsed'); } catch (e) {}
$('#btn-collapse').onclick = () => { sh.classList.toggle('collapsed'); try { localStorage.setItem('ecomme-nav', sh.classList.contains('collapsed') ? '1' : '0'); } catch (e) {} };
$('#btn-menu').onclick = () => sh.classList.toggle('open');
$('#nav').addEventListener('click', () => sh.classList.remove('open'));
})();
