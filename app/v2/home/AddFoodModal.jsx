"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BarcodeLogModal } from "./BarcodeLogModal";
import { VoiceLogModal } from "./VoiceLogModal";
import { uploadFoodPhoto } from "./uploadPhoto";

/**
 * Renders whichever logging flow the FabMenu-style picker in page.jsx
 * chose -- "choose" itself now lives there since it needs to animate
 * out of the FAB's actual DOM position, matching gym-ios's
 * src/ui/FabMenu.tsx. This component only handles what comes after a
 * choice is made:
 *   - "scan": uploads `file` to R2 (same presign flow mobile's
 *     uploadImageToR2 uses) IN PARALLEL with base64-encoding it for
 *     the AI call, then POSTs { image, imageUrl } to /api/meal-log in
 *     one request. GPT-4o vision path is fully built server-side --
 *     estimates the full nutrient panel AND inserts the document, no
 *     separate confirm step. If the R2 upload fails, the scan still
 *     proceeds without a saved photo rather than blocking the log.
 *   - "barcode": BarcodeLogModal.
 *   - "voice": VoiceLogModal.
 *   - "manual": inline form, POSTs { manualMacros }.
 */
/**
 * Some cameras/photo libraries (iPhone Photos in particular) hand over
 * HEIC files, not JPEG -- and the backend's AI-vision call previously
 * mislabeled every image as image/png or image/jpeg regardless of its
 * real format (see meal-log/route.js), so a raw HEIC upload would get
 * sent to OpenAI's vision API declared as JPEG and fail to decode
 * correctly, or silently produce garbage. Round-tripping through a
 * canvas guarantees a real JPEG comes out the other end no matter what
 * format went in -- Safari can decode HEIC via createImageBitmap even
 * though the vision API and most browsers can't read raw HEIC bytes.
 */
async function normalizeToJpeg(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function AddFoodModal({ initialMode, file, localDate, onClose, onSaved, onRetake }) {
  if (initialMode === "barcode") {
    return <BarcodeLogModal localDate={localDate} onClose={onClose} onSaved={onSaved} />;
  }

  if (initialMode === "voice") {
    return <VoiceLogModal localDate={localDate} onClose={onClose} onSaved={onSaved} />;
  }

  if (initialMode === "scan") {
    return <ScanFlow file={file} localDate={localDate} onClose={onClose} onSaved={onSaved} onRetake={onRetake} />;
  }

  return <ManualEntry localDate={localDate} onClose={onClose} onSaved={onSaved} />;
}

const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Photo → review → save, matching gym-ios's PhotoLogSheet.tsx exactly:
 * preview the photo with Retake/Calculate first (no auto-analyze on
 * pick), show a spinner while GPT-4o works, then land on an editable
 * AI-estimate form (name/calories/macros/fiber/sugar/sodium/sat-fat)
 * the user can correct before it's actually logged.
 *
 * The backend has no "analyze only" endpoint -- POST /api/meal-log's
 * AI-vision path both analyzes AND inserts the doc in one call, same
 * as before this rework. So "Calculate" creates the doc immediately,
 * and the review step that follows PATCHes it with whatever the user
 * edited. If they close the sheet during review without saving, the
 * doc is deleted so an abandoned scan doesn't leave a stray entry.
 */
function ScanFlow({ file, localDate, onClose, onSaved, onRetake }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [normalizedFile, setNormalizedFile] = useState(null);
  const [stage, setStage] = useState("preview"); // "preview" | "analyzing" | "review"
  const [doc, setDoc] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const f = await normalizeToJpeg(file);
      if (cancelled) return;
      setNormalizedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    })();
    return () => cancelled = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abandoning mid-review (closing without hitting Save) shouldn't
  // leave a half-confirmed entry sitting in the log.
  const closeAndDiscard = () => {
    if (doc?._id) fetch(`/api/meal-log?id=${doc._id}`, { method: "DELETE" }).catch(() => {});
    onClose();
  };

  const calculate = async () => {
    if (!normalizedFile) return;
    setStage("analyzing");
    setError("");
    try {
      const toDataUrl = () =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(normalizedFile);
        });

      const [dataUrl, imageUrl] = await Promise.all([
        toDataUrl(),
        uploadFoodPhoto(normalizedFile).catch(() => null),
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
        setStage("preview");
        return;
      }
      const t = json.data.totals || {};
      setDoc(json.data);
      setEdit({
        name: json.data.foods?.[0]?.name || "",
        calories: String(Math.round(t.calories || 0)),
        protein: String(Math.round(t.protein || 0)),
        carbs: String(Math.round(t.carbs || 0)),
        fat: String(Math.round(t.fat || 0)),
        fiber: t.fiber != null ? String(round1(t.fiber)) : "",
        sugar: t.sugar != null ? String(round1(t.sugar)) : "",
        sodium: t.sodium != null ? String(Math.round(t.sodium)) : "",
        satFat: t.satFat != null ? String(round1(t.satFat)) : "",
      });
      setStage("review");
    } catch {
      setError("Something went wrong");
      setStage("preview");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const totals = {
        ...doc.totals,
        calories: Number(edit.calories) || 0,
        protein: Number(edit.protein) || 0,
        carbs: Number(edit.carbs) || 0,
        fat: Number(edit.fat) || 0,
        fiber: parseFloat(edit.fiber) || 0,
        sugar: parseFloat(edit.sugar) || 0,
        sodium: Number(edit.sodium) || 0,
        satFat: parseFloat(edit.satFat) || 0,
      };
      const foods = doc.foods?.length
        ? [{ ...doc.foods[0], name: edit.name.trim() || doc.foods[0].name, macros: totals }]
        : [{ name: edit.name.trim() || "Meal", portion: "custom", macros: totals, confidence: 1 }];

      const res = await fetch(`/api/meal-log?id=${doc._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totals, foods }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't save");
        setSaving(false);
        return;
      }
      onSaved({ ...doc, totals, foods });
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const outlineBtn =
    "flex-1 h-[52px] rounded-2xl border border-neutral-300 dark:border-neutral-700 font-semibold text-sm hover:border-black dark:hover:border-white transition-colors";
  const solidBtn =
    "flex-1 h-[52px] rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm disabled:opacity-40 transition-opacity";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-neutral-500">Photo log</p>
            <p className="text-xl font-bold tracking-tight">Snap it</p>
          </div>
          <button
            onClick={stage === "review" ? closeAndDiscard : onClose}
            className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4" />
        )}

        {stage === "preview" && (
          <div className="flex gap-3">
            <button onClick={onRetake} className={outlineBtn}>
              Retake
            </button>
            <button onClick={calculate} disabled={!normalizedFile} className={solidBtn}>
              Calculate
            </button>
          </div>
        )}

        {stage === "analyzing" && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl border border-neutral-300 dark:border-neutral-700">
            <span className="w-4 h-4 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin" />
            <p className="text-sm text-neutral-500">Analyzing your meal…</p>
          </div>
        )}

        {stage === "review" && edit && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-neutral-500 tracking-wide">AI ESTIMATE · EDIT IF NEEDED</p>
            <ScanField label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
            <ScanField label="Calories" unit="cal" numeric value={edit.calories} onChange={(v) => setEdit({ ...edit, calories: v })} />
            <div className="flex gap-2">
              <ScanField flex label="Protein" unit="g" numeric value={edit.protein} onChange={(v) => setEdit({ ...edit, protein: v })} />
              <ScanField flex label="Carbs" unit="g" numeric value={edit.carbs} onChange={(v) => setEdit({ ...edit, carbs: v })} />
              <ScanField flex label="Fat" unit="g" numeric value={edit.fat} onChange={(v) => setEdit({ ...edit, fat: v })} />
            </div>
            <div className="flex gap-2">
              <ScanField flex label="Fiber" unit="g" decimal value={edit.fiber} onChange={(v) => setEdit({ ...edit, fiber: v })} />
              <ScanField flex label="Sugar" unit="g" decimal value={edit.sugar} onChange={(v) => setEdit({ ...edit, sugar: v })} />
              <ScanField flex label="Sodium" unit="mg" numeric value={edit.sodium} onChange={(v) => setEdit({ ...edit, sodium: v })} />
              <ScanField flex label="Sat fat" unit="g" decimal value={edit.satFat} onChange={(v) => setEdit({ ...edit, satFat: v })} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={save} disabled={saving} className={`${solidBtn} w-full`}>
              {saving ? "Saving…" : "Save meal"}
            </button>
          </div>
        )}

        {error && stage !== "review" && <p className="text-xs text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}

function ScanField({ label, value, onChange, unit, numeric, decimal, flex }) {
  const sanitize = (t) => {
    if (decimal) {
      const clean = t.replace(/[^0-9.]/g, "");
      const parts = clean.split(".");
      return parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : clean;
    }
    if (numeric) return t.replace(/[^0-9]/g, "");
    return t;
  };
  return (
    <label className={`flex flex-col gap-1 ${flex ? "flex-1" : ""}`}>
      <span className="text-[9px] font-bold text-neutral-500 tracking-wide uppercase">{label}</span>
      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-xl px-2.5 h-[42px]">
        <input
          value={value}
          onChange={(e) => onChange(sanitize(e.target.value))}
          inputMode={decimal ? "decimal" : numeric ? "numeric" : "text"}
          className="flex-1 min-w-0 bg-transparent text-sm font-bold outline-none"
        />
        {unit && <span className="text-[10px] text-neutral-400 flex-shrink-0">{unit}</span>}
      </div>
    </label>
  );
}

function ManualEntry({ localDate, onClose, onSaved }) {
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
          <button onClick={onClose} className="text-sm text-neutral-500">
            Cancel
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
      </div>
    </div>
  );
}
