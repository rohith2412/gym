"use client";

import React from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

const LoginButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return <h1>Welcome, {session.user.name}</h1>;
  }

  return (
    <div>
      

      <div className="">
        <button
          onClick={() => signIn("google")}
          className=" cursor-pointer"
        >
         <img width={200} height={200} alt="Googlelogo" src="/Googlelogo.svg" />
        </button>
      </div>
    </div>
  );
};

export default LoginButton;
