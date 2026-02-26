import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Workouts from './components/Workouts';
import WorkoutForm from './components/WorkoutForm';
import WorkoutDetail from './components/WorkoutDetail';
import SignUp from './components/SignUp';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Navbar />
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/workouts/new" element={<WorkoutForm />} />
      <Route path="/workouts/:id" element={<WorkoutDetail />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
    </div>
  );
}

export default App;