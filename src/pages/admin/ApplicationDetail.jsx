import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, FileText, Settings, Award } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

const STATUS_TRANSITIONS = {
  submitted: ["under_review", "rejected"],
  under_review: ["verified", "rejected"],
  verified: ["admitted", "rejected"],
  admitted: [],
  rejected: [],
  draft: ["submitted"],
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const appRes = await api.get(`/applications/${id}`);
      if (appRes.data?.success && appRes.data?.data) {
        setApplication(appRes.data.data);
        setRemarks(appRes.data.data.remarks || "");
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

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    setError("");
    try {
      const { data } = await api.put(`/applications/admin/${id}`, {
        status: nextStatus,
        remarks,
      });
      if (data?.success) {
        setApplication(data.data);
        alert(`Application moved to: ${nextStatus.toUpperCase()}`);
      } else {
        setError("Failed to update status.");
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "Error updating application status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentReview = async (docId, docStatus) => {
    try {
      const docRemarks = prompt(`Enter optional remarks for document ${docStatus.toUpperCase()}:`, "");
      if (docRemarks === null) return;

      const { data } = await api.put(`/documents/${docId}/status`, {
        status: docStatus,
        remarks: docRemarks,
      });

      if (data?.success) {
        alert("Document status updated successfully!");
        const docRes = await api.get(`/documents/${id}`);
        if (docRes.data?.success) setDocuments(docRes.data.data);
      }
    } catch (err) {
      alert("Error updating document status.");
    }
  };

  const handleAutoClassify = async () => {
    setClassifying(true);
    setError("");
    try {
      const { data } = await api.post(`/classifications/${id}/classify`);
      if (data?.success) {
        alert(`Classification Complete! Category: ${data.data?.category ?? "Classified"}`);
        const appRes = await api.get(`/applications/${id}`);
        if (appRes.data?.success) setApplication(appRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "Error running classification rules.");
    } finally {
      setClassifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading application details...</span>
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

  const allowedTransitions = STATUS_TRANSITIONS[application.status] || [];

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
            Back to Applications list
          </Link>

          {error && (
            <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-8">
            <div>
              <span className="text-xs font-bold text-navySoft uppercase tracking-wider">
                Application details
              </span>
              <h1 className="text-3xl font-bold text-navy mt-1">
                Candidate: {application.applicantId?.name || "Unknown"}
              </h1>
              <p className="text-sm text-navySoft mt-1">
                Course: <span className="font-semibold text-navy">{application.courseId?.name || "—"}</span> | Session:{" "}
                <span className="font-semibold text-navy">{application.courseId?.session || "—"}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-navySoft">Current Status:</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent px-3 py-1.5 rounded-full">
                {application.status}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-2">
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-navySoft uppercase">Full Name</span>
                    <span className="font-medium text-navy mt-1 block">
                      {application.applicantId?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-navySoft uppercase">Email</span>
                    <span className="font-medium text-navy mt-1 block">
                      {application.applicantId?.email || "—"}
                    </span>
                  </div>
                  {Object.entries(application.personalDetails || {}).map(([key, val]) => (
                    <div key={key}>
                      <span className="block text-xs font-semibold text-navySoft uppercase">{key}</span>
                      <span className="font-medium text-navy mt-1 block">
                        {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-2">
                  Uploaded Documents
                </h2>
                {documents.length === 0 ? (
                  <p className="text-sm text-navySoft italic">No documents uploaded for this application yet.</p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-navy">{doc.name}</span>
                            <a
                              href={`/api/documents/download/${doc._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[#3B6FE0] hover:underline font-semibold"
                            >
                              Download/View File
                            </a>
                            {doc.remarks && (
                              <span className="block text-xs text-red-500 mt-0.5">Remarks: {doc.remarks}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                            doc.status === "approved" ? "bg-green-100 text-green-700" :
                            doc.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {doc.status}
                          </span>
                          <button
                            onClick={() => handleDocumentReview(doc._id, "approved")}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve Document"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDocumentReview(doc._id, "rejected")}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject Document"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-gray-50/50">
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4">
                  Admissions Status Workflow
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2">Remarks / Notes</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add reviewer notes or rejection reasons here..."
                      className="w-full h-24 rounded-lg border border-gray-200 p-3 text-sm bg-white outline-none focus:border-accent resize-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-navySoft">Select Next Stage:</span>
                    {allowedTransitions.map((next) => (
                      <button
                        key={next}
                        onClick={() => handleStatusUpdate(next)}
                        disabled={updating}
                        className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition duration-200 ${
                          next === "rejected" ? "bg-red-500 hover:bg-red-600" : "bg-[#3B6FE0] hover:bg-[#2B5AC0]"
                        }`}
                      >
                        Move to {next.replace("_", " ").toUpperCase()}
                      </button>
                    ))}

                    {allowedTransitions.length === 0 && (
                      <p className="text-xs text-navySoft italic">
                        No further transitions allowed from current status ({application.status}).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-[#FFF3EA]">
                <div className="flex items-center gap-2 text-accent font-bold mb-3">
                  <Award size={18} />
                  <h3 className="text-sm uppercase tracking-wider">Classification Engine</h3>
                </div>
                <p className="text-xs text-navySoft leading-relaxed mb-4">
                  Auto-evaluates applicant's details and test scores against institution criteria mapping.
                </p>

                {application.classification && Object.keys(application.classification).length > 0 ? (
                  <div className="mb-4 bg-white/80 p-3 rounded-lg border border-accent/10">
                    <span className="block text-[10px] uppercase font-bold text-navySoft">Resulting Category</span>
                    <span className="text-lg font-bold text-accent">
                      {application.classification.category || "Evaluated"}
                    </span>
                    {application.classification.ruleMatched && (
                      <span className="block text-xs text-navySoft mt-1">
                        Rule: {application.classification.ruleMatched}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-navySoft italic mb-4">Not yet classified.</p>
                )}

                <button
                  onClick={handleAutoClassify}
                  disabled={classifying || application.status === "draft"}
                  className="w-full py-2.5 rounded-lg bg-accent text-white hover:bg-accent-dark text-sm font-bold transition duration-200 disabled:opacity-50"
                >
                  {classifying ? "Running Engine..." : "Run Auto-Classification"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
