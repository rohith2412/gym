"use client";

import { useRef, useState } from "react";
import { Barcode, Camera, ChevronLeft, Mic, PenLine } from "lucide-react";
import { BarcodeLogModal } from "./BarcodeLogModal";
import { VoiceLogModal } from "./VoiceLogModal";
import { uploadFoodPhoto } from "./uploadPhoto";

/**
 * Four real paths -- the full set the mobile app offers, all hitting
 * the actual backend, none faked:
 *   - "Scan a photo": uploads the photo to R2 (same presign flow
 *     mobile's uploadImageToR2 uses) IN PARALLEL with base64-encoding
 *     it for the AI call, then POSTs { image, imageUrl } to
 *     /api/meal-log in one request. GPT-4o vision path is fully built
 *     server-side -- estimates the full nutrient panel AND inserts the
 *     document, no separate confirm step. If the R2 upload fails, the
 *     scan still proceeds without a saved photo rather than blocking
 *     the whole log -- a missing photo beats a lost meal.
 *   - "Scan barcode": BarcodeLogModal -- Open Food Facts lookup,
 *     called directly from the browser (public API, no auth), then
 *     the same /api/meal-log manualMacros save.
 *   - "Voice log": VoiceLogModal -- MediaRecorder -> the real
 *     /api/voice/nutrition (Whisper + GPT parsing) -> review -> save.
 *   - "Enter manually": POSTs { manualMacros }, unchanged from before.
 */
export function AddFoodModal({ localDate, onClose, onSaved }) {
  const [mode, setMode] = useState("choose"); // "choose" | "scan" | "barcode" | "voice" | "manual"
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const toDataUrl = () =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const [dataUrl, imageUrl] = await Promise.all([
        toDataUrl(),
        uploadFoodPhoto(file).catch(() => null),
      ]);

      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, imageUrl, localDate }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(
          json.rateLimitExceeded
            ? `Daily scan limit reached (${json.used}/${json.limit}). Try again tomorrow.`
            : json.error || "Couldn't scan that photo",
        );
        setScanning(false);
        return;
      }
      onSaved(json.data);
    } catch {
      setError("Something went wrong");
      setScanning(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
        <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="text-sm text-neutral-500">
              Cancel
            </button>
            <p className="text-sm font-bold">Add food</p>
            <div className="w-12" />
          </div>

          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) {
                  setMode("scan");
                  handleFile(file);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-4 text-left hover:border-black dark:hover:border-white transition-colors"
            >
              <Camera size={20} />
              <div>
                <p className="text-sm font-semibold">Scan a photo</p>
                <p className="text-xs text-neutral-500">AI reads your meal</p>
              </div>
            </button>
            <button
              onClick={() => setMode("barcode")}
              className="w-full flex items-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-4 text-left hover:border-black dark:hover:border-white transition-colors"
            >
              <Barcode size={20} />
              <div>
                <p className="text-sm font-semibold">Scan barcode</p>
                <p className="text-xs text-neutral-500">Look up a packaged food</p>
              </div>
            </button>
            <button
              onClick={() => setMode("voice")}
              className="w-full flex items-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-4 text-left hover:border-black dark:hover:border-white transition-colors"
            >
              <Mic size={20} />
              <div>
                <p className="text-sm font-semibold">Voice log</p>
                <p className="text-xs text-neutral-500">Say your meal and water</p>
              </div>
            </button>
            <button
              onClick={() => setMode("manual")}
              className="w-full flex items-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-4 text-left hover:border-black dark:hover:border-white transition-colors"
            >
              <PenLine size={20} />
              <div>
                <p className="text-sm font-semibold">Enter manually</p>
                <p className="text-xs text-neutral-500">Type in calories and macros</p>
              </div>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (mode === "barcode") {
    return <BarcodeLogModal localDate={localDate} onClose={onClose} onSaved={onSaved} />;
  }

  if (mode === "voice") {
    return <VoiceLogModal localDate={localDate} onClose={onClose} onSaved={onSaved} />;
  }

  if (mode === "scan") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
        <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 text-center transition-colors">
          {scanning ? (
            <>
              <p className="text-sm font-semibold mb-1">Reading your meal…</p>
              <p className="text-xs text-neutral-500">This takes a few seconds.</p>
            </>
          ) : (
            <>
              {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
              <button
                onClick={() => setMode("choose")}
                className="text-sm text-neutral-500 flex items-center gap-1 mx-auto"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return <ManualEntry localDate={localDate} onBack={() => setMode("choose")} onClose={onClose} onSaved={onSaved} />;
}

function ManualEntry({ localDate, onBack, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = name.trim().length > 0 && Number(calories) > 0;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localDate,
          note: name.trim(),
          manualMacros: {
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
          },
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
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 outline-none focus:border-black dark:focus:border-white transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-sm text-neutral-500 flex items-center gap-1">
            <ChevronLeft size={16} />
            Back
          </button>
          <p className="text-sm font-bold">Enter manually</p>
          <button onClick={save} disabled={!canSave || saving} className="text-sm font-bold disabled:opacity-30">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className={inputClass}
            placeholder="Calories"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <div className="flex gap-3">
            <input
              className={inputClass}
              placeholder="Protein (g)"
              inputMode="numeric"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Carbs (g)"
              inputMode="numeric"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Fat (g)"
              inputMode="numeric"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <button onClick={onClose} className="text-xs text-neutral-500 mt-6">
          Cancel
        </button>
      </div>
    </div>
  );
}
