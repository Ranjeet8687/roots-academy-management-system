import { Types } from 'mongoose';
import { ICourse } from '../models/course.model';
import { IDPP } from '../models/dpp.model';
import DPP from '../models/dpp.model';
import { CourseAccessService } from './course-access.service';

/**
 * DPP with populated course field
 */
interface IDPPWithCourse extends Omit<IDPP, 'course'> {
  course: ICourse;
}

/**
 * DPPAccessService - Handles DPP-specific access control
 * Reuses CourseAccessService for enrollment verification
 */
export class DPPAccessService {
  /**
   * Check if a student has access to a specific DPP
   * Student must have active enrollment in the DPP's course
   * DPP must be published and active (unless admin/faculty)
   */
  static async studentCanAccessDPP(
    userId: string | Types.ObjectId,
    dppId: string | Types.ObjectId
  ): Promise<{ hasAccess: boolean; dpp?: IDPPWithCourse; reason?: string }> {
    const dpp = await DPP.findById(dppId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as IDPPWithCourse | null;

    if (!dpp) {
      return { hasAccess: false, reason: 'DPP not found' };
    }

    // Check if DPP is published and active
    if (!dpp.isPublished || !dpp.isActive) {
      return { hasAccess: false, dpp, reason: 'DPP is not available' };
    }

    // Check if student has active enrollment in the course
    const hasCourseAccess = await CourseAccessService.studentHasCourseAccess(userId, dpp.course._id);

    if (!hasCourseAccess) {
      return { hasAccess: false, dpp, reason: 'No active enrollment in this course' };
    }

    return { hasAccess: true, dpp };
  }

  /**
   * Get all published and active DPPs for a course that a student has access to
   * Returns DPPs only if student has active enrollment in the course
   */
  static async getStudentCourseDPPs(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId
  ): Promise<IDPP[]> {
    // First verify student has access to the course
    const hasAccess = await CourseAccessService.studentHasCourseAccess(userId, courseId);

    if (!hasAccess) {
      return [];
    }

    // Return published and active DPPs for the course, ordered by scheduled date
    const dpps = await DPP.find({
      course: courseId,
      isPublished: true,
      isActive: true
    })
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as IDPP[];

    return dpps;
  }

  /**
   * Get a DPP by ID with course population (for admin/faculty)
   */
  static async getDPPWithCourse(dppId: string | Types.ObjectId): Promise<IDPPWithCourse | null> {
    return DPP.findById(dppId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as unknown as IDPPWithCourse | null;
  }

  /**
   * Get all DPPs for a course (admin/faculty view - includes unpublished/inactive)
   */
  static async getAllCourseDPPs(courseId: string | Types.ObjectId): Promise<IDPP[]> {
    const dpps = await DPP.find({ course: courseId })
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as IDPP[];

    return dpps;
  }
}