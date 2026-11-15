// Son güncelleme: 16.11.2026 01:30
// Şahlı Otomotiv — www.sahliotomotiv.com
// Tek dosya Worker: site + (ilerideki) ürün API'si. seraytekno-API'deki v2 mimarisinden uyarlandı.
// Adım 1 (CLAUDE.md Bölüm 4): tanıtım + iletişim sayfası + ürün grupları teaser.
// Adım 2'de panel ve tam ürün kataloğu eklenecek.

const RENK = {
  lacivert: '#0A3F94',
  acikMavi: '#5BB8E8',
  koyu: '#0B1B3D',
  yaziMavi: '#2A8FD0',
};

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

// Sayfanın ortak <head> ve üst/alt kısmı — her sayfa bunu kullanır.
function kabukAc(baslik, aciklama) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${baslik}</title>
<meta name="description" content="${aciklama}">
<link rel="icon" href="/favicon.ico">
<style>
  :root{
    --lacivert:${RENK.lacivert}; --acik-mavi:${RENK.acikMavi}; --koyu:${RENK.koyu}; --yazi-mavi:${RENK.yaziMavi};
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1a2233;background:#fff;line-height:1.5}
  header{background:var(--koyu);padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
  header img{height:40px}
  nav a{color:#fff;text-decoration:none;margin-left:18px;font-size:14px;opacity:.9}
  nav a:hover{opacity:1}
  .hero{background:linear-gradient(135deg,var(--koyu),var(--lacivert));color:#fff;padding:48px 20px;text-align:center}
  .hero h1{font-size:28px;margin:0 0 10px}
  .hero p{font-size:16px;opacity:.9;max-width:560px;margin:0 auto}
  main{max-width:900px;margin:0 auto;padding:28px 18px}
  h2{color:var(--lacivert);font-size:20px;border-bottom:2px solid var(--acik-mavi);padding-bottom:6px}
  .gruplar{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:18px 0}
  .grup-kart{border:1px solid #e3e8f0;border-radius:10px;padding:16px;background:#f8fafc}
  .grup-kart b{color:var(--lacivert);display:block;margin-bottom:6px;font-size:15px}
  .grup-kart span{font-size:13px;color:#51607a}
  .iletisim-kutu{background:#f0f6ff;border-radius:12px;padding:20px;margin-top:10px}
  .iletisim-kutu div{margin:6px 0;font-size:15px}
  a.wa-btn{display:inline-block;margin-top:14px;background:#25D366;color:#fff;padding:12px 22px;border-radius:30px;text-decoration:none;font-weight:bold}
  footer{background:var(--koyu);color:#cdd9ea;text-align:center;padding:20px;font-size:13px;margin-top:30px}
  .yuzen-wa{position:fixed;right:18px;bottom:18px;background:#25D366;color:#fff;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)}
</style>
</head>
<body>
<header>
  <a href="/"><img src="/assets/logo.png" alt="Şahlı Otomotiv"></a>
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

// Ana sayfa: tanıtım + ürün grupları teaser + iletişim.
function anaSayfaHtml(il, sayilar) {
  const gruplar = [
    { b: 'Direnc', ad: 'Elektrik ve Elektronik Komponentler', aciklama: 'Röle, klemens, konnektör, kablo, sigorta, buton ve izole malzemeler' },
    { b: 'Sinasi', ad: 'Araç Sigorta ve Elektrik Parçaları', aciklama: 'Her tip araç sigortası, röle, kablo seti, sigorta kutusu, müşür ve diyot' },
    { b: 'AracKamera', ad: 'Araç Kamera ve Kayıt Sistemleri', aciklama: 'Araç kamerası, güvenlik kamerası, kayıt cihazı ve araç monitörü' },
    { b: 'Mobass', ad: 'Oto Ses Sistemleri', aciklama: 'Amplifikatör, subwoofer, hoparlör, ses işlemcisi ve bağlantı kabloları' },
    { b: 'Audiobus', ad: 'Ticari Araç Elektroniği', aciklama: 'Kamera/monitör sistemleri, aydınlatma, ses ve güç çözümleri' },
    { b: 'Haksev', ad: 'Ambalaj ve Sevkiyat Malzemeleri', aciklama: 'Bant, streç film, karton, çemberleme ve plastik kasa ürünleri' },
  ];
  const kartlar = gruplar.map(g => {
    const n = sayilar[g.b] || 0;
    const durum = n > 0 ? `${n} ürün` : 'Yakında';
    return `<div class="grup-kart"><b>${g.ad}</b><span>${g.aciklama}</span><div style="margin-top:8px;font-size:12px;color:var(--yazi-mavi)">${durum}</div></div>`;
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

// /urunlerimiz — seraytekno.com'daki Teknolojik Ürünler mantığının yalın hâli.
// Henüz ürün verisi girilmediği için her grup "Yakında" gösterir; panel kurulunca
// buraya gerçek ürün listesi (kategori süzgeci, ürün sayfası, teklif formu) eklenecek.
function urunlerimizHtml(il, sayilar) {
  const gruplar = [
    { b: 'Direnc', ad: 'Elektrik ve Elektronik Komponentler' },
    { b: 'Sinasi', ad: 'Araç Sigorta ve Elektrik Parçaları' },
    { b: 'AracKamera', ad: 'Araç Kamera ve Kayıt Sistemleri' },
    { b: 'Mobass', ad: 'Oto Ses Sistemleri' },
    { b: 'Audiobus', ad: 'Ticari Araç Elektroniği' },
    { b: 'Haksev', ad: 'Ambalaj ve Sevkiyat Malzemeleri' },
  ];
  const satirlar = gruplar.map(g => {
    const n = sayilar[g.b] || 0;
    return `<div class="grup-kart"><b>${g.ad}</b><span>${n > 0 ? n + ' ürün listelendi' : 'Ürün listesi hazırlanıyor'}</span></div>`;
  }).join('');
  return kabukAc('Ürünlerimiz — Şahlı Otomotiv', 'Şahlı Otomotiv ürün grupları: araç elektrik-elektronik, sigorta, kamera, ses sistemleri ve ambalaj malzemeleri.') + `
<main>
  <h2>Ürünlerimiz</h2>
  <p>Kataloğumuz kategori kategori yayına alınıyor. Aradığınız ürünü bulamazsanız WhatsApp'tan sorabilirsiniz.</p>
  <div class="gruplar">${satirlar}</div>
</main>` + kabukKapat(il);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const yol = url.pathname;

    // Statik dosyalar (logo, favicon) — ASSETS binding'ine bırakılır.
    if (yol.startsWith('/assets/') || yol === '/favicon.ico') {
      return env.ASSETS.fetch(request);
    }

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
      return new Response(urunlerimizHtml(il, sayilar), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Sayfa bulunamadı', { status: 404 });
  },
};
