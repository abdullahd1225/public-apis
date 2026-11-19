import { Lesson } from './lesson.model.js';
import { accessibleClassroomIds, assertClassroomAccess } from '../../utils/access.js';
import { notFound } from '../../utils/errors.js';
import { weekStart, parseDay } from '../../utils/date.js';

const body = {
  type: 'object',
  properties: {
    classroom: { type: 'string' },
    subject: { type: 'string', minLength: 1 },
    date: { type: 'string' },
    hours: { type: 'number', minimum: 0 },
    topic: { type: 'string' },
    status: { type: 'string', enum: ['planned', 'done', 'cancelled'] },
    absentStudents: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
};

async function loadLesson(user, id) {
  const l = await Lesson.findById(id);
  if (!l) throw notFound('Ders');
  await assertClassroomAccess(user, l.classroom);
  return l;
}

export default async function lessonRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  // ?classroom=..&week=2026-11-16 → o haftanın dersleri
  app.get('/', async (req) => {
    const { classroom, week } = req.query;
    const filter = {};
    if (classroom) {
      await assertClassroomAccess(req.currentUser, classroom);
      filter.classroom = classroom;
    } else filter.classroom = { $in: await accessibleClassroomIds(req.currentUser) };
    if (week) filter.weekStart = weekStart(week);
    return Lesson.find(filter).populate('classroom', 'name').sort({ date: 1 });
  });

  app.post('/', { schema: { body: { ...body, required: ['classroom', 'subject', 'date'] } } }, async (req, reply) => {
    await assertClassroomAccess(req.currentUser, req.body.classroom);
    const lesson = await Lesson.create({ ...req.body, date: parseDay(req.body.date), weekStart: weekStart(req.body.date), teacher: req.currentUser._id });
    return reply.code(201).send(lesson);
  });

  app.put('/:id', { schema: { body } }, async (req) => {
    const l = await loadLesson(req.currentUser, req.params.id);
    const { classroom, ...data } = req.body;
    Object.assign(l, data);
    if (data.date) {
      l.date = parseDay(data.date);
      l.weekStart = weekStart(data.date);
    }
    return l.save();
  });

  app.delete('/:id', async (req, reply) => {
    const l = await loadLesson(req.currentUser, req.params.id);
    await l.deleteOne();
    return reply.code(204).send();
  });
}
