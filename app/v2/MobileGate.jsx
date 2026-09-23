"use client";

import { useEffect, useState } from "react";

/**
 * v2 is phone/tablet only, independent of v1's own MOBILE_ONLY flag
 * (NEXT_PUBLIC_MOBILE_ONLY, currently off) -- this always applies to
 * every /v2/* route regardless of that env var.
 *
 * Detection deliberately runs in useEffect, NOT in useState's lazy
 * initializer. That initializer executes during server-side rendering
 * too, where `navigator` doesn't exist -- it always computed "not
 * mobile" there, so the server-rendered HTML briefly (or, depending on
 * hydration timing/network conditions, not-so-briefly) showed the
 * block screen even on a real phone, before the client corrected it.
 * That mismatch is what caused it to "sometimes" show incorrectly.
 * useEffect never runs during SSR, so the verdict is only ever computed
 * once, in the real browser, after mount -- no race, no flash.
 *
 * Not a viewport-width/resolution check -- that's trivial to trigger
 * on any desktop browser by just resizing the window, so it proves
 * nothing about the actual device. This checks real device signals:
 *
 *   1. Phone/Android UA pattern (same one v1's ClientLayout.jsx uses).
 *   2. Literal "iPad" in the UA -- older iPadOS, or third-party
 *      browsers that don't spoof.
 *   3. The standard "modern iPad" detection trick: since iPadOS 13,
 *      Safari's default UA reports itself as desktop Macintosh Safari
 *      with NO "iPad" string at all -- so a real iPad is otherwise
 *      indistinguishable from a Mac by UA alone. The one thing a Mac
 *      desktop/laptop never has is multi-touch:
 *      `navigator.maxTouchPoints > 1` on a "Macintosh" UA reliably
 *      means iPad, not a Mac.
 *   4. Chromium's User-Agent Client Hints (`navigator.userAgentData
 *      .mobile`), where available, as an extra signal.
 */
function detectMobileOrTablet() {
  const ua = navigator.userAgent;

  if (/iPhone|iPod|Android/i.test(ua)) return true;
  if (/iPad/i.test(ua)) return true;

  const isMacUA = /Macintosh/i.test(ua);
  const hasMultiTouch = (navigator.maxTouchPoints || 0) > 1;
  if (isMacUA && hasMultiTouch) return true; // modern iPadOS Safari

  if (navigator.userAgentData?.mobile) return true;

  return false;
}

export function MobileGate({ children }) {
  // null = "haven't checked yet" -- same value on server and client,
  // so there's nothing for hydration to mismatch on. Only useEffect
  // (client-only, post-mount) ever moves it to true/false.
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    setIsMobile(detectMobileOrTablet());
  }, []);

  if (isMobile === null) return null;

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-6 text-center transition-colors">
        <p className="text-sm text-neutral-500 max-w-xs">
          Please open this on your phone or tablet.
        </p>
      </div>
    );
  }

  return children;
}
