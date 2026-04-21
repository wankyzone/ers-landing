"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_alerts" },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("admin_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    setAlerts(data || []);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">System Alerts</h1>

      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded border ${
            alert.severity === "high"
              ? "bg-red-50"
              : "bg-yellow-50"
          }`}
        >
          <p className="font-medium">{alert.message}</p>
          <p className="text-xs text-gray-500">
            {new Date(alert.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}