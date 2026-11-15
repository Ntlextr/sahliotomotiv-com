# ŞAHLI OTOMOTİV — Proje Referans Dosyası

**Güncel sürüm: v1.4 — 16.11.2026 02:35** (sürüm geçmişi Bölüm 6'da)

> Serdar Türkçe konuşur, programcı değildir, telefondan çalışır. Kısa, sade anlat; işe başlamadan ne yapacağını söyle, onay al.
> **Sohbet başında OKU:** `Ntlextr/seraytekno-API` reposundaki **`ORTAK_NOTLAR.md`** (projeler arası ortak bilgiler) ve **`PANEL_REHBERI.md`** (Seray Tekno panellerinin ortak kuralları).
> ⚠️ **Bu repo PUBLIC.** Şifre, anahtar, IBAN, müşteri bilgisi, alış fiyatı, tedarikçi fiyat listesi BURAYA YAZILMAZ / KONMAZ.

## 1. İşletme
- **Sahibi:** Güven Şahlı (Serdar'ın yeğeni). Aynı kişinin diğer işleri: Luxury Beauty Center (güzellik salonu, aynı adreste), Şahlı Harası – BÜYÜKDÜNYA (buyukdunya.com). Hepsi **Şahlı Grup Panel**'de (grup.buyukdunya.com) toplanır — Şahlı Otomotiv kartı şimdilik "Yakında".
- **Tüzel kişilik (16.11.2026, vergi levhasından doğrulandı):** ŞAHLI OTOMOTİV ELEKTRİK ELEKTRONİK İTHALAT İHRACAT SANAYİ VE TİCARET LİMİTED ŞİRKETİ. Vergi Dairesi Erenköy, işe başlama 04.11.2025, kurumlar vergisi, faaliyet kodu 467212 (motorlu kara taşıtı parçalarının toptan ticareti — cam/lastik/jant/motosiklet hariç). Luxury Beauty Center ile sadece ADRES ortak, tüzel kişilik ayrı. Adres: **19 Mayıs Mah. Yamaç Sk. Şeref Yazgan İş Merkezi No:1 İç Kapı No:8, Kadıköy/İstanbul**.
- **Ne iş yapar:** araçların elektrik ve elektronik aksamlarını satar — sigortadan kabloya, araç kamerasından ses ve görüntü sistemine kadar. Özellikle **VIP araç yapımında** kullanılan elektrik-elektronik malzemeler. Stok tutmuyor: talep geliyor, ürünü bulup tedarik ediyor. Müşterilerin hepsi tüzel kişi (B2B).
- **WhatsApp / iletişim numarası: +90 532 408 29 99** (Güven Bey'in kendi numarası).

## 2. Ürün kaynakları ve 6 grup (16.11.2026 — ESAS ALINACAK)
Her kaynağın gerçek adı sitede ASLA yazılmaz — panelde `products.grup` alanında iç referans olarak durur, ön yüzde sadece nötr grup başlığı görünür (`site_icerik.magaza_gruplar`, seraytekno.com'daki ürün grubu mekanizmasının aynısı).

| # | Panel `grup` | Ön yüzde görünen ad | Gerçek kaynak | Durum |
|---|---|---|---|---|
| 1 | `Direnc` | Elektrik ve Elektronik Komponentler | direnc.net | kategori taslağı hazır, ürün girilmedi |
| 2 | `Sinasi` | Araç Sigorta ve Elektrik Parçaları | Şinasi/MTA/PNH "Güncel 2025 Fiyat Listesi" PDF'i (48 syf) | kategori taslağı hazır (araç-ilgili alt küme), ürün girilmedi |
| 3 | `AracKamera` | Araç Kamera ve Kayıt Sistemleri | Seray Tekno (kendi D1'i, kopyalanacak) + Digimaksi.com | kategori taslağı hazır, ürün girilmedi |
| 4 | `Mobass` | Oto Ses Sistemleri | mobass.com.tr/tr/urunler | kategori taslağı hazır (34 amfi, 11 subwoofer, hoparlörler, kablolar, kabinler), ürün girilmedi |
| 5 | `Audiobus` | Ticari Araç Elektroniği | audiobus.com/nsite/catalogo (1469 ürün, 30 sayfa — çoğu OTOBÜS/midibüs odaklı) | sadece genel-amaçlı alt küme alınacak (kamera/monitör, aydınlatma, ses/anten, güç); otobüse özel olanlar (Destino tabela, yangın söndürücü, SWF panel) dışarıda |
| 6 | `Haksev` | Ambalaj ve Sevkiyat Malzemeleri | evambalaj.com.tr (Bursa, ambalaj malzemeleri — bant, naylon, karton, çember, plastik kasa, kimyasal, polietilen köpük) | Güven onayladı: sipariş üzerine tedarik ediliyor, kataloğa dahil |

**Erişim notu:** direnc.net, audiobus.com, mobass.com.tr, digimaksi.com WebFetch ile erişilebildi (16.11.2026 akşamı). haksevambalaj.com.tr sayfaları meta açıklama dışında ürün listesi vermiyor — Serdar'ın gönderdiği ekran görüntüsünden kategori adları alındı.

- **HİÇBİR ÜRÜNDE FİYAT YOK** (Güven onayladı). Ürün sayfasında "Teklif iste / WhatsApp'tan sor" (firma adı, yetkili, adet → WhatsApp) — henüz kodlanmadı.
- Ürün metinleri kendi cümlelerimizle yazılır (üreticinin/tedarikçinin metni kopyalanmaz); teknik özellikler tablo olarak alınabilir.
- **Görseller (16.11.2026, Serdar: "izin sıkıntısı yok, Güven kendi resmini koyacak"):** gerçek fotoğraflar bayiden izinsiz kullanılmaz ama bu bir engel değil — Güven ürünlerin kendi fotoğrafını çekip ekleyecek. `products.image_url` (ve çoklu görsel için `product_images`) zaten hazır; dolu olan ürünlerde site otomatik gerçek fotoğrafı gösterir (`urunGorselHtml`), boş olanlarda sade "Görsel hazırlanıyor" kutusu çıkar — kategoriye göre uydurma simge/ikon KULLANILMAZ.
- **Logo: "Nazar jant"** — nazar boncuğu renkleriyle tekerlek jantı amblemi + "ŞAHLI / OTOMOTİV / Elektrik · Elektronik · Tedarik". Dosyalar `marka/` klasöründe. Renkler: lacivert #0A3F94, açık mavi #5BB8E8, koyu #0B1B3D, yazı mavi #2A8FD0. SVG'si küçük (worker.js'e doğrudan gömülü, dosya sunmaya gerek yok).

## 3. Altyapı (16.11.2026'da kuruldu)
- **Worker:** `sahliotomotiv-js` (tek dosya, Cloudflare API ile doğrudan deploy edildi — repo→Workers Builds bağlantısı HENÜZ YOK, bkz. Bölüm 5).
- **D1:** `sahliotomotiv-db` (id `f7e89686-0db0-4a78-8e40-af5a4fc80e4d`, binding `DB`). Tablolar: `products`, `product_images`, `categories`, `site_icerik`, `teklif_talep` — seraytekno-API'nin v2 şemasından uyarlandı (Bölüm "D1 Şeması" aşağıda).
- **Geçici adres (alan adı transferi bitene kadar):** https://sahliotomotiv-js.serdarcirak.workers.dev/
- **Alan adı:** sahliotomotiv.com Cloudflare'e transfer sürecinde, henüz bölge (zone) yok. Bölge açılınca: custom domain bağlanır (www + apex), Email Routing `bilgi@sahliotomotiv.com` → `guven.sahli@gmail.com`, ve bu repo için Workers Builds tetiği kurulup `main`'e her commit'te otomatik yayın başlar (şu an manuel deploy ediliyor).
- **D1 Şeması (site_icerik anahtarları):** `magaza_gruplar` (JSON, grup→nötr ad eşlemesi), `iletisim` (unvan, telefon, whatsapp, adres, çalışma saatleri).

## 4. Site — mevcut durum (v1.4)
- **Ana sayfa (`/`):** hero tanıtım yazısı, 6 ürün grubu kartı (nötr başlıklarla; ürünü olan grup tıklanınca `/urunlerimiz?grup=..`'a gider, boş olan "Yakında" yazar), iletişim kutusu (unvan, adres + Google Haritalar linki, telefon, çalışma saatleri, WhatsApp düğmesi), sağ altta yüzen WhatsApp balonu.
- **`/urunlerimiz`:** grup seçilmemişse 6 grubun teaser listesi; `?grup=Haksev` gibi bir grup seçilince o grubun kategorilerine göre gruplanmış gerçek ürün kartları.
- **`/urun/<slug>`:** tek ürün sayfası — tanıtım metni + görsel (image_url doluysa gerçek fotoğraf, boşsa "Görsel hazırlanıyor") + "WhatsApp'tan teklif iste" düğmesi (ürün adını içeren hazır mesajla). `teklif_talep` tablosuna yazan form henüz yok, doğrudan WhatsApp'a yönlendiriyor.
- **5 grup — veri girildi (16.11.2026):**
  - **Haksev** (Ambalaj ve Sevkiyat Malzemeleri): 9 kategori, kaynak `evambalaj.com.tr`.
  - **Direnc** (Elektrik ve Elektronik Komponentler): 7 kategori (Röle, Klemens, Konnektör, Buton ve Anahtar, Kablo Çeşitleri, Sigorta ve Yuvaları, İzolasyon ve Bant Ürünleri), kaynak direnc.net (sitenin Arduino/geliştirme kartı gibi hobi kategorileri DIŞARIDA — sadece araç elektriğiyle örtüşen pasif komponent/bağlantı kategorileri alındı).
  - **AracKamera** (Araç Kamera ve Kayıt Sistemleri): 7 kategori, kaynak digimaksi.com + Seray Tekno'nun kendi D1'indeki (seraytekno-db) mevcut araç kamerası kataloğu (ürün adlarında gerçek tedarikçi/marka adı — "Pulnix" — KULLANILMADI, sadece ürün tipi genel adla yazıldı).
  - **Mobass** (Oto Ses Sistemleri): 8 kategori, kaynak mobass.com.tr (sitede ürünü olmayan başlıklar — OEM hoparlör, marin, teyp, multimedya/navigasyon vb. — alınmadı).
  - **Audiobus** (Ticari Araç Elektroniği): 5 kategori, kaynak audiobus.com'un genel-amaçlı bölümleri (kamera/monitör, aydınlatma, ses, güç/enerji, wifi router); otobüse özel olanlar (tabela, yangın söndürücü, SWF panel, OAS) dışarıda bırakıldı.
  - Her kategoride Haksev'deki yöntemle kategori + bir temsilci ürün kaydı, genel/doğru tanıtım metniyle (uydurma teknik özellik/model yok).
- **Şinasi/MTA grubu hâlâ "Yakında"** — kaynak 48 sayfalık bir PDF fiyat listesi; bu ortamda dosyaya erişim yok, Serdar'ın PDF'i yeniden eklemesi/yüklemesi gerekiyor.
- **`/robots.txt`, `/sitemap.xml`:** basit, hazır.
- **Henüz YOK:** panel (ürün/kategori ekleme), Şinasi/MTA grubu verisi, teklif formu (firma adı/yetkili/adet → D1), R2 görsel deposu, personel/giriş sistemi, yasal sayfalar (KVKK, kullanım koşulları).

## 5. Sırada (öncelik sırasıyla)
0. **Ürün fotoğrafları** — Güven kendi çektiği fotoğrafları gönderdikçe panelden/elle `products.image_url` (ya da `product_images`) alanına girilecek; altyapı hazır, panel henüz yok (bkz. madde 2).
1. **Şinasi/MTA grubunun ürün/kategori verisi** — PDF fiyat listesi Serdar'dan yeniden istenecek/yüklenecek; diğer 5 grup tamamlandı.
2. **Panel** — seraytekno-API'nin `panel_sunucu.js` + `/v2/panel` düzeninden uyarlanacak: giriş, ürün/kategori ekleme, R2 görsel yükleme. `PANEL_REHBERI.md` henüz okunmadı — panel işine başlamadan önce okunacak.
3. **Teklif formu / WhatsApp akışı** — ürün sayfasında firma adı + yetkili + adet alıp hem `teklif_talep` tablosuna yazan hem WhatsApp'a hazır mesaj gönderen gerçek form (şu an sadece hazır mesajlı WhatsApp linki var).
4. **Workers Builds / GitHub bağlantısı** — alan adı bölgesi açılınca Cloudflare dashboard'dan `main`'e push → otomatik yayın bağlanacak (seraytekno-API'deki gibi). Şimdilik her değişiklik Cloudflare API ile manuel deploy ediliyor.
5. Alan adı bağlanınca: custom domain, e-posta yönlendirme, yasal sayfalar (satıcı = Şahlı Otomotiv Ltd. Şti. olduğu için "faturalı satış" yazılabilir).

## 6. Sürüm geçmişi
- **v1.4 — 16.11.2026 02:35** — 4 grubun daha ürün/kategori verisi D1'e girildi: Direnc (7 kategori, direnc.net), AracKamera (7 kategori, digimaksi.com + Seray Tekno'nun mevcut araç kamerası kataloğu), Mobass (8 kategori, mobass.com.tr), Audiobus (5 kategori, audiobus.com'un genel-amaçlı bölümü). Toplam 36 ürün, 5/6 grup yayında — sadece Şinasi/MTA (PDF kaynaklı) "Yakında" kaldı.
- **v1.3 — 16.11.2026 02:20** — Ürün görseli altyapısı: `image_url` doluysa kartta/ürün sayfasında gerçek fotoğraf gösteriliyor, boşsa sade "Görsel hazırlanıyor" kutusu (kategoriye göre uydurma ikon yok — Serdar: izin sorunu yok, Güven kendi fotoğrafını ekleyecek). Haksev taksonomi tablosundaki kaynak adresi `evambalaj.com.tr` olarak düzeltildi.
- **v1.2 — 16.11.2026 02:15** — `/urunlerimiz?grup=..` ve `/urun/<slug>` eklendi (kategoriye göre gruplanmış ürün listesi + tek ürün sayfası, WhatsApp'tan teklif). Haksev grubuna 9 kategori + temsilci ürün verisi D1'e girildi (ilk gerçek ürün verisi — diğer 5 grup hâlâ "Yakında"). Haksev'in gerçek adresinin `evambalaj.com.tr` olduğu doğrulandı. Deploy sırasında bir UTF-8/base64 kodlama hatası (Türkçe karakterler bozuluyordu) fark edilip düzeltildi.
- **v1.1 — 16.11.2026 01:35** — Vergi levhası doğrulandı (tüzel kişilik, adres). 6 ürün grubu kesinleşti (Direnç, Şinasi/MTA, Araç Kamera [Seray Tekno+Digimaksi], Mobass, Audiobus, Haksev). Worker `sahliotomotiv-js` + D1 `sahliotomotiv-db` kuruldu, Adım 1 (tanıtım+iletişim sayfası + ürün grupları teaser) canlıya alındı: https://sahliotomotiv-js.serdarcirak.workers.dev/
- **v1.0 — 15.11.2026** — Repo ve bu dosya oluşturuldu (henüz kod yok). Güven'in yazışmasından iş modeli notları, tedarikçi bağlantıları, karar: Teknolojik Ürünler gibi fiyatsız katalog. Logo "Nazar jant" seçildi.
