import axios from 'axios';
import type { ApiResponse, Cart, Category, Order, PaginationInfo, Product, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export async function signup(name: string, email: string, password: string): Promise<ApiResponse<{ user: User }>> {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data;
}

export async function login(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function logout(): Promise<ApiResponse<null>> {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  const { data } = await api.get('/auth/me');
  return data;
}

// Categories
export async function getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
  const { data } = await api.get('/categories');
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<ApiResponse<{ category: Category }>> {
  const { data } = await api.get(`/categories/${slug}`);
  return data;
}

// Products
export async function getProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}): Promise<ApiResponse<{ products: Product[]; pagination: PaginationInfo }>> {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<{ product: Product }>> {
  const { data } = await api.get(`/products/slug/${slug}`);
  return data;
}

export async function getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

// Cart
export async function getCart(): Promise<ApiResponse<{ cart: Cart }>> {
  const { data } = await api.get('/cart');
  return data;
}

export async function addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<{ itemCount: number }>> {
  const { data } = await api.post('/cart/items', { productId, quantity });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<{ itemCount: number }>> {
  const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId: string): Promise<ApiResponse<{ itemCount: number }>> {
  const { data } = await api.delete(`/cart/items/${itemId}`);
  return data;
}

// Orders
export async function createOrder(idempotencyKey: string): Promise<ApiResponse<{ order: Order }>> {
  const { data } = await api.post('/orders', { idempotencyKey });
  return data;
}

export async function getOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
  const { data } = await api.get('/orders');
  return data;
}

export async function getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export default api;
