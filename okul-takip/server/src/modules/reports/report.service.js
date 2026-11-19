import mongoose from 'mongoose';
import { Homework, HomeworkCheck } from '../homeworks/homework.model.js';
import { Student } from '../students/student.model.js';
import { Lesson } from '../lessons/lesson.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { weekStart } from '../../utils/date.js';

/**
 * Başarı oranı: (yaptı + eksik/2) / değerlendirilen ödev sayısı
 * (teslim tarihi geçmiş veya kontrolü yapılmış ödevler).
 * Kontrol edilmemiş geçmiş ödevler "kontrol bekliyor" olarak ayrıca raporlanır.
 */
export const completionRate = (done, partial, total) => (total ? Math.round(((done + partial * 0.5) / total) * 100) : null);

export async function studentHomeworkStats(studentIds, classroomIds) {
  const now = new Date();
  const homeworks = await Homework.find({ classroom: { $in: classroomIds } }).select('_id classroom dueDate').lean();
  const checks = await HomeworkCheck.find({ student: { $in: studentIds }, homework: { $in: homeworks.map((h) => h._id) } }).lean();
  const students = await Student.find({ _id: { $in: studentIds } }).lean();

  return students.map((s) => {
    const hws = homeworks.filter((h) => String(h.classroom) === String(s.classroom));
    const mine = checks.filter((c) => String(c.student) === String(s._id));
    const checkedIds = new Set(mine.map((c) => String(c.homework)));
    // Değerlendirmeye giren ödevler: teslim tarihi geçmiş VEYA erken kontrol edilmiş olanlar
    const due = hws.filter((h) => h.dueDate <= now || checkedIds.has(String(h._id)));
    const byStatus = { done: 0, partial: 0, not_done: 0 };
    mine.forEach((c) => byStatus[c.status]++);
    const pending = due.filter((h) => !checkedIds.has(String(h._id))).length;
    return {
      student: { _id: s._id, firstName: s.firstName, lastName: s.lastName, studentNo: s.studentNo, parentPhone: s.parentPhone, parentEmail: s.parentEmail },
      totalAssigned: hws.length,
      totalDue: due.length,
      ...byStatus,
      pending,
      rate: completionRate(byStatus.done, byStatus.partial, due.length),
    };
  });
}

export async function weeklyLessonStats(classroomIds, weeks = 12) {
  const from = weekStart(new Date());
  from.setDate(from.getDate() - 7 * (weeks - 1));
  const rows = await Lesson.aggregate([
    { $match: { classroom: { $in: classroomIds.map((id) => new mongoose.Types.ObjectId(String(id))) }, weekStart: { $gte: from } } },
    {
      $group: {
        _id: '$weekStart',
        planned: { $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        doneHours: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, '$hours', 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ weekStart: r._id, planned: r.planned, done: r.done, cancelled: r.cancelled, doneHours: r.doneHours }));
}

export async function classroomReport(classroomId) {
  const classroom = await Classroom.findById(classroomId).populate('teacher', 'name').lean();
  const students = await Student.find({ classroom: classroomId, active: true }).select('_id').lean();
  const studentStats = await studentHomeworkStats(students.map((s) => s._id), [classroomId]);
  studentStats.sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101));
  const weekly = await weeklyLessonStats([classroomId]);
  const totals = studentStats.reduce(
    (t, s) => ({ done: t.done + s.done, partial: t.partial + s.partial, not_done: t.not_done + s.not_done, due: t.due + s.totalDue }),
    { done: 0, partial: 0, not_done: 0, due: 0 }
  );
  const absences = await Lesson.aggregate([
    { $match: { classroom: new mongoose.Types.ObjectId(String(classroomId)), status: 'done' } },
    { $unwind: '$absentStudents' },
    { $group: { _id: '$absentStudents', n: { $sum: 1 } } },
  ]);
  const absMap = Object.fromEntries(absences.map((a) => [String(a._id), a.n]));
  studentStats.forEach((s) => (s.absences = absMap[String(s.student._id)] || 0));
  return { classroom, students: studentStats, weekly, overallRate: completionRate(totals.done, totals.partial, totals.due), totals };
}

export async function studentReport(studentId) {
  const student = await Student.findById(studentId).populate('classroom', 'name academicYear').lean();
  const homeworks = await Homework.find({ classroom: student.classroom._id }).sort({ dueDate: -1 }).lean();
  const checks = await HomeworkCheck.find({ student: studentId }).lean();
  const map = Object.fromEntries(checks.map((c) => [String(c.homework), c]));
  const [stats] = await studentHomeworkStats([studentId], [student.classroom._id]);
  const absentLessons = await Lesson.find({ absentStudents: studentId, status: 'done' }).select('date subject topic').sort({ date: -1 }).lean();
  return {
    student,
    stats,
    homeworks: homeworks.map((h) => ({
      _id: h._id, title: h.title, subject: h.subject, dueDate: h.dueDate,
      status: map[String(h._id)]?.status || null, note: map[String(h._id)]?.note || '',
    })),
    absentLessons,
  };
}
