"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const chestExercises = [
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
];

export default function ChestPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [selectedExercise, setSelectedExercise] = useState("");
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch logs when exercise changes
  useEffect(() => {
    if (!selectedExercise || !userId) return;

    setLoading(true);
    setError("");

    fetch(
      `/api/workoutLogs?exercise=${encodeURIComponent(selectedExercise)}&userId=${userId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load workout logs");
        setLoading(false);
      });
  }, [selectedExercise, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !reps || !selectedExercise || !userId) return;

    setLoading(true);
    setError("");

    try {
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

      setWeight("");
      setReps("");

      // Refresh logs
      const logsRes = await fetch(
        `/api/workoutLogs?exercise=${encodeURIComponent(selectedExercise)}&userId=${userId}`
      );
      const data = await logsRes.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("Failed to add workout");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="p-6">Loading user session...</p>;
  }

  if (status === "unauthenticated") {
    return <p className="p-6">Please sign in to track your workouts.</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chest Exercises</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="flex flex-col gap-2 mb-6">
        {chestExercises.map((exercise) => (
          <button
            key={exercise}
            className={`px-4 py-2 rounded transition-colors ${
              selectedExercise === exercise
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedExercise(exercise)}
          >
            {exercise}
          </button>
        ))}
      </div>

      {selectedExercise && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{selectedExercise} Logs</h2>

          {loading && <p className="text-gray-500 mb-4">Loading...</p>}

          <ul className="mb-4">
            {logs.map((log) => (
              <li key={log._id} className="border p-2 rounded mb-2">
                <strong>Date:</strong> {new Date(log.date).toLocaleDateString()}{" "}
                | <strong>Sets:</strong>
                {log.sets.map((s, idx) => (
                  <span key={idx}>
                    {" "}
                    {s.weight} lbs × {s.reps} reps
                    {idx < log.sets.length - 1 ? "," : ""}
                  </span>
                ))}
              </li>
            ))}
            {logs.length === 0 && !loading && <li>No logs yet for this exercise.</li>}
          </ul>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border p-2 rounded w-24"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="border p-2 rounded w-24"
              required
              min="1"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Set"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}