export interface ICommentPayload {
  entityId: string;
  entityType: string;
  commentedBy?: string;
  updatedBy: string[];
  deletedBy?: string;
  isDelete?: string;
}
