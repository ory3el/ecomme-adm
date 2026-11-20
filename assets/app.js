(() => {
const C = window.ADMIN_CONFIG, sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
const $ = s => document.querySelector(s);
const h = (t, p = {}, ...k) => { const e = Object.assign(document.createElement(t), p); e.append(...k); return e; };
let me = null;
const show = id => ['login', 'denied', 'app'].forEach(x => $('#' + x).hidden = x !== id);
const errMsg = e => e?.message === 'forbidden' ? 'Sem permissão.' : (e?.message || 'Erro de consulta.');

async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return show('login');
  const { data, error } = await sb.rpc('admin_claim_session');
  if (error || !data) { await sb.auth.signOut(); return show('denied'); }
  me = data; $('#who').textContent = `${me.email} · ${me.role === 'admin' ? 'Gerente' : 'Funcionário'}`;
  const can = p => me.role === 'admin' || me.permissions.includes(p);
  const items = [['dashboard', 'Dashboard', 'dashboard.view'], ['stores', 'Lojas', 'stores.view']].filter(i => can(i[2]));
  $('#nav').replaceChildren(...items.map(i => h('a', { href: '#' + i[0], textContent: i[1], id: 'n-' + i[0] })));
  show('app'); route();
}
function route() {
  const r = location.hash.slice(1).split('?')[0] || 'dashboard';
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.id === 'n-' + r));
  ({ dashboard, stores }[r] || dashboard)();
}
async function dashboard() {
  const v = $('#view'); v.replaceChildren(h('div', { className: 'grid' }, ...Array(6).fill().map(() => h('div', { className: 'skel' }))));
  const { data, error } = await sb.rpc('admin_dashboard_counts');
  if (error) return v.replaceChildren(h('p', { className: 'err', textContent: errMsg(error) }));
  const cards = [['users', 'Usuários', ''], ['users_paused', 'Contas pausadas', ''], ['stores_pending', 'Lojas pendentes', '#stores?s=pendente'],
    ['stores_active', 'Lojas ativas', '#stores?s=ativa'], ['stores_suspended', 'Suspensas/rejeitadas', '#stores?s=suspensa'], ['products_paused', 'Produtos pausados', ''],
    ['product_reports_open', 'Denúncias abertas', ''], ['feedback_open', 'Feedbacks abertos', ''], ['payouts_requested', 'Saques pendentes', '']];
  v.replaceChildren(h('div', { className: 'grid' }, ...cards.map(([k, l, href]) =>
    h('a', { className: 'card', href: href || undefined }, h('b', { textContent: String(data[k] ?? 0) }), h('span', { textContent: l })))));
}
async function stores() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const sel = h('select', {}, ...[['', 'Todos'], ['pendente', 'Pendentes'], ['ativa', 'Ativas'], ['suspensa', 'Suspensas'], ['rejeitada', 'Rejeitadas']].map(([v, t]) => h('option', { value: v, textContent: t })));
  sel.value = q.get('s') ?? 'pendente';
  const inp = h('input', { placeholder: 'Nome, slug, e-mail ou cidade' }), box = h('div', { className: 'tbl' });
  $('#view').replaceChildren(h('div', { className: 'bar' }, sel, inp), box);
  let t; const load = async () => {
    box.replaceChildren(h('div', { className: 'skel' }));
    const { data, error } = await sb.rpc('admin_list_stores', { p_status: sel.value || null, p_search: inp.value, p_limit: 50, p_offset: 0 });
    if (error) return box.replaceChildren(h('p', { className: 'err', textContent: errMsg(error) }));
    if (!data.rows.length) return box.replaceChildren(h('p', { className: 'muted', textContent: 'Nenhuma loja encontrada.' }));
    box.replaceChildren(h('table', {}, h('tr', {}, ...['Loja', 'Status', 'Cidade', 'Cadastro'].map(x => h('th', { textContent: x }))),
      ...data.rows.map(s => { const r = h('tr', { className: 'row' }, h('td', { textContent: s.nome_loja || '—' }), h('td', { textContent: s.status || 'pendente' }),
        h('td', { textContent: [s.cidade, s.estado].filter(Boolean).join('/') }), h('td', { textContent: (s.criado_em || '').slice(0, 10) })); r.onclick = () => detail(s, load); return r; })));
  };
  sel.onchange = load; inp.oninput = () => { clearTimeout(t); t = setTimeout(load, 350); }; load();
}
function detail(s, reload) {
  const d = $('#dlg'), why = h('textarea', { rows: 2, placeholder: 'Motivo (obrigatório para rejeitar/suspender)', style: 'width:100%' }), msg = h('p', { className: 'err' });
  const act = (label, st, bad) => h('button', { className: 'btn' + (bad ? ' bad' : ''), textContent: label, onclick: async () => {
    const { error } = await sb.rpc('admin_set_store_status', { p_loja: s.id, p_new: st, p_reason: why.value });
    if (error) return msg.textContent = error.message === 'reason_required' ? 'Informe o motivo (mín. 5 caracteres).' : errMsg(error);
    d.close(); reload(); } });
  const cur = s.status || 'pendente', btns = [];
  if (cur !== 'ativa' && cur !== 'active') btns.push(act('Aprovar', 'ativa'));
  if (cur === 'ativa' || cur === 'active') btns.push(act('Suspender', 'suspensa', 1)); else if (cur !== 'rejeitada') btns.push(act('Rejeitar', 'rejeitada', 1));
  const f = [['Loja', s.nome_loja], ['Slug', s.slug_url], ['Razão social', s.nome_razao], ['Tipo', s.tipo_pessoa], ['Documento', s.documento], ['E-mail', s.email], ['Telefone', s.telefone],
    ['Cidade/UF', [s.cidade, s.estado].filter(Boolean).join('/')], ['Categoria', s.categoria], ['Status', cur], ['Dono (user_id)', s.user_id]];
  d.replaceChildren(h('h2', { textContent: s.nome_loja || 'Loja' }), h('dl', {}, ...f.flatMap(([k, v]) => [h('dt', { textContent: k }), h('dd', { textContent: v || '—' })])),
    why, msg, h('div', { className: 'bar' }, ...btns, h('button', { className: 'ghost', textContent: 'Fechar', onclick: () => d.close() }))); d.showModal();
}
$('#btn-google').onclick = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin, queryParams: { prompt: 'select_account' } } });
$('#btn-out').onclick = async () => { await sb.auth.signOut(); location.hash = ''; show('login'); };
$('#btn-back').onclick = () => show('login');
$('#btn-theme').onclick = () => { const r = document.documentElement, n = { undefined: 'light', light: 'dark', dark: undefined }[r.dataset.theme];
  n ? r.dataset.theme = n : delete r.dataset.theme; try { n ? localStorage.setItem('ecomme-theme', n) : localStorage.removeItem('ecomme-theme'); } catch (e) {} };
addEventListener('hashchange', () => me && route()); boot();
})();
