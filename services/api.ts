/**
 * LUNARA - API CLIENT SERVICE
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (Fetch & Async/Await)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create, Read, Update, Delete)]
 *
 * ฟังก์ชันเรียกใช้งาน REST API:
 * 1. GET    /api/products      -> fetchProducts()
 * 2. GET    /api/products/:id  -> fetchProductById()
 * 3. POST   /api/products      -> createProduct()
 * 4. PUT    /api/products/:id  -> updateProduct()
 * 5. DELETE /api/products/:id  -> deleteProduct()
 * 6. GET    /api/orders        -> fetchOrders()
 * 7. POST   /api/orders        -> createOrder()
 * 8. POST   /api/auth/google   -> loginWithGoogle()
 * ============================================================================
 */

import { Product, Order, AdminUser } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEY_PRODUCTS = 'lunara_products_v1';
const STORAGE_KEY_ORDERS = 'lunara_orders_v1';
const STORAGE_KEY_ADMIN = 'lunara_admin_session';

// Helper: ดึงข้อมูลจาก LocalStorage ถ้าเซิร์ฟเวอร์ยังไม่มีการเชื่อมต่อ
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

// ----------------------------------------------------------------------------
// 1. PRODUCTS CRUD API
// ----------------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        saveLocalProducts(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API call failed, fallback to local storage:', err);
  }
  return getLocalProducts();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('API call failed, fallback to local search:', err);
  }
  const all = getLocalProducts();
  return all.find((p) => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}`,
    rating: 5.0,
    reviewCount: 0,
  };

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      const json = await res.json();
      const created = json.data;
      // Sync local storage
      const current = getLocalProducts();
      saveLocalProducts([created, ...current]);
      return created;
    }
  } catch (err) {
    console.warn('API POST failed, fallback to local save:', err);
  }

  // Fallback
  const current = getLocalProducts();
  const updated = [newProduct, ...current];
  saveLocalProducts(updated);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      const json = await res.json();
      const updated = json.data;
      // Sync local storage
      const current = getLocalProducts();
      const index = current.findIndex((p) => p.id === id);
      if (index !== -1) {
        current[index] = updated;
        saveLocalProducts(current);
      }
      return updated;
    }
  } catch (err) {
    console.warn('API PUT failed, fallback to local update:', err);
  }

  // Fallback
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...productData };
    saveLocalProducts(current);
    return current[index];
  }
  throw new Error('ไม่พบสินค้าที่ต้องการแก้ไข');
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const current = getLocalProducts();
      saveLocalProducts(current.filter((p) => p.id !== id));
      return true;
    }
  } catch (err) {
    console.warn('API DELETE failed, fallback to local delete:', err);
  }

  // Fallback
  const current = getLocalProducts();
  saveLocalProducts(current.filter((p) => p.id !== id));
  return true;
}

// ----------------------------------------------------------------------------
// 2. ORDERS API
// ----------------------------------------------------------------------------

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API GET orders failed, fallback:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });
    if (res.ok) {
      const json = await res.json();
      const saved = json.data;
      const orders = await fetchOrders();
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([saved, ...orders.filter(o => o.id !== saved.id)]));
      return saved;
    }
  } catch (err) {
    console.warn('API POST orders failed, fallback:', err);
  }

  // Fallback
  const orders = await fetchOrders();
  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));
  return newOrder;
}

// ----------------------------------------------------------------------------
// 3. GOOGLE OAUTH CLIENT HELPER
// ----------------------------------------------------------------------------

export async function loginWithGoogleOAuth(mockData?: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockData || {}),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.user) {
        localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(json.user));
        return json.user;
      }
    }
  } catch (e) {
    console.warn('Google login API failed, fallback:', e);
  }

  const defaultAdmin: AdminUser = {
    id: 'admin-google-1',
    name: mockData?.name || 'อาจารย์ / ผู้ตรวจโปรเจกต์ (Google Auth)',
    email: mockData?.email || 'natpapattep@gmail.com',
    avatar: mockData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
  };

  localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(defaultAdmin));
  return defaultAdmin;
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEY_ADMIN);
}
