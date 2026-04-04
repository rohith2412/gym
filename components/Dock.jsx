"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    id:    "reps",
    label: "Reps",
    href:  "/v1/tracking",
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#1a1a1a" : "#aaa"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
      </svg>
    ),
  },
  {
    id:    "trainer",
    label: "AI Trainer",
    href:  "/v1/ai-trainer",
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#1a1a1a" : "#aaa"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id:    "recipes",
    label: "Recipes",
    href:  "/v1/recipes",
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#1a1a1a" : "#aaa"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    ),
  },
  {
    id:    "scanner",
    label: "Scanner",
    href:  "/v1/caloriesAI",
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#1a1a1a" : "#aaa"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
];

export default function Dock() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <>
      {/* Spacer so page content doesn't hide behind the dock */}
      <div style={{ height: 80 }} />

      <div style={{
        position:   "fixed",
        bottom:     0,
        left:       "50%",
        transform:  "translateX(-50%)",
        width:      "100%",
        maxWidth:   430,
        zIndex:     50,
        padding:    "0 1rem 0.75rem",
        background: "transparent",
      }}>
        <nav style={{
          background:   "rgba(250,250,248,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border:       "1px solid #e8e5de",
          borderRadius: 22,
          padding:      "10px 8px 8px",
          display:      "flex",
          justifyContent: "space-around",
          alignItems:   "center",
          boxShadow:    "0 4px 24px rgba(0,0,0,0.07)",
          fontFamily:   "'Plus Jakarta Sans', sans-serif",
        }}>
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            5,
                  padding:        "6px 16px",
                  borderRadius:   12,
                  border:         "none",
                  background:     active ? "#f0ede8" : "transparent",
                  cursor:         "pointer",
                  fontFamily:     "inherit",
                  transition:     "background 0.12s",
                }}
              >
                {tab.icon(active)}
                <span style={{
                  fontSize:   11,
                  fontWeight: active ? 700 : 400,
                  color:      active ? "#1a1a1a" : "#aaa",
                  transition: "color 0.12s",
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}