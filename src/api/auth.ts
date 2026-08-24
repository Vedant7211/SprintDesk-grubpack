import { api } from "./client";

interface LoginParams {
  username: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}


 export const refreshAccessToken = async (
   refreshToken: string,
 ): Promise<LoginResponse> => {
   const response = await api.post("/auth/refresh", {
     refreshToken,
     expiresInMins: 30,
   });

   return response.data;
 };

export const getAuthUser = async (accessToken?: string): Promise<LoginResponse> => {
  const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  const response = await api.get<LoginResponse>("/auth/me", config);
  return response.data;
};
export const login = async ({ username, password }: LoginParams) => {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  return response.data;
};
