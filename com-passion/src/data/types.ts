/** Hình minh hoạ: cặp màu gradient + emoji. Thay bằng ảnh thật khi có. */
export interface Art {
  from: string;
  to: string;
  emoji: string;
  /** Chú thích ảnh thật cần chụp — ghi chú cho team nội dung. */
  realPhotoNote?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // VND
  art: Art;
  category: 'gio' | 'phu-kien';
  maker: string;
  region: string;
  short: string;
  description: string;
  materials: string[];
  size: string;
  stock: number;
  featured?: boolean;
  storySlug?: string;
  imageUrl?: string;
}

export interface Story {
  id: string;
  slug: string;
  kind: 'artisan' | 'school';
  title: string;
  person: string;
  location: string;
  excerpt: string;
  body: string[];
  art: Art;
  imageUrl?: string;
}

export interface ImpactStat {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  emoji: string;
}

export interface Allocation {
  label: string;
  amount: number;
  color: string;
}

export interface Report {
  id: string;
  period: string;
  title: string;
  summary: string;
  totalRaised: number;
  allocations: Allocation[];
  invoiceLabel: string;
}

export interface UpcomingProject {
  id: string;
  title: string;
  startDate: string; // ISO
  note: string;
  art: Art;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string; // ISO
  items: OrderItem[];
  donation: number;
  total: number;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  orders: Order[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface OrderCreate {
  items: { productId: string; qty: number }[];
  donation: number;
}

export const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
