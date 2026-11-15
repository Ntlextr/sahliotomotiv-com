# ŞAHLI OTOMOTİV — Proje Referans Dosyası

**Oluşturma: 15.11.2026** · Geliştirici: Seray Tekno Yazılım (Serdar Çırak)

> Serdar Türkçe konuşur, programcı değildir, telefondan çalışır. Kısa, sade anlat; işe başlamadan ne yapacağını söyle, onay al.
> **Sohbet başında OKU:** `Ntlextr/seraytekno-API` reposundaki **`ORTAK_NOTLAR.md`** (projeler arası ortak bilgiler) ve **`PANEL_REHBERI.md`** (Seray Tekno panellerinin ortak kuralları).
> ⚠️ **Bu repo PUBLIC.** Şifre, anahtar, IBAN, müşteri bilgisi, alış fiyatı, tedarikçi fiyat listesi BURAYA YAZILMAZ / KONMAZ.

## 1. İşletme
- **Sahibi:** Güven Şahlı (Serdar'ın yeğeni). Aynı kişinin diğer işleri: Luxury Beauty Center (güzellik salonu), Şahlı Harası – BÜYÜKDÜNYA (buyukdunya.com). Hepsi **Şahlı Grup Panel**'de (grup.buyukdunya.com) toplanır — Şahlı Otomotiv kartı şimdilik "Yakında".
- **Ne iş yapar (Güven, 15.11.2026):** araçların elektrik ve elektronik aksamlarını satar — sigortadan kabloya, araç kamerasından ses ve görüntü sistemine kadar. Özellikle **VIP araç yapımında** kullanılan elektrik-elektronik malzemeler. Büyük toptancılardan alır (ör. Şinasi Otomotiv'in sigorta ürünleri, For-X, Mobas ürünleri, Tesa bant / tüylü bant).
- Güven'in isteği: "Sahliotomotiv için bir site yapalım, en azından adres belli olsun." Serdar'ın önerisi: **light e-ticaret** — ürün listesi, müşteri WhatsApp'tan sipariş versin. Güven: "Senin ürünlerini de (Seray Tekno kamera vb.) ekle, ürün portföyü genişler."

## 1b. Güven ile yazışma (15.11.2026 gece, ekran görüntüsünden)
- **Stok tutmuyor:** talep geliyor, ürünü bulup satıyor. Asıl iş araç elektrik-elektronik ama onunla sınırlı değil: sanayi tipi tuvalet kâğıdı, eldiven, iş elbisesi, dezenfekte kireci; yakında arı poleni ve mantardan probiyotik, amino asit; tahin, helva; market / şarküteri ürünleri.
- Çalıştığı firmalar: **Direnç, Şinasi, Mobass** (bağlantıları aşağıda; ayrıca "Güncel 2025 Fiyat Listesi 14.02.2025" PDF'ini — 48 sayfa — WhatsApp'tan gönderdi, Serdar dosyayı yeni projeye yükleyecek).
- **Güven'in gönderdiği bağlantılar (tam adresler):**
  - https://www.direnc.net/
  - https://www.mobass.com.tr/tr/urunler
  - https://audiobus.com/nsite/catalogo/
  - https://haksevambalaj.com.tr/
  - https://digimaksi.com/
- **İnceleme notları (web aramasıyla; siteler doğrudan açılamadı):**
  - direnc.net — elektronik komponent mağazası (Arduino, sensör, kablo, ölçü aleti, havya); "Toptan Satış" bölümü var; sitede fiyatlı satış.
  - mobass.com.tr/tr/urunler — Mobass oto ses: amfi, midrange/tweeter hoparlör, subwoofer, ses işlemcisi (DSP), ekolayzır; For-X serisi de Mobass'ın.
  - audiobus.com/nsite/catalogo — AudioBus (İspanya): otobüs/VIP araç için yolcu ses-görüntü sistemleri, araç kameraları, USB şarj, LED aydınlatma, sinyalizasyon (Busworld Türkiye'de katılımcı) → VIP araç işiyle doğrudan ilgili.
  - haksevambalaj.com.tr ve digimaksi.com — aramada bilgi çıkmadı (Haksev Ambalaj: muhtemelen sarf / ambalaj ürünleri; Serdar'dan teyit).
  - "Güncel 2025 Fiyat Listesi 14.02.2025.pdf" (48 sayfa, 4,3 MB) — hangi firmanın olduğu belli değil; Serdar'dan dosya olarak istenecek (sadece kategori/ürün adı için, fiyat kullanılmaz).
- Kategori taslağı: Oto Ses ve Görüntü (amfi, hoparlör, ekran, kamera) · Araç Elektrik (sigorta, kablo, röle, bağlantı) · VIP / Ticari Araç Donanımı (yolcu ses-görüntü, USB şarj, LED) · Elektronik Komponent ve Ölçü · Sanayi ve İş Güvenliği Sarf (eldiven, iş elbisesi, kâğıt, temizlik) · Doğal Gıda (tahin, helva, arı poleni…) · Güvenlik Kameraları (Seray Tekno ürünleri).
- Ürünleri bilgisayarında var ama "onlarla sınırlı kalmak istemiyorum".
- **Sitede hiç fiyat yazılmayacak** (Güven: "Bence hiç fiyat yazmayalım"). **Müşterilerin hepsi tüzel kişi (firma)** → B2B katalog: "Teklif iste / WhatsApp'tan sor"; teklif formunda firma adı, yetkili, telefon.
- Serdar'ın önerisi: toptancıların bayi panelinde XML ürün listesi varsa ürünler oradan çekilir; yoksa kategori + ürün hazır şablonla çoğaltılır; Güven panelden kategori/ürün ekler. (B2B bayi paneli / XML var mı — cevap bekleniyor.)
- **Logo SEÇİLDİ (16.11.2026): "Nazar jant"** — nazar boncuğu renkleriyle tekerlek jantı amblemi + "ŞAHLI / OTOMOTİV / Elektrik · Elektronik · Tedarik". Dosyalar `marka/` klasöründe (logo açık/koyu zemin PNG+SVG, simge 512/1024, favicon, 1080 profil resmi). Renkler: lacivert #0A3F94, açık mavi #5BB8E8, göz bebeği #0B1B3D, yazı mavi #2A8FD0 (koyu zeminde #8FD3FF), beyaz. Yazı tipi Inter Display Black / Inter Bold. SVG'lerde yazı Inter yazı tipine bağlı; sitede PNG ya da Inter yüklü olarak kullanılır.
- Not: toptancının fiyat listesi ve katalog görselleri izinsiz yayınlanmaz; fiyat zaten gösterilmeyecek, görseller için bayi izni / XML'deki resim kullanım hakkı sorulmalı.

## 2. Alan adı ve e-posta
- **sahliotomotiv.com** alındı, Cloudflare'e **transfer sürecinde** (15.11.2026). Henüz Cloudflare hesabında bölge (zone) yok.
- Bölge aktif olunca: Cloudflare Email Routing → `bilgi@sahliotomotiv.com` → `guven.sahli@gmail.com` (bu Gmail Cloudflare'de zaten doğrulanmış; buyukdunya.com'da aynı kural var).
- Grup paneline ileride `merkez.sahliotomotiv.com` adı da bağlanabilir (bkz. buyukdunya-com/sahli-grup/README.md).

## 3. Bekleyen bilgiler (Güven'den)
1. Açık adres, Google Haritalar konum bağlantısı, telefon / WhatsApp, çalışma saatleri.
2. Logo, dükkân / ürün fotoğrafları.
3. Ürün listesi (Excel ya da stok listesi): ürün adı, marka, kategori; fiyat sitede gösterilecek mi?
4. Satılan markalar (Şinasi, For-X, Mobas, Tesa…) — marka adları sitede kullanılabilir mi?
5. Vergi / unvan bilgisi (yasal metinler ve "faturalı satış" yazısı için).

## 3b. KARAR (Serdar, 16.11.2026 00:03) — ESAS ALINACAK
- Site = **hafif e-ticaret / katalog**, seraytekno.com'daki **Teknolojik Ürünler** bölümünün aynısı (kod: `Ntlextr/seraytekno-API` → `public/v2/ortak.js` vitrin/liste/ürün sayfası, `panel_sunucu.js` ürün paneli, worker.js `v2Isle`; D1 `products`, `categories`, `product_images`; ürün grupları `products.grup`). Oradan uyarlanarak kurulur, sıfırdan yazılmaz.
- **HİÇBİR ÜRÜNDE FİYAT YOK.** Ürün sayfasında "Teklif iste / WhatsApp'tan sor" (firma adı, yetkili, adet → WhatsApp). Müşteriler tüzel kişi.
- Ürünler Güven'in çalıştığı firmaların sitelerinden **kategori bazında** eklenecek (Mobass, AudioBus, direnc.net, Haksev Ambalaj, digimaksi + 2025 fiyat listesi PDF'indeki ürünler; Seray Tekno kameraları ayrı grup). Tedarikçi firma adı sitede "grup / marka" olarak görünebilir ama toptancının adı ve fiyatı yazılmaz.
- Ürün metinleri kendi cümlelerimizle yazılır (üreticinin metni kopyalanmaz); teknik özellikler tablo olarak alınabilir. Görseller için bayiden izin / XML istenir; izin yoksa ürünün kendi görseli yerine sade yer tutucu.
- Panel: Güven (Yönetici) kategori ve ürün ekler/düzenler; Şahlı Grup Panel kartı (talepler, WhatsApp tıklamaları) ve "Panele gir".

## 4. Plan (onay bekliyor)
- **1. adım:** tanıtım + iletişim sayfası (adres, harita, telefon, WhatsApp, çalışma saatleri, ne satıyoruz). Hızlı yayın.
- **2. adım:** ürün kataloğu (seraytekno.com'daki Teknolojik Ürünler düzeni örnek: kategoriler, arama, ürün sayfası, "WhatsApp'tan fiyat sor"; fiyat gizli/görünür ayarı), panelden ürün ekleme, Excel'den toplu yükleme (Developer).
- Altyapı önerisi: Cloudflare Worker + D1 + R2 (diğer projelerle aynı yapı), Workers Builds ile `main`'e her gönderimde yayın.
- Şahlı Grup Panel kartı site açılınca bağlanır (özet: talepler, WhatsApp tıklamaları).

## 5. Sürüm geçmişi
- **15.11.2026** — Repo ve bu dosya oluşturuldu (henüz kod yok). Gece: Güven'in yazışmasından iş modeli notları (1b), tedarikçi bağlantıları, karar (3b): Teknolojik Ürünler gibi fiyatsız katalog.
