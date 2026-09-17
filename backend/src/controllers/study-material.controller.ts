import { Request, Response } from 'express';
import { Types } from 'mongoose';
import StudyMaterial, { StudyMaterialType } from '../models/study-material.model';
import Course from '../models/course.model';
import User, { UserRole } from '../models/user.model';
import { StudyMaterialAccessService } from '../services/study-material-access.service';
import { CourseAccessService } from '../services/course-access.service';
import { z } from 'zod';

// Validation schemas
const StudyMaterialCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID'),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional(),
  materialType: z.nativeEnum(StudyMaterialType),
  resourceUrl: z.string().url('Invalid resource URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  subject: z.string().optional()
});

const StudyMaterialUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  materialType: z.nativeEnum(StudyMaterialType).optional(),
  resourceUrl: z.string().url('Invalid resource URL').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  subject: z.string().optional(),
  facultyId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid faculty ID').optional()
});

const StudyMaterialPublishSchema = z.object({
  isPublished: z.boolean()
});

const StudyMaterialActivateSchema = z.object({
  isActive: z.boolean()
});

const StudyMaterialParamsSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid study material ID')
});

const CourseParamsSchema = z.object({
  courseId: z.string().refine((val) => Types.ObjectId.isValid(val), 'Invalid course ID')
});

// ADMIN: Create a new Study Material
export const createStudyMaterial = async (req: Request, res: Response) => {
  try {
    const validatedData = StudyMaterialCreateSchema.parse(req.body);

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

    const studyMaterial = new StudyMaterial({
      ...validatedData,
      course: validatedData.courseId,
      faculty: validatedData.facultyId
    });

    await studyMaterial.save();

    // Populate course for response
    await studyMaterial.populate('course');

    res.status(201).json(studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create study material' });
  }
};

// ADMIN: Get all Study Materials (with optional filters)
export const getAllStudyMaterials = async (req: Request, res: Response) => {
  try {
    const { courseId, facultyId, materialType, isPublished, isActive, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = {};

    if (courseId && Types.ObjectId.isValid(courseId as string)) {
      filter.course = courseId;
    }
    if (facultyId && Types.ObjectId.isValid(facultyId as string)) {
      filter.faculty = facultyId;
    }
    if (materialType && Object.values(StudyMaterialType).includes(materialType as StudyMaterialType)) {
      filter.materialType = materialType;
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

    const [studyMaterials, total] = await Promise.all([
      StudyMaterial.find(filter)
        .populate('course', 'name slug')
        .populate('faculty', 'name email')
        .sort({ course: 1, createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      StudyMaterial.countDocuments(filter)
    ]);

    res.json({
      data: studyMaterials,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study materials' });
  }
};

// ADMIN: Get a specific Study Material by ID
export const getStudyMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);

    const studyMaterial = await StudyMaterial.findById(id)
      .populate('course', 'name slug isActive')
      .populate('faculty', 'name email')
      .lean();

    if (!studyMaterial) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    res.json(studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch study material' });
  }
};

// ADMIN: Update a Study Material
export const updateStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);
    const validatedData = StudyMaterialUpdateSchema.parse(req.body);

    // Verify faculty if being updated
    if (validatedData.facultyId) {
      const faculty = await User.findById(validatedData.facultyId);
      if (!faculty || faculty.role !== UserRole.FACULTY) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
    }

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.facultyId !== undefined) {
      updateData.faculty = validatedData.facultyId;
    }

    const studyMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!studyMaterial) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    res.json(studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update study material' });
  }
};

// ADMIN: Delete a Study Material
export const deleteStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);

    const studyMaterial = await StudyMaterial.findByIdAndDelete(id);

    if (!studyMaterial) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to delete study material' });
  }
};

// ADMIN: Publish/unpublish a Study Material
export const toggleStudyMaterialPublish = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);
    const { isPublished } = StudyMaterialPublishSchema.parse(req.body);

    const studyMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!studyMaterial) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    res.json(studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update study material publish status' });
  }
};

// ADMIN: Activate/deactivate a Study Material
export const toggleStudyMaterialActivate = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);
    const { isActive } = StudyMaterialActivateSchema.parse(req.body);

    const studyMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )
      .populate('course', 'name slug')
      .populate('faculty', 'name email')
      .lean();

    if (!studyMaterial) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    res.json(studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update study material active status' });
  }
};

// STUDENT: Get published/active Study Materials for a course (must be enrolled)
export const getStudentCourseStudyMaterials = async (req: Request, res: Response) => {
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

    // For ADMIN/FACULTY, they can view all Study Materials (including unpublished/inactive)
    // But for this endpoint, we only return published and active for students
    const isAdminOrFaculty = user.role === UserRole.ADMIN || user.role === UserRole.FACULTY;

    const studyMaterials = await StudyMaterial.find({
      course: courseId,
      isPublished: isAdminOrFaculty ? { $in: [true, false] } : true,
      isActive: isAdminOrFaculty ? { $in: [true, false] } : true
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(studyMaterials);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch course study materials' });
  }
};

// STUDENT: Get a specific Study Material (must be enrolled and Study Material published/active)
export const getStudentStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = StudyMaterialParamsSchema.parse(req.params);
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await StudyMaterialAccessService.studentCanAccessStudyMaterial(user.userId, id);

    if (!result.hasAccess) {
      const statusCode = result.reason === 'Study material not found' ? 404 : 403;
      return res.status(statusCode).json({ error: result.reason });
    }

    res.json(result.studyMaterial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch study material' });
  }
};