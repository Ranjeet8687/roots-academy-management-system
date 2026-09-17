import { Types } from 'mongoose';
import { ICourse } from '../models/course.model';
import { ILecture } from '../models/lecture.model';
import Lecture from '../models/lecture.model';
import { CourseAccessService } from './course-access.service';

/**
 * Lecture with populated course field
 */
interface ILectureWithCourse extends Omit<ILecture, 'course'> {
  course: ICourse;
}

/**
 * LectureAccessService - Handles lecture-specific access control
 * Reuses CourseAccessService for enrollment verification
 */
export class LectureAccessService {
  /**
   * Check if a student has access to a specific lecture
   * Student must have active enrollment in the lecture's course
   * Lecture must be published (unless admin/faculty)
   */
  static async studentCanAccessLecture(
    userId: string | Types.ObjectId,
    lectureId: string | Types.ObjectId
  ): Promise<{ hasAccess: boolean; lecture?: ILectureWithCourse; reason?: string }> {
    const lecture = await Lecture.findById(lectureId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as ILectureWithCourse | null;

    if (!lecture) {
      return { hasAccess: false, reason: 'Lecture not found' };
    }

    // Check if lecture is published
    if (!lecture.isPublished) {
      return { hasAccess: false, lecture, reason: 'Lecture is not published' };
    }

    // Check if student has active enrollment in the course
    const hasCourseAccess = await CourseAccessService.studentHasCourseAccess(userId, lecture.course._id);

    if (!hasCourseAccess) {
      return { hasAccess: false, lecture, reason: 'No active enrollment in this course' };
    }

    return { hasAccess: true, lecture };
  }

  /**
   * Get all published lectures for a course that a student has access to
   * Returns lectures only if student has active enrollment in the course
   */
  static async getStudentCourseLectures(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId
  ): Promise<ILecture[]> {
    // First verify student has access to the course
    const hasAccess = await CourseAccessService.studentHasCourseAccess(userId, courseId);

    if (!hasAccess) {
      return [];
    }

    // Return published lectures for the course, ordered by order field
    const lectures = await Lecture.find({
      course: courseId,
      isPublished: true
    })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as ILecture[];

    return lectures;
  }

  /**
   * Get a lecture by ID with course population (for admin/faculty)
   */
  static async getLectureWithCourse(lectureId: string | Types.ObjectId): Promise<ILectureWithCourse | null> {
    return Lecture.findById(lectureId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as unknown as ILectureWithCourse | null;
  }

  /**
   * Get all lectures for a course (admin/faculty view - includes unpublished)
   */
  static async getAllCourseLectures(courseId: string | Types.ObjectId): Promise<ILecture[]> {
    const lectures = await Lecture.find({ course: courseId })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec() as unknown as ILecture[];

    return lectures;
  }
}