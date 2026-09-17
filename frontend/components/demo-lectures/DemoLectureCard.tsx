"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoLectureData } from "./demo-lectures.types";

interface DemoLectureCardProps {
  lecture: DemoLectureData;
  onWatch: (lecture: DemoLectureData) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function DemoLectureCard({ lecture, onWatch }: DemoLectureCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <button
        onClick={() => onWatch(lecture)}
        aria-label={`Watch demo lecture: ${lecture.title}`}
        className="relative h-48 w-full overflow-hidden"
      >
        <Image
          src={lecture.thumbnail}
          alt={lecture.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300 flex items-center justify-center">
          <span className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
          </span>
        </div>

        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/70 text-white text-xs font-medium px-2 py-1">
          <Clock className="h-3 w-3" />
          {lecture.duration}
        </span>

        {lecture.featured && (
          <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-500 text-white border-0">
            Featured
          </Badge>
        )}
      </button>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{lecture.course}</Badge>
          <Badge variant="outline">{lecture.subject}</Badge>
        </div>

        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{lecture.title}</h3>
        <p className="text-sm text-primary font-medium mb-2">{lecture.faculty}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2 flex-1">
          {lecture.description}
        </p>

        <Button onClick={() => onWatch(lecture)} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Watch Demo
        </Button>
      </div>
    </motion.div>
  );
}