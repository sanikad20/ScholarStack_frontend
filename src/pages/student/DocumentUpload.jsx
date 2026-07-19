import { useState } from "react";
import { Upload, FileText, CheckSquare, Square } from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

const CHECKLIST = [
  { label: "12th Marksheet", done: true },
  { label: "Government ID proof", done: true },
  { label: "Passport-size photo", done: false },
  { label: "Category certificate (if applicable)", done: false },
];

const UPLOADED_DOCS = [
  { name: "12th Marksheet", status: "Verified" },
  { name: "Government ID proof", status: "Verified" },
];

export default function DocumentUpload() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex gap-12">
            {/* LEFT */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-navy mb-1">Upload Documents</h2>
              <p className="text-sm text-navySoft mb-6">
                B.Tech Computer Science · Riverside Polytechnic
              </p>

              <p className="text-sm font-medium text-navy mb-3">Upload a new document</p>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${
                  dragOver ? "border-accent bg-accent/5" : "border-gray-300 bg-white"
                }`}
                style={{ minHeight: 160 }}
              >
                <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
                  <Upload size={20} className="text-blue" />
                </div>
                <p className="text-xs text-navySoft text-center leading-relaxed">
                  Upload your course Thumbnail here.{" "}
                  <span className="font-semibold text-navy">Important guidelines:</span>
                  <br />
                  1200×800 pixels or 12:8 Ratio. Supported format: jpg, jpeg, or png
                </p>
                <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-medium text-navy cursor-pointer hover:bg-gray-50 transition bg-white">
                  <Upload size={14} className="text-accent" />
                  Upload File
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>

              {/* Uploaded Documents */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-navy mb-4">Uploaded Documents</h3>
                <div className="flex flex-col gap-3">
                  {UPLOADED_DOCS.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between border border-black/10 rounded-xl px-5 py-4 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                          <FileText size={18} className="text-gold" />
                        </div>
                        <span className="text-sm font-medium text-navy">{doc.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-white bg-accent rounded-full px-4 py-1">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Checklist */}
            <div className="w-64 shrink-0">
              <h3 className="text-base font-semibold text-navy mb-4">Checklist</h3>
              <div className="flex flex-col gap-4">
                {CHECKLIST.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckSquare size={22} className="text-gold shrink-0" />
                    ) : (
                      <Square size={22} className="text-gold/40 shrink-0" />
                    )}
                    <span className="text-sm text-navy">{item.label}</span>
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