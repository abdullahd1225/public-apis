import { Classroom } from '../classrooms/classroom.model.js';
import { Student } from '../students/student.model.js';
import { Homework } from '../homeworks/homework.model.js';
import { Lesson } from '../lessons/lesson.model.js';
import { User } from '../users/user.model.js';
import { accessibleClassroomIds, assertClassroomAccess } from '../../utils/access.js';
import { notFound } from '../../utils/errors.js';
import { weekStart } from '../../utils/date.js';
import { classroomReport, studentReport, studentHomeworkStats, weeklyLessonStats, completionRate } from './report.service.js';

const STATUS_TR = { done: 'Yaptı', partial: 'Eksik', not_done: 'Yapmadı' };
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default async function reportRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/dashboard', async (req) => {
    const ids = await accessibleClassroomIds(req.currentUser);
    const students = await Student.find({ classroom: { $in: ids }, active: true }).select('_id').lean();
    const stats = await studentHomeworkStats(students.map((s) => s._id), ids);
    const t = stats.reduce((a, s) => ({ done: a.done + s.done, partial: a.partial + s.partial, not_done: a.not_done + s.not_done, pending: a.pending + s.pending, due: a.due + s.totalDue }), { done: 0, partial: 0, not_done: 0, pending: 0, due: 0 });
    const thisWeek = weekStart(new Date());
    const [homeworkCount, lessonsThisWeek, upcoming, teacherCount] = await Promise.all([
      Homework.countDocuments({ classroom: { $in: ids } }),
      Lesson.find({ classroom: { $in: ids }, weekStart: thisWeek }).lean(),
      Homework.find({ classroom: { $in: ids }, dueDate: { $gte: new Date() } }).populate('classroom', 'name').sort({ dueDate: 1 }).limit(5).lean(),
      req.currentUser.role === 'admin' ? User.countDocuments({ role: 'teacher', active: true }) : null,
    ]);
    return {
      classroomCount: ids.length,
      studentCount: students.length,
      teacherCount,
      homeworkCount,
      homeworkTotals: t,
      overallRate: completionRate(t.done, t.partial, t.due),
      lessonsThisWeek: {
        planned: lessonsThisWeek.filter((l) => l.status === 'planned').length,
        done: lessonsThisWeek.filter((l) => l.status === 'done').length,
        cancelled: lessonsThisWeek.filter((l) => l.status === 'cancelled').length,
      },
      weekly: await weeklyLessonStats(ids, 8),
      atRisk: stats.filter((s) => s.rate !== null && s.rate < 50).sort((a, b) => a.rate - b.rate).slice(0, 5),
      upcoming,
    };
  });

  app.get('/classroom/:id', async (req) => {
    await assertClassroomAccess(req.currentUser, req.params.id);
    return classroomReport(req.params.id);
  });

  app.get('/classroom/:id/csv', async (req, reply) => {
    await assertClassroomAccess(req.currentUser, req.params.id);
    const r = await classroomReport(req.params.id);
    const head = ['Öğrenci No', 'Ad', 'Soyad', 'Veli Telefon', 'Veli E-posta', 'Verilen', 'Süresi Dolan', 'Yaptı', 'Eksik', 'Yapmadı', 'Kontrol Bekleyen', 'Başarı %', 'Devamsızlık'];
    const lines = r.students.map((s) =>
      [s.student.studentNo, s.student.firstName, s.student.lastName, s.student.parentPhone, s.student.parentEmail, s.totalAssigned, s.totalDue, s.done, s.partial, s.not_done, s.pending, s.rate ?? '-', s.absences].map(csvCell).join(';')
    );
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="sinif-raporu-${r.classroom.name}.csv"`);
    return '﻿' + [head.map(csvCell).join(';'), ...lines].join('\n');
  });

  app.get('/student/:id', async (req) => {
    const s = await Student.findById(req.params.id).lean();
    if (!s) throw notFound('Öğrenci');
    await assertClassroomAccess(req.currentUser, s.classroom);
    const r = await studentReport(req.params.id);
    r.homeworks.forEach((h) => (h.statusText = STATUS_TR[h.status] || 'Kontrol edilmedi'));
    return r;
  });

  // Admin genel bakış: sınıf bazlı karşılaştırma
  app.get('/overview', { preHandler: app.requireRole('admin') }, async () => {
    const classrooms = await Classroom.find().populate('teacher', 'name').lean();
    return Promise.all(
      classrooms.map(async (c) => {
        const r = await classroomReport(c._id);
        return { _id: c._id, name: c.name, academicYear: c.academicYear, teacher: c.teacher?.name, studentCount: r.students.length, overallRate: r.overallRate, totals: r.totals };
      })
    );
  });
}
