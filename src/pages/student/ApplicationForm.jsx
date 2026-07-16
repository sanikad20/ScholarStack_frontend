import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

// ---- Dummy course header for now — swap for useCourseById(id) once confirmed ----
const DUMMY_COURSE_HEADER = {
  title: "B.Tech Computer Science",
  institution: "Riverside Polytechnic",
  session: "Fall 2026",
};

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    stream: "",
    dob: "",
    percentage: "",
    category: "general",
    confirmEligibility: false,
    confirmConsent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    // TODO: wire to PUT /api/applications/:id/draft once real application flow exists
    console.log("Save draft", form);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // TODO: wire to POST /api/applications, then move to document upload step
    navigate(`/student/apply/${id ?? "1"}/documents`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <h1 className="text-xl font-bold text-navy">
            Apply — {DUMMY_COURSE_HEADER.title} {DUMMY_COURSE_HEADER.institution} ·{" "}
            {DUMMY_COURSE_HEADER.session} session
          </h1>

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
                placeholder="Enter your username"
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
                  placeholder="DD-MM-YYYY"
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="border border-accent text-accent font-semibold text-sm px-6 py-3 rounded-full hover:bg-accent/5 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="bg-accent hover:bg-accent-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
              >
                Continue To Documents
              </button>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}