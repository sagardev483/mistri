const API_BASE = "http://127.0.0.1:8000/api";

export interface TestCredentials {
  username: string;
  password: string;
}

export interface TestSession extends TestCredentials {
  access: string;
  refresh: string;
}

function uniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export async function registerViaApi(userType: "customer" | "provider"): Promise<TestCredentials> {
  const username = uniqueUsername(`e2e_${userType}`);
  const password = "TestPass123!";
  const res = await fetch(`${API_BASE}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email: `${username}@example.com`, password, user_type: userType }),
  });
  if (!res.ok) throw new Error(`Register failed: ${await res.text()}`);
  return { username, password };
}

export async function loginViaApi(username: string, password: string): Promise<TestSession> {
  const res = await fetch(`${API_BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const data = await res.json();
  return { username, password, access: data.access, refresh: data.refresh };
}

export async function createProviderProfileViaApi(access: string, businessName: string) {
  const res = await fetch(`${API_BASE}/providers/me/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
    body: JSON.stringify({ business_name: businessName, bio: "Seeded for e2e", years_experience: 3 }),
  });
  if (!res.ok) throw new Error(`Create provider profile failed: ${await res.text()}`);
  return res.json();
}

export async function submitForReviewViaApi(access: string) {
  const res = await fetch(`${API_BASE}/providers/me/submit-for-review/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) throw new Error(`Submit for review failed: ${await res.text()}`);
  return res.json();
}

export async function adminVerifyProviderViaApi(providerId: number) {
  const admin = await loginViaApi("e2e_admin", "e2e_admin_pass");
  const res = await fetch(`${API_BASE}/providers/${providerId}/admin-verify/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${admin.access}` },
  });
  if (!res.ok) throw new Error(`Admin verify failed: ${await res.text()}`);
  return res.json();
}

export async function getE2ECategoryId(): Promise<number> {
  const res = await fetch(`${API_BASE}/services/categories/`);
  const categories = await res.json();
  const match = categories.find((c: { slug: string }) => c.slug === "general-e2e");
  if (!match) throw new Error("E2E category not found — did you run `manage.py seed_e2e` against the test DB?");
  return match.id;
}

export async function createServiceViaApi(access: string, categoryId: number) {
  const res = await fetch(`${API_BASE}/services/mine/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
    body: JSON.stringify({
      title: "E2E Test Service",
      description: "Seeded for e2e",
      base_price: "500.00",
      duration_minutes: 60,
      category: categoryId,
    }),
  });
  if (!res.ok) throw new Error(`Create service failed: ${await res.text()}`);
  return res.json();
}