// Son güncelleme: 16.11.2026 10:40
// Şahlı Otomotiv — yönetim paneli (/panel)
// Giriş: SADECE Şahlı Grup Panel'deki "🔑 Panele gir" düğmesiyle (imzalı, 2 dakikalık, tek kullanımlık bilet).
//   Bilet anahtarı: Worker Secret OTO_SAHLI_ANAHTAR (grup panelinde de aynı değer). Koda/repoya yazılmaz.
// Bölümler: Ürünler (hangi firmadan temin edilir, kaynak bağlantısı, alış fiyatı), Tedarik Firmaları
//   (site, üyelik/bayilik, yetkili, telefon, e-posta, kullanıcı adı, şifre), Kontroller (haftalık kontrol raporları).
// Tedarikçi şifreleri D1'de AES-GCM ile ŞİFRELİ durur (anahtar: Secret TEDARIK_ANAHTAR); panelde "Göster" ile açılır.

export const PANEL_SURUM = 'p1.0';

const enc = (s) => new TextEncoder().encode(String(s));
function b64u(bayt) { let s = ''; const a = new Uint8Array(bayt); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64uBayt(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const h = atob(s), a = new Uint8Array(h.length); for (let i = 0; i < h.length; i++) a[i] = h.charCodeAt(i); return a; }
function esit(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let f = 0; for (let i = 0; i < a.length; i++) f |= a.charCodeAt(i) ^ b.charCodeAt(i); return f === 0; }
async function sha256Hex(s) { const h = await crypto.subtle.digest('SHA-256', enc(s)); return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
async function hmac(anahtar, metin) { const k = await crypto.subtle.importKey('raw', enc(anahtar), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return b64u(await crypto.subtle.sign('HMAC', k, enc(metin))); }
const json = (v, d = 200) => new Response(JSON.stringify(v), { status: d, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const COOKIE = 'so_panel';

// Tabloları ilk istekte kurar (varsa dokunmaz).
let semaTamam = false;
async function semaHazirla(env) {
  if (semaTamam) return;
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS panel_oturum (ozet TEXT PRIMARY KEY, kadi TEXT, ad TEXT, rol TEXT, bitis INTEGER, ip TEXT)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS panel_bilet (n TEXT PRIMARY KEY, zaman INTEGER)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS panel_log (id INTEGER PRIMARY KEY AUTOINCREMENT, zaman TEXT DEFAULT CURRENT_TIMESTAMP, kadi TEXT, islem TEXT, ayrinti TEXT)'),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS tedarik_firmalari (id INTEGER PRIMARY KEY AUTOINCREMENT, kod TEXT UNIQUE NOT NULL, ad TEXT NOT NULL,
      site TEXT, giris_adresi TEXT, uyelik TEXT, yetkili TEXT, telefon TEXT, telefon2 TEXT, eposta TEXT, kullanici_adi TEXT, sifre_sifreli TEXT,
      notlar TEXT, aktif INTEGER DEFAULT 1, guncelleme TEXT)`),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS kontrol_rapor (id INTEGER PRIMARY KEY AUTOINCREMENT, zaman TEXT DEFAULT CURRENT_TIMESTAMP, kaynak TEXT, ozet TEXT, ayrinti TEXT)'),
  ]);
  semaTamam = true;
}

async function logYaz(env, k, islem, ayrinti) {
  try { await env.DB.prepare('INSERT INTO panel_log (kadi, islem, ayrinti) VALUES (?,?,?)').bind(k ? k.kadi : '-', islem, String(ayrinti || '').slice(0, 2000)).run(); } catch (e) {}
}

// ---- Tedarikçi şifresi: AES-GCM ----
async function sifreAnahtari(env) {
  if (!env.TEDARIK_ANAHTAR || String(env.TEDARIK_ANAHTAR).length < 32) throw new Error('Şifreleme anahtarı kurulmamış');
  const ham = await crypto.subtle.digest('SHA-256', enc(env.TEDARIK_ANAHTAR));
  return crypto.subtle.importKey('raw', ham, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function sifrele(env, duz) {
  if (!duz) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await sifreAnahtari(env), enc(duz));
  return 'v1:' + b64u(iv) + ':' + b64u(ct);
}
async function coz(env, kayit) {
  if (!kayit) return '';
  const [v, iv, ct] = String(kayit).split(':');
  if (v !== 'v1') return '';
  const d = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64uBayt(iv) }, await sifreAnahtari(env), b64uBayt(ct));
  return new TextDecoder().decode(d);
}

// ---- Oturum ----
function cerezOku(req) {
  const c = req.headers.get('Cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([A-Za-z0-9_-]+)'));
  return m ? m[1] : null;
}
async function kimlik(env, req) {
  const j = cerezOku(req); if (!j) return null;
  const o = await env.DB.prepare('SELECT kadi, ad, rol, bitis FROM panel_oturum WHERE ozet=?').bind(await sha256Hex(j)).first();
  if (!o || o.bitis < Date.now()) return null;
  return o;
}

// Site (worker.js) ürün sayfasında panel kullanıcısını tanımak için: çerez yoksa veritabanına hiç gitmez.
export async function panelKimlik(env, req) {
  if (!cerezOku(req)) return null;
  try { await semaHazirla(env); return await kimlik(env, req); } catch (e) { return null; }
}

// Grup panelinden gelen bileti doğrular. Biçim: base64url(JSON) + "." + HMAC
async function biletDogrula(env, bilet) {
  const anahtar = env.OTO_SAHLI_ANAHTAR;
  if (!anahtar || String(anahtar).length < 32) return { hata: 'Bağlantı anahtarı kurulmamış' };
  const [g, im] = String(bilet || '').split('.');
  if (!g || !im || g.length > 4000 || !esit(im, await hmac(anahtar, g))) return { hata: 'Bilet geçersiz' };
  let y; try { y = JSON.parse(new TextDecoder().decode(b64uBayt(g))); } catch (e) { return { hata: 'Bilet geçersiz' }; }
  if (y.t !== 'giris' || y.f !== 'oto') return { hata: 'Bilet bu panel için değil' };
  if (!y.z || y.z * 1000 < Date.now()) return { hata: 'Bilet süresi doldu, grup panelinden yeniden girin' };
  if (!y.n) return { hata: 'Bilet geçersiz' };
  const eski = await env.DB.prepare('SELECT n FROM panel_bilet WHERE n=?').bind(y.n).first();
  if (eski) return { hata: 'Bu bilet zaten kullanıldı' };
  await env.DB.batch([
    env.DB.prepare('INSERT INTO panel_bilet (n, zaman) VALUES (?,?)').bind(y.n, Date.now()),
    env.DB.prepare('DELETE FROM panel_bilet WHERE zaman < ?').bind(Date.now() - 86400000),
  ]);
  if (y.k === 'sahli-dev') return { kadi: 'serdar', ad: 'Serdar Çırak', rol: 'gelistirici' };
  if (y.k === 'sahli' && y.u) {
    const ad = { guven: 'Güven Şahlı', serdar: 'Serdar Çırak' }[String(y.u).toLowerCase()] || String(y.u);
    return { kadi: String(y.u).toLowerCase().slice(0, 40), ad, rol: 'yonetici' };
  }
  return { hata: 'Bilet geçersiz' };
}

function sayfa(baslik, govde, durum = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${baslik}</title>
<body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#0B1B3D;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:20px;text-align:center">
<div style="max-width:420px">${govde}</div></body>`, { status: durum, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
}
const GRUP_PANEL = 'https://grup.buyukdunya.com/';
const girisYok = () => sayfa('Şahlı Otomotiv Panel', `<h2>Şahlı Otomotiv Panel</h2><p style="opacity:.85">Panele <b>Şahlı Grup Panel</b> üzerinden girilir: Şahlı Otomotiv kartındaki <b>🔑 Panele gir</b> düğmesine basın.</p><p><a href="${GRUP_PANEL}" style="display:inline-block;background:#5BB8E8;color:#0B1B3D;padding:12px 22px;border-radius:30px;text-decoration:none;font-weight:bold">Şahlı Grup Panel'e git</a></p>`, 401);

const GRUP_ADLARI = { Direnc: 'Elektrik ve Elektronik Komponentler', Sinasi: 'Araç Sigorta ve Elektrik Parçaları', AracKamera: 'Kamera, Kayıt ve Güvenlik Sistemleri', Mobass: 'Oto Ses Sistemleri', Audiobus: 'Ticari Araç Elektroniği', Haksev: 'Ambalaj ve Sevkiyat Malzemeleri' };

// ---- Ana giriş noktası: worker.js /panel ile başlayan her isteği buraya yollar ----
export async function panelIsle(req, env, url) {
  await semaHazirla(env);
  const yol = url.pathname;
  const ip = req.headers.get('cf-connecting-ip') || '-';

  if (yol === '/panel/giris') {
    const y = await biletDogrula(env, url.searchParams.get('b'));
    if (y.hata) return sayfa('Giriş olmadı', `<h2>Giriş olmadı</h2><p>${y.hata}</p><p><a href="${GRUP_PANEL}" style="color:#5BB8E8">Şahlı Grup Panel'e dön</a></p>`, 403);
    const jeton = b64u(crypto.getRandomValues(new Uint8Array(32)));
    await env.DB.batch([
      env.DB.prepare('INSERT INTO panel_oturum (ozet, kadi, ad, rol, bitis, ip) VALUES (?,?,?,?,?,?)').bind(await sha256Hex(jeton), y.kadi, y.ad, y.rol, Date.now() + 12 * 3600000, ip),
      env.DB.prepare('DELETE FROM panel_oturum WHERE bitis < ?').bind(Date.now()),
    ]);
    await logYaz(env, y, 'giris', 'Grup panelinden girdi');
    return new Response(null, { status: 302, headers: { Location: '/panel', 'Cache-Control': 'no-store', 'Set-Cookie': `${COOKIE}=${jeton}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200` } });
  }

  const k = await kimlik(env, req);

  if (yol === '/panel' || yol === '/panel/') {
    if (!k) return girisYok();
    return new Response(PANEL_HTML.replace('{{SURUM}}', PANEL_SURUM), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  }

  if (!yol.startsWith('/panel/api/')) return new Response('Bulunamadı', { status: 404 });
  if (!k) return json({ hata: 'Oturum yok, grup panelinden yeniden girin' }, 401);
  if (req.method === 'POST') {
    const o = req.headers.get('Origin');
    if (!o || o !== url.origin || req.headers.get('X-Panel') !== '1') return json({ hata: 'İzin yok' }, 403);
  }
  const api = yol.slice('/panel/api/'.length);
  let g = {}; if (req.method === 'POST') { try { g = await req.json(); } catch (e) {} }

  try {
    if (api === 'ben') return json({ kadi: k.kadi, ad: k.ad, rol: k.rol, surum: PANEL_SURUM });

    if (api === 'cikis' && req.method === 'POST') {
      const j = cerezOku(req); if (j) await env.DB.prepare('DELETE FROM panel_oturum WHERE ozet=?').bind(await sha256Hex(j)).run();
      return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json', 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
    }

    // Özet: grup ve tedarikçi sayıları (süzgeçler için)
    if (api === 'ozet') {
      const [gr, td, tf] = await Promise.all([
        env.DB.prepare("SELECT grup, SUM(durum='aktif') aktif, COUNT(*) n FROM products GROUP BY grup").all(),
        env.DB.prepare("SELECT tedarikci kod, SUM(durum='aktif') aktif, COUNT(*) n FROM products GROUP BY tedarikci").all(),
        env.DB.prepare('SELECT kod, ad FROM tedarik_firmalari ORDER BY ad').all(),
      ]);
      return json({ gruplar: gr.results.map(r => ({ ...r, ad: GRUP_ADLARI[r.grup] || r.grup })), tedarikci: td.results, firmalar: tf.results });
    }

    // Ürün listesi (50'şer)
    if (api === 'urunler') {
      const sp = url.searchParams, kos = ['1=1'], p = [];
      if (sp.get('grup')) { kos.push('p.grup=?'); p.push(sp.get('grup')); }
      if (sp.get('ted')) { if (sp.get('ted') === '-') kos.push("(p.tedarikci IS NULL OR p.tedarikci='')"); else { kos.push('p.tedarikci=?'); p.push(sp.get('ted')); } }
      if (sp.get('durum')) { kos.push('p.durum=?'); p.push(sp.get('durum')); }
      if (sp.get('resim') === 'yok') kos.push("(p.image_url IS NULL OR p.image_url='')");
      let qq = String(sp.get('q') || '').trim();
      const lm = qq.match(/\/urun\/([^\s?#]+)/);
      if (lm) { kos.push('p.slug=?'); p.push(decodeURIComponent(lm[1])); qq = ''; }
      for (const w of qq.split(/\s+/).filter(Boolean).slice(0, 5)) {
        kos.push('(p.name LIKE ? OR p.stok_kodu LIKE ? OR p.tedarikci_adi LIKE ? OR p.category LIKE ? OR p.alt_kategori LIKE ?)'); const x = '%' + w + '%'; p.push(x, x, x, x, x);
      }
      const s = Math.max(1, parseInt(sp.get('s') || '1', 10) || 1), where = kos.join(' AND ');
      const t = await env.DB.prepare(`SELECT COUNT(*) n FROM products p WHERE ${where}`).bind(...p).first();
      const { results } = await env.DB.prepare(`SELECT p.id, p.name, p.slug, p.grup, p.category, p.alt_kategori, p.durum, p.image_url, p.tedarikci, p.tedarikci_adi, p.stok_kodu, p.kaynak_url, p.icerik_not,
          f.ad AS firma_ad, f.site AS firma_site, f.telefon AS firma_tel,
          (SELECT group_concat(x, ' · ') FROM (SELECT fiyat || ' ' || IFNULL(para_birimi,'') || ' — ' || kaynak || IFNULL(' (' || liste_tarihi || ')','') AS x FROM alis_fiyatlari a WHERE a.product_id=p.id ORDER BY liste_tarihi DESC LIMIT 3)) AS alis
        FROM products p LEFT JOIN tedarik_firmalari f ON f.kod=p.tedarikci WHERE ${where} ORDER BY p.grup, p.category, p.name LIMIT 50 OFFSET ${(s - 1) * 50}`).bind(...p).all();
      return json({ toplam: t.n, sayfa: s, urunler: results });
    }

    // Ürünü yayına al / yayından kaldır (silme yok)
    if (api === 'urun-durum' && req.method === 'POST') {
      const d = g.durum === 'aktif' ? 'aktif' : 'pasif';
      const u = await env.DB.prepare('SELECT name, durum FROM products WHERE id=?').bind(parseInt(g.id, 10)).first();
      if (!u) return json({ hata: 'Ürün yok' }, 404);
      await env.DB.prepare("UPDATE products SET durum=?, updated_at=datetime('now') WHERE id=?").bind(d, parseInt(g.id, 10)).run();
      await logYaz(env, k, 'urun-durum', `${u.name}: ${u.durum} → ${d}`);
      return json({ ok: true });
    }

    // Tedarik firmaları (şifre gönderilmez, sadece "var mı")
    if (api === 'tedarikciler') {
      const { results } = await env.DB.prepare(`SELECT f.id, f.kod, f.ad, f.site, f.giris_adresi, f.uyelik, f.yetkili, f.telefon, f.telefon2, f.eposta, f.kullanici_adi,
          (f.sifre_sifreli IS NOT NULL AND f.sifre_sifreli<>'') AS sifre_var, f.notlar, f.aktif, f.guncelleme,
          (SELECT COUNT(*) FROM products p WHERE p.tedarikci=f.kod AND p.durum='aktif') AS urun
        FROM tedarik_firmalari f ORDER BY f.aktif DESC, urun DESC, f.ad`).all();
      return json({ firmalar: results });
    }

    if (api === 'tedarikci-sifre' && req.method === 'POST') {
      const f = await env.DB.prepare('SELECT ad, sifre_sifreli FROM tedarik_firmalari WHERE id=?').bind(parseInt(g.id, 10)).first();
      if (!f) return json({ hata: 'Firma yok' }, 404);
      const s = await coz(env, f.sifre_sifreli);
      await logYaz(env, k, 'sifre-gor', f.ad + ' şifresi görüntülendi');
      return json({ sifre: s });
    }

    if (api === 'tedarikci-kaydet' && req.method === 'POST') {
      const al = (x, n = 300) => (x == null ? null : String(x).trim().slice(0, n) || null);
      const ad = al(g.ad, 120); if (!ad) return json({ hata: 'Firma adı boş olamaz' }, 400);
      const v = [ad, al(g.site), al(g.giris_adresi), al(g.uyelik), al(g.yetkili, 120), al(g.telefon, 40), al(g.telefon2, 40), al(g.eposta, 120), al(g.kullanici_adi, 120), al(g.notlar, 3000), g.aktif === false || g.aktif === 0 ? 0 : 1];
      let id = parseInt(g.id, 10) || 0;
      if (id) {
        await env.DB.prepare("UPDATE tedarik_firmalari SET ad=?, site=?, giris_adresi=?, uyelik=?, yetkili=?, telefon=?, telefon2=?, eposta=?, kullanici_adi=?, notlar=?, aktif=?, guncelleme=datetime('now') WHERE id=?").bind(...v, id).run();
      } else {
        let kod = al(g.kod, 30) || ad.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/[^A-Za-z0-9]+/g, '').slice(0, 20);
        if (!kod) kod = 'Firma' + Date.now();
        const r = await env.DB.prepare("INSERT INTO tedarik_firmalari (kod, ad, site, giris_adresi, uyelik, yetkili, telefon, telefon2, eposta, kullanici_adi, notlar, aktif, guncelleme) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))").bind(kod, ...v).run();
        id = r.meta.last_row_id;
      }
      // Şifre: alan gönderildiyse değiştir ("" gönderilirse siler); hiç gönderilmediyse dokunma
      if (g.sifre !== undefined) await env.DB.prepare('UPDATE tedarik_firmalari SET sifre_sifreli=? WHERE id=?').bind(await sifrele(env, String(g.sifre || '').slice(0, 300)), id).run();
      await logYaz(env, k, 'tedarikci-kaydet', ad + (g.sifre !== undefined ? ' (şifre değişti)' : ''));
      return json({ ok: true, id });
    }

    if (api === 'raporlar') {
      const { results } = await env.DB.prepare('SELECT id, zaman, kaynak, ozet, ayrinti FROM kontrol_rapor ORDER BY id DESC LIMIT 60').all();
      return json({ raporlar: results });
    }

    if (api === 'loglar') {
      const { results } = await env.DB.prepare('SELECT zaman, kadi, islem, ayrinti FROM panel_log ORDER BY id DESC LIMIT 200').all();
      return json({ loglar: results });
    }
  } catch (e) {
    return json({ hata: 'İşlem olmadı: ' + (e.message || e) }, 500);
  }
  return json({ hata: 'Bilinmeyen istek' }, 404);
}

// ---- Panel arayüzü (tek sayfa) ----
const PANEL_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Şahlı Otomotiv Panel</title>
<style>
:root{--koyu:#0B1B3D;--lac:#0A3F94;--mavi:#5BB8E8;--ym:#2A8FD0;--serit:88px;--ust:52px}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1a2233;background:#f3f6fa;font-size:15px}
#ust{position:fixed;top:0;left:0;right:0;height:var(--ust);background:var(--koyu);color:#fff;display:flex;align-items:center;gap:10px;padding:0 12px;z-index:20}
#ust b{font-size:16px}#ust small{opacity:.7}#ust .sag{margin-left:auto;display:flex;gap:8px;align-items:center}
#ust a,#ust button{color:#fff;background:rgba(255,255,255,.12);border:0;border-radius:8px;padding:7px 10px;font-size:13px;text-decoration:none;cursor:pointer}
#menu{position:fixed;top:var(--ust);bottom:0;left:0;width:var(--serit);background:#13284f;display:flex;flex-direction:column;z-index:15}
#menu a{color:#cfe0f5;text-decoration:none;text-align:center;padding:12px 4px;font-size:11.5px;border-left:3px solid transparent}
#menu a span{display:block;font-size:22px;margin-bottom:3px}#menu a.sec{background:#1d3a6e;color:#fff;border-left-color:var(--mavi)}
main{margin-left:var(--serit);padding:calc(var(--ust) + 14px) 14px 40px}
h1{font-size:20px;color:var(--lac);margin:0 0 10px}
.suz{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.suz input,.suz select{padding:9px 10px;border:1px solid #cfd9e8;border-radius:8px;font-size:14px;background:#fff;min-width:0}
.suz input{flex:1 1 220px}
.kart{background:#fff;border:1px solid #e1e8f2;border-radius:10px;padding:12px;margin-bottom:10px}
.ur{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:start}
.ur img,.ur .yok{width:64px;height:64px;object-fit:contain;border-radius:6px;background:#f3f6fa;display:flex;align-items:center;justify-content:center;font-size:10px;color:#8a97ad;text-align:center}
.ur b{color:var(--lac);font-size:14.5px}.ur .alt{font-size:12.5px;color:#51607a;margin-top:2px}
.etk{display:inline-block;font-size:12px;border-radius:12px;padding:2px 8px;margin:4px 4px 0 0;background:#eef3fb;color:#24406f}
.etk.ted{background:#fff4dc;color:#7a5200}.etk.alis{background:#e7f7ec;color:#18602f}.etk.pasif{background:#fde8e8;color:#9b1c1c}
.btn{border:0;border-radius:8px;padding:8px 12px;font-size:13.5px;cursor:pointer;background:var(--lac);color:#fff;text-decoration:none;display:inline-block}
.btn.ik{background:#eef3fb;color:var(--lac)}.btn.kr{background:#fde8e8;color:#9b1c1c}
.satir{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.fr h3{margin:0;color:var(--lac);font-size:17px}.fr .alan{display:grid;grid-template-columns:130px 1fr;gap:4px 10px;font-size:14px;margin-top:8px}
.fr .alan span:nth-child(odd){color:#51607a}.fr code{background:#f3f6fa;padding:2px 6px;border-radius:5px;font-size:13.5px;word-break:break-all}
.say{color:#51607a;font-size:13px;margin:6px 0}
.sayfalar{display:flex;gap:6px;justify-content:center;margin:14px 0}
dialog{border:0;border-radius:12px;padding:0;width:min(560px,calc(100vw - var(--serit) - 20px));margin-left:calc(var(--serit) + 10px)}
dialog form{padding:16px}dialog label{display:block;font-size:13px;color:#51607a;margin-top:10px}
dialog input,dialog textarea{width:100%;padding:9px;border:1px solid #cfd9e8;border-radius:8px;font-size:15px;font-family:inherit}
dialog textarea{min-height:80px}
.rap pre{white-space:pre-wrap;font-size:12.5px;background:#f3f6fa;padding:10px;border-radius:8px;max-height:420px;overflow:auto}
.bos{color:#51607a;padding:20px;text-align:center}
@media (max-width:600px){:root{--serit:76px}#ust small{display:none}.fr .alan{grid-template-columns:1fr}.fr .alan span:nth-child(odd){margin-top:6px}}
</style></head><body>
<div id="ust"><b>Şahlı Otomotiv Panel</b><small>{{SURUM}}</small><div class="sag"><span id="kim" style="font-size:13px;opacity:.85"></span><a href="/" target="_blank">🌐 Site</a><button id="cik">Çıkış</button></div></div>
<nav id="menu">
<a href="#urunler" data-b="urunler"><span>📦</span>Ürünler</a>
<a href="#tedarikciler" data-b="tedarikciler"><span>🏭</span>Tedarik Firmaları</a>
<a href="#kontroller" data-b="kontroller"><span>🔎</span>Kontroller</a>
<a href="#loglar" data-b="loglar"><span>📜</span>Kayıtlar</a>
</nav>
<main id="icerik"></main>
<dialog id="pen"></dialog>
<script>
const $=s=>document.querySelector(s);
const ka=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(y,g){const o=g?{method:'POST',headers:{'Content-Type':'application/json','X-Panel':'1'},body:JSON.stringify(g)}:{};const r=await fetch('/panel/api/'+y,o);const j=await r.json().catch(()=>({hata:'Sunucu cevap vermedi'}));if(r.status===401){location.reload();}if(j.hata)throw new Error(j.hata);return j;}
let OZ=null,FIRMALAR=[];
const GRUPLAR={Direnc:'Elektrik-Elektronik Komponent',Sinasi:'Araç Sigorta-Elektrik',AracKamera:'Kamera-Güvenlik',Mobass:'Oto Ses',Audiobus:'Ticari Araç Elektroniği',Haksev:'Ambalaj-Sevkiyat'};
const U={q:'',grup:'',ted:'',durum:'',resim:'',s:1};

function menuSec(b){document.querySelectorAll('#menu a').forEach(a=>a.classList.toggle('sec',a.dataset.b===b));}
async function git(){const b=(location.hash||'#urunler').slice(1).split('?')[0];menuSec(b);$('#pen').open&&$('#pen').close();
 try{if(b==='tedarikciler')await tedarikciler();else if(b==='kontroller')await kontroller();else if(b==='loglar')await loglar();else{const q=new URLSearchParams((location.hash.split('?')[1])||'');if(q.get('ted')!==null){U.ted=q.get('ted');U.s=1;}if(q.get('q')!==null){U.q=q.get('q');U.ted='';U.grup='';U.durum='';U.resim='';U.s=1;}await urunler();}}
 catch(e){$('#icerik').innerHTML='<div class="kart bos">'+ka(e.message)+'</div>';}}
window.addEventListener('hashchange',git);

async function urunler(){
 if(!OZ){OZ=await api('ozet');}
 const ted=[...new Set([...OZ.firmalar.map(f=>f.kod),...OZ.tedarikci.map(t=>t.kod).filter(Boolean)])];
 const fAd=k=>{const f=OZ.firmalar.find(x=>x.kod===k);return f?f.ad:k;};
 $('#icerik').innerHTML='<h1>Ürünler</h1><div class="suz"><input id="q" placeholder="Ad, kod ara ya da WhatsApp'taki ürün linkini yapıştır" value="'+ka(U.q)+'">'+
  '<select id="grup"><option value="">Bütün gruplar</option>'+OZ.gruplar.map(g=>'<option value="'+ka(g.grup)+'"'+(U.grup===g.grup?' selected':'')+'>'+ka(GRUPLAR[g.grup]||g.grup)+' ('+g.aktif+')</option>').join('')+'</select>'+
  '<select id="ted"><option value="">Bütün tedarikçiler</option>'+ted.map(k=>{const t=OZ.tedarikci.find(x=>x.kod===k);return '<option value="'+ka(k)+'"'+(U.ted===k?' selected':'')+'>'+ka(fAd(k))+(t?' ('+t.aktif+')':'')+'</option>';}).join('')+'<option value="-"'+(U.ted==='-'?' selected':'')+'>— Tedarikçisi belli değil</option></select>'+
  '<select id="durum"><option value="">Yayında + değil</option><option value="aktif"'+(U.durum==='aktif'?' selected':'')+'>Yayında</option><option value="pasif"'+(U.durum==='pasif'?' selected':'')+'>Yayında değil</option></select>'+
  '<select id="resim"><option value="">Resimli + resimsiz</option><option value="yok"'+(U.resim==='yok'?' selected':'')+'>Resmi olmayanlar</option></select></div><div id="liste"><div class="bos">Yükleniyor…</div></div>';
 let zz;$('#q').oninput=e=>{clearTimeout(zz);zz=setTimeout(()=>{U.q=e.target.value;U.s=1;liste();},350);};
 ['grup','ted','durum','resim'].forEach(id=>$('#'+id).onchange=e=>{U[id]=e.target.value;U.s=1;liste();});
 await liste();
}
async function liste(){
 const p=new URLSearchParams();for(const k of ['q','grup','ted','durum','resim'])if(U[k])p.set(k,U[k]);p.set('s',U.s);
 const d=await api('urunler?'+p);
 const son=Math.ceil(d.toplam/50);
 $('#liste').innerHTML='<div class="say">'+d.toplam+' ürün'+(son>1?' · sayfa '+d.sayfa+' / '+son:'')+'</div>'+(d.urunler.map(u=>{
  const kaynak=u.kaynak_url||((u.icerik_not||'').match(/https?:\\/\\/\\S+/)||[''])[0]||((u.icerik_not||'').match(/kaynak: (\\S+)/)||['',''])[1];
  const kLink=kaynak?(kaynak.startsWith('http')?kaynak:'https://'+kaynak):'';
  return '<div class="kart ur">'+(u.image_url?'<img src="'+ka(u.image_url)+'" loading="lazy" referrerpolicy="no-referrer">':'<div class="yok">resim yok</div>')+
  '<div><b>'+ka(u.name)+'</b><div class="alt">'+ka(GRUPLAR[u.grup]||u.grup)+' › '+ka(u.category||'')+(u.alt_kategori?' › '+ka(u.alt_kategori):'')+'</div>'+
  '<span class="etk ted">🏭 '+ka(u.firma_ad||u.tedarikci||'Tedarikçi belli değil')+'</span>'+
  (u.stok_kodu?'<span class="etk">Kod: '+ka(u.stok_kodu)+'</span>':'')+
  (u.tedarikci_adi&&u.tedarikci_adi!==u.name?'<span class="etk">Tedarikçideki adı: '+ka(u.tedarikci_adi)+'</span>':'')+
  (u.alis?'<div class="etk alis" style="display:block;border-radius:8px">💰 '+ka(u.alis)+'</div>':'')+
  (u.durum!=='aktif'?'<span class="etk pasif">Yayında değil</span>':'')+
  '<div class="satir">'+(kLink?'<a class="btn ik" href="'+ka(kLink)+'" target="_blank" rel="noopener noreferrer">Tedarikçide aç / fiyat ↗</a>':'')+
  (u.firma_site?'<a class="btn ik" href="'+ka(u.firma_site)+'" target="_blank" rel="noopener noreferrer">Firma sitesi ↗</a>':'')+
  (u.firma_tel?'<a class="btn ik" href="tel:'+ka(u.firma_tel.replace(/\\s/g,''))+'">📞 Ara</a>':'')+
  (u.durum==='aktif'?'<a class="btn ik" href="/urun/'+encodeURIComponent(u.slug)+'" target="_blank">Sitede gör</a>':'')+
  '<button class="btn '+(u.durum==='aktif'?'kr':'')+'" data-d="'+u.id+'" data-v="'+(u.durum==='aktif'?'pasif':'aktif')+'">'+(u.durum==='aktif'?'Yayından kaldır':'Yayına al')+'</button></div></div></div>';}).join('')||'<div class="kart bos">Ürün bulunamadı</div>')+
  (son>1?'<div class="sayfalar">'+(U.s>1?'<button class="btn ik" id="geri">‹ Önceki</button>':'')+(U.s<son?'<button class="btn ik" id="ileri">Sonraki ›</button>':'')+'</div>':'');
 const g=$('#geri'),i=$('#ileri');if(g)g.onclick=()=>{U.s--;liste();scrollTo(0,0);};if(i)i.onclick=()=>{U.s++;liste();scrollTo(0,0);};
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(b.dataset.v==='pasif'&&!confirmAc('Bu ürün sitede görünmeyecek. Emin misiniz?'))return;try{await api('urun-durum',{id:b.dataset.d,durum:b.dataset.v});OZ=null;liste();}catch(e){alert(e.message);}});
}
function confirmAc(m){return window.confirm(m);}

async function tedarikciler(){
 const d=await api('tedarikciler');FIRMALAR=d.firmalar;
 $('#icerik').innerHTML='<h1>Tedarik Firmaları</h1><div class="satir" style="margin:0 0 12px"><button class="btn" id="yeni">＋ Yeni tedarikçi</button></div>'+
 (d.firmalar.map(f=>'<div class="kart fr"><h3>'+ka(f.ad)+(f.aktif?'':' <span class="etk pasif">Kullanılmıyor</span>')+'</h3>'+
  '<div class="alan">'+
  '<span>Site</span><span>'+(f.site?'<a href="'+ka(f.site)+'" target="_blank" rel="noopener noreferrer">'+ka(f.site)+'</a>':'—')+'</span>'+
  '<span>Giriş sayfası</span><span>'+(f.giris_adresi?'<a href="'+ka(f.giris_adresi)+'" target="_blank" rel="noopener noreferrer">'+ka(f.giris_adresi)+'</a>':'—')+'</span>'+
  '<span>Üyelik / bayilik</span><span>'+ka(f.uyelik||'—')+'</span>'+
  '<span>Yetkili</span><span>'+ka(f.yetkili||'—')+'</span>'+
  '<span>Telefon</span><span>'+(f.telefon?'<a href="tel:'+ka(f.telefon.replace(/\\s/g,''))+'">'+ka(f.telefon)+'</a> · <a href="https://wa.me/'+ka(f.telefon.replace(/\\D/g,'').replace(/^0/,'90'))+'" target="_blank">WhatsApp</a>':'—')+(f.telefon2?'<br><a href="tel:'+ka(f.telefon2.replace(/\\s/g,''))+'">'+ka(f.telefon2)+'</a>':'')+'</span>'+
  '<span>E-posta</span><span>'+(f.eposta?'<a href="mailto:'+ka(f.eposta)+'">'+ka(f.eposta)+'</a>':'—')+'</span>'+
  '<span>Kullanıcı adı</span><span>'+(f.kullanici_adi?'<code>'+ka(f.kullanici_adi)+'</code> <button class="btn ik" data-kop="'+ka(f.kullanici_adi)+'">Kopyala</button>':'—')+'</span>'+
  '<span>Şifre</span><span id="s'+f.id+'">'+(f.sifre_var?'<code>••••••••</code> <button class="btn ik" data-sg="'+f.id+'">Göster</button>':'—')+'</span>'+
  '<span>Sitedeki ürün</span><span><a href="#urunler?ted='+encodeURIComponent(f.kod)+'">'+f.urun+' ürün ›</a></span>'+
  (f.notlar?'<span>Notlar</span><span style="white-space:pre-wrap">'+ka(f.notlar)+'</span>':'')+
  '</div><div class="satir"><button class="btn ik" data-dz="'+f.id+'">✏️ Düzenle</button></div></div>').join('')||'<div class="kart bos">Henüz tedarikçi yok</div>');
 $('#yeni').onclick=()=>form({});
 document.querySelectorAll('[data-dz]').forEach(b=>b.onclick=()=>form(FIRMALAR.find(f=>f.id==b.dataset.dz)));
 document.querySelectorAll('[data-kop]').forEach(b=>b.onclick=()=>kopyala(b.dataset.kop,b));
 document.querySelectorAll('[data-sg]').forEach(b=>b.onclick=async()=>{try{const r=await api('tedarikci-sifre',{id:b.dataset.sg});const y=$('#s'+b.dataset.sg);y.innerHTML='<code>'+ka(r.sifre)+'</code> <button class="btn ik">Kopyala</button>';y.querySelector('button').onclick=e=>kopyala(r.sifre,e.target);}catch(e){alert(e.message);}});
}
function kopyala(m,b){navigator.clipboard.writeText(m).then(()=>{const t=b.textContent;b.textContent='Kopyalandı ✓';setTimeout(()=>b.textContent=t,1500);});}
function form(f){
 const p=$('#pen'),A=[['ad','Firma adı *'],['site','Web sitesi'],['giris_adresi','Bayi / üye giriş sayfası adresi'],['uyelik','Üyelik / bayilik durumu (ör. bayi, toptan üye, iskonto %)'],['yetkili','Yetkili kişi'],['telefon','Telefon'],['telefon2','İkinci telefon'],['eposta','E-posta'],['kullanici_adi','Kullanıcı adı (siteye giriş)']];
 p.innerHTML='<form method="dialog"><h3 style="margin:0;color:#0A3F94">'+(f.id?'Tedarikçiyi düzenle':'Yeni tedarikçi')+'</h3>'+
  A.map(([k,l])=>'<label>'+l+'<input name="'+k+'" value="'+ka(f[k]||'')+'"></label>').join('')+
  '<label>Şifre (siteye giriş) '+(f.sifre_var?'<small>— kayıtlı; değiştirmek için yazın, silmek için "sil" yazın</small>':'')+'<input name="sifre" autocomplete="off" placeholder="'+(f.sifre_var?'değişmeyecekse boş bırakın':'')+'"></label>'+
  '<label>Notlar (sipariş nasıl verilir, kargo, ödeme vb.)<textarea name="notlar">'+ka(f.notlar||'')+'</textarea></label>'+
  '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="aktif" style="width:auto"'+(f.aktif===0?'':' checked')+'> Kullanılıyor</label>'+
  '<div class="satir" style="margin-top:14px"><button class="btn" value="kaydet">Kaydet</button><button class="btn ik" value="vazgec" formnovalidate>Vazgeç</button></div><div id="fh" style="color:#9b1c1c;margin-top:8px"></div></form>';
 p.querySelector('form').onsubmit=async e=>{if(e.submitter&&e.submitter.value==='vazgec')return;e.preventDefault();
  const fd=new FormData(e.target),g={id:f.id||0,aktif:fd.get('aktif')?1:0};A.forEach(([k])=>g[k]=fd.get(k));g.notlar=fd.get('notlar');
  const s=fd.get('sifre');if(s){g.sifre=s.trim().toLowerCase()==='sil'?'':s;}
  try{await api('tedarikci-kaydet',g);p.close();OZ=null;tedarikciler();}catch(er){$('#fh').textContent=er.message;}};
 p.show();
}

async function kontroller(){
 const d=await api('raporlar');
 $('#icerik').innerHTML='<h1>Kontroller</h1><p class="say">Haftalık otomatik kontrolün sonuçları: tedarikçi sitelerinde yeni çıkan, kalkan, stoğu biten ürünler ve kırık resimler.</p>'+
 (d.raporlar.map(r=>'<details class="kart rap"><summary><b>'+ka(r.zaman)+'</b> · '+ka(r.kaynak||'')+'<div style="margin-top:4px">'+ka(r.ozet||'')+'</div></summary>'+(r.ayrinti?'<pre>'+ka(r.ayrinti)+'</pre>':'')+'</details>').join('')||'<div class="kart bos">Henüz kontrol yapılmadı. İlk otomatik kontrol pazartesi sabahı çalışacak.</div>');
}
async function loglar(){
 const d=await api('loglar');
 $('#icerik').innerHTML='<h1>Kayıtlar</h1><p class="say">Panelde kim, ne zaman, ne yaptı (şifre görüntülemeleri dahil).</p>'+
 (d.loglar.map(l=>'<div class="kart" style="padding:8px 12px"><b>'+ka(l.zaman)+'</b> · '+ka(l.kadi)+' · '+ka(l.islem)+'<div class="say" style="margin:2px 0 0">'+ka(l.ayrinti)+'</div></div>').join('')||'<div class="kart bos">Kayıt yok</div>');
}
$('#cik').onclick=async()=>{try{await api('cikis',{});}catch(e){}location.href='https://grup.buyukdunya.com/';};
api('ben').then(b=>{$('#kim').textContent=b.ad;}).catch(()=>{});
git();
</script></body></html>`;
