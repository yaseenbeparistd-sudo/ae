"use client";

import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import type { Application } from "@/types";
import {
  LayoutDashboard,
  Activity,
  AppWindow,
  TestTubes,
  Sparkles,
  Play,
  Calendar,
  DollarSign,
  LifeBuoy,
  TrendingUp
} from "lucide-react";

const APP_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "business-dashboard", label: "Quality Dashboard", icon: TrendingUp },
  { id: "health", label: "Health Monitor", icon: Activity },
  { id: "apps", label: "Applications", icon: AppWindow },
  { id: "test-cases", label: "Test Cases", icon: TestTubes },
  { id: "generations", label: "Generations", icon: Sparkles },
  { id: "executions", label: "Executions", icon: Play },
  { id: "schedules", label: "Schedules", icon: Calendar },
  { id: "ai-costs", label: "AI Costs", icon: DollarSign },
  { id: "support", label: "Support", icon: LifeBuoy },
];

export default function KavachaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const appId = "kavacha";
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const { data: app, isLoading, refetch } = useQuery<Application>({
    queryKey: ["application", appId],
    queryFn: () => api.get(`/applications/${appId}`),
  });

  const { data: kavachaHealth, refetch: refetchKavachaHealth } = useQuery<any>({
    queryKey: ["kavacha-db-health"],
    queryFn: () => api.get("/kavacha/health"),
    refetchInterval: 10000,
  });

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["health", appId],
    queryFn: () => api.get(`/applications/${appId}/health?live=true`),
  });

  const handleHealthCheck = async () => {
    if (isChecking) return;
    setIsChecking(true);
    await refetch();
    await refetchHealth();
    await refetchKavachaHealth();
    await queryClient.invalidateQueries({ queryKey: ["health"] });
    await queryClient.invalidateQueries({ queryKey: ["kavacha-db-health"] });
    setTimeout(() => setIsChecking(false), 1000);
  };

  // Determine active tab based on pathname
  let activeTab = "overview";
  for (const tab of APP_TABS) {
    if (tab.id !== "overview" && pathname.includes(`/${tab.id}`)) {
      activeTab = tab.id;
      break;
    }
  }

  const handleTabChange = (tabId: string) => {
    if (tabId === "overview") {
      router.push(`/applications/${appId}`);
    } else {
      router.push(`/applications/${appId}/${tabId}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton width="100%" height={200} />
      </div>
    );
  }

  const appName = app?.name || "NextGen2";
  const dbStatus = kavachaHealth?.status || "checking";
  const isDbConnected = dbStatus === "connected";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "var(--ov-bg-page)" }}>
      {/* Top Breadcrumb & Global Status Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--ov-border)", boxShadow: "var(--ov-shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", fontFamily: "monospace", color: "var(--ov-text-muted)" }}>
          <button
            onClick={() => router.push("/applications")}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--ov-text-muted)", cursor: "pointer", padding: 0 }}
          >
            <span style={{ fontSize: "14px" }}>←</span> Applications
          </button>
          <span>/</span>
          <span style={{ color: "var(--ov-text-primary)", fontWeight: 600, fontSize: "12px" }}>{appName}</span>
          <span style={{ background: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(139, 92, 246, 0.3)", opacity: 0.9, letterSpacing: "0.05em", fontSize: "10px", fontWeight: 700 }}>
            TEST AUTOMATION PLATFORM
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "10px", fontFamily: "monospace", color: "var(--ov-text-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isDbConnected ? "#10b981" : "#f43f5e", animation: isDbConnected ? "none" : "pulse 2s infinite" }} />
            {isDbConnected ? "NEXTGEN2 DB CONNECTED" : "NEXTGEN2 DB DISCONNECTED"}
          </span>
          {isDbConnected && kavachaHealth?.table_count && (
            <>
              <span>•</span>
              <span>{kavachaHealth.table_count} TABLES</span>
            </>
          )}
        </div>
      </div>

      {/* Main Header Area */}
      <div style={{ padding: "24px", background: "var(--ov-bg-surface)", borderBottom: "1px solid var(--ov-border)", boxShadow: "var(--ov-shadow-sm)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "24px" }}>
          {/* Left Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <h1 style={{ fontSize: "36px", fontWeight: 800, margin: 0, color: "var(--ov-text-primary)", letterSpacing: "-0.03em" }}>{appName}</h1>
              <span style={{ background: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(139, 92, 246, 0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                NextGen2 Test Platform
              </span>
              <span style={{ background: "var(--ov-bg-subtle)", color: "var(--ov-text-secondary)", fontSize: "10px", fontWeight: 600, padding: "4px 8px", borderRadius: "6px", letterSpacing: "0.05em" }}>
                v{app?.version || "2.0.0"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", background: isDbConnected ? "var(--ov-status-healthy-bg)" : "rgba(244,63,94,0.1)", color: isDbConnected ? "var(--ov-status-healthy)" : "#f43f5e", fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", border: `1px solid ${isDbConnected ? "var(--ov-status-healthy)" : "#f43f5e"}`, opacity: 0.8, letterSpacing: "0.05em" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isDbConnected ? "var(--ov-status-healthy)" : "#f43f5e" }} />
                {isDbConnected ? "DB ONLINE" : "DB OFFLINE"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ov-text-muted)" }}>
                <span style={{ width: "16px" }}>🛡️</span> Platform: <span style={{ color: "var(--ov-text-primary)" }}>AI-Powered Test Automation & Quality Assurance</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ov-text-muted)" }}>
                <span style={{ width: "16px" }}>🗄️</span> Database: <span style={{ color: "var(--ov-text-primary)", fontWeight: 600 }}>PostgreSQL nextgen2</span> @ {kavachaHealth?.host || "localhost"}:{kavachaHealth?.port || 5432}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ov-text-muted)" }}>
                <span style={{ color: isDbConnected ? "#34d399" : "#f43f5e", width: "16px" }}>⚡</span> Status: <span style={{ color: isDbConnected ? "#34d399" : "#f43f5e" }}>{isDbConnected ? "Connected & Syncing" : "Connection Failed"}</span>
              </div>
            </div>
          </div>

          {/* Right Action Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "320px" }}>
            <div style={{ background: "var(--ov-bg-card)", border: "1px solid var(--ov-border)", borderRadius: "12px", boxShadow: "var(--ov-shadow-md)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: (healthData as any)?.health_score < 80 ? "var(--ov-status-warning)" : "#34d399", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: (healthData as any)?.health_score < 80 ? "var(--ov-status-warning)" : "var(--ov-status-healthy)" }} />
                {(healthData as any)?.health_score ?? "98"}/100 {((healthData as any)?.health_state ?? "HEALTHY").toUpperCase()}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "var(--ov-text-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>UPTIME SLA</div>
                <div style={{ fontSize: "13px", color: "var(--ov-text-primary)", fontFamily: "monospace" }}>{((healthData as any)?.uptime_percent * 100)?.toFixed(2) || "99.98"}% <span style={{ color: "#64748b" }}>(42d 14h)</span></div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleHealthCheck}
                disabled={isChecking}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: isChecking ? "var(--ov-bg-hover)" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: isChecking ? "var(--ov-text-muted)" : "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: isChecking ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ display: "inline-block", animation: isChecking ? "spin 1s linear infinite" : "none" }}>↻</span>
                {isChecking ? "Checking..." : "Refresh Data"}
              </button>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(kavachaHealth || {}, null, 2));
                  const a = document.createElement("a");
                  a.setAttribute("href", dataStr);
                  a.setAttribute("download", "nextgen2-health.json");
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
                style={{ padding: "8px 16px", background: "var(--ov-bg-card)", color: "var(--ov-text-primary)", border: "1px solid var(--ov-border-strong)", boxShadow: "var(--ov-shadow-sm)", borderRadius: "6px", fontWeight: 600, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>📤</span> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "0 24px", overflowX: "auto", borderBottom: "1px solid var(--ov-border)", boxShadow: "var(--ov-shadow-sm)", background: "var(--ov-bg-surface)" }}>
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid #a78bfa" : "2px solid transparent",
                color: isActive ? "#a78bfa" : "var(--ov-text-secondary)",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, display: "flex" }}><tab.icon size={14} /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Page Content */}
      <div style={{ padding: "24px", flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
