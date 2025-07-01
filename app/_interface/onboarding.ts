import { IPackage } from "./package";
import { INewUser } from "./user";

interface ProjectData {
  title: string;
  startDate: string | null;
  endDate: string | null;
  description?: string;
  isActive?: boolean;
}
export interface OnboardingData {
  project: ProjectData; 
  users: INewUser[];           
  pricingId?: string;             
}