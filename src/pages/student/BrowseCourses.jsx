import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

// ---- Dummy data for now — swap for useCourses() -> GET /api/courses once confirmed ----
const CATEGORY_THEMES = [
  { from: "#DCEBFF", to: "#BFD9FF" },
  { from: "#FCE7E1", to: "#F2B8A6" },
  { from: "#E0F0EC", to: "#A9D6C8" },
  { from: "#EDEBFB", to: "#C9C4F2" },
];

const DUMMY_COURSES = [
  {
    id: 1,
    category: "Development",
    title: "Premiere Pro CC for Beginners: Video Editing in Premiere",
    students: "982,941",
  },
  {
    id: 2,
    category: "Development",
    title: "Learn Python Programming Masterclass",
    students: "511,123",
  },
  {
    id: 3,
    category: "Development",
    title: "Data Structures & Algorithms Essentials (2021)",
    students: "187,637",
  },
  {
    id: 4,
    category: "Development",
    title: "Machine Learning A-Z: Hands-On Python & R In Data Science",
    students: "211,434",
  },
  {
    id: 5,
    category: "Development",
    title: "Complete Blender Creator: Learn 3D Modelling for Beginners",
    students: "435,671",
  },
  {
    id: 6,
    category: "Development",
    title: "SEO 2021: Complete SEO Training + SEO for WordPress Websites",
    students: "181,811",
  },
  {
    id: 7,
    category: "Development",
    title: "Angular - The Complete Guide (2021 Edition)",
    students: "236,568",
  },
];

function CourseCard({ course, theme }) {
  return (
    <Link
      to={`/student/courses/${course.id}`}
      className="block rounded-xl overflow-hidden border border-black/5 hover:shadow-lg transition-shadow"
    >
      <div
        className="h-36"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      />
      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
          {course.category}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-navy leading-snug line-clamp-2">
          {course.title}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-navySoft">
          <Users size={13} />
          {course.students} students
        </div>
      </div>
    </Link>
  );
}

export default function BrowseCourses() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <h1 className="text-3xl font-bold text-navy">Browse Courses</h1>
          <p className="mt-1 text-navySoft">
            {DUMMY_COURSES.length} courses currently open for applications.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMMY_COURSES.map((course, i) => (
              <CourseCard key={course.id} course={course} theme={CATEGORY_THEMES[i % CATEGORY_THEMES.length]} />
            ))}
          </div>

          {DUMMY_COURSES.length === 0 && (
            <div className="text-center py-20 text-navySoft">No courses are open right now.</div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}