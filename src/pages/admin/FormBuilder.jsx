import { useEffect, useState } from "react";
import { Plus, Trash, Edit2, FileText, Save, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function FormBuilder() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const FIELD_TYPES = [
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Date", value: "date" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Radio", value: "radio" },
    { label: "Check box", value: "checkbox" },
    { label: "File upload", value: "file" }
  ];

  const TYPE_LABELS = {
    text: "TEXT",
    number: "NUMBER",
    date: "DATE",
    dropdown: "DROPDOWN",
    radio: "RADIO",
    checkbox: "CHECK BOX",
    file: "FILE UPLOAD"
  };

  useEffect(() => {
    api
      .get("/courses")
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setSelectedCourseId(data.data[0]._id);
          }
        }
      })
      .catch(() => {
        setError("Could not load courses for form templates.");
      });
  }, []);

  const fetchTemplate = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    setTemplate(null);
    setFields([]);
    setSelectedIndex(null);
    try {
      const { data } = await api.get(`/forms/course/${courseId}`);
      if (data?.success && data?.data) {
        setTemplate(data.data);
        const fetchedFields = data.data.fields || [];
        setFields(fetchedFields);
        if (fetchedFields.length > 0) {
          setSelectedIndex(0);
        }
      }
    } catch (err) {
      setTemplate(null);
      const defaultFields = [
        { label: "Full name", fieldKey: "full_name", type: "text", required: true, order: 0 },
        { label: "Date of birth", fieldKey: "date_of_birth", type: "date", required: true, order: 1 },
        { label: "Stream", fieldKey: "stream", type: "dropdown", required: true, options: ["Science", "Commerce", "Arts"], order: 2 },
        { label: "12th marksheet", fieldKey: "marksheet_12", type: "file", required: true, order: 3 },
      ];
      setFields(defaultFields);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate(selectedCourseId);
  }, [selectedCourseId]);

  const handleAddField = () => {
    const newField = {
      label: "New Field",
      fieldKey: `new_field_${fields.length}`,
      type: "text",
      required: false,
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

  const handleFieldChange = (key, value) => {
    if (selectedIndex === null) return;
    setFields((prev) =>
      prev.map((f, i) => {
        if (i === selectedIndex) {
          const updated = { ...f, [key]: value };
          if (key === "label") {
            updated.fieldKey = value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9_]/g, "_")
              .replace(/_+/g, "_");
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleSaveTemplate = async () => {
    if (fields.length === 0) {
      alert("At least one field is required in the template.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      courseId: selectedCourseId,
      fields: fields.map((f, i) => ({ ...f, order: i })),
    };

    try {
      if (template?._id) {
        await api.put(`/forms/${template._id}`, payload);
      } else {
        await api.post("/forms", payload);
      }
      alert("Form template saved successfully!");
      fetchTemplate(selectedCourseId);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error saving form template.");
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
              <h1 className="text-3xl font-bold text-navy">Form Builder</h1>
              <p className="mt-1 text-navySoft">Design custom application forms and requirements per course</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchTemplate(selectedCourseId)}
                disabled={loading}
                className="inline-flex items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || loading || !selectedCourseId}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Config"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          {/* COURSE SELECTOR */}
          <div className="mt-8 flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-navySoft shrink-0">Select Course:</span>
            <div className="relative flex-1 max-w-sm">
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
          </div>

          {loading ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading form builder...</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10 mt-8">
              
              {/* LEFT COLUMN: FIELD LISTINGS */}
              <div className="space-y-4">
                {fields.map((field, idx) => {
                  const isActive = selectedIndex === idx;
                  const typeLabel = TYPE_LABELS[field.type] || field.type.toUpperCase();
                  const reqText = field.required ? "REQUIRED" : "OPTIONAL";
                  const optionsCount = field.options && field.options.length > 0 
                    ? `${field.options.length} OPTIONS` 
                    : null;
                  
                  const subLabel = [typeLabel, optionsCount, reqText].filter(Boolean).join(" - ");

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition duration-200 cursor-pointer select-none ${
                        isActive
                          ? "border-accent ring-2 ring-accent/10 bg-accent/5"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#FF5A3C]/10 flex items-center justify-center text-accent shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-navy text-[15px]">{field.label}</span>
                          <span className="block text-[11px] font-bold text-gray-400 tracking-wider mt-0.5">
                            {subLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center text-navySoft hover:text-navy transition bg-white"
                        >
                          <Edit2 size={13} />
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

              {/* RIGHT COLUMN: CONFIGURATION PANEL */}
              <div className="border border-gray-200 rounded-2xl p-8 bg-white h-fit shadow-sm">
                
                <div>
                  <h3 className="text-lg font-bold text-navy mb-4">Field type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {FIELD_TYPES.map((t) => {
                      const isSelected = activeField?.type === t.value;
                      return (
                        <button
                          type="button"
                          key={t.value}
                          onClick={() => handleFieldChange("type", t.value)}
                          disabled={!activeField}
                          className={`w-full py-3 px-4 border rounded-lg text-sm font-semibold text-left transition duration-200 ${
                            isSelected
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

                <div className="h-[1px] bg-gray-100 my-8" />

                <div>
                  <h3 className="text-lg font-bold text-navy mb-4">Field settings</h3>
                  
                  {activeField ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Field label</label>
                        <input
                          type="text"
                          value={activeField.label}
                          onChange={(e) => handleFieldChange("label", e.target.value)}
                          placeholder="eg. Stream / Core Subjects"
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>

                      {["dropdown", "radio", "checkbox"].includes(activeField.type) && (
                        <div>
                          <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                            Options (Comma-separated)
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

                      <div className="pt-2">
                        <label className="flex items-center gap-2.5 text-sm text-navySoft cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={activeField.required}
                            onChange={(e) => handleFieldChange("required", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          <span>Mark as Required</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-navySoft italic">Select a field card on the left to edit its configuration.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
