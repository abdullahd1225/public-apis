import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    subject: { type: String, trim: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const HOMEWORK_STATUSES = ['done', 'partial', 'not_done'];

// Her öğrencinin her ödev için kontrol sonucu (tek kayıt)
const homeworkCheckSchema = new mongoose.Schema(
  {
    homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    status: { type: String, enum: HOMEWORK_STATUSES, required: true },
    note: String,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
homeworkCheckSchema.index({ homework: 1, student: 1 }, { unique: true });

export const Homework = mongoose.model('Homework', homeworkSchema);
export const HomeworkCheck = mongoose.model('HomeworkCheck', homeworkCheckSchema);
