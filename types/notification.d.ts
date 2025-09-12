export interface Notification {
  id: string;
  ngoId?: string;
  userId?: string;
  name: string;
  description: string;
  read: boolean;
}
