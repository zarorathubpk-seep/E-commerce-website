export interface ProductVariant {
  id: string;
  name: string; // e.g. "Space Gray" or "Champagne Gold"
  type?: 'color' | 'size' | 'material' | 'storage' | 'pack' | string;
  value?: string;
  color?: string;
  colorCode?: string; // Hex color for swatch preview
  size?: string; // e.g. "S", "M", "L", "XL", "256GB"
  options?: Record<string, string>; // Dynamic options e.g. { Color: "Midnight", Size: "M" }
  image: string; // Image switching target
  images?: string[]; // Optional gallery for this variant
  price?: number; // Override price
  compareAtPrice?: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: string[];
  stock: number;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  isFlashSale?: boolean;
  flashDiscount?: number;
  flashSoldPercent?: number;
  tags: string[];
  specifications: Record<string, string>;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
  productCount?: number;
  iconName?: string;
}

export interface CartItem {
  id: string; // Unique composite key e.g. `${productId}__${variantId}`
  productId: string;
  productName: string;
  productSlug: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  selectedVariant?: ProductVariant;
  quantity: number;
  maxStock: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  brand?: string;
  variantId?: string;
  variantName?: string;
  variantColorCode?: string;
  variantSize?: string;
  options?: Record<string, string>;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'my-orders'
  | 'my-account'
  | 'flash-deals'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-inventory'
  | 'admin-categories';
