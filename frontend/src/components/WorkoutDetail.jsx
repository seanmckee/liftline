import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function WorkoutDetail() {
  const { id } = useParams();

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleExerciseChange = (exerciseId, setId, name, reps, weight) => {
    const toNum = (v) => (v === "" || v === null || v === undefined ? null : v);
    const updatedExercises = exercises.map((exercise) => {
      if (exercise.exercise_id === exerciseId) {
        return {
          ...exercise,
          exercise_name: name !== undefined && name !== null ? name : exercise.exercise_name,
          sets: exercise.sets.map((set) =>
            set.set_id === setId
              ? {
                  ...set,
                  reps: reps !== undefined ? toNum(reps) : set.reps,
                  weight: weight !== undefined ? toNum(weight) : set.weight,
                }
              : set,
          ),
        };
      }
      return exercise;
    });
    setExercises(updatedExercises);
  };

  const getWorkout = async () => {
    try {
      const token = localStorage.getItem("token");
      let exercisesMap = {};
      const response = await axios.get(`http://localhost:3000/workouts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let workout = response.data;
      for (let i = 0; i < workout.length; i++) {
        // Skip rows with no exercise (workout-only metadata from LEFT JOIN)
        if (workout[i].exercise_id == null) continue;
        if (!exercisesMap[workout[i].exercise_id]) {
          exercisesMap[workout[i].exercise_id] = {
            exercise_id: workout[i].exercise_id,
            exercise_name: workout[i].exercise_name,
            exercise_notes: workout[i].exercise_notes,
            sets: [],
          };
        }
        if (workout[i].set_id) {
          exercisesMap[workout[i].exercise_id].sets.push({
            set_id: workout[i].set_id,
            reps: workout[i].reps,
            weight: workout[i].weight,
          });
        }
      }

      const parsedExercises = Object.values(exercisesMap);
      console.log("Parsed Exercises", parsedExercises);
      setWorkoutName(workout[0].workout_name);
      setWorkoutDate(workout[0].workout_date);
      setExercises(parsedExercises);
      setLoading(false);
    } catch (error) {
      console.error("Error getting workout:", error);
    }
  };

  const handleAddExercise = async () => {
    try {
      // add blank exercise to workout in state
      const newExercise = {
        exercise_id: exercises.length + 1,
        exercise_name: "",
        exercise_notes: "",
        sets: [],
      };
      setExercises([...exercises, newExercise]);
      console.log("Exercise added", newExercise);
    } catch (error) {
      console.error(
        `Error adding exercise: ${error.response?.data?.error || error.message}`,
      );
    }
  };

  const handleAddSet = async (exerciseId) => {
    try {
      const newSet = {
        set_id:
          exercises.find((exercise) => exercise.exercise_id === exerciseId).sets
            .length + 1,
        reps: 0,
        weight: 0,
      };
      const updatedExercises = exercises.map((exercise) => {
        if (exercise.exercise_id === exerciseId) {
          return { ...exercise, sets: [...exercise.sets, newSet] };
        }
        return exercise;
      });
      setExercises(updatedExercises);
      console.log("Set added", newSet);
    } catch (error) {
      console.error("Error adding set:", error);
    }
  };

  const handleDeleteSet = async (exerciseId, setId) => {
    try {
      const updatedExercises = exercises.map((exercise) => {
        if (exercise.exercise_id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.set_id !== setId),
          };
        }
        return exercise;
      });
      setExercises(updatedExercises);
      console.log("Set deleted", setId);
    } catch (error) {
      console.error("Error deleting set:", error);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      // delete exercise from state
      const updatedExercises = exercises.filter(
        (exercise) => exercise.exercise_id !== exerciseId,
      );
      setExercises(updatedExercises);
      console.log("Exercise deleted", exerciseId);
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3000/workouts/${id}/full`,
        {
          workout_name: workoutName,
          workout_date: workoutDate,
          exercises: exercises,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Workout updated", response.data);
      getWorkout();
    } catch (error) {
      console.error("Error editing workout:", error);
    }
  };

  useEffect(() => {
    console.log(exercises);
    getWorkout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to="/workouts"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Workouts
        </Link>

        <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
          {/* Workout header card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
            <h1 className="text-white font-bold text-xl">Edit Workout</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Workout Name
                </label>
                <input
                  type="text"
                  placeholder="Workout Name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={new Date(workoutDate).toISOString().split("T")[0]}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-base">Exercises</h3>
            {exercises.length === 0 && (
              <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl py-12 px-4 text-center">
                <p className="text-gray-500 text-sm mb-4">No exercises yet.</p>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-colors"
                >
                  Add First Exercise
                </button>
              </div>
            )}
            {exercises.length > 0 &&
              exercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Exercise header */}
                  <div className="p-4 flex items-center gap-3 border-b border-gray-800">
                    <input
                      type="text"
                      placeholder="Exercise Name"
                      value={exercise.exercise_name || ""}
                      onChange={(e) =>
                        handleExerciseChange(
                          exercise.exercise_id,
                          null,
                          e.target.value,
                          null,
                          null,
                        )
                      }
                      className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => handleDeleteExercise(exercise.exercise_id)}
                      title="Delete exercise"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="p-4 flex flex-col gap-3">
                    {exercise.sets.length > 0 && (
                      <>
                        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center text-xs text-gray-500 font-medium">
                          <span className="w-8">Set</span>
                          <span>Reps</span>
                          <span>Weight (lbs)</span>
                          <span className="w-14" />
                        </div>
                        <ul className="flex flex-col gap-2">
                          {exercise.sets.map((set, index) => (
                            <li
                              key={set.set_id}
                              className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center"
                            >
                              <span className="w-8 text-gray-500 text-sm font-medium">
                                {index + 1}
                              </span>
                              <input
                                type="number"
                                placeholder="—"
                                value={set.reps ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? null : e.target.value;
                                  handleExerciseChange(
                                    exercise.exercise_id,
                                    set.set_id,
                                    null,
                                    val,
                                    set.weight,
                                  );
                                }}
                                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <input
                                type="number"
                                placeholder="—"
                                value={set.weight ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? null : e.target.value;
                                  handleExerciseChange(
                                    exercise.exercise_id,
                                    set.set_id,
                                    null,
                                    set.reps,
                                    val,
                                  );
                                }}
                                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                className="w-14 text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-lg text-xs font-medium transition-colors"
                                onClick={() =>
                                  handleDeleteSet(exercise.exercise_id, set.set_id)
                                }
                                title="Delete set"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <button
                      type="button"
                      className="w-full border border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 font-medium py-2.5 rounded-lg text-sm transition-colors"
                      onClick={() => handleAddSet(exercise.exercise_id)}
                    >
                      + Add Set
                    </button>
                  </div>
                </div>
              ))}

            <button
              onClick={handleAddExercise}
              type="button"
              className="w-full border border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              + Add Exercise
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkoutDetail;
