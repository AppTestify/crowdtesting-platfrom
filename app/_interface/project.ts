

export interface IProjectPayload {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
}

export interface IProject {
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
}

export interface IProjectBulkDeletePayload {
    ids: string[];
}