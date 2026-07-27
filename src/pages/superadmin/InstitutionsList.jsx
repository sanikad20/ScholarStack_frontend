// src/pages/superadmin/InstitutionList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Edit2, Trash2, Building, Users, Calendar, CheckCircle, XCircle } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { getInstitutions, deleteInstitution } from "../../api/institutions.api";

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_INSTITUTIONS = [
  { _id: "1", name: "VJTI Mumbai", subdomain: "vjti", isActive: true, createdAt: "2026-01-15T10:00:00Z" },
  { _id: "2", name: "IIT Bombay", subdomain: "iitb", isActive: true, createdAt: "2026-02-20T14:30:00Z" },
  { _id: "3", name: "Harvard University", subdomain: "harvard", isActive: false, createdAt: "2026-03-10T09:15:00Z" },
];

export default function InstitutionList() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadFallbackData = () => {
    setInstitutions(FALLBACK_INSTITUTIONS);
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getInstitutions();
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          setInstitutions(data.data);
        } else {
          showToast("Failed to load institutions.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteClick = (institution) => {
    setDeleteTarget(institution);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInstitution(deleteTarget._id);
      showToast(`Institution "${deleteTarget.name}" deleted.`, "success");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchInstitutions();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting institution.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Institutions</h1>
              <p className="mt-1 text-navySoft">Manage all institutions on the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInstitutions}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => navigate("/superadmin/institutions/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
              >
                <Plus size={16} />
                Create Institution
              </button>
            </div>
          </div>

          {loading && institutions.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading institutions...</div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-4 pb-3">Name</th>
                    <th className="px-4 py-4 pb-3">Subdomain</th>
                    <th className="px-4 py-4 pb-3">Created</th>
                    <th className="px-4 py-4 pb-3">Status</th>
                    <th className="px-4 py-4 pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {institutions.map((inst) => {
                    const createdDate = inst.createdAt
                      ? new Date(inst.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr key={inst._id} className="hover:bg-gray-50/80 transition cursor-pointer">
                        <td className="px-4 py-4 text-navy font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                              <Building size={16} />
                            </div>
                            <span className="font-semibold">{inst.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-navySoft">{inst.subdomain}</td>
                        <td className="px-4 py-4 text-navySoft">{createdDate}</td>
                        <td className="px-4 py-4">
                          {inst.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                              <XCircle size={12} />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/superadmin/institutions/${inst._id}`)}
                              className="w-8 h-8 rounded-lg border border-gray-100 hover:border-accent flex items-center justify-center text-navySoft hover:text-accent transition bg-white"
                              aria-label="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(inst)}
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

              {institutions.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white border border-dashed rounded-xl mt-4">
                  No institutions found. Click "Create Institution" to add one.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── Delete Confirmation Modal ────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        title="Delete Institution"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to delete
            <br />
            <span className="font-semibold text-navy">{deleteTarget?.name || "this institution"}</span>?
            <br />
            <span className="font-semibold text-red-600">This will also delete all associated users, courses, and applications.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowDeleteModal(false);
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