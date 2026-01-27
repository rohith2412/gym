"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MuscleGroupCard = ({ name, route, exercises }) => {
  const router = useRouter();

  return (
    <div className="p-4 border-b border-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">{name}</h3>
        <button
          onClick={() => router.push(route)}
          className="hover:opacity-70 transition-opacity"
          aria-label="Add workout"
        >
          <img src="/AddButton.svg" alt="Add" width="24" height="24" />
        </button>
      </div>
      {exercises && exercises.length > 0 ? (
        <div className="space-y-1">
          {exercises.map((exercise, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-neutral-500 text-sm">{exercise.name}</span>
              <span className="text-neutral-400 text-sm">{exercise.maxWeight} lbs</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-600 text-sm">No workouts yet</p>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const muscleGroupsConfig = [
    { name: "Arms", route: "/v1/list/arms", muscleGroup: "Arms" },
    { name: "Back", route: "/v1/list/back", muscleGroup: "Back" },
    { name: "Chest", route: "/v1/list/chest", muscleGroup: "Chest" },
    { name: "Core & Abs", route: "/v1/list/core&abs", muscleGroup: "Core & Abs" },
    { name: "Forearms", route: "/v1/list/forearms", muscleGroup: "Forearms" },
    { name: "Legs", route: "/v1/list/legs", muscleGroup: "Legs" },
    { name: "Shoulders", route: "/v1/list/shoulders", muscleGroup: "Shoulders" },
    { name: "Triceps", route: "/v1/list/triceps", muscleGroup: "Triceps" },
  ];

  useEffect(() => {
    if (!userId) return;

    const fetchWorkoutData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/dashboard?userId=${userId}`);
        const data = await response.json();

        // Process data for each muscle group
        const processedGroups = muscleGroupsConfig.map((group) => {
          const groupWorkouts = data.filter(
            (w) => w.muscleGroup === group.muscleGroup,
          );

          if (groupWorkouts.length === 0) {
            return {
              ...group,
              exercises: [],
              lastWorkoutDate: null,
            };
          }

          // Sort by date descending
          groupWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
          const lastWorkoutDate = new Date(groupWorkouts[0].date);

          // Group by exercise and find max weight for each
          const exerciseMap = {};
          groupWorkouts.forEach((workout) => {
            const exerciseName = workout.exercise;
            
            // Find max weight for this exercise
            const maxWeightInWorkout = Math.max(
              ...workout.sets.map(set => set.weight)
            );

            if (!exerciseMap[exerciseName] || maxWeightInWorkout > exerciseMap[exerciseName]) {
              exerciseMap[exerciseName] = maxWeightInWorkout;
            }
          });

          // Convert to array format
          const exercises = Object.entries(exerciseMap).map(([name, maxWeight]) => ({
            name,
            maxWeight,
          }));

          return {
            ...group,
            exercises,
            lastWorkoutDate,
          };
        });

        // Sort by last workout date (most recent first)
        processedGroups.sort((a, b) => {
          if (!a.lastWorkoutDate) return 1;
          if (!b.lastWorkoutDate) return -1;
          return b.lastWorkoutDate - a.lastWorkoutDate;
        });

        setMuscleGroups(processedGroups);
      } catch (error) {
        console.error("Error fetching workout data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [userId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <p className="text-neutral-500 text-sm">
            Sign in to view your progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* All devices: Single column on mobile, grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {muscleGroups.map((group) => (
            <MuscleGroupCard
              key={group.name}
              name={group.name}
              route={group.route}
              exercises={group.exercises}
            />
          ))}
        </div>
      </div>
    </div>
  );
}