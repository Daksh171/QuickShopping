export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  imageKey: string;
}

export interface Product {
  _id: string;
  category: Category | string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageKey: string;
  packageSize: string;
  stock: number;
  isActive: boolean;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  productId: string;
  productNameSnapshot: string;
  imageKeySnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
