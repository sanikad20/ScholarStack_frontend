import { useEffect, useState } from "react";
import { getMyApplications } from "../api/applications.api";

/**
 * Fetches the logged-in student's applications.
 * Backed by: GET /api/applications/my (studentOnly, requires auth)
 *
 * Note: all applications returned belong to the SAME institution —
 * a student's account is scoped to one tenant on the backend, so there's
 * no per-application institution to display.
 */
export default function useApplications() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  useEffect(() => {
    let cancelled = false;

    getMyApplications()
      .then((res) => {
        if (cancelled) return;
        setApplications(res.data?.data ?? []);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { applications, status };
}