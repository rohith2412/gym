"use client";

import { useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";

/**
 * Web port of gym-ios's VoiceNutritionSheet. Same flow: record ->
 * upload to the real /api/voice/nutrition (Whisper transcription +
 * GPT parsing, already fully built server-side) -> review parsed foods
 * + water -> confirm -> save each food via /api/meal-log
 * (manualMacros) and water via /api/water.
 *
 * Uses the browser's MediaRecorder API instead of expo-av -- no native
 * module needed, works on mobile Safari/Chrome.
 */
export function VoiceLogModal({ localDate, onClose, onSaved }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [foods, setFoods] = useState(null);
  const [waterMl, setWaterMl] = useState(0);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        parseRecording(blob, mimeType);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone unavailable. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const parseRecording = async (blob, mimeType) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      const ext = mimeType.includes("webm") ? "webm" : "mp4";
      form.append("audio", blob, `voice.${ext}`);
      const res = await fetch("/api/voice/nutrition", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Couldn't process that recording");
        setBusy(false);
        return;
      }
      setTranscript(json.transcript || "");
      setFoods(json.foods || []);
      setWaterMl(json.waterMl || 0);
      if (!json.transcript?.trim() || ((json.foods?.length ?? 0) === 0 && !json.waterMl)) {
        setError("Couldn't hear any food or drink in that. Try again.");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const removeFood = (idx) => {
    setFoods((prev) => prev.filter((_, i) => i !== idx));
  };

  const hasSomethingToSave = (foods?.length ?? 0) > 0 || waterMl > 0;

  const save = async () => {
    if (!hasSomethingToSave || saving) return;
    setSaving(true);
    try {
      let lastDoc = null;
      for (const f of foods ?? []) {
        const res = await fetch("/api/meal-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localDate,
            note: f.name,
            manualMacros: f,
          }),
        });
        const json = await res.json();
        if (json?.success) lastDoc = json.data;
      }
      if (waterMl > 0) {
        await fetch("/api/water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: localDate, ml: waterMl, mode: "add" }),
        }).catch(() => {});
      }
      onSaved(lastDoc);
    } catch {
      setError("Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 transition-colors max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold">Voice log</p>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={busy}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: recording ? "#EF4444" : "#0B0B0C" }}
          >
            {recording ? <Square size={26} color="#fff" fill="#fff" /> : <Mic size={28} color="#fff" />}
          </button>
          <p className="text-sm font-semibold mt-4">
            {busy ? "Transcribing…" : recording ? "Listening… tap to stop" : "Tap to speak"}
          </p>
          {!recording && !foods && !busy && (
            <p className="text-xs text-neutral-500 text-center mt-1">
              Try: "chicken salad and two glasses of water"
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-500 text-center mb-4">{error}</p>}

        {transcript && (
          <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 mb-4">
            <p className="text-[10px] font-bold text-neutral-500 tracking-wide mb-1">HEARD</p>
            <p className="text-sm">"{transcript}"</p>
          </div>
        )}

        {foods && foods.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-xs font-semibold text-neutral-500">FOOD</p>
            {foods.map((f, i) => (
              <div
                key={i}
                className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold">{f.name}</p>
                  <p className="text-xs text-neutral-500">
                    {f.calories} cal · P {f.protein}g · C {f.carbs}g · F {f.fat}g
                  </p>
                </div>
                <button onClick={() => removeFood(i)}>
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {waterMl > 0 && (
          <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 flex items-center gap-3 mb-4">
            <div className="flex-1">
              <p className="text-sm font-bold">{(waterMl / 1000).toFixed(2)} L</p>
              <p className="text-xs text-neutral-500">{waterMl} ml water</p>
            </div>
            <button onClick={() => setWaterMl(0)}>
              <X size={18} className="text-neutral-400" />
            </button>
          </div>
        )}

        {hasSomethingToSave && (
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "Saving…" : "Add to today"}
          </button>
        )}
      </div>
    </div>
  );
}
