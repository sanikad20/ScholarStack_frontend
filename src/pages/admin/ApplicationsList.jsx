import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Filter, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

const STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-600 border border-amber-200/50",
  verified: "bg-indigo-50 text-indigo-600",
  admitted: "bg-green-50 text-green-600 border border-green-200/50",
  rejected: "bg-red-50 text-red-500 border border-red-200/50",
};

const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified (Pending Decision)",
  admitted: "Admitted",
  rejected: "Rejected",
};

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications/admin/all");
      if (data?.success && data?.data) {
        setApplications(data.data);
      } else {
        setError("Failed to fetch applications index.");
      }
    } catch (err) {
      setError("Error connecting to applications API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const nameMatch = app.applicantId?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = app.applicantId?.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const courseMatch = app.courseId?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSearch = searchTerm === "" || nameMatch || emailMatch || courseMatch;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admissions Applications</h1>
              <p className="mt-1 text-navySoft">Review and manage student admission submissions</p>
            </div>
            <button
              onClick={fetchApplications}
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

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search applicant name, email or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-accent bg-white transition"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-accent font-semibold text-navySoft cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified (Pending Decision)</option>
                <option value="admitted">Admitted</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {loading && applications.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading applications...</div>
          ) : (
            <div className="mt-6 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 text-left text-xs uppercase tracking-wider text-navySoft border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold">Applicant</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Course Applied</th>
                    <th className="px-6 py-4 font-semibold">Session</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-navy">
                        {app.applicantId?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-navySoft">{app.applicantId?.email || "—"}</td>
                      <td className="px-6 py-4 font-medium text-navy">
                        {app.courseId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-navySoft">{app.courseId?.session || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_BADGE[app.status]}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/applications/${app._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-dark transition"
                        >
                          <Eye size={14} />
                          Review Application
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white">
                  No matching admission applications found.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
