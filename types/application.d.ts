import { Project } from './project';
import { Skills } from './skill';

export interface Application {
  id: string;
  projectId: string;
  userId: string;
  ngoId: string;
  status: ApplicationStatus;
  skills: Skills;
  message?: string;
  reviewNotes?: string;
  appliedAt: Date;
  updatedAt: Date;
  user: User;
  project: Project;
  ngo: Ngo;
}

export type Applications = Application[];
