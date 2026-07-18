import type {
  AuthResponse,
  ImpactStat,
  Order,
  OrderCreate,
  Product,
  Report,
  Story,
  UpcomingProject,
  User,
} from "../data/types";

//! DO NOT DELETE
// const RAW_URL = (import.meta.env.VITE_API_BASE_URL ??
//   "http://localhost:8000") as string;
const RAW_URL = "http://localhost:8000" as string;
const BASE_URL = RAW_URL.endsWith("/") ? RAW_URL.slice(0, -1) : RAW_URL;
const TOKEN_KEY = "compassion.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Gọi khi backend trả 401 trên endpoint cần đăng nhập — AuthContext đăng ký để tự đăng xuất. */
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
  }
}

const GENERIC_ERROR = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | boolean | undefined>;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  const isFormData = opts.body instanceof FormData;
  if (opts.body !== undefined && !isFormData)
    headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const method = opts.method ?? "GET";

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body:
        opts.body !== undefined
          ? isFormData
            ? (opts.body as any)
            : JSON.stringify(opts.body)
          : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    );
  }

  if (!res.ok) {
    let detail = GENERIC_ERROR;
    try {
      const data = (await res.json()) as { detail?: string };
      if (typeof data.detail === "string" && data.detail) detail = data.detail;
    } catch {
      /* body không phải JSON */
    }
    if (res.status === 401 && opts.auth) onUnauthorized?.();
    throw new ApiError(res.status, detail);
  }

  const responseData = (await res.json()) as T;

  return responseData;
}

export const api = {
  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/upload", {
      method: "POST",
      body: formData,
      auth: true,
    });
  },
  // Auth
  loginWithFirebase: (idToken: string) =>
    request<AuthResponse>("/auth/firebase", {
      method: "POST",
      body: { idToken },
    }),
  me: () => request<User>("/auth/me", { auth: true }),
  updateProfile: (body: { name?: string; avatar?: string }) =>
    request<User>("/auth/me", { method: "PATCH", body, auth: true }),

  // Products
  products: (params?: {
    category?: string;
    featured?: boolean;
    q?: string;
    sort?: string;
  }) => request<Product[]>("/products", { query: params }),
  product: (slug: string) =>
    request<Product>(`/products/${encodeURIComponent(slug)}`),

  // Stories
  stories: (kind?: "artisan" | "school") =>
    request<Story[]>("/stories", { query: { kind } }),
  story: (slug: string) =>
    request<Story>(`/stories/${encodeURIComponent(slug)}`),

  // Impact / minh bạch
  impactStats: () => request<ImpactStat[]>("/impact/stats"),
  reports: () => request<Report[]>("/reports"),
  upcoming: () => request<UpcomingProject[]>("/upcoming"),

  // Orders
  orders: () => request<Order[]>("/orders", { auth: true }),
  createOrder: (body: OrderCreate) =>
    request<Order>("/orders", { method: "POST", body, auth: true }),
  contribution: () =>
    request<{ total: number }>("/me/contribution", { auth: true }),
};

/** Lấy thông báo lỗi tiếng Việt từ một lỗi bất kỳ. */
export const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : GENERIC_ERROR;
