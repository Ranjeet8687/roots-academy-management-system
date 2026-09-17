import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './course.model';
import { IUser } from './user.model';

export interface IDPPQuestion {
  questionText: string;
  options?: string[]; // For MCQ questions
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export interface IDPP extends Document {
  title: string;
  description?: string;
  course: ICourse['_id'];
  faculty?: IUser['_id'];
  questions: IDPPQuestion[];
  scheduledDate: Date;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DPPQuestionSchema: Schema = new Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      type: String,
      trim: true
    }],
    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    }
  },
  { _id: false }
);

const DPPSchema: Schema = new Schema(
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
    questions: {
      type: [DPPQuestionSchema],
      default: [],
      validate: {
        validator: function(questions: IDPPQuestion[]) {
          return questions.length > 0;
        },
        message: 'At least one question is required'
      }
    },
    scheduledDate: {
      type: Date,
      required: true
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
DPPSchema.index({ course: 1, scheduledDate: 1 });
DPPSchema.index({ course: 1, isPublished: 1, isActive: 1 });
DPPSchema.index({ faculty: 1 });
DPPSchema.index({ scheduledDate: 1 });

export default mongoose.model<IDPP>('DPP', DPPSchema);