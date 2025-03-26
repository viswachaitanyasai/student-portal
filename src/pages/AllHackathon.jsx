import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated } from '../utils/Cookie';
import { toast } from 'react-toastify';
import { ClipLoader } from "react-spinners";

function AllHackathonPages() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [notification, setNotification] = useState({ show: false, success: false, message: "" });

  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://team13-aajv.onrender.com/api/students/hackathons");
      const data = await response.json();
      if (data.hackathons) {
        setHackathons(data.hackathons);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error("Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

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
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-12 text-center text-cyan-400"
        >
          Discover Hackathons
        </motion.h1>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          {hackathons.map((hackathon, index) => (
            <motion.div
              key={hackathon._id}
              onClick={() => navigate(`/view-hackathon/${hackathon._id}`)}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
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
          ))}
        </motion.div>
      </div>

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
              className="text-white hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AllHackathonPages;
