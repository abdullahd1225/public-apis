import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    studentNo: { type: String, trim: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    notes: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const Student = mongoose.model('Student', studentSchema);
