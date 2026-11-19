import { Student } from './student.model.js';
import { accessibleClassroomIds, assertClassroomAccess } from '../../utils/access.js';
import { notFound } from '../../utils/errors.js';

const body = {
  type: 'object',
  properties: {
    firstName: { type: 'string', minLength: 1 },
    lastName: { type: 'string', minLength: 1 },
    studentNo: { type: 'string' },
    classroom: { type: 'string' },
    parentName: { type: 'string' },
    parentPhone: { type: 'string' },
    parentEmail: { type: 'string', pattern: '^$|^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
    notes: { type: 'string' },
    active: { type: 'boolean' },
  },
};

async function loadStudent(user, id) {
  const s = await Student.findById(id);
  if (!s) throw notFound('Öğrenci');
  await assertClassroomAccess(user, s.classroom);
  return s;
}

export default async function studentRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (req) => {
    const { classroom, q, includePassive } = req.query;
    const filter = {};
    if (classroom) {
      await assertClassroomAccess(req.currentUser, classroom);
      filter.classroom = classroom;
    } else {
      filter.classroom = { $in: await accessibleClassroomIds(req.currentUser) };
    }
    if (!includePassive) filter.active = true;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { studentNo: rx }, { parentName: rx }];
    }
    return Student.find(filter).populate('classroom', 'name academicYear').sort({ lastName: 1, firstName: 1 });
  });

  app.get('/:id', async (req) => (await loadStudent(req.currentUser, req.params.id)).populate('classroom', 'name academicYear'));

  app.post('/', { schema: { body: { ...body, required: ['firstName', 'lastName', 'classroom'] } } }, async (req, reply) => {
    await assertClassroomAccess(req.currentUser, req.body.classroom);
    return reply.code(201).send(await Student.create(req.body));
  });

  app.put('/:id', { schema: { body } }, async (req) => {
    const s = await loadStudent(req.currentUser, req.params.id);
    if (req.body.classroom) await assertClassroomAccess(req.currentUser, req.body.classroom);
    Object.assign(s, req.body);
    return s.save();
  });

  app.delete('/:id', async (req, reply) => {
    const s = await loadStudent(req.currentUser, req.params.id);
    s.active = false; // Geçmiş ödev kayıtları korunur
    await s.save();
    return reply.code(204).send();
  });
}
