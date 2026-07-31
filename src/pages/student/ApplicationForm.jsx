import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Sparkles, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/**
 * Student Course Application Form
 * Designed & Developed by Sanika
 * 
 * Features:
 * - Comprehensive student application workflow supporting draft saving and progress continuation.
 * - Smart AI Auto-Fill Feature: Allows students to upload marksheets/IDs to automatically extract
 *   and populate applicant details (name, DOB, stream, percentage) using AI document parsing.
 */

const FORM_KEYS = ["firstName", "lastName", "stream", "dob", "percentage", "category"];
const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  stream: "",
  dob: "",
  percentage: "",
  category: "general",
  confirmEligibility: false,
  confirmConsent: false,
};

// Fields the AI extraction endpoint may return, mapped straight onto the
// form state below. Keep in sync with GENERIC_FIELDS in the backend's
// aiExtractionService.js if you add/rename fields.
const AUTOFILLABLE_KEYS = ["firstName", "lastName", "dob", "stream", "percentage", "category"];

export default function ApplicationForm() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false); // "draft" | "continue" | false
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message }

  // Autofill-from-document state
  const [autofillFile, setAutofillFile] = useState(null);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillStatus, setAutofillStatus] = useState(null);

  // ---- Load course + any existing draft for it -----------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [courseRes, myAppsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get("/applications/my"),
      ]);

      const courseData = courseRes?.data?.data;
      if (!courseData) throw new Error("Course not found");
      setCourse(courseData);

      const myApps = myAppsRes?.data?.data;
      const existingDraft = Array.isArray(myApps)
        ? myApps.find((a) => {
            const appCourseId = a.courseId?._id || a.courseId;
            return String(appCourseId) === String(courseId) && a.status === "draft";
          })
        : null;

      if (existingDraft) {
        setApplicationId(existingDraft._id);
        setForm((f) => ({
          ...DEFAULT_FORM,
          ...f,
          ...(existingDraft.personalDetails || {}),
        }));
      }
    } catch (err) {
      console.error("Failed to load application form data:", err);
      setLoadError(
        err?.response?.data?.message || "We couldn't load this course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Ensures a draft application exists, creating one if this is the first
  // save. Returns the applicationId or throws.
  const ensureDraft = async () => {
    if (applicationId) return applicationId;
    const res = await api.post("/applications/draft", { courseId, session: course?.session });
    const created = res?.data?.data;
    if (!created?._id) throw new Error("Could not create application draft");
    setApplicationId(created._id);
    return created._id;
  };

  const persistDraft = async () => {
    const appId = await ensureDraft();
    await api.put(`/applications/${appId}/draft`, {
      personalDetails: form,
      session: course?.session,
    });
    return appId;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setSaving("draft");
    setSaveStatus(null);
    try {
      await persistDraft();
      setSaveStatus({ type: "success", message: "Draft saved." });
    } catch (err) {
      setSaveStatus({
        type: "error",
        message: err?.response?.data?.message || "Couldn't save your draft. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setSaveStatus(null);

    // Validate required personal details fields
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSaveStatus({
        type: "error",
        message: "Please enter your full name (first and last name) before continuing.",
      });
      return;
    }
    if (!form.stream.trim()) {
      setSaveStatus({
        type: "error",
        message: "Please enter your stream before continuing.",
      });
      return;
    }
    if (!form.dob.trim()) {
      setSaveStatus({
        type: "error",
        message: "Please enter your date of birth (DOB) before continuing.",
      });
      return;
    }
    if (!form.percentage.trim()) {
      setSaveStatus({
        type: "error",
        message: "Please enter your 12th percentage before continuing.",
      });
      return;
    }
    if (!form.confirmEligibility || !form.confirmConsent) {
      setSaveStatus({
        type: "error",
        message: "Please read and check both confirmation checkboxes below before continuing.",
      });
      return;
    }

    setSaving("continue");
    try {
      const appId = await persistDraft();
      navigate(`/student/documents/${appId}`);
    } catch (err) {
      setSaveStatus({
        type: "error",
        message: err?.response?.data?.message || "Couldn't save your progress. Please try again.",
      });
      setSaving(false);
    }
  };

  // ---- Autofill from document ------------------------------------------
  const handleAutofillFileSelect = (e) => {
    const file = e.target.files?.[0] || null;
    setAutofillFile(file);
    setAutofillStatus(null);
  };

  const handleAutofill = async () => {
    if (!autofillFile) {
      fileInputRef.current?.click();
      return;
    }

    setAutofilling(true);
    setAutofillStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", autofillFile);
      formData.append("courseId", courseId ?? "");

      const res = await api.post("/documents/autofill", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extracted = res?.data?.data?.extractedFields || {};
      const filledKeys = Object.keys(extracted).filter((k) => AUTOFILLABLE_KEYS.includes(k));

      if (filledKeys.length === 0) {
        setAutofillStatus({
          type: "error",
          message: "No matching fields could be extracted from this document. Please fill the form manually.",
        });
        return;
      }

      setForm((f) => {
        const next = { ...f };
        filledKeys.forEach((key) => {
          next[key] = String(extracted[key]);
        });
        return next;
      });

      setAutofillStatus({
        type: "success",
        message: "Fields auto-filled from your document. Please review them before submitting.",
        filledKeys,
      });
    } catch (err) {
      setAutofillStatus({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Couldn't extract data from that document. Please try another file or fill the form manually.",
      });
    } finally {
      setAutofilling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          {loading ? (
            <div className="max-w-3xl animate-pulse space-y-4">
              <div className="h-6 w-2/3 bg-gray-100 rounded-lg" />
              <div className="h-24 w-full bg-gray-100 rounded-2xl" />
              <div className="h-40 w-full bg-gray-100 rounded-xl" />
            </div>
          ) : loadError ? (
            <div className="max-w-3xl flex flex-col items-center text-center py-16 border border-black/10 rounded-2xl">
              <AlertTriangle size={22} className="text-red-500" />
              <p className="mt-3 text-sm font-semibold text-navy">{loadError}</p>
              <button
                onClick={loadData}
                className="mt-4 text-sm font-semibold text-accent hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-navy">
                Apply — {course?.name}
                {course?.session && <> · {course.session} session</>}
              </h1>

              {/* Autofill from document */}
              <div className="mt-6 max-w-3xl border border-accent/20 bg-accent/[0.04] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-none">
                    <Sparkles size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy">Autofill from a document</p>
                    <p className="mt-0.5 text-xs text-navySoft">
                      Upload your marksheet or ID and we'll try to fill in the fields below
                      automatically. You can still review and edit everything before submitting.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleAutofillFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 border border-black/10 rounded-full px-4 py-2 text-xs font-semibold text-navy hover:bg-white transition-colors bg-white"
                      >
                        <Upload size={13} />
                        {autofillFile ? autofillFile.name : "Choose file"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAutofill}
                        disabled={!autofillFile || autofilling}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs px-4 py-2 rounded-full transition-colors"
                      >
                        {autofilling ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} /> Autofill
                          </>
                        )}
                      </button>
                    </div>

                    {autofillStatus && (
                      <div
                        className={`mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                          autofillStatus.type === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {autofillStatus.type === "success" ? (
                          <CheckCircle2 size={14} className="flex-none mt-0.5" />
                        ) : (
                          <AlertTriangle size={14} className="flex-none mt-0.5" />
                        )}
                        <span>{autofillStatus.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form className="mt-8 max-w-3xl">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-navy mb-2">Full name</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-navy mb-2">Stream</label>
                  <input
                    type="text"
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    placeholder="e.g. Science (PCM)"
                    className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">DOB</label>
                    <input
                      type="text"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">12th percentage</label>
                    <input
                      type="text"
                      name="percentage"
                      value={form.percentage}
                      onChange={handleChange}
                      placeholder="eg. 85.6"
                      className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="mb-7">
                  <label className="block text-sm font-medium text-navy mb-3">Category</label>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { value: "general", label: "General" },
                      { value: "obc", label: "OBC" },
                      { value: "sc_st", label: "SC/ST" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2.5 text-sm text-navy">
                        <input
                          type="radio"
                          name="category"
                          value={opt.value}
                          checked={form.category === opt.value}
                          onChange={handleChange}
                          className="w-4 h-4 accent-accent"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-10">
                  <label className="block text-sm font-medium text-navy mb-3">Confirm the following</label>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 text-sm text-navySoft">
                      <input
                        type="checkbox"
                        name="confirmEligibility"
                        checked={form.confirmEligibility}
                        onChange={handleChange}
                        className="w-4 h-4 rounded accent-accent"
                      />
                      I have read the eligibility criteria for this course
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-navySoft">
                      <input
                        type="checkbox"
                        name="confirmConsent"
                        checked={form.confirmConsent}
                        onChange={handleChange}
                        className="w-4 h-4 rounded accent-accent"
                      />
                      I consent to my documents being verified by the institution
                    </label>
                  </div>
                </div>

                {saveStatus && (
                  <div
                    className={`mb-6 flex items-start gap-2 text-xs rounded-lg px-3 py-2 max-w-md ${
                      saveStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {saveStatus.type === "success" ? (
                      <CheckCircle2 size={14} className="flex-none mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="flex-none mt-0.5" />
                    )}
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!!saving}
                    className="inline-flex items-center gap-1.5 border border-accent text-accent font-semibold text-sm px-6 py-3 rounded-full hover:bg-accent/5 disabled:opacity-50 transition-colors"
                  >
                    {saving === "draft" && <Loader2 size={14} className="animate-spin" />}
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!!saving}
                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    {saving === "continue" && <Loader2 size={14} className="animate-spin" />}
                    Continue To Documents
                  </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}