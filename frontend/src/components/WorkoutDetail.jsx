import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function WorkoutDetail() {

    const [workout, setWorkout] = useState(null);
    const { id } = useParams();

    const getWorkout = async () => {
        try {
            const token = localStorage.getItem('token');
            let exercisesMap = {};
            const response = await axios.get(`http://localhost:3000/workouts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            let workout = response.data
            for(let i = 0; i < workout.length; i++){
                // Group by exercise_id, not workout_name
                if(!exercisesMap[workout[i].exercise_id]){
                  exercisesMap[workout[i].exercise_id] = {
                    exercise_id: workout[i].exercise_id,
                    exercise_name: workout[i].exercise_name,
                    exercise_notes: workout[i].exercise_notes,
                    sets: []  // Array to hold sets
                  };
                }
                
                // Add the set to this exercise
                if (workout[i].set_id) {  // Only if set exists
                  exercisesMap[workout[i].exercise_id].sets.push({
                    set_id: workout[i].set_id,
                    reps: workout[i].reps,
                    weight: workout[i].weight
                  });
                }
              }
              
              // Convert to array
              const exercises = Object.values(exercisesMap);

            console.log("Exercises ", exercises);
            console.log("date", workout[0].workout_date)
            setWorkout({
                name: workout[0].workout_name,
                date: workout[0].workout_date,
                exercises: exercises
            });
        } catch (error) {
            console.error('Error getting workout:', error);
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        
    }

    useEffect(() => {
        getWorkout();
    }, []);

    if (!workout) {
        return <div>Loading...</div>;
      }
    return (
        <div>
            <Link to="/workouts">Back</Link>
                
                {/* Workout edit form */}
                <form onSubmit={handleEditSubmit}>
                    <div className='flex'>
                    <label htmlFor="name">Workout Name:</label>
                    <input type="text" placeholder='Workout Name' value={workout.name} />
                    <label htmlFor="date">Workout Date:</label>
                    <input type="date" placeholder='Workout Date' value={new Date(workout.date).toISOString().split('T')[0]} />
                    </div>
                    
                </form>

                <h1>{workout.name}</h1>
                <h2>{new Date(workout.date).toLocaleDateString()}</h2>                
                <h3>Exercises</h3>
                <ul>
                    {workout.exercises.map(exercise => {
                        return (
                            <li key={exercise.exercise_id}>
                                <h3>{exercise.exercise_name}</h3>
                                <ul>
                                {exercise.sets.map(set => {
                                    return (
                                        <li key={set.set_id}>
                                            <p>{"Reps: " + set.reps + " Weight: " + set.weight}</p>
                                        </li>
                                    )
                                })}
                                </ul>
                            </li>
                        )
                    })}
                </ul>
            </div>
        );
    }

export default WorkoutDetail;