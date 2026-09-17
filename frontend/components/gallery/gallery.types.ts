export type GalleryCategory = "Classroom" | "Faculty" | "Students" | "Library";
export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  /** Local placeholder path, e.g. "/gallery/gallery-1.jpg" */
  image: string;
  description: string;
}

export interface GalleryHeaderProps {
  className?: string;
}

export interface GalleryCardProps {
  item: GalleryItem;
  /** Index within the grid, used to stagger the reveal delay and vary aspect ratio */
  index?: number;
  className?: string;
}

export interface GalleryGridProps {
  items: GalleryItem[];
  className?: string;
}