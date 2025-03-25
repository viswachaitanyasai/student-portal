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
  // const response = await fetch(`${BACKEND_URL}/api/student/login`, {
  const response = await fetch(`https://team13-aajv.onrender.com/api/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // Store token and student data in cookies
  setAuthCookie("authToken", data.token);
  setAuthCookie("userData", JSON.stringify(data.student));

  return data;
};

export const registerUser = async ({ name, email, password, grade, district, state }) => {
  // const response = await fetch(`${BACKEND_URL}/api/student/register`, {
  const response = await fetch(`https://team13-aajv.onrender.com/api/student/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, grade, district, state }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }
  
  return data;
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

// Get student data (if stored separately)
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
