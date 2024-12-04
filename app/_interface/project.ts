import { IUserByAdmin } from "./user";

export interface IProjectPayload {
    id?: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    userId?: IUserByAdmin;
}

export interface IProject {
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    id: string;
}

export interface IProjectBulkDeletePayload {
    ids: string[];
}