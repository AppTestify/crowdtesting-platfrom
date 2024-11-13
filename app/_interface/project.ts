

export interface IProjectPayload {
    // id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
    // id:string;
}

export interface IProject {
    id?: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    isActive?: boolean;
}


export interface IProjectBulkDeletePayload {
    ids: string[];
}