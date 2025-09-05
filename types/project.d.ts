import { Category } from "./category.d";
import { Skill } from "./skill.d";

export interface Project {
  id: string;
  name: string;
  description: string;
  images: string[];
  categories: Category[];
  city: string;
  zipCode: number;
  state: string;
  principal: string;
  compensation?: string;
  isActive: boolean;
  skills: Skill[];
  startingAt: Date;
  endingAt: Date;
}
