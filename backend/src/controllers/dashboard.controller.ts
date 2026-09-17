import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User, { UserRole } from '../models/user.model';
import Course from '../models/course.model';
import Enrollment, { EnrollmentStatus } from '../models/enrollment.model';
import Lecture from '../models/lecture.model';
import LiveClass from '../models/live-class.model';
import DPP from '../models/dpp.model';
import StudyMaterial from '../models/study-material.model';
import { CourseAccessService } from '../services/course-access.service';

// ADMIN Dashboard: Summary counts
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      activeCourses,
      totalEnrollments,
      activeEnrollments,
      totalLectures,
      totalLiveClasses,
      totalDPPs,
      totalStudyMaterials
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT }),
      User.countDocuments({ role: UserRole.FACULTY }),
      Course.countDocuments({}),
      Course.countDocuments({ isActive: true }),
      Enrollment.countDocuments({}),
      Enrollment.countDocuments({ status: EnrollmentStatus.ACTIVE }),
      Lecture.countDocuments({}),
      LiveClass.countDocuments({}),
      DPP.countDocuments({}),
      StudyMaterial.countDocuments({})
    ]);

    res.json({
      users: {
        totalStudents,
        totalFaculty
      },
      courses: {
        total: totalCourses,
        active: activeCourses
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments
      },
      content: {
        totalLectures,
        totalLiveClasses,
        totalDPPs,
        totalStudyMaterials
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
};

// FACULTY Dashboard: Current faculty's associated content
export const getFacultyDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get faculty basic info
    interface LeanUser {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: UserRole;
    }
    const faculty = await User.findById(user.userId).select('name email role').lean<LeanUser>();
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const facultyId = new Types.ObjectId(user.userId);

    // Get content where this faculty is referenced
    const [
      lectures,
      liveClasses,
      dpps,
      studyMaterials
    ] = await Promise.all([
      Lecture.find({ faculty: facultyId })
        .populate('course', 'name slug')
        .sort({ createdAt: -1 })
        .lean(),
      LiveClass.find({ faculty: facultyId })
        .populate('course', 'name slug')
        .sort({ scheduledStart: 1 })
        .lean(),
      DPP.find({ faculty: facultyId })
        .populate('course', 'name slug')
        .sort({ scheduledDate: 1 })
        .lean(),
      StudyMaterial.find({ faculty: facultyId })
        .populate('course', 'name slug')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Note: Faculty-course assignment not yet implemented
    // Currently returning content where faculty is directly referenced

    res.json({
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email
      },
      assignedContent: {
        lectures: lectures.length,
        liveClasses: liveClasses.length,
        dpps: dpps.length,
        studyMaterials: studyMaterials.length
      },
      lectures,
      liveClasses,
      dpps,
      studyMaterials
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch faculty dashboard data' });
  }
};

// STUDENT Dashboard: Active enrollments and published content counts
export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const studentId = new Types.ObjectId(user.userId);

    // Get active enrollments with course details
    const activeEnrollments = await Enrollment.find({
      student: studentId,
      status: EnrollmentStatus.ACTIVE
    })
      .populate<{ course: { _id: Types.ObjectId; name: string; slug: string; isActive: boolean } }>('course')
      .lean();

    // Filter to only active courses
    const activeCourses = activeEnrollments
      .filter(e => e.course && e.course.isActive)
      .map(e => ({
        id: e.course._id,
        name: e.course.name,
        slug: e.course.slug
      }));

    const courseIds = activeCourses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.json({
        student: {
          id: user.userId
        },
        activeEnrollments: 0,
        courses: [],
        contentCounts: {
          lectures: 0,
          liveClasses: 0,
          dpps: 0,
          studyMaterials: 0
        }
      });
    }

    // Get published/active content counts for enrolled courses
    const [
      lectureCount,
      liveClassCount,
      dppCount,
      studyMaterialCount
    ] = await Promise.all([
      Lecture.countDocuments({
        course: { $in: courseIds },
        isPublished: true
      }),
      LiveClass.countDocuments({
        course: { $in: courseIds },
        isPublished: true,
        isActive: true
      }),
      DPP.countDocuments({
        course: { $in: courseIds },
        isPublished: true,
        isActive: true
      }),
      StudyMaterial.countDocuments({
        course: { $in: courseIds },
        isPublished: true,
        isActive: true
      })
    ]);

    res.json({
      student: {
        id: user.userId
      },
      activeEnrollments: activeCourses.length,
      courses: activeCourses,
      contentCounts: {
        lectures: lectureCount,
        liveClasses: liveClassCount,
        dpps: dppCount,
        studyMaterials: studyMaterialCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student dashboard data' });
  }
};