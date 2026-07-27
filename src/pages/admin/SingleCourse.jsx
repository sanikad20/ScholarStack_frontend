// src/pages/admin/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Eye,
  Plus,
  X,
  Users,
  FileText,
} from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import {
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/courses.api";

// ─── Options ─────────────────────────────────────────────
const FIELD_OPTIONS = [
  { value: "10thPercentage", label: "10th Percentage" },
  { value: "10thCGPA", label: "10th CGPA" },
  { value: "12thPercentage", label: "12th Percentage" },
  { value: "12thCGPA", label: "12th CGPA" },
  { value: "GraduationPercentage", label: "Graduation Percentage" },
  { value: "GraduationCGPA", label: "Graduation CGPA" },
  { value: "PostGraduationPercentage", label: "Post-Graduation Percentage" },
  { value: "PostGraduationCGPA", label: "Post-Graduation CGPA" },
  { value: "EntranceScore", label: "Entrance Exam Score" },
  { value: "__custom__", label: "✏️ Custom Field" },
];

const OPERATOR_OPTIONS = [
  { value: ">=", label: "≥ (Greater than or equal)" },
  { value: "<=", label: "≤ (Less than or equal)" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: "==", label: "==" },
];

const DOCUMENT_OPTIONS = [
  { value: "10thMarksheet", label: "10th Marksheet" },
  { value: "12thMarksheet", label: "12th Marksheet" },
  { value: "GraduationMarksheet", label: "Graduation Marksheet" },
  { value: "PostGraduationMarksheet", label: "Post-Graduation Marksheet" },
  { value: "EntranceScorecard", label: "Entrance Exam Scorecard" },
  { value: "MigrationCertificate", label: "Migration Certificate" },
  { value: "CasteCertificate", label: "Caste Certificate" },
  { value: "IncomeCertificate", label: "Income Certificate" },
  { value: "DomicileCertificate", label: "Domicile Certificate" },
  { value: "IdentityProof", label: "Identity Proof" },
  { value: "PassportPhoto", label: "Passport Photo" },
  { value: "Signature", label: "Signature" },
];

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_COURSE = {
  _id: "67a1b2c3d4e5f6a7b8c9d001",
  name: "B.Tech Computer Engineering",
  description: "Four year undergraduate program in Computer Engineering",
  session: "2026-27",
  admissionCapacity: 120,
  isActive: true,
  eligibilityCriteria: [
    { field: "12thPercentage", operator: ">=", value: 60 },
    { field: "12thMaths", operator: ">=", value: 50 },
  ],
  requiredDocuments: ["12thMarksheet", "IdentityProof", "PassportPhoto"],
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-02-20T14:30:00Z",
};

// ─── Utility: Normalize criteria from API ───────────────
const normalizeCriteria = (criteria) => {
  const fieldValues = FIELD_OPTIONS.map((opt) => opt.value);
  return criteria.map((cond) => {
    if (fieldValues.includes(cond.field)) {
      return { ...cond, customField: undefined };
    } else {
      // Treat as custom field
      return {
        ...cond,
        field: "__custom__",
        customField: cond.field,
      };
    }
  });
};

// ─── Main Component ────────────────────────────────────
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNewCourse = id === "new";

  // ─── State ──────────────────────────────────────────
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    session: "",
    admissionCapacity: 0,
    isActive: true,
    eligibilityCriteria: [],
    requiredDocuments: [],
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  // ─── Load Fallback ──────────────────────────────
  const loadFallbackData = () => {
    setCourse(FALLBACK_COURSE);
    setFormData({
      name: FALLBACK_COURSE.name,
      description: FALLBACK_COURSE.description || "",
      session: FALLBACK_COURSE.session || "",
      admissionCapacity: FALLBACK_COURSE.admissionCapacity || 0,
      isActive: FALLBACK_COURSE.isActive !== undefined ? FALLBACK_COURSE.isActive : true,
      eligibilityCriteria: normalizeCriteria(FALLBACK_COURSE.eligibilityCriteria || []),
      requiredDocuments: FALLBACK_COURSE.requiredDocuments || [],
    });
    setLoading(false);
    showToast("⚠️ Using fallback data (server offline)", "info");
  };

  // ─── Fetch Course ──────────────────────────────
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const { data } = await getCourseById(id);
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          const c = data.data;
          setCourse(c);
          setFormData({
            name: c.name,
            description: c.description || "",
            session: c.session || "",
            admissionCapacity: c.admissionCapacity || 0,
            isActive: c.isActive !== undefined ? c.isActive : true,
            eligibilityCriteria: normalizeCriteria(c.eligibilityCriteria || []),
            requiredDocuments: c.requiredDocuments || [],
          });
        } else {
          showToast("Failed to load course.", "error");
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

  // ─── Handle new vs edit ─────────────────────────
  useEffect(() => {
    if (isNewCourse) {
      setFormData({
        name: "",
        description: "",
        session: "",
        admissionCapacity: 0,
        isActive: true,
        eligibilityCriteria: [],
        requiredDocuments: [],
      });
      setLoading(false);
      setIsEditMode(true);
      return;
    }
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Form Handlers ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConditionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.eligibilityCriteria];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, eligibilityCriteria: updated };
    });
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: [
        ...prev.eligibilityCriteria,
        { field: "12thPercentage", operator: ">=", value: "" },
      ],
    }));
  };

  const removeCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentToggle = (docValue) => {
    setFormData((prev) => {
      const current = prev.requiredDocuments || [];
      if (current.includes(docValue)) {
        return { ...prev, requiredDocuments: current.filter((d) => d !== docValue) };
      } else {
        return { ...prev, requiredDocuments: [...current, docValue] };
      }
    });
  };

  // ─── Save ────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const processedCriteria = formData.eligibilityCriteria.map((cond) => {
        if (cond.field === "__custom__" && cond.customField) {
          return { ...cond, field: cond.customField, customField: undefined };
        }
        return { ...cond, customField: undefined };
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        session: formData.session,
        admissionCapacity: Number(formData.admissionCapacity),
        isActive: formData.isActive,
        eligibilityCriteria: processedCriteria,
        requiredDocuments: formData.requiredDocuments,
      };

      console.log('📤 Sending payload:', payload);

      let response;
      if (isNewCourse) {
        response = await createCourse(payload);
      } else {
        response = await updateCourse(id, payload);
      }

      const { data } = response;
      console.log('📥 Response:', data);

      if (data?.success) {
        const updated = data.data;
        setCourse(updated);

        // ✅ Preserve isActive from what we sent (frontend knows best)
        // and normalize criteria
        setFormData({
          name: updated.name,
          description: updated.description || "",
          session: updated.session || "",
          admissionCapacity: updated.admissionCapacity || 0,
          isActive: formData.isActive, // ✅ force to what we sent
          eligibilityCriteria: normalizeCriteria(updated.eligibilityCriteria || []),
          requiredDocuments: updated.requiredDocuments || [],
        });
        showToast(isNewCourse ? "Course created successfully!" : "Course updated successfully!", "success");
        setIsEditMode(false);
        if (isNewCourse) {
          navigate(`/admin/courses/${data.data._id}`);
        }
      } else {
        showToast(isNewCourse ? "Failed to create course." : "Failed to update course.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || (isNewCourse ? "Error creating course." : "Error updating course."), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCourse(id);
      showToast("Course deleted successfully.", "success");
      navigate("/admin/courses");
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting course.", "error");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render Helpers ──────────────────────────────────
  const renderEligibilityCriteria = () => {
    const criteria = formData.eligibilityCriteria || [];
    if (criteria.length === 0) {
      return <p className="text-sm text-navySoft italic">No eligibility criteria set.</p>;
    }
    return (
      <div className="space-y-3">
        {criteria.map((cond, idx) => {
          const isCustom = cond.field === "__custom__";
          return (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <select
                value={cond.field}
                onChange={(e) => {
                  const newField = e.target.value;
                  handleConditionChange(idx, "field", newField);
                  if (newField !== "__custom__") {
                    handleConditionChange(idx, "customField", "");
                  }
                }}
                disabled={!isEditMode}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {isCustom && (
                <input
                  type="text"
                  value={cond.customField || ""}
                  onChange={(e) =>
                    handleConditionChange(idx, "customField", e.target.value)
                  }
                  disabled={!isEditMode}
                  placeholder="Enter field name (e.g., 12thMaths)"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500 w-48"
                />
              )}
              <select
                value={cond.operator}
                onChange={(e) => handleConditionChange(idx, "operator", e.target.value)}
                disabled={!isEditMode}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                {OPERATOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={cond.value}
                onChange={(e) => handleConditionChange(idx, "value", e.target.value)}
                disabled={!isEditMode}
                placeholder="Value"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500 w-32"
              />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => removeCondition(idx)}
                  className="text-red-500 hover:text-red-700 ml-auto"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDocumentSelect = () => {
    const selected = formData.requiredDocuments || [];
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {DOCUMENT_OPTIONS.map((doc) => {
          const isSelected = selected.includes(doc.value);
          return (
            <button
              key={doc.value}
              type="button"
              onClick={() => isEditMode && handleDocumentToggle(doc.value)}
              disabled={!isEditMode}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${isSelected
                ? "bg-accent text-white"
                : "bg-gray-100 text-navySoft hover:bg-gray-200"
                } ${!isEditMode ? "cursor-default" : ""}`}
            >
              {doc.label}
            </button>
          );
        })}
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
            <span className="font-semibold text-navySoft">Loading course...</span>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isNewCourse && !course) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-2 text-accent font-semibold mb-6"
            >
              <ArrowLeft size={16} /> Back to Courses
            </Link>
            <div className="p-8 text-center border border-dashed rounded-xl text-navySoft font-semibold">
              Course not found.
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const lastModified = course?.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Never";

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
                to="/admin/courses"
                className="text-sm font-bold text-accent hover:text-accent-dark transition flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-navy">
                {isNewCourse ? "Create New Course" : course.name}
              </h1>
              {!isNewCourse && (
                <>
                  <span className="text-sm text-navySoft">
                    {course.session} · {course.admissionCapacity || 0} seats
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${course.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isNewCourse && !isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
                >
                  <Edit size={16} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    <Eye size={16} />
                    Cancel
                  </button>
                  {!isNewCourse && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : isNewCourse ? "Create Course" : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ─── Form ────────────────────────────────── */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    rows="3"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Session
                  </label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    placeholder="e.g., 2026-27"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Admission Capacity
                  </label>
                  <input
                    type="number"
                    name="admissionCapacity"
                    value={formData.admissionCapacity}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        isEditMode &&
                        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                      }
                      disabled={!isEditMode}
                      className={`relative w-12 h-6 rounded-full transition ${formData.isActive ? "bg-accent" : "bg-gray-300"
                        } ${!isEditMode ? "opacity-60 cursor-default" : ""}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? "translate-x-6" : ""
                          }`}
                      />
                    </button>
                    <span className="text-sm text-navySoft">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Required Documents
                  </label>
                  {renderDocumentSelect()}
                </div>
              </div>
            </div>

            {/* ─── Eligibility Criteria (Full Width) ── */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="block text-sm font-semibold text-navy mb-2">
                Eligibility Criteria
              </label>
              {renderEligibilityCriteria()}
              {isEditMode && (
                <button
                  type="button"
                  onClick={addCondition}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  <Plus size={16} />
                  Add Condition
                </button>
              )}
            </div>
          </div>

          {/* ─── Quick Action Cards ────────────────────── */}
          {!isNewCourse && course && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to={`/admin/applications?courseId=${course._id}`}
                className="p-5 border border-gray-200 rounded-xl hover:border-accent hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">View Applications</h3>
                      <p className="text-xs text-navySoft">
                        0 applications for this course
                      </p>
                    </div>
                  </div>
                  <span className="text-accent group-hover:translate-x-1 transition">→</span>
                </div>
              </Link>

              <Link
                to={`/admin/forms/new?courseId=${course._id}`}
                className="p-5 border border-gray-200 rounded-xl hover:border-accent hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">Manage Form Template</h3>
                      <p className="text-xs text-navySoft">
                        Last modified: {lastModified}
                      </p>
                    </div>
                  </div>
                  <span className="text-accent group-hover:translate-x-1 transition">→</span>
                </div>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* ─── Delete Confirmation Modal ────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to permanently delete this course?
            <br />
            <span className="font-semibold text-red-600">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
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