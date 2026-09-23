"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useV2Theme } from "../ThemeProvider";

/**
 * Web port of gym-ios's AdminScreen.tsx, reusing the exact same backend
 * (/api/admin/users, /api/admin/users/:id) -- both already gated by
 * lib/requireAdmin.js server-side (404s for a signed-in non-admin, so
 * this page doesn't need its own auth logic beyond redirecting away
 * when that 404 comes back).
 *
 * Adds one section the mobile screen never had: "AI usage" (from the
 * new /api/admin/ai-usage endpoint), showing raw call counts for
 * photo scans / coach / voice / meal-plan across all users -- this is
 * what the mobile app was missing to actually see API spend creeping
 * up before the OpenAI bill arrives, since AdminScreen.tsx only ever
 * showed product analytics (signups/opens/regions), never usage.
 */

const REGION_FLAGS = {
  US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳", DE: "🇩🇪",
  FR: "🇫🇷", ES: "🇪🇸", IT: "🇮🇹", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴",
  NZ: "🇳🇿", IE: "🇮🇪", BR: "🇧🇷", MX: "🇲🇽", JP: "🇯🇵",
};

function timeAgo(iso) {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminPageV2() {
  const { status } = useSession();
  const router = useRouter();
  const { theme } = useV2Theme();
  const c = theme === "dark" ? DARK : LIGHT;

  const [tab, setTab] = useState("overview"); // "overview" | "users"
  const [usersData, setUsersData] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
  }, [status, router]);

  const load = async () => {
    setError("");
    try {
      const [usersRes, aiRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/ai-usage"),
      ]);
      if (usersRes.status === 404) {
        router.replace("/v2/home");
        return;
      }
      const usersJson = await usersRes.json();
      const aiJson = await aiRes.json();
      if (!usersRes.ok || !usersJson.success) {
        setError(usersJson.error || "Couldn't load admin data");
      } else {
        setUsersData(usersJson);
      }
      if (aiRes.ok && aiJson.success) setAiUsage(aiJson.data);
    } catch {
      setError("Couldn't load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return usersData.data;
    return usersData.data.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.region?.toLowerCase().includes(q),
    );
  }, [usersData, search]);

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div style={{ backgroundColor: c.bg, color: c.text }} className="min-h-screen pb-20 transition-colors">
      <div className="w-full max-w-md mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <Link href="/v2/home" style={{ color: c.textMuted }} className="text-xs">
              ← Back
            </Link>
            <p style={{ color: c.textMuted }} className="text-xs mt-1">
              Admin
            </p>
            <h1 className="text-[26px] font-extrabold tracking-tight -mt-0.5">Analytics</h1>
          </div>
          <button
            onClick={refresh}
            style={{ backgroundColor: c.surface, borderColor: c.border }}
            className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} style={{ color: c.textMuted }} />
          </button>
        </div>

        <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="flex border rounded-2xl p-1 mb-5">
          {["overview", "users"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={tab === t ? { backgroundColor: c.text, color: c.bg } : { color: c.textMuted }}
              className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p style={{ color: c.textMuted }} className="text-sm">
            Loading…
          </p>
        ) : tab === "overview" ? (
          <OverviewTab c={c} usersData={usersData} aiUsage={aiUsage} />
        ) : (
          <UsersTab
            c={c}
            search={search}
            setSearch={setSearch}
            users={filteredUsers}
            onSelect={setSelectedUser}
          />
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          c={c}
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDeleted={() => {
            setSelectedUser(null);
            load();
          }}
        />
      )}
    </div>
  );
}

const DARK = {
  bg: "#0a0a0a", surface: "#0f0f0f", surfaceAlt: "#1f1f1f",
  text: "#ffffff", textMuted: "#a1a1aa", textFaint: "#6b6b6b", border: "#2a2a2a",
};
const LIGHT = {
  bg: "#ececec", surface: "#f5f5f5", surfaceAlt: "#e2e2e5",
  text: "#0a0a0a", textMuted: "#6b7280", textFaint: "#9ca3af", border: "#d4d4d8",
};

function OverviewTab({ c, usersData, aiUsage }) {
  const totals = usersData?.totals || { users: 0, active7d: 0, opens: 0 };
  const maxDayCalls = aiUsage
    ? Math.max(1, ...aiUsage.last7Days.map((d) => d.photo + d.coach + d.voice + d["meal-plan"]))
    : 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2.5">
        <Metric c={c} label="USERS" value={totals.users} />
        <Metric c={c} label="ACTIVE 7D" value={totals.active7d} accent="#4ADE80" />
        <Metric c={c} label="OPENS" value={totals.opens} />
      </div>

      {/* AI usage -- not present in the mobile admin screen at all */}
      <Card c={c} title="AI usage" caption="Raw call counts, all users · last 7 days">
        {aiUsage ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
              <UsageStat c={c} label="Photo" value={aiUsage.today.photo} sub="today" />
              <UsageStat c={c} label="Coach" value={aiUsage.today.coach} sub="today" />
              <UsageStat c={c} label="Voice" value={aiUsage.today.voice} sub="today" />
              <UsageStat c={c} label="Plan" value={aiUsage.today["meal-plan"]} sub="today" />
            </div>
            <div className="flex items-end gap-1.5 h-16 mt-1">
              {aiUsage.last7Days.map((d) => {
                const total = d.photo + d.coach + d.voice + d["meal-plan"];
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ backgroundColor: c.text, height: `${Math.max(4, (total / maxDayCalls) * 56)}px` }}
                      className="w-full rounded-t-md transition-all"
                    />
                    <span style={{ color: c.textFaint }} className="text-[9px]">
                      {d.day.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ borderColor: c.border }} className="border-t pt-2.5 flex flex-col gap-1.5">
              <UsageRow c={c} label="Photo scans" data={aiUsage.totals.photo} />
              <UsageRow c={c} label="Coach chat" data={aiUsage.totals.coach} unit="tok" />
              <UsageRow c={c} label="Voice" data={aiUsage.totals.voice} unit="sec" />
              <UsageRow c={c} label="Meal plans" data={aiUsage.totals["meal-plan"]} />
            </div>
          </div>
        ) : (
          <p style={{ color: c.textMuted }} className="text-sm">
            No usage data.
          </p>
        )}
      </Card>
    </div>
  );
}

function Metric({ c, label, value, accent }) {
  return (
    <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="border rounded-2xl p-3">
      <p style={{ color: c.textMuted }} className="text-[10px] font-bold tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-extrabold tracking-tight mt-0.5" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );
}

function Card({ c, title, caption, children }) {
  return (
    <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="border rounded-2xl p-4">
      <p className="text-sm font-bold">{title}</p>
      {caption && (
        <p style={{ color: c.textMuted }} className="text-[11px] mt-0.5 mb-3">
          {caption}
        </p>
      )}
      {children}
    </div>
  );
}

function UsageStat({ c, label, value, sub }) {
  return (
    <div style={{ backgroundColor: c.surfaceAlt }} className="rounded-xl p-2.5 text-center">
      <p className="text-lg font-extrabold">{value ?? 0}</p>
      <p style={{ color: c.textFaint }} className="text-[9px] font-semibold uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function UsageRow({ c, label, data, unit }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: c.textMuted }}>{label}</span>
      <span className="font-semibold">
        {data.count} calls
        {data.units > 0 ? ` · ${data.units.toLocaleString()} ${unit || ""}`.trim() : ""}
        {data.users > 0 ? ` · ${data.users} users` : ""}
      </span>
    </div>
  );
}

function UsersTab({ c, search, setSearch, users, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="flex items-center gap-2 border rounded-2xl px-3.5 h-11">
        <Search size={15} style={{ color: c.textFaint }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email or region"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <p style={{ color: c.textMuted }} className="text-[11px] font-bold tracking-wide">
        {users.length} USER{users.length === 1 ? "" : "S"}
      </p>
      {users.length === 0 ? (
        <p style={{ color: c.textMuted }} className="text-sm">
          No users match.
        </p>
      ) : (
        <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="border rounded-2xl overflow-hidden">
          {users.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onSelect(u.id)}
              style={i > 0 ? { borderTopColor: c.border } : undefined}
              className={`w-full flex items-center gap-3 p-3.5 text-left ${i > 0 ? "border-t" : ""}`}
            >
              <span className="text-lg flex-shrink-0">{REGION_FLAGS[u.region] || "🌐"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.name || "—"}</p>
                <p style={{ color: c.textFaint }} className="text-xs truncate">
                  {u.email}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold">{u.opens} opens</p>
                <p style={{ color: c.textFaint }} className="text-[10px]">
                  {timeAgo(u.lastSeenAt)}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: c.textFaint }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserDetailModal({ c, userId, onClose, onDeleted }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setData(json.data);
        else setError(json?.error || "Couldn't load user");
      })
      .catch(() => setError("Couldn't load user"));
  }, [userId]);

  const del = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't delete");
        setDeleting(false);
        return;
      }
      onDeleted();
    } catch {
      setError("Couldn't delete");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div style={{ backgroundColor: c.bg, color: c.text }} className="w-full sm:max-w-sm p-6 max-h-[85vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold">User detail</p>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!data ? (
          <p style={{ color: c.textMuted }} className="text-sm">
            {error || "Loading…"}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{REGION_FLAGS[data.region] || "🌐"}</span>
                <p className="text-lg font-bold">{data.name || "—"}</p>
                {data.isSubscribed && (
                  <span style={{ backgroundColor: c.surfaceAlt }} className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </div>
              <p style={{ color: c.textMuted }} className="text-sm">
                {data.email}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Fact c={c} label="User ID" value={data.id} mono />
              <Fact c={c} label="Region" value={data.region || "—"} />
              <Fact c={c} label="Joined" value={data.joinedAt ? new Date(data.joinedAt).toLocaleDateString() : "—"} />
              <Fact c={c} label="App opens" value={data.opens} />
              <Fact c={c} label="Goal" value={data.fitnessGoal || "—"} />
              <Fact c={c} label="Experience" value={data.experienceLevel || "—"} />
            </div>

            {data.screens?.length > 0 && (
              <div>
                <p style={{ color: c.textMuted }} className="text-[11px] font-bold tracking-wide mb-2">
                  SCREENS
                </p>
                <div className="flex flex-col gap-1.5">
                  {data.screens.slice(0, 8).map((s) => (
                    <div key={s.screen} className="flex items-center justify-between text-xs">
                      <span style={{ color: c.textMuted }}>{s.screen}</span>
                      <span className="font-semibold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div style={{ borderColor: c.border }} className="border-t pt-4">
              <p className="text-[11px] font-bold tracking-wide text-red-500 mb-2">DANGER ZONE</p>
              <button
                onClick={del}
                disabled={deleting}
                className={`w-full py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  confirmDelete ? "bg-red-500 text-white" : "border border-red-500/30 text-red-500"
                } disabled:opacity-40`}
              >
                <span className="inline-flex items-center gap-1.5 justify-center">
                  <Trash2 size={14} />
                  {deleting ? "Deleting…" : confirmDelete ? "Tap again to confirm — permanent" : "Delete user"}
                </span>
              </button>
              {confirmDelete && !deleting && (
                <button onClick={() => setConfirmDelete(false)} style={{ color: c.textMuted }} className="w-full text-xs mt-2">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ c, label, value, mono }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: c.textMuted }}>{label}</span>
      <span className={`font-semibold ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
    </div>
  );
}
