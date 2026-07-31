import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, AlertTriangle, ArrowRight } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/* =========================================================================
   ScholarStack — My Applications
   Wired to GET /applications/my, which returns every application for the
   logged-in student with courseId populated as { name, session } — no
   institution name is populated there (same limitation noted on
   BrowseCourses/CourseDetail), so that column falls back generically.
   ========================================================================= */

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
  submitted: "text-gold",
  under_review: "text-accent",
  verified: "text-green-600",
  admitted: "text-blue",
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
  if (c && typeof c === "object") return { id: c._id, name: c.name || "Untitled Course" };
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
      <button onClick={onRetry} className="mt-4 text-sm font-semibold text-accent hover:underline">
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
        className="mt-5 inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition"
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
              className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition"
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
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-navySoft border-b border-black/10">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Session</th>
                  <th className="pb-3 font-medium">
                    {/* label reflects whichever date is actually shown per row */}
                    Submitted / Started
                  </th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const course = courseOf(app);
                  const dateLabel = formatDate(app.submittedAt) || formatDate(app.createdAt) || "—";
                  return (
                    <tr key={app._id} className="border-b border-black/5">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex-none" />
                          <span className="font-medium text-navy max-w-xs">{course.name}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-accent font-medium">{app.session || "—"}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-accent font-medium">{dateLabel}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`font-semibold ${STATUS_COLORS[app.status] || "text-navy"}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {app.status === "draft" && course.id && (
                          <Link
                            to={`/student/apply/${course.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                          >
                            Continue <ArrowRight size={12} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}