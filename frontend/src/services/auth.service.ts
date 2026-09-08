import { api } from "./api";
import { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  name?: string,
  businessName?: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { email, password, name, businessName });
  return data;
}

export async function updateProfile(input: { name?: string; businessName?: string }): Promise<User> {
  const { data } = await api.patch<User>("/auth/me", input);
  return data;
}
