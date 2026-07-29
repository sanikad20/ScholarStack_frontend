import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/* =========================================================================
   ScholarStack — Upload Documents
   Wired to the real backend:
     - GET  /applications/:applicationId          -> application + course
     - GET  /documents/:applicationId              -> uploaded documents
     - POST /documents/upload (multipart)          -> upload a new document
   Checklist is derived from Course.requiredDocuments vs. what's uploaded —
   no fabricated document types.
   ========================================================================= */

// Matches the Document model's `type` enum exactly.
const DOCUMENT_TYPES = [
  { value: "marksheet", label: "Marksheet" },
  { value: "certificate", label: "Certificate" },
  { value: "idProof", label: "ID Proof" },
  { value: "photo", label: "Photo" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t.value, t.label]));

const STATUS_BADGE = {
  "under review": "bg-gray-100 text-gray-600",
  approved: "bg-accent text-white",
  rejected: "bg-red-50 text-red-600",
};

const STATUS_LABEL = {
  "under review": "Under Review",
  approved: "Verified",
  rejected: "Rejected",
};

export default function DocumentUpload() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const course = application?.courseId;
  const isDraft = application?.status === "draft";

  const loadData = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [appRes, docsRes] = await Promise.all([
        api.get(`/applications/${applicationId}`),
        api.get(`/documents/${applicationId}`),
      ]);
      setApplication(appRes?.data?.data || null);
      setDocuments(Array.isArray(docsRes?.data?.data) ? docsRes.data.data : []);
    } catch (err) {
      console.error("Failed to load documents page:", err);
      setLoadError(
        err?.response?.data?.message || "We couldn't load this application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectFile = (file) => {
    if (!file) return;
    setPendingFile(file);
    setDocName((prev) => prev || file.name.replace(/\.[^/.]+$/, ""));
    setUploadStatus(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!pendingFile) {
      fileInputRef.current?.click();
      return;
    }
    if (!docName.trim()) {
      setUploadStatus({ type: "error", message: "Please give this document a name." });
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("name", docName.trim());
      formData.append("type", docType);
      formData.append("applicationId", applicationId);

      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPendingFile(null);
      setDocName("");
      setDocType("other");
      setUploadStatus({ type: "success", message: "Document uploaded." });
      await loadData();
    } catch (err) {
      setUploadStatus({
        type: "error",
        message: err?.response?.data?.message || "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await api.post("/applications", { applicationId });
      navigate("/student/applications");
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: err?.response?.data?.message || "Couldn't submit your application. Please try again.",
      });
      setSubmitting(false);
    }
  };

  // Checklist: real required document types from the course vs. what's
  // actually been uploaded (any status counts as "done" — rejected items
  // still show as done since a file was submitted; the badge next to it in
  // the list communicates rejection separately).
  const requiredDocs = course?.requiredDocuments || [];
  const uploadedTypes = new Set(documents.map((d) => d.type));
  const checklist = requiredDocs.map((type) => ({
    type,
    label: TYPE_LABELS[type] || type,
    done: uploadedTypes.has(type),
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <StudentTopbar />
        <div className="flex flex-1">
          <StudentSidebar />
          <main className="flex-1 px-8 py-10">
            <div className="max-w-4xl animate-pulse space-y-4">
              <div className="h-6 w-1/2 bg-gray-100 rounded-lg" />
              <div className="h-40 w-full bg-gray-100 rounded-xl" />
              <div className="h-24 w-full bg-gray-100 rounded-xl" />
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <StudentTopbar />
        <div className="flex flex-1">
          <StudentSidebar />
          <main className="flex-1 px-8 py-10">
            <div className="max-w-4xl flex flex-col items-center text-center py-16 border border-black/10 rounded-2xl">
              <AlertTriangle size={22} className="text-red-500" />
              <p className="mt-3 text-sm font-semibold text-navy">{loadError}</p>
              <button onClick={loadData} className="mt-4 text-sm font-semibold text-accent hover:underline">
                Try again
              </button>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex gap-12">
            {/* LEFT */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-navy mb-1">Upload Documents</h2>
              <p className="text-sm text-navySoft mb-6">
                {course?.name}
                {application?.session && <> · {application.session} session</>}
              </p>

              {!isDraft && (
                <div className="mb-6 flex items-start gap-2 text-xs bg-gray-50 text-navySoft rounded-lg px-3 py-2.5">
                  <AlertTriangle size={14} className="flex-none mt-0.5" />
                  This application has already been submitted, so documents can no longer be
                  added or changed. You can still view what was uploaded below.
                </div>
              )}

              {isDraft && (
                <>
                  <p className="text-sm font-medium text-navy mb-3">Upload a new document</p>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${
                      dragOver ? "border-accent bg-accent/5" : "border-gray-300 bg-white"
                    }`}
                    style={{ minHeight: 160 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
                      <Upload size={20} className="text-blue" />
                    </div>
                    <p className="text-xs text-navySoft text-center leading-relaxed">
                      Drag a file here, or choose one below.
                      <br />
                      Supported formats: PDF, JPG, JPEG, PNG · Max 5MB
                    </p>
                    <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-medium text-navy cursor-pointer hover:bg-gray-50 transition bg-white">
                      <Upload size={14} className="text-accent" />
                      {pendingFile ? pendingFile.name : "Choose File"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => selectFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  {pendingFile && (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-navy mb-1.5">Document name</label>
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy mb-1.5">Type</label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors bg-white"
                        >
                          {DOCUMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
                      >
                        {uploading && <Loader2 size={14} className="animate-spin" />}
                        Upload
                      </button>
                    </div>
                  )}

                  {uploadStatus && (
                    <div
                      className={`mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2 max-w-md ${
                        uploadStatus.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {uploadStatus.type === "success" ? (
                        <CheckCircle2 size={14} className="flex-none mt-0.5" />
                      ) : (
                        <AlertTriangle size={14} className="flex-none mt-0.5" />
                      )}
                      <span>{uploadStatus.message}</span>
                    </div>
                  )}
                </>
              )}

              {/* Uploaded Documents */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-navy mb-4">Uploaded Documents</h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-navySoft">No documents uploaded yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between border border-black/10 rounded-xl px-5 py-4 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                            <FileText size={18} className="text-gold" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-navy block">{doc.name}</span>
                            <span className="text-xs text-navySoft">{TYPE_LABELS[doc.type] || doc.type}</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold rounded-full px-4 py-1.5 ${
                            STATUS_BADGE[doc.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABEL[doc.status] || doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isDraft && (
                <div className="mt-10">
                  {submitStatus && (
                    <div className="mb-4 flex items-start gap-2 text-xs rounded-lg px-3 py-2 max-w-md bg-red-50 text-red-600">
                      <AlertTriangle size={14} className="flex-none mt-0.5" />
                      <span>{submitStatus.message}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Submit Application
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — Checklist */}
            <div className="w-64 shrink-0">
              <h3 className="text-base font-semibold text-navy mb-4">Checklist</h3>
              {checklist.length === 0 ? (
                <p className="text-sm text-navySoft">No documents required for this course.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {checklist.map((item) => (
                    <div key={item.type} className="flex items-center gap-3">
                      {item.done ? (
                        <CheckSquare size={22} className="text-gold shrink-0" />
                      ) : (
                        <Square size={22} className="text-gold/40 shrink-0" />
                      )}
                      <span className="text-sm text-navy">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}