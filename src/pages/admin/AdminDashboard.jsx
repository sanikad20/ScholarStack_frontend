// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Award,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { getAdminDashboard } from "../../api/dashboard.api";

const getInstitutionName = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.institutionName || "Your Institution";
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const institutionName = getInstitutionName();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchMetrics = async (showRefreshToast = false) => {
    setLoading(true);
    try {
      const { data } = await getAdminDashboard();
      if (data?.success && data?.data) {
        setMetrics(data.data);
        if (showRefreshToast) showToast("Dashboard refreshed!", "success");
      } else {
        showToast("Failed to fetch dashboard metrics.", "error");
      }
    } catch (err) {
      showToast("Error connecting to backend dashboard endpoint.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = metrics?.summary ?? {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    verifiedApplications: 0,
    draftApplications: 0,
    admissionStatistics: { conversionRatePercent: 0, rejectionRatePercent: 0 },
  };

  const CARDS = [
    {
      title: "Total Applications",
      value: summary.totalApplications,
      icon: ClipboardList,
      color: "border-blue-500 bg-blue-50/50 text-blue-600",
      link: "/admin/applications",
    },
    {
      title: "Pending Review",
      value: summary.pendingApplications,
      icon: Clock,
      color: "border-yellow-500 bg-yellow-50/50 text-yellow-600",
      link: "/admin/applications?status=under_review",
    },
    {
      title: "Verified (Pending Decision)",
      value: summary.verifiedApplications,
      icon: Award,
      color: "border-indigo-500 bg-indigo-50/50 text-indigo-600",
      link: "/admin/applications?status=verified",
    },
    {
      title: "Admitted / Approved",
      value: summary.approvedApplications,
      icon: CheckCircle,
      color: "border-green-500 bg-green-50/50 text-green-600",
      link: "/admin/applications?status=admitted",
    },
    {
      title: "Rejected",
      value: summary.rejectedApplications,
      icon: XCircle,
      color: "border-red-500 bg-red-50/50 text-red-600",
      link: "/admin/applications?status=rejected",
    },
    {
      title: "Drafts (In Progress)",
      value: summary.draftApplications,
      icon: FileSpreadsheet,
      color: "border-gray-500 bg-gray-50/50 text-gray-600",
      link: "/admin/applications?status=draft",
    },
  ];

  const QUICK_ACTIONS = [
    { label: "Review Pending Applications", path: "/admin/applications?status=under_review", icon: Clock },
    { label: "Manage Courses", path: "/admin/courses", icon: FileSpreadsheet },
    { label: "Form Builder", path: "/admin/forms", icon: Award },
    { label: "Classification Rules", path: "/admin/classification/rules", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">
                {institutionName} Dashboard
              </h1>
              <p className="mt-1 text-navySoft">
                Overview of admission applications and statistics
              </p>
            </div>
            <button
              onClick={() => fetchMetrics(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ─── Inline error removed ──────────────────── */}

          {loading && !metrics ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading stats...</div>
          ) : (
            <div className="mt-8 space-y-10">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      to={card.link}
                      className={`p-6 rounded-xl border border-l-4 ${card.color} hover:shadow-md transition cursor-pointer block`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-85 text-navy">
                          {card.title}
                        </span>
                        <Icon size={20} />
                      </div>
                      <div className="mt-4 text-3xl font-bold text-navy">{card.value}</div>
                    </Link>
                  );
                })}
              </div>

              {/* Conversion / Rejection Rates */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-semibold text-navySoft uppercase tracking-wider">
                    Admission Conversion Rate
                  </span>
                  <div className="mt-2 text-4xl font-extrabold text-green-600">
                    {summary.admissionStatistics?.conversionRatePercent}%
                  </div>
                  <p className="mt-2 text-xs text-navySoft leading-normal">
                    Percentage of applicants admitted out of all submitted applications.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-semibold text-navySoft uppercase tracking-wider">
                    Application Rejection Rate
                  </span>
                  <div className="mt-2 text-4xl font-extrabold text-red-600">
                    {summary.admissionStatistics?.rejectionRatePercent}%
                  </div>
                  <p className="mt-2 text-xs text-navySoft leading-normal">
                    Percentage of applicants rejected out of all applications processed.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-navySoft uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.label}
                        to={action.path}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-accent hover:shadow-md transition group"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition">
                          <Icon size={16} />
                        </div>
                        <span className="text-sm font-medium text-navy group-hover:text-accent transition">
                          {action.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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