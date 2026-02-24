import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Workouts from './components/Workouts';
import WorkoutForm from './components/WorkoutForm';
import WorkoutDetail from './components/WorkoutDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/workouts/new" element={<WorkoutForm />} />
      <Route path="/workouts/:id" element={<WorkoutDetail />} />
    </Routes>
  );
}

export default App;