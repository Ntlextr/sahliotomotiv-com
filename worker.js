// Son güncelleme: 16.11.2026 09:55
// Şahlı Otomotiv — www.sahliotomotiv.com
// Tek dosya Worker: site + (ilerideki) ürün API'si. seraytekno-API'deki v2 mimarisinden uyarlandı.
// Adım 1 (CLAUDE.md Bölüm 4): tanıtım + iletişim sayfası + ürün grupları teaser — TAMAM.
// Adım 2: gerçek ürün/kategori verisi grup grup giriliyor (/urunlerimiz?grup=.. + /urun/<slug>).
// Henüz panel yok; veri bu dosyadaki INSERT'lerle değil, D1'e doğrudan yazılarak giriliyor.

const RENK = {
  lacivert: '#0A3F94',
  acikMavi: '#5BB8E8',
  koyu: '#0B1B3D',
  yaziMavi: '#2A8FD0',
};

// "Nazar jant" logosu — sade SVG, dosya sunmaya gerek kalmadan sayfaya gömülü.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 220" width="152" height="44" role="img" aria-label="Şahlı Otomotiv">
  <g transform="translate(110 110)">
    <circle r="90" fill="#0A3F94"/><circle r="66" fill="#FFFFFF"/><circle r="46" fill="#5BB8E8"/><circle r="24" fill="#0B1B3D"/>
    <g stroke="#0A3F94" stroke-width="6" stroke-linecap="round" opacity=".9">
      <line x1="0" y1="-26" x2="0" y2="-44"/><line x1="25" y1="8" x2="42" y2="14"/><line x1="-25" y1="8" x2="-42" y2="14"/>
      <line x1="15" y1="21" x2="26" y2="36"/><line x1="-15" y1="21" x2="-26" y2="36"/>
    </g>
    <circle cx="-8" cy="-9" r="7" fill="#FFFFFF" opacity=".9"/>
  </g>
  <text x="228" y="104" font-family="Arial,sans-serif" font-weight="900" font-size="84" fill="#0A3F94">ŞAHLI</text>
  <text x="232" y="160" font-family="Arial,sans-serif" font-weight="700" font-size="38" letter-spacing="12" fill="#2A8FD0">OTOMOTİV</text>
  <text x="232" y="194" font-family="Arial,sans-serif" font-weight="500" font-size="16" letter-spacing="4" fill="#5B6B80">ELEKTRİK · ELEKTRONİK · TEDARİK</text>
</svg>`;

const FAVICON_B64 = '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';

// Sitenin en üst bilgisi: D1'deki site_icerik tablosundan okunur.
// Tablo boşsa (ilk kurulum) buradaki varsayılanlar kullanılır.
const VARSAYILAN_ILETISIM = {
  unvan: 'Şahlı Otomotiv Elektrik Elektronik İthalat İhracat Sanayi ve Ticaret Limited Şirketi',
  telefon: '+90 532 408 29 99',
  whatsapp: '905324082999',
  adres: '19 Mayıs Mah. Yamaç Sk. Şeref Yazgan İş Merkezi No:1 İç Kapı No:8, Kadıköy/İstanbul',
  calisma_saatleri: 'Hafta içi 09:00–18:00',
};

// D1'den tek bir site_icerik anahtarını okur, yoksa varsayılanı döner.
async function icerikOku(env, anahtar, varsayilan) {
  try {
    const row = await env.DB.prepare('SELECT deger FROM site_icerik WHERE anahtar = ?').bind(anahtar).first();
    if (row && row.deger) return JSON.parse(row.deger);
  } catch (e) {
    // D1 bağlı değilse ya da satır yoksa sessizce varsayılana düş
  }
  return varsayilan;
}

// Her ürün grubunda kaç tane AKTİF ürün var — sayıyı ("Yakında" / "N ürün") belirlemek için.
async function grupUrunSayilari(env) {
  const sonuc = {};
  try {
    const { results } = await env.DB
      .prepare("SELECT grup, COUNT(*) AS n FROM products WHERE durum = 'aktif' GROUP BY grup")
      .all();
    for (const r of results || []) sonuc[r.grup] = r.n;
  } catch (e) {
    // tablo henüz boşsa hepsi 0 kalır
  }
  return sonuc;
}

// HTML'e yazılan her veritabanı metni bundan geçer (ürün adlarında " < & gibi işaretler olabiliyor).
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Bir gruptaki kategoriler: her biri için aktif ürün sayısı + kartta gösterilecek örnek bir resim.
async function kategoriSayilari(env, grup) {
  try {
    const { results } = await env.DB
      .prepare("SELECT category AS ad, COUNT(*) AS n, MAX(image_url) AS img FROM products WHERE grup = ? AND durum = 'aktif' GROUP BY category")
      .bind(grup).all();
    return (results || []).sort((a, b) => String(a.ad).localeCompare(String(b.ad), 'tr'));
  } catch (e) {
    return [];
  }
}

// Bir kategorinin alt kategorileri ve ürün sayıları (alt kategorisi olmayan ürünler sayılmaz).
async function altKategoriSayilari(env, grup, kat) {
  try {
    const { results } = await env.DB
      .prepare("SELECT alt_kategori AS ad, COUNT(*) AS n FROM products WHERE grup = ? AND category = ? AND durum = 'aktif' AND alt_kategori IS NOT NULL AND alt_kategori <> '' GROUP BY alt_kategori")
      .bind(grup, kat).all();
    return (results || []).sort((a, b) => String(a.ad).localeCompare(String(b.ad), 'tr'));
  } catch (e) {
    return [];
  }
}

const SAYFA_BOYU = 48;

// Ürün listesi: grup + (isteğe bağlı) kategori, alt kategori, arama kelimesi, sayfa.
// Sadece listede gereken sütunlar seçilir (fiyat vb. iç alan asla seçilmez).
async function urunListesi(env, { grup, kat, alt, q, s }) {
  const sayfa = s || 1;
  const kosul = ["grup = ?", "durum = 'aktif'"];
  const p = [grup];
  if (kat) { kosul.push('category = ?'); p.push(kat); }
  if (alt) { kosul.push('alt_kategori = ?'); p.push(alt); }
  if (q) {
    for (const kelime of q.split(/\s+/).filter(Boolean).slice(0, 5)) {
      kosul.push('(name LIKE ? OR marka LIKE ? OR alt_kategori LIKE ?)');
      const k = '%' + kelime + '%';
      p.push(k, k, k);
    }
  }
  const where = kosul.join(' AND ');
  try {
    const t = await env.DB.prepare(`SELECT COUNT(*) AS n FROM products WHERE ${where}`).bind(...p).first();
    const { results } = await env.DB
      .prepare(`SELECT name, slug, category, alt_kategori, marka, image_url FROM products WHERE ${where} ORDER BY alt_kategori, name LIMIT ${SAYFA_BOYU} OFFSET ${(sayfa - 1) * SAYFA_BOYU}`)
      .bind(...p).all();
    return { toplam: t ? t.n : 0, urunler: results || [] };
  } catch (e) {
    return { toplam: 0, urunler: [] };
  }
}

// Tek bir ürünü slug'ına göre getirir.
async function urunGetirSlug(env, slug) {
  try {
    // Açık sütun listesi: products'a ileride iç alan (fiyat vb.) eklense bile ürün sayfasına sızmaz.
    return await env.DB.prepare("SELECT name, slug, grup, category, alt_kategori, marka, tanitim, ozellikler, teknik, image_url FROM products WHERE slug = ? AND durum = 'aktif'").bind(slug).first();
  } catch (e) {
    return null;
  }
}

// Sayfanın ortak <head> ve üst/alt kısmı — her sayfa bunu kullanır.
function kabukAc(baslik, aciklama) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${baslik}</title>
<meta name="description" content="${aciklama}">
<link rel="icon" href="data:image/png;base64,${FAVICON_B64}">
<style>
  :root{
    --lacivert:${RENK.lacivert}; --acik-mavi:${RENK.acikMavi}; --koyu:${RENK.koyu}; --yazi-mavi:${RENK.yaziMavi};
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1a2233;background:#fff;line-height:1.5}
  header{background:var(--koyu);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;row-gap:10px}
  header img{height:40px;display:block}
  nav{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center}
  nav a{color:#fff;text-decoration:none;font-size:14px;opacity:.9;white-space:nowrap;padding:4px 0}
  nav a:hover{opacity:1}
  @media (max-width:420px){
    header{padding:12px 14px}
    header img{height:32px}
    nav{gap:3px 10px}
    nav a{font-size:12.5px}
  }
  .hero{background:linear-gradient(135deg,var(--koyu),var(--lacivert));color:#fff;padding:48px 20px;text-align:center}
  .hero h1{font-size:28px;margin:0 0 10px}
  .hero p{font-size:16px;opacity:.9;max-width:560px;margin:0 auto}
  main{max-width:900px;margin:0 auto;padding:28px 18px}
  h2{color:var(--lacivert);font-size:20px;border-bottom:2px solid var(--acik-mavi);padding-bottom:6px}
  .gruplar{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:18px 0}
  .grup-kart{border:1px solid #e3e8f0;border-radius:10px;padding:16px;background:#f8fafc}
  .grup-kart b{color:var(--lacivert);display:block;margin-bottom:6px;font-size:15px}
  .grup-kart span{font-size:13px;color:#51607a}
  .urun-gorsel{width:100%;aspect-ratio:4/3;border-radius:8px;object-fit:contain;background:#fff;margin-bottom:8px;display:block}
  .yol{font-size:13px;color:#51607a;margin:0 0 6px}
  .yol a{color:var(--yazi-mavi);text-decoration:none}
  .kat-kart{border:1px solid #e3e8f0;border-radius:10px;padding:12px;background:#f8fafc;text-decoration:none;color:inherit;display:block}
  .kat-kart b{color:var(--lacivert);display:block;font-size:15px}
  .kat-kart .say{font-size:13px;color:var(--yazi-mavi);font-weight:600}
  .ciplar{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
  .cip{border:1px solid #cfd9e8;border-radius:20px;padding:6px 12px;font-size:13px;text-decoration:none;color:var(--lacivert);background:#fff;white-space:nowrap}
  .cip.secili{background:var(--lacivert);color:#fff;border-color:var(--lacivert)}
  .cip small{opacity:.75}
  .ara{display:flex;gap:8px;margin:12px 0}
  .ara input{flex:1;min-width:0;padding:10px 12px;border:1px solid #cfd9e8;border-radius:8px;font-size:15px}
  .ara button{padding:10px 16px;border:0;border-radius:8px;background:var(--lacivert);color:#fff;font-size:15px}
  .urunler{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:14px 0}
  .urunler .grup-kart{padding:10px}
  .urunler .grup-kart b{font-size:13.5px;font-weight:600}
  .urunler .grup-kart span{font-size:12px}
  .sayfalar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:20px 0}
  .sayfalar a,.sayfalar span{padding:7px 12px;border:1px solid #cfd9e8;border-radius:6px;text-decoration:none;color:var(--lacivert);font-size:14px}
  .sayfalar span{background:var(--lacivert);color:#fff;border-color:var(--lacivert)}
  .urun-yer{width:100%;aspect-ratio:4/3;border-radius:8px;background:#eef2f8;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#8a97ad;font-size:12px;text-align:center;padding:6px}
  .urun-detay-gorsel{width:100%;max-width:360px;border-radius:10px;object-fit:cover;margin:10px 0}
  .iletisim-kutu{background:#f0f6ff;border-radius:12px;padding:20px;margin-top:10px}
  .iletisim-kutu div{margin:6px 0;font-size:15px}
  a.wa-btn{display:inline-block;margin-top:14px;background:#25D366;color:#fff;padding:12px 22px;border-radius:30px;text-decoration:none;font-weight:bold}
  footer{background:var(--koyu);color:#cdd9ea;text-align:center;padding:20px;font-size:13px;margin-top:30px}
  .yuzen-wa{position:fixed;right:18px;bottom:18px;background:#25D366;color:#fff;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)}
</style>
</head>
<body>
<header>
  <a href="/" style="display:flex">${LOGO_SVG}</a>
  <nav><a href="/">Ana Sayfa</a><a href="/urunlerimiz">Ürünlerimiz</a><a href="/#iletisim">İletişim</a></nav>
</header>`;
}

function kabukKapat(il) {
  const waMesaj = encodeURIComponent('Merhaba, Şahlı Otomotiv ürünleri hakkında bilgi almak istiyorum.');
  return `<a class="yuzen-wa" href="https://wa.me/${il.whatsapp}?text=${waMesaj}" target="_blank" rel="noopener">💬</a>
<footer>
  © ${new Date().getFullYear()} ${il.unvan}<br>
  Bu site bir tanıtım kataloğudur; fiyat ve stok bilgisi bağlayıcı teklif niteliği taşımaz.
</footer>
</body></html>`;
}

// 6 ürün grubu — nötr (müşteriye görünen) adlar. Gerçek tedarikçi adları (Direnç, Şinasi/MTA,
// Seray Tekno + Digimaksi, Mobass, Audiobus, Haksev) SADECE panelde/`grup` alanında iç referanstır,
// sitede hiçbir yerde yazılmaz.
const GRUPLAR = [
  { b: 'Direnc', ad: 'Elektrik ve Elektronik Komponentler', aciklama: 'Röle, klemens, konnektör, kablo, sigorta, buton ve izole malzemeler' },
  { b: 'Sinasi', ad: 'Araç Sigorta ve Elektrik Parçaları', aciklama: 'Her tip araç sigortası, röle, kablo seti, sigorta kutusu, müşür ve diyot' },
  { b: 'AracKamera', ad: 'Araç Kamera ve Kayıt Sistemleri', aciklama: 'Araç kamerası, güvenlik kamerası, kayıt cihazı ve araç monitörü' },
  { b: 'Mobass', ad: 'Oto Ses Sistemleri', aciklama: 'Amplifikatör, subwoofer, hoparlör, ses işlemcisi ve bağlantı kabloları' },
  { b: 'Audiobus', ad: 'Ticari Araç Elektroniği', aciklama: 'Kamera/monitör sistemleri, aydınlatma, ses ve güç çözümleri' },
  { b: 'Haksev', ad: 'Ambalaj ve Sevkiyat Malzemeleri', aciklama: 'Bant, streç film, karton, çemberleme ve plastik kasa ürünleri' },
];

// Ürün kartı/sayfasında görsel: image_url doluysa gerçek fotoğraf gösterilir;
// boşsa (Güven henüz kendi fotoğrafını eklemediyse) sade "Görsel hazırlanıyor" kutusu.
function urunGorselHtml(u, sinif) {
  if (u.image_url) return `<img class="${sinif}" src="${esc(u.image_url)}" alt="${esc(u.name)}" loading="lazy">`;
  return `<div class="${sinif === 'urun-detay-gorsel' ? 'urun-yer' : sinif}" style="${sinif === 'urun-detay-gorsel' ? 'max-width:360px' : ''}">Görsel hazırlanıyor</div>`;
}

// Ana sayfa: tanıtım + ürün grupları teaser + iletişim.
function anaSayfaHtml(il, sayilar) {
  const kartlar = GRUPLAR.map(g => {
    const n = sayilar[g.b] || 0;
    const durum = n > 0 ? `${n} ürün` : 'Yakında';
    const ic = `<b>${g.ad}</b><span>${g.aciklama}</span><div style="margin-top:8px;font-size:12px;color:var(--yazi-mavi)">${durum}</div>`;
    return n > 0
      ? `<a class="grup-kart" style="text-decoration:none;color:inherit;display:block" href="/urunlerimiz?grup=${encodeURIComponent(g.b)}">${ic}</a>`
      : `<div class="grup-kart">${ic}</div>`;
  }).join('');

  const harita = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(il.adres)}`;

  return kabukAc('Şahlı Otomotiv — Araç Elektrik ve Elektronik Tedariği', 'Araçların elektrik ve elektronik aksamları için toptan tedarik: sigorta, kablo, röle, araç kamerası, ses sistemi ve VIP araç donanımı.') + `
<section class="hero">
  <h1>Araçlarınızın Elektrik ve Elektroniğinde Güvenilir Tedarikçiniz</h1>
  <p>Sigortadan kabloya, araç kamerasından ses ve görüntü sistemlerine — özellikle VIP araç yapımında kullanılan elektrik-elektronik malzemeleri firmanıza tedarik ediyoruz.</p>
</section>
<main>
  <h2>Ürün Gruplarımız</h2>
  <div class="gruplar">${kartlar}</div>
  <p style="text-align:center"><a href="/urunlerimiz" style="color:var(--yazi-mavi);font-weight:bold">Tüm ürünlerimiz ›</a></p>

  <h2 id="iletisim">İletişim</h2>
  <div class="iletisim-kutu">
    <div><b>Firma:</b> ${il.unvan}</div>
    <div><b>Adres:</b> ${il.adres} — <a href="${harita}" target="_blank" rel="noopener">Haritada göster</a></div>
    <div><b>Telefon:</b> ${il.telefon}</div>
    <div><b>Çalışma saatleri:</b> ${il.calisma_saatleri}</div>
    <a class="wa-btn" href="https://wa.me/${il.whatsapp}" target="_blank" rel="noopener">WhatsApp'tan yazın</a>
  </div>
</main>` + kabukKapat(il);
}

// /urunlerimiz — grup seçilmemişse 6 grubun teaser listesi; bir grup seçilmişse
// (?grup=Haksev gibi) o grubun kategorilerine göre gruplanmış gerçek ürün listesi.
function urunlerimizHtml(il, sayilar) {
  const satirlar = GRUPLAR.map(g => {
    const n = sayilar[g.b] || 0;
    const ic = `<b>${g.ad}</b><span>${n > 0 ? n + ' ürün listelendi' : 'Ürün listesi hazırlanıyor'}</span>`;
    return n > 0
      ? `<a class="grup-kart" style="text-decoration:none;color:inherit;display:block" href="/urunlerimiz?grup=${encodeURIComponent(g.b)}">${ic}</a>`
      : `<div class="grup-kart">${ic}</div>`;
  }).join('');
  return kabukAc('Ürünlerimiz — Şahlı Otomotiv', 'Şahlı Otomotiv ürün grupları: araç elektrik-elektronik, sigorta, kamera, ses sistemleri ve ambalaj malzemeleri.') + `
<main>
  <h2>Ürünlerimiz</h2>
  <p>Kataloğumuz kategori kategori yayına alınıyor. Aradığınız ürünü bulamazsanız WhatsApp'tan sorabilirsiniz.</p>
  <div class="gruplar">${satirlar}</div>
</main>` + kabukKapat(il);
}

// /urunlerimiz adresi üretir (boş parametreler yazılmaz).
function listeAdres(o) {
  const p = new URLSearchParams();
  for (const k of ['grup', 'kat', 'alt', 'q']) if (o[k]) p.set(k, o[k]);
  if (o.s && o.s > 1) p.set('s', o.s);
  return '/urunlerimiz?' + p.toString();
}

// Ürün kartı (liste sayfalarında).
function urunKartHtml(u) {
  return `<a class="grup-kart" style="text-decoration:none;color:inherit;display:block" href="/urun/${encodeURIComponent(u.slug)}">${urunGorselHtml(u, 'urun-gorsel')}<b>${esc(u.name)}</b><span>${u.alt_kategori ? esc(u.alt_kategori) + ' · ' : ''}Teklif iste ›</span></a>`;
}

// Arama kutusu (bir grubun içinde arar).
function aramaHtml(grupKey, q) {
  return `<form class="ara" method="get" action="/urunlerimiz"><input type="hidden" name="grup" value="${esc(grupKey)}"><input type="search" name="q" value="${esc(q || '')}" placeholder="Bu grupta ürün ara (ör. 12V röle, 4 pin)"><button type="submit">Ara</button></form>`;
}

// Sayfa numaraları (48'er ürün).
function sayfalarHtml(o, toplam) {
  const son = Math.ceil(toplam / SAYFA_BOYU);
  if (son <= 1) return '';
  const s = o.s || 1;
  const parca = [];
  for (let i = 1; i <= son; i++) {
    if (i === 1 || i === son || Math.abs(i - s) <= 2) parca.push(i === s ? `<span>${i}</span>` : `<a href="${listeAdres({ ...o, s: i })}">${i}</a>`);
    else if (parca[parca.length - 1] !== '…') parca.push('…');
  }
  return `<div class="sayfalar">${parca.map(x => x === '…' ? '<b style="padding:7px 4px">…</b>' : x).join('')}</div>`;
}

// Bir grubun ana sayfası: kategori kartları (her birinde ürün sayısı), tıklanınca o kategori açılır.
function grupSayfasiHtml(il, grupKey, kategoriler) {
  const grup = GRUPLAR.find(g => g.b === grupKey);
  const baslik = grup ? grup.ad : 'Ürünlerimiz';
  const toplam = kategoriler.reduce((t, k) => t + k.n, 0);
  const kartlar = kategoriler.map(k =>
    `<a class="kat-kart" href="${listeAdres({ grup: grupKey, kat: k.ad })}">${k.img ? `<img class="urun-gorsel" src="${esc(k.img)}" alt="${esc(k.ad)}" loading="lazy">` : ''}<b>${esc(k.ad || 'Diğer')}</b><span class="say">${k.n} ürün ›</span></a>`
  ).join('');
  return kabukAc(`${baslik} — Şahlı Otomotiv`, `${baslik}: ${toplam} ürün, ${kategoriler.length} kategori. Şahlı Otomotiv tedarik kataloğu.`) + `
<main>
  <p class="yol"><a href="/urunlerimiz">Ürünlerimiz</a> › ${esc(baslik)}</p>
  <h1 style="color:var(--lacivert);font-size:22px;margin:4px 0">${esc(baslik)}</h1>
  <p style="color:#51607a;margin:0">${toplam} ürün · ${kategoriler.length} kategori</p>
  ${aramaHtml(grupKey, '')}
  ${kartlar ? `<div class="gruplar">${kartlar}</div>` : '<p>Bu grupta henüz yayınlanmış ürün yok.</p>'}
</main>` + kabukKapat(il);
}

// Kategori / alt kategori / arama sonucu sayfası: üstte alt kategori düğmeleri (sayılı), altta ürünler.
function listeSayfasiHtml(il, o, altlar, toplam, urunler) {
  const grup = GRUPLAR.find(g => g.b === o.grup);
  const grupAd = grup ? grup.ad : 'Ürünlerimiz';
  const katToplam = altlar.reduce((t, a) => t + a.n, 0);
  let ciplar = '';
  if (o.kat && altlar.length > 1) {
    ciplar = `<div class="ciplar"><a class="cip${!o.alt ? ' secili' : ''}" href="${listeAdres({ grup: o.grup, kat: o.kat })}">Tümü <small>${katToplam}</small></a>` +
      altlar.map(a => `<a class="cip${a.ad === o.alt ? ' secili' : ''}" href="${listeAdres({ grup: o.grup, kat: o.kat, alt: a.ad })}">${esc(a.ad)} <small>${a.n}</small></a>`).join('') + '</div>';
  }
  const baslik = o.q ? `"${o.q}" araması` : (o.alt || o.kat || grupAd);
  const yol = [`<a href="/urunlerimiz">Ürünlerimiz</a>`, `<a href="${listeAdres({ grup: o.grup })}">${esc(grupAd)}</a>`];
  if (o.kat) yol.push(o.alt ? `<a href="${listeAdres({ grup: o.grup, kat: o.kat })}">${esc(o.kat)}</a>` : esc(o.kat));
  if (o.alt) yol.push(esc(o.alt));
  const ilk = (((o.s || 1) - 1) * SAYFA_BOYU) + 1;
  const bilgi = toplam ? `${toplam} ürün${toplam > SAYFA_BOYU ? ` · ${ilk}–${Math.min(ilk + SAYFA_BOYU - 1, toplam)} arası gösteriliyor` : ''}` : 'Ürün bulunamadı.';
  return kabukAc(`${baslik} — ${grupAd} — Şahlı Otomotiv`, `${baslik}: ${toplam} ürün. Şahlı Otomotiv tedarik kataloğu, teklif için WhatsApp.`) + `
<main>
  <p class="yol">${yol.join(' › ')}</p>
  <h1 style="color:var(--lacivert);font-size:22px;margin:4px 0">${esc(baslik)}</h1>
  ${aramaHtml(o.grup, o.q)}
  ${ciplar}
  <p style="color:#51607a;margin:6px 0">${bilgi}</p>
  <div class="urunler">${urunler.map(urunKartHtml).join('')}</div>
  ${sayfalarHtml(o, toplam)}
  <p style="font-size:13px;color:#51607a">Aradığınızı bulamadınız mı? <a href="https://wa.me/${il.whatsapp}?text=${encodeURIComponent('Merhaba, aradığım ürün: ')}" target="_blank" rel="noopener" style="color:var(--yazi-mavi)">WhatsApp'tan yazın</a>, sizin için bulalım.</p>
</main>` + kabukKapat(il);
}

// Tek ürün sayfası: tanıtım + WhatsApp'tan teklif iste (firma adı/isim/adet formu olmadan,
// hazır mesajla; teklif_talep tablosuna yazan form sonraki sürümde eklenecek).
function urunSayfasiHtml(il, urun) {
  const waMesaj = encodeURIComponent(`Merhaba, "${urun.name}" ürünü için teklif almak istiyorum.`);

  // Teknik özellikler: products.teknik sütunu JSON {"Başlık": "Değer", ...} olarak tutulur.
  let teknikHtml = '';
  if (urun.teknik) {
    try {
      const t = JSON.parse(urun.teknik);
      const satirlar = Object.keys(t).map(k => `<tr><td style="padding:6px 10px;color:#51607a;border-bottom:1px solid #e3e8f0">${esc(k)}</td><td style="padding:6px 10px;font-weight:600;border-bottom:1px solid #e3e8f0">${esc(t[k])}</td></tr>`).join('');
      if (satirlar) teknikHtml = `<h3 style="font-size:15px;color:var(--lacivert);margin-top:18px">Teknik Özellikler</h3><table style="width:100%;border-collapse:collapse;font-size:14px">${satirlar}</table>`;
    } catch (e) { /* bozuk JSON ise sessizce atla */ }
  }

  // Özellikler: products.ozellikler sütunu JSON [{"baslik":"...","metin":"..."}] olarak tutulur.
  let ozellikHtml = '';
  if (urun.ozellikler) {
    try {
      const liste = JSON.parse(urun.ozellikler);
      const satirlar = (liste || []).map(o => `<li style="margin-bottom:6px"><b>${esc(o.baslik || '')}</b>${o.metin ? ': ' + esc(o.metin) : ''}</li>`).join('');
      if (satirlar) ozellikHtml = `<h3 style="font-size:15px;color:var(--lacivert);margin-top:18px">Öne Çıkan Özellikler</h3><ul style="padding-left:20px;font-size:14px">${satirlar}</ul>`;
    } catch (e) { /* bozuk JSON ise sessizce atla */ }
  }

  const grup = GRUPLAR.find(g => g.b === urun.grup);
  const yol = [`<a href="/urunlerimiz">Ürünlerimiz</a>`];
  if (grup) yol.push(`<a href="${listeAdres({ grup: grup.b })}">${esc(grup.ad)}</a>`);
  if (grup && urun.category) yol.push(`<a href="${listeAdres({ grup: grup.b, kat: urun.category })}">${esc(urun.category)}</a>`);
  if (grup && urun.category && urun.alt_kategori) yol.push(`<a href="${listeAdres({ grup: grup.b, kat: urun.category, alt: urun.alt_kategori })}">${esc(urun.alt_kategori)}</a>`);

  return kabukAc(`${esc(urun.name)} — Şahlı Otomotiv`, esc(urun.tanitim || urun.name)) + `
<main>
  <p class="yol">${yol.join(' › ')}</p>
  <h1 style="color:var(--lacivert);font-size:22px">${esc(urun.name)}</h1>
  ${urunGorselHtml(urun, 'urun-detay-gorsel')}
  <p>${esc(urun.tanitim || '')}</p>
  ${ozellikHtml}
  ${teknikHtml}
  <a class="wa-btn" href="https://wa.me/${il.whatsapp}?text=${waMesaj}" target="_blank" rel="noopener">WhatsApp'tan teklif iste</a>
  <p style="margin-top:18px;font-size:13px;color:#51607a">Fiyat ve stok bilgisi bağlayıcı teklif niteliği taşımaz; ürün sipariş üzerine tedarik edilir.</p>
</main>` + kabukKapat(il);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const yol = url.pathname;

    if (yol === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\nSitemap: https://www.sahliotomotiv.com/sitemap.xml\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    if (yol === '/sitemap.xml') {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://www.sahliotomotiv.com/</loc></url>\n<url><loc>https://www.sahliotomotiv.com/urunlerimiz</loc></url>\n</urlset>`;
      return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }

    const il = await icerikOku(env, 'iletisim', VARSAYILAN_ILETISIM);
    const sayilar = await grupUrunSayilari(env);

    if (yol === '/' || yol === '') {
      return new Response(anaSayfaHtml(il, sayilar), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (yol === '/urunlerimiz') {
      const sp = url.searchParams;
      const o = {
        grup: sp.get('grup') || '',
        kat: sp.get('kat') || '',
        alt: sp.get('alt') || '',
        q: (sp.get('q') || '').trim().slice(0, 60),
        s: Math.max(1, Math.min(500, parseInt(sp.get('s') || '1', 10) || 1)),
      };
      const html = { headers: { 'Content-Type': 'text/html; charset=utf-8' } };
      if (o.grup && !o.kat && !o.q) {
        // Grup ana sayfası: kategori kartları + sayılar
        return new Response(grupSayfasiHtml(il, o.grup, await kategoriSayilari(env, o.grup)), html);
      }
      if (o.grup) {
        // Kategori / alt kategori / arama: ürün listesi (sayfa sayfa)
        const [altlar, liste] = await Promise.all([
          o.kat ? altKategoriSayilari(env, o.grup, o.kat) : Promise.resolve([]),
          urunListesi(env, o),
        ]);
        return new Response(listeSayfasiHtml(il, o, altlar, liste.toplam, liste.urunler), html);
      }
      return new Response(urunlerimizHtml(il, sayilar), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (yol.startsWith('/urun/')) {
      const slug = yol.slice('/urun/'.length);
      const urun = await urunGetirSlug(env, slug);
      if (!urun) return new Response('Ürün bulunamadı', { status: 404 });
      return new Response(urunSayfasiHtml(il, urun), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Sayfa bulunamadı', { status: 404 });
  },
};
