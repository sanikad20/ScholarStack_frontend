import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Award, CheckCircle, XCircle, FileSpreadsheet, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/dashboard/admin");
      if (data?.success && data?.data) {
        setMetrics(data.data);
      } else {
        setError("Failed to fetch dashboard metrics.");
      }
    } catch (err) {
      setError("Error connecting to backend dashboard endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const summary = metrics?.summary ?? {
    totalApplications: 0,
    under_reviewApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    verifiedApplications: 0,
    draftApplications: 0,
    admissionStatistics: { conversionRatePercent: 0, rejectionRatePercent: 0 }
  };

  const CARDS = [
    {
      title: "Total Applications",
      value: summary.totalApplications,
      icon: ClipboardList,
      color: "border-blue-500 bg-blue-50/50 text-blue-600"
    },
    {
      title: "Under Review",
      value: summary.under_reviewApplications,
      icon: RefreshCw,
      color: "border-yellow-500 bg-yellow-50/50 text-yellow-600"
    },
    {
      title: "Verified (Pending Decision)",
      value: summary.verifiedApplications,
      icon: Award,
      color: "border-indigo-500 bg-indigo-50/50 text-indigo-600"
    },
    {
      title: "Admitted / Approved",
      value: summary.approvedApplications,
      icon: CheckCircle,
      color: "border-green-500 bg-green-50/50 text-green-600"
    },
    {
      title: "Rejected",
      value: summary.rejectedApplications,
      icon: XCircle,
      color: "border-red-500 bg-red-50/50 text-red-600"
    },
    {
      title: "Drafts (In Progress)",
      value: summary.draftApplications,
      icon: FileSpreadsheet,
      color: "border-gray-500 bg-gray-50/50 text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Institution Dashboard</h1>
              <p className="mt-1 text-navySoft">Overview of admission applications and statistics</p>
            </div>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          {loading && !metrics ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading stats...</div>
          ) : (
            <div className="mt-8 space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className={`p-6 rounded-xl border border-l-4 ${card.color}`}>
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-semibold text-navySoft uppercase tracking-wider">
                    Admission Conversion Rate
                  </span>
                  <div className="mt-2 text-4xl font-extrabold text-green-600">
                    {summary.admissionStatistics?.conversionRatePercent}%
                  </div>
                  <p className="mt-2 text-xs text-navySoft leading-normal">
                    Percentage of applicants admitted out of all submitted applications in this system.
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

              <div className="p-6 rounded-xl border border-gray-100 bg-[#FFF3EA] flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-navy">Get started managing your session</h3>
                  <p className="text-sm text-navySoft mt-1">
                    Configure your courses and customize your application form builder templates.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Link
                    to="/admin/courses"
                    className="inline-flex justify-center rounded-lg border border-accent text-accent px-5 py-2.5 text-sm font-semibold hover:bg-accent/5 transition duration-200"
                  >
                    Manage Courses
                  </Link>
                  <Link
                    to="/admin/form-builder"
                    className="inline-flex justify-center rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dark transition duration-200"
                  >
                    Form Builder
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
