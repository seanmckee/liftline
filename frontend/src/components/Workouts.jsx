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
        <div className='font-bold'>
            <h1>Workouts</h1>
            {!showForm &&
            <button 
                onClick={() => setShowForm(!showForm)}
            >
                Add Workout
            </button>
            }
            {showForm && <WorkoutForm setShowForm={setShowForm} getWorkouts={getWorkouts} />}
            <ul>
                {workouts.map((workout) => (
                    <li key={workout.id}>
                        {workout.name}
                        <button onClick={() => navigate(`/workouts/${workout.id}`)}>View</button>
                        <button onClick={() => deleteWorkout(workout.id)}>Delete</button>
                    </li>
                ))}
            </ul>

        </div>
    );
}

export default Workouts;