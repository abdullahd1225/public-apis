# Okul Takip Sistemi

**Ödev ve Haftalık Ders Takibi — Analiz ve Teknik Sunum**

_Sürüm 1.0 · Kasım 2026 · Node.js · Fastify · Ant Design · MongoDB_

## 1. Yönetici Özeti

Okul Takip, öğretmenlerin sınıflarındaki öğrencilerin ödev durumunu ve haftalık işlenen dersleri tek bir panelden takip etmesini sağlayan, eğitim amaçlı ve ileride genişletilebilir bir web uygulamasıdır. Yönetici (admin) panelden öğretmen hesaplarını ve sınıfları açar; öğretmen kendi sınıfında öğrenci ve veli bilgilerini tutar, ödev verir, ödevleri “Yaptı / Eksik / Yapmadı” olarak kontrol eder ve haftalık ders kayıtlarını (konu, saat, devamsızlık) girer.

Uygulama kasıtlı olarak sade tutulmuştur: 7 sunucu modülü, 10 ekran, 6 veri koleksiyonu. Kod modüler bir altyapıyla yazıldığından yeni özellikler (not girişi, veli bildirimi, ders programı vb.) mevcut yapıyı bozmadan eklenebilir.

| Gösterge | Değer |
|---|---|
| Sunucu modülü | 7 (auth, users, classrooms, students, homeworks, lessons, reports) |
| Arayüz ekranı | 10 (giriş, ana sayfa, kullanıcılar, sınıflar, öğrenciler, öğrenci detay, ödevler, haftalık dersler, raporlar, şifre) |
| Veri koleksiyonu | 6 (users, classrooms, students, homeworks, homeworkchecks, lessons) |
| Kod hacmi | 41 kaynak dosya, yaklaşık 2.000 satır |
| Roller | Yönetici (admin), Öğretmen (teacher) |

## 2. İhtiyaç Analizi

### 2.1 Problem

Öğretmenler ödev kontrollerini genellikle kâğıt listelerde veya dağınık tablolarda tutar. Yıl sonunda bir öğrencinin ödevlerin ne kadarını yaptığını, hangi haftalarda derslerin planlandığı gibi işlendiğini ve hangi velilerle iletişime geçilmesi gerektiğini görmek zaman alır.

### 2.2 Hedefler

- Admin girişli bir yönetim paneli; adminin öğretmen hesapları açabilmesi.
- Öğrencinin adı, soyadı, veli telefonu ve veli e-posta adresinin tutulması.
- Ödev verme ve her öğrenci için ödev kontrolü (Yaptı / Eksik / Yapmadı + not).
- Yıl boyunca öğrenci başına ödev başarı oranı: kaç ödev yaptı, kaçını yapmadı.
- Haftalık ders takibi: işlenen / planlanan / iptal edilen dersler, konu, saat ve devamsızlık.
- Sade, Türkçe, mobil uyumlu arayüz; raporların CSV (Excel) ve yazdırma ile dışa aktarımı.
- Yerel bilgisayarda kolay kurulum ve ileride geliştirilebilir altyapı.

### 2.3 Kapsam Dışı (bu sürüm)

- Not / sınav puanı girişi, karne hesabı.
- Veliye otomatik SMS / e-posta gönderimi (veri altyapısı hazır, entegrasyon sonraki faz).
- Öğrenci ve veli girişi (yalnızca personel kullanır).
- e-Okul / MEBBİS entegrasyonu.

## 3. Roller ve Yetkiler

| İşlem | Yönetici | Öğretmen |
|---|---|---|
| Panele giriş, şifre değiştirme | Evet | Evet |
| Kullanıcı (öğretmen) açma, düzenleme, pasifleştirme | Evet | Hayır |
| Sınıf açma / silme, öğretmen atama | Evet | Hayır |
| Sınıfın ders listesini ve haftalık saatini düzenleme | Tüm sınıflar | Kendi sınıfları |
| Öğrenci + veli bilgisi ekleme / düzenleme | Tüm sınıflar | Kendi sınıfları |
| Ödev verme ve kontrol etme | Tüm sınıflar | Kendi sınıfları |
| Haftalık ders kaydı ve devamsızlık | Tüm sınıflar | Kendi sınıfları |
| Sınıf ve öğrenci raporları | Tüm sınıflar | Kendi sınıfları |
| Okul geneli karşılaştırma raporu | Evet | Hayır |

Yetki kontrolü sunucuda yapılır: her istek JWT ile doğrulanır, hesap pasifse reddedilir; sınıfa bağlı her kayıtta kullanıcının o sınıfa erişimi kontrol edilir. Arayüzdeki menü gizleme yalnızca kullanım kolaylığıdır, güvenlik sunucudadır.

## 4. Kullanım Senaryoları

### 4.1 Yıl başı kurulum (Yönetici)

- Admin hesabıyla giriş yapılır.
- Kullanıcılar ekranından öğretmen hesapları açılır.
- Sınıflar ekranından sınıf (örn. 4-A, 2026-2027) açılır, sorumlu öğretmen ve takip edilecek dersler atanır.

### 4.2 Öğrenci kaydı (Öğretmen)

- Öğrenciler ekranında sınıf seçilir, “Yeni Öğrenci” ile ad, soyad, öğrenci no, veli adı, veli telefonu, veli e-postası girilir.
- Telefon ve e-posta tıklanınca doğrudan arama / e-posta açılır.

### 4.3 Ödev verme ve kontrol

- Ödevler ekranında sınıf, ders, başlık ve teslim tarihi girilir.
- “Kontrol” düğmesi tüm sınıf listesini açar; her öğrenci için Yaptı / Eksik / Yapmadı seçilir, isteğe bağlı not yazılır.
- “Tümünü Yaptı işaretle” ile hızlı giriş yapılır, sadece istisnalar değiştirilir.
- Listede her ödevin kontrol ilerlemesi (kontrol edilen / öğrenci sayısı) çubuk olarak görünür.

### 4.4 Haftalık ders takibi

- Haftalık Dersler ekranı Pazartesi–Cuma kolonlu bir hafta görünümüdür; oklarla haftalar arasında gezilir.
- Her gün için ders, saat, işlenen konu, durum (Planlandı / İşlendi / İptal) ve devamsız öğrenciler girilir.
- Üstte haftalık özet: işlenen ders, işlenen saat / planlanan haftalık saat, planlı ve iptal sayıları.

### 4.5 Raporlama

- Ana sayfa: genel başarı göstergesi, son 8 haftanın ders grafiği, yaklaşan ödevler, desteğe ihtiyaç duyan öğrenciler (%50 altı).
- Sınıf raporu: öğrenci bazlı yaptı / eksik / yapmadı / bekleyen / devamsızlık ve başarı oranı; CSV indirme ve yazdırma.
- Öğrenci detay: veli bilgileri, yıllık ödev özeti, tüm ödev geçmişi ve devamsız olduğu dersler.
- Okul geneli (admin): sınıfların başarı oranlarının karşılaştırması.

## 5. Raporlama Metrikleri

| Metrik | Tanım |
|---|---|
| Verilen ödev | Öğrencinin sınıfına verilen tüm ödevler. |
| Değerlendirilen ödev | Teslim tarihi geçmiş veya kontrolü yapılmış ödevler. |
| Yaptı / Eksik / Yapmadı | Kontrol kayıtlarının durum sayıları. |
| Kontrol bekleyen | Teslim tarihi geçtiği hâlde kontrol girilmemiş ödevler (öğretmene hatırlatma). |
| Başarı oranı | (Yaptı + Eksik × 0,5) ÷ Değerlendirilen ödev × 100 |
| Risk eşiği | Başarı oranı %50’nin altında olan öğrenciler ana sayfada listelenir. |
| Renk kodu | %80 ve üzeri yeşil, %50–79 sarı, %50 altı kırmızı. |
| Haftalık ders | Hafta başına işlendi / planlı / iptal sayısı ve işlenen ders saati. |
| Devamsızlık | Öğrencinin “devamsız” işaretlendiği işlenmiş ders sayısı. |

## 6. Veri Modeli (MongoDB)

| Koleksiyon | Temel alanlar | Not |
|---|---|---|
| users | name, email (benzersiz), passwordHash, role, branch, phone, active, lastLoginAt | Şifre bcrypt ile saklanır; silme yerine pasifleştirme. |
| classrooms | name, academicYear, teacher→users, subjects[], weeklyLessonHours | name + academicYear benzersiz. |
| students | firstName, lastName, studentNo, classroom→classrooms, parentName, parentPhone, parentEmail, notes, active | Pasifleştirilen öğrencinin geçmişi korunur. |
| homeworks | title, description, subject, classroom, teacher, assignedDate, dueDate |  |
| homeworkchecks | homework, student, status (done/partial/not_done), note, checkedBy, checkedAt | homework + student benzersiz: tek kontrol kaydı. |
| lessons | classroom, teacher, subject, date, weekStart, hours, topic, status, absentStudents[] | weekStart ile haftalık sorgular indekslidir. |

## 7. Teknik Mimari

| Katman | Teknoloji | Görev |
|---|---|---|
| Arayüz | React 18 + Ant Design 5 + Vite | Türkçe yerelleştirme, yan menülü panel, mobil uyumlu düzen. |
| API | Node.js 20+ · Fastify 5 | JSON şema doğrulaması, JWT oturum, rol ve sınıf kapsamı kontrolü. |
| Veri | MongoDB 7 · Mongoose 8 | Şemalar, indeksler, toplama (aggregation) raporları. |
| Kurulum | npm betikleri · Docker Compose (isteğe bağlı) | Tek komutla geliştirme (npm run dev) veya tek port üretim (npm start). |

### 7.1 Genişletilebilirlik

- Her özellik server/src/modules/<modül> altında model + routes çiftidir; app.js içindeki modül listesine bir satır eklemek yeterlidir.
- Yetki yardımcıları (assertClassroomAccess, accessibleClassroomIds) tek yerdedir; yeni modüller aynı kuralı kullanır.
- İstemcide resource('/yol') yardımcısı yeni modül için hazır CRUD istemcisi üretir.
- Tema renkleri client/src/theme.js dosyasında toplanmıştır; kurum kimliğine göre tek dosyadan değişir.
- scripts/graph.mjs kod tabanının bağımlılık grafiğini docs/MIMARI_GRAF.md olarak üretir (41 dosya, 99 import ilişkisi).

### 7.2 Güvenlik ve KVKK

- Veli telefonu ve e-postası kişisel veridir: yalnızca ilgili sınıfın öğretmeni ve yönetici erişir.
- Şifreler bcrypt ile özetlenir; API yanıtlarında şifre alanı asla dönmez.
- JWT süresi varsayılan 8 saattir; .env içindeki JWT_SECRET kurulumda mutlaka değiştirilmelidir.
- Kayıtlar silinmek yerine pasifleştirilir; ödev ve ders geçmişi raporlarda korunur.
- Kurum içi kullanımda okulun KVKK aydınlatma metni velilere bildirilmelidir.

## 8. Kurulum ve Çalıştırma (Yerel)

| Adım | Komut |
|---|---|
| 1. Bağımlılıklar | cd okul-takip && npm run install:all |
| 2. Ortam dosyası | server/.env.example → server/.env (JWT_SECRET değiştirin) |
| 3. MongoDB | npm run db:up (Docker) veya yerel MongoDB Community Server |
| 4. Admin hesabı | npm run seed |
| 5. Demo veri (isteğe bağlı) | npm run seed:demo |
| 6. Geliştirme | npm run dev → http://localhost:5173 |
| 7. Üretim | npm run build && npm start → http://localhost:3001 |

Varsayılan giriş: admin@okul.local / Admin123! — demo öğretmen: ogretmen@okul.local / Ogretmen123!. İlk girişte şifreler değiştirilmelidir.

## 9. Yapay Zekâ Destekli Geliştirme (Ruflo ve Graphify)

Ruflo (çok ajanlı Claude Code orkestrasyonu) ve Graphify (kod tabanından bilgi grafiği çıkarma) bu proje için geliştirme ve analiz araçları olarak düşünülmüştür. Bu analiz sırasında bulut oturumundaki Ruflo AI Team bağlantısı ağ kısıtı nedeniyle kurulamadı; bu nedenle ajan ekibi kurulmadı ve Graphify çalıştırılmadı. Yerine aynı amaca hizmet eden şu adımlar uygulandı:

- Proje köküne CLAUDE.md eklendi: modül yapısı, yetki kuralı, tarih ve oran hesabı gibi kurallar ajanların ortak bağlamı olarak yazıldı.
- scripts/graph.mjs ile kodun modül bağımlılık grafiği otomatik çıkarıldı (docs/MIMARI_GRAF.md, Mermaid diyagramı).
- Önerilen yerel iş bölümü: araştırmacı (gereksinim), geliştirici (modül), doğrulayıcı (kabul kriterleri) rolleri — her yeni modül için ayrı görev.

Yerel bilgisayarda Ruflo ve Graphify kurulduktan sonra bu dosyalar başlangıç bağlamı olarak kullanılabilir; araçların güncel kurulum komutları kendi belgelerinden doğrulanmalıdır.

## 10. Yol Haritası

| Faz | İçerik |
|---|---|
| Faz 1 — Hazır | Admin paneli, öğretmen hesapları, sınıf, öğrenci + veli, ödev kontrolü, haftalık ders ve devamsızlık, raporlar, CSV. |
| Faz 2 | Veliye e-posta/SMS bildirimi (yapmadı / devamsız), Excel’den toplu öğrenci aktarma, ödev dosya eki. |
| Faz 3 | Haftalık ders programı şablonu (dersleri otomatik planlama), sınav/not modülü, dönem karnesi. |
| Faz 4 | Veli ve öğrenci girişi (salt okunur), mobil uygulama (aynı API), çoklu okul (kurum) desteği. |

## 11. Doğrulama Durumu ve Açık Noktalar

- Arayüz üretim derlemesi (vite build) başarılı.
- Sunucu başlatma, 27 rota kaydı, sağlık uç noktası ve yetkisiz isteğin 401 dönmesi test edildi.
- MongoDB ile uçtan uca test bu ortamda yapılamadı (bulut oturumunda MongoDB yok); yerelde npm run seed:demo sonrası tüm ekranların denenmesi önerilir.
- Daha önce hazırlanan “masal” uygulamasının arayüzü bu çalışmada erişilebilir değildi; renk ve düzen client/src/theme.js üzerinden o uygulamaya göre kolayca uyarlanabilir.

