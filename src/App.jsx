import { Routes, Route } from "react-router-dom";

// PUBLIC PAGES 
import ForInstitutions from "./pages/public/forInstitutions.jsx";
import RegisterInstitution from "./pages/public/RegisterInstitution.jsx";
import Landing from "./pages/public/Landing.jsx";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import AdminLogin from "./pages/public/AdminLogin.jsx";
import ForgotPassword from "./pages/public/ForgotPassword.jsx";
import ResetPassword from "./pages/public/ResetPassword.jsx";

// STUDENT PAGES 
import Dashboard from "./pages/student/Dashboard.jsx";
import BrowseCourses from "./pages/student/BrowseCourses.jsx";
import CourseDetail from "./pages/student/CourseDetail.jsx";
import ApplicationForm from "./pages/student/ApplicationForm.jsx";
import MyApplications from "./pages/student/MyApplications.jsx";
import Profile from "./pages/student/Profile.jsx";
import DocumentUpload from "./pages/student/DocumentUpload.jsx";
import Notifications from "./pages/student/Notifications.jsx";


// INSTITUTION ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ApplicationsList from "./pages/admin/ApplicationsList.jsx";
import ApplicationDetail from "./pages/admin/ApplicationDetail.jsx";
import CourseManagement from "./pages/admin/CourseManagement.jsx";
import SingleCourse from "./pages/admin/SingleCourse.jsx";
import FormManagement from "./pages/admin/FormManagement.jsx";
import FormBuilder from "./pages/admin/FormBuilder.jsx";
import ClassificationRules from "./pages/admin/ClassificationRules.jsx";
import ClassificationStats from "./pages/admin/ClassificationStats.jsx";
import ClassificationBulk from "./pages/admin/ClassificationBulk.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

// SUPER ADMIN PAGES
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard.jsx";
import InstitutionList from "./pages/superadmin/InstitutionsList.jsx";
import InstitutionCreate from "./pages/superadmin/InstitutionCreate.jsx";
import InstitutionEdit from "./pages/superadmin/InstitutionEdit.jsx";
import SuperAdminNotifications from "./pages/superadmin/SuperAdminNotifications.jsx";
import SuperAdminProfile from "./pages/superadmin/SuperAdminProfile.jsx";

// PLACEHOLDER FOR PAGES NOT BUILT YET
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
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/for-institutions" element={<ForInstitutions />} />
      <Route path="/register-institution" element={<RegisterInstitution />} />
      

      {/* STUDENT ROUTES */}
      <Route path="/student/dashboard" element={<Dashboard />} />
      <Route path="/student/courses" element={<BrowseCourses />} />
      <Route path="/student/courses/:id" element={<CourseDetail />} />
      <Route path="/student/apply/:id" element={<ApplicationForm />} />
      <Route path="/student/applications" element={<MyApplications />} />
      <Route path="/student/profile" element={<Profile />} />
      <Route path="/student/documents/:applicationId" element={<DocumentUpload />} />
      <Route path="/student/notifications" element={<Notifications />} />

      {/* INSTITUTION ADMIN ROUTES */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/applications" element={<ApplicationsList />} />
      <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
      <Route path="/admin/courses" element={<CourseManagement />} />
      <Route path="/admin/courses/:id" element={<SingleCourse />} />
      <Route path="/admin/forms" element={<FormManagement />} />
      <Route path="/admin/forms/new" element={<FormBuilder />} />
      <Route path="/admin/forms/:id" element={<FormBuilder />} />
      <Route path="/admin/classification/rules" element={<ClassificationRules />} />
      <Route path="/admin/classification/stats" element={<ClassificationStats />} />
      <Route path="/admin/classification/run" element={<ClassificationBulk />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/admin/profile" element={<AdminProfile />} />

      {/* SUPER ADMIN ROUTES */}
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/institutions" element={<InstitutionList />} />
      <Route path="/superadmin/institutions/new" element={<InstitutionCreate />} />
      <Route path="/superadmin/institutions/:id" element={<InstitutionEdit />} />
      <Route path="/superadmin/notifications" element={<SuperAdminNotifications />} />
      <Route path="/superadmin/profile" element={<SuperAdminProfile />} />

      {/* FALLBACK FOR PAGES NOT YET IMPLEMENTED */}
      <Route path="*" element={<ComingSoon label="Page not found" />} />
    </Routes>
  );
}