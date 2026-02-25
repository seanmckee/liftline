import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkoutForm from './WorkoutForm';

function Workouts() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const getWorkouts = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/workouts', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log("Workouts", response.data);
          setWorkouts(response.data);
        } catch (error) {
          console.error('Error getting workouts:', error);
        }
      }

      const deleteWorkout = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:3000/workouts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Workout deleted", response.data);
            getWorkouts();
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
      }

    useEffect(() => {
        getWorkouts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-white">My Workouts</h1>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            + Add Workout
                        </button>
                    )}
                </div>

                {/* Inline form */}
                {showForm && (
                    <div className="mb-6">
                        <WorkoutForm setShowForm={setShowForm} getWorkouts={getWorkouts} />
                    </div>
                )}

                {/* Workout list */}
                {workouts.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-12">No workouts yet. Add one to get started!</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {workouts.map((workout) => (
                            <li
                                key={workout.id}
                                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between"
                            >
                                <span className="text-white font-medium">{workout.name}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/workouts/${workout.id}`)}
                                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => deleteWorkout(workout.id)}
                                        className="bg-red-900/40 hover:bg-red-800/60 text-red-400 text-sm px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Workouts;
