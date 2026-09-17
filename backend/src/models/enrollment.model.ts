import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './course.model';
import { IUser } from './user.model';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED'
}

export interface IEnrollment extends Document {
  student: IUser['_id'];
  course: ICourse['_id'];
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate active enrollments for the same student/course
EnrollmentSchema.index({ student: 1, course: 1, status: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);