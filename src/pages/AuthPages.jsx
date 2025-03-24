import React, { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash, FaHome } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { loginUser, registerUser } from "../utils/Cookie";

function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [containerHeight, setContainerHeight] = useState("auto");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Store the current height before toggling
  const toggleAuthMode = () => {
    if (containerRef.current) {
      // Store current height if switching to login
      if (!isLogin) {
        setContainerHeight(`${containerRef.current.offsetHeight}px`);
      }
    }
    
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setName("");
    setGrade("");
    setDistrict("");
    setState("");
  };

  // Reset height to auto after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setContainerHeight("auto");
    }, 500); // Match this to your animation duration
    
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Use the login function from Cookie.jsx
        const response = await loginUser({ email, password });
        toast.success("Login successful!");
        
        // Navigate to the return URL or all-hackathons page
        const from = location.state?.from?.pathname || "/all-hackathons";
        navigate(from);
      } else {
        // Use the register function from Cookie.jsx
        await registerUser({ name, email, password, grade, district, state });
        toast.success("Registration successful!");
        
        // Switch to login view
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("Operation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition duration-300 ease-in-out"
            aria-label="Home"
          >
            <FaHome size={20} />
          </button>
        </div>
        <motion.div 
          ref={containerRef}
          className="bg-gray-800 p-8 rounded-lg shadow-lg w-96"
          style={{ height: containerHeight }}
          animate={{ 
            height: isLogin ? "auto" : "auto",
            transition: { 
              duration: 0.5, 
              ease: "easeInOut"
            }
          }}
        >
          <h2 className="text-center text-2xl text-white font-semibold mb-4">
            {isLogin ? "Login" : "Register"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                  className="space-y-3 overflow-hidden"
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 bg-gray-700 text-white rounded"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2 bg-gray-700 text-white rounded"
                      required
                    >
                      <option value="">Select Grade</option>
                      {[...Array(10).keys()].map((i) => (
                        <option key={i + 1} value={`Grade ${i + 1}`}>
                          Grade {i + 1}
                        </option>
                      ))}
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2 bg-gray-700 text-white rounded"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 bg-gray-700 text-white rounded"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>
          
          <p className="text-center text-gray-400 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-cyan-400 hover:underline"
              onClick={toggleAuthMode}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthPages;
