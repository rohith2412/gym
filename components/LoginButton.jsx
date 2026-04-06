"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginButton = () => {
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/v1/tracking");
    }
  }, [session, router]);

  useEffect(() => {
    if (showGoogleButton) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showGoogleButton]);

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
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 9999;
          padding: 0;
          animation: fade-in 0.2s ease-out;
        }
        @media (min-width: 640px) {
          .apex-modal-overlay { align-items: center; padding: 1rem; }
          .apex-modal-sheet { border-radius: 24px !important; animation: fade-in 0.2s ease-out !important; }
        }
        .apex-modal-sheet {
          background: #fff;
          width: 100%;
          max-width: 440px;
          border-radius: 24px 24px 0 0;
          padding: 2.5rem 2rem 2rem;
          box-shadow: 0 -4px 60px rgba(0,0,0,0.15);
          animation: slide-up 0.3s cubic-bezier(.22,1,.36,1);
        }
      `}</style>

      <div
        className="apex-modal-overlay"
        onClick={() => setShowGoogleButton(false)}
      >
        <div className="apex-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
                marginBottom: "0.4rem",
              }}
            >
              Welcome 👋
            </h2>

            <div style={S.root}>
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

          <div className="flex justify-center items-center scale-130">
            <button onClick={() => signIn("google")}>
              <img src="/Googlelogo.svg" alt="Google" />
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: 11,
                color: "#bbb",
                lineHeight: 1.6,
                marginBottom: "0.75rem",
              }}
            >
              By continuing, you agree to our Terms &amp; Privacy Policy
            </p>
            <button
              onClick={() => setShowGoogleButton(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#aaa",
                fontFamily: "inherit",
                fontWeight: 500,
                padding: "0.25rem 0.5rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setShowGoogleButton(true);
        }}
        style={{
          display: "block",
          width: "100%",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Join Now - free
      </span>

      {typeof window !== "undefined" &&
        showGoogleButton &&
        createPortal(modal, document.body)}
    </>
  );
};

export default LoginButton;

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
