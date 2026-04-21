"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { logAdminAction } from "@/lib/logAdminAction";
import { notifyUser } from "@/lib/notify";
import { calculateFraudScore } from "@/lib/fraudEngine";
import { createAlert } from "@/lib/createAlert";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    completionRate: 0,
    revenue: 0,
  });

  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [runnerStats, setRunnerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRunner, setSelectedRunner] = useState<any>(null);
  const [selectedErrand, setSelectedErrand] = useState<any>(null);
  const [runnerDetails, setRunnerDetails] = useState<any>(null);
  const [errandDetails, setErrandDetails] = useState<any>(null);

  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();

    const channel = supabase
      .channel("realtime-analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "errands" },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: errands } = await supabase
      .from("errands")
      .select("id, title, status, price, created_at, runner_id, client_name, pickup_location")
      .gte("created_at", since.toISOString());

    if (!errands) {
      setLoading(false);
      return;
    }

    // 🧠 FRAUD ANALYSIS PER RUNNER
    
    const runnerStatsMap: Record<string, any> = {};

    errands.forEach(e =>{
      if (!e.runner_id) return;

      if (!runnerStatsMap[e.runner_id]) {
        runnerStatsMap[e.runner_id] = {
            total: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
        };
      }

      const r = runnerStatsMap[e.runner_id];

      r.total++;

      if (e.status === "completed") r.completed++;
      if (e.status === "failed") r.failed++;
      if (e.status === "cancelled") r.cancelled++;
    });

    // 🚨 Evaluate each runner
    for (const runnerId in runnerStatsMap) {
        const stats = runnerStatsMap[runnerId];

        const fraudScore = calculateFraudScore({
            ...stats,
            recentJobs: stats.total,
        });

        // 💾 Save fraud score
        await supabase
          .from("users")
          .update({ fraud_score: fraudScore })
          .eq("id", runnerId);
        
        // 🚨 HIGH RISK ACTION
        if (fraudScore >= 70) {
          await supabase
            .from("users")
            .update({ status: "flagged"})
            .eq("id", runnerId);
          
          await createAlert({
            type: "fraud_detected",
            message: 'Runner ${runnerId} flagged (score: ${fraudScore})',
            severity: "high",
            metadata: { runnerId, fraudScore },
          });    
        } 

        // ⚠️ MEDIUM RISK ALERT
        else if (fraudScore >= 50) {
            await createAlert({
                type: "fraud_warning",
                message: 'Runner ${runnerId} showing suspicious activity (${fraudScore})',
                severity: "medium",
                metadata: { runnerId, fraudScore }, 
            });
        }
        
        let newTrust = 100 - fraudScore;

        if (stats.completed >= 10 && stats.failed === 0) {
            newTrust += 5;  // reward good runners
        }

        newTrust = Math.max(0, Math.min(100, newTrust));

        await supabase
          .from("users")
          .update({ trust_score: newTrust })
          .eq("id", runnerId);
    }

    const total = errands.length;
    const completed = errands.filter(e => e.status === "completed").length;

    const completionRate =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    const revenue = errands
      .filter(e => e.status === "completed")
      .reduce((sum, e) => sum + (e.price || 0), 0);

    // Revenue chart
    const revenueMap: Record<string, number> = {};

    errands.forEach(e => {
      if (e.status !== "completed") return;
      const day = new Date(e.created_at).toLocaleDateString();
      revenueMap[day] = (revenueMap[day] || 0) + (e.price || 0);
    });

    const revenueChartData = Object.keys(revenueMap).map(date => ({
      date,
      revenue: revenueMap[date],
    }));

    setRevenueChart(revenueChartData);

    // Alerts
    const newAlerts: string[] = [];

    if (completionRate < 60) newAlerts.push("⚠️ Low completion rate");
    if (revenue === 0) newAlerts.push("⚠️ No revenue");

    const failed = errands.filter(e => e.status === "failed").length;
    if (failed >= 5) newAlerts.push("🚨 High failed errands");

    setAlerts(newAlerts);

    // Runner ranking
    const runnerMap: Record<string, number> = {};

    errands.forEach(e => {
      if (e.status !== "completed" || !e.runner_id) return;
      runnerMap[e.runner_id] = (runnerMap[e.runner_id] || 0) + 1;
    });

    const ranked = Object.keys(runnerMap)
      .map(id => ({
        runner_id: id,
        completed: runnerMap[id],
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);

    setRunnerStats(ranked);

    setStats({
      total,
      completed,
      completionRate,
      revenue,
    });

    setLoading(false);
  };

  const fetchRunnerDetails = async (runnerId: string) => {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", runnerId)
      .single();

    const { data: errands } = await supabase
      .from("errands")
      .select("*")
      .eq("runner_id", runnerId);

    setRunnerDetails({ profile, errands });
  };

  const fetchErrandDetails = async (errandId: string) => {
    const { data } = await supabase
      .from("errands")
      .select("*")
      .eq("id", errandId)
      .single();

    setErrandDetails(data);
  };

  const exportCSV = () => {
    const rows = revenueChart.map(r => `${r.date},${r.revenue}`).join("\n");
    const blob = new Blob(["Date,Revenue\n" + rows]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Analytics</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {[7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded ${
              days === d ? "bg-black text-white" : "border"
            }`}
          >
            Last {d} days
          </button>
        ))}

        <button onClick={exportCSV} className="ml-auto border px-3 py-1 rounded">
          Export CSV
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total" value={stats.total} />
        <Card title="Completed" value={stats.completed} />
        <Card title="Completion %" value={`${stats.completionRate}%`} />
        <Card title="Revenue" value={`₦${stats.revenue}`} />
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className="p-3 bg-red-50 border rounded">
            {alert}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 border rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueChart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="revenue" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Runner Ranking */}
      <div className="border rounded-xl p-4">
        <h2 className="mb-2 font-medium">Top Runners</h2>

        {runnerStats.map((r, i) => (
          <div
            key={r.runner_id}
            className="flex justify-between text-sm py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
            onClick={() => {
              setSelectedRunner(r.runner_id);
              fetchRunnerDetails(r.runner_id);
            }}
          >
            <span>#{i + 1} {r.runner_id}</span>
            <span>{r.completed} jobs</span>
          </div>
        ))}
      </div>

      {/* Runner Modal */}
      {selectedRunner && runnerDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold">Runner Details</h2>

            <p><b>ID:</b> {runnerDetails.profile?.id}</p>
            <p><b>Status:</b> {runnerDetails.profile?.status}</p>
            <p><b>Trust Score:</b> {runnerDetails.profile?.trust_score}</p>

            {/* Admin Actions */}
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={async () =>{
                    const runnerId = runnerDetails.profile.id;

                    // 1. Update DB
                 const { error } = await supabase
                    .from("profiles")
                    .update({ status: "suspended" })
                    .eq("id", runnerId);

                 if (error) {
                    alert("Failed to suspend user");
                    return;
                 }   

                    // 2. Audit log 
                    await logAdminAction({
                        action: "suspend_user",
                        target_type: "runner",
                        target_id: runnerId,
                    });
                    
                    // 3. Notify runner
                    await notifyUser({
                        user_id: runnerId,
                        title: "Account Suspended",
                        message: "Your account has been suspended by admin.",
                    });

                    // 4. Refresh UI
                    fetchRunnerDetails(runnerId);
                }}
              >
                Suspend
              </button>

              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded"
                onClick={async () => {
                    const runnerId = runnerDetails.profile.id;

                    await supabase
                      .from("profiles")
                      .update({ status: "flagged" })
                      .eq("id", runnerId);

                    await logAdminAction({
                        action: "flag_user",
                        target_type: "runner",
                        target_id: runnerId,
                    });

                    await notifyUser({
                        user_id: runnerId,
                        title: "Account Flagged",
                        message: "Your account has been flagged. please review your activity",
                    });

                    fetchRunnerDetails(runnerId);
                }}
                >
                    Flag
                </button>

              <button
                className="px-3 py-1 border rounded"
                onClick={() => alert("Messaging coming next")}
              >
                Message
              </button>
            </div>

            <h3 className="font-medium mt-4">Recent Errands</h3>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {runnerDetails.errands?.slice(0, 5).map((e: any) => (
                <div
                  key={e.id}
                  className="border p-2 rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedErrand(e.id);
                    fetchErrandDetails(e.id);
                  }}
                >
                  {e.title} — {e.status}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedRunner(null)}
              className="mt-4 border px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Errand Modal */}
      {selectedErrand && errandDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold">Errand Details</h2>

            <p><b>Title:</b> {errandDetails.title}</p>
            <p><b>Status:</b> {errandDetails.status}</p>
            <p><b>Price:</b> ₦{errandDetails.price}</p>
            <p><b>Client:</b> {errandDetails.client_name}</p>
            <p><b>Location:</b> {errandDetails.pickup_location}</p>

            <button
              onClick={() => setSelectedErrand(null)}
              className="mt-4 border px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="p-4 rounded-xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}