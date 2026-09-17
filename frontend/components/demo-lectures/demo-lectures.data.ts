import type { DemoLectureData } from "./demo-lectures.types";

// TEMPORARY static data. Once the Demo Lectures API module is built
// (uploaded via Admin/Faculty dashboards), this file is removed and
// DemoLectures will receive data fetched server-side from
// GET /api/v1/demo-lectures. Props already match DemoLectureData
// exactly, so DemoLecturesGrid/DemoLectureCard/DemoLectureModal
// require zero code changes when that happens.

export const demoLectures: DemoLectureData[] = [
  {
    id: "demo-1",
    title: "Newton's Laws of Motion — Core Concepts",
    slug: "newtons-laws-of-motion",
    description: "A concept-first walkthrough of Newton's three laws with problem-solving techniques for JEE.",
    course: "JEE",
    subject: "Physics",
    faculty: "Dr. Anil Verma",
    thumbnail: "/images/demo-lectures/newtons-laws.jpg",
    videoUrl: "/videos/demo/newtons-laws.mp4",
    duration: "14:20",
    featured: true,
  },
  {
    id: "demo-2",
    title: "Human Circulatory System Explained",
    slug: "human-circulatory-system",
    description: "Visual breakdown of the heart and blood vessels, mapped directly to NEET exam patterns.",
    course: "NEET",
    subject: "Biology",
    faculty: "Dr. Sneha Kulkarni",
    thumbnail: "/images/demo-lectures/circulatory-system.jpg",
    videoUrl: "/videos/demo/circulatory-system.mp4",
    duration: "18:05",
    featured: true,
  },
  {
    id: "demo-3",
    title: "Introduction to Algebraic Expressions",
    slug: "intro-algebraic-expressions",
    description: "Building strong fundamentals in algebra for Class 8 students starting their foundation journey.",
    course: "Foundation",
    subject: "Mathematics",
    faculty: "Prof. Suresh Iyer",
    thumbnail: "/images/demo-lectures/algebraic-expressions.jpg",
    videoUrl: "/videos/demo/algebraic-expressions.mp4",
    duration: "10:32",
    featured: false,
  },
  {
    id: "demo-4",
    title: "Mole Concept — Quick Revision",
    slug: "mole-concept-quick-revision",
    description: "A rapid-fire revision session covering mole concept fundamentals for MHT CET aspirants.",
    course: "MHT CET",
    subject: "Chemistry",
    faculty: "Dr. Priya Menon",
    thumbnail: "/images/demo-lectures/mole-concept.jpg",
    videoUrl: "/videos/demo/mole-concept.mp4",
    duration: "16:48",
    featured: false,
  },
  {
    id: "demo-5",
    title: "Organic Chemistry Reaction Mechanisms",
    slug: "organic-reaction-mechanisms",
    description: "Intensive coverage of key reaction mechanisms designed for dropper batch rapid revision.",
    course: "Dropper",
    subject: "Chemistry",
    faculty: "Dr. Priya Menon",
    thumbnail: "/images/demo-lectures/organic-mechanisms.jpg",
    videoUrl: "/videos/demo/organic-mechanisms.mp4",
    duration: "22:10",
    featured: true,
  },
  {
    id: "demo-6",
    title: "Coordinate Geometry — Straight Lines",
    slug: "coordinate-geometry-straight-lines",
    description: "Step-by-step derivation and problem-solving for straight line equations, JEE Main level.",
    course: "JEE",
    subject: "Mathematics",
    faculty: "Prof. Suresh Iyer",
    thumbnail: "/images/demo-lectures/straight-lines.jpg",
    videoUrl: "/videos/demo/straight-lines.mp4",
    duration: "19:55",
    featured: false,
  },
];