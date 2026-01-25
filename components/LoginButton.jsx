"use client";
import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginButton = () => {
  const { data: session, status } = useSession();
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      router.push("/v1/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="relative">
      {/* Main content */}
      <div className={`transition-all duration-500 ${showGoogleButton ? 'blur-sm scale-95' : ''}`}>
        <button 
          onClick={() => setShowGoogleButton(true)}
          className="w-full bg-white text-black p-3 pr-15 rounded-xl pl-15"
        >
          <div className="flex gap-3">
            <img width={30} height={18} alt="logo" src="/MainLogo8.png" className=""/>
          <a className="text-xl ">Continue with us</a>
          </div>
        </button>
      </div>

      {/* Google Sign-in Modal */}
{showGoogleButton && (
  <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20 animate-scaleIn max-w-md w-full mx-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
        <p className="text-white/70 text-sm">Sign in to continue your journey</p>
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
          By continuing, you agree to our Terms of Service and Privacy Policy
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


      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginButton;