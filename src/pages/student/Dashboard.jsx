import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

// ---- Dummy data for now — swap for useApplications() once auth/login is wired ----
// Real shape will come from GET /api/applications/my, e.g.:
// { _id, courseId: { name, session }, status, submittedAt, createdAt }
const DUMMY_ACTIVE_APPLICATION = {
  code: "SS-04821",
  courseName: "B.Tech CS",
  status: "under_review",
};

const DUMMY_APPLICATIONS = [
  {
    id: 1,
    course: "The Python Mega Course: Build 10 Real World Applications",
    session: "Fall 2026",
    submitted: "Jun 30, 2026",
    status: "under_review",
  },
  {
    id: 2,
    course: "The Python Mega Course: Build 10 Real World Applications",
    session: "Fall 2026",
    submitted: "Jun 30, 2026",
    status: "under_review",
  },
  {
    id: 3,
    course: "The Python Mega Course: Build 10 Real World Applications",
    session: "Fall 2026",
    submitted: "Jun 30, 2026",
    status: "under_review",
  },
];

// Matches the real backend's status enum + workflow order
// (draft -> submitted -> under_review -> verified -> admitted, or rejected off any step)
const WORKFLOW_STEPS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
  { value: "admitted", label: "Admitted" },
];

const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  admitted: "Admitted",
  rejected: "Rejected",
};

const STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-blue-50 text-blue-600",
  under_review: "bg-accent/10 text-accent",
  verified: "bg-green-50 text-green-600",
  admitted: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

function StatusTimeline({ currentStatus }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.value === currentStatus);

  return (
    <div className="flex items-center">
      {WORKFLOW_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={step.value} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className={`absolute top-4 right-1/2 w-full h-0.5 ${
                  i <= currentIndex ? "bg-accent" : "bg-gray-200"
                }`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold relative z-10 ${
                done
                  ? "bg-accent text-white"
                  : current
                  ? "bg-accent text-white ring-4 ring-accent/20"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? <Check size={15} /> : i + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${current ? "text-accent" : "text-navySoft"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <h1 className="text-3xl font-bold text-navy">Welcome back, Ananya</h1>
          <p className="mt-1 text-navySoft">Here's where your applications stand this session</p>

          {/* Active application status card */}
          <div className="mt-8 border border-black/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-navy">
                Application #{DUMMY_ACTIVE_APPLICATION.code} — {DUMMY_ACTIVE_APPLICATION.courseName}
              </h2>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  STATUS_BADGE[DUMMY_ACTIVE_APPLICATION.status]
                }`}
              >
                {STATUS_LABEL[DUMMY_ACTIVE_APPLICATION.status]}
              </span>
            </div>
            <StatusTimeline currentStatus={DUMMY_ACTIVE_APPLICATION.status} />
          </div>

          {/* Applications table */}
          <div className="mt-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-navySoft border-b border-black/10">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Session</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_APPLICATIONS.map((app) => (
                  <tr key={app.id} className="border-b border-black/5">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex-none" />
                        <span className="font-medium text-navy max-w-xs">{app.course}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-navySoft">{app.session}</td>
                    <td className="py-4 pr-4 text-navySoft">{app.submitted}</td>
                    <td className="py-4">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_BADGE[app.status]}`}>
                        {STATUS_LABEL[app.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {DUMMY_APPLICATIONS.length === 0 && (
              <div className="text-center py-16 text-navySoft">
                No applications yet.{" "}
                <Link to="/student/courses" className="text-accent font-medium">
                  Browse courses
                </Link>{" "}
                to get started.
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}