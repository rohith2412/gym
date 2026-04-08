"use client";

import { useSession }    from "next-auth/react";
import { useRouter }     from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import ProfilePicture    from "@/components/ProfilePicture";
import PaywallOverlay from "@/components/PaywallOverlay";

// ─── Constants ──────────────────────────────────────────────────────────────── save. edit

{/* <div onClick={onClose} style={{ ..., zIndex:40, ... }} />
<div style={{ ..., zIndex:50, ... }}></div> */}


const EQUIPMENT_OPTIONS = [
  "Full gym","Dumbbells only","Barbell & rack","Resistance bands",
  "Bodyweight only","Kettlebells","Cable machine","Home gym",
];
const FOCUS_OPTIONS = [
  "Chest","Back","Shoulders","Arms","Legs","Glutes",
  "Core","Full body","Upper body","Lower body",
];
const SESSION_LENGTHS = ["30","45","60","75","90"];
const QUICK_PROMPTS = [
  "How do I break through a bench press plateau?",
  "What should I eat before and after training?",
  "How many rest days do I actually need?",
  "Should I do cardio on rest days?",
  "How do I improve my squat form?",
  "What supplements are actually worth it?",
  "How do I build a bigger back?",
  "How do I lose fat without losing muscle?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
function muscleColor(mg = "") {
  const map = {
    chest:"#ff6b35",back:"#6366f1",shoulders:"#f59e0b",
    arms:"#ec4899",legs:"#22c55e",core:"#14b8a6",
    glutes:"#8b5cf6",cardio:"#ef4444",
  };
  const key = mg.toLowerCase().split(/[\s,&]/)[0];
  return map[key] || "#aaa";
}
function difficultyColor(d = "") {
  return { Beginner:"#22c55e", Intermediate:"#f59e0b", Advanced:"#ef4444" }[d] || "#aaa";
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:"#fff", border:"1px solid #e8e5de",
      borderRadius:20, padding:"1.25rem",
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
      cursor:onClick?"pointer":undefined, ...style,
    }}>{children}</div>
  );
}
function Label({ children, style={} }) {
  return <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#aaa", marginBottom:"0.5rem", ...style }}>{children}</p>;
}
function Skeleton({ height=80 }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e5de", borderRadius:20, height, overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent 0%,rgba(232,229,222,0.5) 50%,transparent 100%)", animation:"shimmer 1.4s infinite" }} />
    </div>
  );
}
function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink:0, padding:"0.35rem 0.8rem", borderRadius:99,
      fontSize:12, fontWeight:600, cursor:"pointer",
      fontFamily:"inherit", whiteSpace:"nowrap",
      border: active ? "none" : "1px solid #e8e5de",
      background: active ? "#1a1a1a" : "#fff",
      color: active ? "#fff" : "#555",
      transition:"all 0.12s",
    }}>{label}</button>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ ex, index }) {
  const [open, setOpen] = useState(false);
  const color = muscleColor(ex.muscleGroup);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background:"#fff", border:"1px solid #e8e5de", borderRadius:16,
        overflow:"hidden", cursor:"pointer",
        boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0.8rem 1rem" }}>
        <div style={{
          width:30, height:30, borderRadius:9, flexShrink:0,
          background: open ? "#1a1a1a" : "#f4f2ed",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:800, color: open ? "#fff" : "#aaa",
        }}>{index + 1}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ex.name}</p>
          <p style={{ fontSize:10, color:"#aaa", marginTop:1 }}>{ex.muscleGroup}</p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ fontSize:13, fontWeight:800, color:"#1a1a1a" }}>{ex.sets} × {ex.reps}</p>
          <p style={{ fontSize:10, color:"#bbb" }}>rest {ex.rest}</p>
        </div>
        <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
      </div>
      {open && (
        <div style={{ borderTop:"1px solid #f0ede8", padding:"0.75rem 1rem", background:"#fafaf8" }}>
          {ex.tempo && (
            <div style={{ display:"flex", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#bbb", textTransform:"uppercase", letterSpacing:"0.08em" }}>Tempo</span>
              <span style={{ fontSize:11, fontWeight:700, color:"#ff6b35", background:"rgba(255,107,53,0.08)", borderRadius:6, padding:"0.1rem 0.4rem" }}>{ex.tempo}</span>
            </div>
          )}
          {ex.notes && <p style={{ fontSize:12, color:"#666", lineHeight:1.6 }}>💡 {ex.notes}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({ day, index }) {
  const [open, setOpen] = useState(index === 0 && !day.restDay);

  if (day.restDay) {
    return (
      <div style={{
        display:"flex", alignItems:"center", gap:12, padding:"0.85rem 1rem",
        background:"#fff", border:"1px solid #e8e5de", borderRadius:16,
        boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
      }}>
        <div style={{ width:38, height:38, borderRadius:12, background:"#f4f2ed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>😴</div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>{day.day}</p>
          <p style={{ fontSize:11, color:"#bbb" }}>Rest & Recovery</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#fff", border:"1px solid #e8e5de", borderRadius:20, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:12, padding:"1rem 1.1rem", cursor:"pointer" }}
      >
        <div style={{
          width:44, height:44, borderRadius:13, flexShrink:0,
          background: open ? "#1a1a1a" : "#f4f2ed",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:7, fontWeight:800, color: open ? "rgba(255,255,255,0.45)" : "#ccc", letterSpacing:"0.06em" }}>
            {day.day.slice(0,3).toUpperCase()}
          </span>
          <span style={{ fontSize:16, fontWeight:800, color: open ? "#fff" : "#1a1a1a" }}>{index + 1}</span>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.02em" }}>{day.label}</p>
          <p style={{ fontSize:11, color:"#aaa", marginTop:2 }}>
            {day.exercises?.length} exercises · {day.estimatedTime}min
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#ff6b35", background:"rgba(255,107,53,0.08)", borderRadius:99, padding:"0.2rem 0.5rem" }}>
            {day.focus}
          </span>
          <span style={{ fontSize:14, color:"#ccc", transform: open ? "rotate(90deg)" : "none", transition:"transform 0.2s", display:"inline-block" }}>›</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop:"1px solid #f0ede8", padding:"0.75rem 1rem 1rem", animation:"fadeIn 0.2s ease" }}>
          {day.warmup && (
            <div style={{ background:"rgba(255,107,53,0.05)", border:"1px solid rgba(255,107,53,0.12)", borderRadius:12, padding:"0.6rem 0.8rem", marginBottom:10 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#ff6b35", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>🔥 Warmup</p>
              <p style={{ fontSize:12, color:"#666", lineHeight:1.5 }}>{day.warmup}</p>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
            {day.exercises?.map((ex, i) => <ExerciseCard key={i} ex={ex} index={i} />)}
          </div>
          {day.cooldown && (
            <div style={{ background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:12, padding:"0.6rem 0.8rem" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>🧘 Cooldown</p>
              <p style={{ fontSize:12, color:"#666", lineHeight:1.5 }}>{day.cooldown}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Plan View ────────────────────────────────────────────────────────────────
function PlanView({ plan, onRegen, isLoading, onBack, onSave, isSaved, saving }) {
  const [tab, setTab] = useState("schedule");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeIn 0.4s ease" }}>

      {/* Action row */}
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onBack} style={{ flex:1, padding:"0.7rem", background:"#fff", border:"1px solid #e8e5de", borderRadius:12, fontSize:13, fontWeight:700, color:"#1a1a1a", fontFamily:"inherit", cursor:"pointer" }}>← Edit</button>
        <button onClick={onRegen} disabled={isLoading} style={{ flex:1, padding:"0.7rem", background:"#fff", border:"1px solid #e8e5de", borderRadius:12, fontSize:13, fontWeight:700, color:"#ff6b35", fontFamily:"inherit", cursor:"pointer", opacity:isLoading?0.5:1 }}>
          {isLoading ? "…" : "🔄 Regenerate"}
        </button>
        {/* Save button - only shown when plan is not yet saved */}
        {!isSaved ? (
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              flex:1, padding:"0.7rem", borderRadius:12, fontSize:13, fontWeight:700,
              fontFamily:"inherit", cursor: saving ? "not-allowed" : "pointer",
              border:"none",
              background: "#e55a25",
              color:"#fff", opacity: saving ? 0.7 : 1,
              display:"flex", alignItems:"center", justifyContent:"center", gap:5,


            }}
          >
            {saving ? (
              <>
                <span style={{ width:11, height:11, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                Saving
              </>
            ) : "💾 Save"}
          </button>
        ) : (
          <div style={{
            flex:1, padding:"0.7rem", borderRadius:12, fontSize:13, fontWeight:700,
            background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)",
            color:"#22c55e", display:"flex", alignItems:"center", justifyContent:"center", gap:4,
          }}>
            ✓ Saved
          </div>
        )}
      </div>

      {/* Plan header zIndex:9998, backdropFilter */}
      <Card style={{ background:"#1a1a1a" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Your Plan</p>
            <h2 style={{ fontSize:19, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.2 }}>{plan.planTitle}</h2>
          </div>
          <span style={{
            fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
            color: difficultyColor(plan.difficulty),
            background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"0.25rem 0.6rem", flexShrink:0,
          }}>{plan.difficulty}</span>
        </div>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, marginBottom:12 }}>{plan.planSummary}</p>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"0.3rem 0.7rem" }}>
            📅 {plan.weeklyVolume}
          </span>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#f4f2ed", borderRadius:14, padding:4, gap:4 }}>
        {[["schedule","📅 Schedule"],["tips","💡 Tips & Nutrition"]].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex:1, padding:"0.6rem", borderRadius:10, border:"none",
            background: tab===key ? "#fff" : "transparent",
            fontSize:12, fontWeight:700, color: tab===key ? "#1a1a1a" : "#aaa",
            fontFamily:"inherit", cursor:"pointer",
            boxShadow: tab===key ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
          }}>{label}</button>
        ))}
      </div>

      {tab === "schedule" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, animation:"fadeIn 0.2s ease" }}>
          {plan.days?.map((day, i) => <DayCard key={i} day={day} index={i} />)}
        </div>
      )}

      {tab === "tips" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeIn 0.2s ease" }}>
          {plan.weeklyGoals?.length > 0 && (
            <Card>
              <p style={{ fontSize:12, fontWeight:700, color:"#ff6b35", marginBottom:10 }}>🎯 Weekly goals</p>
              {plan.weeklyGoals.map((g,i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ width:20, height:20, borderRadius:6, background:"#f4f2ed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#aaa", flexShrink:0 }}>{i+1}</div>
                  <p style={{ fontSize:13, color:"#1a1a1a", lineHeight:1.5 }}>{g}</p>
                </div>
              ))}
            </Card>
          )}
          {plan.progressionTips?.length > 0 && (
            <Card>
              <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", marginBottom:10 }}>📈 Progression</p>
              {plan.progressionTips.map((t,i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>⚡</span>
                  <p style={{ fontSize:13, color:"#555", lineHeight:1.5 }}>{t}</p>
                </div>
              ))}
            </Card>
          )}
          {plan.nutritionTips?.length > 0 && (
            <Card>
              <p style={{ fontSize:12, fontWeight:700, color:"#22c55e", marginBottom:10 }}>🥗 Nutrition</p>
              {plan.nutritionTips.map((t,i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>🌿</span>
                  <p style={{ fontSize:13, color:"#555", lineHeight:1.5 }}>{t}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Saved Plan Card ──────────────────────────────────────────────────────────
function SavedPlanCard({ saved, onView, onRemove, removing }) {
  return (
    <Card style={{ padding:"1rem 1.1rem" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <span style={{
              fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
              color: difficultyColor(saved.plan.difficulty),
              background: saved.plan.difficulty === "Beginner" ? "rgba(34,197,94,0.1)"
                        : saved.plan.difficulty === "Advanced"  ? "rgba(239,68,68,0.1)"
                        : "rgba(245,158,11,0.1)",
              borderRadius:99, padding:"0.15rem 0.5rem",
            }}>{saved.plan.difficulty}</span>
            <span style={{ fontSize:11, color:"#bbb" }}>{fmtDate(saved.savedAt)}</span>
          </div>
          <p style={{ fontSize:14, fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.02em", lineHeight:1.3, marginBottom:3 }}>{saved.plan.planTitle}</p>
          <p style={{ fontSize:11, color:"#aaa" }}>{saved.plan.weeklyVolume}</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:7, marginTop:12 }}>
        <button
          onClick={() => onView(saved)}
          style={{
            flex:1, padding:"0.6rem", background:"#1a1a1a", color:"#fff",
            border:"none", borderRadius:11, fontSize:12, fontWeight:700,
            fontFamily:"inherit", cursor:"pointer",
          }}
        >View Plan</button>
        <button
          onClick={() => onRemove(saved._id)}
          disabled={removing}
          style={{
            padding:"0.6rem 0.9rem", background:"rgba(239,68,68,0.08)",
            color:"#ef4444", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:11, fontSize:12, fontWeight:700,
            fontFamily:"inherit", cursor: removing ? "not-allowed" : "pointer",
            opacity: removing ? 0.5 : 1,
          }}
        >{removing ? "…" : "🗑 Remove"}</button>
      </div>
    </Card>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────
function ChatView({ extra, intro }) {
  const [messages, setMessages] = useState([
    {
      role:"assistant",
      content: intro
        ? `Hey! I'm your AI trainer. I can see you're ${intro.age ? `${intro.age} years old` : "getting started"} and your goal is ${intro.fitnessGoal || "to improve your fitness"}. What do you want to work on today?`
        : "Hey! I'm your AI personal trainer. Ask me anything about training, nutrition, recovery or technique - I'm here to help.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role:"user", content:msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res  = await fetch("/api/ai-trainer", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ type:"chat", extra, messages: newMessages }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => [...prev, { role:"assistant", content:json.data.reply }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role:"assistant", content:"Sorry, I had a connection issue. Try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - 160px)", minHeight:400 }}>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:8, WebkitOverflowScrolling:"touch" }}>
        {messages.length <= 1 && (
          <div style={{ marginBottom:8 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:8 }}>Quick questions</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => send(q)} style={{ textAlign:"left", padding:"0.75rem 1rem", background:"#fff", border:"1px solid #e8e5de", borderRadius:14, fontSize:13, fontWeight:500, color:"#1a1a1a", fontFamily:"inherit", cursor:"pointer", lineHeight:1.4 }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width:28, height:28, borderRadius:9, background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, marginRight:8, marginTop:2 }}>🤖</div>
            )}
            <div style={{
              maxWidth:"80%", padding:"0.75rem 1rem",
              borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role==="user" ? "#1a1a1a" : "#fff",
              border: m.role==="user" ? "none" : "1px solid #e8e5de",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <p style={{ fontSize:13, lineHeight:1.65, color: m.role==="user" ? "#fff" : "#1a1a1a", whiteSpace:"pre-wrap" }}>{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:9, background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
            <div style={{ padding:"0.75rem 1rem", background:"#fff", border:"1px solid #e8e5de", borderRadius:"18px 18px 18px 4px" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#bbb", animation:`bounce 1s ease ${i*0.15}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ paddingTop:10, borderTop:"1px solid #e8e5de", display:"flex", gap:8, alignItems:"flex-end" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your trainer anything…"
          rows={1}
          style={{ flex:1, padding:"0.75rem 1rem", border:"1px solid #e8e5de", borderRadius:14, fontSize:14, fontFamily:"inherit", color:"#1a1a1a", resize:"none", outline:"none", background:"#fff", lineHeight:1.5 }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ width:44, height:44, borderRadius:14, flexShrink:0, background: input.trim() && !loading ? "#1a1a1a" : "#f4f2ed", border:"none", cursor: input.trim() ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"background 0.15s" }}
        >
          <span style={{ transform:"rotate(90deg)", display:"inline-block", color: input.trim() ? "#fff" : "#bbb" }}>➤</span>
        </button>
      </div>
    </div>
  );
}

// ─── Profile Banner ───────────────────────────────────────────────────────────
function ProfileBanner({ intro, extra, onEditExtra }) {
  if (!intro) return null;
  const items = [
    intro.age             && `${intro.age}y`,
    intro.weight          && `${intro.weight}kg`,
    intro.height          && `${intro.height}cm`,
    intro.fitnessGoal     && intro.fitnessGoal,
    intro.experienceLevel && intro.experienceLevel,
    extra.equipment       && extra.equipment,
  ].filter(Boolean);

  return (
    <div style={{ background:"linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)", borderRadius:20, padding:"1rem 1.1rem", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Your Profile</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {items.map((item, i) => (
            <span key={i} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"0.2rem 0.55rem" }}>{item}</span>
          ))}
        </div>
      </div>
      <button onClick={onEditExtra} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.08)", border:"none", borderRadius:99, padding:"0.3rem 0.7rem", fontFamily:"inherit", cursor:"pointer", flexShrink:0 }}>
        Edit ✏️
      </button>
    </div>
  );
}

{/* <a href="/v1/profile">
  <ProfilePicture size={40} />
</a> */}
// ─── Extra Detail Form zIndex:50, boxShadow ────────────────────────────────────────────────────────
function ExtraForm({ extra, onChange, onClose }) {
  const [local, setLocal] = useState({ ...extra });

  function toggle(field, val) {
    setLocal(prev => ({ ...prev, [field]: prev[field] === val ? "" : val }));
  }
  function toggleMulti(field, val) {
    const arr = local[field] ? local[field].split(",").map(s=>s.trim()).filter(Boolean) : [];
    const next = arr.includes(val) ? arr.filter(v=>v!==val) : [...arr, val];
    setLocal(prev => ({ ...prev, [field]: next.join(", ") }));
  }
  function isMultiActive(field, val) {
    return (local[field]||"").split(",").map(s=>s.trim()).includes(val);
  }

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:9998, backdropFilter:"blur(3px)" }} />
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#fafaf8", borderRadius:"24px 24px 0 0", padding:"1.5rem 1.25rem 2.5rem", zIndex:9999, boxShadow:"0 -4px 40px rgba(0,0,0,0.12)", maxHeight:"85dvh", overflowY:"auto" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:"#e0ddd6", margin:"0 auto 1.25rem" }} />
        <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.03em", marginBottom:"1.25rem" }}>Personalise your plan</h2>

        <div style={{ marginBottom:16 }}>
          <Label>Equipment available</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {EQUIPMENT_OPTIONS.map(eq => <Chip key={eq} label={eq} active={local.equipment===eq} onClick={() => toggle("equipment", eq)} />)}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <Label>Focus areas (pick multiple)</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {FOCUS_OPTIONS.map(f => <Chip key={f} label={f} active={isMultiActive("focusAreas", f)} onClick={() => toggleMulti("focusAreas", f)} />)}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <Label>Session length</Label>
          <div style={{ display:"flex", gap:6 }}>
            {SESSION_LENGTHS.map(l => (
              <button key={l} onClick={() => toggle("sessionLength", l)} style={{ flex:1, padding:"0.55rem 0", borderRadius:12, border: local.sessionLength===l ? "none" : "1px solid #e8e5de", background: local.sessionLength===l ? "#1a1a1a" : "#fff", color: local.sessionLength===l ? "#fff" : "#aaa", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>{l}m</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <Label>Injuries or limitations</Label>
          <input
            value={local.injuries || ""}
            onChange={e => setLocal(p => ({ ...p, injuries:e.target.value }))}
            placeholder="e.g. bad knees, lower back pain…"
            style={{ width:"100%", padding:"0.75rem 1rem", border:"1px solid #e8e5de", borderRadius:12, fontSize:14, fontFamily:"inherit", color:"#1a1a1a", outline:"none", background:"#fff" }}
          />
        </div>

        <button onClick={() => { onChange(local); onClose(); }} style={{ width:"100%", padding:"0.9rem", background:"#1a1a1a", color:"#fafaf8", border:"none", borderRadius:14, fontSize:14, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
          Save & apply
        </button>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AITrainerClient() {
  const { data:session, status } = useSession();
  const router = useRouter();

  const [intro,      setIntro]      = useState(null);
  const [introLoad,  setIntroLoad]  = useState(true);
  const [extra,      setExtra]      = useState({ equipment:"", focusAreas:"", sessionLength:"45", injuries:"" });
  const [showExtra,  setShowExtra]  = useState(false);

  // "plan" | "chat" | "saved"
  const [mainTab,    setMainTab]    = useState("plan");
  const [plan,       setPlan]       = useState(null);
  const [planLoad,   setPlanLoad]   = useState(false);
  const [planError,  setPlanError]  = useState(null);
  const [showPlan,   setShowPlan]   = useState(false);

  // Save state
  const [saving,     setSaving]     = useState(false);
  const [savedId,    setSavedId]    = useState(null); // mongo _id of the currently-shown plan if saved

  // Saved plans list
  const [savedPlans,     setSavedPlans]     = useState([]);
  const [savedLoading,   setSavedLoading]   = useState(false);
  const [removingId,     setRemovingId]     = useState(null);
  const [viewingSaved,   setViewingSaved]   = useState(null); // { plan, savedAt, _id }

  const [vis, setVis] = useState(false);

    const [isSubscribed, setIsSubscribed] = useState(null); // null = loading

useEffect(() => {
  if (status !== "authenticated") return;
  fetch("/api/user-intro")
    .then(r => r.json())
    .then(d => setIsSubscribed(d.data?.isSubscribed ?? false));
}, [status]);

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (session && !session.user?.hasIntro) { router.replace("/v1/StartersIntro"); return; }
  }, [status, session, router]);

  // Fetch intro
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user-intro")
      .then(r => r.json())
      .then(json => { if (json.success) setIntro(json.data); })
      .finally(() => { setIntroLoad(false); setTimeout(() => setVis(true), 40); });
  }, [status]);

  // Fetch saved plans when saved tab opens
  useEffect(() => {
    if (mainTab !== "saved") return;
    loadSavedPlans();
  }, [mainTab]);

  async function loadSavedPlans() {
    setSavedLoading(true);
    try {
      const res  = await fetch("/api/ai-trainer/saved");
      const json = await res.json();
      if (json.success) setSavedPlans(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSavedLoading(false);
    }
  }

  async function generatePlan(forceNew = false) {
    if (!forceNew && plan) { setShowPlan(true); return; }
    setPlanLoad(true); setPlanError(null); setSavedId(null);
    try {
      const res  = await fetch("/api/ai-trainer", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ type:"plan", extra }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPlan(json.data);
      setShowPlan(true);
    } catch (e) {
      setPlanError(e.message);
    } finally {
      setPlanLoad(false);
    }
  }

  async function savePlan() {
    if (!plan || saving) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/ai-trainer/saved", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.success) setSavedId(json.data._id);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function removePlan(id) {
    setRemovingId(id);
    try {
      const res  = await fetch(`/api/ai-trainer/saved/${id}`, { method:"DELETE" });
      const json = await res.json();
      if (json.success) {
        setSavedPlans(prev => prev.filter(s => s._id !== id));
        // If currently viewing this saved plan, go back
        if (viewingSaved?._id === id) setViewingSaved(null);
        // Clear savedId badge if this was the active plan
        if (savedId === id) setSavedId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  }

  if (status === "loading" || (session && !session.user?.hasIntro)) return null;
  const firstName = session?.user?.name?.split(" ")[0] ?? "Athlete";

  // Active plan shown in saved-tab viewer
  const activeSavedPlan = viewingSaved?.plan;

  return (
    <div style={{ position: "relative" }}>
    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", background:"#fafaf8", minHeight:"100dvh", maxWidth:430, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html,body { -webkit-font-smoothing:antialiased; background:#fafaf8; }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        ::-webkit-scrollbar { display:none; }
        button { cursor:pointer; }
        textarea { font-size:16px !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ padding:"1.2rem 1.25rem 0", position:"sticky", top:0, background:"rgba(250,250,248,0.92)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:"1px solid rgba(232,229,222,0.5)", zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.9rem" }}>
          <div>
            <p style={{ fontSize:12, color:"#aaa", fontWeight:400 }}>Good {getGreeting()}</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.04em", lineHeight:1.1 }}>
              AI Trainer 🤖
            </h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => setShowExtra(true)} style={{ width:40, height:40, borderRadius:12, background:"#fff", border:"1px solid #e8e5de", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }} title="Personalise">
              ⚙️
            </button>
            <a href="/v1/profile"><ProfilePicture size={40} /></a>
          </div>
        </div>

        {/* Tabs - hide when viewing a plan in either tab */}
        {!showPlan && !viewingSaved && (
          <div style={{ display:"flex", gap:4 }}>
            {[["plan","📋 Plan"],["saved","🔖 Saved"],["chat","💬 Chat"]].map(([key,label]) => (
              <button key={key} onClick={() => setMainTab(key)} style={{
                flex:1, padding:"0.6rem 0", border:"none", background:"none",
                fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                color: mainTab===key ? "#1a1a1a" : "#aaa",
                borderBottom:`2px solid ${mainTab===key ? "#ff6b35" : "transparent"}`,
                position:"relative",
              }}>
                {label}
                {/* Badge for saved count */}
                {key==="saved" && savedPlans.length > 0 && (
                  <span style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:"#ff6b35", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{savedPlans.length}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <main style={{
        padding:"1rem 1.25rem 2rem", flex:1,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(10px)",
        transition:"opacity 0.4s ease, transform 0.4s ease",
      }}>

        {!introLoad && mainTab !== "chat" && (
          <ProfileBanner intro={intro} extra={extra} onEditExtra={() => setShowExtra(true)} />
        )}

        {/* ── PLAN TAB ── */}
        {mainTab === "plan" && !showPlan && (
          <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeIn 0.35s ease" }}>
            <Card style={{ textAlign:"center", padding:"2rem 1.5rem", background:"linear-gradient(135deg,#f4f2ed 0%,#fff 100%)" }}>
              <p style={{ fontSize:40, marginBottom:10 }}>🏋️</p>
              <h2 style={{ fontSize:19, fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.03em", marginBottom:8 }}>
                Your personalised plan
              </h2>
              <p style={{ fontSize:13, color:"#aaa", lineHeight:1.7, marginBottom:"1.5rem" }}>
                AI builds a full weekly programme based on your profile, goals and equipment. Tap ⚙️ above to customise further.
              </p>
              {planError && (
                <p style={{ fontSize:12, color:"#e53e3e", fontWeight:600, marginBottom:12 }}>⚠️ {planError}</p>
              )}
              <button
                onClick={() => generatePlan(false)}
                disabled={planLoad}
                style={{ width:"100%", padding:"1rem", background:"#1a1a1a", color:"#fafaf8", border:"none", borderRadius:14, fontSize:15, fontWeight:700, fontFamily:"inherit", cursor: planLoad ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity: planLoad ? 0.7 : 1 }}
              >
                {planLoad ? (
                  <>
                    <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                    Building your plan…
                  </>
                ) : plan ? "📋 View my plan" : "✨ Generate my weekly plan"}
              </button>
            </Card>

            {planLoad && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[140,80,80,80,80].map((h,i) => <Skeleton key={i} height={h} />)}
              </div>
            )}

            {!planLoad && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { emoji:"📅", title:"Full 7-day schedule",  desc:"Training days + rest days tailored to your availability" },
                  { emoji:"🏋️", title:"Exercise breakdown",   desc:"Sets, reps, rest periods and tempo for every exercise" },
                  { emoji:"📈", title:"Progression system",   desc:"How to add weight and intensity over time" },
                  { emoji:"🥗", title:"Nutrition guidelines", desc:"What to eat to support your specific goal" },
                  { emoji:"🔥", title:"Warmup & cooldown",    desc:"Built into every training day - no skipping" },
                ].map((f,i) => (
                  <Card key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"0.9rem 1.1rem" }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{f.emoji}</span>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>{f.title}</p>
                      <p style={{ fontSize:12, color:"#aaa", marginTop:2, lineHeight:1.5 }}>{f.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLAN VIEW (generated) ── */}
        {mainTab === "plan" && showPlan && plan && (
          <PlanView
            plan={plan}
            onRegen={() => generatePlan(true)}
            isLoading={planLoad}
            onBack={() => setShowPlan(false)}
            onSave={savePlan}
            isSaved={!!savedId}
            saving={saving}
          />
        )}

        {/* ── SAVED TAB ── */}
        {mainTab === "saved" && !viewingSaved && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeIn 0.35s ease" }}>
            {savedLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[100,100,100].map((h,i) => <Skeleton key={i} height={h} />)}
              </div>
            ) : savedPlans.length === 0 ? (
              <Card style={{ textAlign:"center", padding:"2.5rem 1.5rem" }}>
                <p style={{ fontSize:32, marginBottom:10 }}>🔖</p>
                <p style={{ fontSize:15, fontWeight:700, color:"#1a1a1a", marginBottom:6 }}>No saved plans yet</p>
                <p style={{ fontSize:13, color:"#aaa", lineHeight:1.6 }}>Generate a plan in the Plan tab and tap 💾 Save to keep it here.</p>
              </Card>
            ) : (
              savedPlans.map(s => (
                <SavedPlanCard
                  key={s._id}
                  saved={s}
                  onView={sv => setViewingSaved(sv)}
                  onRemove={removePlan}
                  removing={removingId === s._id}
                />
              ))
            )}
          </div>
        )}

        {/* ── SAVED PLAN VIEWER ── */}
        {mainTab === "saved" && viewingSaved && (
          <PlanView
            plan={viewingSaved.plan}
            onRegen={null}
            isLoading={false}
            onBack={() => setViewingSaved(null)}
            onSave={null}
            isSaved={true}
            saving={false}
          />
        )}

        {/* ── CHAT TAB ── */}
        {mainTab === "chat" && (
          <ChatView extra={extra} intro={intro} />
        )}

      </main>

      {showExtra && (
        <ExtraForm
          extra={extra}
          onChange={setExtra}
          onClose={() => setShowExtra(false)}
        />
      )}
    </div>
    {isSubscribed === false && <PaywallOverlay />}
  </div>
  );
}