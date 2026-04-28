export interface SessionUser {
  id: number;
  username: string;
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}
