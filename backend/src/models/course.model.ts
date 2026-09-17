import mongoose, { Document, Schema } from 'mongoose';

export enum CourseType {
  JEE = 'JEE',
  NEET = 'NEET',
  FOUNDATION = 'FOUNDATION',
  MHT_CET = 'MHT_CET',
  CRASH_COURSE = 'CRASH_COURSE',
  DROPPER = 'DROPPER'
}

export interface ICourse extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: [
        'JEE (Main & Advanced)',
        'NEET (UG)',
        'Foundation (6-10)',
        'MHT CET',
        'Crash Course JEE/NEET',
        'DROPPER JEE/NEET'
      ]
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure slug is properly formatted
CourseSchema.pre('validate', function(this: ICourse, next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

export default mongoose.model<ICourse>('Course', CourseSchema);