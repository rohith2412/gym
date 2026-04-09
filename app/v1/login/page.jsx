"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState("main"); // "main" | "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) router.replace("/v1/tracking");
  }, [session, router]);

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
      // auto login after register
      const login = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      setLoading(false);
      if (login?.error) {
        setError("Registered but login failed. Try logging in.");
        setMode("login");
      } else {
        router.replace("/v1/tracking");
      }
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Logo */}
        <h1 style={S.welcome}>Welcome 👋</h1>
        <div style={{ marginBottom: 20 }}>
          <span style={S.logoText}>
            <span style={{ color: "#1a1a1a" }}>Your</span>
            <span style={{ color: "#ff6b35" }}>Pocket</span>
            <span style={{ color: "#1a1a1a" }}>Gym</span>
          </span>
        </div>
        <p style={S.sub}>Sign in to start building your plan</p>

        {/* Main — Google + Email options */}
        {mode === "main" && (
          <>
            <button onClick={() => signIn("google")} style={S.googleBtn}>
              <img src="/Googlelogo.svg" alt="Google" />
            </button>

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
              style={S.registerLink}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Create an account
            </button>
          </>
        )}

        {/* Email Login */}
        {mode === "login" && (
          <form onSubmit={handleCredentialLogin} style={S.form}>
            <input
              style={S.input}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <p style={S.error}>{error}</p>}
            <button style={S.submitBtn} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              style={S.backBtn}
              onClick={() => { setMode("main"); setError(""); }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Register */}
        {mode === "register" && (
          <form onSubmit={handleRegister} style={S.form}>
            <input
              style={S.input}
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <p style={S.error}>{error}</p>}
            <button style={S.submitBtn} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              style={S.backBtn}
              onClick={() => { setMode("main"); setError(""); }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={S.legal}>
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" style={{ textDecoration: "underline" }}>Terms</Link>{" "}
          &{" "}
          <Link href="/legal/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    padding: 16,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: "40px 28px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  welcome: {
    fontSize: 16,
    fontWeight: 400,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.035em",
  },
  sub: {
    fontSize: 13,
    color: "#777",
    marginBottom: 20,
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "16px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#e8e5de",
  },
  dividerText: {
    fontSize: 12,
    color: "#bbb",
  },
  emailBtn: {
    width: "100%",
    padding: "0.85rem",
    borderRadius: 14,
    border: "1.5px solid #d4d0c8",
    background: "transparent",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  registerLink: {
    width: "100%",
    padding: "0.85rem",
    borderRadius: 14,
    border: "none",
    background: "#1a1a1a",
    color: "#fafaf8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 4,
  },
  input: {
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: 12,
    border: "1.5px solid #e8e5de",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: "#1a1a1a",
    background: "#fafaf8",
  },
  submitBtn: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: 14,
    border: "none",
    background: "#ff6b35",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#aaa",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "0.25rem",
  },
  error: {
    fontSize: 12,
    color: "#e24b4a",
    textAlign: "center",
  },
  legal: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 20,
    lineHeight: 1.5,
  },
};