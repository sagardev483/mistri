const API_BASE_URL = "http://127.0.0.1:8000/api";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "customer" | "provider";
  phone_number: string;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  return res.json();
}

export async function fetchMe(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Session expired, please log in again");
  }

  return res.json();
}