export interface LoginResponse {
  status: number;
  message: string;
  error: string | null;
    data: {
        access_token: string;
    };
}
