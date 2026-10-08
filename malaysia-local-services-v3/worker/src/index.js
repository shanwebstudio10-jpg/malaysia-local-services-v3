const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Token',
};
const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const clean = (v, n = 500) => String(v ?? '').trim().slice(0, n);
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const PAGE = 12;

async function hashPw(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, k, 256));
}
async function sign(data, secret) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
async function makeToken(uid, env) {
  const body = btoa(JSON.stringify({ uid, exp: Date.now() + 30 * 864e5 }));
  return body + '.' + (await sign(body, env.JWT_SECRET));
}
async function userId(req, env) {
  try {
    const [body, sig] = (req.headers.get('X-User-Token') || '').split('.');
    if (!body || sig !== (await sign(body, env.JWT_SECRET))) return null;
    const d = JSON.parse(atob(body));
    return d.exp > Date.now() ? d.uid : null;
  } catch { return null; }
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const u = new URL(req.url), p = u.pathname, m = req.method, db = env.DB;
    try {
      if ((p === '/api/register' || p === '/api/login') && !env.JWT_SECRET)
        return json({ error: 'Server setup incomplete: JWT_SECRET secret is missing.' }, 500);
      // ---------- Accounts ----------
      if (p === '/api/register' && m === 'POST') {
        const b = await req.json();
        const email = clean(b.email, 120).toLowerCase();
        if (!clean(b.name) || !email.includes('@') || String(b.password || '').length < 6)
          return json({ error: 'Name, valid email and a password of 6+ characters are required.' }, 400);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        try {
          const r = await db.prepare('INSERT INTO users (name,email,salt,hash) VALUES (?,?,?,?)')
            .bind(clean(b.name, 80), email, b64(salt), await hashPw(b.password, salt)).run();
          return json({ token: await makeToken(r.meta.last_row_id, env), name: clean(b.name, 80) }, 201);
        } catch { return json({ error: 'This email is already registered.' }, 409); }
      }
      if (p === '/api/login' && m === 'POST') {
        const b = await req.json();
        const row = await db.prepare('SELECT * FROM users WHERE email=?').bind(clean(b.email, 120).toLowerCase()).first();
        if (!row || row.hash !== (await hashPw(String(b.password || ''), unb64(row.salt))))
          return json({ error: 'Wrong email or password.' }, 401);
        return json({ token: await makeToken(row.id, env), name: row.name });
      }

      // ---------- Listings ----------
      if (p === '/api/listings' && m === 'GET') {
        let w = "WHERE status='approved'";
        const a = [], q = u.searchParams;
        for (const k of ['type', 'state', 'category']) if (q.get(k)) { w += ` AND ${k}=?`; a.push(q.get(k)); }
        if (q.get('q')) { w += ' AND (title LIKE ? OR description LIKE ?)'; a.push(`%${q.get('q')}%`, `%${q.get('q')}%`); }
        const total = (await db.prepare(`SELECT COUNT(*) c FROM listings ${w}`).bind(...a).first()).c;
        const page = Math.max(1, Number(q.get('page')) || 1);
        const items = (await db.prepare(
          `SELECT *, (SELECT ROUND(AVG(rating),1) FROM reviews WHERE listing_id=listings.id) avg,
                     (SELECT COUNT(*) FROM reviews WHERE listing_id=listings.id) reviews
           FROM listings ${w} ORDER BY id DESC LIMIT ${PAGE} OFFSET ${(page - 1) * PAGE}`
        ).bind(...a).all()).results;
        return json({ items, total, pages: Math.max(1, Math.ceil(total / PAGE)) });
      }
      if (p === '/api/listings' && m === 'POST') {
        const uid = await userId(req, env);
        if (!uid) return json({ error: 'Please log in first.' }, 401);
        const b = await req.json();
        if (!clean(b.title) || !clean(b.phone) || !['provider', 'classified'].includes(b.type))
          return json({ error: 'Title, phone and type are required.' }, 400);
        const img = String(b.image || '');
        if (img && (!img.startsWith('data:image/') || img.length > 400000)) return json({ error: 'Image too large.' }, 400);
        await db.prepare(
          'INSERT INTO listings (user_id,type,title,category,state,city,description,price,image,phone,whatsapp) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
        ).bind(uid, b.type, clean(b.title, 120), clean(b.category, 60), clean(b.state, 60), clean(b.city, 60),
          clean(b.description, 1000), clean(b.price, 60), img, clean(b.phone, 30), clean(b.whatsapp || b.phone, 30)).run();
        return json({ ok: true }, 201);
      }
      if (p === '/api/my/listings' && m === 'GET') {
        const uid = await userId(req, env);
        if (!uid) return json({ error: 'Please log in first.' }, 401);
        return json((await db.prepare('SELECT id,title,type,status,created_at FROM listings WHERE user_id=? ORDER BY id DESC').bind(uid).all()).results);
      }

      // ---------- Reviews ----------
      if (p === '/api/reviews' && m === 'GET')
        return json((await db.prepare('SELECT name,rating,comment,created_at FROM reviews WHERE listing_id=? ORDER BY id DESC LIMIT 50')
          .bind(Number(u.searchParams.get('listing_id'))).all()).results);
      if (p === '/api/reviews' && m === 'POST') {
        const uid = await userId(req, env);
        if (!uid) return json({ error: 'Please log in first.' }, 401);
        const b = await req.json(), rating = Number(b.rating);
        if (!(rating >= 1 && rating <= 5)) return json({ error: 'Rating must be 1 to 5.' }, 400);
        const usr = await db.prepare('SELECT name FROM users WHERE id=?').bind(uid).first();
        await db.prepare('INSERT OR REPLACE INTO reviews (listing_id,user_id,name,rating,comment) VALUES (?,?,?,?,?)')
          .bind(Number(b.listing_id), uid, usr.name, rating, clean(b.comment, 500)).run();
        return json({ ok: true }, 201);
      }

      // ---------- Service requests ----------
      if (p === '/api/requests' && m === 'POST') {
        const b = await req.json();
        if (!clean(b.name) || !clean(b.phone)) return json({ error: 'Name and phone are required.' }, 400);
        await db.prepare('INSERT INTO requests (listing_id,name,phone,message) VALUES (?,?,?,?)')
          .bind(Number(b.listing_id) || null, clean(b.name, 80), clean(b.phone, 30), clean(b.message, 1000)).run();
        return json({ ok: true }, 201);
      }

      // ---------- Admin ----------
      if (p.startsWith('/api/admin/')) {
        if (!env.ADMIN_PASSWORD || req.headers.get('Authorization') !== `Bearer ${env.ADMIN_PASSWORD}`)
          return json({ error: 'Unauthorized' }, 401);
        if (p === '/api/admin/login') return json({ ok: true });
        if (p === '/api/admin/listings' && m === 'GET') {
          const s = u.searchParams.get('status');
          const r = s
            ? await db.prepare('SELECT id,type,title,category,state,city,phone,status FROM listings WHERE status=? ORDER BY id DESC').bind(s).all()
            : await db.prepare('SELECT id,type,title,category,state,city,phone,status FROM listings ORDER BY id DESC').all();
          return json(r.results);
        }
        if (p === '/api/admin/requests' && m === 'GET')
          return json((await db.prepare('SELECT * FROM requests ORDER BY id DESC LIMIT 200').all()).results);
        if (p === '/api/admin/reviews' && m === 'GET')
          return json((await db.prepare('SELECT * FROM reviews ORDER BY id DESC LIMIT 200').all()).results);
        const mt = p.match(/^\/api\/admin\/(listings|requests|reviews)\/(\d+)$/);
        if (mt) {
          const [, table, id] = mt;
          if (m === 'DELETE') { await db.prepare(`DELETE FROM ${table} WHERE id=?`).bind(id).run(); return json({ ok: true }); }
          if (m === 'PATCH' && table === 'listings') {
            const { status } = await req.json();
            if (!['approved', 'rejected', 'pending'].includes(status)) return json({ error: 'Bad status' }, 400);
            await db.prepare('UPDATE listings SET status=? WHERE id=?').bind(status, id).run();
            return json({ ok: true });
          }
        }
      }
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: 'Server error' }, 500);
    }
  },
};
