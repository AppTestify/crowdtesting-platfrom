export interface IDocument {
  id: string;
  data: string;
  name: string;
  contentType: string;
  fileType: string;
  userId: string;
}

export interface IUserDocument {
  documnets: IDocument[];
}