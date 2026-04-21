"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // ✅ FIX 1
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; // ✅ FIX 2

type RunnerRisk = {
  id: string;
  name: string;
  risk_score: number;
  created_at: string;
};

export default function RiskPage() {
  const [data, setData] = useState<RunnerRisk[]>([]);

  useEffect(() => {
    fetchRisk();
  }, []);

  const fetchRisk = async () => {
    const { data, error } = await supabase
      .from("runner_risk_scores")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setData(data);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Risk Trend</h1>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="created_at" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="risk_score" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}