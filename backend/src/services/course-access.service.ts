import { Types } from 'mongoose';
import { ICourse } from '../models/course.model';
import Enrollment from '../models/enrollment.model';

export class CourseAccessService {
  /**
   * Checks if a student has active access to a specific course
   * @param userId - The student's user ID
   * @param courseId - The course ID to check access for
   * @returns boolean - Whether the student has active access
   */
  static async studentHasCourseAccess(userId: string | Types.ObjectId, courseId: string | Types.ObjectId): Promise<boolean> {
    // Only students can have course access
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      status: 'ACTIVE'
    });

    return !!enrollment;
  }

  /**
   * Gets all active courses for a student
   * @param userId - The student's user ID
   * @returns Array of course documents
   */
  static async getStudentActiveCourses(userId: string | Types.ObjectId): Promise<ICourse[]> {
    const enrollments = await Enrollment.find({
      student: userId,
      status: 'ACTIVE'
    }).populate<{ course: ICourse }>('course').lean();

    return enrollments
      .filter(enrollment => enrollment.course && enrollment.course.isActive)
      .map(enrollment => enrollment.course);
  }
}