// src/pages/admin/CourseManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, RefreshCw, BookOpen, Users, Calendar, CheckCircle, XCircle, Search } from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { getCourses } from "../../api/courses.api";

// ─── Fallback Courses ──────────────────────────────────
const FALLBACK_COURSES = [ /* ... same as before, include active/inactive */];

export default function CourseManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // ─── Read status from URL ───────────────────────────
  const statusFilter = searchParams.get("status") || "all"; // "all", "active", "inactive"

  const [searchTerm, setSearchTerm] = useState("");

  const showToast = (message, type = "success") => setToast({ message, type });

  const loadFallbackData = () => {
    setCourses(FALLBACK_COURSES);
    setLoading(false);
    showToast("⚠️ Using fallback data (server offline)", "info");
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const { data } = await getCourses();
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          setCourses(data.data);
        } else {
          showToast("Failed to load courses.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to courses API.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Filter courses by status + search ──────────────
  const filteredCourses = courses.filter((course) => {
    // Status filter
    if (statusFilter === "active" && !course.isActive) return false;
    if (statusFilter === "inactive" && course.isActive) return false;

    // Search filter (by name or session)
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const nameMatch = course.name?.toLowerCase().includes(term);
      const sessionMatch = course.session?.toLowerCase().includes(term);
      return nameMatch || sessionMatch;
    }
    return true;
  });

  const hasActiveFilters = () => {
    return statusFilter !== "all" || searchTerm.trim() !== "";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  const handleRowClick = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
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
              <h1 className="text-3xl font-bold text-navy">Courses</h1>
              <p className="mt-1 text-navySoft">Manage your institution's courses and their admission settings</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCourses}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => navigate("/admin/courses/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
              >
                <Plus size={16} />
                Create Course

              </button>
            </div>
          </div>

          {/* ─── Search + Filter bar ────────────────── */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by course name or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-accent bg-white transition"
              />
            </div>
            <div className="flex gap-2 shrink-0 items-center">
              <button
                onClick={() => setSearchParams({ status: "all" })}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${statusFilter === "all"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-navySoft hover:bg-gray-200"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setSearchParams({ status: "active" })}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${statusFilter === "active"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-navySoft hover:bg-gray-200"
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setSearchParams({ status: "inactive" })}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${statusFilter === "inactive"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-navySoft hover:bg-gray-200"
                  }`}
              >
                Inactive
              </button>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-accent hover:underline ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ─── Table ────────────────────────────────── */}
          {loading && courses.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading courses...</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-4 pb-3 font-semibold">Course Name</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Session</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Capacity</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Applications</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredCourses.map((course) => (
                    <tr
                      key={course._id}
                      onClick={() => handleRowClick(course._id)}
                      className="hover:bg-gray-50/80 transition cursor-pointer group"
                    >
                      <td className="px-4 py-4 text-navy font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <BookOpen size={16} />
                          </div>
                          <span className="font-semibold">{course.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-navySoft">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {course.session || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-navySoft">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          {course.admissionCapacity || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-navySoft">
                        <span className="font-medium text-navy">0</span>
                      </td>
                      <td className="px-4 py-4">
                        {course.isActive ? (
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
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCourses.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white border border-dashed rounded-xl mt-4">
                  {hasActiveFilters() ? (
                    <>
                      No courses match your filters.
                      <button
                        onClick={clearFilters}
                        className="ml-2 text-accent hover:underline"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    "No courses found. Click 'Create Course' to add your first course."
                  )}
                </div>
              )}
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