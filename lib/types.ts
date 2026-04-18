export interface ResumeData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  yearsOfExperience: string;
  companiesWorked: number;
  highestDegree: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string[];
  skills: string[];
}

export interface Skill {
  name: string;
  percentage: number;
  category: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Achievement {
  title: string;
  description: string;
  year?: string;
}

export interface DeployConfig {
  githubToken: string;
  repoName: string;
  username: string;
}
