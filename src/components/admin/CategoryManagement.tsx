import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, Folder } from 'lucide-react';
import { Category } from '../../types';
import { saveCategory, deleteCategory } from '../../services/storeService';
import { useCart } from '../../context/CartContext';

interface CategoryManagementProps {
  categories: Category[];
  onRefreshCategories: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onRefreshCategories,
}) => {
  const { showToast } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [subcatInput, setSubcatInput] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      subcategories: ['General'],
      productCount: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(JSON.parse(JSON.stringify(cat)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        showToast('Category deleted', 'info');
        onRefreshCategories();
      } catch (err: any) {
        showToast(err.message || 'Error deleting category', 'error');
      }
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    try {
      await saveCategory(editingCategory as any);
      showToast('Category saved successfully', 'success');
      setIsModalOpen(false);
      setEditingCategory(null);
      onRefreshCategories();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error');
    }
  };

  const handleAddSubcat = () => {
    if (!subcatInput.trim() || !editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      subcategories: [...(editingCategory.subcategories || []), subcatInput.trim()],
    });
    setSubcatInput('');
  };

  const handleRemoveSubcat = (index: number) => {
    if (!editingCategory) return;
    const updated = [...(editingCategory.subcategories || [])];
    updated.splice(index, 1);
    setEditingCategory({ ...editingCategory, subcategories: updated });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-normal text-zinc-900">
            Departments & Taxonomy
          </h2>
          <p className="text-xs text-zinc-500">
            Organize products into customer-facing departments and subcategories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#1A1A18] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#DFBA73]" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-xs space-y-4 hover:border-[#B89047]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-40 relative bg-zinc-100 overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-white hover:text-[#DFBA73] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-white hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif text-lg font-semibold text-zinc-900">{cat.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2">{cat.description}</p>

                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                    Subcategories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories?.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#FAF7F0] border border-[#DFBA73]/30 rounded-md text-[10px] text-zinc-700">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFECE6]">
              <h3 className="font-serif text-xl font-normal text-zinc-900">
                {editingCategory.id ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  required
                  placeholder="e.g. Dining & Hospitality"
                  className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Header Image URL</label>
                <input
                  type="text"
                  value={editingCategory.image || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#B89047]"
                />
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcatInput}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    placeholder="New subcategory..."
                    className="flex-1 px-3 py-1.5 bg-[#FBFBF9] border border-[#E5E0D8] rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcat}
                    className="px-3 py-1.5 bg-[#1A1A18] text-white rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editingCategory.subcategories?.map((sub, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 rounded-lg text-[11px]">
                      <span>{sub}</span>
                      <button type="button" onClick={() => handleRemoveSubcat(i)} className="text-zinc-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A18] text-white rounded-xl font-semibold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
