export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  roles: string[];
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GithubAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
  };
}
