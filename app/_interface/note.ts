import { IUserByAdmin } from "./user";

export interface INote {
    description: string;
    title: string;
    projectId: string;
    _id: string;
    userId: IUserByAdmin;
    createdAt: string;
}

export interface INotePayload {
    title: string;
    projectId?: string;
    description: string;
    userId?: IUserByAdmin;
}