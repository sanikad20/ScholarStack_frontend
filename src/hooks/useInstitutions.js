// src/hooks/useInstitutions.js
import { useEffect, useState } from "react";
import api from "../api/axios";

/**
 * Fetches the public institutions list.
 * Backed by: GET /api/institutions/public
 * Returns up to 8 active institutions, plus the total count.
 */
export default function useInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  useEffect(() => {
    let cancelled = false;

    api
      .get("/institutions/public") // ✅ updated endpoint
      .then((res) => {
        if (cancelled) return;

        // Response shape: { success: true, data: [...], totalCount: N }
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const count = typeof res.data?.totalCount === "number" ? res.data.totalCount : list.length;

        setInstitutions(list);
        setTotalCount(count);
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

  return { institutions, totalCount, status };
}