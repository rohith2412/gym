"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("main"); // "main" | "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/v1/tracking");
  }, [session, router]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    setMode("main");
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.replace("/v1/tracking");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      setLoading(false);
      if (login?.error) {
        setError("Registered! Please sign in.");
        setMode("login");
      } else {
        router.replace("/v1/tracking");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const modal = (
    <>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .apex-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 9999; padding: 0;
          animation: fade-in 0.2s ease-out;
        }
        @media (min-width: 640px) {
          .apex-modal-overlay { align-items: center; padding: 1rem; }
          .apex-modal-sheet { border-radius: 24px !important; animation: fade-in 0.2s ease-out !important; }
        }
        .apex-modal-sheet {
          background: #fff; width: 100%; max-width: 440px;
          border-radius: 24px 24px 0 0;
          padding: 2.5rem 2rem 2rem;
          box-shadow: 0 -4px 60px rgba(0,0,0,0.15);
          animation: slide-up 0.3s cubic-bezier(.22,1,.36,1);
        }
        .apex-input {
          width: 100%; padding: 0.85rem 1rem;
          border-radius: 12px; border: 1.5px solid #e8e5de;
          font-size: 14px; font-family: inherit;
          outline: none; color: #1a1a1a; background: #fafaf8;
          box-sizing: border-box;
        }
        .apex-input:focus { border-color: #1a1a1a; }
      `}</style>

      <div className="apex-modal-overlay" onClick={closeModal}>
        <div className="apex-modal-sheet" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
              Welcome 👋
            </h2>
            <div style={{ marginBottom: 8 }}>
              <span style={S.logoText}>
                <span style={{ color: "#1a1a1a" }}>Your</span>
                <span style={{ color: "#ff6b35" }}>Pocket</span>
                <span style={{ color: "#1a1a1a" }}>Gym</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#888", fontWeight: 300 }}>
              Sign in to start building your plan
            </p>
          </div>

          {/* Main */}
          {mode === "main" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <button onClick={() => signIn("google")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <img src="/Googlelogo.svg" alt="Google" />
                </button>
              </div>

              <div style={S.divider}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>or</span>
                <div style={S.dividerLine} />
              </div>

              <button
                style={S.emailBtn}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Continue with email
              </button>

              <button
                style={{ ...S.emailBtn, background: "#1a1a1a", color: "#fafaf8", border: "none", marginTop: 10 }}
                onClick={() => { setMode("register"); setError(""); }}
              >
                Create an account
              </button>
            </>
          )}

          {/* Email Login */}
          {mode === "login" && (
            <form onSubmit={handleCredentialLogin} style={S.form}>
              <input className="apex-input" type="email" placeholder="Email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className="apex-input" type="password" placeholder="Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              {error && <p style={S.error}>{error}</p>}
              <button style={S.submitBtn} type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button type="button" style={S.backBtn}
                onClick={() => { setMode("main"); setError(""); }}>
                ← Back
              </button>
            </form>
          )}

          {/* Register */}
          {mode === "register" && (
            <form onSubmit={handleRegister} style={S.form}>
              <input className="apex-input" type="text" placeholder="Full name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="apex-input" type="email" placeholder="Email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className="apex-input" type="password" placeholder="Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              {error && <p style={S.error}>{error}</p>}
              <button style={S.submitBtn} type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
              <button type="button" style={S.backBtn}
                onClick={() => { setMode("main"); setError(""); }}>
                ← Back
              </button>
            </form>
          )}

          {/* Footer */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#aaa", lineHeight: "1.5" }}>
              By continuing, you agree to our{" "}
              <Link href="/legal/terms" style={{ textDecoration: "underline" }}>Terms</Link>{" "}
              &{" "}
              <Link href="/legal/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</Link>
            </p>
            <button onClick={closeModal} style={S.backBtn}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <span
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        style={{ display: "block", width: "100%", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
      >
        Join Now - free
      </span>
      {typeof window !== "undefined" && showModal && createPortal(modal, document.body)}
    </>
  );
};

export default LoginButton;

const S = {
  logoText: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.035em" },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0" },
  dividerLine: { flex: 1, height: 1, background: "#e8e5de" },
  dividerText: { fontSize: 12, color: "#bbb" },
  emailBtn: {
    width: "100%", padding: "0.85rem", borderRadius: 14,
    border: "1.5px solid #d4d0c8", background: "transparent",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    fontFamily: "inherit", color: "#1a1a1a",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  submitBtn: {
    width: "100%", padding: "0.9rem", borderRadius: 14,
    border: "none", background: "#ff6b35", color: "#fff",
    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  backBtn: {
    background: "none", border: "none", fontSize: 13,
    color: "#aaa", cursor: "pointer", fontFamily: "inherit", padding: "0.25rem",
  },
  error: { fontSize: 12, color: "#e24b4a", textAlign: "center" },
};