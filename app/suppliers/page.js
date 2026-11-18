"use client";
import usePermissions from "@/components/usePermissions";

import ToastMessage from "@/components/ToastMessage";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Mail,
  Phone,
  User,
  Building,
  Unlink,
  Eye,
} from "lucide-react";
import UnlinkSupplierModal from "@/components/UnlinkSupplierModal.jsx";

export default function SuppliersPage() {
  const router = useRouter();
  const { isAdmin } = usePermissions();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinkingSupplier, setUnlinkingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    cnpj: "",
    uf: "",
  });

  const [errors, setErrors] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    cnpj: "",
    uf: "",
  });

  // Reset seguro do formulário
  const resetForm = () => {
    setFormData({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      cnpj: "",
      uf: "",
    });
    setErrors({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      cnpj: "",
      uf: "",
    });
  };

  const fetchSuppliers = async (search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = new URL("/api/v1/suppliers", window.location.origin);
      if (search) {
        url.searchParams.set("search", search);
      }

      const res = await fetch(url.toString(), { headers });
      const result = await res.json();

      console.log("🔍 DEBUG - suppliers API result:", result);

      if (!res.ok) {
        toast.error(<ToastMessage testId="suppliers-fetch-suppliers-error-toast">{result.mensagens?.[0] || "Erro ao carregar fornecedores"}</ToastMessage>);
        return;
      }

      setSuppliers(result.data || []);
    } catch (error) {
      toast.error(<ToastMessage testId="suppliers-fetch-suppliers-error-toast-2">{"Erro de conexão"}</ToastMessage>);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(searchTerm);
  }, [searchTerm]);

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

    // Company Name
    if (!formData.company_name?.trim()) {
      newErrors.company_name = "Nome da empresa é obrigatório";
    } else if (
      formData.company_name.length < 3 ||
      formData.company_name.length > 100
    ) {
      newErrors.company_name = "Deve ter entre 3 e 100 caracteres";
    }

    // Contact Name
    if (!formData.contact_name?.trim()) {
      newErrors.contact_name = "Nome do contato é obrigatório";
    } else if (
      formData.contact_name.length < 5 ||
      formData.contact_name.length > 80
    ) {
      newErrors.contact_name = "Deve ter entre 5 e 80 caracteres";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Phone
    const phoneRegex = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/;
    if (!formData.phone?.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Formato: (11) 98765-4321";
    }

    // CNPJ
    const cnpjRegex = /^[0-9]{14}$/;
    if (!formData.cnpj?.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (!cnpjRegex.test(formData.cnpj.replace(/\D/g, ""))) {
      newErrors.cnpj = "CNPJ deve ter 14 dígitos";
    }

    // UF
    const ufRegex = /^[A-Z]{2}$/;
    if (!formData.uf?.trim()) {
      newErrors.uf = "UF é obrigatório";
    } else if (!ufRegex.test(formData.uf.toUpperCase())) {
      newErrors.uf = "UF deve ter 2 letras maiúsculas (ex: SP)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 DEBUG - handleSubmit chamado");

    if (!validateForm()) {
      toast.error(<ToastMessage testId="suppliers-handle-submit-error-toast">{"Corrija os erros antes de salvar"}</ToastMessage>);
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, ""), // Remove formatação
      uf: formData.uf.toUpperCase(),
    };

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(<ToastMessage testId="suppliers-handle-submit-error-toast-2">{"Você precisa estar logado"}</ToastMessage>);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/v1/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(<ToastMessage testId="suppliers-handle-submit-error-toast-3">{result.mensagens?.[0] || "Erro ao cadastrar"}</ToastMessage>);
        setLoading(false);
        return;
      }

      toast.success(<ToastMessage testId="suppliers-handle-submit-success-toast">{"Fornecedor cadastrado com sucesso!"}</ToastMessage>);
      fetchSuppliers();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error(<ToastMessage testId="suppliers-handle-submit-error-toast-4">{"Erro de rede"}</ToastMessage>);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Garantir que formData não tenha valores null
    const safeFormData = {
      company_name: formData.company_name || "",
      contact_name: formData.contact_name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      cnpj: formData.cnpj || "",
      uf: formData.uf || "",
    };

    if (!validateForm()) {
      toast.error(<ToastMessage testId="suppliers-handle-update-error-toast">{"Corrija os erros antes de salvar"}</ToastMessage>);
      return;
    }

    setLoading(true);

    const payload = {
      ...safeFormData,
      cnpj: safeFormData.cnpj.replace(/\D/g, ""), // Remove formatação
      uf: safeFormData.uf.toUpperCase(),
    };

    console.log("🔍 DEBUG - Enviando para API:", payload);
    console.log("🔍 DEBUG - ID do fornecedor:", editingSupplier.id);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(<ToastMessage testId="suppliers-handle-update-error-toast-2">{"Você precisa estar logado"}</ToastMessage>);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/v1/suppliers/${editingSupplier.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("🔍 DEBUG - Status da resposta:", res.status);
      const result = await res.json();
      console.log("🔍 DEBUG - Resposta da API:", result);

      if (!res.ok) {
        toast.error(<ToastMessage testId="suppliers-handle-update-error-toast-3">{result.mensagens?.[0] || "Erro ao atualizar"}</ToastMessage>);
        setLoading(false);
        return;
      }

      toast.success(<ToastMessage testId="suppliers-handle-update-success-toast">{"Fornecedor atualizado com sucesso!"}</ToastMessage>);
      fetchSuppliers();
      setShowEditModal(false);
      setEditingSupplier(null);
      resetForm();
    } catch (error) {
      console.error("🔍 DEBUG - Erro na requisição:", error);
      toast.error(<ToastMessage testId="suppliers-handle-update-error-toast-4">{"Erro de rede"}</ToastMessage>);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(<ToastMessage testId="suppliers-handle-delete-error-toast">{"Você precisa estar logado"}</ToastMessage>);
        return;
      }

      const res = await fetch(`/api/v1/suppliers/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        // Mensagem específica para fornecedor em uso
        if (result.mensagens?.[0]?.includes("usado por produtos")) {
          // Encontrar o fornecedor para abrir modal de desvincular
          const supplier = suppliers.find((s) => s.id === deleteId);
          if (supplier) {
            setShowConfirm(false);
            setDeleteId(null);
            setUnlinkingSupplier(supplier);
            setShowUnlinkModal(true);
            return;
          }
        } else {
          toast.error(<ToastMessage testId="suppliers-handle-delete-error-toast-2">{result.mensagens?.[0] || "Erro ao excluir fornecedor"}</ToastMessage>);
        }
        setShowConfirm(false);
        setDeleteId(null);
        return;
      }

      toast.success(<ToastMessage testId="suppliers-handle-delete-success-toast">{"Fornecedor excluído com sucesso!"}</ToastMessage>);
      fetchSuppliers();
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      toast.error(<ToastMessage testId="suppliers-handle-delete-error-toast-3">{"Erro de conexão ao excluir fornecedor"}</ToastMessage>);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleUnlinkSuccess = () => {
    fetchSuppliers();
    setShowUnlinkModal(false);
    setUnlinkingSupplier(null);
    toast.success(<ToastMessage testId="suppliers-handle-unlink-success-success-toast">{"Agora você pode excluir o fornecedor!"}</ToastMessage>);
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const displayPhone = (phone) => {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    return formatPhone(clean);
  };

  const displayCNPJ = (cnpj) => {
    if (!cnpj) return "";
    const clean = cnpj.replace(/\D/g, "");
    return clean
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(suppliers.length / ITEMS_PER_PAGE);
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(1, totalPages)));
  }, [totalPages]);

  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#192f59,_#0b1222_65%)] px-4 py-8 text-slate-100 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs text-blue-200/70"><Building2 className="h-4 w-4" aria-hidden="true" /> Northwind / Fornecedores</div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Gest?o de Fornecedores</h1>
              <p className="mt-2 text-sm text-slate-400">Cadastro e administra??o de fornecedores</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button data-testid="suppliers-back-to-products-btn" onClick={() => window.open("/products", "_blank")} className="flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"><Building2 className="h-4 w-4" /> Voltar para Produtos</button>
              <button disabled={!isAdmin} title={!isAdmin ? "Dispon?vel apenas para administradores" : undefined} data-testid="new-supplier-btn" onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 rounded-lg border border-blue-400/40 bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> Novo Fornecedor</button>
            </div>
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-slate-400" aria-label="Resumo dos fornecedores carregados">
            <p><strong className="mr-2 text-xl font-semibold text-white">{suppliers.length}</strong>{searchTerm ? "fornecedores encontrados" : "fornecedores cadastrados"}</p>
            <p className="border-l border-slate-700 pl-6"><strong className="mr-2 text-xl font-semibold text-white">{new Set(suppliers.map((supplier) => supplier.uf).filter(Boolean)).size}</strong>estados representados</p>
          </div>
          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/65 shadow-xl" aria-label="Lista de fornecedores">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 p-4 sm:p-5">
              <div className="relative w-full sm:max-w-md">
                <Search aria-hidden="true" className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="text" aria-label="Buscar fornecedores" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar fornecedores..." className="w-full rounded-lg border border-slate-600 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <span className="text-xs text-slate-400">Dados e a??es sempre vis?veis</span>
            </div>
            {loading ? (
              <div className="py-12 text-center text-slate-400" role="status"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-400" /><p>Carregando fornecedores...</p></div>
            ) : suppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="mb-4 text-lg">{searchTerm ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}</p>
                {!searchTerm && <button disabled={!isAdmin} title={!isAdmin ? "Dispon?vel apenas para administradores" : undefined} data-testid="create-first-supplier-btn" onClick={() => setShowAddModal(true)} className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Cadastrar primeiro fornecedor</button>}
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-700/70">
                  {paginatedSuppliers.map((supplier) => (
                    <article key={supplier.id} aria-label={supplier.company_name} className="grid gap-5 p-5 transition hover:bg-blue-950/25 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10"><Building2 className="h-5 w-5 text-blue-300" aria-hidden="true" /></div>
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-white" title={supplier.company_name}>{supplier.company_name}</h3>
                          <p className="mt-1 break-words text-xs text-slate-400" title={supplier.contact_name}>{supplier.contact_name}</p>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>CNPJ: {displayCNPJ(supplier.cnpj)}</span><span className="rounded border border-slate-600 px-1.5 py-0.5 text-blue-100">{supplier.uf}</span></p>
                        </div>
                      </div>
                      <div className="min-w-0 space-y-2 text-xs text-slate-300">
                        <p className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="break-all" title={supplier.email}>{supplier.email}</span></p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />{displayPhone(supplier.phone)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <button data-testid={`supplier-view-products-${supplier.id}`}
                          onClick={() =>
                            router.push(`/suppliers/${supplier.id}/products`)
                          }
                          className="border border-blue-400/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Produtos
                        </button>
                        <button data-testid={`edit-supplier-${supplier.id}`}
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setFormData({
                              company_name: supplier.company_name,
                              contact_name: supplier.contact_name,
                              email: supplier.email,
                              phone: supplier.phone,
                              cnpj: supplier.cnpj,
                              uf: supplier.uf,
                            });
                            setShowEditModal(true);
                          }}
                          className="border border-slate-600 text-slate-200 hover:bg-slate-700 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button data-testid={`unlink-supplier-${supplier.id}`}
                          onClick={() => {
                            setUnlinkingSupplier(supplier);
                            setShowUnlinkModal(true);
                          }}
                          className="border border-slate-600 text-amber-200 hover:bg-amber-500/10 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                          title="Desvincular produtos deste fornecedor"
                        >
                          <Unlink className="w-4 h-4" />
                          Desvincular
                        </button>
                        <button data-testid={`delete-supplier-${supplier.id}`}
                          onClick={() => {
                            setDeleteId(supplier.id);
                            setShowConfirm(true);
                          }}
                          className="border border-red-400/30 text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <nav aria-label="Pagina??o de fornecedores" className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/80 p-5 sm:flex-row">
                  <p className="text-xs text-slate-400" aria-live="polite">Mostrando <strong className="text-slate-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}?{Math.min(currentPage * ITEMS_PER_PAGE, suppliers.length)}</strong> de <strong className="text-slate-200">{suppliers.length}</strong> fornecedores</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                    <button data-testid="suppliers-previous-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-600 px-3 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
                    <span className="text-slate-400">P?gina <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong></span>
                    <button data-testid="suppliers-next-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-600 px-3 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Pr?xima</button>
                  </div>
                </nav>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Add Modal */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Novo Fornecedor
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Tech Solutions Ltda"
                />
                {errors.company_name && (
                  <p data-testid="suppliers-suppliers-page-errors-company-name" className="text-red-400 text-xs mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <User className="w-4 h-4" />
                  Nome do Contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="João Silva"
                />
                {errors.contact_name && (
                  <p data-testid="suppliers-suppliers-page-errors-contact-name" className="text-red-400 text-xs mt-1">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="joao@techsolutions.com"
                />
                {errors.email && (
                  <p data-testid="suppliers-suppliers-page-errors-email" className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Phone className="w-4 h-4" />
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData((prev) => ({ ...prev, phone: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p data-testid="suppliers-suppliers-page-errors-phone" className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj || ""}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setFormData((prev) => ({ ...prev, cnpj: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="12.345.678/0001-90"
                />
                {errors.cnpj && (
                  <p data-testid="suppliers-suppliers-page-errors-cnpj" className="text-red-400 text-xs mt-1">{errors.cnpj}</p>
                )}
              </div>

              {/* UF */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  Estado (UF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="uf"
                  value={formData.uf}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData((prev) => ({ ...prev, uf: value }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.uf && (
                  <p data-testid="suppliers-suppliers-page-errors-uf" className="text-red-400 text-xs mt-1">{errors.uf}</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button data-testid="save-supplier-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("🔍 DEBUG - Botão salvar clicado");
                  handleSubmit(e);
                }}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button data-testid="cancel-add-supplier-btn"
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
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
                <Edit className="w-6 h-6 text-blue-400" />
                Editar Fornecedor
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Tech Solutions Ltda"
                />
                {errors.company_name && (
                  <p data-testid="suppliers-suppliers-page-errors-company-name-2" className="text-red-400 text-xs mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <User className="w-4 h-4" />
                  Nome do Contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="João Silva"
                />
                {errors.contact_name && (
                  <p data-testid="suppliers-suppliers-page-errors-contact-name-2" className="text-red-400 text-xs mt-1">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="joao@techsolutions.com"
                />
                {errors.email && (
                  <p data-testid="suppliers-suppliers-page-errors-email-2" className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Phone className="w-4 h-4" />
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData((prev) => ({ ...prev, phone: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p data-testid="suppliers-suppliers-page-errors-phone-2" className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj || ""}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setFormData((prev) => ({ ...prev, cnpj: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="12.345.678/0001-90"
                />
                {errors.cnpj && (
                  <p data-testid="suppliers-suppliers-page-errors-cnpj-2" className="text-red-400 text-xs mt-1">{errors.cnpj}</p>
                )}
              </div>

              {/* UF */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  Estado (UF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="uf"
                  value={formData.uf}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData((prev) => ({ ...prev, uf: value }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.uf && (
                  <p data-testid="suppliers-suppliers-page-errors-uf-2" className="text-red-400 text-xs mt-1">{errors.uf}</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button data-testid="update-supplier-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("🔍 DEBUG - Botão atualizar clicado");
                  handleUpdate();
                }}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
              <button data-testid="cancel-edit-supplier-btn"
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSupplier(null);
                  resetForm();
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
              Tem certeza que deseja excluir este fornecedor?
            </p>
            <div className="flex gap-3">
              <button data-testid="confirm-delete-supplier-btn"
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Excluir
              </button>
              <button data-testid="cancel-delete-supplier-btn"
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

      {/* Unlink Supplier Modal */}
      {showUnlinkModal && (
        <UnlinkSupplierModal
          supplier={unlinkingSupplier}
          onClose={() => {
            setShowUnlinkModal(false);
            setUnlinkingSupplier(null);
          }}
          onSuccess={handleUnlinkSuccess}
        />
      )}
    </>
  );
}
