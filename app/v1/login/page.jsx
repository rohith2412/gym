"use client";

import React, { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace("/v1/dashboard");
    }
  }, [session, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "24px",
          padding: "40px 28px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "16px",
            fontWeight: "400",
            marginBottom: "8px",
          }}
        >
          Welcome 👋
        </h1>

        <div style={S.root}>
          <span style={S.logoText}>
            <span style={{ color: "#1a1a1a" }}>Your</span>
            <span style={{ color: "#ff6b35" }}>Pocket</span>
            <span style={{ color: "#1a1a1a" }}>Gym</span>
          </span>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#777",
            marginBottom: "15px",
          }}
        >
          Sign in to start building your plan
        </p>

        <button
          onClick={() => signIn("google")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <img src="/Googlelogo.svg" alt="Google" />
        </button>

        <p
          style={{
            fontSize: "11px",
            color: "#aaa",
            marginTop: "16px",
            lineHeight: "1.5",
          }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
//YourPocketGym
const S = {
  root: {
    marginBottom: "20px",
  },
  logoText: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.035em",
  },
};
