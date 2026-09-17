import { Types } from 'mongoose';
import { ICourse } from '../models/course.model';
import { IStudyMaterial } from '../models/study-material.model';
import StudyMaterial from '../models/study-material.model';
import { CourseAccessService } from './course-access.service';

/**
 * StudyMaterial with populated course field
 */
interface IStudyMaterialWithCourse extends Omit<IStudyMaterial, 'course'> {
  course: ICourse;
}

/**
 * StudyMaterialAccessService - Handles StudyMaterial-specific access control
 * Reuses CourseAccessService for enrollment verification
 */
export class StudyMaterialAccessService {
  /**
   * Check if a student has access to a specific StudyMaterial
   * Student must have active enrollment in the StudyMaterial's course
   * StudyMaterial must be published and active (unless admin/faculty)
   */
  static async studentCanAccessStudyMaterial(
    userId: string | Types.ObjectId,
    studyMaterialId: string | Types.ObjectId
  ): Promise<{ hasAccess: boolean; studyMaterial?: IStudyMaterialWithCourse; reason?: string }> {
    const studyMaterial = await StudyMaterial.findById(studyMaterialId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as IStudyMaterialWithCourse | null;

    if (!studyMaterial) {
      return { hasAccess: false, reason: 'Study material not found' };
    }

    // Check if StudyMaterial is published and active
    if (!studyMaterial.isPublished || !studyMaterial.isActive) {
      return { hasAccess: false, studyMaterial, reason: 'Study material is not available' };
    }

    // Check if student has active enrollment in the course
    const hasCourseAccess = await CourseAccessService.studentHasCourseAccess(userId, studyMaterial.course._id);

    if (!hasCourseAccess) {
      return { hasAccess: false, studyMaterial, reason: 'No active enrollment in this course' };
    }

    return { hasAccess: true, studyMaterial };
  }

  /**
   * Get all published and active StudyMaterials for a course that a student has access to
   * Returns StudyMaterials only if student has active enrollment in the course
   */
  static async getStudentCourseStudyMaterials(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId
  ): Promise<IStudyMaterial[]> {
    // First verify student has access to the course
    const hasAccess = await CourseAccessService.studentHasCourseAccess(userId, courseId);

    if (!hasAccess) {
      return [];
    }

    // Return published and active StudyMaterials for the course
    const studyMaterials = await StudyMaterial.find({
      course: courseId,
      isPublished: true,
      isActive: true
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec() as unknown as IStudyMaterial[];

    return studyMaterials;
  }

  /**
   * Get a StudyMaterial by ID with course population (for admin/faculty)
   */
  static async getStudyMaterialWithCourse(studyMaterialId: string | Types.ObjectId): Promise<IStudyMaterialWithCourse | null> {
    return StudyMaterial.findById(studyMaterialId)
      .populate<{ course: ICourse }>('course')
      .lean()
      .exec() as unknown as IStudyMaterialWithCourse | null;
  }

  /**
   * Get all StudyMaterials for a course (admin/faculty view - includes unpublished/inactive)
   */
  static async getAllCourseStudyMaterials(courseId: string | Types.ObjectId): Promise<IStudyMaterial[]> {
    const studyMaterials = await StudyMaterial.find({ course: courseId })
      .sort({ createdAt: 1 })
      .lean()
      .exec() as unknown as IStudyMaterial[];

    return studyMaterials;
  }
}