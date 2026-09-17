"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoLectureCard } from "./DemoLectureCard";
import { DemoLectureModal } from "./DemoLectureModal";
import type { DemoLectureData, DemoLectureCategory } from "./demo-lectures.types";

interface DemoLecturesGridProps {
  lectures: DemoLectureData[];
  categories: DemoLectureCategory[];
}

export function DemoLecturesGrid({ lectures, categories }: DemoLecturesGridProps) {
  const [activeCategory, setActiveCategory] = useState<DemoLectureCategory | "All">("All");
  const [activeLecture, setActiveLecture] = useState<DemoLectureData | null>(null);

  const filterOptions: (DemoLectureCategory | "All")[] = ["All", ...categories];

  const filteredLectures = useMemo(() => {
    if (activeCategory === "All") return lectures;
    return lectures.filter((lecture) => lecture.course === activeCategory);
  }, [lectures, activeCategory]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
        {filterOptions.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={isActive}
              className="relative px-4 py-2 text-sm font-medium rounded-full transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="demo-lectures-filter-pill"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </span>
            </button>
          );
        })}
      </div>

      {filteredLectures.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No demo lectures available in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredLectures.map((lecture) => (
              <DemoLectureCard key={lecture.id} lecture={lecture} onWatch={setActiveLecture} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <DemoLectureModal lecture={activeLecture} onClose={() => setActiveLecture(null)} />
    </div>
  );
}