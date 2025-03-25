import React, { useState, useEffect } from 'react';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthCookie } from '../utils/Cookie'; // Adjust the path as needed for your cookie functions

function MyHackathon() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [notification, setNotification] = useState({ show: false, success: false, message: "" });
  const [hackathons, setHackathons] = useState([]); // state to store fetched hackathons
  const [loading, setLoading] = useState(true);

  // Function to fetch joined hackathons from the server
  const fetchHackathons = async () => {
    try {
      const token = getAuthCookie("authToken");
      const response = await fetch('https://team13-aajv.onrender.com/api/student/myhackathons', {
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

  // Fetch hackathons on component mount
  useEffect(() => {
    fetchHackathons();
  }, []);

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
    if (inviteCode.trim() === "") {
      alert("Please enter an invite code");
      return;
    }
    setShowModal(true);
  };

  const handleSubmitPasskey = async (e) => {
    e.preventDefault();
    setShowModal(false);

    try {
      const token = getAuthCookie("authToken");
      const response = await fetch("https://team13-aajv.onrender.com/api/student/join", {
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
        // Optionally, refetch hackathons to update the list
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
    }
  };

  // Render loader if still loading data
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Hackathons</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer"
              onClick={handleJoinWithCode}
            >
              Join with Code
            </button>
          </div>
        </div>

        {hackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon) => (
              <div
                key={hackathon._id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">{hackathon.title}</h3>
                    <p className="text-gray-400">
                      {hackathon.description.length > 120
                        ? `${hackathon.description.slice(0, 120)}...`
                        : hackathon.description}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      className="flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded transition cursor-pointer"
                      onClick={() => navigate(`/view-hackathon/${hackathon._id}`)}
                    >
                      <span>View</span>
                      <FaEye className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-400 mb-4">You haven't joined any hackathons yet</h3>
            <p className="text-gray-500 mb-6">Join existing hackathons to get started</p>
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer"
              onClick={() => navigate('/all-hackathons')}
            >
              Browse Hackathons
            </button>
          </div>
        )}
      </div>

      {/* Passkey Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
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
    </div>
  );
}

export default MyHackathon;
