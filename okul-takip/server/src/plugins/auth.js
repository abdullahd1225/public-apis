import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { config } from '../config/index.js';
import { User } from '../modules/users/user.model.js';

export default fp(async (app) => {
  await app.register(jwt, { secret: config.jwtSecret, sign: { expiresIn: config.jwtExpiresIn } });

  // Oturum doğrulama: token geçerli ve kullanıcı aktif olmalı
  app.decorate('authenticate', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Oturum geçersiz veya süresi doldu' });
    }
    const user = await User.findById(req.user.id).lean();
    if (!user || !user.active) return reply.code(401).send({ message: 'Hesap pasif veya bulunamadı' });
    req.currentUser = user;
  });

  // Rol kontrolü: requireRole('admin')
  app.decorate('requireRole', (...roles) => async (req, reply) => {
    if (!roles.includes(req.currentUser?.role)) {
      return reply.code(403).send({ message: 'Bu işlem için yetkiniz yok' });
    }
  });
});
