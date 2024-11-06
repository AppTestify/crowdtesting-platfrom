export interface IUser {
  email: string;
  id: string;
  image: string;
  name: string;
  isActive?: boolean;
  profilePicture?: IProfilePicture;
}

export interface IProfilePicture {
  _id: string;
  data: string;
  contentType: string;
  name: string;
}

export interface IUserByAdmin {
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  isActive?: boolean;
  id?: string;
  profilePicture?: IProfilePicture;
  createdAt?: string;
}

export interface IUsersBulkDeletePayload {
  ids: string[];
}
