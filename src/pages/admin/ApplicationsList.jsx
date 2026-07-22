import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

const STATUS_COLORS = {
  draft: "text-gray-400 font-semibold",
  submitted: "text-blue-500 font-semibold",
  under_review: "text-[#FF5A3C] font-semibold",
  verified: "text-indigo-500 font-semibold",
  admitted: "text-green-600 font-semibold",
  rejected: "text-red-500 font-semibold",
};

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  admitted: "Admitted",
  rejected: "Rejected",
};

export default function ApplicationsList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

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

    return searchTerm === "" || nameMatch || emailMatch || courseMatch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Applications</h1>
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

          <div className="mt-8 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Student name or ID.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-accent bg-white transition"
            />
          </div>

          {loading && applications.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading applications...</div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 pb-3">Applicant</th>
                    <th className="px-6 py-4 pb-3">Course</th>
                    <th className="px-6 py-4 pb-3">Category</th>
                    <th className="px-6 py-4 pb-3">Submitted</th>
                    <th className="px-6 py-4 pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredApplications.map((app) => {
                    const submissionDate = app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "1 July 2026";

                    const categoryText = app.personalDetails?.category || "General";

                    return (
                      <tr
                        key={app._id}
                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                        className="hover:bg-gray-50/70 transition cursor-pointer"
                      >
                        <td className="px-6 py-5 text-navy font-medium">
                          {app.applicantId?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-5 text-navySoft font-medium">
                          {app.courseId?.name || "—"}
                        </td>
                        <td className="px-6 py-5 text-navySoft font-medium">
                          {categoryText}
                        </td>
                        <td className="px-6 py-5 text-navySoft">
                          {submissionDate}
                        </td>
                        <td className="px-6 py-5">
                          <span className={STATUS_COLORS[app.status] || "text-gray-500 font-semibold"}>
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
