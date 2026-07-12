import { Routes, Route } from "react-router-dom";
import Landing from "./pages/public/Landing.jsx";

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
      <Route path="/login" element={<ComingSoon label="Login" />} />
      <Route path="/register" element={<ComingSoon label="Register" />} />
      <Route path="/courses" element={<ComingSoon label="Browse Courses" />} />
      <Route path="/for-institutions" element={<ComingSoon label="For Institutions" />} />
      <Route path="/register-institution" element={<ComingSoon label="Register Institution" />} />
    </Routes>
  );
}
