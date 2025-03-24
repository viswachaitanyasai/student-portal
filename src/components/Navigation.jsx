// src/components/Navigation.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logoutUser } from '../utils/Cookie';
import { toast } from 'react-toastify';

const Navigation = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">EduHack</Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/all-hackathons" 
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition flex items-center"
          >
            All Hackathons
          </Link>
          
          {authenticated ? (
            <>
              <Link 
                to="/my-hackathons" 
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition flex items-center"
              >
                My Hackathons
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded transition flex items-center"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded transition flex items-center"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
