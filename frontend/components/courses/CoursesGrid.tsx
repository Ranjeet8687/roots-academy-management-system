"use client";

import { motion } from "framer-motion";
import { courses } from "./courses.data";
import { CourseCard } from "./CourseCard";

export function CoursesGrid() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
        />
      ))}
    </motion.div>
  );
}