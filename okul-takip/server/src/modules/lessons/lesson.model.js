import mongoose from 'mongoose';

// Haftalık ders takibi: işlenen/planlanan her ders oturumu
const lessonSchema = new mongoose.Schema(
  {
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    weekStart: { type: Date, required: true, index: true }, // Haftanın Pazartesi günü
    hours: { type: Number, default: 1, min: 0 },
    topic: { type: String, trim: true },
    status: { type: String, enum: ['planned', 'done', 'cancelled'], default: 'planned' },
    absentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    notes: String,
  },
  { timestamps: true }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
