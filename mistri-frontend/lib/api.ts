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

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  base_price: string;
  duration_minutes: number;
  category: ServiceCategory;
  provider: number;
  provider_name: string;
}

export interface Booking {
  id: number;
  service: number;
  service_title: string;
  customer_username: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid username or password");
  return res.json();
}

export async function fetchMe(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Session expired, please log in again");
  return res.json();
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  user_type: "customer" | "provider";
  phone_number?: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(Object.values(body).flat().join(" ") || "Registration failed");
  }
  return res.json();
}

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE_URL}/services/`);
  if (!res.ok) throw new Error("Could not load services");
  return res.json();
}

export async function createBooking(
  accessToken: string,
  payload: { service: number; start_time: string; end_time: string; notes?: string }
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body === "object" ? JSON.stringify(body) : "Booking failed"
    );
  }
  return res.json();
}

export async function fetchMyBookings(accessToken: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/mine/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Could not load bookings");
  return res.json();
}
export interface ProviderProfile {
  id: number;
  business_name: string;
  bio: string;
  years_experience: number;
  verification_status: "pending" | "under_review" | "verified" | "rejected" | "suspended";
}

export async function fetchMyProviderProfile(accessToken: string): Promise<ProviderProfile | null> {
  const res = await fetch(`${API_BASE_URL}/providers/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null; // no profile created yet — not an error
  if (!res.ok) throw new Error("Could not load provider profile");
  return res.json();
}

export async function createProviderProfile(
  accessToken: string,
  data: { business_name: string; bio?: string; years_experience?: number }
): Promise<ProviderProfile> {
  const res = await fetch(`${API_BASE_URL}/providers/me/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(Object.values(body).flat().join(" ") || "Could not create profile");
  }
  return res.json();
}

export async function submitProviderForReview(accessToken: string): Promise<ProviderProfile> {
  const res = await fetch(`${API_BASE_URL}/providers/me/submit-for-review/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Could not submit for review");
  }
  return res.json();
}

export async function fetchProviderBookings(accessToken: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/provider/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Could not load bookings");
  return res.json();
}

export async function transitionBooking(
  accessToken: string,
  bookingId: number,
  action: "confirm" | "decline" | "complete"
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/${action}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Could not ${action} booking`);
  }
  return res.json();
}