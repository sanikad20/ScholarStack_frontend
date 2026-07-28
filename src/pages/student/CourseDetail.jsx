import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Users, FileText, CalendarDays, BarChart3, AlertTriangle, RefreshCw } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/* =========================================================================
   ScholarStack — Course Detail
   Wired to the real Course model, which only has:
     name, description, tenantId (-> Institution), eligibilityCriteria,
     admissionCapacity, requiredDocuments, session, isActive, createdAt,
     updatedAt.
   "Duration" isn't a schema field, so that overview card is replaced with
   "Documents Required" (a real, derivable count). Everything else maps
   directly to real fields.

   ASSUMPTION (no course routes file provided): fetched from
   GET /courses/:id via the shared axios instance, returning either
   { success, data: {...} } or the bare course object. Adjust below if your
   actual route/shape differs.
   ========================================================================= */

function formatDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// eligibilityCriteria is Schema.Types.Mixed — could be a string, an object
// of key/value rules, an array, or empty. Render whatever shape it is
// without assuming a specific structure.
function formatEligibility(criteria) {
  if (criteria === null || criteria === undefined) return "Not specified";
  if (typeof criteria === "string") return criteria.trim() || "Not specified";
  if (Array.isArray(criteria)) {
    return criteria.length ? criteria.join(", ") : "Not specified";
  }
  if (typeof criteria === "object") {
    const entries = Object.entries(criteria).filter(([, v]) => v !== null && v !== undefined && v !== "");
    if (!entries.length) return "Not specified";
    return entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
  }
  return String(criteria);
}

function institutionOf(course) {
  const t = course?.tenantId;
  if (t && typeof t === "object") return t.name || "Institution";
  return "Institution";
}

/* --------------------------------- Skeleton -------------------------------- */
function DetailSkeleton() {
  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-72 h-48 md:h-auto rounded-xl bg-gray-100 flex-none" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="h-3 w-40 bg-gray-100 rounded-full" />
          <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
          <div className="h-4 w-full bg-gray-100 rounded-md" />
          <div className="h-4 w-2/3 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Error state ------------------------------ */
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-20 border border-black/10 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
        <AlertTriangle size={22} className="text-[#DC2626]" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-navy">Couldn't load this course</h3>
      <p className="mt-1.5 text-sm text-navySoft max-w-sm">
        {message || "Something went wrong while fetching this course. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-dark text-white text-[13px] font-semibold transition-colors"
      >
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/courses/${id}`);
      const payload = res?.data?.data ?? res?.data;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Malformed course response");
      }

      setCourse({ ...payload, id: payload.id || payload._id });
    } catch (err) {
      console.error("Course detail fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          "We couldn't load this course right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const requiredDocs = course?.requiredDocuments || [];

  const overview = course
    ? [
        {
          icon: Users,
          iconBg: "bg-orange-50 text-orange-500",
          value: typeof course.admissionCapacity === "number" ? `${course.admissionCapacity} seats` : "—",
          label: "Capacity",
        },
        {
          icon: CalendarDays,
          iconBg: "bg-gray-100 text-gray-500",
          value: course.session || "—",
          label: "Session",
        },
        {
          icon: FileText,
          iconBg: "bg-purple-50 text-purple-500",
          value: `${requiredDocs.length} document${requiredDocs.length !== 1 ? "s" : ""}`,
          label: "Required",
        },
        {
          icon: BarChart3,
          iconBg: "bg-green-50 text-green-600",
          value: formatEligibility(course.eligibilityCriteria),
          label: "Eligibility",
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          {error ? (
            <ErrorState message={error} onRetry={fetchCourse} />
          ) : loading || !course ? (
            <DetailSkeleton />
          ) : (
            <>
              <div className="border border-black/10 rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <div className="w-full md:w-72 h-48 md:h-auto rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-none" />

                  <div className="flex-1 flex flex-col">
                    <div className="text-xs text-navySoft mb-2">
                      Added: {formatDate(course.createdAt) || "—"}
                      {course.updatedAt && course.updatedAt !== course.createdAt && (
                        <> &nbsp;·&nbsp; Last Updated: {formatDate(course.updatedAt)}</>
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-navy">{course.name}</h1>
                    {course.description && <p className="mt-2 text-sm text-navySoft">{course.description}</p>}

                    <div className="mt-4 pt-4 border-t border-black/5 flex-1 flex flex-col justify-end">
                      <p className="text-sm font-semibold text-navy mb-4">
                        {institutionOf(course)}
                        {course.session && <> · {course.session} session</>}
                      </p>
                      {course.isActive ? (
                        <Link
                          to={`/student/apply/${course.id}`}
                          className="self-end inline-flex items-center bg-accent hover:bg-accent-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
                        >
                          Apply Now
                        </Link>
                      ) : (
                        <span className="self-end inline-flex items-center bg-gray-100 text-gray-400 font-semibold text-sm px-6 py-3 rounded-full cursor-not-allowed">
                          Applications Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 mt-10">
                <div>
                  <h2 className="text-sm font-semibold text-navySoft mb-5">Course Overview</h2>
                  <div className="space-y-5">
                    {overview.map(({ icon: Icon, iconBg, value, label }) => (
                      <div key={label} className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-none ${iconBg}`}>
                          <Icon size={19} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-navy">{value}</div>
                          <div className="text-xs text-navySoft">{label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-navySoft mb-5">Documents required</h2>
                  {requiredDocs.length > 0 ? (
                    <div className="space-y-5">
                      {requiredDocs.map((doc) => (
                        <div key={doc} className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-orange-50 text-accent flex items-center justify-center flex-none">
                            <FileText size={19} />
                          </div>
                          <div className="text-sm font-semibold text-navy">{doc}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-navySoft">No documents specified for this course.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}