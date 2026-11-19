import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import dbPlugin from './plugins/db.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import classroomRoutes from './modules/classrooms/classroom.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import homeworkRoutes from './modules/homeworks/homework.routes.js';
import lessonRoutes from './modules/lessons/lesson.routes.js';
import reportRoutes from './modules/reports/report.routes.js';

/**
 * Uygulama fabrikası. Yeni bir modül eklemek için:
 *  1) src/modules/<modul>/ altında model + routes yazın
 *  2) aşağıdaki listeye { prefix, routes } ekleyin
 */
export async function buildApp({ withDb = true, logger = true } = {}) {
  const app = Fastify({ logger, ajv: { customOptions: { allErrors: false, coerceTypes: true } } });
  // JSON şemadaki "format: email" desteği Fastify'da yerleşik (ajv-formats)

  await app.register(cors, { origin: config.corsOrigin, credentials: true });
  if (withDb) await app.register(dbPlugin);
  await app.register(authPlugin);

  app.setErrorHandler((err, req, reply) => {
    if (err.validation) return reply.code(400).send({ message: 'Geçersiz veri: ' + err.message });
    if (err.name === 'CastError') return reply.code(400).send({ message: 'Geçersiz kimlik (id)' });
    if (err.code === 11000) return reply.code(409).send({ message: 'Bu kayıt zaten mevcut' });
    const status = err.statusCode || 500;
    if (status >= 500) req.log.error(err);
    return reply.code(status).send({ message: status >= 500 ? 'Sunucu hatası' : err.message });
  });

  app.get('/api/health', async () => ({ status: 'ok', time: new Date().toISOString() }));

  const modules = [
    { prefix: '/api/auth', routes: authRoutes },
    { prefix: '/api/users', routes: userRoutes },
    { prefix: '/api/classrooms', routes: classroomRoutes },
    { prefix: '/api/students', routes: studentRoutes },
    { prefix: '/api/homeworks', routes: homeworkRoutes },
    { prefix: '/api/lessons', routes: lessonRoutes },
    { prefix: '/api/reports', routes: reportRoutes },
  ];
  for (const m of modules) await app.register(m.routes, { prefix: m.prefix });

  // Üretimde derlenmiş arayüzü (client/dist) aynı porttan sun
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  if (fs.existsSync(dist)) {
    await app.register(fastifyStatic, { root: dist });
    app.setNotFoundHandler((req, reply) =>
      req.url.startsWith('/api') ? reply.code(404).send({ message: 'Bulunamadı' }) : reply.sendFile('index.html')
    );
  }
  return app;
}
