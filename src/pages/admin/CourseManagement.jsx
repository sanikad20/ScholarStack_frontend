import courseThumbnail from "../../assets/image 4.png";
import { useEffect, useState } from "react";
import { Plus, Trash, Edit2, CheckSquare, Square, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    session: "",
    admissionCapacity: "",
    description: "",
    eligibility10: "",
    eligibility12: "",
    requiredDocs: [],
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const AVAILABLE_DOCS = [
    "10 BOARD MARK SHEET",
    "12 BOARD MARK SHEET",
    "FRONT ADHAAR CARD",
    "BACK ADHAAR CARD",
    "CUET SCORE CARD",
    "MIGRATION CERTIFICATE",
    "TRANSFER CERTIFICATE",
  ];

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/courses");
      if (data?.success && data?.data) {
        setCourses(data.data);
      } else {
        setError("Failed to fetch courses.");
      }
    } catch (err) {
      setError("Error connecting to courses list API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDoc = (doc) => {
    setForm((prev) => {
      const exists = prev.requiredDocs.includes(doc);
      return {
        ...prev,
        requiredDocs: exists
          ? prev.requiredDocs.filter((d) => d !== doc)
          : [...prev.requiredDocs, doc],
      };
    });
  };

  const handleEditClick = (course) => {
    setEditingId(course._id);
    setForm({
      name: course.name,
      session: course.session || "",
      admissionCapacity: course.admissionCapacity || "",
      description: course.description || "",
      eligibility10: course.eligibilityCriteria?.minMarks10 || "",
      eligibility12: course.eligibilityCriteria?.minMarks12 || "",
      requiredDocs: course.requiredDocuments || [],
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      name: "",
      session: "",
      admissionCapacity: "",
      description: "",
      eligibility10: "",
      eligibility12: "",
      requiredDocs: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      session: form.session,
      admissionCapacity: Number(form.admissionCapacity),
      description: form.description,
      requiredDocuments: form.requiredDocs,
      eligibilityCriteria: {
        minMarks10: Number(form.eligibility10) || 0,
        minMarks12: Number(form.eligibility12) || 0,
      },
    };

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      alert(`Course ${editingId ? "updated" : "created"} successfully!`);
      handleCancel();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message ?? "Error saving course details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      alert("Course deleted successfully.");
      fetchCourses();
    } catch (err) {
      alert("Error deleting course. Check if application records depend on this course.");
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
              <h1 className="text-3xl font-bold text-navy">Course Management</h1>
              <p className="mt-1 text-navySoft">Configure university courses, sessions, capacity, and admission requirements</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCourses}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleAddClick}
                className="rounded-lg bg-accent text-white px-6 py-3 text-sm font-bold hover:bg-accent-dark transition duration-200"
              >
                New Course +
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          {showForm && (
            <div className="mt-8 border border-gray-200 rounded-xl p-6 bg-gray-50/50 shadow-sm">
              <h2 className="text-lg font-bold text-navy mb-6">
                {editingId ? "Edit Course Configuration" : "Add New Course"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Course Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="eg. B.Tech Computer Science"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Session</label>
                    <input
                      type="text"
                      name="session"
                      value={form.session}
                      onChange={handleChange}
                      placeholder="eg. 2026-2030"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Intake Capacity</label>
                    <input
                      type="number"
                      name="admissionCapacity"
                      value={form.admissionCapacity}
                      onChange={handleChange}
                      placeholder="eg. 60"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief description of course modules and syllabus outline..."
                    className="w-full h-20 rounded-lg border border-gray-200 p-3 text-sm bg-white outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Min 10th percentage required</label>
                    <input
                      type="number"
                      name="eligibility10"
                      value={form.eligibility10}
                      onChange={handleChange}
                      placeholder="eg. 60"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">Min 12th percentage required</label>
                    <input
                      type="number"
                      name="eligibility12"
                      value={form.eligibility12}
                      onChange={handleChange}
                      placeholder="eg. 60"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-accent bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navySoft mb-3 uppercase">Required verification documents</label>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_DOCS.map((doc) => {
                      const selected = form.requiredDocs.includes(doc);
                      return (
                        <button
                          type="button"
                          key={doc}
                          onClick={() => toggleDoc(doc)}
                          className="flex items-center gap-2 text-sm text-navySoft hover:text-navy cursor-pointer select-none text-left"
                        >
                          {selected ? <CheckSquare size={16} className="text-accent" /> : <Square size={16} />}
                          <span>{doc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center rounded-lg bg-accent text-white px-6 py-2.5 text-sm font-bold hover:bg-accent-dark transition duration-200 disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : "Save Configuration"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex justify-center rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold text-navySoft hover:bg-gray-100 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && courses.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading courses database...</div>
          ) : (
            <div className="mt-8 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                     <tr className="text-left text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 pb-3">Course</th>
                    <th className="px-6 py-4 pb-3">Capacity</th>
                    <th className="px-6 py-4 pb-3">Session</th>
                    <th className="px-6 py-4 pb-3">Eligibility</th>
                    <th className="px-6 py-4 pb-3">Applied</th>
                    <th className="px-6 py-4 pb-3 text-right">&nbsp;</th>
                  </tr>
                </thead>
               <tbody className="divide-y divide-gray-100 bg-white">
                  {courses.map((course) => {
                    const eligibilityText = course.eligibilityCriteria
                      ? `12th % >= ${course.eligibilityCriteria.minMarks12 || 60}, PCM`
                      : "12th % >= 60, PCM";

                    const appliedCount = course.appliedCount || 620; // Default Figma metric

                    return (
                      <tr key={course._id} className="hover:bg-gray-50/50 transition">
                        {/* 1. Course with Thumbnail */}
                        <td className="px-6 py-5 flex items-center gap-4">
                          <img
                            src={courseThumbnail}
                            alt={course.name}
                            className="w-24 h-16 rounded-lg object-cover border border-gray-100 bg-gray-50 shrink-0"
                          />
                          <span className="font-bold text-navy text-[15px]">{course.name}</span>
                        </td>
                        {/* 2. Capacity */}
                        <td className="px-6 py-5 text-navySoft font-semibold">{course.admissionCapacity || 0}</td>
                        {/* 3. Session */}
                        <td className="px-6 py-5 text-navySoft font-semibold">{course.session || "—"}</td>
                        {/* 4. Eligibility */}
                        <td className="px-6 py-5 text-navySoft font-semibold">{eligibilityText}</td>
                        {/* 5. Applied count */}
                        <td className="px-6 py-5 text-navySoft font-semibold">{appliedCount}</td>
                        {/* 6. Orange Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(course)}
                              className="w-8 h-8 rounded-lg border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/5 transition"
                              title="Edit Course"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="w-8 h-8 rounded-lg border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/5 transition"
                              title="Delete Course"
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {courses.length === 0 && (
                <div className="text-center py-16 text-navySoft font-semibold bg-white">
                  No courses added yet. Click "Add Course" to get started.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
