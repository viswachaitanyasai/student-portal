import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaPlus, FaUpload, FaLock, FaTrophy, FaCheck, FaDownload,
    FaVideo, FaFileAudio, FaFileWord, FaFileAlt, FaSpinner,
    FaCalendarAlt, FaHandshake, FaExclamationCircle, FaTimes
} from 'react-icons/fa';
import { isAuthenticated, getAuthCookie } from '../utils/Cookie';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

function ViewHackathon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const authenticated = isAuthenticated();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState('');
    const [fileUploading, setFileUploading] = useState(false);

    // Helper function to format dates as "date month year"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Fetch hackathon data
    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                const headers = { "Content-Type": "application/json" };
                if (authenticated) {
                    const token = getAuthCookie("authToken");
                    headers["Authorization"] = `Bearer ${token}`;
                }
                const response = await fetch(`https://team13-aajv.onrender.com/api/students/hackathons/${id}`, { headers });
                if (!response.ok) {
                    throw new Error("Failed to fetch hackathon details");
                }
                const data = await response.json();
                setHackathon(data);
            } catch (error) {
                console.error(error);
                toast.error("Error fetching hackathon details");
            } finally {
                setLoading(false);
            }
        };

        fetchHackathon();
    }, [id, authenticated]);

    // Determine hackathon status
    const getCurrentStatus = (hackathondates, user, isResultPublished) => {
        const currentDate = new Date();
        const startDate = new Date(hackathondates.start_date);
        const endDate = new Date(hackathondates.end_date);

        const hasJoined = user.hasJoined;
        const submitted = user.hasSubmitted && user.hasSubmitted._id;

        // Define when results are expected (5 days after end date)
        const resultsOut = new Date(endDate);
        resultsOut.setDate(resultsOut.getDate() + 5);

        if (!authenticated) {
            return currentDate <= endDate
                ? { status: "login", text: "Sign In to Join", icon: <FaPlus /> }
                : { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        if (currentDate < startDate) {
            return !hasJoined
                ? { status: "join", text: "Join", icon: <FaPlus /> }
                : { status: "joined", text: "Joined", icon: <FaCheck /> };
        }

        if (currentDate >= startDate && currentDate <= endDate) {
            if (!hasJoined) return { status: "join", text: "Join", icon: <FaPlus /> };
            if (!submitted) return { status: "submit", text: "Submit", icon: <FaUpload /> };
            return { status: "submitted", text: "Submitted", icon: <FaCheck /> };
        }

        if (currentDate > endDate && currentDate < resultsOut) {
            return { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        if (currentDate >= resultsOut) {
            if (hasJoined && submitted) {
                if (isResultPublished) {
                    return { status: "submitted", text: "Submitted", icon: <FaCheck /> };
                } else {
                    return { status: "closed", text: "Closed", icon: <FaLock /> };
                }
            }
            return { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        return { status: "join", text: "Join", icon: <FaPlus /> };
    };

    // Join hackathon function
    const handleJoinHackathon = async () => {
        setJoinLoading(true);
        try {
            const headers = { "Content-Type": "application/json" };
            const token = getAuthCookie("authToken");
            headers["Authorization"] = `Bearer ${token}`;
            const response = await fetch('https://team13-aajv.onrender.com/api/students/join', {
                method: 'POST',
                headers,
                body: JSON.stringify({ invite_code: hackathon.invite_code })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to join hackathon");
            }
            toast.success(data.message || "Joined hackathon successfully!");
            setHackathon({ ...hackathon, hasJoined: true });
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setJoinLoading(false);
        }
    };

    // File selection helper
    const selectFile = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (type === 'video') {
            input.accept = 'video/*';
        } else if (type === 'audio') {
            input.accept = 'audio/*';
        } else if (type === 'file') {
            input.accept = '.pdf,.doc,.docx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*';
        } else if (type === 'text') {
            input.accept = '.txt,text/plain';
        }
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                setSelectedFileType(type);
            }
        };
        input.click();
    };

    // File upload function
    const handleFileUpload = async () => {
        if (!selectedFile) {
            toast.error('No file selected');
            return;
        }
        setFileUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('hackathon_id', id);

        try {
            const headers = {};
            const token = getAuthCookie("authToken");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await fetch('https://team13-aajv.onrender.com/api/students/submit', {
                method: 'POST',
                headers,
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            toast.success('File uploaded successfully!');
            setHackathon({ ...hackathon, hasSubmitted: { _id: data.submissionId || "submitted" } });
            setSelectedFile(null);
            setSelectedFileType('');
            setShowUploadModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setFileUploading(false);
        }
    };

    // Handle button click based on status
    const handleButtonClick = () => {
        if (!hackathon) return;

        const hackathondates = { start_date: hackathon.start_date, end_date: hackathon.end_date };
        const user = { hasJoined: hackathon.hasJoined, hasSubmitted: hackathon.hasSubmitted };
        const { status } = getCurrentStatus(hackathondates, user, hackathon.isResultPublished);

        switch (status) {
            case "login":
                navigate('/auth', { state: { from: `/view-hackathon/${id}` } });
                toast.info("Please sign in to continue");
                break;
            case "join":
                if (!joinLoading) {
                    handleJoinHackathon();
                }
                break;
            case "submit":
                setShowUploadModal(true);
                break;
            default:
                break;
        }
    };

    // Handle attachment download
    const handleDownloadAttachment = () => {
        window.open(hackathon.file_attachment_url, '_blank');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-cyan-400 text-4xl mb-4" />
                    <p className="text-xl">Loading hackathon details...</p>
                </div>
            </div>
        );
    }

    // Hackathon not found
    if (!hackathon) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
                    <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-4">Hackathon not found</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/all-hackathons')}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition"
                    >
                        Back to All Hackathons
                    </motion.button>
                </div>
            </div>
        );
    }

    // Determine status and button styling
    const registered = authenticated && hackathon.hasJoined;
    const hasSubmitted = authenticated && hackathon.hasSubmitted && hackathon.hasSubmitted._id;
    const hackathondates = { start_date: hackathon.start_date, end_date: hackathon.end_date };
    const user = { hasJoined: hackathon.hasJoined, hasSubmitted: hackathon.hasSubmitted };
    const { status, text, icon } = getCurrentStatus(hackathondates, user, hackathon.isResultPublished);
    const showResultButton = hackathon.isResultPublished && hasSubmitted;

    const getButtonColor = () => {
        switch (status) {
            case "login":
            case "join":
                return "bg-cyan-600 hover:bg-cyan-700";
            case "joined":
                return "bg-gray-600 hover:bg-gray-700";
            case "submit":
                return "bg-green-600 hover:bg-green-700";
            case "closed":
                return "bg-gray-600 hover:bg-gray-700";
            case "submitted":
                return "bg-blue-600 hover:bg-blue-700";
            default:
                return "bg-cyan-600 hover:bg-cyan-700";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-900 text-white p-4"
        >
            <div className="container mx-auto max-w-6xl">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                    <h1 className="text-4xl font-bold text-cyan-400 mb-4 md:mb-0">
                        {hackathon.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 ${getButtonColor()} text-white px-4 py-2 rounded-full transition cursor-pointer ${status === "closed" || joinLoading ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                            onClick={handleButtonClick}
                            disabled={status === "closed" || joinLoading}
                        >
                            {status === "join" && joinLoading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    <span>Joining...</span>
                                </>
                            ) : (
                                <>
                                    {icon}
                                    <span>{text}</span>
                                </>
                            )}
                        </motion.button>

                        {showResultButton && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/view-result/${id}`)}
                                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
                            >
                                <FaTrophy className="mr-2" />
                                <span>View Results</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>


                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:w-1/3 space-y-6"
                    >
                        <div className="flex justify-center">
                            <img
                                src={hackathon.image_url}
                                alt={`${hackathon.title} poster`}
                                className="w-full max-w-[300px] h-auto object-cover rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/300?text=Poster+Not+Available";
                                }}
                            />
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                                <FaCalendarAlt className="mr-2" /> Timeline
                            </h2>

                            <div className="mb-4 flex items-center">
                                <div className="w-1/3 font-semibold">Start Date:</div>
                                <div className="w-2/3">{formatDate(hackathon.start_date)}</div>
                            </div>

                            <div className="mb-4 flex items-center">
                                <div className="w-1/3 font-semibold">End Date:</div>
                                <div className="w-2/3">{formatDate(hackathon.end_date)}</div>
                            </div>

                            {hackathon.file_attachment_url && hackathon.file_attachment_url !== "" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownloadAttachment}
                                    className="flex items-center mt-4 bg-gray-700 hover:bg-gray-600 text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-full w-full justify-center"
                                >
                                    <FaDownload className="mr-2" /> Download Attachment
                                </motion.button>
                            )}
                        </div>

                        {hackathon.sponsors && hackathon.sponsors.length > 0 && (
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                                    <FaHandshake className="mr-2" /> Sponsors
                                </h2>
                                <ul className="space-y-2">
                                    {hackathon.sponsors.map((sponsor, index) => (
                                        <li key={index} className="flex items-center">
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                                            {sponsor}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:w-2/3 space-y-6"
                    >
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Problem Statement</h2>
                            <p className="leading-relaxed">{hackathon.problem_statement}</p>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Description</h2>
                            <p className="leading-relaxed">{hackathon.description}</p>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Context</h2>
                            <p className="leading-relaxed">{hackathon.context}</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl"
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-cyan-400 text-center">Upload Your Submission</h2>

                            {selectedFile ? (
                                <div className="flex flex-col items-center">
                                    <p className="mb-4 text-gray-300">
                                        Selected File: <span className="font-semibold text-white">{selectedFile.name}</span>
                                    </p>
                                    <div className="flex space-x-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleFileUpload}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm flex items-center transition"
                                            disabled={fileUploading}
                                        >
                                            {fileUploading ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="mr-2" />
                                                    <span>Upload</span>
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setSelectedFileType('');
                                                setShowUploadModal(false);
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm transition"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(8, 145, 178, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => selectFile('video')}
                                            className="text-white p-4 rounded-lg flex flex-col items-center justify-center text-sm border border-gray-700 hover:border-cyan-500 transition"
                                        >
                                            <FaVideo className="text-3xl mb-2 text-cyan-400" />
                                            <span>Upload Video</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(8, 145, 178, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => selectFile('audio')}
                                            className="text-white p-4 rounded-lg flex flex-col items-center justify-center text-sm border border-gray-700 hover:border-cyan-500 transition"
                                        >
                                            <FaFileAudio className="text-3xl mb-2 text-cyan-400" />
                                            <span>Upload Audio</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(8, 145, 178, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => selectFile('file')}
                                            className="text-white p-4 rounded-lg flex flex-col items-center justify-center text-sm border border-gray-700 hover:border-cyan-500 transition"
                                        >
                                            <FaFileWord className="text-3xl mb-2 text-cyan-400" />
                                            <span>Upload Document</span>
                                            <span className="text-xs text-gray-400 mt-1">(ppt, doc, pdf, img)</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(8, 145, 178, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => selectFile('text')}
                                            className="text-white p-4 rounded-lg flex flex-col items-center justify-center text-sm border border-gray-700 hover:border-cyan-500 transition"
                                        >
                                            <FaFileAlt className="text-3xl mb-2 text-cyan-400" />
                                            <span>Upload Text</span>
                                        </motion.button>
                                    </div>
                                    <div className="mt-8 flex justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowUploadModal(false)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full text-sm transition"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default ViewHackathon;