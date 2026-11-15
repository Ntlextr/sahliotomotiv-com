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
- Çalıştığı firmalar: **Direnç, Şinasi, Mobass** (bağlantılarını ve "Güncel 2025 Fiyat Listesi 14.02.2025" PDF'ini — 48 sayfa — WhatsApp'tan gönderdi; ekran görüntüsünden okunamadı, Serdar'dan metin olarak istenecek).
- Ürünleri bilgisayarında var ama "onlarla sınırlı kalmak istemiyorum".
- **Sitede hiç fiyat yazılmayacak** (Güven: "Bence hiç fiyat yazmayalım"). **Müşterilerin hepsi tüzel kişi (firma)** → B2B katalog: "Teklif iste / WhatsApp'tan sor"; teklif formunda firma adı, yetkili, telefon.
- Serdar'ın önerisi: toptancıların bayi panelinde XML ürün listesi varsa ürünler oradan çekilir; yoksa kategori + ürün hazır şablonla çoğaltılır; Güven panelden kategori/ürün ekler. (B2B bayi paneli / XML var mı — cevap bekleniyor.)
- Logo: soruldu, cevap bekleniyor.
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

## 4. Plan (onay bekliyor)
- **1. adım:** tanıtım + iletişim sayfası (adres, harita, telefon, WhatsApp, çalışma saatleri, ne satıyoruz). Hızlı yayın.
- **2. adım:** ürün kataloğu (seraytekno.com'daki Teknolojik Ürünler düzeni örnek: kategoriler, arama, ürün sayfası, "WhatsApp'tan fiyat sor"; fiyat gizli/görünür ayarı), panelden ürün ekleme, Excel'den toplu yükleme (Developer).
- Altyapı önerisi: Cloudflare Worker + D1 + R2 (diğer projelerle aynı yapı), Workers Builds ile `main`'e her gönderimde yayın.
- Şahlı Grup Panel kartı site açılınca bağlanır (özet: talepler, WhatsApp tıklamaları).

## 5. Sürüm geçmişi
- **15.11.2026** — Repo ve bu dosya oluşturuldu (henüz kod yok). Gece: Güven'in yazışmasından iş modeli notları (1b).
