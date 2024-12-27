import { IUserByAdmin } from "./user";

export interface ICommentPayload {
  entityId: string;
  commentedBy?: string;
  updatedBy?: string[];
  deletedBy?: string;
  isDelete?: string;
}

export interface IComment {
  entityId: string;
  commentedBy?: IUserByAdmin;
  updatedBy?: string[];
  deletedBy?: string;
  isDelete?: string;
  content: string;
  createdAt?: Date;
}
