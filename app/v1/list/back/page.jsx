"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Main back exercises
const backExercises = [
  "Deadlift",
  "Pull-Ups",
  "Barbell Row",
  "Lat Pulldown",
  "Seated Cable Row",
  "T-Bar Row"
];

export default function BackPage() {
  // Get user session
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // Component state
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form submission to add new set
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !reps || !selectedExercise || !userId) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Save new workout
      const res = await fetch("/api/workoutLogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          exercise: selectedExercise,
          muscleGroup: "Back",
          sets: [{ weight: Number(weight), reps: Number(reps) }],
        }),
      });

      if (!res.ok) throw new Error("Failed to add workout log");

      // Clear form and show success
      setWeight("");
      setReps("");
      setSuccessMessage("Set logged");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to add workout");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <h2 className="text-white text-xl font-medium mb-1">Back Tracker</h2>
          <p className="text-neutral-500 text-sm">Sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-medium mb-1">Back</h1>
          <p className="text-neutral-500 text-sm">Select an exercise</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {successMessage}
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-2">
          {backExercises.map((exercise) => (
            <div key={exercise}>
              {/* Exercise Button */}
              <button
                onClick={() =>
                  setSelectedExercise(
                    exercise === selectedExercise ? "" : exercise,
                  )
                }
                className={`w-full text-left px-5 py-4 font-medium transition-all border-b border-neutral-900 focus:outline-none ${
                  selectedExercise === exercise
                    ? "bg-white text-neutral-950"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{exercise}</span>

                  <img
                    src="/ArrowDown.svg"
                    alt="Expand"
                    className={`w-6 h-6 transition-transform ${
                      selectedExercise === exercise ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Add Set Form */}
              {selectedExercise === exercise && (
                <div className="bg-neutral-900/70 backdrop-blur-xl rounded-xl p-5 mt-2 border border-neutral-800/50">
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-neutral-500 text-xs mb-1.5 block">Weight</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2.5 bg-neutral-950/50 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs mb-1.5 block">Reps</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-full px-3 py-2.5 bg-neutral-950/50 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-white text-neutral-950 text-sm font-medium rounded-lg hover:bg-neutral-100 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
                  >
                    {loading ? "Logging..." : "Log set"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}