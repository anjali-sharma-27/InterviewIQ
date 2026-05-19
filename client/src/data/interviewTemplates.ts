import type { ExperienceLevel } from "@/vite-env";

export interface InterviewTemplate {
  id: string;
  title: string;
  description: string;
  jobRole: string;
  experienceLevel: ExperienceLevel;
  targetCompany: string;
  skills: string[];
}

export const interviewTemplates: InterviewTemplate[] = [
  {
    id: "faang-swe",
    title: "FAANG SWE",
    description: "Full-stack + DSA for big tech loops",
    jobRole: "Software Engineer",
    experienceLevel: "Mid-Level",
    targetCompany: "Google",
    skills: ["JavaScript", "System Design", "Data Structures", "Algorithms"],
  },
  {
    id: "frontend",
    title: "Frontend Focus",
    description: "React, CSS, and browser fundamentals",
    jobRole: "Frontend Developer",
    experienceLevel: "Junior",
    targetCompany: "Startup",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
  },
  {
    id: "dsa-blitz",
    title: "DSA Blitz",
    description: "Coding-heavy practice session",
    jobRole: "Software Engineer",
    experienceLevel: "Fresher",
    targetCompany: "Product Company",
    skills: ["Arrays", "Trees", "Dynamic Programming", "Graphs"],
  },
  {
    id: "backend",
    title: "Backend Engineer",
    description: "APIs, databases, and system design",
    jobRole: "Backend Developer",
    experienceLevel: "Mid-Level",
    targetCompany: "Amazon",
    skills: ["Node.js", "MongoDB", "REST APIs", "System Design"],
  },
];
