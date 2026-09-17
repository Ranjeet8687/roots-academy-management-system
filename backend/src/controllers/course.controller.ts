import { Request, Response } from 'express';
import Course, { ICourse } from '../models/course.model';
import { z } from 'zod';

// Validation schemas
const CourseCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

const CourseUpdateSchema = z.object({
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

// Create a new course (ADMIN only)
export const createCourse = async (req: Request, res: Response) => {
  try {
    const validatedData = CourseCreateSchema.parse(req.body);

    // Verify name is one of the allowed course names
    const allowedNames = [
      'JEE (Main & Advanced)',
      'NEET (UG)',
      'Foundation (6-10)',
      'MHT CET',
      'Crash Course JEE/NEET',
      'DROPPER JEE/NEET'
    ];

    if (!allowedNames.includes(validatedData.name)) {
      return res.status(400).json({
        error: 'Invalid course name',
        allowedValues: allowedNames
      });
    }

    const course = new Course(validatedData);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Get all active courses (public)
export const getActiveCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isActive: true }).sort('name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get a specific course by ID (public)
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.isActive) {
      return res.status(404).json({ error: 'Course is inactive' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Update a course (ADMIN only)
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const validatedData = CourseUpdateSchema.parse(req.body);
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update course' });
  }
};