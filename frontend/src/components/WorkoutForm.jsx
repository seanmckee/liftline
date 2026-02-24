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
        <div>
            <h1>Workout Form</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Workout Name" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                <input type="date" placeholder="Workout Date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
        </div>
    );
}

export default WorkoutForm;