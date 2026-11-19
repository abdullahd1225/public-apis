import { Homework, HomeworkCheck, HOMEWORK_STATUSES } from './homework.model.js';
import { Student } from '../students/student.model.js';
import { accessibleClassroomIds, assertClassroomAccess } from '../../utils/access.js';
import { notFound } from '../../utils/errors.js';

const body = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    subject: { type: 'string' },
    classroom: { type: 'string' },
    assignedDate: { type: 'string' },
    dueDate: { type: 'string' },
  },
};

async function loadHomework(user, id) {
  const hw = await Homework.findById(id);
  if (!hw) throw notFound('Ödev');
  await assertClassroomAccess(user, hw.classroom);
  return hw;
}

export default async function homeworkRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  // Liste + her ödev için kontrol özeti
  app.get('/', async (req) => {
    const { classroom, subject } = req.query;
    const filter = {};
    if (classroom) {
      await assertClassroomAccess(req.currentUser, classroom);
      filter.classroom = classroom;
    } else filter.classroom = { $in: await accessibleClassroomIds(req.currentUser) };
    if (subject) filter.subject = subject;

    const list = (await Homework.find(filter).populate('classroom', 'name').sort({ dueDate: -1 }).lean()).filter((h) => h.classroom);
    const stats = await HomeworkCheck.aggregate([
      { $match: { homework: { $in: list.map((h) => h._id) } } },
      { $group: { _id: { hw: '$homework', s: '$status' }, n: { $sum: 1 } } },
    ]);
    const studentCounts = await Student.aggregate([
      { $match: { active: true, classroom: { $in: list.map((h) => h.classroom._id) } } },
      { $group: { _id: '$classroom', n: { $sum: 1 } } },
    ]);
    const sc = Object.fromEntries(studentCounts.map((c) => [String(c._id), c.n]));
    return list.map((h) => {
      const summary = { done: 0, partial: 0, not_done: 0 };
      stats.filter((s) => String(s._id.hw) === String(h._id)).forEach((s) => (summary[s._id.s] = s.n));
      const checked = summary.done + summary.partial + summary.not_done;
      return { ...h, summary: { ...summary, studentCount: sc[String(h.classroom._id)] || 0, checked } };
    });
  });

  app.get('/:id', async (req) => (await loadHomework(req.currentUser, req.params.id)).populate('classroom', 'name'));

  app.post('/', { schema: { body: { ...body, required: ['title', 'classroom', 'dueDate'] } } }, async (req, reply) => {
    await assertClassroomAccess(req.currentUser, req.body.classroom);
    const hw = await Homework.create({ ...req.body, teacher: req.currentUser._id });
    return reply.code(201).send(hw);
  });

  app.put('/:id', { schema: { body } }, async (req) => {
    const hw = await loadHomework(req.currentUser, req.params.id);
    const { classroom, ...data } = req.body; // Ödevin sınıfı değiştirilemez
    Object.assign(hw, data);
    return hw.save();
  });

  app.delete('/:id', async (req, reply) => {
    const hw = await loadHomework(req.currentUser, req.params.id);
    await HomeworkCheck.deleteMany({ homework: hw._id });
    await hw.deleteOne();
    return reply.code(204).send();
  });

  // Ödev kontrol listesi: sınıftaki tüm aktif öğrenciler + varsa durumları
  app.get('/:id/checks', async (req) => {
    const hw = await loadHomework(req.currentUser, req.params.id);
    const [students, checks] = await Promise.all([
      Student.find({ classroom: hw.classroom, active: true }).sort({ lastName: 1, firstName: 1 }).lean(),
      HomeworkCheck.find({ homework: hw._id }).lean(),
    ]);
    const map = Object.fromEntries(checks.map((c) => [String(c.student), c]));
    return students.map((s) => ({
      student: { _id: s._id, firstName: s.firstName, lastName: s.lastName, studentNo: s.studentNo },
      status: map[String(s._id)]?.status || null,
      note: map[String(s._id)]?.note || '',
    }));
  });

  // Toplu kontrol kaydı
  app.put(
    '/:id/checks',
    {
      schema: {
        body: {
          type: 'array',
          items: {
            type: 'object',
            required: ['student'],
            properties: {
              student: { type: 'string' },
              status: { type: ['string', 'null'], enum: [...HOMEWORK_STATUSES, null] },
              note: { type: 'string' },
            },
          },
        },
      },
    },
    async (req) => {
      const hw = await loadHomework(req.currentUser, req.params.id);
      const validIds = new Set((await Student.find({ classroom: hw.classroom }).select('_id').lean()).map((s) => String(s._id)));
      const ops = req.body
        .filter((c) => validIds.has(c.student))
        .map((c) =>
          c.status
            ? {
                updateOne: {
                  filter: { homework: hw._id, student: c.student },
                  update: { $set: { status: c.status, note: c.note || '', checkedBy: req.currentUser._id, checkedAt: new Date() } },
                  upsert: true,
                },
              }
            : { deleteOne: { filter: { homework: hw._id, student: c.student } } }
        );
      if (ops.length) await HomeworkCheck.bulkWrite(ops);
      return { saved: ops.length };
    }
  );
}
