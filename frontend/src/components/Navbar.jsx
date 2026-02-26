import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); 
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/signup') {
    return null;
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div>
        <Link to="/workouts" className="text-xl font-extrabold text-white tracking-tight">
          Liftline
        </Link>
      </div>

      {isLoggedIn && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-800/40 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;