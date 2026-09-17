import { Request, Response } from 'express';
import { Types } from 'mongoose';
import DPP from '../models/dpp.model';
import { IDPPQuestion } from '../models/dpp.model';
import Course from '../models/course.model';
import User, { UserRole } from '../models/user.model';
import { DPPAccessService } from '../services/dpp-access.service';
import { CourseAccessService } from '../services/course-access.service';
import { z } from 'zod';

// Validation schemas
const DPPQuestionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  marks: z.number().int().min(0).default(1)
});

const DPPCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID'),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional(),
  questions: z.array(DPPQuestionSchema).min(1, 'At least one question is required'),
  scheduledDate: z.string().datetime({ offset: true })
});

const DPPUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  questions: z.array(DPPQuestionSchema).min(1, 'At least one question is required').optional(),
  scheduledDate: z.string().datetime({ offset: true }).optional(),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional()
});

const DPPPublishSchema = z.object({
  isPublished: z.boolean()
});

const DPPActivateSchema = z.object({
  isActive: z.boolean()
});

const DPPParamsSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid DPP ID')
});

const CourseParamsSchema = z.object({
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID')
});

// ADMIN: Create a new DPP
export const createDPP = async (req: Request, res: Response) => {
  try {
    const validatedData = DPPCreateSchema.parse(req.body);

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

    const dpp = new DPP({
      ...validatedData,
      course: validatedData.courseId,
      faculty: validatedData.facultyId,
      scheduledDate: new Date(validatedData.scheduledDate)
    });

    await dpp.save();

    // Populate course for response
    await dpp.populate('course');

    res.status(201).json(dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create DPP' });
  }
};

// ADMIN: Get all DPPs (with optional filters)
export const getAllDPPs = async (req: Request, res: Response) => {
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

    const [dpps, total] = await Promise.all([
      DPP.find(filter)
        .populate('course', 'name slug')
        .populate('faculty', 'name email')
        .sort({ course: 1, scheduledDate: 1, createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DPP.countDocuments(filter)
    ]);

    res.json({
      data: dpps,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DPPs' });
  }
};

// ADMIN: Get a specific DPP by ID
export const getDPPById = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);

    const dpp = await DPP.findById(id)
      .populate('course', 'name slug isActive')
      .populate('faculty', 'name email')
      .lean();

    if (!dpp) {
      return res.status(404).json({ error: 'DPP not found' });
    }

    res.json(dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch DPP' });
  }
};

// ADMIN: Update a DPP
export const updateDPP = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);
    const validatedData = DPPUpdateSchema.parse(req.body);

    // Verify faculty if being updated
    if (validatedData.facultyId) {
      const faculty = await User.findById(validatedData.facultyId);
      if (!faculty || faculty.role !== UserRole.FACULTY) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
    }

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate);
    }
    if (validatedData.facultyId !== undefined) {
      updateData.faculty = validatedData.facultyId;
    }

    const dpp = await DPP.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!dpp) {
      return res.status(404).json({ error: 'DPP not found' });
    }

    res.json(dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update DPP' });
  }
};

// ADMIN: Delete a DPP
export const deleteDPP = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);

    const dpp = await DPP.findByIdAndDelete(id);

    if (!dpp) {
      return res.status(404).json({ error: 'DPP not found' });
    }

    res.json({ message: 'DPP deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to delete DPP' });
  }
};

// ADMIN: Publish/unpublish a DPP
export const toggleDPPPublish = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);
    const { isPublished } = DPPPublishSchema.parse(req.body);

    const dpp = await DPP.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!dpp) {
      return res.status(404).json({ error: 'DPP not found' });
    }

    res.json(dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update DPP publish status' });
  }
};

// ADMIN: Activate/deactivate a DPP
export const toggleDPPActivate = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);
    const { isActive } = DPPActivateSchema.parse(req.body);

    const dpp = await DPP.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!dpp) {
      return res.status(404).json({ error: 'DPP not found' });
    }

    res.json(dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update DPP active status' });
  }
};

// STUDENT: Get published/active DPPs for a course (must be enrolled)
export const getStudentCourseDPPs = async (req: Request, res: Response) => {
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

    // For ADMIN/FACULTY, they can view all DPPs (including unpublished/inactive)
    // But for this endpoint, we only return published and active for students
    const isAdminOrFaculty = user.role === UserRole.ADMIN || user.role === UserRole.FACULTY;

    const dpps = await DPP.find({
      course: courseId,
      isPublished: isAdminOrFaculty ? { $in: [true, false] } : true,
      isActive: isAdminOrFaculty ? { $in: [true, false] } : true
    })
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean();

    res.json(dpps);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch course DPPs' });
  }
};

// STUDENT: Get a specific DPP (must be enrolled and DPP published/active)
export const getStudentDPP = async (req: Request, res: Response) => {
  try {
    const { id } = DPPParamsSchema.parse(req.params);
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await DPPAccessService.studentCanAccessDPP(user.userId, id);

    if (!result.hasAccess) {
      const statusCode = result.reason === 'DPP not found' ? 404 : 403;
      return res.status(statusCode).json({ error: result.reason });
    }

    res.json(result.dpp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch DPP' });
  }
};