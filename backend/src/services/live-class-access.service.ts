import { Types } from 'mongoose';
import { ICourse } from '../models/course.model';
import { ILiveClass } from '../models/live-class.model';
import LiveClass from '../models/live-class.model';
import { CourseAccessService } from './course-access.service';

/**
 * LiveClass with populated course field
 */
interface ILiveClassWithCourse extends Omit<ILiveClass, 'course'> {
  course: ICourse;
}

/**
 * LiveClassAccessService - Handles live class-specific access control
 * Reuses CourseAccessService for enrollment verification
 */
export class LiveClassAccessService {
  /**
   * Check if a student has access to a specific live class
   * Student must have active enrollment in the live class's course
   * Live class must be published and active (unless admin/faculty)
   */
  static async studentCanAccessLiveClass(
    userId: string | Types.ObjectId,
    liveClassId: string | Types.ObjectId
  ): Promise<{ hasAccess: boolean; liveClass?: ILiveClassWithCourse; reason?: string }> {
    const liveClass = await LiveClass.findById(liveClassId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as ILiveClassWithCourse | null;

    if (!liveClass) {
      return { hasAccess: false, reason: 'Live class not found' };
    }

    // Check if live class is published and active
    if (!liveClass.isPublished || !liveClass.isActive) {
      return { hasAccess: false, liveClass, reason: 'Live class is not available' };
    }

    // Check if student has active enrollment in the course
    const hasCourseAccess = await CourseAccessService.studentHasCourseAccess(userId, liveClass.course._id);

    if (!hasCourseAccess) {
      return { hasAccess: false, liveClass, reason: 'No active enrollment in this course' };
    }

    return { hasAccess: true, liveClass };
  }

  /**
   * Get all published and active live classes for a course that a student has access to
   * Returns live classes only if student has active enrollment in the course
   */
  static async getStudentCourseLiveClasses(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId
  ): Promise<ILiveClass[]> {
    // First verify student has access to the course
    const hasAccess = await CourseAccessService.studentHasCourseAccess(userId, courseId);

    if (!hasAccess) {
      return [];
    }

    // Return published and active live classes for the course, ordered by scheduled start
    const liveClasses = await LiveClass.find({
      course: courseId,
      isPublished: true,
      isActive: true
    })
      .sort({ scheduledStart: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as ILiveClass[];

    return liveClasses;
  }

  /**
   * Get a live class by ID with course population (for admin/faculty)
   */
  static async getLiveClassWithCourse(liveClassId: string | Types.ObjectId): Promise<ILiveClassWithCourse | null> {
    return LiveClass.findById(liveClassId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as unknown as ILiveClassWithCourse | null;
  }

  /**
   * Get all live classes for a course (admin/faculty view - includes unpublished/inactive)
   */
  static async getAllCourseLiveClasses(courseId: string | Types.ObjectId): Promise<ILiveClass[]> {
    const liveClasses = await LiveClass.find({ course: courseId })
      .sort({ scheduledStart: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as ILiveClass[];

    return liveClasses;
  }
}