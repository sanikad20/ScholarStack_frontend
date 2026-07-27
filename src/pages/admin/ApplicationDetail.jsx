// src/pages/admin/ApplicationDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  Clock,
  User,
  Eye,
  RefreshCw,
  ChevronRight,
  Trash2,
  RotateCw,
} from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import {
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationTimeline,
  getWorkflowStatuses,
} from "../../api/applications.api";
import { getDocuments, updateDocumentStatus } from "../../api/documents.api";
import { classifySingleApplication } from "../../api/classifications.api";

// ─── Fallback Data ─────────────────────────────────────
const FALLBACK_APPLICATION = {
  _id: "67a1b2c3d4e5f6a7b8c9d0e1",
  applicantId: {
    name: "Dhriti Sharma",
    email: "dhriti@student.vjti.edu.in",
  },
  courseId: { name: "B.Tech Computer Engineering" },
  personalDetails: {
    fullName: "Dhriti Sharma",
    date_of_birth: "2005-03-14",
    phone: "+91 98765 43210",
    percentage_12: 92.5,
    stream: "PCM",
    category: "General",
    consent: true,
  },
  status: "under_review",
  submittedAt: "2026-07-01T10:30:00Z",
  remarks: "",
  classification: {
    eligible: true,
    meritLevel: "High Merit",
    category: "General",
    isReserved: false,
    reasons: "",
    score: 92.5,
  },
  createdAt: "2026-07-01T10:30:00Z",
};

const FALLBACK_DOCUMENTS = [
  {
    _id: "doc1",
    name: "12th Marksheet",
    type: "marksheet",
    status: "approved",
    fileUrl: "/uploads/documents/dhriti-marksheet.pdf",
    createdAt: "2026-07-01T10:35:00Z",
  },
  {
    _id: "doc2",
    name: "Aadhar Card",
    type: "idProof",
    status: "pending",
    fileUrl: "/uploads/documents/dhriti-id.pdf",
    createdAt: "2026-07-01T10:40:00Z",
  },
];

const FALLBACK_TIMELINE = [
  {
    fromStatus: "draft",
    toStatus: "submitted",
    changedBy: { name: "Dhriti Sharma" },
    changedAt: "2026-07-01T10:30:00Z",
    remarks: "Application submitted by student",
  },
  {
    fromStatus: "submitted",
    toStatus: "under_review",
    changedBy: { name: "Aashu Goswami" },
    changedAt: "2026-07-02T09:15:00Z",
    remarks: "Application moved to review stage",
  },
];

// ─── Status Helpers ─────────────────────────────────────
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

const CLASSIFICATION_COLORS = {
  eligible: "bg-green-100 text-green-700",
  notEligible: "bg-red-100 text-red-700",
  highMerit: "bg-emerald-100 text-emerald-700",
  mediumMerit: "bg-yellow-100 text-yellow-700",
  lowMerit: "bg-gray-100 text-gray-600",
  reserved: "bg-purple-100 text-purple-700",
  general: "bg-blue-100 text-blue-700",
};

const DOC_STATUS_COLORS = {
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

// ─── Main Component ────────────────────────────────────
export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [workflowFlow, setWorkflowFlow] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Confirmation Modal State ──────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'classify' | 'delete'
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadFallbackData = () => {
    setApplication(FALLBACK_APPLICATION);
    setDocuments(FALLBACK_DOCUMENTS);
    setTimeline(FALLBACK_TIMELINE);
    setStatus(FALLBACK_APPLICATION.status || "submitted");
    setRemarks(FALLBACK_APPLICATION.remarks || "");
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  // ─── Fetch Data ─────────────────────────────────────
  const fetchData = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const [appRes, docRes, timelineRes, workflowRes] = await Promise.all([
          getApplicationById(id),
          getDocuments(id),
          getApplicationTimeline(id),
          getWorkflowStatuses(),
        ]);

        clearTimeout(timeoutId);

        if (appRes.data?.success && appRes.data?.data) {
          const appData = appRes.data.data;
          setApplication(appData);
          setStatus(appData.status || "");
          setRemarks(appData.remarks || "");
        }

        if (docRes.data?.success && docRes.data?.data) {
          setDocuments(docRes.data.data);
        }

        if (timelineRes.data?.success && timelineRes.data?.data) {
          setTimeline(timelineRes.data.data);
        }

        if (workflowRes.data?.success && workflowRes.data?.data) {
          setWorkflowFlow(workflowRes.data.data.flow || []);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback data", err);
        loadFallbackData();
        return;
      }
    } catch (err) {
      showToast("Failed to fetch application details.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
      if (showRefreshToast) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Status Update ──────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateApplicationStatus(id, { status, remarks });
      if (res.data?.success) {
        setApplication(res.data.data);
        showToast("Application status updated successfully!", "success");
        fetchData(); // Refresh to update timeline
      } else {
        showToast("Failed to update status.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? "Error updating status.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Classify ────────────────────────────────────────
  const openClassifyConfirm = () => {
    setPendingAction("classify");
    setShowConfirmModal(true);
  };

  // ─── Delete ──────────────────────────────────────────
  const openDeleteConfirm = () => {
    setPendingAction("delete");
    setShowConfirmModal(true);
  };

  // ─── Confirm Action ──────────────────────────────────
  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (pendingAction === "classify") {
        const res = await classifySingleApplication(id);
        if (res.data?.success) {
          const appRes = await getApplicationById(id);
          if (appRes.data?.success) setApplication(appRes.data.data);
          showToast("Application classified successfully!", "success");
        } else {
          showToast("Failed to classify application.", "error");
        }
      } else if (pendingAction === "delete") {
        await deleteApplication(id);
        showToast("Application deleted successfully.", "success");
        navigate("/admin/applications");
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? "An error occurred.", "error");
    } finally {
      setShowConfirmModal(false);
      setPendingAction(null);
      setIsProcessing(false);
    }
  };

  // ─── Document Actions ──────────────────────────────
  const handleDocumentReview = async (docId, docStatus) => {
    try {
      const res = await updateDocumentStatus(docId, {
        status: docStatus,
        remarks: docStatus === "rejected" ? "Document rejected" : "Document approved",
      });
      if (res.data?.success) {
        const docRes = await getDocuments(id);
        if (docRes.data?.success) setDocuments(docRes.data.data);
        showToast(`Document ${docStatus} successfully!`, "success");
        setSelectedDoc(null);
        setIsDocModalOpen(false);
      }
    } catch (err) {
      showToast("Error updating document status.", "error");
    }
  };

  // ─── Render Helpers ──────────────────────────────────
  const renderClassification = () => {
    const cls = application.classification || {};
    if (!cls.eligible && !cls.meritLevel) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-navySoft">Not classified yet</span>
            <button
              onClick={openClassifyConfirm}
              disabled={classifying}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark transition disabled:opacity-60"
            >
              <RefreshCw size={14} className={classifying ? "animate-spin" : ""} />
              {classifying ? "Classifying..." : "Run Classification"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-navySoft uppercase tracking-wider">Classification</h3>
        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls.eligible ? CLASSIFICATION_COLORS.eligible : CLASSIFICATION_COLORS.notEligible
              }`}
          >
            {cls.eligible ? "Eligible" : "Not Eligible"}
          </span>
          {cls.meritLevel && (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls.meritLevel === "High Merit"
                  ? CLASSIFICATION_COLORS.highMerit
                  : cls.meritLevel === "Medium Merit"
                    ? CLASSIFICATION_COLORS.mediumMerit
                    : CLASSIFICATION_COLORS.lowMerit
                }`}
            >
              {cls.meritLevel}
            </span>
          )}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls.isReserved ? CLASSIFICATION_COLORS.reserved : CLASSIFICATION_COLORS.general
              }`}
          >
            {cls.isReserved ? "Reserved" : "General"}
          </span>
        </div>
        {!cls.eligible && cls.reasons && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {cls.reasons}
          </p>
        )}
      </div>
    );
  };

  const renderWorkflowSteps = () => {
    if (!workflowFlow.length) return null;
    const currentIndex = workflowFlow.findIndex(
      (step) => step.from === application.status || step.to === application.status
    );
    const steps = workflowFlow.map((step, index) => ({
      label: STATUS_LABELS[step.from] || step.from,
      status: index <= currentIndex ? "completed" : "upcoming",
    }));
    const uniqueSteps = [];
    const seen = new Set();
    steps.forEach((step) => {
      if (!seen.has(step.label)) {
        seen.add(step.label);
        uniqueSteps.push(step);
      }
    });
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xs font-semibold text-navySoft uppercase tracking-wider mb-3">
          Application Workflow
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {uniqueSteps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full transition ${step.status === "completed"
                    ? "bg-accent text-white"
                    : "bg-gray-200 text-gray-500"
                  }`}
              >
                {step.label}
              </span>
              {idx < uniqueSteps.length - 1 && (
                <ChevronRight size={16} className="text-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    if (!timeline.length)
      return <p className="text-sm text-navySoft italic">No activity yet.</p>;
    return (
      <div className="space-y-3 mt-2 max-h-64 overflow-y-auto pr-2">
        {timeline.map((entry, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy">
                  {STATUS_LABELS[entry.fromStatus] || entry.fromStatus}
                </span>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="font-semibold text-navy">
                  {STATUS_LABELS[entry.toStatus] || entry.toStatus}
                </span>
                <span className="text-xs text-navySoft ml-auto">
                  {new Date(entry.changedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-navySoft">
                <span>by {entry.changedBy?.name || "System"}</span>
                {entry.remarks && <span>· {entry.remarks}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Loading & Error ──────────────────────────────────
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
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-2 text-accent font-semibold mb-6"
            >
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
  const submissionDate = application.submittedAt
    ? new Date(application.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Not submitted";

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          {/* ─── Header ────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/applications"
                className="text-sm font-bold text-accent hover:text-accent-dark transition flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-navy">
                Application #{appNumber}
              </h1>
              <span className="text-sm text-navySoft">
                {application.applicantId?.name} · {application.courseId?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 text-gray-600 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-60"
              >
                <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={openClassifyConfirm}
                disabled={classifying}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500 text-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-50 transition disabled:opacity-60"
              >
                <RefreshCw size={14} className={classifying ? "animate-spin" : ""} />
                {classifying ? "Classifying..." : "Classify"}
              </button>
              <button
                onClick={openDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

          <p className="text-sm text-navySoft mt-1">Submitted {submissionDate}</p>

          {/* ─── Workflow Steps ────────────────────────── */}
          {renderWorkflowSteps()}

          {/* ─── Main Grid ────────────────────────────── */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* ─── LEFT COLUMN ────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Student Profile */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                  <User size={18} className="text-accent" />
                  Student Profile
                </h2>
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
                        ? new Date(
                          application.personalDetails.date_of_birth
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Phone</span>
                    <span className="font-bold text-navy">{application.personalDetails?.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">12th percentage</span>
                    <span className="font-bold text-navy">{application.personalDetails?.percentage_12 || "—"}%</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Stream</span>
                    <span className="font-bold text-navy">{application.personalDetails?.stream || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Category</span>
                    <span className="font-bold text-navy">{application.personalDetails?.category || "General"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 mb-1">Consent given</span>
                    <span className="font-bold text-navy">
                      {application.personalDetails?.consent ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {renderClassification()}
              </div>

              {/* Documents */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-accent" />
                  Documents
                </h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setIsDocModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                          <FileText size={16} />
                        </div>
                        <div>
                          <span className="block font-semibold text-navy text-sm">{doc.name}</span>
                          <span className="text-xs text-navySoft">{doc.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DOC_STATUS_COLORS[doc.status] || "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {doc.status}
                        </span>
                        <Eye size={16} className="text-gray-400 hover:text-accent" />
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-navySoft italic py-4 text-center">
                      No documents uploaded.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN ────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Update */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-6 text-center">Update Status</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Application Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none bg-white font-semibold text-navy focus:border-accent cursor-pointer"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                      <option value="admitted">Admitted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks..."
                      className="w-full h-24 rounded-lg border border-gray-200 p-4 text-sm bg-white outline-none focus:border-accent resize-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-lg bg-accent text-white hover:bg-accent-dark text-sm font-bold transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Audit Timeline */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-accent" />
                  Activity Log
                </h2>
                {renderTimeline()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Document Modal ───────────────────────────── */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false);
          setSelectedDoc(null);
        }}
        title={selectedDoc?.name || "Document"}
      >
        {selectedDoc && (
          <>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-navySoft">Type</span>
                <span className="font-medium">{selectedDoc.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-navySoft">Status</span>
                <span
                  className={`font-semibold ${selectedDoc.status === "approved"
                      ? "text-green-600"
                      : selectedDoc.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                >
                  {selectedDoc.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-navySoft">Uploaded</span>
                <span className="font-medium">
                  {new Date(selectedDoc.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="pt-2">
                <a
                  href={selectedDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent hover:underline text-sm font-semibold"
                >
                  <Eye size={16} />
                  View Document ↗
                </a>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDocumentReview(selectedDoc._id, "approved")}
                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleDocumentReview(selectedDoc._id, "rejected")}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ─── Confirmation Modal ───────────────────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        title={pendingAction === "classify" ? "Run Classification" : "Delete Application"}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            {pendingAction === "classify"
              ? "Run classification on this application? This will overwrite any existing classification."
              : "Are you sure you want to delete this application? This action cannot be undone."}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setPendingAction(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition ${pendingAction === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-accent hover:bg-accent-dark"
                } disabled:opacity-60`}
            >
              {isProcessing ? "Processing..." : "Confirm"}
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