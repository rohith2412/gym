"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Main chest exercises
const chestExercises = [
  "Barbell Bench Press",
  "Incline Dumbbell Press",
  "Decline Bench Press",
  "Chest Dips",
  "Cable Flyes",
  "Push-Ups"
];

export default function ChestPage() {
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
          muscleGroup: "Chest",
          sets: [{ weight: Number(weight), reps: Number(reps) }],
        }),
      });

      if (!res.ok) throw new Error("Failed to add workout log");

      // Clear form and show success
      setWeight("");
      setReps("");
      setSuccessMessage("Set added successfully!");
      
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">Chest Workout Tracker</h2>
          <p className="text-gray-400">Please sign in to track your workouts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Chest Workout Tracker</h1>
          <p className="text-gray-400">Select an exercise and log your sets</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900 border border-green-700 text-white p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Exercise List with Inline Form */}
        <div className="space-y-3">
          {chestExercises.map((exercise) => (
            <div key={exercise}>
              {/* Exercise Button */}
              <button
                onClick={() => setSelectedExercise(exercise === selectedExercise ? "" : exercise)}
                className={`w-full text-left px-6 py-4 rounded-lg font-medium transition-all ${
                  selectedExercise === exercise
                    ? "bg-white text-black"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {exercise}
              </button>

              {/* Add Set Form - Shows directly below selected exercise */}
              {selectedExercise === exercise && (
                <div className="bg-gray-900 rounded-lg p-6 mt-3 border-l-4 border-white">
                  <h3 className="text-lg font-bold mb-4">Add New Set</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      required
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      required
                      min="1"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
                    >
                      {loading ? "Adding..." : "Add Set"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}