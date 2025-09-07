import { Applications } from './application';
import { Projects } from './project';

export interface Ngo {
  id: string;
  name?: string;
  image?: string;
  isNonProfit: boolean;
  industry?: string[];
  projects: Projects;
  applications: Applications;
  streetAndNumber?: string;
  zipCode?: number;
  city?: string;
  state?: string;
  principal: string;
  contactEmail?: string;
  loginEmail: string;
  password: string;
  phone?: string;
  isActivated: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
