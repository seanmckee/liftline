import { useState } from 'react';
import axios from 'axios';

function WorkoutForm({setShowForm, getWorkouts}) {
    const [workoutName, setWorkoutName] = useState('');
    const [workoutDate, setWorkoutDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/workouts', {
                name: workoutName,
                workout_date: workoutDate
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("New workout", response.data);
            setShowForm(false);
            setWorkoutName('');
            setWorkoutDate('');
            getWorkouts();
        } catch (error) {
            console.error('Error adding workout:', error);
        }
    }

    const handleCancel = () => {
        setShowForm(false);
        setWorkoutName('');
        setWorkoutDate('');
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold text-base mb-4">New Workout</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Workout name"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    required
                    className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    required
                    className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-1">
                    <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm py-2.5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default WorkoutForm;
