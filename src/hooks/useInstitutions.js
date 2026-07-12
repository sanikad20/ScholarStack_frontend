import { useEffect, useState } from "react";
import api from "../api/axios";

/**
 * Fetches the public institutions list.
 * Backed by: GET /api/institutions
 */
export default function useInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  useEffect(() => {
    let cancelled = false;

    api
      .get("/institutions")
      .then((res) => {
        if (cancelled) return;
        // Adjust this line once the real response shape is confirmed —
        // assuming either a plain array or { data: [...] }.
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setInstitutions(list);
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

  return { institutions, status };
}
