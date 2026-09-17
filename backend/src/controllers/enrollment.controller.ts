import { Request, Response } from 'express';
import Enrollment, { IEnrollment, EnrollmentStatus } from '../models/enrollment.model';
import Course from '../models/course.model';
import { CourseAccessService } from '../services/course-access.service';
import { z } from 'zod';

// Validation schemas
const EnrollmentCreateSchema = z.object({
  studentId: z.string(),
  courseId: z.string()
});

// Enroll a student in a course (ADMIN only)
export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = EnrollmentCreateSchema.parse(req.body);

    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ error: 'Course not found or inactive' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      // If it exists but is inactive, reactivate it
      if (existingEnrollment.status !== EnrollmentStatus.ACTIVE) {
        existingEnrollment.status = EnrollmentStatus.ACTIVE;
        await existingEnrollment.save();
        return res.json(existingEnrollment);
      }
      return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      status: EnrollmentStatus.ACTIVE
    });

    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to enroll student' });
  }
};

// Get student's active enrollments (STUDENT: own, ADMIN: any)
export const getStudentEnrollments = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;

    // Students can only access their own enrollments
    if (req.user?.role === 'STUDENT' && req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other students\' enrollments' });
    }

    const enrollments = await Enrollment.find({
      student: studentId,
      status: EnrollmentStatus.ACTIVE
    }).populate('course');

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

// Get courses for current authenticated student
export const getMyCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const courses = await CourseAccessService.getStudentActiveCourses(user.userId);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your courses' });
  }
};