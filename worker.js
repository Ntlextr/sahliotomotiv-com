// Son güncelleme: 16.11.2026 02:10
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

// Bir grubun bütün aktif ürünlerini (kategoriye göre sıralı) döner.
async function grupUrunleri(env, grup) {
  try {
    const { results } = await env.DB
      .prepare("SELECT id, name, slug, category, tanitim FROM products WHERE grup = ? AND durum = 'aktif' ORDER BY category, name")
      .bind(grup).all();
    return results || [];
  } catch (e) {
    return [];
  }
}

// Tek bir ürünü slug'ına göre getirir.
async function urunGetirSlug(env, slug) {
  try {
    return await env.DB.prepare("SELECT * FROM products WHERE slug = ? AND durum = 'aktif'").bind(slug).first();
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

// Tek bir grubun ürünlerini kategoriye göre gruplanmış kart listesi olarak gösterir.
function grupSayfasiHtml(il, grupKey, urunler) {
  const grup = GRUPLAR.find(g => g.b === grupKey);
  const baslik = grup ? grup.ad : 'Ürünlerimiz';
  const kategoriler = {};
  for (const u of urunler) {
    const k = u.category || 'Diğer';
    (kategoriler[k] = kategoriler[k] || []).push(u);
  }
  const blok = Object.keys(kategoriler).map(k => {
    const kartlar = kategoriler[k].map(u =>
      `<a class="grup-kart" style="text-decoration:none;color:inherit;display:block" href="/urun/${u.slug}"><b>${u.name}</b><span>Teklif için WhatsApp'tan sorun ›</span></a>`
    ).join('');
    return `<h2>${k}</h2><div class="gruplar">${kartlar}</div>`;
  }).join('');
  return kabukAc(`${baslik} — Şahlı Otomotiv`, `${baslik} kategorisinde Şahlı Otomotiv'in tedarik ettiği ürünler.`) + `
<main>
  <p><a href="/urunlerimiz" style="color:var(--yazi-mavi)">‹ Tüm ürün grupları</a></p>
  <h1 style="color:var(--lacivert);font-size:22px">${baslik}</h1>
  ${blok || '<p>Bu grupta henüz yayınlanmış ürün yok.</p>'}
</main>` + kabukKapat(il);
}

// Tek ürün sayfası: tanıtım + WhatsApp'tan teklif iste (firma adı/isim/adet formu olmadan,
// hazır mesajla; teklif_talep tablosuna yazan form sonraki sürümde eklenecek).
function urunSayfasiHtml(il, urun) {
  const waMesaj = encodeURIComponent(`Merhaba, "${urun.name}" ürünü için teklif almak istiyorum.`);
  return kabukAc(`${urun.name} — Şahlı Otomotiv`, urun.tanitim || urun.name) + `
<main>
  <p><a href="/urunlerimiz" style="color:var(--yazi-mavi)">‹ Tüm ürün grupları</a></p>
  <h1 style="color:var(--lacivert);font-size:22px">${urun.name}</h1>
  ${urun.category ? `<p style="color:#51607a;font-size:13px">${urun.category}</p>` : ''}
  <p>${urun.tanitim || ''}</p>
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
      const grupKey = url.searchParams.get('grup');
      if (grupKey) {
        const urunler = await grupUrunleri(env, grupKey);
        return new Response(grupSayfasiHtml(il, grupKey, urunler), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
