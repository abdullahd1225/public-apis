# 📚 Okul Takip — Ödev ve Haftalık Ders Takip Sistemi

Node.js + **Fastify** (API) · **React + Ant Design** (arayüz) · **MongoDB** (veritabanı)

Yönetici (admin) panele girer, öğretmen hesaplarını ve sınıfları açar. Öğretmenler kendi sınıflarındaki
öğrencileri (ad, soyad, veli telefonu, veli e-postası) yönetir, ödev verir, ödevleri **Yaptı / Eksik / Yapmadı**
olarak kontrol eder ve haftalık işlenen dersleri (konu, saat, devamsızlık) kaydeder. Raporlar öğrencinin
yıl boyunca ödevlerin ne kadarını yaptığını ve derslerin haftalık işlenme durumunu gösterir.

## Gereksinimler

| Araç | Sürüm |
|---|---|
| Node.js | 20 veya üzeri |
| MongoDB | 6/7 (yerel kurulum **veya** Docker) |

## Kurulum (ilk sefer)

```bash
cd okul-takip
npm run install:all                 # kök + server + client bağımlılıkları
cp server/.env.example server/.env  # gerekirse JWT_SECRET ve admin bilgilerini değiştirin
npm run db:up                       # (Docker kullanıyorsanız) MongoDB'yi başlatır
npm run seed                        # admin hesabını oluşturur
npm run seed:demo                   # (isteğe bağlı) örnek öğretmen, sınıf, 10 öğrenci, ödev ve ders verisi
```

> Docker yoksa MongoDB Community Server'ı kurup `mongodb://127.0.0.1:27017` adresinde çalıştırmanız yeterli.

## Çalıştırma

```bash
npm run dev      # API: http://localhost:3001  ·  Arayüz: http://localhost:5173
```

Üretim modu (tek port):

```bash
npm run build && npm start   # http://localhost:3001
```

## Varsayılan hesaplar

| Rol | E-posta | Şifre |
|---|---|---|
| Yönetici | `admin@okul.local` | `Admin123!` |
| Öğretmen (demo) | `ogretmen@okul.local` | `Ogretmen123!` |

İlk girişten sonra **Şifre Değiştir** menüsünden şifreleri değiştirin.

## Klasör yapısı

```
okul-takip/
├── server/                 Fastify API
│   └── src/
│       ├── app.js          Uygulama fabrikası (modül kayıt listesi burada)
│       ├── config/         Ortam değişkenleri
│       ├── plugins/        db (Mongoose), auth (JWT + rol kontrolü)
│       ├── utils/          erişim kapsamı, hata, tarih yardımcıları
│       ├── modules/        auth · users · classrooms · students · homeworks · lessons · reports
│       └── scripts/seed.js
├── client/                 React + Ant Design (Vite)
│   └── src/
│       ├── api/client.js   Axios + yeniden kullanılabilir CRUD yardımcıları
│       ├── layouts/        Yan menülü ana düzen
│       ├── pages/          Ekranlar
│       └── components/     Grafik, oran çubuğu, sınıf seçici
├── scripts/graph.mjs       Mimari bağımlılık grafiği üretir → docs/MIMARI_GRAF.md
└── docs/                   Analiz belgesi ve Word sunumu
```

## API özeti

| Uç nokta | Açıklama | Yetki |
|---|---|---|
| `POST /api/auth/login` · `GET /api/auth/me` · `POST /api/auth/change-password` | Oturum | Herkes / giriş yapmış |
| `/api/users` | Öğretmen/yönetici hesapları (CRUD, pasifleştirme) | Admin |
| `/api/classrooms` | Sınıflar (aç/sil admin; ders listesi öğretmen) | Admin + sınıf öğretmeni |
| `/api/students` | Öğrenci + veli bilgileri | Sınıf kapsamında |
| `/api/homeworks`, `/api/homeworks/:id/checks` | Ödevler ve toplu kontrol | Sınıf kapsamında |
| `/api/lessons?classroom=&week=` | Haftalık ders kayıtları, devamsızlık | Sınıf kapsamında |
| `/api/reports/dashboard · classroom/:id · classroom/:id/csv · student/:id · overview` | Raporlar, CSV dışa aktarım | Kapsamlı / overview admin |

Öğretmen yalnızca **kendisine atanmış sınıfların** verisini görür; admin her şeyi görür.

## Yeni modül eklemek

1. `server/src/modules/<modul>/` altına `*.model.js` ve `*.routes.js` yazın (`assertClassroomAccess` ile yetki).
2. `server/src/app.js` içindeki `modules` listesine ekleyin.
3. `client/src/api/client.js` içinde `resource('/<modul>')` ile API istemcisini oluşturun, `pages/` altına ekranı ekleyin,
   `App.jsx` ve `layouts/MainLayout.jsx` menüsüne bağlayın.

Ayrıntılı analiz: [`docs/ANALIZ.md`](docs/ANALIZ.md) · Word sunumu: `docs/Okul_Takip_Analiz_Sunumu.docx`

`npm run graph` mimari grafiğini, `npm run docs` analiz belgesini (içerik: `scripts/docx-content.cjs`) yeniden üretir.
