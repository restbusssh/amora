// AMORA — подключение к Firebase (Firestore + Auth).
// Загружается только если в assets/config.js указан firebase-конфиг.
// Приложение работает с одним объектом состояния S; этот модуль:
//  1) подписывается на нужные коллекции и складывает данные в S,
//  2) после каждого изменения (commit) пишет в базу только то, что изменилось.
const V = '10.12.2';
const CDN = `https://www.gstatic.com/firebasejs/${V}/`;

// Стабильная сериализация (порядок ключей не влияет на сравнение)
function sortKeys(x) {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === 'object') { const o = {}; Object.keys(x).sort().forEach(k => { if (x[k] !== undefined) o[k] = sortKeys(x[k]); }); return o; }
  return x;
}
const J = x => JSON.stringify(sortKeys(x ?? null));
const clean = x => JSON.parse(JSON.stringify(x ?? null));
const ym = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
const prevYm = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return ym(d); };

export async function start(cfg, api, entry) {
  const { initializeApp, deleteApp } = await import(CDN + 'firebase-app.js');
  const fs = await import(CDN + 'firebase-firestore.js');
  const au = await import(CDN + 'firebase-auth.js');
  const { doc, collection, onSnapshot, setDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, runTransaction, FieldPath } = fs;

  const app = initializeApp(cfg.firebase);
  // App Check (reCAPTCHA v3): база принимает запросы только с вашего сайта, не от скриптов/ботов.
  if (cfg.appCheckKey) { try { const ac = await import(CDN + 'firebase-app-check.js'); ac.initializeAppCheck(app, { provider: new ac.ReCaptchaV3Provider(cfg.appCheckKey), isTokenAutoRefreshEnabled: true }); } catch (e) { console.warn('[AMORA] App Check', e); } }
  const db = fs.getFirestore(app);
  const auth = au.getAuth(app);

  const synced = new Map();          // 'col/id' -> J(данные в базе)
  const unsubs = { pub: [], role: [] };
  let staff = null, uid = null, ready = false, warned = false;
  const S = () => api.getS();
  const warn = e => { console.warn('[AMORA]', e && (e.code || e.message) || e); if (!warned) { warned = true; api.toast('Нет доступа к базе: ' + ((e && e.code) || 'ошибка')); setTimeout(() => warned = false, 8000); } };
  const mark = (path, data) => synced.set(path, J(data));
  const listen = (bucket, ref, fn) => unsubs[bucket].push(onSnapshot(ref, fn, warn));
  const changed = () => api.changed();
  const upsert = (arr, item) => { const i = arr.findIndex(x => x.id === item.id); if (i >= 0) arr[i] = item; else arr.push(item); };

  /* ---------- публичные данные (видят все) ---------- */
  let waitPub = 3;
  const pubReady = () => { if (--waitPub === 0) { ready = true; changed(); } };
  let f1 = true, f2 = true, f3 = true;
  listen('pub', doc(db, 'config', 'settings'), d => {
    if (d.exists()) { const v = d.data(); mark('config/settings', v); S().settings = Object.assign(S().settings, v); }
    if (f1) { f1 = false; pubReady(); } else changed();
  });
  listen('pub', doc(db, 'config', 'added'), d => {
    const v = d.exists() ? d.data() : { items: [] }; if (d.exists()) mark('config/added', v); S().added = v.items || [];
    if (f2) { f2 = false; pubReady(); } else changed();
  });
  listen('pub', collection(db, 'menu'), qs => {
    const m = S().menu;
    qs.docChanges().forEach(ch => { const id = ch.doc.id; if (ch.type === 'removed') { delete m[id]; synced.delete('menu/' + id); } else { m[id] = ch.doc.data(); mark('menu/' + id, m[id]); } });
    if (f3) { f3 = false; pubReady(); } else changed();
  });
  // рейтинг гостей: топ текущего и прошлого месяца
  const applyCustomers = qs => { const c = S().customers = S().customers || {}; qs.forEach(d => { const prev = c[d.id] || {}; c[d.id] = Object.assign({}, d.data(), prev.phone ? { phone: prev.phone } : {}); mark('customers/' + d.id, d.data()); }); changed(); };
  [ym(), prevYm()].forEach(m => listen('pub', query(collection(db, 'customers'), orderBy(new FieldPath('pts', m), 'desc'), limit(50)), applyCustomers));

  /* ---------- гость ---------- */
  const watched = new Set();
  function watchOrder(id) {
    if (watched.has(id)) return; watched.add(id);
    unsubs.pub.push(onSnapshot(doc(db, 'orders', id), d => { if (!d.exists()) return; const o = d.data(); mark('orders/' + id, o); upsert(S().orders, o); changed(); }, () => {}));
  }
  function watchTable(n) {
    listen('pub', query(collection(db, 'calls'), where('guestUid', '==', uid), where('done', '==', false)), qs => {
      S().calls = S().calls.filter(c => c.table !== n || !c.done);
      qs.docChanges().forEach(ch => { const c = ch.doc.data(); if (ch.type === 'removed') { S().calls = S().calls.filter(x => x.id !== c.id); } else { mark('calls/' + c.id, c); upsert(S().calls, c); } });
      changed();
    });
  }

  /* ---------- персонал ---------- */
  function startStaff() {
    unsubs.role.forEach(u => u()); unsubs.role = [];
    const since = Date.now() - 36 * 3600e3;
    listen('role', query(collection(db, 'orders'), where('ts', '>=', since)), qs => {
      qs.docChanges().forEach(ch => { const o = ch.doc.data(); if (ch.type === 'removed') S().orders = S().orders.filter(x => x.id !== o.id); else { mark('orders/' + o.id, o); upsert(S().orders, o); } });
      changed();
    });
    listen('role', query(collection(db, 'calls'), where('done', '==', false)), qs => {
      qs.docChanges().forEach(ch => { const c = ch.doc.data(); if (ch.type === 'removed') S().calls = S().calls.filter(x => x.id !== c.id); else { mark('calls/' + c.id, c); upsert(S().calls, c); } });
      changed();
    });
    listen('role', query(collection(db, 'bookings'), orderBy('ts', 'desc'), limit(200)), qs => {
      qs.docChanges().forEach(ch => { const b = ch.doc.data(); if (ch.type === 'removed') S().bookings = S().bookings.filter(x => x.id !== b.id); else { mark('bookings/' + b.id, b); upsert(S().bookings, b); } });
      changed();
    });
    listen('role', query(collection(db, 'customers'), limit(2000)), applyCustomers);
    listen('role', collection(db, 'crm'), qs => { const c = S().customers = S().customers || {}; qs.forEach(d => { mark('crm/' + d.id, d.data()); c[d.id] = Object.assign(c[d.id] || {}, { phone: d.data().phone }); }); changed(); });
    listen('role', collection(db, 'staff'), qs => { S().staff = qs.docs.map(d => { mark('staff/' + d.id, d.data()); return Object.assign({ id: d.id }, d.data()); }); changed(); });
    if (staff.role === 'admin') listen('role', query(collection(db, 'audit'), orderBy('ts', 'desc'), limit(500)), qs => {
      const a = S().audit = S().audit || [];
      qs.docChanges().forEach(ch => { const x = ch.doc.data(); mark('audit/' + x.id, x); if (!a.some(y => y.id === x.id)) a.push(x); });
      changed();
    });
    listen('role', collection(db, 'tables'), qs => { const t = S().tables = S().tables || {}; qs.forEach(d => { mark('tables/' + d.id, d.data()); t[d.id] = d.data().key; }); changed(); });
  }

  /* ---------- авторизация ---------- */
  au.onAuthStateChanged(auth, async user => {
    uid = user ? user.uid : null;
    if (user && !user.isAnonymous) {
      try {
        const sd = await getDoc(doc(db, 'staff', user.uid));
        if (sd.exists()) { staff = Object.assign({ id: user.uid, email: user.email }, sd.data()); startStaff(); api.onStaff(staff); return; }
      } catch (e) { warn(e); }
      staff = null; await au.signOut(auth); api.toast('Этот аккаунт не сотрудник AMORA'); return;
    }
    staff = null; unsubs.role.forEach(u => u()); unsubs.role = [];
    if (entry === 'admin') { api.onStaff(null); return; }
    if (!user) { try { await au.signInAnonymously(auth); } catch (e) { warn(e); } return; }
    // гость (анонимный вход): свои заказы и вызовы своего стола
    (api.myIds() || []).forEach(watchOrder);
    const n = api.table(); if (n) watchTable(n);
  });

  /* ---------- запись изменений ---------- */
  function write(path, data, opts) {
    const j = J(data); if (synced.get(path) === j) return;
    synced.set(path, j);
    const [c, id] = path.split('/');
    setDoc(doc(db, c, id), clean(data), opts || { merge: true }).catch(e => { synced.delete(path); warn(e); });
  }
  const createOnly = (path, data) => { if (!synced.has(path)) write(path, data); };

  function sync() {
    if (!ready || !uid) return;
    const s = S(); const role = staff ? staff.role : 'guest';
    if (role === 'guest') {
      const mine = new Set(api.myIds() || []);
      s.orders.forEach(o => {
        if (!mine.has(o.id)) return;
        if (!synced.has('orders/' + o.id)) { write('orders/' + o.id, o); return; }
        if (o.rating && !synced.has('rate/' + o.id)) { synced.set('rate/' + o.id, '1'); setDoc(doc(db, 'orders', o.id), { rating: o.rating, review: o.review || '' }, { merge: true }).catch(warn); }
      });
      s.calls.forEach(c => createOnly('calls/' + c.id, Object.assign({}, c, { guestUid: uid })));
      s.bookings.forEach(b => createOnly('bookings/' + b.id, b));
      return;
    }
    // журнал действий: только свои новые записи (правила: создать можно, менять — нельзя)
    (s.audit || []).forEach(x => { if (x.by === uid) createOnly('audit/' + x.id, x); });
    s.orders.forEach(o => write('orders/' + o.id, o));
    s.calls.forEach(c => write('calls/' + c.id, c));
    s.bookings.forEach(b => write('bookings/' + b.id, b));
    Object.entries(s.customers || {}).forEach(([id, c]) => { const { phone, ...pub } = c; write('customers/' + id, pub); if (phone) write('crm/' + id, { phone, name: c.name || '' }); });
    if (role === 'admin') {
      write('config/settings', s.settings);
      write('config/added', { items: s.added || [] });
      Object.entries(s.menu).forEach(([id, m]) => write('menu/' + id, m));
      Object.entries(s.tables || {}).forEach(([n, k]) => write('tables/' + n, { key: k }));
      for (const p of [...synced.keys()]) {
        const [c, id] = p.split('/');
        if (c === 'menu' && !(id in s.menu)) { synced.delete(p); deleteDoc(doc(db, 'menu', id)).catch(warn); }
        if (c === 'staff' && !(s.staff || []).some(x => x.id === id)) { synced.delete(p); deleteDoc(doc(db, 'staff', id)).catch(warn); }
      }
    } else {
      // менеджер: оперативные настройки приёма заказов (правила пропустят только эти поля)
      if (role === 'manager') { const was = synced.has('config/settings') ? JSON.parse(synced.get('config/settings')) : null; if (was) { const ops = {}; ['delivery', 'pickup', 'tables', 'extra'].forEach(k => { if (was[k] !== s.settings[k]) ops[k] = s.settings[k]; }); if (Object.keys(ops).length) { synced.set('config/settings', J(Object.assign({}, was, ops))); setDoc(doc(db, 'config', 'settings'), ops, { merge: true }).catch(warn); } } }
      // менеджер ведёт меню: цены, описания, фото, новые блюда, стоп-лист
      if (role === 'manager') {
        write('config/added', { items: s.added || [] });
        Object.entries(s.menu).forEach(([id, m]) => write('menu/' + id, m));
        return;
      }
      // повар и бармен могут менять только наличие блюд
      Object.entries(s.menu).forEach(([id, m]) => { const p = 'menu/' + id; const was = synced.has(p) ? JSON.parse(synced.get(p)) : null;
        // правила пропустят только поле avail (+ dep при создании) и только для своего отдела
        if (was && was.avail !== m.avail) { synced.set(p, J(Object.assign({}, was, { avail: m.avail }))); setDoc(doc(db, 'menu', id), { avail: m.avail }, { merge: true }).catch(warn); }
        else if (!was && m.avail === false) { const v = { avail: false, dep: m.dep || 'kitchen' }; synced.set(p, J(v)); setDoc(doc(db, 'menu', id), v).catch(warn); } });
    }
  }

  return {
    sync,
    uid: () => uid,
    watchOrder,
    // Номер заказа: счётчик в config/meta, увеличивается транзакцией (без повторов)
    async nextSeq() {
      const ref = doc(db, 'config', 'meta');
      return runTransaction(db, async tx => { const d = await tx.get(ref); const n = (d.exists() ? d.data().seq : 100) + 1; tx.set(ref, { seq: n }); return n; });
    },
    // История и отчёты: заказы за период (разовая загрузка, только для персонала)
    async fetchOrders(from, to) {
      const qs = await getDocs(query(collection(db, 'orders'), where('ts', '>=', from), where('ts', '<', to), orderBy('ts', 'desc'), limit(3000)));
      return qs.docs.map(d => d.data());
    },
    async fetchCustomer(id) {
      const d = await getDoc(doc(db, 'customers', id));
      if (d.exists()) { const c = S().customers = S().customers || {}; c[id] = Object.assign(c[id] || {}, d.data()); mark('customers/' + id, d.data()); }
    },
    async login(email, pw) {
      const cr = await au.signInWithEmailAndPassword(auth, email, pw);
      const sd = await getDoc(doc(db, 'staff', cr.user.uid));
      if (!sd.exists()) { await au.signOut(auth); throw new Error('not-staff'); }
    },
    async logout() { await au.signOut(auth); },
    // Создать сотрудника: отдельный экземпляр приложения, чтобы админ не вышел из своего аккаунта
    async addStaff(email, pw, name, role) {
      const sec = initializeApp(cfg.firebase, 'staff-' + Date.now());
      try {
        const sa = au.getAuth(sec);
        const cr = await au.createUserWithEmailAndPassword(sa, email, pw);
        await setDoc(doc(db, 'staff', cr.user.uid), { name, role, email });
        await au.signOut(sa);
      } finally { await deleteApp(sec); }
    }
  };
}
