// src/pages/admin/FormManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, RefreshCw, Edit2, Trash2, Search, FileText, Calendar, Layers } from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { getFormTemplates, deleteFormTemplate } from "../../api/forms.api";

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_TEMPLATES = [
  {
    _id: "67a1b2c3d4e5f6a7b8c9d101",
    courseId: { name: "B.Tech Computer Engineering", session: "2026-27" },
    session: "2026-27",
    fields: [
      { label: "Full Name", fieldId: "fullName", type: "text", validation: { required: true } },
      { label: "Date of birth", fieldId: "dob", type: "date", validation: { required: true } },
    ],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-20T14:30:00Z",
  },
  {
    _id: "67a1b2c3d4e5f6a7b8c9d102",
    courseId: { name: "B.Tech Electronics and Telecommunication", session: "2026-27" },
    session: "2026-27",
    fields: [
      { label: "Full Name", fieldId: "fullName", type: "text", validation: { required: true } },
    ],
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-02-15T09:20:00Z",
  },
  {
    _id: "67a1b2c3d4e5f6a7b8c9d103",
    courseId: { name: "M.Tech Computer Science", session: "2026-27" },
    session: "2026-27",
    fields: [
      { label: "Graduation Percentage", fieldId: "graduationPercentage", type: "number", validation: { required: true, min: 0, max: 100 } },
    ],
    createdAt: "2026-03-10T08:00:00Z",
    updatedAt: "2026-03-12T16:45:00Z",
  },
];

// ─── Main Component ────────────────────────────────────
export default function FormManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Fetch data ──────────────────────────────────────
  const loadFallbackData = () => {
    setTemplates(FALLBACK_TEMPLATES);
    setTotal(FALLBACK_TEMPLATES.length);
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getFormTemplates();
        clearTimeout(timeoutId);

        if (data?.success && data?.data) {
          // Apply client-side search and pagination
          let filtered = data.data;
          if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((t) =>
              t.courseId?.name?.toLowerCase().includes(term) ||
              t.session?.toLowerCase().includes(term)
            );
          }
          setTotal(filtered.length);
          const start = (page - 1) * limit;
          const end = start + limit;
          setTemplates(filtered.slice(start, end));
        } else {
          showToast("Failed to load form templates.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to forms API.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // ─── Handlers ────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ page: 1, search: searchTerm });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
    setSearchParams({ page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ page: newPage, search: searchTerm });
  };

  const handleDeleteClick = (template) => {
    setDeleteTarget(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFormTemplate(deleteTarget._id);
      showToast(`Form template for "${deleteTarget.courseId?.name}" deleted.`, "success");
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchTemplates(); // Refresh list
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting template.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render helpers ──────────────────────────────────
  const renderPagination = () => {
    if (total <= limit) return null;
    const totalPages = Math.ceil(total / limit);
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-navySoft">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded-md text-sm transition ${
                p === page
                  ? "bg-accent text-white"
                  : "text-navySoft hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          {/* ─── Header ────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Form Templates</h1>
              <p className="mt-1 text-navySoft">Manage application forms for each course</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTemplates}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => navigate("/admin/forms/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
              >
                <Plus size={16} />
                Create New Form
              </button>
            </div>
          </div>

          {/* ─── Search ────────────────────────────────── */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by course name or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-accent bg-white transition"
              />
            </form>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="text-sm text-accent hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* ─── Table ────────────────────────────────── */}
          {loading && templates.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading templates...</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-4 pb-3 font-semibold">Course</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Session</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Fields</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Last Modified</th>
                    <th className="px-4 py-4 pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {templates.map((template) => {
                    const fieldCount = template.fields?.length || 0;
                    const lastModified = template.updatedAt
                      ? new Date(template.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never";

                    return (
                      <tr
                        key={template._id}
                        className="hover:bg-gray-50/80 transition cursor-pointer group"
                        onClick={() => navigate(`/admin/forms/${template._id}`)}
                      >
                        <td className="px-4 py-4 text-navy font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                              <FileText size={16} />
                            </div>
                            <span className="font-semibold">{template.courseId?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-navySoft">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            {template.session || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-navySoft">
                          <div className="flex items-center gap-1.5">
                            <Layers size={14} className="text-gray-400" />
                            {fieldCount}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-navySoft">
                          {lastModified}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/forms/${template._id}`);
                              }}
                              className="w-8 h-8 rounded-lg border border-gray-100 hover:border-accent flex items-center justify-center text-navySoft hover:text-accent transition bg-white"
                              aria-label="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(template);
                              }}
                              className="w-8 h-8 rounded-lg border border-gray-100 hover:border-red-200 flex items-center justify-center text-navySoft hover:text-red-500 transition bg-white"
                              aria-label="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {templates.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white border border-dashed rounded-xl mt-4">
                  {searchTerm ? (
                    <>
                      No templates match your search.
                      <button
                        onClick={handleClearSearch}
                        className="ml-2 text-accent hover:underline"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    "No form templates found. Click 'Create New Form' to get started."
                  )}
                </div>
              )}

              {renderPagination()}
            </div>
          )}
        </main>
      </div>

      {/* ─── Delete Confirmation Modal ────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Form Template"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to delete the form template for
            <br />
            <span className="font-semibold text-navy">
              {deleteTarget?.courseId?.name || "this course"}?
            </span>
            <br />
            <span className="font-semibold text-red-600">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Toast ────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}

      <Footer />
    </div>
  );
}