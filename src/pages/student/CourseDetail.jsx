import { Link, useParams } from "react-router-dom";
import { Users, FileText, Clock, BarChart3 } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

// ---- Dummy data for now — swap for useCourseById(id) once GET /api/courses/:id is confirmed ----
const DUMMY_COURSE = {
  uploaded: "Jan 21, 2020",
  updated: "Sep 11, 2021",
  title: "2021 Complete Python Bootcamp From Zero to Hero in Python",
  description:
    "3 in 1 Course: Learn to design websites with Figma, build with Webflow, and make a living freelancing.",
  institution: "Riverside Polytechnic",
  session: "Fall 2026",
  overview: [
    { icon: Users, iconBg: "bg-orange-50 text-orange-500", value: "120 seats", label: "capacity" },
    { icon: FileText, iconBg: "bg-gray-100 text-gray-500", value: "Fall 2026", label: "Session" },
    { icon: Clock, iconBg: "bg-purple-50 text-purple-500", value: "4 years", label: "Duration" },
    { icon: BarChart3, iconBg: "bg-green-50 text-green-600", value: "12th % ≥ 60, PCM required", label: "Eligibility" },
  ],
  documents: ["12th Marksheet", "Government ID proof", "Passport-size photo", "Category certificate (if applicable)"],
};

export default function CourseDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="border border-black/10 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="w-full md:w-72 h-48 md:h-auto rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-none" />

              <div className="flex-1 flex flex-col">
                <div className="text-xs text-navySoft mb-2">
                  Uploaded: {DUMMY_COURSE.uploaded} &nbsp;·&nbsp; Last Updated: {DUMMY_COURSE.updated}
                </div>
                <h1 className="text-xl font-bold text-navy">{DUMMY_COURSE.title}</h1>
                <p className="mt-2 text-sm text-navySoft">{DUMMY_COURSE.description}</p>

                <div className="mt-4 pt-4 border-t border-black/5 flex-1 flex flex-col justify-end">
                  <p className="text-sm font-semibold text-navy mb-4">
                    {DUMMY_COURSE.institution} · {DUMMY_COURSE.session} session
                  </p>
                  <Link
                    to={`/student/apply/${id ?? "1"}`}
                    className="self-end inline-flex items-center bg-accent hover:bg-accent-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mt-10">
            <div>
              <h2 className="text-sm font-semibold text-navySoft mb-5">Course Overview</h2>
              <div className="space-y-5">
                {DUMMY_COURSE.overview.map(({ icon: Icon, iconBg, value, label }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-none ${iconBg}`}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy">{value}</div>
                      <div className="text-xs text-navySoft">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-navySoft mb-5">Documents required</h2>
              <div className="space-y-5">
                {DUMMY_COURSE.documents.map((doc) => (
                  <div key={doc} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-accent flex items-center justify-center flex-none">
                      <FileText size={19} />
                    </div>
                    <div className="text-sm font-semibold text-navy">{doc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}