import { Classroom } from './classroom.model.js';
import { Student } from '../students/student.model.js';
import { classroomScope, assertClassroomAccess } from '../../utils/access.js';
import { HttpError } from '../../utils/errors.js';

const body = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    academicYear: { type: 'string', minLength: 4 },
    teacher: { type: 'string' },
    subjects: { type: 'array', items: { type: 'string' } },
    weeklyLessonHours: { type: 'number', minimum: 0 },
    description: { type: 'string' },
  },
};

export default async function classroomRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (req) => {
    const list = await Classroom.find(classroomScope(req.currentUser)).populate('teacher', 'name email').sort({ name: 1 }).lean();
    const counts = await Student.aggregate([{ $match: { active: true } }, { $group: { _id: '$classroom', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    return list.map((c) => ({ ...c, studentCount: map[String(c._id)] || 0 }));
  });

  app.get('/:id', async (req) => {
    const c = await assertClassroomAccess(req.currentUser, req.params.id);
    return c.populate('teacher', 'name email');
  });

  // Sınıf açma/silme admin işi; öğretmen kendi sınıfının ders listesini güncelleyebilir
  app.post('/', { preHandler: app.requireRole('admin'), schema: { body: { ...body, required: ['name', 'academicYear', 'teacher'] } } }, async (req, reply) => {
    if (await Classroom.exists({ name: req.body.name, academicYear: req.body.academicYear })) throw new HttpError(409, 'Bu sınıf bu yıl için zaten var');
    return reply.code(201).send(await Classroom.create(req.body));
  });

  app.put('/:id', { schema: { body } }, async (req) => {
    const c = await assertClassroomAccess(req.currentUser, req.params.id);
    const data = { ...req.body };
    if (req.currentUser.role !== 'admin') delete data.teacher;
    Object.assign(c, data);
    return c.save();
  });

  app.delete('/:id', { preHandler: app.requireRole('admin') }, async (req, reply) => {
    if (await Student.exists({ classroom: req.params.id, active: true })) throw new HttpError(400, 'Sınıfta aktif öğrenci varken silinemez');
    await Classroom.findByIdAndDelete(req.params.id);
    return reply.code(204).send();
  });
}
