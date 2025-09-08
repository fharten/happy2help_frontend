import { Applications } from './application';
import { Projects } from './project';
import { Skills } from './skill';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  contactEmail?: string;
  loginEmail: string;
  phone?: string;
  skills?: Skills;
  role: string;
  ngoMemberships?: string[];
  yearOfBirth?: number;
  zipCode?: number;
  city?: string;
  state?: string;
  isActivated: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  projects: Projects;
  applications: Applications;
}

export type Users = User[];
