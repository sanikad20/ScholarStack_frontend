import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

export default function Profile() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-navy mb-6">Personal details</h2>

          <div className="mb-4">
            <label className="text-sm text-navySoft mb-1.5 block">Full Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                defaultValue="Ananya"
                className="flex-1 border border-black/10 rounded-lg px-4 py-2.5 text-sm text-navy outline-none focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="text"
                defaultValue="Sharma"
                className="flex-1 border border-black/10 rounded-lg px-4 py-2.5 text-sm text-navy outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-navySoft mb-1.5 block">Email</label>
            <input
              type="text"
              defaultValue="ananya.sharma@email.com"
              className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm text-navy outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-navySoft mb-1.5 block">Phone Number</label>
            <input
              type="text"
              defaultValue="+91 98765 43210"
              className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm text-navy outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <button className="bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-dark transition mb-10">
            Save Changes
          </button>

          <h2 className="text-2xl font-bold text-navy mb-6">Change password</h2>

          {[
            { label: "Current Password", show: showCurrent, toggle: () => setShowCurrent(!showCurrent), placeholder: "Password" },
            { label: "New Password", show: showNew, toggle: () => setShowNew(!showNew), placeholder: "Password" },
            { label: "Confirm Password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm), placeholder: "Confirm new password" },
          ].map((field) => (
            <div key={field.label} className="mb-4">
              <label className="text-sm text-navySoft mb-1.5 block">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? "text" : "password"}
                  placeholder={field.placeholder}
                  className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm text-navy outline-none focus:ring-2 focus:ring-accent/20 pr-11"
                />
                <button
                  onClick={field.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition"
                >
                  {field.show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          ))}

          <button className="bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-dark transition mt-2">
            Change Password
          </button>
        </main>
      </div>

      <Footer />
    </div>
  );
}