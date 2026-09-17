import { Request, Response } from 'express';
import { Types } from 'mongoose';
import LiveClass from '../models/live-class.model';
import Course from '../models/course.model';
import User, { UserRole } from '../models/user.model';
import { LiveClassAccessService } from '../services/live-class-access.service';
import { CourseAccessService } from '../services/course-access.service';
import { z } from 'zod';

// Validation schemas
const LiveClassCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID'),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional(),
  scheduledStart: z.string().datetime({ offset: true }),
  scheduledEnd: z.string().datetime({ offset: true }),
  meetingUrl: z.string().url('Invalid meeting URL'),
  platform: z.string().max(50).optional()
}).refine((data) => new Date(data.scheduledStart) < new Date(data.scheduledEnd), {
  message: 'scheduledStart must be before scheduledEnd',
  path: ['scheduledStart']
});

const LiveClassUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  scheduledStart: z.string().datetime({ offset: true }).optional(),
  scheduledEnd: z.string().datetime({ offset: true }).optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional(),
  platform: z.string().max(50).optional(),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional()
}).refine((data) => {
  if (data.scheduledStart && data.scheduledEnd) {
    return new Date(data.scheduledStart) < new Date(data.scheduledEnd);
  }
  return true;
}, {
  message: 'scheduledStart must be before scheduledEnd',
  path: ['scheduledStart']
});

const LiveClassPublishSchema = z.object({
  isPublished: z.boolean()
});

const LiveClassActivateSchema = z.object({
  isActive: z.boolean()
});

const LiveClassParamsSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid live class ID')
});

const CourseParamsSchema = z.object({
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID')
});

// ADMIN: Create a new live class
export const createLiveClass = async (req: Request, res: Response) => {
  try {
    const validatedData = LiveClassCreateSchema.parse(req.body);

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

    const liveClass = new LiveClass({
      ...validatedData,
      course: validatedData.courseId,
      faculty: validatedData.facultyId,
      scheduledStart: new Date(validatedData.scheduledStart),
      scheduledEnd: new Date(validatedData.scheduledEnd)
    });

    await liveClass.save();

    // Populate course for response
    await liveClass.populate('course');

    res.status(201).json(liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create live class' });
  }
};

// ADMIN: Get all live classes (with optional filters)
export const getAllLiveClasses = async (req: Request, res: Response) => {
  try {
    const { courseId, facultyId, isPublished, isActive, page = '1', limit = '20' } = req.query;

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
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [liveClasses, total] = await Promise.all([
      LiveClass.find(filter)
        .populate('course', 'name slug')
        .populate('faculty', 'name email')
        .sort({ course: 1, scheduledStart: 1, createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LiveClass.countDocuments(filter)
    ]);

    res.json({
      data: liveClasses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
};

// ADMIN: Get a specific live class by ID
export const getLiveClassById = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);

    const liveClass = await LiveClass.findById(id)
      .populate('course', 'name slug isActive')
      .populate('faculty', 'name email')
      .lean();

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch live class' });
  }
};

// ADMIN: Update a live class
export const updateLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);
    const validatedData = LiveClassUpdateSchema.parse(req.body);

    // Verify faculty if being updated
    if (validatedData.facultyId) {
      const faculty = await User.findById(validatedData.facultyId);
      if (!faculty || faculty.role !== UserRole.FACULTY) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
    }

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.scheduledStart) {
      updateData.scheduledStart = new Date(validatedData.scheduledStart);
    }
    if (validatedData.scheduledEnd) {
      updateData.scheduledEnd = new Date(validatedData.scheduledEnd);
    }
    if (validatedData.facultyId !== undefined) {
      updateData.faculty = validatedData.facultyId;
    }

    const liveClass = await LiveClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update live class' });
  }
};

// ADMIN: Delete a live class
export const deleteLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);

    const liveClass = await LiveClass.findByIdAndDelete(id);

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to delete live class' });
  }
};

// ADMIN: Publish/unpublish a live class
export const toggleLiveClassPublish = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);
    const { isPublished } = LiveClassPublishSchema.parse(req.body);

    const liveClass = await LiveClass.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update live class publish status' });
  }
};

// ADMIN: Activate/deactivate a live class
export const toggleLiveClassActivate = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);
    const { isActive } = LiveClassActivateSchema.parse(req.body);

    const liveClass = await LiveClass.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update live class active status' });
  }
};

// STUDENT: Get published/active live classes for a course (must be enrolled)
export const getStudentCourseLiveClasses = async (req: Request, res: Response) => {
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

    // For ADMIN/FACULTY, they can view all live classes (including unpublished/inactive)
    // But for this endpoint, we only return published and active for students
    const isAdminOrFaculty = user.role === UserRole.ADMIN || user.role === UserRole.FACULTY;

    const liveClasses = await LiveClass.find({
      course: courseId,
      isPublished: isAdminOrFaculty ? { $in: [true, false] } : true,
      isActive: isAdminOrFaculty ? { $in: [true, false] } : true
    })
      .sort({ scheduledStart: 1, createdAt: 1 })
      .lean();

    res.json(liveClasses);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch course live classes' });
  }
};

// STUDENT: Get a specific live class (must be enrolled and live class published/active)
export const getStudentLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = LiveClassParamsSchema.parse(req.params);
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await LiveClassAccessService.studentCanAccessLiveClass(user.userId, id);

    if (!result.hasAccess) {
      const statusCode = result.reason === 'Live class not found' ? 404 : 403;
      return res.status(statusCode).json({ error: result.reason });
    }

    res.json(result.liveClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch live class' });
  }
};