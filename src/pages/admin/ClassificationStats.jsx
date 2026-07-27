// src/pages/admin/ClassificationStats.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  TrendingDown,
  Shield,
  UserCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { getClassificationStats } from "../../api/classifications.api";
import { getCourses } from "../../api/courses.api";

// ─── Colors ──────────────────────────────────────────────
const COLORS = {
  eligible: "#22c55e",
  notEligible: "#ef4444",
  highMerit: "#10b981",
  mediumMerit: "#f59e0b",
  lowMerit: "#6b7280",
  reserved: "#8b5cf6",
  general: "#3b82f6",
  category: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"],
};

const PIE_COLORS = ["#22c55e", "#ef4444"];
const MERIT_COLORS = ["#10b981", "#f59e0b", "#6b7280"];
const RESERVED_COLORS = ["#8b5cf6", "#3b82f6"];

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_STATS = {
  overall: {
    totalApplications: 150,
    eligible: 120,
    notEligible: 30,
    highMerit: 45,
    mediumMerit: 60,
    lowMerit: 15,
    reserved: 50,
    general: 100,
  },
  categoryBreakdown: [
    { _id: "General", count: 100 },
    { _id: "SC", count: 30 },
    { _id: "ST", count: 10 },
    { _id: "OBC", count: 10 },
  ],
  courseMeritBreakdown: [
    { _id: { course: "67a1b2c3d4e5f6a7b8c9d001", merit: "High Merit" }, count: 20 },
    { _id: { course: "67a1b2c3d4e5f6a7b8c9d001", merit: "Medium Merit" }, count: 15 },
    { _id: { course: "67a1b2c3d4e5f6a7b8c9d001", merit: "Low Merit" }, count: 5 },
    { _id: { course: "67a1b2c3d4e5f6a7b8c9d002", merit: "High Merit" }, count: 10 },
    { _id: { course: "67a1b2c3d4e5f6a7b8c9d002", merit: "Medium Merit" }, count: 20 },
  ],
};

// ─── Main Component ────────────────────────────────────
export default function ClassificationStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadFallbackData = () => {
    setStats(FALLBACK_STATS);
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  const fetchStats = async (showRefreshToast = false) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const [statsRes, coursesRes] = await Promise.all([
          getClassificationStats(),
          getCourses(),
        ]);
        clearTimeout(timeoutId);

        if (statsRes.data?.success && statsRes.data?.data) {
          setStats(statsRes.data.data);
        } else {
          showToast("Failed to load stats.", "error");
          loadFallbackData();
          return;
        }

        if (coursesRes.data?.success && coursesRes.data?.data) {
          setCourses(coursesRes.data.data);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
        return;
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
      if (showRefreshToast) showToast("Stats refreshed!", "success");
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToApplications = (params) => {
    const searchParams = new URLSearchParams(params).toString();
    navigate(`/admin/applications?${searchParams}`);
  };

  const overall = stats?.overall || FALLBACK_STATS.overall;
  const categoryData = stats?.categoryBreakdown || FALLBACK_STATS.categoryBreakdown;
  const courseMeritData = stats?.courseMeritBreakdown || FALLBACK_STATS.courseMeritBreakdown;

  const eligibilityData = [
    { name: "Eligible", value: overall.eligible },
    { name: "Not Eligible", value: overall.notEligible },
  ];

  const meritData = [
    { name: "High Merit", value: overall.highMerit },
    { name: "Medium Merit", value: overall.mediumMerit },
    { name: "Low Merit", value: overall.lowMerit },
  ];

  const reservedData = [
    { name: "Reserved", value: overall.reserved },
    { name: "General", value: overall.general },
  ];

  const categoryBarData = categoryData.map((item) => ({
    category: item._id || "Unknown",
    count: item.count,
  }));

  const courseMeritTable = courseMeritData.reduce((acc, item) => {
    const courseId = item._id?.course || "unknown";
    const merit = item._id?.merit || "Unknown";
    const count = item.count || 0;
    if (!acc[courseId]) {
      acc[courseId] = { courseId, courseName: courseId, total: 0, High: 0, Medium: 0, Low: 0 };
    }
    acc[courseId][merit] = (acc[courseId][merit] || 0) + count;
    acc[courseId].total += count;
    return acc;
  }, {});

  const courseTableData = Object.values(courseMeritTable).map((row) => {
    const course = courses.find((c) => c._id === row.courseId);
    return {
      ...row,
      courseName: course?.name || row.courseId.slice(0, 8),
    };
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading stats...</span>
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
              <h1 className="text-3xl font-bold text-navy">Classification Statistics</h1>
              <p className="mt-1 text-navySoft">
                Overview of student classification data — click any card, chart segment, or row to view filtered applications.
              </p>
            </div>
            <button
              onClick={() => fetchStats(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ─── Summary Cards ──────────────────────────── */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              title="Total"
              value={overall.totalApplications}
              icon={Users}
              color="bg-blue-50 text-blue-600 border-blue-200"
              onClick={() => navigateToApplications({})}
              hoverable
            />
            <Card
              title="Eligible"
              value={overall.eligible}
              icon={CheckCircle}
              color="bg-green-50 text-green-600 border-green-200"
              onClick={() => navigateToApplications({ eligible: "true" })}
              hoverable
            />
            <Card
              title="Not Eligible"
              value={overall.notEligible}
              icon={XCircle}
              color="bg-red-50 text-red-600 border-red-200"
              onClick={() => navigateToApplications({ eligible: "false" })}
              hoverable
            />
            <Card
              title="High Merit"
              value={overall.highMerit}
              icon={Award}
              color="bg-emerald-50 text-emerald-600 border-emerald-200"
              onClick={() => navigateToApplications({ merit: "High Merit" })}
              hoverable
            />
            <Card
              title="Medium Merit"
              value={overall.mediumMerit}
              icon={TrendingUp}
              color="bg-yellow-50 text-yellow-600 border-yellow-200"
              onClick={() => navigateToApplications({ merit: "Medium Merit" })}
              hoverable
            />
            <Card
              title="Low Merit"
              value={overall.lowMerit}
              icon={TrendingDown}
              color="bg-gray-50 text-gray-600 border-gray-200"
              onClick={() => navigateToApplications({ merit: "Low Merit" })}
              hoverable
            />
            <Card
              title="Reserved"
              value={overall.reserved}
              icon={Shield}
              color="bg-purple-50 text-purple-600 border-purple-200"
              onClick={() => navigateToApplications({ reserved: "true" })}
              hoverable
            />
            <Card
              title="General"
              value={overall.general}
              icon={UserCheck}
              color="bg-indigo-50 text-indigo-600 border-indigo-200"
              onClick={() => navigateToApplications({ reserved: "false" })}
              hoverable
            />
          </div>

          {/* ─── Charts ──────────────────────────────────── */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartCard title="Eligibility Breakdown">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eligibilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => {
                      if (data.name === "Eligible") navigateToApplications({ eligible: "true" });
                      else if (data.name === "Not Eligible") navigateToApplications({ eligible: "false" });
                    }}
                    cursor="pointer"
                  >
                    {eligibilityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Merit Bar */}
            <ChartCard title="Merit Level Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={meritData}
                  onClick={(data) => {
                    if (data.activePayload) {
                      const merit = data.activePayload[0].payload.name;
                      if (merit === "High Merit") navigateToApplications({ merit: "High Merit" });
                      else if (merit === "Medium Merit") navigateToApplications({ merit: "Medium Merit" });
                      else if (merit === "Low Merit") navigateToApplications({ merit: "Low Merit" });
                    }
                  }}
                  cursor="pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {meritData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MERIT_COLORS[index % MERIT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Reserved vs General Pie */}
            <ChartCard title="Reserved vs General">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reservedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => {
                      if (data.name === "Reserved") navigateToApplications({ reserved: "true" });
                      else if (data.name === "General") navigateToApplications({ reserved: "false" });
                    }}
                    cursor="pointer"
                  >
                    {reservedData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={RESERVED_COLORS[index % RESERVED_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Category Bar */}
            <ChartCard title="Category Breakdown">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryBarData}
                  layout="vertical"
                  onClick={(data) => {
                    if (data.activePayload) {
                      const category = data.activePayload[0].payload.category;
                      if (category && category !== "Unknown") {
                        navigateToApplications({ category });
                      }
                    }
                  }}
                  cursor="pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6">
                    {categoryBarData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.category[index % COLORS.category.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ─── Course-wise Merit Table ───────────────── */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy mb-4">Course-wise Merit Distribution</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">High Merit</th>
                    <th className="px-4 py-3 text-center">Medium Merit</th>
                    <th className="px-4 py-3 text-center">Low Merit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {courseTableData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-navySoft italic">
                        No course merit data available.
                      </td>
                    </tr>
                  ) : (
                    courseTableData.map((row) => (
                      <tr
                        key={row.courseId}
                        onClick={() => {
                          // Only navigate if the courseId is a non-empty string (and ideally a valid ID)
                          if (row.courseId && row.courseId !== "unknown") {
                            navigateToApplications({ courseId: row.courseId });
                          }
                        }}
                        className="hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-navy">{row.courseName}</td>
                        <td className="px-4 py-3 text-center font-bold text-navy">{row.total}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.High || 0}</td>
                        <td className="px-4 py-3 text-center text-yellow-600 font-semibold">{row.Medium || 0}</td>
                        <td className="px-4 py-3 text-center text-gray-500 font-semibold">{row.Low || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

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

// ─── Sub-components ─────────────────────────────────────
const Card = ({ title, value, icon: Icon, color, onClick, hoverable = false }) => (
  <div
    className={`p-4 rounded-xl border ${color} bg-opacity-30 ${hoverable ? "cursor-pointer hover:shadow-md transition" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold uppercase tracking-wider opacity-75">{title}</span>
      <Icon size={18} />
    </div>
    <div className="mt-2 text-3xl font-extrabold">{value}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
    <h3 className="text-sm font-bold text-navySoft uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);