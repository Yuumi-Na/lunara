/**
 * LUNARA - API CLIENT SERVICE
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (Fetch & Async/Await)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create, Read, Update, Delete)]
 *
 * ทุกคำขอส่ง cookie session ไปด้วย (credentials: 'same-origin')
 * และแนบ header X-Lunara-Client เพื่อป้องกัน CSRF
 * ============================================================================
 */

import type {
  AppUser,
  CartItem,
  CheckoutFormValues,
  Order,
  OrderStatus,
  Product,
  ProductFormValues,
  Review,
  ReviewEligibility,
  ReviewFormValues,
} from '../types';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public productId?: string) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-Lunara-Client', '1');
  if (init.body && typeof init.body === 'string') headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...init, headers, credentials: 'same-origin' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.code || 'ERROR', json.message || res.statusText, json.productId);
  }
  return json as T;
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

// ----------------------------------------------------------------------------
// 0. CONFIG & AUTH
// ----------------------------------------------------------------------------
export async function fetchConfig(): Promise<{ googleClientId: string; passwordLogin: boolean }> {
  return request('/api/config');
}

export async function loginWithGoogleCredential(credential: string): Promise<AppUser> {
  const json = await request<{ user: AppUser }>('/api/auth/google', send('POST', { credential }));
  return json.user;
}

/** Admin ล็อกอินด้วย Username / Password (ลูกค้าทั่วไปใช้ Google เท่านั้น) */
export async function loginAdminWithPassword(username: string, password: string): Promise<AppUser> {
  const json = await request<{ user: AppUser }>('/api/auth/admin-login', send('POST', { username, password }));
  return json.user;
}

export async function fetchCurrentUser(): Promise<AppUser | null> {
  const json = await request<{ user: AppUser | null }>('/api/auth/me');
  return json.user;
}

export async function logout(): Promise<void> {
  await request('/api/auth/logout', send('POST'));
}

// ----------------------------------------------------------------------------
// 1. PRODUCTS CRUD API
// ----------------------------------------------------------------------------
export async function fetchProducts(): Promise<Product[]> {
  return (await request<{ data: Product[] }>('/api/products')).data;
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  return (await request<{ data: Product }>('/api/products', send('POST', values))).data;
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<Product> {
  return (await request<{ data: Product }>(`/api/products/${id}`, send('PUT', values))).data;
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`/api/products/${id}`, send('DELETE'));
}

// ----------------------------------------------------------------------------
// 1.1 REVIEWS
// ----------------------------------------------------------------------------
export interface ProductReviews {
  reviews: Review[];
  me: { eligibility: ReviewEligibility; review: Review | null };
}

export async function fetchProductReviews(productId: string): Promise<ProductReviews> {
  return (await request<{ data: ProductReviews }>('/api/products/' + encodeURIComponent(productId) + '/reviews')).data;
}

export async function submitReview(productId: string, values: ReviewFormValues): Promise<Review> {
  return (await request<{ data: Review }>('/api/products/' + encodeURIComponent(productId) + '/reviews', send('POST', values))).data;
}

export async function deleteReview(id: string): Promise<void> {
  await request('/api/reviews/' + encodeURIComponent(id), send('DELETE'));
}

export type FeaturedReview = Review & { productName: string; productEnglishName?: string };

export async function fetchFeaturedReviews(): Promise<{ reviews: FeaturedReview[]; stats: { rating: number; count: number } }> {
  return (await request<{ data: { reviews: FeaturedReview[]; stats: { rating: number; count: number } } }>('/api/reviews/featured')).data;
}

// ----------------------------------------------------------------------------
// 2. ORDERS API
// ----------------------------------------------------------------------------
export async function fetchMyOrders(): Promise<Order[]> {
  return (await request<{ data: Order[] }>('/api/orders')).data;
}

export async function fetchAllOrders(): Promise<Order[]> {
  return (await request<{ data: Order[] }>('/api/orders?scope=all')).data;
}

export async function createOrder(shipping: CheckoutFormValues, cart: CartItem[]): Promise<Order> {
  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    craft: item.product.craft,
  }));
  return (await request<{ data: Order }>('/api/orders', send('POST', { ...shipping, items }))).data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return (await request<{ data: Order }>(`/api/orders/${id}/status`, send('PATCH', { status }))).data;
}

// ----------------------------------------------------------------------------
// 3. IMAGE FOLDER (โฟลเดอร์ img/ บนเซิร์ฟเวอร์)
// ----------------------------------------------------------------------------
export interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  mime: string;
  modifiedAt?: string;
  usedBy?: number;
}

export interface MediaFolder {
  name: string;
  path: string;
  count: number;
}

export interface MediaListing {
  dir: string;
  folders: MediaFolder[];
  files: MediaFile[];
}

export async function fetchMedia(dir = ''): Promise<MediaListing> {
  return (await request<{ data: MediaListing }>(`/api/media?dir=${encodeURIComponent(dir)}`)).data;
}

export async function uploadImage(file: File, dir = ''): Promise<MediaFile> {
  const json = await request<{ data: MediaFile }>(`/api/media/upload?dir=${encodeURIComponent(dir)}`, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) },
  });
  return json.data;
}

export async function createFolder(dir: string, name: string): Promise<MediaFolder> {
  return (await request<{ data: MediaFolder }>('/api/media/folder', send('POST', { dir, name }))).data;
}

export async function deleteMedia(path: string): Promise<void> {
  await request(`/api/media?path=${encodeURIComponent(path)}`, send('DELETE'));
}

// ----------------------------------------------------------------------------
// 4. ADMIN
// ----------------------------------------------------------------------------
export interface AdminStats {
  revenue: number;
  orderCount: number;
  pendingCount: number;
  productCount: number;
  lowStock: { id: string; name: string; stock: number }[];
  customerCount: number;
  unansweredReviews: number;
  imageCount: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return (await request<{ data: AdminStats }>('/api/admin/stats')).data;
}

export type AdminReview = Review & { productName: string | null; productImage: string | null };

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  return (await request<{ data: AdminReview[] }>('/api/admin/reviews')).data;
}

/** ตอบกลับ ({ reply: 'ข้อความ' }), ลบคำตอบ ({ reply: null }), ซ่อน/แสดง ({ hidden }) */
export async function updateAdminReview(id: string, changes: { reply?: string | null; hidden?: boolean }): Promise<Review> {
  return (await request<{ data: Review }>('/api/admin/reviews/' + encodeURIComponent(id), send('PATCH', changes))).data;
}

export async function fetchCustomers(): Promise<(AppUser & { orderCount: number })[]> {
  return (await request<{ data: (AppUser & { orderCount: number })[] }>('/api/admin/users')).data;
}
