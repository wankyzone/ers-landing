"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setLogs(data || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Audit Logs</h1>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="border p-3 rounded">
            <p><b>Action:</b> {log.action}</p>
            <p><b>Target:</b> {log.target_type}</p>
            <p><b>ID:</b> {log.target_id}</p>
            <p className="text-xs text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}