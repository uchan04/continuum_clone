// 백엔드(Spring Boot) API 클라이언트 — 로그인 + 직원 목록만 연결
const TOKEN_KEY = "continuum_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type ApiResponse<T> = { success: boolean; message?: string; data: T };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body: ApiResponse<T> = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || `요청 실패 (${res.status})`);
  }
  return body.data;
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string; email: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}

export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string | null;
  position: string | null;
  hireDate: string | null;
  status: "ACTIVE" | "OFFBOARDED";
  offboardedAt: string | null;
  createdAt: string;
};

type Page<T> = { content: T[]; totalElements: number; totalPages: number; number: number };

export function listEmployees(params: { q?: string; status?: string; page?: number; size?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 50));
  return request<Page<Employee>>(`/employees?${qs.toString()}`);
}

export function registerEmployee(input: { name: string; email: string; department?: string; position?: string; hireDate?: string }) {
  return request<Employee>("/employees", { method: "POST", body: JSON.stringify(input) });
}

export function offboardEmployee(id: number) {
  return request<Employee>(`/employees/${id}`, { method: "DELETE" });
}
