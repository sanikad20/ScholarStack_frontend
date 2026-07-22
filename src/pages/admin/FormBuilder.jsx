import { useEffect, useState } from "react";
import { Plus, Trash, Save, Layout, RefreshCw, ChevronDown, CheckSquare, Square } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function FormBuilder() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
    optionsString: "",
  });

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
        setError("Could not load courses to configure form templates.");
      });
  }, []);

  const fetchTemplate = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    setTemplate(null);
    setFields([]);
    try {
      const { data } = await api.get(`/forms/course/${courseId}`);
      if (data?.success && data?.data) {
        setTemplate(data.data);
        setFields(data.data.fields || []);
      }
    } catch (err) {
      setTemplate(null);
      setFields([
        { label: "Date of Birth", fieldKey: "date_of_birth", type: "date", required: true, order: 0 },
        { label: "Gender", fieldKey: "gender", type: "dropdown", required: true, options: ["Male", "Female", "Other"], order: 1 },
        { label: "10th Percentage", fieldKey: "percentage_10", type: "number", required: true, order: 2 },
        { label: "12th Percentage", fieldKey: "percentage_12", type: "number", required: true, order: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate(selectedCourseId);
  }, [selectedCourseId]);

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newField.label) return;

    const fieldKey = newField.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_");

    const options = newField.optionsString
      ? newField.optionsString.split(",").map((o) => o.trim()).filter(Boolean)
      : [];

    const field = {
      label: newField.label,
      fieldKey,
      type: newField.type,
      required: newField.required,
      options,
      order: fields.length,
    };

    setFields((prev) => [...prev, field]);
    setNewField({ label: "", type: "text", required: false, optionsString: "" });
  };

  const handleRemoveField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = async () => {
    if (fields.length === 0) {
      alert("At least one custom field is required in the template.");
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admission Form Builder</h1>
              <p className="mt-1 text-navySoft">Design custom application forms and required fields per course</p>
            </div>
            <button
              onClick={handleSaveTemplate}
              disabled={saving || loading || !selectedCourseId}
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving Template..." : "Save Template"}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

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
            <div className="py-24 text-center text-navySoft font-semibold">Loading template details...</div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 mt-8">
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50 shadow-sm h-fit">
                <div className="flex items-center gap-2 text-accent font-bold mb-4">
                  <Layout size={18} />
                  <h3 className="text-sm uppercase tracking-wider">Add Field Element</h3>
                </div>

                <form onSubmit={handleAddField} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Field Label</label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                      placeholder="eg. Aggregate 12th Marks"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none bg-white focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Field Type</label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none bg-white focus:border-accent cursor-pointer font-semibold text-navySoft"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number</option>
                      <option value="date">Date Picker</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="radio">Radio Option Group</option>
                      <option value="checkbox">Checkbox Option Group</option>
                      <option value="file">File Attachment</option>
                    </select>
                  </div>

                  {["dropdown", "radio", "checkbox"].includes(newField.type) && (
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">
                        Options (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newField.optionsString}
                        onChange={(e) =>
                          setNewField((prev) => ({ ...prev, optionsString: e.target.value }))
                        }
                        placeholder="Male, Female, Other"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none bg-white focus:border-accent"
                        required
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setNewField((prev) => ({ ...prev, required: !prev.required }))}
                      className="flex items-center gap-2.5 text-sm text-navySoft hover:text-navy cursor-pointer select-none"
                    >
                      {newField.required ? (
                        <CheckSquare size={16} className="text-accent" />
                      ) : (
                        <Square size={16} />
                      )}
                      <span>Mark Field as Required</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-accent text-white hover:bg-accent-dark text-sm font-bold transition duration-200"
                    >
                      Add Field to Preview
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 border border-gray-100 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-2">
                  Form Fields Preview
                </h2>
                
                {fields.length === 0 ? (
                  <p className="text-sm text-navySoft italic">No custom fields added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50"
                      >
                        <div>
                          <span className="block text-sm font-semibold text-navy">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </span>
                          <span className="block text-xs text-navySoft capitalize">
                            Type: {field.type} | Slug Key: <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded">{field.fieldKey}</code>
                          </span>
                          {field.options && field.options.length > 0 && (
                            <span className="block text-xs text-navySoft mt-1">
                              Options: {field.options.join(", ")}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="p-1.5 text-navySoft hover:text-red-500 transition"
                          title="Remove Field"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
