"use client";

import { useSession } from "next-auth/react";

const ProfilePicture = ({ size = 36 }) => {
  const { data: session } = useSession();

  const photo = session?.user?.photo;
  const name = session?.user?.name ?? "U";
  const initial = name.charAt(0).toUpperCase();

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        referrerPolicy="no-referrer"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  // fallback — initial avatar
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#111",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.4,
      fontWeight: 500,
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
};

export default ProfilePicture;