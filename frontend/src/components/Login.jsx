import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function App() {
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login',
        { email, password }
      );
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      console.log("Login Successful", response.data);
      navigate('/workouts');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login Failed');
    }
  }

 

  return (
    <div>
      <h1>Login to Liftline</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div>
        <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;