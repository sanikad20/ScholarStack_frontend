// src/pages/superadmin/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { getInstitutions } from "../../api/institutions.api";

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_INSTITUTIONS = [
  { _id: "1", name: "VJTI Mumbai", subdomain: "vjti", isActive: true },
  { _id: "2", name: "IIT Bombay", subdomain: "iitb", isActive: true },
  { _id: "3", name: "Harvard University", subdomain: "harvard", isActive: false },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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

  const total = institutions.length;
  const active = institutions.filter((i) => i.isActive).length;
  const inactive = institutions.filter((i) => !i.isActive).length;

  const CARDS = [
    { title: "Total Institutions", value: total, icon: Building, color: "border-blue-500 bg-blue-50/50 text-blue-600" },
    { title: "Active", value: active, icon: CheckCircle, color: "border-green-500 bg-green-50/50 text-green-600" },
    { title: "Inactive", value: inactive, icon: XCircle, color: "border-red-500 bg-red-50/50 text-red-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Super Admin Dashboard</h1>
              <p className="mt-1 text-navySoft">Overview of all institutions in the platform</p>
            </div>
            <button
              onClick={fetchInstitutions}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ─── Cards ──────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`p-6 rounded-xl border border-l-4 ${card.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider opacity-85 text-navy">
                      {card.title}
                    </span>
                    <Icon size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-bold text-navy">{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* ─── Quick actions ────────────────────────── */}
          <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-navySoft uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/superadmin/institutions/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dark transition"
              >
                + Create Institution
              </button>
              <button
                onClick={() => navigate("/superadmin/institutions")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
              >
                View All Institutions
              </button>
            </div>
          </div>
        </main>
      </div>

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