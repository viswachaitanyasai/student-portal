import React, { useState, useEffect } from 'react';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTimes, FaLock, FaUnlock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthCookie } from '../utils/Cookie';
import { ClipLoader } from "react-spinners";

function MyHackathon() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [notification, setNotification] = useState({ show: false, success: false, message: "" });
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchHackathons = async () => {
    try {
      const token = getAuthCookie("authToken");
      const response = await fetch('https://team13-aajv.onrender.com/api/students/myhackathons', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setHackathons(data.hackathons);
      } else {
        setNotification({ show: true, success: false, message: data.error || "Failed to fetch hackathons" });
      }
    } catch (error) {
      setNotification({ show: true, success: false, message: "An error occurred while fetching hackathons." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  const handleJoinWithCode = async () => {
    if (inviteCode.trim() === "") {
      setNotification({ show: true, success: false, message: "Please enter an invite code" });
      return;
    }
    setJoining(true);
    try {
      const token = getAuthCookie("authToken");
      const response = await fetch("https://team13-aajv.onrender.com/api/students/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ invite_code: inviteCode, passkey: "" })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNotification({
          show: true,
          success: true,
          message: "Successfully joined the hackathon!"
        });
        fetchHackathons();
        setInviteCode("");
      } else if (data.error && data.error.includes("Passkey is required")) {
        setShowModal(true);
      } else {
        setNotification({
          show: true,
          success: false,
          message: data.error || "Failed to join hackathon."
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        success: false,
        message: "An error occurred. Please try again."
      });
    } finally {
      setJoining(false);
    }
  };

  const handleSubmitPasskey = async (e) => {
    e.preventDefault();
    setShowModal(false);
    setJoining(true);
    try {
      const token = getAuthCookie("authToken");
      const response = await fetch("https://team13-aajv.onrender.com/api/students/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          invite_code: inviteCode,
          passkey: passkey
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotification({
          show: true,
          success: true,
          message: "Successfully joined the hackathon!"
        });
        fetchHackathons();
      } else {
        setNotification({
          show: true,
          success: false,
          message: data.error || "Failed to join hackathon."
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        success: false,
        message: "An error occurred. Please try again."
      });
    } finally {
      setInviteCode("");
      setPasskey("");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <ClipLoader color="#00BFFF" size={60} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white"
    >
      <div className="container mx-auto py-12 px-4">
        {/* Join Hackathon Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-6 md:mb-0 text-cyan-400">My Hackathons</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="p-2 bg-gray-800 text-white rounded-l focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-r transition cursor-pointer flex items-center"
              onClick={handleJoinWithCode}
              disabled={joining}
            >
              {joining ? (
                <ClipLoader color="#ffffff" size={20} />
              ) : (
                <>
                  <FaUnlock className="mr-2" />
                  Join with Code
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Hackathons Listing Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          {hackathons.length > 0 ? (
            hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon._id}
                onClick={() => navigate(`/view-hackathon/${hackathon._id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="w-full aspect-square">
                  <img 
                    src={hackathon.image_url} 
                    alt={hackathon.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-cyan-400 text-center">
                    {hackathon.title}
                  </h3>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="col-span-full bg-gray-800 rounded-lg p-8 text-center"
            >
              <h3 className="text-xl font-semibold text-gray-400 mb-4">You haven't joined any hackathons yet</h3>
              <p className="text-gray-500 mb-6">Join existing hackathons to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer"
                onClick={() => navigate('/all-hackathons')}
              >
                Browse Hackathons
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Passkey Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Enter Passkey</h2>
              <p className="text-gray-300 mb-4">
                Please enter the passkey for hackathon with invite code: <span className="font-bold">{inviteCode}</span>
              </p>
              <form onSubmit={handleSubmitPasskey}>
                <div className="mb-4">
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter passkey"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition cursor-pointer"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer flex items-center"
                  >
                    <FaLock className="mr-2" />
                    Join Hackathon
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 ${notification.success ? "bg-green-600" : "bg-red-600"}`}
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
    </motion.div>
  );
}

export default MyHackathon;
