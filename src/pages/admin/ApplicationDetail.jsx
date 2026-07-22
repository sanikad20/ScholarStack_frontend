import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Check, X } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const appRes = await api.get(`/applications/${id}`);
      if (appRes.data?.success && appRes.data?.data) {
        const appData = appRes.data.data;
        setApplication(appData);
        setStatus(appData.status || "");
        setRemarks(appData.remarks || "");
      }

      const docRes = await api.get(`/documents/${id}`);
      if (docRes.data?.success && docRes.data?.data) {
        setDocuments(docRes.data.data);
      }
    } catch (err) {
      setError("Failed to fetch application details or documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put(`/applications/admin/${id}`, {
        status,
        remarks,
      });
      if (data?.success) {
        setApplication(data.data);
        alert("Application status updated successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "Error updating status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentReview = async (docId, docStatus) => {
    try {
      const { data } = await api.put(`/documents/${docId}/status`, {
        status: docStatus,
        remarks: docStatus === "rejected" ? "Document rejected" : "Document approved",
      });

      if (data?.success) {
        alert(`Document ${docStatus} successfully!`);
        const docRes = await api.get(`/documents/${id}`);
        if (docRes.data?.success) setDocuments(docRes.data.data);
      }
    } catch (err) {
      alert("Error updating document status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading details...</span>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <Link to="/admin/applications" className="inline-flex items-center gap-2 text-accent font-semibold mb-6">
              <ArrowLeft size={16} /> Back to Applications
            </Link>
            <div className="p-8 text-center border border-dashed rounded-xl text-navySoft font-semibold">
              Application not found.
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const appNumber = application._id.substring(application._id.length - 5).toUpperCase();
  const submissionDate = application.createdAt
    ? new Date(application.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Jul 1, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-dark mb-6 transition"
          >
            <ArrowLeft size={16} />
            Back to Applications
          </Link>

          {error && (
            <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy">{application.applicantId?.name || "Ananya Sharma"}</h1>
            <p className="text-sm font-semibold text-navySoft mt-1">
              Application #SS-{appNumber} · {application.courseId?.name || "B.Tech Computer Science"} · Submitted {submissionDate}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            
            <div className="lg:col-span-3 space-y-6">
              
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-6">Student profile</h2>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Full name</span>
                    <span className="font-bold text-navy">{application.applicantId?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Email</span>
                    <span className="font-bold text-navy break-all">{application.applicantId?.email || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Date of birth</span>
                    <span className="font-bold text-navy">
                      {application.personalDetails?.date_of_birth
                        ? new Date(application.personalDetails.date_of_birth).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "14 Mar 2008"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Phone</span>
                    <span className="font-bold text-navy">{application.personalDetails?.phone || "+91 98765 43210"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">12th percentage</span>
                    <span className="font-bold text-navy">{application.personalDetails?.percentage_12 || "84.5"}%</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Stream</span>
                    <span className="font-bold text-navy">{application.personalDetails?.stream || "PCM"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Category</span>
                    <span className="font-bold text-navy">{application.personalDetails?.category || "General"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Consent given</span>
                    <span className="font-bold text-navy">Yes</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                {documents.map((doc) => {
                  const isApproved = doc.status === "approved";
                  const isRejected = doc.status === "rejected";

                  return (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#FF5A3C]/10 flex items-center justify-center text-accent shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <a
                            href={`/api/documents/download/${doc._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block font-semibold text-navy hover:text-[#3B6FE0] hover:underline transition"
                          >
                            {doc.name}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDocumentReview(doc._id, "approved")}
                          className={`w-8 h-8 border rounded flex items-center justify-center transition cursor-pointer ${
                            isApproved 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-gray-200 hover:border-green-500 text-green-500"
                          }`}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentReview(doc._id, "rejected")}
                          className={`w-8 h-8 border rounded flex items-center justify-center transition cursor-pointer ${
                            isRejected 
                              ? "bg-red-500 border-red-500 text-white" 
                              : "border-gray-200 hover:border-red-500 text-red-500"
                          }`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {documents.length === 0 && (
                  <p className="text-sm text-navySoft italic py-4 text-center">
                    No documents uploaded for this application.
                  </p>
                )}
              </div>

            </div>

            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center">
                <h2 className="text-lg font-bold text-navy mb-8 text-center">Update status</h2>

                <form onSubmit={handleSave} className="w-full space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Application status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none bg-white font-semibold text-navy focus:border-accent cursor-pointer"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under review</option>
                      <option value="verified">Verified</option>
                      <option value="admitted">Admitted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Remark
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks..."
                      className="w-full h-32 rounded-lg border border-gray-200 p-4 text-sm bg-white outline-none focus:border-accent resize-none transition"
                    />
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full max-w-xs py-3 rounded-lg bg-accent text-white hover:bg-accent-dark text-sm font-bold transition duration-200 disabled:opacity-60"
                    >
                      {saving ? "Saving Changes..." : "Save"}
                    </button>
                  </div>
                </form>

              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
