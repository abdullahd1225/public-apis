import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Örn: 5-A
    academicYear: { type: String, required: true, trim: true }, // Örn: 2026-2027
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{ type: String, trim: true }], // Bu sınıfta takip edilen dersler
    weeklyLessonHours: { type: Number, default: 0 }, // Haftalık planlanan ders saati
    description: String,
  },
  { timestamps: true }
);
classroomSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export const Classroom = mongoose.model('Classroom', classroomSchema);
