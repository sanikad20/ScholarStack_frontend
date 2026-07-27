// src/pages/admin/ClassificationBulk.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { classifyAllApplications } from "../../api/classifications.api";
import { getAllApplications } from "../../api/applications.api";

// ─── Main Component ────────────────────────────────────
export default function ClassificationBulk() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(true);
  const [totalApps, setTotalApps] = useState(0);
  const [classifiedCount, setClassifiedCount] = useState(0);
  const [lastRun, setLastRun] = useState(null);
  const [lastRunResult, setLastRunResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Load stats ──────────────────────────────────────
  const fetchStats = async () => {
    setFetchingStats(true);
    try {
      const { data } = await getAllApplications();
      if (data?.success && data?.data) {
        const apps = data.data;
        setTotalApps(apps.length);
        const classified = apps.filter((app) => app.classification?.eligible !== undefined).length;
        setClassifiedCount(classified);
      }
    } catch (err) {
      showToast("Failed to fetch application stats.", "error");
    } finally {
      setFetchingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Load last run from localStorage
    const savedRun = localStorage.getItem("classificationLastRun");
    if (savedRun) {
      try {
        const parsed = JSON.parse(savedRun);
        setLastRun(parsed.timestamp);
        setLastRunResult(parsed.result);
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Run classification ──────────────────────────────
  const handleRun = async () => {
    setLoading(true);
    try {
      const { data } = await classifyAllApplications();
      if (data?.success) {
        const result = {
          count: data.count || 0,
          message: data.message || "Classification completed.",
          timestamp: new Date().toISOString(),
        };
        setLastRunResult(result);
        setLastRun(result.timestamp);
        localStorage.setItem("classificationLastRun", JSON.stringify(result));
        showToast(`${data.message}`, "success");
        // Refresh stats
        await fetchStats();
      } else {
        showToast("Failed to run classification.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error running classification.", "error");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const pending = totalApps - classifiedCount;
  const lastRunTime = lastRun
    ? new Date(lastRun).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Never";

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          {/* ─── Header ────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Run Bulk Classification</h1>
              <p className="mt-1 text-navySoft">
                Apply classification rules to all applications at once
              </p>
            </div>
            <button
              onClick={fetchStats}
              disabled={fetchingStats}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={fetchingStats ? "animate-spin" : ""} />
              Refresh Stats
            </button>
          </div>

          {/* ─── Stats Cards ───────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Applications"
              value={totalApps}
              icon={Users}
              color="bg-blue-50 text-blue-600 border-blue-200"
            />
            <StatCard
              title="Already Classified"
              value={classifiedCount}
              icon={CheckCircle}
              color="bg-green-50 text-green-600 border-green-200"
            />
            <StatCard
              title="Pending Classification"
              value={pending}
              icon={Clock}
              color="bg-yellow-50 text-yellow-600 border-yellow-200"
            />
          </div>

          {/* ─── Info Note ──────────────────────────────── */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">What this does</p>
              <p className="text-xs text-amber-700">
                The classification engine evaluates all applications against the configured rules
                (Eligibility, Merit Level, Reserved Category) and updates the classification field
                for each application. Existing classifications will be overwritten.
              </p>
            </div>
          </div>

          {/* ─── Action Zone ───────────────────────────── */}
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                <Play size={28} />
              </div>
              <h2 className="text-xl font-bold text-navy">Ready to Run</h2>
              <p className="text-sm text-navySoft max-w-lg mt-2">
                This will run the classification engine on <strong>{pending}</strong> pending applications
                (out of <strong>{totalApps}</strong> total). It may take a few moments depending on the number of applications.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={loading || pending === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-8 py-3 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                  {loading ? "Processing..." : `Run Classification on All`}
                </button>
              </div>

              {loading && (
                <div className="mt-4 w-full max-w-md">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-accent rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-xs text-navySoft mt-2">Running classification engine...</p>
                </div>
              )}

              {/* Last run info */}
              {lastRunResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left w-full max-w-md">
                  <p className="text-xs font-semibold text-navySoft uppercase tracking-wider">
                    Last Run
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-navy">
                      {lastRunResult.count} applications classified
                    </span>
                    <span className="text-xs text-navySoft">{lastRunTime}</span>
                  </div>
                  <p className="text-xs text-navySoft mt-0.5">{lastRunResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ─── Confirmation Modal ────────────────────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Run Bulk Classification"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to run classification on <strong>{pending}</strong> pending applications?
            <br />
            <span className="font-semibold text-amber-600">This will overwrite existing classifications.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
            >
              {loading ? "Running..." : "Run Now"}
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

// ─── Stat Card Sub-component ─────────────────────────
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border ${color} bg-opacity-30`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold uppercase tracking-wider opacity-75">{title}</span>
      <Icon size={18} />
    </div>
    <div className="mt-2 text-3xl font-extrabold">{value}</div>
  </div>
);