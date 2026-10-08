import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://malaysia-local-services.shanwebstudio10.workers.dev' : 'http://localhost:8787');
const STATES = ['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Sabah','Sarawak','Selangor','Terengganu','Kuala Lumpur','Putrajaya','Labuan'];
const CATS = ['Plumber','Electrician','Aircond service','Cleaning','Tutor','Mechanic','Renovation','Moving/Lorry','Catering','Other'];

const L = {
  en: { services: 'Services', classifieds: 'Classifieds', post: 'Post a listing', account: 'Account', admin: 'Admin',
    tag: 'Find trusted local services across Malaysia, request a visit, or chat on WhatsApp.',
    search: 'Search by name or service', allStates: 'All states', allCats: 'All categories', none: 'No listings match. Try another state or category.',
    call: 'Call', request: 'Request service', send: 'Send request', close: 'Close', name: 'Your name', phone: 'Your phone', need: 'What do you need?',
    reviews: 'Reviews', rate: 'Your rating', comment: 'Comment', save: 'Save review', noRev: 'No reviews yet.', loginFirst: 'Log in on the Account tab first.',
    login: 'Log in', register: 'Create account', logout: 'Log out', email: 'Email', pw: 'Password', haveAcc: 'Have an account? Log in', newAcc: 'New here? Create account',
    mine: 'My listings', type: 'Listing type', prov: 'Service provider', clas: 'Classified ad', title: 'Title', cat: 'Category', state: 'State', city: 'City or area',
    desc: 'Description', price: 'Price (optional)', wa: 'WhatsApp number (if different)', photo: 'Photo (optional)', submit: 'Submit for approval',
    sent: 'Submitted. It appears after admin approval.', reqSent: 'Request sent. The provider will contact you.', prev: 'Previous', next: 'Next', page: 'Page' },
  ms: { services: 'Perkhidmatan', classifieds: 'Iklan', post: 'Pasang iklan', account: 'Akaun', admin: 'Admin',
    tag: 'Cari perkhidmatan tempatan yang dipercayai di Malaysia, minta lawatan atau WhatsApp terus.',
    search: 'Cari nama atau perkhidmatan', allStates: 'Semua negeri', allCats: 'Semua kategori', none: 'Tiada senarai sepadan. Cuba negeri atau kategori lain.',
    call: 'Telefon', request: 'Minta perkhidmatan', send: 'Hantar permintaan', close: 'Tutup', name: 'Nama anda', phone: 'No. telefon anda', need: 'Apa yang anda perlukan?',
    reviews: 'Ulasan', rate: 'Penilaian anda', comment: 'Komen', save: 'Simpan ulasan', noRev: 'Belum ada ulasan.', loginFirst: 'Sila log masuk di tab Akaun dahulu.',
    login: 'Log masuk', register: 'Daftar akaun', logout: 'Log keluar', email: 'E-mel', pw: 'Kata laluan', haveAcc: 'Ada akaun? Log masuk', newAcc: 'Baru di sini? Daftar akaun',
    mine: 'Senarai saya', type: 'Jenis senarai', prov: 'Penyedia perkhidmatan', clas: 'Iklan baris', title: 'Tajuk', cat: 'Kategori', state: 'Negeri', city: 'Bandar atau kawasan',
    desc: 'Penerangan', price: 'Harga (pilihan)', wa: 'No. WhatsApp (jika berbeza)', photo: 'Gambar (pilihan)', submit: 'Hantar untuk kelulusan',
    sent: 'Dihantar. Akan dipaparkan selepas diluluskan admin.', reqSent: 'Permintaan dihantar. Penyedia akan menghubungi anda.', prev: 'Sebelum', next: 'Seterusnya', page: 'Halaman' },
};
let T = L.en;
const t = (k) => T[k] || k;

const wa = (n, text = 'Hi, I found you on Servis Kita.') => {
  let d = String(n || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '6' + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
};
const api = async (path, opts = {}, admin) => {
  const h = { 'Content-Type': 'application/json' };
  const ut = localStorage.getItem('ut');
  if (ut) h['X-User-Token'] = ut;
  if (admin) h.Authorization = `Bearer ${admin}`;
  const r = await fetch(API + path, { ...opts, headers: h });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};
const post = (path, body, admin) => api(path, { method: 'POST', body: JSON.stringify(body) }, admin);
const toImg = (file) => new Promise((res) => {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, 640 / im.width), c = document.createElement('canvas');
      c.width = im.width * s; c.height = im.height * s;
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.7));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
});
const Stars = ({ n }) => <span className="stars" aria-label={`${n} / 5`}>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>;
const Msg = ({ m }) => m ? <p className={'msg' + (m.ok ? '' : ' err')}>{m.t}</p> : null;

function Browse({ type }) {
  const [f, setF] = useState({ q: '', state: '', category: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => { setPage(1); }, [type, f]);
  useEffect(() => {
    const p = new URLSearchParams({ type, page, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) });
    api('/api/listings?' + p).then((d) => { setData(d); setErr(''); }).catch((e) => setErr(e.message));
  }, [type, f, page]);

  return (
    <>
      <div className="filters">
        <input placeholder={t('search')} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>
          <option value="">{t('allStates')}</option>{STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="">{t('allCats')}</option>{CATS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {err && <p className="msg err">{err}</p>}
      {data && data.items.length === 0 && <p className="empty">{t('none')}</p>}
      <div className="grid">
        {(data?.items || []).map((i) => (
          <article className="card" key={i.id}>
            {i.image && <img className="thumb" src={i.image} alt={i.title} loading="lazy" />}
            <span className="tag">{i.category || 'Other'}</span>
            <h3>{i.title}</h3>
            <div className="meta">{[i.city, i.state].filter(Boolean).join(', ')}</div>
            {i.reviews > 0 && <div><Stars n={i.avg} /> <span className="meta">{i.avg} ({i.reviews})</span></div>}
            <p style={{ margin: 0 }}>{i.description}</p>
            {i.price && <div className="price">{i.price}</div>}
            <div className="row">
              <a className="btn wa" href={wa(i.whatsapp || i.phone, `Hi, I saw "${i.title}" on Servis Kita.`)} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="btn" href={`tel:${i.phone}`}>{t('call')}</a>
              <button className="btn" onClick={() => setModal({ k: 'rev', i })}>{t('reviews')}</button>
              {type === 'provider' && <button className="btn pri" onClick={() => setModal({ k: 'req', i })}>{t('request')}</button>}
            </div>
          </article>
        ))}
      </div>
      {data && data.pages > 1 && (
        <div className="pager">
          <button className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('prev')}</button>
          <span>{t('page')} {page} / {data.pages}</span>
          <button className="btn sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>{t('next')}</button>
        </div>
      )}
      {modal?.k === 'req' && <RequestModal listing={modal.i} onClose={() => setModal(null)} />}
      {modal?.k === 'rev' && <ReviewModal listing={modal.i} onClose={() => setModal(null)} />}
    </>
  );
}

function RequestModal({ listing, onClose }) {
  const [v, setV] = useState({ name: '', phone: '', message: '' });
  const [msg, setMsg] = useState(null);
  const send = async (e) => {
    e.preventDefault();
    try { await post('/api/requests', { ...v, listing_id: listing.id }); setMsg({ ok: true, t: t('reqSent') }); }
    catch (x) { setMsg({ ok: false, t: x.message }); }
  };
  return (
    <div className="modal" onClick={onClose}>
      <form className="box" onClick={(e) => e.stopPropagation()} onSubmit={send}>
        <h2>{listing.title}</h2>
        <label>{t('name')}<input required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
        <label>{t('phone')}<input required value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></label>
        <label>{t('need')}<textarea value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} /></label>
        <Msg m={msg} />
        <div className="row"><button className="btn pri" type="submit">{t('send')}</button><button className="btn" type="button" onClick={onClose}>{t('close')}</button></div>
      </form>
    </div>
  );
}

function ReviewModal({ listing, onClose }) {
  const [list, setList] = useState([]);
  const [v, setV] = useState({ rating: 5, comment: '' });
  const [msg, setMsg] = useState(null);
  const load = () => api('/api/reviews?listing_id=' + listing.id).then(setList);
  useEffect(() => { load(); }, []);
  const send = async (e) => {
    e.preventDefault();
    try { await post('/api/reviews', { ...v, listing_id: listing.id }); setMsg(null); load(); }
    catch (x) { setMsg({ ok: false, t: x.message }); }
  };
  return (
    <div className="modal" onClick={onClose}>
      <div className="box" style={{ background: '#fff', width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h2>{listing.title}</h2>
        {list.length === 0 && <p className="meta">{t('noRev')}</p>}
        {list.map((r, k) => <div className="rev" key={k}><b>{r.name}</b> <Stars n={r.rating} /><br />{r.comment}</div>)}
        {localStorage.getItem('ut') ? (
          <form onSubmit={send} style={{ display: 'grid', gap: 10 }}>
            <label>{t('rate')}<select value={v.rating} onChange={(e) => setV({ ...v, rating: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></label>
            <label>{t('comment')}<textarea value={v.comment} onChange={(e) => setV({ ...v, comment: e.target.value })} /></label>
            <Msg m={msg} />
            <button className="btn pri" type="submit">{t('save')}</button>
          </form>
        ) : <p className="msg">{t('loginFirst')}</p>}
        <button className="btn" onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
}

function Account({ user, setUser }) {
  const [mode, setMode] = useState('login');
  const [v, setV] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [mine, setMine] = useState([]);
  useEffect(() => { if (user) api('/api/my/listings').then(setMine).catch(() => {}); }, [user]);
  const go = async (e) => {
    e.preventDefault();
    try {
      const r = await post(mode === 'login' ? '/api/login' : '/api/register', v);
      localStorage.setItem('ut', r.token); localStorage.setItem('un', r.name); setUser(r.name);
    } catch (x) { setMsg({ ok: false, t: x.message }); }
  };
  if (user) return (
    <>
      <h2>{user}</h2>
      <button className="btn" onClick={() => { localStorage.removeItem('ut'); localStorage.removeItem('un'); setUser(''); }}>{t('logout')}</button>
      <h3 style={{ margin: '20px 0 8px' }}>{t('mine')}</h3>
      <div className="scroll"><table><tbody>{mine.map((i) => <tr key={i.id}><td>{i.title}</td><td>{i.type}</td><td><span className="tag">{i.status}</span></td></tr>)}</tbody></table></div>
    </>
  );
  return (
    <form className="box" onSubmit={go}>
      <h2>{t(mode)}</h2>
      {mode === 'register' && <label>{t('name')}<input required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>}
      <label>{t('email')}<input type="email" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></label>
      <label>{t('pw')}<input type="password" required minLength={6} value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></label>
      <Msg m={msg} />
      <button className="btn pri" type="submit">{t(mode)}</button>
      <button className="btn" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{t(mode === 'login' ? 'newAcc' : 'haveAcc')}</button>
    </form>
  );
}

function Post({ user }) {
  const blank = { type: 'provider', title: '', category: CATS[0], state: STATES[0], city: '', description: '', price: '', phone: '', whatsapp: '', image: '' };
  const [v, setV] = useState(blank);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  if (!user) return <p className="msg">{t('loginFirst')}</p>;
  const send = async (e) => {
    e.preventDefault();
    try { await post('/api/listings', v); setMsg({ ok: true, t: t('sent') }); setV(blank); }
    catch (x) { setMsg({ ok: false, t: x.message }); }
  };
  return (
    <form className="box" onSubmit={send}>
      <h2>{t('post')}</h2>
      <label>{t('type')}<select value={v.type} onChange={set('type')}><option value="provider">{t('prov')}</option><option value="classified">{t('clas')}</option></select></label>
      <label>{t('title')}<input required value={v.title} onChange={set('title')} /></label>
      <label>{t('cat')}<select value={v.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label>{t('state')}<select value={v.state} onChange={set('state')}>{STATES.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label>{t('city')}<input value={v.city} onChange={set('city')} /></label>
      <label>{t('desc')}<textarea value={v.description} onChange={set('description')} /></label>
      <label>{t('price')}<input value={v.price} onChange={set('price')} /></label>
      <label>{t('photo')}<input type="file" accept="image/*" onChange={async (e) => e.target.files[0] && setV({ ...v, image: await toImg(e.target.files[0]) })} /></label>
      {v.image && <img className="thumb" src={v.image} alt="" />}
      <label>Phone<input required value={v.phone} onChange={set('phone')} placeholder="0123456789" /></label>
      <label>{t('wa')}<input value={v.whatsapp} onChange={set('whatsapp')} /></label>
      <Msg m={msg} />
      <button className="btn pri" type="submit">{t('submit')}</button>
    </form>
  );
}

function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('adm') || '');
  const [pw, setPw] = useState('');
  const [status, setStatus] = useState('pending');
  const [d, setD] = useState({ l: [], r: [], v: [] });
  const [err, setErr] = useState('');
  const load = async () => {
    try {
      setD({ l: await api('/api/admin/listings?status=' + status, {}, token), r: await api('/api/admin/requests', {}, token), v: await api('/api/admin/reviews', {}, token) });
      setErr('');
    } catch (e) { setErr(e.message); if (e.message === 'Unauthorized') { setToken(''); sessionStorage.removeItem('adm'); } }
  };
  useEffect(() => { if (token) load(); }, [token, status]);
  const login = async (e) => {
    e.preventDefault();
    try { await api('/api/admin/login', {}, pw); sessionStorage.setItem('adm', pw); setToken(pw); setErr(''); } catch { setErr('Wrong password.'); }
  };
  const act = async (path, method, body) => { await api(path, { method, body: body && JSON.stringify(body) }, token); load(); };
  if (!token) return (
    <form className="box" onSubmit={login}>
      <h2>Admin</h2>
      <label>{t('pw')}<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
      <Msg m={err && { t: err }} />
      <button className="btn pri" type="submit">{t('login')}</button>
    </form>
  );
  const del = (p) => confirm('Delete?') && act(p, 'DELETE');
  return (
    <>
      <div className="row" style={{ marginBottom: 12 }}>
        {['pending', 'approved', 'rejected'].map((s) => <button key={s} className={'btn' + (s === status ? ' pri' : '')} onClick={() => setStatus(s)}>{s}</button>)}
        <button className="btn" onClick={() => { sessionStorage.removeItem('adm'); setToken(''); }}>{t('logout')}</button>
      </div>
      <Msg m={err && { t: err }} />
      <h2>Listings ({status})</h2>
      <div className="scroll"><table><tbody>{d.l.map((i) => (
        <tr key={i.id}><td>{i.type}</td><td><b>{i.title}</b><br />{i.category}</td><td>{i.city}, {i.state}</td><td>{i.phone}</td>
          <td className="row">
            {status !== 'approved' && <button className="btn sm wa" onClick={() => act(`/api/admin/listings/${i.id}`, 'PATCH', { status: 'approved' })}>Approve</button>}
            {status !== 'rejected' && <button className="btn sm" onClick={() => act(`/api/admin/listings/${i.id}`, 'PATCH', { status: 'rejected' })}>Reject</button>}
            <button className="btn sm pri" onClick={() => del(`/api/admin/listings/${i.id}`)}>Delete</button>
          </td></tr>))}</tbody></table></div>
      <h2 style={{ marginTop: 24 }}>Requests</h2>
      <div className="scroll"><table><tbody>{d.r.map((r) => (
        <tr key={r.id}><td>#{r.listing_id}</td><td>{r.name}</td>
          <td><a href={wa(r.phone, `Hi ${r.name}`)} target="_blank" rel="noreferrer">{r.phone}</a></td><td>{r.message}</td>
          <td><button className="btn sm pri" onClick={() => del(`/api/admin/requests/${r.id}`)}>Delete</button></td></tr>))}</tbody></table></div>
      <h2 style={{ marginTop: 24 }}>{t('reviews')}</h2>
      <div className="scroll"><table><tbody>{d.v.map((r) => (
        <tr key={r.id}><td>#{r.listing_id}</td><td>{r.name}</td><td>{r.rating}★</td><td>{r.comment}</td>
          <td><button className="btn sm pri" onClick={() => del(`/api/admin/reviews/${r.id}`)}>Delete</button></td></tr>))}</tbody></table></div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('provider');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [user, setUser] = useState(localStorage.getItem('un') || '');
  T = L[lang];
  const tabs = [['provider', 'services'], ['classified', 'classifieds'], ['post', 'post'], ['account', 'account'], ['admin', 'admin']];
  return (
    <>
      <header className="top">
        <div className="wrap">
          <h1>Servis Kita</h1>
          <p>{t('tag')}</p>
          <nav className="tabs">
            {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(l)}</button>)}
            <button className="lang" onClick={() => { const n = lang === 'en' ? 'ms' : 'en'; localStorage.setItem('lang', n); setLang(n); }}>{lang === 'en' ? 'BM' : 'EN'}</button>
          </nav>
        </div>
      </header>
      <main>
        {tab === 'provider' && <Browse type="provider" />}
        {tab === 'classified' && <Browse type="classified" />}
        {tab === 'post' && <Post user={user} />}
        {tab === 'account' && <Account user={user} setUser={setUser} />}
        {tab === 'admin' && <Admin />}
      </main>
    </>
  );
}
