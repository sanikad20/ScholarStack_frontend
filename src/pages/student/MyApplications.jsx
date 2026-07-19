import { useState } from "react";
import { Search, Plus } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

const APPLICATIONS = [
  {
    id: 1,
    course: "The Python Mega Course: Build 10 Real World Applications",
    institution: "Riverside Polytechnic",
    submitted: "Jun 30, 2026",
    status: "Under Review",
  },
  {
    id: 2,
    course: "The Python Mega Course: Build 10 Real World Applications",
    institution: "Riverside Polytechnic",
    submitted: "Jun 30, 2026",
    status: "Verified",
  },
  {
    id: 3,
    course: "The Python Mega Course: Build 10 Real World Applications",
    institution: "Riverside Polytechnic",
    submitted: "Jun 30, 2026",
    status: "Under Review",
  },
];

const STATUS_COLORS = {
  "Under Review": "text-accent",
  Verified: "text-green-600",
  Admitted: "text-blue",
  Rejected: "text-red-500",
  Submitted: "text-gold",
};

export default function MyApplications() {
  const [search, setSearch] = useState("");

  const filtered = APPLICATIONS.filter(
    (a) =>
      a.course.toLowerCase().includes(search.toLowerCase()) ||
      a.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">My Applications</h1>
              <p className="text-sm text-navySoft mt-1">
                Every application you've started, across every institution.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dark transition">
              New Application <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 border border-black/10 rounded-xl px-4 py-3 mb-6 bg-white">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by course or institution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navySoft border-b border-black/10">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Institution</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-black/5">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex-none" />
                      <span className="font-medium text-navy max-w-xs">{app.course}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-accent font-medium">{app.institution}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-accent font-medium">{app.submitted}</span>
                  </td>
                  <td className="py-4">
                    <span className={`font-semibold ${STATUS_COLORS[app.status] || "text-navy"}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>

      <Footer />
    </div>
  );
}