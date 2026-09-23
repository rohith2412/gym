"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Bare /v2 is just a redirect now -- /v2/home is the real default
 * landing. Kept as a thin redirector so any existing link to /v2
 * (bookmarks, the login page before this change, etc.) still lands
 * somewhere real instead of 404ing.
 */
export default function V2Root() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
    else if (status === "authenticated") router.replace("/v2/home");
  }, [status, router]);

  return null;
}
