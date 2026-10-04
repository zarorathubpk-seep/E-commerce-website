import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Star, 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  AlertTriangle,
  Flame,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, ProductVariant, Category } from '../../types';
import { saveProduct, deleteProduct, duplicateProduct } from '../../services/storeService';
import { useCart } from '../../context/CartContext';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  onRefreshProducts: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  onRefreshProducts,
}) => {
  const { showToast } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered list
  const filtered = products.filter(p => {
    if (selectedCat && p.category !== selectedCat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      category: categories[0]?.slug || 'kitchen',
      subcategory: categories[0]?.subcategories?.[0] || 'General',
      price: 49,
      compareAtPrice: 65,
      sku: `AUR-${Math.floor(1000 + Math.random() * 9000)}`,
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80'],
      stock: 25,
      status: 'published',
      featured: false,
      bestseller: false,
      newArrival: true,
      tags: ['kitchen'],
      specifications: {
        'Material': 'Premium Grade Component',
        'Finish': 'Artisanal Lustre',
      },
      variants: [
        {
          id: `var-${Date.now()}-1`,
          type: 'color',
          name: 'Brushed Gold',
          value: 'Gold',
          colorCode: '#D4AF37',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
          stock: 15,
          sku: `AUR-VAR-${Math.floor(100 + Math.random() * 900)}-GLD`,
          price: 49,
        },
        {
          id: `var-${Date.now()}-2`,
          type: 'color',
          name: 'Matte Charcoal',
          value: 'Charcoal',
          colorCode: '#222326',
          image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80',
          stock: 10,
          sku: `AUR-VAR-${Math.floor(100 + Math.random() * 900)}-CHR`,
          price: 49,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      showToast('Product successfully deleted from catalog', 'info');
      onRefreshProducts();
      setDeleteConfirmId(null);
    } catch (e: any) {
      showToast(e.message || 'Error deleting product', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProduct(id);
      showToast('Product cloned successfully', 'success');
      onRefreshProducts();
    } catch (e: any) {
      showToast(e.message || 'Error cloning product', 'error');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    await saveProduct({ ...product, status: newStatus });
    showToast(`Product set to ${newStatus}`, 'info');
    onRefreshProducts();
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.price) {
      showToast('Please provide product title and price', 'error');
      return;
    }

    try {
      // Calculate total stock from variants if variants exist
      let totalStock = editingProduct.stock || 0;
      if (editingProduct.variants && editingProduct.variants.length > 0) {
        totalStock = editingProduct.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      }

      await saveProduct({
        ...editingProduct,
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category || 'kitchen',
        stock: totalStock,
      } as any);

      showToast('Product saved successfully!', 'success');
      setIsModalOpen(false);
      setEditingProduct(null);
      onRefreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    }
  };

  // Variant editing inside modal
  const handleAddVariant = () => {
    if (!editingProduct) return;
    const newV: ProductVariant = {
      id: `var-${Date.now()}`,
      type: 'color',
      name: 'New Color Variant',
      value: 'Color',
      colorCode: '#A0522D',
      image: editingProduct.images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
      stock: 10,
      sku: `${editingProduct.sku || 'AUR'}-VAR`,
      price: editingProduct.price,
    };
    setEditingProduct({
      ...editingProduct,
      variants: [...(editingProduct.variants || []), newV],
    });
  };

  const handleRemoveVariant = (variantId: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      variants: editingProduct.variants?.filter(v => v.id !== variantId) || [],
    });
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, val: any) => {
    if (!editingProduct || !editingProduct.variants) return;
    const updated = [...editingProduct.variants];
    updated[index] = { ...updated[index], [field]: val };
    setEditingProduct({ ...editingProduct, variants: updated });
  };

  // Image upload simulation (converts to DataURL so user can upload any local picture!)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isVariantIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultUrl = reader.result as string;
      if (isVariantIndex !== undefined && editingProduct.variants) {
        handleVariantChange(isVariantIndex, 'image', resultUrl);
      } else {
        setEditingProduct({
          ...editingProduct,
          images: [resultUrl, ...(editingProduct.images || [])],
        });
      }
      showToast('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
            />
          </div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="py-2 px-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DFBA73]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-zinc-500 font-semibold border-b border-[#EFECE6]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Color Variants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF9F6] transition-colors">
                  {/* Product Cell */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-zinc-900 line-clamp-1">{prod.name}</div>
                        <div className="text-[11px] font-mono text-zinc-400">SKU: {prod.sku}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px]">
                      {prod.category.replace('-', ' & ')}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-serif text-sm font-semibold text-zinc-900">
                    ${prod.price}
                    {prod.compareAtPrice && (
                      <span className="text-[10px] text-zinc-400 line-through block font-sans">
                        ${prod.compareAtPrice}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      prod.stock <= 0 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : prod.stock < 10 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {prod.stock} units
                    </span>
                  </td>

                  {/* Variants */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {prod.variants?.map((v) => (
                        <span
                          key={v.id}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-inner"
                          style={{ backgroundColor: v.colorCode || '#888' }}
                          title={`${v.name} (${v.stock} in stock)`}
                        />
                      ))}
                      <span className="text-[10px] text-zinc-400 ml-1">
                        ({prod.variants?.length || 0})
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        prod.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {prod.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span className="capitalize">{prod.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDuplicate(prod.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors"
                        title="Duplicate Product"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-zinc-400 hover:text-[#B89047] transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prod.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Deletion</span>
            </div>
            <p className="text-xs text-zinc-600">
              Are you sure you want to permanently delete this product and its color variations from Firestore? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 max-w-3xl w-full my-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B89047]">
                  Inventory Configuration
                </span>
                <h2 className="font-serif text-2xl font-normal text-zinc-900">
                  {editingProduct.id ? 'Edit Atelier Product' : 'Add New Atelier Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-6">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    placeholder="e.g. Aura Wireless ANC Headphones"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. Aura Acoustics, VoltCraft, Seisui"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Department Category *
                  </label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={editingProduct.subcategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                    placeholder="e.g. Cutlery & Prep"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs font-serif text-sm focus:outline-none focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Compare At Price ($) (Optional Original)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.compareAtPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs font-serif text-sm focus:outline-none focus:border-[#B89047]"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Short Highlight (Summary)
                </label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  placeholder="One sentence luxury essence"
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Full Story & Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Detailed editorial description..."
                  className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#B89047]"
                />
              </div>

              {/* Status & Badges Toggles */}
              <div className="flex flex-wrap gap-6 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="accent-[#B89047]"
                  />
                  <span>Mark Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                    className="accent-[#B89047]"
                  />
                  <span>Mark Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.newArrival}
                    onChange={(e) => setEditingProduct({ ...editingProduct, newArrival: e.target.checked })}
                    className="accent-[#B89047]"
                  />
                  <span>Mark New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFlashSale}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="text-amber-700 font-semibold">Marketplace Flash Deal</span>
                </label>

                {editingProduct.isFlashSale && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600">Flash Discount (%):</span>
                    <input
                      type="number"
                      value={editingProduct.flashDiscount || 25}
                      onChange={(e) => setEditingProduct({ ...editingProduct, flashDiscount: Number(e.target.value) })}
                      className="w-16 px-2 py-1 bg-white border border-[#E5E0D8] rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.status === 'published'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.checked ? 'published' : 'draft' })}
                    className="accent-[#B89047]"
                  />
                  <span>Published Live</span>
                </label>
              </div>

              {/* CRITICAL VARIATIONS MANAGEMENT: COLOR VARIANTS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFECE6]">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-zinc-900">
                      Product Variations (Color & Finishes)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Each color variant has its own image, stock count, hex swatch, and optional price.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-[#DFBA73]/30 text-[#85611B] hover:bg-[#DFBA73]/50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color Finish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editingProduct.variants?.map((v, idx) => (
                    <div
                      key={v.id}
                      className="p-4 bg-[#FBFBF9] rounded-2xl border border-[#E5E0D8] space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner"
                            style={{ backgroundColor: v.colorCode || '#888' }}
                          />
                          <span className="font-semibold text-zinc-800">
                            Finish #{idx + 1}: {v.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-zinc-500 mb-0.5">Color / Option Name</label>
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Brushed Gold"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">Color Swatch</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={v.colorCode || '#D4AF37'}
                              onChange={(e) => handleVariantChange(idx, 'colorCode', e.target.value)}
                              className="w-7 h-7 rounded border border-zinc-300 cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={v.colorCode || ''}
                              onChange={(e) => handleVariantChange(idx, 'colorCode', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-[#E5E0D8] rounded-lg text-[11px] font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">Size / Spec (Optional)</label>
                          <input
                            type="text"
                            value={v.size || ''}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            placeholder="M, L, 256GB..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">Stock</label>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">Price ($)</label>
                          <input
                            type="number"
                            value={v.price !== undefined ? v.price : ''}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Default"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Variant Image & Upload */}
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">
                          Variant Specific Image URL or Upload
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={v.image}
                            onChange={(e) => handleVariantChange(idx, 'image', e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs"
                          />
                          <label className="px-3 py-1.5 bg-white border border-[#E5E0D8] hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3 text-[#B89047]" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, idx)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-[#DFBA73]" />
                  <span>Save Product</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
