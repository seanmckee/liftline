import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function WorkoutDetail() {

    const { id } = useParams();

    const [workoutName, setWorkoutName] = useState('');
    const [workoutDate, setWorkoutDate] = useState('');
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleExerciseChange = (exerciseId, setId, name, reps, weight) => {
        const updatedExercises = exercises.map(exercise => {
            if(exercise.exercise_id === exerciseId){
                return {
                    ...exercise,
                    exercise_name: name ?? exercise.exercise_name,
                    sets: exercise.sets.map(set => set.set_id === setId ? { 
                        ...set, 
                        reps: reps ?? set.reps, 
                        weight: weight ?? set.weight 
                    } : set)
                };
            }
            return exercise;
        });
        setExercises(updatedExercises);
    }

    const getWorkout = async () => {
        try {
            const token = localStorage.getItem('token');
            let exercisesMap = {};
            const response = await axios.get(`http://localhost:3000/workouts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            let workout = response.data;
            for(let i = 0; i < workout.length; i++){
                if(!exercisesMap[workout[i].exercise_id]){
                  exercisesMap[workout[i].exercise_id] = {
                    exercise_id: workout[i].exercise_id,
                    exercise_name: workout[i].exercise_name,
                    exercise_notes: workout[i].exercise_notes,
                    sets: []
                  };
                }
                if (workout[i].set_id) {
                  exercisesMap[workout[i].exercise_id].sets.push({
                    set_id: workout[i].set_id,
                    reps: workout[i].reps,
                    weight: workout[i].weight
                  });
                }
              }
              
            const parsedExercises = Object.values(exercisesMap);

            setWorkoutName(workout[0].workout_name);
            setWorkoutDate(workout[0].workout_date);
            setExercises(parsedExercises);
            setLoading(false);
        } catch (error) {
            console.error('Error getting workout:', error);
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // TODO: Finish route and update handleEditSubmit function
        } catch (error) {
            console.error('Error editing workout:', error);
        }
    }

    useEffect(() => {
        getWorkout();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button className='bg-blue-500 text-white p-2 rounded-md'>
                <Link to="/workouts">Back</Link>
            </button>
            
            <form className='flex flex-col gap-2' onSubmit={handleEditSubmit}>
                <div className='flex'>
                    <label htmlFor="name">Workout Name:</label>
                    <input type="text" placeholder='Workout Name' value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                    <label htmlFor="date">Workout Date:</label>
                    <input type="date" placeholder='Workout Date' value={new Date(workoutDate).toISOString().split('T')[0]} onChange={(e) => setWorkoutDate(e.target.value)} />
                </div>
                <div className='flex flex-col gap-2'>
                    <h3 className='text-lg font-bold'>Exercises</h3>
                    <ul>
                        {exercises.map(exercise => {
                            return (
                                <li key={exercise.exercise_id}>
                                    <input type="text" placeholder='Exercise Name' value={exercise.exercise_name} onChange={(e) => handleExerciseChange(exercise.exercise_id, null, e.target.value, null, null)} />
                                    <ul>
                                        {exercise.sets.map(set => {
                                            return (
                                                <li key={set.set_id}>
                                                    Reps: <input type="number" placeholder='Reps' value={set.reps} onChange={(e) => handleExerciseChange(exercise.exercise_id, set.set_id, null, e.target.value, null)} /> 
                                                    Weight: <input type="number" placeholder='Weight' value={set.weight} onChange={(e) => handleExerciseChange(exercise.exercise_id, set.set_id, null, null, e.target.value)} />
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <button type="submit">Submit Changes</button>
            </form>
        </div>
    );
}

export default WorkoutDetail;