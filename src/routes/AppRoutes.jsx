import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocumentUpload from "../pages/student/DocumentUpload";
import MyApplications from "../pages/student/MyApplications";
import Profile from "../pages/student/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/student/documents" element={<DocumentUpload />} />
        <Route path="/student/applications" element={<MyApplications />} />
        <Route path="/student/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}