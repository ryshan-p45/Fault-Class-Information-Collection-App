import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-semibold text-lg tracking-tight hover:text-indigo-200 transition-colors">
            AEx Fault Class Rubric
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
