export interface User {
  id: string;
  email: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
