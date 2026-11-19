# Okul Takip — geliştirici notları (Claude Code / Ruflo ajanları için)

- Dil: Arayüz metinleri ve hata mesajları Türkçe.
- Sunucu: Fastify 5, ESM, Mongoose 8. Her modül `src/modules/<ad>/` altında model + routes.
- Yetki: Her sınıfa bağlı kayıtta `assertClassroomAccess(req.currentUser, classroomId)` çağrılmalı.
  Listelerde `accessibleClassroomIds(user)` ile kapsam filtrelenir. Admin için kapsam boştur.
- Silme politikası: kullanıcı ve öğrenci **pasifleştirilir** (geçmiş raporlar bozulmasın).
- Tarihler: `YYYY-MM-DD` gelen değerler `parseDay` ile yerel öğlen saatine çevrilir; hafta başı `weekStart`.
- Başarı oranı: (yaptı + eksik×0,5) / değerlendirilen ödev (teslimi geçmiş veya kontrol edilmiş).
- İstemci: React 18 + Ant Design 5, tema `client/src/theme.js`. API çağrıları `client/src/api/client.js`.
- Mimari grafiği güncellemek için: `node scripts/graph.mjs`.
