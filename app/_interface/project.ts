import { IUserByAdmin } from "./user";

export interface IProjectPayload {
    id?: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    userId?: IUserByAdmin | undefined;
    createdAt?: string;
}

export interface IProject {
    _id?: string;
    id?: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    users?: IUserByAdmin;
    userId?: string;
}

export interface IProjectBulkDeletePayload {
    ids: string[];
}

export interface IProjectUser {
    userId: string;
    role?: string | undefined;
}

export interface IProjectUserDisplay {
    userId?: IUserByAdmin;
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
}