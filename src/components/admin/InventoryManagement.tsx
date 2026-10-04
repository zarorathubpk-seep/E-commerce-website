import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  Check, 
  Save, 
  RefreshCw,
  Sparkles 
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { updateProductStock } from '../../services/storeService';
import { useCart } from '../../context/CartContext';

interface InventoryManagementProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  onRefreshProducts,
}) => {
  const { showToast } = useCart();
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  
  // Local state for inline edits
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    if (filterMode === 'low' && p.stock >= 10) return false;
    if (filterMode === 'out' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleStockInputChange = (key: string, val: number) => {
    setStockMap(prev => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const handleSaveProductStock = async (product: Product) => {
    setSavingId(product.id);
    try {
      // If product has variants, recalculate variants stock and sum total
      let updatedVariants: ProductVariant[] = [...product.variants];
      let total = 0;

      if (updatedVariants.length > 0) {
        updatedVariants = updatedVariants.map(v => {
          const customStock = stockMap[`${product.id}__${v.id}`];
          const finalStock = customStock !== undefined ? customStock : v.stock;
          total += finalStock;
          return {
            ...v,
            stock: finalStock,
          };
        });
      } else {
        const customStock = stockMap[`${product.id}__base`];
        total = customStock !== undefined ? customStock : product.stock;
      }

      await updateProductStock(product.id, total, updatedVariants);
      showToast(`Updated stock levels for ${product.name}`, 'success');
      onRefreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Error updating stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              filterMode === 'all'
                ? 'bg-[#1A1A18] text-white shadow-xs'
                : 'bg-white border border-[#E5E0D8] text-zinc-600 hover:border-zinc-400'
            }`}
          >
            All Inventory ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              filterMode === 'low'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white border border-[#E5E0D8] text-amber-800 hover:border-amber-400'
            }`}
          >
            Low Stock (&lt; 10 units)
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              filterMode === 'out'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white border border-[#E5E0D8] text-rose-700 hover:border-rose-400'
            }`}
          >
            Out of Stock (0)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
          />
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-3xl border border-[#EFECE6] p-6 shadow-xs space-y-4 hover:border-[#DFBA73]/50 transition-all"
          >
            {/* Product Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F4F1EA]">
              <div className="flex items-center gap-3.5">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shrink-0"
                />
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">{prod.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="font-mono text-[11px]">SKU: {prod.sku}</span>
                    <span>•</span>
                    <span className="capitalize">{prod.category.replace('-', ' & ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Combined Units
                  </span>
                  <span className={`text-base font-bold font-serif ${
                    prod.stock <= 0 ? 'text-rose-600' : prod.stock < 10 ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {prod.stock} in stock
                  </span>
                </div>

                <button
                  onClick={() => handleSaveProductStock(prod)}
                  disabled={savingId === prod.id}
                  className="px-4 py-2 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#DFBA73]" />
                  <span>{savingId === prod.id ? 'Updating...' : 'Save Stock'}</span>
                </button>
              </div>
            </div>

            {/* Variants Stock Breakdown */}
            {prod.variants && prod.variants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {prod.variants.map((v) => {
                  const key = `${prod.id}__${v.id}`;
                  const currentInputVal = stockMap[key] !== undefined ? stockMap[key] : v.stock;
                  return (
                    <div
                      key={v.id}
                      className="p-3 bg-[#FBFBF9] rounded-2xl border border-[#EFECE6] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={v.image} alt={v.name} className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-zinc-900 truncate">{v.name}</div>
                          <div className="text-[10px] font-mono text-zinc-400">{v.sku}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          value={currentInputVal}
                          onChange={(e) => handleStockInputChange(key, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-[#E5E0D8] rounded-lg text-xs font-bold text-center focus:outline-none focus:border-[#B89047]"
                        />
                        <span className="text-[11px] text-zinc-500">units</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500">Base Product Stock Level:</span>
                <input
                  type="number"
                  value={stockMap[`${prod.id}__base`] !== undefined ? stockMap[`${prod.id}__base`] : prod.stock}
                  onChange={(e) => handleStockInputChange(`${prod.id}__base`, Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-white border border-[#E5E0D8] rounded-lg text-xs font-bold text-center focus:outline-none focus:border-[#B89047]"
                />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
