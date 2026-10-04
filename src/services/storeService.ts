import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, Order, OrderItem, ProductVariant } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/sampleData';

const PRODUCTS_COL = 'products';
const CATEGORIES_COL = 'categories';
const ORDERS_COL = 'orders';

// In-memory fallback cache to ensure instant loading & offline resilience
let cachedProducts: Product[] = [...INITIAL_PRODUCTS];
let cachedCategories: Category[] = [...INITIAL_CATEGORIES];
let cachedOrders: Order[] = [];

/**
 * Initialize and seed Firestore if empty
 */
export async function initializeStoreData(): Promise<{ products: Product[]; categories: Category[] }> {
  try {
    // 1. Fetch categories
    const catSnapshot = await getDocs(collection(db, CATEGORIES_COL)).catch(err => {
      handleFirestoreError(err, OperationType.LIST, CATEGORIES_COL);
    });

    if (catSnapshot && !catSnapshot.empty && catSnapshot.size >= INITIAL_CATEGORIES.length) {
      cachedCategories = catSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    } else {
      // Seed all initial marketplace categories
      const batch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        batch.set(doc(db, CATEGORIES_COL, cat.id), cat);
      }
      await batch.commit().catch(err => {
        console.warn('Could not batch write initial categories to Firestore:', err);
      });
      cachedCategories = [...INITIAL_CATEGORIES];
    }

    // 2. Fetch products
    const prodSnapshot = await getDocs(collection(db, PRODUCTS_COL)).catch(err => {
      handleFirestoreError(err, OperationType.LIST, PRODUCTS_COL);
    });

    if (prodSnapshot && !prodSnapshot.empty && prodSnapshot.size >= 12) {
      cachedProducts = prodSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    } else {
      // Seed all initial marketplace products
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        batch.set(doc(db, PRODUCTS_COL, prod.id), prod);
      }
      await batch.commit().catch(err => {
        console.warn('Could not batch write initial products to Firestore:', err);
      });
      cachedProducts = [...INITIAL_PRODUCTS];
    }
  } catch (error) {
    console.warn('Using local store data fallback:', error);
  }

  return { products: cachedProducts, categories: cachedCategories };
}

/**
 * Get all products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COL));
    if (!snapshot.empty) {
      cachedProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    }
  } catch (error) {
    console.warn('Falling back to cached products:', error);
  }
  return cachedProducts;
}

/**
 * Get product by slug or ID
 */
export async function getProductBySlugOrId(identifier: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(p => p.slug === identifier || p.id === identifier);
}

/**
 * Create or save new product
 */
export async function saveProduct(product: Partial<Product> & { name: string; price: number; category: string }): Promise<Product> {
  const id = product.id || `prod-${Date.now()}`;
  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  const fullProduct: Product = {
    id,
    name: product.name,
    slug,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    category: product.category,
    subcategory: product.subcategory || 'General',
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    sku: product.sku || `AUR-${Math.floor(1000 + Math.random() * 9000)}`,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80'
    ],
    brand: product.brand || 'Aurora Atelier',
    stock: Number(product.stock) || 0,
    status: product.status || 'published',
    featured: !!product.featured,
    bestseller: !!product.bestseller,
    newArrival: product.newArrival !== undefined ? product.newArrival : true,
    isFlashSale: !!product.isFlashSale,
    flashDiscount: product.flashDiscount,
    flashSoldPercent: product.flashSoldPercent || Math.floor(40 + Math.random() * 50),
    tags: product.tags || [product.category],
    specifications: product.specifications || {},
    variants: product.variants || [],
    rating: product.rating || 5.0,
    reviewCount: product.reviewCount || 1,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, PRODUCTS_COL, id), fullProduct);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COL}/${id}`);
  }

  // Update in-memory cache
  const idx = cachedProducts.findIndex(p => p.id === id);
  if (idx >= 0) {
    cachedProducts[idx] = fullProduct;
  } else {
    cachedProducts.unshift(fullProduct);
  }

  return fullProduct;
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COL}/${productId}`);
  }
  cachedProducts = cachedProducts.filter(p => p.id !== productId);
}

/**
 * Duplicate an existing product
 */
export async function duplicateProduct(productId: string): Promise<Product> {
  const original = cachedProducts.find(p => p.id === productId);
  if (!original) throw new Error('Product not found to duplicate');

  const newName = `${original.name} (Copy)`;
  const newProduct: Partial<Product> & { name: string; price: number; category: string } = {
    ...original,
    id: `prod-${Date.now()}`,
    name: newName,
    slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
    sku: `${original.sku}-CP`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await saveProduct(newProduct);
}

/**
 * Update stock for product and its individual variants
 */
export async function updateProductStock(
  productId: string, 
  totalStock: number, 
  variants: ProductVariant[]
): Promise<void> {
  try {
    await updateDoc(doc(db, PRODUCTS_COL, productId), {
      stock: totalStock,
      variants,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COL}/${productId}`);
  }

  const p = cachedProducts.find(item => item.id === productId);
  if (p) {
    p.stock = totalStock;
    p.variants = variants;
  }
}

/**
 * Atomically decrement inventory upon completed order
 */
export async function decrementStockForOrder(items: OrderItem[]): Promise<void> {
  for (const item of items) {
    const product = cachedProducts.find(p => p.id === item.productId);
    if (!product) continue;

    let updatedStock = Math.max(0, product.stock - item.quantity);
    let updatedVariants = [...product.variants];

    if (item.variantId) {
      updatedVariants = updatedVariants.map(v => {
        if (v.id === item.variantId) {
          return {
            ...v,
            stock: Math.max(0, v.stock - item.quantity),
          };
        }
        return v;
      });
    }

    try {
      await updateDoc(doc(db, PRODUCTS_COL, item.productId), {
        stock: updatedStock,
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      });
      product.stock = updatedStock;
      product.variants = updatedVariants;
    } catch (err) {
      console.warn(`Could not decrement stock for product ${item.productId} in Firestore:`, err);
    }
  }
}

/**
 * Create order and save to Firestore
 */
export async function createOrder(
  orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const timestamp = Date.now();
  const orderNumber = `AUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const id = `order-${timestamp}`;

  const newOrder: Order = {
    ...orderInput,
    id,
    orderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, ORDERS_COL, id), newOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COL}/${id}`);
  }

  // Decrement inventory automatically
  await decrementStockForOrder(newOrder.items);

  cachedOrders.unshift(newOrder);
  return newOrder;
}

/**
 * Get all customer orders
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      cachedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    }
  } catch (error) {
    console.warn('Falling back to cached orders:', error);
  }
  return cachedOrders;
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | undefined> {
  try {
    const docSnap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
  } catch (error) {
    console.warn('Fetching order fallback:', error);
  }
  return cachedOrders.find(o => o.id === orderId || o.orderNumber === orderId);
}

/**
 * Update order fulfillment/processing status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    await updateDoc(doc(db, ORDERS_COL, orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }

  const order = cachedOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }
}

/**
 * Categories operations
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIES_COL));
    if (!snapshot.empty) {
      cachedCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    }
  } catch (error) {
    console.warn('Falling back to cached categories:', error);
  }
  return cachedCategories;
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
  const id = category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fullCat: Category = {
    id,
    name: category.name,
    slug: category.slug || id,
    description: category.description || '',
    image: category.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    subcategories: category.subcategories || [],
    productCount: category.productCount || 0,
  };

  try {
    await setDoc(doc(db, CATEGORIES_COL, id), fullCat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CATEGORIES_COL}/${id}`);
  }

  const idx = cachedCategories.findIndex(c => c.id === id);
  if (idx >= 0) cachedCategories[idx] = fullCat;
  else cachedCategories.push(fullCat);

  return fullCat;
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COL}/${id}`);
  }
  cachedCategories = cachedCategories.filter(c => c.id !== id);
}
