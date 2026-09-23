"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Web port of gym-ios's BarcodeLogSheet. Same data source (Open Food
 * Facts, public, no auth, called directly from the client -- see
 * gym-ios/src/features/nutrition/barcodeLog/api.ts for the original).
 *
 * Live camera scanning uses the browser's native BarcodeDetector API
 * where available (Chrome/Edge on Android and desktop) -- no new npm
 * dependency. Safari (iOS) doesn't implement BarcodeDetector as of
 * this writing, so this always also offers manual barcode entry as a
 * fallback that works everywhere regardless of scanner support.
 */

const NUTRIENT_KEYS = [
  "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium",
  "satFat", "cholesterol", "vitaminA", "vitaminC", "vitaminD",
  "vitaminB12", "folate", "iron", "calcium", "potassium",
];

const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};
const round1 = (v) => Math.round(v * 10) / 10;

function extractNutrients(n, sfx) {
  const sodiumG = num(n[`sodium${sfx}`]);
  const saltG = num(n[`salt${sfx}`]);
  const sodiumMg = sodiumG > 0 ? sodiumG * 1000 : saltG > 0 ? saltG * 400 : 0;
  return {
    calories: Math.round(num(n[`energy-kcal${sfx}`])),
    protein: Math.round(num(n[`proteins${sfx}`])),
    carbs: Math.round(num(n[`carbohydrates${sfx}`])),
    fat: Math.round(num(n[`fat${sfx}`])),
    fiber: round1(num(n[`fiber${sfx}`])),
    sugar: round1(num(n[`sugars${sfx}`])),
    sodium: Math.round(sodiumMg),
    satFat: round1(num(n[`saturated-fat${sfx}`])),
    cholesterol: Math.round(num(n[`cholesterol${sfx}`]) * 1000),
    vitaminA: Math.round(num(n[`vitamin-a${sfx}`]) * 1_000_000),
    vitaminC: Math.round(num(n[`vitamin-c${sfx}`]) * 1000),
    vitaminD: round1(num(n[`vitamin-d${sfx}`]) * 1_000_000),
    vitaminB12: round1(num(n[`vitamin-b12${sfx}`]) * 1_000_000),
    folate: Math.round(num(n[`vitamin-b9${sfx}`]) * 1_000_000),
    iron: round1(num(n[`iron${sfx}`]) * 1000),
    calcium: Math.round(num(n[`calcium${sfx}`]) * 1000),
    potassium: Math.round(num(n[`potassium${sfx}`]) * 1000),
  };
}

async function lookupBarcode(barcode) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
  );
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments ?? {};
  return {
    barcode,
    name: p.product_name || p.generic_name || "Product",
    brand: p.brands || undefined,
    servingSize: p.serving_size || undefined,
    per100g: extractNutrients(n, "_100g"),
  };
}

export function BarcodeLogModal({ localDate, onClose, onSaved }) {
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [grams, setGrams] = useState("100");
  const [saving, setSaving] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const stoppedRef = useRef(false);

  // Camera is the primary way to scan a barcode, same as the app --
  // launch it the moment the sheet opens instead of waiting for an
  // extra tap. Manual entry stays available as a fallback (behind an
  // explicit "Enter it manually" link) for when BarcodeDetector isn't
  // supported (Safari) or the camera permission is denied.
  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setScannerReady(true);
      startScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runLookup = async (code) => {
    if (!code) return;
    setLooking(true);
    setError("");
    try {
      const p = await lookupBarcode(code);
      if (!p) {
        setError("No product found for that barcode.");
      } else {
        setProduct(p);
        stopScanner();
      }
    } catch {
      setError("Lookup failed. Check your connection.");
    } finally {
      setLooking(false);
    }
  };

  const startScanner = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // eslint-disable-next-line no-undef
      detectorRef.current = new BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
      });
      stoppedRef.current = false;
      setScannerActive(true);
      scanLoop();
    } catch {
      setError("Camera unavailable. Check browser permissions.");
    }
  };

  const scanLoop = async () => {
    if (stoppedRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes.length > 0) {
        runLookup(codes[0].rawValue);
        return;
      }
    } catch {}
    requestAnimationFrame(scanLoop);
  };

  const stopScanner = () => {
    stoppedRef.current = true;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScannerActive(false);
  };

  useEffect(() => () => stopScanner(), []);

  const save = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const factor = (Number(grams) || 100) / 100;
      const macros = {};
      for (const k of NUTRIENT_KEYS) macros[k] = Math.round((product.per100g[k] || 0) * factor * 10) / 10;
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localDate,
          note: product.name,
          manualMacros: macros,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't save");
        setSaving(false);
        return;
      }
      onSaved(json.data);
    } catch {
      setError("Couldn't save");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 transition-colors max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold">Scan barcode</p>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {!product && (
          <>
            {scannerReady && (
              <div className="mb-4">
                {scannerActive ? (
                  <div className="rounded-2xl overflow-hidden bg-black aspect-square relative">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[75%] aspect-[3/2] border-2 border-white/70 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startScanner}
                    className="w-full border border-neutral-300 dark:border-neutral-700 rounded-2xl py-4 text-sm font-semibold"
                  >
                    Open camera to scan
                  </button>
                )}
                {looking && <p className="text-xs text-neutral-500 text-center mt-2">Looking up…</p>}
              </div>
            )}

            {showManual || !scannerReady ? (
              <>
                <p className="text-xs font-semibold text-neutral-500 mb-2">
                  {scannerReady ? "OR ENTER MANUALLY" : "ENTER BARCODE"}
                </p>
                <div className="flex gap-2">
                  <input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 012345678905"
                    inputMode="numeric"
                    className="flex-1 border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm outline-none focus:border-black dark:focus:border-white"
                  />
                  <button
                    onClick={() => runLookup(manualCode)}
                    disabled={!manualCode || looking}
                    className="px-4 text-sm font-bold disabled:opacity-30"
                  >
                    {looking ? "…" : "Look up"}
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setShowManual(true)} className="text-xs text-neutral-500 underline">
                Enter the barcode manually instead
              </button>
            )}
            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
          </>
        )}

        {product && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-lg font-bold">{product.name}</p>
              {product.brand && <p className="text-xs text-neutral-500">{product.brand}</p>}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase">Amount (g)</span>
              <input
                value={grams}
                onChange={(e) => setGrams(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="numeric"
                className="border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm outline-none focus:border-black dark:focus:border-white"
              />
            </label>

            <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-xs text-neutral-500">
              Per 100g: {product.per100g.calories} cal · P {product.per100g.protein}g · C{" "}
              {product.per100g.carbs}g · F {product.per100g.fat}g
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40"
            >
              {saving ? "Saving…" : "Add to today"}
            </button>
            <button
              onClick={() => {
                setProduct(null);
                setManualCode("");
              }}
              className="text-xs text-neutral-500"
            >
              Scan a different item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
