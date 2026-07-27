// src/pages/admin/FormBuilder.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash, Edit2, FileText, Save, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { getCourses } from "../../api/courses.api";
import {
  getFormTemplateById,
  getFormTemplateByCourse,
  createFormTemplate,
  updateFormTemplate,
} from "../../api/forms.api";

const FIELD_TYPES = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Dropdown", value: "dropdown" },
  { label: "Radio", value: "radio" },
  { label: "Checkbox", value: "checkbox" },
  { label: "File Upload", value: "file" },
];

const TYPE_LABELS = {
  text: "TEXT",
  number: "NUMBER",
  date: "DATE",
  dropdown: "DROPDOWN",
  radio: "RADIO",
  checkbox: "CHECKBOX",
  file: "FILE",
};

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const isEditMode = !!id;
  const redirectGuard = useRef(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Fetch courses ──────────────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await getCourses();
        if (data?.success && data?.data) {
          setCourses(data.data);
        }
      } catch (err) {
        showToast("Could not load courses.", "error");
      }
    };
    fetchCourses();
  }, []);

  // ─── Fetch template if editing ─────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const { data } = await getFormTemplateById(id);
        if (data?.success && data?.data) {
          const t = data.data;
          setTemplate(t);
          setSelectedCourseId(t.courseId);
          setFields(t.fields || []);
          if (t.fields?.length > 0) setSelectedIndex(0);
        } else {
          showToast("Template not found.", "error");
          navigate("/admin/forms");
        }
      } catch (err) {
        showToast("Error loading template.", "error");
        navigate("/admin/forms");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── When course changes (new mode only) ────────────
  useEffect(() => {
    if (isEditMode) return;
    if (!selectedCourseId) {
      setFields([]);
      setSelectedIndex(null);
      return;
    }

    // Reset the redirect guard for this course selection
    redirectGuard.current = false;

    const fetchOrCreate = async () => {
      setLoading(true);
      try {
        const { data } = await getFormTemplateByCourse(selectedCourseId);

        // If template exists, redirect to edit mode
        if (data?.success && data?.data && data.data._id) {
          if (!redirectGuard.current) {
            redirectGuard.current = true;
            showToast("This course already has a form. Redirecting to edit...", "info");
            navigate(`/admin/forms/${data.data._id}`);
          }
          return;
        }

        // No template – set default fields
        const defaultFields = [
          { label: "Full Name", fieldKey: "fullName", type: "text", validation: { required: true }, order: 0 },
          { label: "Date of Birth", fieldKey: "dob", type: "date", validation: { required: true }, order: 1 },
          { label: "Category", fieldKey: "category", type: "dropdown", validation: { required: true }, options: ["General", "OBC", "SC", "ST", "EWS"], order: 2 },
          { label: "12th Percentage", fieldKey: "twelfthPercentage", type: "number", validation: { required: true, min: 0, max: 100 }, order: 3 },
          { label: "Upload Marksheet", fieldKey: "marksheet", type: "file", validation: { required: true }, order: 4 },
        ];
        setFields(defaultFields);
        if (defaultFields.length > 0) setSelectedIndex(0);
      } catch (err) {
        // Network error – still set default fields
        const defaultFields = [
          { label: "Full Name", fieldKey: "fullName", type: "text", validation: { required: true }, order: 0 },
          { label: "Date of Birth", fieldKey: "dob", type: "date", validation: { required: true }, order: 1 },
          { label: "Category", fieldKey: "category", type: "dropdown", validation: { required: true }, options: ["General", "OBC", "SC", "ST", "EWS"], order: 2 },
          { label: "12th Percentage", fieldKey: "twelfthPercentage", type: "number", validation: { required: true, min: 0, max: 100 }, order: 3 },
          { label: "Upload Marksheet", fieldKey: "marksheet", type: "file", validation: { required: true }, order: 4 },
        ];
        setFields(defaultFields);
        if (defaultFields.length > 0) setSelectedIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, isEditMode, navigate]);

  // ─── Field management ──────────────────────────────
  const handleAddField = () => {
    const newField = {
      label: "New Field",
      fieldKey: `new_field_${fields.length}`,
      type: "text",
      validation: { required: false },
      options: [],
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedIndex(fields.length);
  };

  const handleRemoveField = (index, e) => {
    e.stopPropagation();
    setFields((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex > index) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const handleMoveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((f, i) => (f.order = i));
    setFields(updated);
    setSelectedIndex(newIndex);
  };

  const handleFieldChange = (key, value) => {
    if (selectedIndex === null) return;
    setFields((prev) =>
      prev.map((f, i) => {
        if (i === selectedIndex) {
          const updated = { ...f, [key]: value };
          if (key === "label") {
            let base = value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9_]/g, "_")
              .replace(/_+/g, "_");

            if (!/^[a-z]/.test(base)) {
              base = "field_" + base;
            }

            base = base.replace(/^_+|_+$/g, "");
            updated.fieldKey = base;
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleValidationChange = (key, value) => {
    if (selectedIndex === null) return;
    setFields((prev) =>
      prev.map((f, i) => {
        if (i === selectedIndex) {
          const validation = { ...f.validation };
          validation[key] = value;
          return { ...f, validation };
        }
        return f;
      })
    );
  };

  // ─── Save ──────────────────────────────────────────
  const handleSave = async () => {
    if (fields.length === 0) {
      showToast("At least one field is required.", "error");
      return;
    }
    if (!selectedCourseId) {
      showToast("Please select a course.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        fields: fields.map((f, i) => ({ ...f, order: i })),
      };

      let res;
      if (isEditMode && template) {
        res = await updateFormTemplate(template._id, payload);
      } else {
        res = await createFormTemplate(payload);
      }

      if (res.data?.success) {
        setTemplate(res.data.data);
        showToast(isEditMode ? "Template updated!" : "Template created!", "success");
        if (!isEditMode) {
          navigate(`/admin/forms/${res.data.data._id}`);
        }
      } else {
        showToast("Failed to save template.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error saving template.", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeField = selectedIndex !== null ? fields[selectedIndex] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">
                {isEditMode ? "Edit Form Template" : "Create Form Template"}
              </h1>
              <p className="mt-1 text-navySoft">
                {isEditMode
                  ? `Editing template for ${template?.courseId?.name || "course"}`
                  : "Design a new application form for a course"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  onClick={() => navigate("/admin/forms")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Back to list
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || loading || !selectedCourseId}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </div>

          {/* ─── Course Selector ───────────────────────── */}
          <div className="mt-8 flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-navySoft shrink-0">Select Course:</span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={isEditMode}
                className={`w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none bg-white font-semibold text-navy focus:border-accent cursor-pointer ${isEditMode ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
                  }`}
              >
                <option value="">— Select a course —</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.session})
                  </option>
                ))}
              </select>
            </div>
            {isEditMode && (
              <span className="text-xs text-navySoft italic">(course locked in edit mode)</span>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading form builder...</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10 mt-8">
              {/* ─── LEFT: Field List ───────────────────── */}
              <div className="space-y-4">
                {fields.map((field, idx) => {
                  const isActive = selectedIndex === idx;
                  const typeLabel = TYPE_LABELS[field.type] || field.type.toUpperCase();
                  const reqText = field.validation?.required ? "REQUIRED" : "OPTIONAL";
                  const optionsCount =
                    field.options && field.options.length > 0 ? `${field.options.length} OPTIONS` : null;
                  const subLabel = [typeLabel, optionsCount, reqText].filter(Boolean).join(" - ");

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition duration-200 cursor-pointer select-none ${isActive
                        ? "border-accent ring-2 ring-accent/10 bg-accent/5"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-navy text-[15px]">{field.label}</span>
                          <span className="block text-[11px] font-bold text-gray-400 tracking-wider mt-0.5">
                            {subLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveField(idx, -1); }}
                          disabled={idx === 0}
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center text-navySoft hover:text-navy transition bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveField(idx, 1); }}
                          disabled={idx === fields.length - 1}
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center text-navySoft hover:text-navy transition bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveField(idx, e)}
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:border-red-200 flex items-center justify-center text-navySoft hover:text-red-500 transition bg-white"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddField}
                  className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-accent rounded-xl flex items-center justify-center text-navySoft hover:text-accent font-bold text-sm transition duration-200 cursor-pointer bg-white"
                >
                  + ADD FIELD
                </button>
              </div>

              {/* ─── RIGHT: Configuration Panel ────────── */}
              <div className="border border-gray-200 rounded-2xl p-8 bg-white h-fit shadow-sm">
                <h3 className="text-lg font-bold text-navy mb-4">Field Configuration</h3>

                {activeField ? (
                  <div className="space-y-6">
                    {/* Field Type */}
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Field Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {FIELD_TYPES.map((t) => {
                          const isSelected = activeField.type === t.value;
                          return (
                            <button
                              key={t.value}
                              onClick={() => handleFieldChange("type", t.value)}
                              className={`w-full py-2.5 px-3 border rounded-lg text-sm font-semibold text-left transition ${isSelected
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-gray-200 hover:border-gray-300 text-navy bg-white"
                                }`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Field Label */}
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Field Label</label>
                      <input
                        type="text"
                        value={activeField.label}
                        onChange={(e) => handleFieldChange("label", e.target.value)}
                        placeholder="e.g., Full Name"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>

                    {/* Options */}
                    {["dropdown", "radio", "checkbox"].includes(activeField.type) && (
                      <div>
                        <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                          Options (comma‑separated)
                        </label>
                        <input
                          type="text"
                          value={activeField.options ? activeField.options.join(", ") : ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "options",
                              e.target.value.split(",").map((o) => o.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                    )}

                    {/* Validation */}
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Validation</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 text-sm text-navySoft">
                          <input
                            type="checkbox"
                            checked={activeField.validation?.required || false}
                            onChange={(e) => handleValidationChange("required", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          Required
                        </label>
                        {activeField.type === "number" && (
                          <div className="flex gap-4">
                            <div>
                              <label className="block text-xs text-navySoft">Min</label>
                              <input
                                type="number"
                                value={activeField.validation?.min ?? ""}
                                onChange={(e) => handleValidationChange("min", e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="e.g., 0"
                                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-navySoft">Max</label>
                              <input
                                type="number"
                                value={activeField.validation?.max ?? ""}
                                onChange={(e) => handleValidationChange("max", e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="e.g., 100"
                                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                              />
                            </div>
                          </div>
                        )}
                        {activeField.type === "file" && (
                          <div>
                            <label className="block text-xs text-navySoft">Max file size (MB)</label>
                            <input
                              type="number"
                              value={activeField.validation?.fileSize ?? ""}
                              onChange={(e) => handleValidationChange("fileSize", e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="e.g., 5"
                              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                        Conditional Logic (optional)
                      </label>
                      <p className="text-xs text-navySoft italic">Coming soon: show/hide based on other fields</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-navySoft italic">Select a field card on the left to edit its configuration.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

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