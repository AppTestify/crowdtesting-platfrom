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
}
