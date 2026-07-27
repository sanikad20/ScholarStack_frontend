// src/pages/admin/ApplicationsList.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Filter,
  X,
  ChevronDown,
  RotateCw,
  AlertTriangle,
} from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

//import { filterApplications } from "../../api/applications.api";
import { filterByClassification, classifyAllApplications } from "../../api/classifications.api";

// ─── Constants ──────────────────────────────────────────
const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Verified", value: "verified" },
  { label: "Admitted", value: "admitted" },
  { label: "Rejected", value: "rejected" },
];

const MERIT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "High Merit", value: "High Merit" },
  { label: "Medium Merit", value: "Medium Merit" },
  { label: "Low Merit", value: "Low Merit" },
];

const ELIGIBILITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Eligible", value: "true" },
  { label: "Not Eligible", value: "false" },
];

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "General", value: "General" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" },
  { label: "OBC", value: "OBC" },
  { label: "EWS", value: "EWS" },
];

const RESERVED_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Reserved", value: "true" },
  { label: "General", value: "false" },
];

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  verified: "bg-indigo-100 text-indigo-700",
  admitted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  admitted: "Admitted",
  rejected: "Rejected",
};

// ─── Main Component ────────────────────────────────────
export default function ApplicationsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [classifying, setClassifying] = useState(false);

  // ─── Filters ─────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [meritLevel, setMeritLevel] = useState(searchParams.get("merit") || "all");
  const [eligibility, setEligibility] = useState(searchParams.get("eligible") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [isReserved, setIsReserved] = useState(searchParams.get("reserved") || "all");

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    setStatus(searchParams.get("status") || "all");
    setMeritLevel(searchParams.get("merit") || "all");
    setEligibility(searchParams.get("eligible") || "all");
    setCategory(searchParams.get("category") || "all");
    setIsReserved(searchParams.get("reserved") || "all");
    setSearchTerm(searchParams.get("search") || "");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Fetch Data ─────────────────────────────────────
  const fetchApplications = async (resetPage = true) => {
    if (resetPage) setPage(1);

    setLoading(true);

    try {
      const params = {
        page: resetPage ? 1 : page,
        limit,
        status: status !== "all" ? status : undefined,
        meritLevel: meritLevel !== "all" ? meritLevel : undefined,
        eligible: eligibility !== "all" ? eligibility === "true" : undefined,
        category: category !== "all" ? category : undefined,
        isReserved: isReserved !== "all" ? isReserved === "true" : undefined,
      };

      const { data } = await filterByClassification(params);

      if (data?.success) {
        setApplications(data.data || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.pages || 1);

        // Update URL params
        const newParams = {};
        if (status !== "all") newParams.status = status;
        if (meritLevel !== "all") newParams.merit = meritLevel;
        if (eligibility !== "all") newParams.eligible = eligibility;
        if (category !== "all") newParams.category = category;
        if (isReserved !== "all") newParams.reserved = isReserved;
        if (page > 1) newParams.page = page;
        setSearchParams(newParams);
      } else {
        showToast("Failed to fetch applications.", "error");
      }
    } catch (err) {
      showToast("Error connecting to applications API.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, meritLevel, eligibility, category, isReserved]);

  // ─── Check for unclassified applications ──────────────
  const hasUnclassified = applications.some(
    (app) => !app.classification || app.classification?.eligible === undefined
  );

  // ─── Bulk classify handler ──────────────────────────────
  const handleClassifyAll = async () => {
    setClassifying(true);
    try {
      const { data } = await classifyAllApplications();
      if (data?.success) {
        showToast(`${data.message || "All applications classified successfully!"}`, "success");
        // Refresh the list
        await fetchApplications(false);
      } else {
        showToast("Failed to run classification.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error running classification.", "error");
    } finally {
      setClassifying(false);
    }
  };

  // ─── Handlers ──────────────────────────────────────
  const handleClearFilters = () => {
    setStatus("all");
    setMeritLevel("all");
    setEligibility("all");
    setCategory("all");
    setIsReserved("all");
    setSearchTerm("");
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchApplications(false);
  };

  const hasActiveFilters = () => {
    return (
      status !== "all" ||
      meritLevel !== "all" ||
      eligibility !== "all" ||
      category !== "all" ||
      isReserved !== "all" ||
      searchTerm !== ""
    );
  };

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    const term = searchTerm.toLowerCase().trim();
    return applications.filter((app) => {
      const name = app.applicantId?.name?.toLowerCase() || "";
      const email = app.applicantId?.email?.toLowerCase() || "";
      const course = app.courseId?.name?.toLowerCase() || "";
      const id = app._id?.toLowerCase() || "";
      return name.includes(term) || email.includes(term) || course.includes(term) || id.includes(term);
    });
  }, [applications, searchTerm]);

  // ─── Rendering ─────────────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisible = 5; // number of page buttons to show
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-navySoft">
          Showing {(page - 1) * limit + 1}–
          {Math.min(page * limit, totalItems)} of {totalItems}
        </div>
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed text-navySoft hover:bg-gray-100"
          >
            Prev
          </button>

          {/* First page if not in window */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded-md text-sm text-navySoft hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-400">…</span>}
            </>
          )}

          {/* Page numbers */}
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded-md text-sm transition ${p === page
                ? "bg-accent text-white"
                : "text-navySoft hover:bg-gray-100"
                }`}
            >
              {p}
            </button>
          ))}

          {/* Last page if not in window */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 rounded-md text-sm text-navySoft hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed text-navySoft hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderActiveFilters = () => {
    const filters = [];
    if (status !== "all") filters.push(`Status: ${STATUS_LABELS[status]}`);
    if (meritLevel !== "all") filters.push(`Merit: ${meritLevel}`);
    if (eligibility !== "all") filters.push(`Eligibility: ${eligibility === "true" ? "Eligible" : "Not Eligible"}`);
    if (category !== "all") filters.push(`Category: ${category}`);
    if (isReserved !== "all") filters.push(`Reserved: ${isReserved === "true" ? "Yes" : "No"}`);
    if (searchTerm) filters.push(`Search: ${searchTerm}`);

    if (filters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs font-semibold text-navySoft">Active filters:</span>
        {filters.map((label, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-navy"
          >
            {label}
          </span>
        ))}
        <button
          onClick={handleClearFilters}
          className="text-xs text-accent hover:underline ml-1"
        >
          Clear all
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10 max-w-full overflow-hidden">
          {/* ─── Header ────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Applications</h1>
              <p className="mt-1 text-navySoft">
                Review and manage student admission submissions
              </p>
            </div>
          </div>

          {/* ─── Classification Banner ────────────────── */}
          {hasUnclassified && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Some applications are not classified.</span>{" "}
                  Merit levels are not displayed until classification is run.
                </p>
              </div>
              <button
                onClick={handleClassifyAll}
                disabled={classifying}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50 shrink-0"
              >
                <RotateCw size={14} className={classifying ? "animate-spin" : ""} />
                {classifying ? "Classifying..." : "Classify All"}
              </button>
            </div>
          )}

          {/* ─── Header Row: Search + Action Buttons ────────── */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, course, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchApplications(true)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-accent bg-white transition"
              />
            </div>

            <button
              onClick={() => fetchApplications(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-3 text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
            >
              <Filter size={16} />
              Apply Filters
            </button>

            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-5 py-3 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <X size={16} />
                Clear All
              </button>
            )}

            <button
              onClick={() => fetchApplications(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ─── Filter Dropdowns ────────────────────────────── */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Merit Level */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Merit Level
                </label>
                <select
                  value={meritLevel}
                  onChange={(e) => setMeritLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
                >
                  {MERIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eligibility */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Eligibility
                </label>
                <select
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
                >
                  {ELIGIBILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reserved */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Reserved
                </label>
                <select
                  value={isReserved}
                  onChange={(e) => setIsReserved(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
                >
                  {RESERVED_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ─── Active filters display ────────────────────── */}
            {renderActiveFilters()}
          </div>

          {/* ─── Table ────────────────────────────────── */}
          {loading && filteredApplications.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading applications...</div>
          ) : (
            <div className="mt-6 overflow-x-auto max-w-full">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-4 pb-3 font-semibold">Applicant</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Course</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Category</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Merit</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Submitted</th>
                    <th className="px-4 py-4 pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredApplications.map((app) => {
                    const submissionDate = app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : "Not submitted";
                    const categoryText = app.personalDetails?.category || "General";
                    const meritText = app.classification?.meritLevel || "—";

                    return (
                      <tr
                        key={app._id}
                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                        className="hover:bg-gray-50/80 transition cursor-pointer group"
                      >
                        <td className="px-4 py-4 text-navy font-medium">
                          <div>
                            <span className="block font-semibold">{app.applicantId?.name || "Unknown"}</span>
                            <span className="text-xs text-navySoft">{app.applicantId?.email || ""}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-navySoft font-medium">
                          {app.courseId?.name || "—"}
                        </td>
                        <td className="px-4 py-4 text-navySoft font-medium">
                          {categoryText}
                        </td>
                        <td className="px-4 py-4">
                          {app.classification?.eligible !== undefined ? (
                            <span
                              className={`text-xs font-semibold ${meritText === "High Merit"
                                ? "text-emerald-600"
                                : meritText === "Medium Merit"
                                  ? "text-yellow-600"
                                  : meritText === "Low Merit"
                                    ? "text-gray-500"
                                    : "text-navySoft"
                                }`}
                            >
                              {meritText}
                            </span>
                          ) : (
                            <span className="text-xs text-navySoft">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-navySoft">
                          {submissionDate}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABELS[app.status] || app.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white border border-dashed rounded-xl mt-4">
                  No applications match your filters.
                  <button
                    onClick={handleClearFilters}
                    className="ml-2 text-accent hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {renderPagination()}
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