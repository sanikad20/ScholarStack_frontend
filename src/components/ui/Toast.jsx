// src/components/ui/Toast.jsx
import { useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-500 text-green-700"
      : type === "error"
      ? "bg-red-50 border-red-500 text-red-700"
      : "bg-blue-50 border-blue-500 text-blue-700";

  const Icon =
    type === "success" ? Check : type === "error" ? X : AlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg border-l-4 shadow-lg ${bgColor} transition-all duration-300 animate-in slide-in-from-top-5 max-w-sm`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;