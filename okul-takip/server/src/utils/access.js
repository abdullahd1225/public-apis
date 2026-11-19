import { Classroom } from '../modules/classrooms/classroom.model.js';
import { forbidden, notFound } from './errors.js';

/** Kullanıcının erişebileceği sınıf filtresi. Admin her şeyi görür. */
export function classroomScope(user) {
  return user.role === 'admin' ? {} : { teacher: user._id };
}

/** Kullanıcının erişebildiği sınıf id listesi */
export async function accessibleClassroomIds(user) {
  const list = await Classroom.find(classroomScope(user)).select('_id').lean();
  return list.map((c) => c._id);
}

/** Tek bir sınıfa erişimi doğrular, sınıfı döndürür */
export async function assertClassroomAccess(user, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) throw notFound('Sınıf');
  if (user.role !== 'admin' && String(classroom.teacher) !== String(user._id)) throw forbidden();
  return classroom;
}
