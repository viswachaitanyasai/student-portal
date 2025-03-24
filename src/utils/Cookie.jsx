// src/utils/Cookie.jsx
import Cookies from 'js-cookie';

// Cookie management functions
export const setAuthCookie = (key, value, options = {}) => {
  Cookies.set(key, value, {
    expires: options.expires || 7, // Default expiration is 7 days
    secure: process.env.NODE_ENV === 'production', // Ensures cookies are sent over HTTPS in production
    sameSite: options.sameSite || 'Strict', // Prevents CSRF attacks
    ...options,
  });
};

export const getAuthCookie = (key) => {
  return Cookies.get(key);
};

export const removeAuthCookie = (key) => {
  Cookies.remove(key);
};

// Authentication functions
export const loginUser = async ({ email, password }) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a mock auth token
      const authToken = btoa(`${email}:${Date.now()}`);
      
      // Store user data in cookie
      setAuthCookie('authToken', authToken);
      setAuthCookie('userData', JSON.stringify({ email }));
      
      resolve({ cookie: authToken });
    }, 1000);
  });
};

export const registerUser = async ({ name, email, password, grade, district, state }) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Store student data in cookie
      const studentData = { name, email, grade, district, state, registeredAt: new Date().toISOString() };
      setAuthCookie('studentData', JSON.stringify(studentData));
      
      resolve({ success: true });
    }, 1000);
  });
};

// Authentication status check
export const isAuthenticated = () => {
  return !!getAuthCookie('authToken');
};

// Get current user data
export const getCurrentUser = () => {
  const userData = getAuthCookie('userData');
  return userData ? JSON.parse(userData) : null;
};

// Get student data
export const getStudentData = () => {
  const studentData = getAuthCookie('studentData');
  return studentData ? JSON.parse(studentData) : null;
};

// Logout function
export const logoutUser = () => {
  removeAuthCookie('authToken');
  removeAuthCookie('userData');
  removeAuthCookie('studentData');
};
