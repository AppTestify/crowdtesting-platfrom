export interface IAdmin {
    firstName: string;
    lastName: string;
}

export interface ISelectedAdminEmail {
    emails: string[];
    _id: string;
}

export interface IAdminEmail {
    email: string;
    _id: string;
}

export interface IAdminEmailPayload {
    emails: string[];
}