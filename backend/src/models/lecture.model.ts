import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './course.model';
import { IUser } from './user.model';

export interface ILecture extends Document {
  title: string;
  description?: string;
  course: ICourse['_id'];
  faculty?: IUser['_id'];
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      min: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for efficient querying
LectureSchema.index({ course: 1, order: 1 });
LectureSchema.index({ course: 1, isPublished: 1 });
LectureSchema.index({ faculty: 1 });

export default mongoose.model<ILecture>('Lecture', LectureSchema);