import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Lecture from '../models/lecture.model';
import Course from '../models/course.model';
import User, { UserRole } from '../models/user.model';
import { LectureAccessService } from '../services/lecture-access.service';
import { CourseAccessService } from '../services/course-access.service';
import { z } from 'zod';

// Validation schemas
const LectureCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID'),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional(),
  videoUrl: z.string().url('Invalid video URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional()
});

const LectureUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional()
});

const LecturePublishSchema = z.object({
  isPublished: z.boolean()
});

const LectureParamsSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid lecture ID')
});

const CourseParamsSchema = z.object({
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID')
});

// ADMIN: Create a new lecture
export const createLecture = async (req: Request, res: Response) => {
  try {
    const validatedData = LectureCreateSchema.parse(req.body);

    // Verify course exists
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify faculty exists and has FACULTY role if provided
    if (validatedData.facultyId) {
      const faculty = await User.findById(validatedData.facultyId);
      if (!faculty || faculty.role !== UserRole.FACULTY) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
    }

    // Determine order if not provided (append to end)
    let order = validatedData.order;
    if (order === undefined) {
      const lastLecture = await Lecture.findOne({ course: validatedData.courseId })
        .sort({ order: -1 })
        .select('order');
      order = (lastLecture?.order ?? -1) + 1;
    }

    const lecture = new Lecture({
      ...validatedData,
      course: validatedData.courseId,
      faculty: validatedData.facultyId,
      order
    });

    await lecture.save();

    // Populate course for response
    await lecture.populate('course');

    res.status(201).json(lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create lecture' });
  }
};

// ADMIN: Get all lectures (with optional filters)
export const getAllLectures = async (req: Request, res: Response) => {
  try {
    const { courseId, facultyId, isPublished, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = {};

    if (courseId && Types.ObjectId.isValid(courseId as string)) {
      filter.course = courseId;
    }
    if (facultyId && Types.ObjectId.isValid(facultyId as string)) {
      filter.faculty = facultyId;
    }
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [lectures, total] = await Promise.all([
      Lecture.find(filter)
        .populate('course', 'name slug')
        .populate('faculty', 'name email')
        .sort({ course: 1, order: 1, createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lecture.countDocuments(filter)
    ]);

    res.json({
      data: lectures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lectures' });
  }
};

// ADMIN: Get a specific lecture by ID
export const getLectureById = async (req: Request, res: Response) => {
  try {
    const { id } = LectureParamsSchema.parse(req.params);

    const lecture = await Lecture.findById(id)
      .populate('course', 'name slug isActive')
      .populate('faculty', 'name email')
      .lean();

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch lecture' });
  }
};

// ADMIN: Update a lecture
export const updateLecture = async (req: Request, res: Response) => {
  try {
    const { id } = LectureParamsSchema.parse(req.params);
    const validatedData = LectureUpdateSchema.parse(req.body);

    // Verify faculty if being updated
    if (validatedData.facultyId) {
      const faculty = await User.findById(validatedData.facultyId);
      if (!faculty || faculty.role !== UserRole.FACULTY) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
    }

    const lecture = await Lecture.findByIdAndUpdate(
      id,
      { ...validatedData, faculty: validatedData.facultyId },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update lecture' });
  }
};

// ADMIN: Delete a lecture
export const deleteLecture = async (req: Request, res: Response) => {
  try {
    const { id } = LectureParamsSchema.parse(req.params);

    const lecture = await Lecture.findByIdAndDelete(id);

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to delete lecture' });
  }
};

// ADMIN: Publish/unpublish a lecture
export const toggleLecturePublish = async (req: Request, res: Response) => {
  try {
    const { id } = LectureParamsSchema.parse(req.params);
    const { isPublished } = LecturePublishSchema.parse(req.body);

    const lecture = await Lecture.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update lecture publish status' });
  }
};

// STUDENT: Get published lectures for a course (must be enrolled)
export const getStudentCourseLectures = async (req: Request, res: Response) => {
  try {
    const { courseId } = CourseParamsSchema.parse(req.params);
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Students can only access their own courses
    if (user.role === UserRole.STUDENT) {
      const hasAccess = await CourseAccessService.studentHasCourseAccess(user.userId, courseId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    }

    // For ADMIN/FACULTY, they can view all lectures (including unpublished)
    // But for this endpoint, we only return published for students
    const isAdminOrFaculty = user.role === UserRole.ADMIN || user.role === UserRole.FACULTY;

    const lectures = await Lecture.find({
      course: courseId,
      isPublished: isAdminOrFaculty ? { $in: [true, false] } : true
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json(lectures);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch course lectures' });
  }
};

// STUDENT: Get a specific lecture (must be enrolled and lecture published)
export const getStudentLecture = async (req: Request, res: Response) => {
  try {
    const { id } = LectureParamsSchema.parse(req.params);
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await LectureAccessService.studentCanAccessLecture(user.userId, id);

    if (!result.hasAccess) {
      const statusCode = result.reason === 'Lecture not found' ? 404 : 403;
      return res.status(statusCode).json({ error: result.reason });
    }

    res.json(result.lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch lecture' });
  }
};