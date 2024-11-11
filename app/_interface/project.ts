import { IUserByAdmin } from "./user";

export interface IProjectPayload {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    userId?: IUserByAdmin;
    createdAt?: string;
}

export interface IProject {
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    users?: IUserByAdmin;
}

export interface IProjectBulkDeletePayload {
    ids: string[];
}

export interface IProjectUser {
    userId: string;
}

export interface IProjectUserDisplay {
    userId: string;
    _id: string;
    firstName: string;
    lastName: string;
}