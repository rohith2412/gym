"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MuscleGroupCard = ({ name, route, latestWorkout, trend }) => {
  const router = useRouter();

  // Calculate trend percentage based on last two workouts
  const getTrendPercentage = () => {
    if (!trend || trend.length < 2) return null;
    const current = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };
//createLinePath
  const trendPercent = getTrendPercentage();
  const isPositive = trendPercent > 0;

  // Create SVG path for line chart name
  const createLinePath = () => {
    if (!trend || trend.length === 0) return "";

    const width = 80;
    const height = 28;
    const maxValue = Math.max(...trend);
    const minValue = Math.min(...trend);
    const range = maxValue - minValue || 1;

    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y };
    });

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;

      path += ` Q ${prev.x},${prev.y} ${midX},${(prev.y + curr.y) / 2}`;
      path += ` Q ${curr.x},${curr.y} ${curr.x},${curr.y}`;
    }

    return path;
  };

  return (
    <button
      onClick={() => router.push(route)}
      className=" p-2 pl-4 transition-all text-left group border-b border-neutral-900 pb-1"
    >
      <div className="flex items-center justify-between mb-3">
        {/* Left: Name only */}
        <h3 className="text-white font-medium">{name}</h3>

        {/* Right: Chart + percentage */}
        <div className="flex gap-3 items-end">
          {trend && trend.length > 0 && (
            <svg width="80" height="28" className="opacity-60 mb-1">
              <path
                d={createLinePath()}
                fill="none"
                stroke={isPositive ? "#4ade80" : "#f87171"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {trendPercent !== null && (
            <span
              className={`text-sm font-medium tabular-nums ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {trendPercent}%
            </span>
          )}
        </div>
      </div>
    </button>
    
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
    { name: "Core & Abs", route: "/v1/list/core", muscleGroup: "Core & Abs" },
    { name: "Forearms", route: "/v1/list/forearms", muscleGroup: "Forearms" },
    { name: "Legs", route: "/v1/list/legs", muscleGroup: "Legs" },
    {
      name: "Shoulders",
      route: "/v1/list/shoulders",
      muscleGroup: "Shoulders",
    },
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
              latestWorkout: null,
              trend: [],
              lastWorkoutDate: null,
            };
          }

          // Sort by date descending
          groupWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));

          const latestWorkout = groupWorkouts[0];
          const lastWorkoutDate = new Date(latestWorkout.date);

          // Get last 7 workouts for trend (or fewer if not available)
          const trendData = groupWorkouts
            .slice(0, 7)
            .reverse()
            .map((w) => {
              // Calculate total volume (weight × reps) for the workout
              return w.sets.reduce(
                (sum, set) => sum + set.weight * set.reps,
                0,
              );
            });

          return {
            ...group,
            latestWorkout: {
              exercise: latestWorkout.exercise,
              weight: latestWorkout.sets[0].weight,
              reps: latestWorkout.sets[0].reps,
            },
            trend: trendData,
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
    }; //MuscleGroupCard

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
        {/* Header */}
        {/* <div className="mb-12">
          <h1 className=" text-gray-300  font-medium mb-1">Dashboard</h1>
        </div> */}

        {/* Muscle Groups Grid */} 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {muscleGroups.map((group) => (
            <MuscleGroupCard
              key={group.name}
              name={group.name}
              route={group.route}
              latestWorkout={group.latestWorkout}
              trend={group.trend}
            />
            //name
          ))}
          
        </div>
      </div>
    </div>
  );
}
