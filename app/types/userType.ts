export interface UserType {
  blocked: boolean;
  confirmed: boolean;
  createdAt: string | Date;
  documentId: string;
  email: string;
  id: number;
  provider: string;
  publishedAt: string | Date;
  updatedAt: string | Date;
  username: string;
}