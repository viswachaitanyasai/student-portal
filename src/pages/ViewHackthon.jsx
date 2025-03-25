import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaPlus, FaUpload, FaLock, FaTrophy, FaCheck, FaDownload,
    FaVideo, FaFileAudio, FaFileWord, FaFileAlt
} from 'react-icons/fa';
import { isAuthenticated, getAuthCookie } from '../utils/Cookie';
import { toast } from 'react-toastify';

function ViewHackathon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const authenticated = isAuthenticated();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showTextModal, setShowTextModal] = useState(false);
    const [textSubmission, setTextSubmission] = useState('');

    // Helper function to format dates as "date month year"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                const headers = { "Content-Type": "application/json" };
                if (authenticated) {
                    const token = getAuthCookie("authToken");
                    headers["Authorization"] = `Bearer ${token}`;
                }
                const response = await fetch(`https://team13-aajv.onrender.com/api/student/hackathon/${id}`, { headers });
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (!hackathon) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Hackathon not found</h1>
                    <button
                        onClick={() => navigate('/all-hackathons')}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition"
                    >
                        Back to All Hackathons
                    </button>
                </div>
            </div>
        );
    }

    const registered = authenticated && hackathon.hasJoined;
    const getCurrentStatus = (hackathondates, user) => {
        const currentDate = new Date();
        const startDate = new Date(hackathondates.start_date);
        const endDate = new Date(hackathondates.end_date);

        const hasJoined = authenticated ? user.hasJoined : false;
        const hasSubmitted = authenticated ? user.hasSubmitted : false;

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
                : { status: "joined", text: "Joined", icon: <FaLock /> };
        }

        if (currentDate >= startDate && currentDate <= endDate) {
            if (!hasJoined) return { status: "join", text: "Join", icon: <FaPlus /> };
            if (!hasSubmitted) return { status: "submit", text: "Submit", icon: <FaUpload /> };
            return { status: "submitted", text: "Submitted", icon: <FaCheck /> };
        }

        if (currentDate > endDate && currentDate < resultsOut) {
            return { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        if (currentDate >= resultsOut) {
            return registered && hasSubmitted
                ? { status: "result", text: "View Results", icon: <FaTrophy /> }
                : { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        return { status: "join", text: "Join", icon: <FaPlus /> };
    };

    const hackathondates = { start_date: hackathon.start_date, end_date: hackathon.end_date };
    const user = { hasJoined: hackathon.hasJoined, hasSubmitted: hackathon.hasSubmitted };
    const { status, text, icon } = getCurrentStatus(hackathondates, user);

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
            case "result":
                return "bg-purple-600 hover:bg-purple-700";
            case "submitted":
                return "bg-blue-600 hover:bg-blue-700";
            default:
                return "bg-cyan-600 hover:bg-cyan-700";
        }
    };

    // Function to call the join hackathon API
    const handleJoinHackathon = async () => {
        try {
            const headers = { "Content-Type": "application/json" };
            const token = getAuthCookie("authToken");
            headers["Authorization"] = `Bearer ${token}`;
            const response = await fetch('https://team13-aajv.onrender.com/api/student/join', {
                method: 'POST',
                headers,
                body: JSON.stringify({ invite_code: hackathon.invite_code })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to join hackathon");
            }
            toast.success(data.message || "Joined hackathon successfully!");
            // Update hackathon state to reflect join
            setHackathon({ ...hackathon, hasJoined: true });
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleButtonClick = () => {
        switch (status) {
            case "login":
                navigate('/auth', { state: { from: `/view-hackathon/${id}` } });
                toast.info("Please sign in to continue");
                break;
            case "join":
                handleJoinHackathon();
                break;
            case "submit":
                setShowUploadModal(true);
                break;
            case "result":
                navigate(`/view-result/${id}`);
                break;
            default:
                break;
        }
    };

    const handleUpload = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (type === 'video') {
            input.accept = 'video/*';
        } else if (type === 'audio') {
            input.accept = 'audio/*';
        } else if (type === 'file') {
            input.accept = '.pdf,.doc,.docx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*';
        }
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('hackathon_id', id);

                try {
                    const headers = {};
                    const token = getAuthCookie("authToken");
                    if (token) {
                        headers["Authorization"] = `Bearer ${token}`;
                    }
                    const response = await fetch('https://team13-aajv.onrender.com/api/student/submit', {
                        method: 'POST',
                        headers,
                        body: formData,
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'Upload failed');
                    }
                    toast.success('File uploaded successfully!');
                    setHackathon({ ...hackathon, hasSubmitted: true });
                } catch (error) {
                    console.error(error);
                    toast.error(error.message);
                }
                setShowUploadModal(false);
            }
        };
        input.click();
    };

    const handleTextSubmit = async () => {
        if (textSubmission.trim()) {
            try {
                const headers = { "Content-Type": "application/json" };
                const token = getAuthCookie("authToken");
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
                const response = await fetch('https://team13-aajv.onrender.com/api/student/submit', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ text: textSubmission, hackathon_id: id })
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Submission failed');
                }
                toast.success('Text submitted successfully!');
                setHackathon({ ...hackathon, hasSubmitted: true });
                setShowTextModal(false);
                setTextSubmission('');
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        } else {
            toast.error('Please enter some text before submitting.');
        }
    };

    const handleDownloadAttachment = () => {
        window.open(hackathon.file_attachment_url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-cyan-400">{hackathon.title}</h1>
                    <button
                        className={`flex items-center space-x-2 ${getButtonColor()} text-white px-4 py-2 rounded transition cursor-pointer ${status === "closed" || status === "submitted" ? "opacity-75 cursor-not-allowed" : ""}`}
                        onClick={handleButtonClick}
                        disabled={status === "closed" || status === "submitted"}
                    >
                        <span>{text}</span>
                        {icon}
                    </button>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column */}
                    <div className="md:w-1/2 space-y-6">
                        {/* Top Image */}
                        <div className="flex justify-center">
                            <img
                                src={hackathon.image_url}
                                alt={`${hackathon.title} poster`}
                                className="w-[200px] h-[200px] object-cover rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/200?text=Poster+Not+Available";
                                }}
                            />
                        </div>
                        {/* Bottom Details */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            {hackathon.file_attachment_url && hackathon.file_attachment_url !== "" && (
                                <div className="mb-4">
                                    <button
                                        onClick={handleDownloadAttachment}
                                        className="flex items-center text-cyan-400 hover:text-cyan-300"
                                    >
                                        <FaDownload className="mr-1" /> Download Attachment
                                    </button>
                                </div>
                            )}
                            <div className="mb-2">
                                <p>
                                    <span className="font-semibold">Start Date:</span> {formatDate(hackathon.start_date)}
                                </p>
                            </div>
                            <div className="mb-2">
                                <p>
                                    <span className="font-semibold">End Date:</span> {formatDate(hackathon.end_date)}
                                </p>
                            </div>
                            {hackathon.sponsors && hackathon.sponsors.length > 0 && (
                                <div>
                                    <p className="font-semibold">Sponsors:</p>
                                    <ul className="list-disc ml-5">
                                        {hackathon.sponsors.map((sponsor, index) => (
                                            <li key={index}>{sponsor}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="md:w-1/2 space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4">Problem Statement</h2>
                            <p>{hackathon.problem_statement}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4">Description</h2>
                            <p>{hackathon.description}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4">Context</h2>
                            <p>{hackathon.context}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-96">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Upload Your Submission</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleUpload('video')}
                                className="hover:text-cyan-300 text-white p-3 rounded flex flex-col items-center justify-center text-sm"
                            >
                                <FaVideo className="text-xl mb-1" />
                                <span>Upload Video</span>
                            </button>
                            <button
                                onClick={() => handleUpload('audio')}
                                className="hover:text-cyan-300 text-white p-3 rounded flex flex-col items-center justify-center text-sm"
                            >
                                <FaFileAudio className="text-xl mb-1" />
                                <span>Upload Audio</span>
                            </button>
                            <button
                                onClick={() => handleUpload('file')}
                                className="hover:text-cyan-300 text-white p-3 rounded flex flex-col items-center justify-center text-sm"
                            >
                                <FaFileWord className="text-xl mb-1" />
                                <span>Upload File <span className='text-xs'>(ppt,doc,pdf,img)</span></span>
                            </button>
                            <button
                                onClick={() => handleUpload('text')}
                                className="hover:text-cyan-300 text-white p-3 rounded flex flex-col items-center justify-center text-sm"
                            >
                                <FaFileAlt className="text-xl mb-1" />
                                <span>Upload Text</span>
                            </button>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Text Submission Modal */}
            {showTextModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-xl">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Text Submission</h2>
                        <textarea
                            className="w-full h-80 p-2 text-white rounded border-cyan-50 border-2"
                            value={textSubmission}
                            onChange={(e) => setTextSubmission(e.target.value)}
                            placeholder="Enter your text submission here..."
                        />
                        <div className="mt-6 flex justify-center space-x-4">
                            <button
                                onClick={handleTextSubmit}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => {
                                    setShowTextModal(false);
                                    setTextSubmission('');
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewHackathon;
