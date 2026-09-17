import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './course.model';
import { IUser } from './user.model';

export interface ILiveClass extends Document {
  title: string;
  description?: string;
  course: ICourse['_id'];
  faculty?: IUser['_id'];
  scheduledStart: Date;
  scheduledEnd: Date;
  meetingUrl: string;
  platform?: string; // e.g., 'Zoom', 'Google Meet', 'Microsoft Teams', 'Custom'
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LiveClassSchema: Schema = new Schema(
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
    scheduledStart: {
      type: Date,
      required: true
    },
    scheduledEnd: {
      type: Date,
      required: true
    },
    meetingUrl: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      trim: true,
      maxlength: 50
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for efficient querying
LiveClassSchema.index({ course: 1, scheduledStart: 1 });
LiveClassSchema.index({ course: 1, isPublished: 1, isActive: 1 });
LiveClassSchema.index({ faculty: 1 });
LiveClassSchema.index({ scheduledStart: 1 });

export default mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);