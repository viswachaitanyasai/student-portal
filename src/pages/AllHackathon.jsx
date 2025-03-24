import React, { useState, useEffect } from 'react';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTimes, FaSignInAlt } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { allHackathons } from '../controllers/HackathonData';
import { isAuthenticated } from '../utils/Cookie';
import { toast } from 'react-toastify';

function AllHackathonPages() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [showModal, setShowModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [notification, setNotification] = useState({ show: false, success: false, message: "" });
  
  // Auto-hide notification after 5 seconds
  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  const handleJoinWithCode = () => {
    if (!authenticated) {
      // Redirect to auth page if not logged in
      setNotification({
        show: true,
        success: false,
        message: "Please sign in to join a hackathon"
      });
      navigate('/auth', { state: { from: '/all-hackathons' } });
      return;
    }
    
    if (inviteCode.trim() === "") {
      toast.error("Please enter an invite code");
      return;
    }
    setShowModal(true);
  };

  const handleSubmitPasscode = async (e) => {
    e.preventDefault();
    setShowModal(false);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes: succeed if passcode is "correct", fail otherwise
      if (passcode === "correct") {
        setNotification({
          show: true,
          success: true,
          message: "Successfully joined the hackathon!"
        });
      } else {
        setNotification({
          show: true,
          success: false,
          message: "Failed to join. Incorrect passcode."
        });
      }
      
      // Reset form
      setPasscode("");
      setInviteCode("");
      
    } catch (error) {
      setNotification({
        show: true,
        success: false,
        message: "An error occurred. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">

        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">All Hackathons</h1>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-auto"
            />
            <button 
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer whitespace-nowrap"
              onClick={handleJoinWithCode}
            >
              Join with Code
            </button>
          </div>
        </div>
        
        {/* Grid of Boxes with increased gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allHackathons.map((hackathon) => (
            <div 
              key={hackathon.id} 
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-2">{hackathon.name}</h3>
                  <p className="text-gray-400">
                    {hackathon.description}
                  </p>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded transition cursor-pointer"
                    onClick={() => navigate(`/view-hackathon/${hackathon.id}`)}
                  >
                    <span>View</span>
                    <FaEye className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Passcode Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Enter Passcode</h2>
            <p className="text-gray-300 mb-4">
              Please enter the passcode for hackathon with invite code: <span className="font-bold">{inviteCode}</span>
            </p>
            <form onSubmit={handleSubmitPasscode}>
              <div className="mb-4">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter passcode"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer"
                >
                  Join Hackathon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-in Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 ${
              notification.success ? "bg-green-600" : "bg-red-600"
            }`}
            style={{ maxWidth: "300px" }}
          >
            <div className="flex-shrink-0">
              {notification.success ? (
                <FaCheckCircle className="text-white text-xl" />
              ) : (
                <FaTimesCircle className="text-white text-xl" />
              )}
            </div>
            <div className="flex-grow text-white">{notification.message}</div>
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AllHackathonPages;
