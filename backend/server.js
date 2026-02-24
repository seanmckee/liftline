require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const { hashPassword, comparePassword, generateToken, verifyToken } = require('./auth');

const app = express();
app.use(cors());
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(express.json());

// authentication middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Extract token (remove "Bearer " prefix)
  const token = authHeader.substring(7);
  
  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Attach user ID to request
  req.userId = payload.userId;
  next();
}

app.post("/register", async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const hashedPassword = await hashPassword(password); 

        let newUser = await pool.query(`
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING *
        `, [email, hashedPassword]);
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        next(error)
    }
})

app.post("/login", async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const result = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email]);

        if(result.rows.length === 0) {
            return res.status(401).json({error: "Invalid credentials"});
        }
        const user = result.rows[0];
        const isValid = await comparePassword(password, user.password_hash);
        if(!isValid) {
            return res.status(401).json({error: "Invalid credentials"});
        }
        const token = generateToken(user.id);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
})

app.get("/workouts", requireAuth, async (req, res, next) => {
    try {
        const workouts = await pool.query(`
            SELECT * FROM workouts WHERE user_id = $1
        `, [req.userId]);
        res.json(workouts.rows);
    } catch (error) {
        next(error)
    }
})

app.post("/workouts", requireAuth, async (req, res, next) => {
    try {
        const { name, workout_date } = req.body;
        const newWorkout = await pool.query(`
            INSERT INTO workouts (user_id, name, workout_date)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [req.userId, name, workout_date]);
        res.status(201).json(newWorkout.rows[0]);
            
    } catch (error) {
        next(error)
    }
})

// get a single workout with its exercises and sets
app.get("/workouts/:id", requireAuth, async (req, res, next) => {
    try {
        const workoutId = req.params.id;
        const workout = await pool.query(`
            SELECT workouts.name as workout_name, workouts.id as workout_id, workouts.workout_date as workout_date,
                exercises.name as exercise_name, exercises.id as exercise_id, exercises.notes as exercise_notes,
                sets.reps,
                sets.weight,
                sets.id as set_id
                FROM workouts
            LEFT JOIN exercises ON exercises.workout_id = workouts.id
            LEFT JOIN sets ON sets.exercise_id = exercises.id
            WHERE workouts.id = $1 AND workouts.user_id = $2
        `, [workoutId, req.userId]);

        if(workout.rows.length === 0) {
            return res.status(404).json({ error: "Workout not found" });
        }
        res.json(workout.rows);
    } catch (error) {
        next(error);
    }
})



// add an exercise to a workout
app.post("/workouts/:id/exercises", requireAuth, async (req, res, next) => {
    try {
        const workoutId = req.params.id;
        // exercise_order is an int telling us where to insert the exercise in the workout
        const { name, notes, exercise_order } = req.body;
        // check if workout belongs to logged in user

        const workoutResult = await pool.query(`
            SELECT * FROM workouts WHERE id = $1 AND user_id = $2
        `, [workoutId, req.userId]);
        if(workoutResult.rows.length === 0) {
            return res.status(404).json({ error: "Workout not found" });
        }

        const newExercise = await pool.query(`
            INSERT INTO exercises (workout_id, name, notes, exercise_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [workoutId, name, notes, exercise_order]);
        res.status(201).json(newExercise.rows);
    } catch (error) {
        next(error);
    }

});

// add a set to an exercise
app.post("/exercises/:id/sets", requireAuth, async (req, res, next) => {
    try {
        const exerciseId = req.params.id;
    const userId = req.userId;
    const { reps, weight, duration_seconds, distance_meters, set_order } = req.body;
    const checkWorkoutOwnership = await pool.query(`
        SELECT workouts.user_id, exercises.workout_id FROM exercises
        JOIN workouts ON workouts.id = exercises.workout_id
        WHERE exercises.id = $1 AND workouts.user_id = $2;
        `, [exerciseId, userId]);
    if(checkWorkoutOwnership.rows.length === 0) {
        return res.status(404).json({ error: "Exercise not found" });
    }
    const newSet = await pool.query(`
        INSERT INTO sets (exercise_id, reps, weight, duration_seconds, distance_meters, set_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `, [exerciseId, reps, weight, duration_seconds, distance_meters, set_order]);
    res.status(201).json(newSet.rows);
    } catch (error) {
        next(error);
    }
});

// update a workout
app.put("/workouts/:id", requireAuth, async (req, res,next) => {
    try {
       const userId = req.userId;
       const workoutId = req.params.id;
       const { name, workout_date } = req.body;

       if(!name || !workout_date) {
        return res.status(400).json({ error: "Name and workout date are required" });
       }

       const workoutResult = await pool.query(`
        SELECT * FROM workouts WHERE id = $1 AND user_id = $2
    `, [workoutId, userId]);
    if(workoutResult.rows.length === 0) {
        return res.status(404).json({ error: "Workout not found" });
    }

    const updateWorkout = await pool.query(`
        UPDATE workouts SET name = $1, workout_date = $2 WHERE id = $3 AND user_id = $4
        RETURNING *
        `, [name, workout_date, workoutId, userId]);
    res.json(updateWorkout.rows[0]);



    } catch (error) {
        next(error);
    }
});

// update an exercise
app.put("/exercises/:id", requireAuth, async (req, res,next) => {
    try {
        const userId = req.userId;
        const exerciseId = req.params.id;
        const { name, notes, exercise_order } = req.body;

        if(!name || exercise_order === null) {
            return res.status(400).json({ error: "Name, notes, and exercise order are required" });
        }

        // check if exercise belongs to a workout owned by logged in user
        const checkWorkoutOwnership = await pool.query(`
            SELECT workouts.user_id, exercises.workout_id FROM exercises
            JOIN workouts ON workouts.id = exercises.workout_id
            WHERE exercises.id = $1 AND workouts.user_id = $2;
            `, [exerciseId, userId]);
        if(checkWorkoutOwnership.rows.length === 0) {
            return res.status(404).json({ error: "Exercise not found" });
        }
        const updateExercise = await pool.query(`
            UPDATE exercises SET name = $1, notes = $2, exercise_order = $3 WHERE id = $4 AND workout_id IN (SELECT workout_id FROM workouts WHERE user_id = $5)
            RETURNING *
            `, [name, notes, exercise_order, exerciseId, userId]);
        res.json(updateExercise.rows[0]);
        
    } catch (error) {
        next(error)
    }
});

// update a set
app.put("/sets/:id", requireAuth, async (req, res, next) => {

    try {
        const userId = req.userId;
    const setId = req.params.id;

    const { reps, weight, duration_seconds, distance_meters, set_order } = req.body;
    
    // check if set belongs to an exercise owned by a workout owned by the logged in user
    const checkWorkoutOwnership = await pool.query(`
        SELECT exercises.workout_id FROM sets
        JOIN exercises ON exercises.id = sets.exercise_id
        JOIN workouts ON workouts.id = exercises.workout_id
        WHERE sets.id = $1 AND workouts.user_id = $2;
        `, [setId, userId]);
    if(checkWorkoutOwnership.rows.length === 0) {
        return res.status(404).json({ error: "Workout not found" });
    }

    const updateSet = await pool.query(`
        UPDATE sets 
        SET reps = $1, weight = $2, duration_seconds = $3, distance_meters = $4, set_order = $5 
        WHERE id = $6
        RETURNING *
        `, [reps, weight, duration_seconds, distance_meters, set_order, setId]);
    res.json(updateSet.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE endpoints
app.delete("/workouts/:id", requireAuth, async (req, res, next) => {
    try {
      const result = await pool.query(`
        DELETE FROM workouts 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [req.params.id, req.userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Workout not found" });
      }
      
      res.json({ message: "Workout deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

app.delete("/exercises/:id", requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(`
            DELETE FROM exercises 
            WHERE id = $1 AND workout_id IN (SELECT workout_id FROM workouts WHERE user_id = $2)
            RETURNING *
        `, [req.params.id, req.userId]);
        if(result.rows.length === 0) {
            return res.status(404).json({ error: "Exercise not found" });
        }
        res.json({ message: "Exercise deleted successfully" });
    } catch (error) {
        next(error);
    }
})

app.delete("/sets/:id", requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(`
            DELETE FROM sets 
            WHERE id = $1 AND exercise_id IN (SELECT exercise_id FROM exercises WHERE workout_id IN (SELECT workout_id FROM workouts WHERE user_id = $2))
            RETURNING *
        `, [req.params.id, req.userId]);
        if(result.rows.length === 0) {
            return res.status(404).json({ error: "Set not found" });
        }
        res.json({ message: "Set deleted successfully" });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
  console.error(error);
  
  // Handle specific error types
  if (error.code === '23505') {  // PostgreSQL unique violation
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Liftline API running on port ${PORT}`);
});