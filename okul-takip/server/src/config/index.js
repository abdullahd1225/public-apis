import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || '0.0.0.0',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/okul_takip',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-degistirin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@okul.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    name: process.env.ADMIN_NAME || 'Sistem Yöneticisi',
  },
};
