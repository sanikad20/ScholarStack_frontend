// src/pages/admin/ClassificationRules.jsx
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { getCourses } from "../../api/courses.api";
import {
  getClassificationRules,
  updateClassificationRules,
} from "../../api/classifications.api";

// ─── Constants ─────────────────────────────────────────
const FIELD_OPTIONS = [
  { value: "10thPercentage", label: "10th Percentage" },
  { value: "10thMaths", label: "10th Maths Marks" },
  { value: "10thScience", label: "10th Science Marks" },
  { value: "12thPercentage", label: "12th Percentage" },
  { value: "12thMaths", label: "12th Maths Marks" },
  { value: "12thPhysics", label: "12th Physics Marks" },
  { value: "12thChemistry", label: "12th Chemistry Marks" },
  { value: "12thBiology", label: "12th Biology Marks" },
  { value: "GraduationPercentage", label: "Graduation Percentage" },
  { value: "GraduationCGPA", label: "Graduation CGPA" },
  { value: "PostGraduationPercentage", label: "Post-Graduation Percentage" },
  { value: "PostGraduationCGPA", label: "Post-Graduation CGPA" },
  { value: "EntranceScore", label: "Entrance Exam Score" },
  { value: "__custom__", label: "Custom Field" },
];

const OPERATOR_OPTIONS = [
  { value: ">=", label: "≥ (Greater than or equal)" },
  { value: "<=", label: "≤ (Less than or equal)" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: "==", label: "==" },
];

const DEFAULT_RULES = {
  highMeritThreshold: 85,
  mediumMeritThreshold: 60,
  reservedCategories: ["SC", "ST", "OBC", "EWS"],
  eligibilityMinMarks: 50,
  courseSpecificRules: {},
};

// ─── Main Component ────────────────────────────────────
export default function ClassificationRules() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [toast, setToast] = useState(null);

  // ─── Modal states ──────────────────────────────────
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRemoveOverrideModal, setShowRemoveOverrideModal] = useState(false);
  const [removeOverrideCourseId, setRemoveOverrideCourseId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Fetch Data ─────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, coursesRes] = await Promise.all([
        getClassificationRules(),
        getCourses(),
      ]);

      if (rulesRes.data?.success && rulesRes.data?.data) {
        setRules(rulesRes.data.data);
      } else {
        showToast("Failed to load rules.", "error");
      }

      if (coursesRes.data?.success && coursesRes.data?.data) {
        setCourses(coursesRes.data.data);
        if (coursesRes.data.data.length > 0) {
          setSelectedCourseId(coursesRes.data.data[0]._id);
        }
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Global Rule Handlers ───────────────────────────
  const handleGlobalChange = (key, value) => {
    setRules((prev) => ({ ...prev, [key]: value }));
  };

  const handleReservedCategoryAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newCat = e.target.value.trim().toUpperCase();
      if (!rules.reservedCategories.includes(newCat)) {
        setRules((prev) => ({
          ...prev,
          reservedCategories: [...prev.reservedCategories, newCat],
        }));
      }
      e.target.value = "";
    }
  };

  const handleReservedCategoryRemove = (cat) => {
    setRules((prev) => ({
      ...prev,
      reservedCategories: prev.reservedCategories.filter((c) => c !== cat),
    }));
  };

  // ─── Course Override Handlers ───────────────────────
  const handleAddOverride = () => {
    if (!selectedCourseId) return;
    if (rules.courseSpecificRules[selectedCourseId]) {
      showToast("Override already exists for this course.", "info");
      return;
    }
    setRules((prev) => ({
      ...prev,
      courseSpecificRules: {
        ...prev.courseSpecificRules,
        [selectedCourseId]: {
          criteria: [],
          highMeritThreshold: undefined,
          mediumMeritThreshold: undefined,
        },
      },
    }));
    showToast(`Override added for course.`, "success");
  };

  const handleRemoveOverrideClick = (courseId) => {
    setRemoveOverrideCourseId(courseId);
    setShowRemoveOverrideModal(true);
  };

  const confirmRemoveOverride = () => {
    const courseId = removeOverrideCourseId;
    const courseName = courses.find((c) => c._id === courseId)?.name || "Course";
    setRules((prev) => {
      const { [courseId]: _, ...rest } = prev.courseSpecificRules;
      return { ...prev, courseSpecificRules: rest };
    });
    setShowRemoveOverrideModal(false);
    setRemoveOverrideCourseId(null);
    showToast(`Override removed for ${courseName}.`, "info");
  };

  const handleOverrideChange = (courseId, key, value) => {
    setRules((prev) => ({
      ...prev,
      courseSpecificRules: {
        ...prev.courseSpecificRules,
        [courseId]: {
          ...prev.courseSpecificRules[courseId],
          [key]: value,
        },
      },
    }));
  };

  // ─── Override Condition Handlers ────────────────────
  const handleOverrideConditionChange = (courseId, index, field, value) => {
    setRules((prev) => {
      const courseRules = prev.courseSpecificRules[courseId] || { criteria: [] };
      const updatedCriteria = [...(courseRules.criteria || [])];
      updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
      return {
        ...prev,
        courseSpecificRules: {
          ...prev.courseSpecificRules,
          [courseId]: {
            ...courseRules,
            criteria: updatedCriteria,
          },
        },
      };
    });
  };

  const handleOverrideConditionAdd = (courseId) => {
    setRules((prev) => {
      const courseRules = prev.courseSpecificRules[courseId] || { criteria: [] };
      const updatedCriteria = [...(courseRules.criteria || [])];
      updatedCriteria.push({ field: "12thPercentage", operator: ">=", value: "" });
      return {
        ...prev,
        courseSpecificRules: {
          ...prev.courseSpecificRules,
          [courseId]: {
            ...courseRules,
            criteria: updatedCriteria,
          },
        },
      };
    });
  };

  const handleOverrideConditionRemove = (courseId, index) => {
    setRules((prev) => {
      const courseRules = prev.courseSpecificRules[courseId] || { criteria: [] };
      const updatedCriteria = [...(courseRules.criteria || [])];
      updatedCriteria.splice(index, 1);
      return {
        ...prev,
        courseSpecificRules: {
          ...prev.courseSpecificRules,
          [courseId]: {
            ...courseRules,
            criteria: updatedCriteria,
          },
        },
      };
    });
  };

  // ─── Save ────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedOverrides = {};
      Object.entries(rules.courseSpecificRules).forEach(([courseId, override]) => {
        const hasCriteria = override.criteria && override.criteria.length > 0;
        const hasThresholds =
          override.highMeritThreshold !== undefined ||
          override.mediumMeritThreshold !== undefined;
        if (hasCriteria || hasThresholds) {
          cleanedOverrides[courseId] = {
            criteria: override.criteria || [],
            highMeritThreshold: override.highMeritThreshold,
            mediumMeritThreshold: override.mediumMeritThreshold,
          };
        }
      });

      const payload = {
        highMeritThreshold: rules.highMeritThreshold,
        mediumMeritThreshold: rules.mediumMeritThreshold,
        reservedCategories: rules.reservedCategories,
        eligibilityMinMarks: rules.eligibilityMinMarks,
        courseSpecificRules: cleanedOverrides,
      };

      const { data } = await updateClassificationRules(payload);
      if (data?.success) {
        showToast("Rules updated successfully!", "success");
        fetchData();
      } else {
        showToast("Failed to update rules.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating rules.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setRules(DEFAULT_RULES);
    setShowResetModal(false);
    showToast("Rules reset to defaults. Remember to save.", "info");
  };

  // ─── Render Helpers ──────────────────────────────────
  const renderConditionRows = (criteria, onConditionChange, onConditionRemove) => {
    if (!criteria || criteria.length === 0) {
      return <p className="text-sm text-navySoft italic">No conditions set.</p>;
    }
    return (
      <div className="space-y-3">
        {criteria.map((cond, idx) => {
          const isCustom = cond.field === "__custom__";
          // ✅ Unique key that includes field value to force re‑render
          const key = `${idx}-${cond.field}-${cond.operator}-${cond.value}`;
          return (
            <div
              key={key}
              className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <select
                value={cond.field}
                onChange={(e) => {
                  const newField = e.target.value;
                  onConditionChange(idx, "field", newField);
                  if (newField !== "__custom__") {
                    onConditionChange(idx, "customField", "");
                  }
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
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
                  onChange={(e) => onConditionChange(idx, "customField", e.target.value)}
                  placeholder="Enter field name"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white w-40"
                />
              )}
              <select
                value={cond.operator}
                onChange={(e) => onConditionChange(idx, "operator", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white"
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
                onChange={(e) => onConditionChange(idx, "value", e.target.value)}
                placeholder="Value"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent bg-white w-28"
              />
              <button
                type="button"
                onClick={() => onConditionRemove(idx)}
                className="text-red-500 hover:text-red-700 ml-auto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedOverride = selectedCourseId
    ? rules.courseSpecificRules[selectedCourseId]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading rules...</span>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Classification Rules</h1>
              <p className="mt-1 text-navySoft">
                Configure how applications are classified (Eligible, Merit, Reserved, etc.)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetClick}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>

          {/* ─── GLOBAL RULES ──────────────────────────── */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-6">Global Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  High Merit Threshold (%)
                </label>
                <input
                  type="number"
                  value={rules.highMeritThreshold}
                  onChange={(e) =>
                    handleGlobalChange("highMeritThreshold", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
                <p className="text-xs text-navySoft mt-1">
                  Score ≥ this → "High Merit"
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Medium Merit Threshold (%)
                </label>
                <input
                  type="number"
                  value={rules.mediumMeritThreshold}
                  onChange={(e) =>
                    handleGlobalChange("mediumMeritThreshold", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
                <p className="text-xs text-navySoft mt-1">
                  Score ≥ this → "Medium Merit"
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Eligibility Min Marks (%)
                </label>
                <input
                  type="number"
                  value={rules.eligibilityMinMarks}
                  onChange={(e) =>
                    handleGlobalChange("eligibilityMinMarks", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
                <p className="text-xs text-navySoft mt-1">
                  Marks ≥ this → "Eligible"
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Reserved Categories
                </label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg min-h-[52px] bg-gray-50">
                  {rules.reservedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleReservedCategoryRemove(cat)}
                        className="text-accent hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add category..."
                    onKeyDown={handleReservedCategoryAdd}
                    className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-navySoft mt-1">
                  Press Enter to add a new category.
                </p>
              </div>
            </div>
          </div>

          {/* ─── COURSE-SPECIFIC OVERRIDES ────────────── */}
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-6">Course-Specific Overrides</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 max-w-sm">
                <label className="block text-sm font-semibold text-navy mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none bg-white font-semibold text-navy focus:border-accent cursor-pointer"
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.session})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddOverride}
                disabled={!selectedCourseId || !!rules.courseSpecificRules[selectedCourseId]}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Plus size={16} />
                Add Override
              </button>
            </div>

            {selectedOverride ? (
              <div className="mt-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-navy">
                    {courses.find((c) => c._id === selectedCourseId)?.name || "Course"} Override
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveOverrideClick(selectedCourseId)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Remove Override
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Eligibility Criteria
                  </label>
                  {renderConditionRows(
                    selectedOverride.criteria || [],
                    (idx, field, value) =>
                      handleOverrideConditionChange(
                        selectedCourseId,
                        idx,
                        field,
                        value
                      ),
                    (idx) => handleOverrideConditionRemove(selectedCourseId, idx)
                  )}
                  <button
                    type="button"
                    onClick={() => handleOverrideConditionAdd(selectedCourseId)}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    <Plus size={16} />
                    Add Condition
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      High Merit Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={selectedOverride.highMeritThreshold ?? ""}
                      onChange={(e) =>
                        handleOverrideChange(
                          selectedCourseId,
                          "highMeritThreshold",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min="0"
                      max="100"
                      placeholder="Use global"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <p className="text-xs text-navySoft mt-1">
                      Leave empty to use global value.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Medium Merit Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={selectedOverride.mediumMeritThreshold ?? ""}
                      onChange={(e) =>
                        handleOverrideChange(
                          selectedCourseId,
                          "mediumMeritThreshold",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min="0"
                      max="100"
                      placeholder="Use global"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <p className="text-xs text-navySoft mt-1">
                      Leave empty to use global value.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-navySoft italic mt-4">
                {selectedCourseId
                  ? "No override for this course. Click 'Add Override' to start."
                  : "Select a course to configure an override."}
              </p>
            )}
          </div>
        </main>
      </div>

      {/* ─── Reset Confirmation Modal ────────────────── */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Rules"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to reset all classification rules to system defaults?
            <br />
            <span className="font-semibold text-amber-600">Any unsaved changes will be lost.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmReset}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
            >
              Yes, Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Remove Override Confirmation Modal ──────── */}
      <Modal
        isOpen={showRemoveOverrideModal}
        onClose={() => {
          setShowRemoveOverrideModal(false);
          setRemoveOverrideCourseId(null);
        }}
        title="Remove Override"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to remove the override for
            <br />
            <span className="font-semibold text-navy">
              {courses.find((c) => c._id === removeOverrideCourseId)?.name || "this course"}?
            </span>
            <br />
            <span className="font-semibold text-red-600">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowRemoveOverrideModal(false);
                setRemoveOverrideCourseId(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemoveOverride}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Yes, Remove
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