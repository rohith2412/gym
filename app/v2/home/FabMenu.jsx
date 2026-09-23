"use client";

import { useEffect, useState } from "react";
import { Barcode, Camera, Mic, PenLine } from "lucide-react";

/**
 * Web port of gym-ios's src/ui/FabMenu.tsx: same card size (268px),
 * same scale/translate/opacity curve (0.86->1, 18->0, 24->0), same
 * open/close durations and easings (220ms cubic-bezier(0.16,1,0.3,1)
 * open, 160ms cubic-bezier(0.4,0,1,1) close), same blurred backdrop.
 * The card grows out of the FAB's own bottom-right corner
 * (transformOrigin), matching measureInWindow-anchored positioning on
 * mobile without needing to actually measure -- the FAB and the menu
 * share the same fixed bottom-right corner on this layout.
 */

const OPEN = { duration: 220, easing: "cubic-bezier(0.16,1,0.3,1)" };
const CLOSE = { duration: 160, easing: "cubic-bezier(0.4,0,1,1)" };

const ITEMS = [
  { key: "scan", icon: Camera, label: "Scan a photo", sublabel: "AI reads your meal" },
  { key: "barcode", icon: Barcode, label: "Scan barcode", sublabel: "Look up a packaged food" },
  { key: "voice", icon: Mic, label: "Voice log", sublabel: "Say your meal and water" },
  { key: "manual", icon: PenLine, label: "Enter manually", sublabel: "Type in calories and macros" },
];

export function FabMenu({ c, open, onClose, onSelect }) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(false), CLOSE.duration);
    return () => clearTimeout(t);
  }, [open]);

  if (!rendered) return null;

  const anim = visible ? OPEN : CLOSE;
  const transition = `transform ${anim.duration}ms ${anim.easing}, opacity ${anim.duration}ms ${anim.easing}`;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(0,0,0,0.22)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${anim.duration}ms ${anim.easing}`,
        }}
      />
      <div
        className="fixed bottom-[104px] right-6 z-50 w-[268px] rounded-[20px] overflow-hidden"
        style={{
          backgroundColor: c.surface,
          border: `1px solid ${c.border}`,
          boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
          transformOrigin: "bottom right",
          transform: visible ? "scale(1) translate(0px, 0px)" : "scale(0.86) translate(18px, 24px)",
          opacity: visible ? 1 : 0,
          transition,
        }}
      >
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              style={i > 0 ? { borderTopColor: c.border } : undefined}
              className={`w-full flex items-center gap-3 p-3.5 text-left ${i > 0 ? "border-t" : ""}`}
            >
              <div
                style={{ backgroundColor: c.surfaceAlt }}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Icon size={17} color={c.text} />
              </div>
              <div className="min-w-0">
                <p style={{ color: c.text }} className="text-[15px] font-semibold leading-tight">
                  {item.label}
                </p>
                <p style={{ color: c.textMuted }} className="text-xs leading-tight mt-0.5">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
