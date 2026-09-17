export type DemoLectureCategory = "JEE" | "NEET" | "Foundation" | "MHT CET" | "Dropper";

export interface DemoLectureData {
  id: string;
  title: string;
  slug: string;
  description: string;
  course: DemoLectureCategory;
  subject: string;
  faculty: string;
  thumbnail: string;
  videoUrl: string;
  duration: string; // e.g. "12:45"
  featured: boolean;
}