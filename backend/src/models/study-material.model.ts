import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './course.model';
import { IUser } from './user.model';

export enum StudyMaterialType {
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  NOTES = 'NOTES',
  LINK = 'LINK',
  OTHER = 'OTHER'
}

export interface IStudyMaterial extends Document {
  title: string;
  description?: string;
  course: ICourse['_id'];
  faculty?: IUser['_id'];
  materialType: StudyMaterialType;
  resourceUrl: string;
  thumbnailUrl?: string;
  subject?: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudyMaterialSchema: Schema = new Schema(
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
    materialType: {
      type: String,
      enum: Object.values(StudyMaterialType),
      required: true
    },
    resourceUrl: {
      type: String,
      required: true,
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      trim: true
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
StudyMaterialSchema.index({ course: 1, isPublished: 1, isActive: 1 });
StudyMaterialSchema.index({ faculty: 1 });
StudyMaterialSchema.index({ materialType: 1 });
StudyMaterialSchema.index({ subject: 1 });

export default mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);