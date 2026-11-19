import { User } from '../users/user.model.js';
import { HttpError } from '../../utils/errors.js';

export default async function authRoutes(app) {
  app.post(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: { email: { type: 'string' }, password: { type: 'string' } },
        },
      },
    },
    async (req) => {
      const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
      if (!user || !user.active || !(await user.checkPassword(req.body.password))) {
        throw new HttpError(401, 'E-posta veya şifre hatalı');
      }
      user.lastLoginAt = new Date();
      await user.save();
      const token = app.jwt.sign({ id: user._id, role: user.role });
      return { token, user };
    }
  );

  app.get('/me', { preHandler: app.authenticate }, async (req) => {
    const { passwordHash, __v, ...user } = req.currentUser;
    return user;
  });

  app.post(
    '/change-password',
    {
      preHandler: app.authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 6 } },
        },
      },
    },
    async (req) => {
      const user = await User.findById(req.currentUser._id);
      if (!(await user.checkPassword(req.body.currentPassword))) throw new HttpError(400, 'Mevcut şifre hatalı');
      await user.setPassword(req.body.newPassword);
      await user.save();
      return { ok: true };
    }
  );
}
