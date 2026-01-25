"use client";
import React, { useState } from "react";
import {  signIn } from "next-auth/react";

const LoginButton = () => {
  const [showGoogleButton, setShowGoogleButton] = useState(false);


  return (
    <div className="relative">
      <div
        className={`transition-all duration-200 ${showGoogleButton ? "blur-sm scale-95" : ""}`}
      >
        <button
          onClick={() => setShowGoogleButton(true)}
          className="w-full bg-white text-black p-3 pr-15 rounded-xl pl-15"
        >
          <div className="flex gap-3 items-center">
            <img
              width={30}
              height={18}
              alt="logo"
              src="/MainLogo8.png"
              className=""
            />
            <a className="text-xl ">Continue with us</a>
          </div>
        </button>
      </div>

      {showGoogleButton && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-white/70 text-sm">
                Sign in to continue your journey
              </p>
            </div>

            <button
              onClick={() => signIn("google")}
              className="cursor-pointer flex justify-center w-full transform transition-all duration-300 active:scale-95"
            >
              <img
                width={200}
                height={200}
                alt="Google logo"
                src="/Googlelogo.svg"
                className="drop-shadow-lg"
              />
            </button>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-xs mb-4">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
              <button
                onClick={() => setShowGoogleButton(false)}
                className="text-white/60 hover:text-white text-sm underline transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginButton;