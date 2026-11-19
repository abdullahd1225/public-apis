/**
 * Kullanım:
 *   npm run seed        → yalnızca admin hesabını oluşturur (yoksa)
 *   npm run seed:demo   → admin + örnek öğretmen, sınıf, öğrenci, ödev ve ders verisi
 */
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../modules/users/user.model.js';
import { Classroom } from '../modules/classrooms/classroom.model.js';
import { Student } from '../modules/students/student.model.js';
import { Homework, HomeworkCheck } from '../modules/homeworks/homework.model.js';
import { Lesson } from '../modules/lessons/lesson.model.js';
import { weekStart } from '../utils/date.js';

const demo = process.argv.includes('--demo');
await mongoose.connect(config.mongoUri);

async function ensureUser({ email, password, ...rest }) {
  let u = await User.findOne({ email });
  if (!u) {
    u = new User({ email, ...rest });
    await u.setPassword(password);
    await u.save();
    console.log(`✔ Kullanıcı oluşturuldu: ${email} / ${password}`);
  } else console.log(`• Kullanıcı zaten var: ${email}`);
  return u;
}

await ensureUser({ email: config.admin.email, password: config.admin.password, name: config.admin.name, role: 'admin' });

if (demo) {
  const teacher = await ensureUser({ email: 'ogretmen@okul.local', password: 'Ogretmen123!', name: 'Ayşe Yılmaz', role: 'teacher', branch: 'Sınıf Öğretmeni' });
  const year = '2026-2027';
  let cls = await Classroom.findOne({ name: '4-A', academicYear: year });
  if (!cls) {
    cls = await Classroom.create({ name: '4-A', academicYear: year, teacher: teacher._id, subjects: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler'], weeklyLessonHours: 30 });
    const names = [
      ['Elif', 'Kaya'], ['Mehmet', 'Demir'], ['Zeynep', 'Çelik'], ['Ali', 'Şahin'], ['Defne', 'Öztürk'],
      ['Emir', 'Aydın'], ['Ecrin', 'Arslan'], ['Yusuf', 'Doğan'], ['Asel', 'Koç'], ['Kerem', 'Kurt'],
    ];
    const students = await Student.insertMany(
      names.map(([f, l], i) => ({
        firstName: f, lastName: l, studentNo: String(101 + i), classroom: cls._id,
        parentName: `${l} Ailesi`, parentPhone: `0555 000 00 ${String(10 + i)}`, parentEmail: `veli${i + 1}@ornek.com`,
      }))
    );
    const statuses = ['done', 'done', 'done', 'partial', 'not_done'];
    for (let w = 6; w >= 1; w--) {
      const due = new Date(); due.setDate(due.getDate() - w * 7 + 3);
      const subject = cls.subjects[w % cls.subjects.length];
      const hw = await Homework.create({ title: `${subject} - Hafta ${7 - w} ödevi`, subject, classroom: cls._id, teacher: teacher._id, assignedDate: new Date(due.getTime() - 3 * 864e5), dueDate: due });
      await HomeworkCheck.insertMany(students.map((s, i) => ({ homework: hw._id, student: s._id, status: statuses[(i * 3 + w) % statuses.length], checkedBy: teacher._id })));
      for (let d = 0; d < 4; d++) {
        const date = new Date(weekStart(due)); date.setDate(date.getDate() + d);
        await Lesson.create({ classroom: cls._id, teacher: teacher._id, subject: cls.subjects[d], date, weekStart: weekStart(date), hours: 2, topic: `${cls.subjects[d]} konu ${7 - w}.${d + 1}`, status: d === 3 && w % 3 === 0 ? 'cancelled' : 'done', absentStudents: d === 0 ? [students[w % students.length]._id] : [] });
      }
    }
    const next = new Date(); next.setDate(next.getDate() + 4);
    await Homework.create({ title: 'Matematik - Kesirler çalışma kağıdı', subject: 'Matematik', classroom: cls._id, teacher: teacher._id, dueDate: next });
    console.log('✔ Demo verisi yüklendi (4-A sınıfı, 10 öğrenci, 7 ödev, 24 ders)');
  } else console.log('• Demo sınıfı zaten var, atlandı');
}

await mongoose.disconnect();
