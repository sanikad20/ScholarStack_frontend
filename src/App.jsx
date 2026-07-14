import { Routes, Route } from "react-router-dom";
import Landing from "./pages/public/Landing.jsx";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Dashboard from "./pages/student/Dashboard.jsx";
import BrowseCourses from "./pages/student/BrowseCourses.jsx";

function ComingSoon({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
      <p className="font-mono text-sm text-inkSoft">{label} — not built yet</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<ComingSoon label="Browse Courses" />} />
      <Route path="/for-institutions" element={<ComingSoon label="For Institutions" />} />
      <Route path="/register-institution" element={<ComingSoon label="Register Institution" />} />
      <Route path="/admin-login" element={<ComingSoon label="Admin Login" />} />
      <Route path="/student/dashboard" element={<Dashboard />} />
      <Route path="/student/courses" element={<BrowseCourses />} />
      <Route path="/student/applications" element={<ComingSoon label="My Applications" />} />
      <Route path="/student/profile" element={<ComingSoon label="Profile" />} />
    </Routes>
  );
}