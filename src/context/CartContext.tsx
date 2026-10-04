import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  shipping: number;
  freeShippingThreshold: number;
  discount: number;
  discountCode: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  grandTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aurelia_cart_v1';
const WISHLIST_STORAGE_KEY = 'aurelia_wishlist_v1';
const PROMO_STORAGE_KEY = 'aurelia_promo_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [discountCode, setDiscountCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PROMO_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [items]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [wishlist]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const addToCart = (
    product: Product, 
    variant?: ProductVariant, 
    quantity: number = 1
  ): { success: boolean; message: string } => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const cartItemId = selectedVariant 
      ? `${product.id}__${selectedVariant.id}` 
      : `${product.id}__base`;

    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

    if (availableStock <= 0) {
      showToast(`Sorry, ${product.name} is currently out of stock.`, 'error');
      return { success: false, message: 'Item is out of stock' };
    }

    const existingIndex = items.findIndex(i => i.id === cartItemId);
    const currentQuantity = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const requestedQuantity = currentQuantity + quantity;

    if (requestedQuantity > availableStock) {
      showToast(
        `Cannot add ${quantity} more. Only ${availableStock - currentQuantity} remaining in stock.`,
        'error'
      );
      return { 
        success: false, 
        message: `Only ${availableStock - currentQuantity} available` 
      };
    }

    const unitPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
    const image = selectedVariant?.image || product.images[0];

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity = requestedQuantity;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        price: unitPrice,
        compareAtPrice: selectedVariant?.compareAtPrice || product.compareAtPrice,
        image,
        selectedVariant,
        quantity,
        maxStock: availableStock,
      };
      setItems(prev => [newItem, ...prev]);
    }

    showToast(`Added "${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''}" to bag`, 'success');
    setIsDrawerOpen(true);
    return { success: true, message: 'Added to cart' };
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        if (newQty > item.maxStock) {
          showToast(`Maximum stock limit (${item.maxStock}) reached`, 'info');
          return { ...item, quantity: item.maxStock };
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    const item = items.find(i => i.id === cartItemId);
    setItems(prev => prev.filter(i => i.id !== cartItemId));
    if (item) {
      showToast(`Removed "${item.productName}" from bag`, 'info');
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from saved wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to your wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ZARORAT10' || clean === 'AURELIA10' || clean === 'WELCOME10') {
      setDiscountCode(clean);
      localStorage.setItem(PROMO_STORAGE_KEY, clean);
      showToast('10% off promotion applied successfully!', 'success');
      return { success: true, message: '10% discount applied' };
    } else if (clean === 'VIP20' || clean === 'LUXURY20') {
      setDiscountCode(clean);
      localStorage.setItem(PROMO_STORAGE_KEY, clean);
      showToast('20% VIP promotion applied!', 'success');
      return { success: true, message: '20% discount applied' };
    } else {
      showToast('Invalid promotion code. Try ZARORAT10 or VIP20', 'error');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removePromoCode = () => {
    setDiscountCode(null);
    localStorage.removeItem(PROMO_STORAGE_KEY);
    showToast('Promo code removed', 'info');
  };

  // Totals calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 100;
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 12;

  let discountRate = 0;
  if (discountCode === 'ZARORAT10' || discountCode === 'AURELIA10' || discountCode === 'WELCOME10') discountRate = 0.10;
  if (discountCode === 'VIP20' || discountCode === 'LUXURY20') discountRate = 0.20;

  const discount = Math.round(subtotal * discountRate);
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        shipping,
        freeShippingThreshold,
        discount,
        discountCode,
        applyPromoCode,
        removePromoCode,
        grandTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isDrawerOpen,
        setIsDrawerOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
