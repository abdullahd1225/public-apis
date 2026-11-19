import { User } from './user.model.js';
import { HttpError, notFound } from '../../utils/errors.js';

const userBody = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string', enum: ['admin', 'teacher'] },
    branch: { type: 'string' },
    phone: { type: 'string' },
    active: { type: 'boolean' },
  },
};

/** Kullanıcı (öğretmen) yönetimi — yalnızca admin */
export default async function userRoutes(app) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireRole('admin'));

  app.get('/', async () => User.find().sort({ createdAt: -1 }));

  app.post('/', { schema: { body: { ...userBody, required: ['name', 'email', 'password'] } } }, async (req, reply) => {
    const { password, ...data } = req.body;
    if (await User.exists({ email: data.email.toLowerCase() })) throw new HttpError(409, 'Bu e-posta zaten kayıtlı');
    const user = new User(data);
    await user.setPassword(password);
    await user.save();
    return reply.code(201).send(user);
  });

  app.put('/:id', { schema: { body: userBody } }, async (req) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFound('Kullanıcı');
    const { password, ...data } = req.body;
    if (String(user._id) === String(req.currentUser._id) && (data.active === false || data.role === 'teacher')) {
      throw new HttpError(400, 'Kendi hesabınızı pasif yapamaz veya yetkinizi düşüremezsiniz');
    }
    Object.assign(user, data);
    if (password) await user.setPassword(password);
    await user.save();
    return user;
  });

  app.delete('/:id', async (req, reply) => {
    if (String(req.params.id) === String(req.currentUser._id)) throw new HttpError(400, 'Kendi hesabınızı silemezsiniz');
    const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!user) throw notFound('Kullanıcı');
    return reply.code(204).send(); // Silme yerine pasifleştirme (veri bütünlüğü)
  });
}
