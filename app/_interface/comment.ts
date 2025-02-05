import { IUserByAdmin } from "./user";

export interface ICommentPayload {
  entityId: string;
  entityType?: string;
  commentedBy?: string;
  updatedBy?: string[];
  deletedBy?: string;
  isDelete?: string;
  isVerify?: boolean;
}

export interface ICommentVerifyPayload {
  isVerify: boolean;
}

export interface IComment {
  _id: string;
  entityId: string;
  commentedBy?: IUserByAdmin;
  updatedBy?: string[];
  deletedBy?: string;
  isDelete?: string;
  content: string;
  createdAt?: Date;
  isVerify: boolean;
}
