import { Projects } from './project.d';

export interface Ngo {
  id: string;
  name: string;
  image: string;
  isNonProfit: boolean;
  industry: string[];
  projects: Projects;
  streetAndNumber: string;
  zipCode: number;
  city: string;
  state: string;
  principal: string;
  contactEmail?: string;
  phone?: string;
  role?: string;
  isActivated: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Ngos = Ngo[];
