"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Tag,
  FileText,
  Package,
  Eye,
} from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/v1/categories?limit=1000", {
        headers,
        cache: "no-store",
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || "Erro ao carregar categorias");
        return;
      }

      setCategories(result.data || []);
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Nome da categoria é obrigatório";
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = "Deve ter entre 2 e 50 caracteres";
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (
      formData.description.length < 10 ||
      formData.description.length > 200
    ) {
      newErrors.description = "Deve ter entre 10 e 200 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Você precisa estar logado");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      toast.success("Categoria cadastrada com sucesso!");
      fetchCategories();
      setCurrentPage(1); // Volta para a primeira página para ver a nova categoria
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
      });
    } catch (error) {
      toast.error("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Você precisa estar logado");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/v1/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || "Erro ao atualizar");
        setLoading(false);
        return;
      }

      toast.success("Categoria atualizada com sucesso!");
      fetchCategories();
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
      });
    } catch (error) {
      toast.error("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Você precisa estar logado");
        return;
      }

      const res = await fetch(`/api/v1/categories/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        // Mensagem específica para categoria em uso
        if (result.mensagens?.[0]?.includes("usada por produtos")) {
          toast.error(
            "⚠️ Esta categoria não pode ser excluída pois está sendo usada por produtos. Primeiro remova ou altere a categoria dos produtos.",
          );
        } else {
          toast.error(result.mensagens?.[0] || "Erro ao excluir categoria");
        }
        setShowConfirm(false);
        setDeleteId(null);
        return;
      }

      toast.success("Categoria excluída com sucesso!");
      fetchCategories();
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      toast.error("Erro de conexão ao excluir categoria");
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCategories = categories.filter((category) => {
    const name = category.name?.toLowerCase() || "";
    const description = category.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || description.includes(search);
  });

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-3">
              Gestão de Categorias
            </h1>
            <p className="text-xl text-emerald-200 mb-6">
              Cadastro e administração de categorias de produtos
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                data-testid="add-category-btn"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>

              <button
                onClick={() => window.open("/products", "_blank")}
                className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Voltar para Produtos
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar categorias..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 backdrop-blur border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p>Carregando categorias...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-4">
                {searchTerm
                  ? "Nenhuma categoria encontrada"
                  : "Nenhuma categoria cadastrada"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Cadastrar primeira categoria
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/20 group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-3 rounded-lg group-hover:bg-emerald-500/30 transition">
                          <Tag className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-white font-semibold text-lg mb-1 line-clamp-1"
                            title={category.name}
                          >
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-2 text-emerald-400 text-xs">
                            <Package className="w-3 h-3" />
                            <span>Produtos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex-grow">
                      <p
                        className="text-slate-300 text-sm leading-relaxed line-clamp-3"
                        title={category.description}
                      >
                        {category.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700 mt-auto">
                      <button
                        onClick={() =>
                          router.push(`/categories/${category.id}/products`)
                        }
                        className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Produtos
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description,
                          });
                          setShowEditModal(true);
                        }}
                        className="flex-1 min-w-[100px] bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(category.id);
                          setShowConfirm(true);
                        }}
                        className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>
                  <span className="text-slate-300">
                    Página{" "}
                    <span className="font-bold text-white">{currentPage}</span>{" "}
                    de{" "}
                    <span className="font-bold text-white">{totalPages}</span>
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-emerald-400" />
                Nova Categoria
              </h2>
            </div>

            <form
              id="category-form"
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Tag className="w-4 h-4" />
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Eletrônicos"
                />
                {errors.name && (
                 
                 <p 
                  data-testid="error-category-name"
                 className="text-red-400 text-xs mt-1">
                  {errors.name}
                 
                 </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <FileText className="w-4 h-4" />
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Produtos eletrônicos como celulares, computadores, tablets e acessórios..."
                />
                {errors.description && (
                  <p
                  data-testid="error-category-description"
                  className="text-red-400 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </form>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                type="submit"
                form="category-form"
                data-testid="save-category-btn"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    description: "",
                  });
                  setErrors({});
                }}
                className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6 text-emerald-400" />
                Editar Categoria
              </h2>
            </div>

            <form
              id="edit-category-form"
              onSubmit={handleUpdate}
              className="p-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Tag className="w-4 h-4" />
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Eletrônicos"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <FileText className="w-4 h-4" />
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Produtos eletrônicos como celulares, computadores, tablets e acessórios..."
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </form>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                type="submit"
                form="edit-category-form"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                  setFormData({
                    name: "",
                    description: "",
                  });
                  setErrors({});
                }}
                className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-300 mb-6">
              Tem certeza que deseja excluir esta categoria?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Excluir
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setDeleteId(null);
                }}
                className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
