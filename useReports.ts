import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { SafetyReport } from "../types";
import { SEED_REPORTS } from "../utils/seedData";

export function useReports() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "reports");
    const q = query(col, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // Seed data on first load
        for (const report of SEED_REPORTS) {
          await addDoc(col, { ...report, createdAt: serverTimestamp() });
        }
        return;
      }

      const data: SafetyReport[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString?.() ??
          doc.data().createdAt ??
          new Date().toISOString(),
      })) as SafetyReport[];

      setReports(data);
      setLoading(false);
    });

    return unsub;
  }, []);

  const addReport = async (report: Omit<SafetyReport, "id" | "createdAt">) => {
    await addDoc(collection(db, "reports"), {
      ...report,
      createdAt: serverTimestamp(),
    });
  };

  const checkSeeded = async () => {
    const snap = await getDocs(collection(db, "reports"));
    return !snap.empty;
  };

  return { reports, loading, addReport, checkSeeded };
}
