export interface UserSession {
  id: string;
  username: string;
  teamNumber?: number;
  role: 'USER' | 'ADMIN';
}

export interface AuthFormData {
  username: string;
  password: string;
  teamNumber?: number;
}
