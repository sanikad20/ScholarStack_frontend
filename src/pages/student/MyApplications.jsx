import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, AlertTriangle, ArrowRight, Upload, XCircle, FileText } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/**
 * Student Applications Management Page
 * Designed & Developed by Sanika
 * 
 * Features:
 * - Application history dashboard displaying all active and submitted course applications.
 * - Supports course search, document uploads, draft continuation, application withdrawal, and clickable course details.
 */

// Matches the real Application.status enum exactly.
const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  admitted: "Admitted",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  draft: "text-gray-500",
  submitted: "text-amber-600",
  under_review: "text-accent",
  verified: "text-green-600",
  admitted: "text-blue-600",
  rejected: "text-red-500",
};

function formatDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function courseOf(app) {
  const c = app.courseId;
  if (c && typeof c === "object") return { id: c._id || c.id, name: c.name || "Untitled Course" };
  return { id: c || null, name: "Untitled Course" };
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 w-full bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-16 border border-black/10 rounded-2xl">
      <AlertTriangle size={22} className="text-red-500" />
      <p className="mt-3 text-sm font-semibold text-navy">{message}</p>
      <button onClick={onRetry} className="mt-4 text-sm font-semibold text-[#FF6B3D] hover:underline">
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 border border-black/10 rounded-2xl">
      <h3 className="text-base font-semibold text-navy">No applications yet</h3>
      <p className="mt-1.5 text-sm text-navySoft max-w-sm">
        Once you apply to a course, it'll show up here so you can track its progress.
      </p>
      <Link
        to="/student/courses"
        className="mt-5 inline-flex items-center gap-2 bg-[#FF6B3D] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#F55A2A] transition"
      >
        Browse Courses <Plus size={16} />
      </Link>
    </div>
  );
}

export default function MyApplications() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applications/my");
      const payload = res?.data?.data;
      if (!Array.isArray(payload)) throw new Error("Malformed applications response");
      setApplications(payload);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError(
        err?.response?.data?.message || "We couldn't load your applications right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (appId, courseName) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${courseName}"?`)) {
      return;
    }
    setWithdrawingId(appId);
    try {
      await api.delete(`/applications/${appId}`);
      setApplications((prev) => prev.filter((a) => String(a._id || a.id) !== String(appId)));
    } catch (err) {
      console.error("Failed to withdraw application:", err);
      window.alert(err?.response?.data?.message || "Could not withdraw application. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const filtered = applications.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return courseOf(a).name.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">My Applications</h1>
              <p className="text-sm text-navySoft mt-1">
                Every application you've started, across every institution.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="flex items-center gap-2 bg-[#FF6B3D] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#F55A2A] transition"
            >
              New Application <Plus size={16} />
            </Link>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 border border-black/10 rounded-xl px-4 py-3 mb-6 bg-white">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>

          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchApplications} />
          ) : filtered.length === 0 ? (
            applications.length === 0 ? (
              <EmptyState />
            ) : (
              <p className="text-sm text-navySoft py-10 text-center">No applications match "{search}".</p>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-navySoft border-b border-black/10">
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Session</th>
                    <th className="pb-3 font-medium">Submitted / Started</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const course = courseOf(app);
                    const dateLabel = formatDate(app.submittedAt) || formatDate(app.createdAt) || "—";
                    const appId = app._id || app.id;
                    const isWithdrawing = withdrawingId === appId;

                    return (
                      <tr key={appId} className="border-b border-black/5 hover:bg-slate-50/50">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {course.id ? (
                              <Link
                                to={`/student/courses/${course.id}`}
                                className="flex items-center gap-3 group/link"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#FF6B3D]/10 text-[#FF6B3D] flex items-center justify-center flex-none font-bold text-xs group-hover/link:bg-[#FF6B3D] group-hover/link:text-white transition">
                                  <FileText size={18} />
                                </div>
                                <span className="font-semibold text-navy group-hover/link:text-[#FF6B3D] group-hover/link:underline transition max-w-xs">
                                  {course.name}
                                </span>
                              </Link>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-lg bg-[#FF6B3D]/10 text-[#FF6B3D] flex items-center justify-center flex-none font-bold text-xs">
                                  <FileText size={18} />
                                </div>
                                <span className="font-semibold text-navy max-w-xs">{course.name}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-slate-600 font-medium">{app.session || "—"}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-slate-600 font-medium">{dateLabel}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`font-semibold text-xs px-2.5 py-1 rounded-full bg-slate-100 ${STATUS_COLORS[app.status] || "text-navy"}`}>
                            {STATUS_LABEL[app.status] || app.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {course.id && (
                              <Link
                                to={`/student/courses/${course.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#FF6B3D] bg-[#FFF1EB] hover:bg-[#FFE4D6] transition"
                              >
                                View Details <ArrowRight size={12} />
                              </Link>
                            )}
                            <Link
                              to={`/student/documents/${appId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                            >
                              <Upload size={12} /> Documents
                            </Link>
                            {app.status === "draft" && course.id && (
                              <Link
                                to={`/student/apply/${course.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                              >
                                Continue
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => handleWithdraw(appId, course.name)}
                              disabled={isWithdrawing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              <XCircle size={12} /> {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}