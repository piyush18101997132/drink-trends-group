/**
 * Types & Interfaces for drink-india
 * Role-Based E-Commerce Platform
 */

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  volume: string; // e.g., '300ml', '500ml'
  salesCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingAddress: string;
  phone: string;
  createdAt: string;
}

export interface SystemSettings {
  storeOpen: boolean;
  maintenanceMode: boolean;
  taxRate: number; // e.g. 0.05 for 5%
  enableRewards: boolean;
  minOrderValue: number;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
