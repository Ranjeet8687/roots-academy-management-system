import type { GalleryItem } from "./gallery.types";

export const GALLERY_LABEL = "OUR CAMPUS LIFE" as const;

export const GALLERY_HEADING = "Experience Learning Beyond Classrooms" as const;

export const GALLERY_DESCRIPTION =
  "Explore classrooms, faculty, students, and our library at Roots Academy." as const;

/**
 * Gallery items. Categories are limited to what was actually
 * selected for photo collection: Classrooms, Faculty, Students,
 * Library. Image paths use real photographs under /public/images/classrooms.
 */
export const GALLERY_DATA: GalleryItem[] = [
  {
    id: "classroom-1",
    title: "Roots Academy Classroom",
    category: "Classroom",
    image: "/images/classrooms/classroom-1.jpg",
    description: "Focused, interactive sessions for JEE Main & Advanced batches.",
  },
  {
    id: "classroom-2",
    title: "Interactive Learning Session",
    category: "Classroom",
    image: "/images/classrooms/classroom-2.jpg",
    description: "AC classrooms designed for extended, comfortable study sessions.",
  },
  {
    id: "classroom-3",
    title: "Classroom Discussion",
    category: "Classroom",
    image: "/images/classrooms/classroom-3.jpg",
    description: "Building strong fundamentals through active learning.",
  },
  {
    id: "classroom-4",
    title: "Modern Classroom",
    category: "Classroom",
    image: "/images/classrooms/classroom-4.jpg",
    description: "State-of-the-art classroom facilities at Roots Academy.",
  },
  {
    id: "building-1",
    title: "Academy Building",
    category: "Classroom",
    image: "/images/gallery/academy-building.jpg",
    description: "Roots Academy campus building - a center for excellence.",
  },
  {
    id: "seminar-1",
    title: "Faculty Seminar",
    category: "Faculty",
    image: "/images/gallery/seminar.jpg",
    description: "Expert faculty conducting an engaging seminar session.",
  },
  {
    id: "students-1",
    title: "Student Activity",
    category: "Students",
    image: "/images/gallery/students-studying.jpg",
    description: "Students engaged in collaborative learning activities.",
  },
  {
    id: "activity-1",
    title: "Classroom Activity",
    category: "Classroom",
    image: "/images/gallery/classroom-activity.jpg",
    description: "Hands-on learning in our modern classrooms.",
  },
];