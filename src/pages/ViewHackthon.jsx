import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonDetails, myHackathonIds } from '../controllers/HackathonData';
import { FaPlus, FaUpload, FaLock, FaTrophy, FaCheck, FaDownload, FaVideo, FaFileAudio, FaFileWord, FaFileAlt } from 'react-icons/fa';
import { isAuthenticated } from '../utils/Cookie';
import { toast } from 'react-toastify';

function ViewHackathon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hackathon = hackathonDetails[id];
    const authenticated = isAuthenticated();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showTextModal, setShowTextModal] = useState(false);
    const [textSubmission, setTextSubmission] = useState('');

    // Convert id to number and check if user has registered for this hackathon
    const registered = myHackathonIds.includes(Number(id));

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

    const getCurrentStatus = (hackathondates, user) => {
        const currentDate = new Date();
        const startDate = new Date(hackathondates.start_date);
        const endDate = new Date(hackathondates.end_date);

        const hasJoined = authenticated ? user.hasJoined : false;
        const hasSubmitted = authenticated ? user.hasSubmitted : false;

        // Results are out 5 days after hackathon ends
        const resultsOut = new Date(endDate);
        resultsOut.setDate(resultsOut.getDate() + 5);

        // If user is not authenticated
        if (!authenticated) {
            return currentDate <= endDate
                ? { status: "login", text: "Sign In to Join", icon: <FaPlus /> }
                : { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        // Before the hackathon starts
        if (currentDate < startDate) {
            return { status: "join", text: "Join", icon: <FaPlus /> };
        }

        // During the hackathon
        if (currentDate >= startDate && currentDate <= endDate) {
            if (!hasJoined) return { status: "join", text: "Join", icon: <FaPlus /> };
            if (!hasSubmitted) return { status: "submit", text: "Submit", icon: <FaUpload /> };
            return { status: "submitted", text: "Submitted", icon: <FaCheck /> };
        }

        // After hackathon but before results are out
        if (currentDate > endDate && currentDate < resultsOut) {
            return { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        // After results are out, show "View Results" only if user has registered
        if (currentDate >= resultsOut) {
            if (registered && hasSubmitted) {
                return { status: "result", text: "View Results", icon: <FaTrophy /> };
            }
            return { status: "closed", text: "Closed", icon: <FaLock /> };
        }

        return { status: "join", text: "Join", icon: <FaPlus /> };
    };

    // Example usage (replace with actual user data)
    const hackathondates = { start_date: hackathon.start_date, end_date: hackathon.end_date };
    const user = { hasJoined: true, hasSubmitted: false };
    const { status, text, icon } = getCurrentStatus(hackathondates, user);

    // Determine button color
    const getButtonColor = () => {
        switch (status) {
            case "login":
            case "join":
                return "bg-cyan-600 hover:bg-cyan-700";
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

    const handleButtonClick = () => {
        switch (status) {
            case "login":
                navigate('/auth', { state: { from: `/view-hackathon/${id}` } });
                toast.info("Please sign in to continue");
                break;
            case "join":
                console.log("Join hackathon");
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
        if (type === 'text') {
            setShowTextModal(true);
            setShowUploadModal(false);
        } else {
            // Simulate file selection
            const input = document.createElement('input');
            input.type = 'file';
            
            // Set appropriate accept attribute based on upload type
            if (type === 'video') {
                input.accept = 'video/*';
            } else if (type === 'audio') {
                input.accept = 'audio/*';
            } else if (type === 'file') {
                // Accept various document formats including PDF, DOC, DOCX, PPT, PPTX and images
                input.accept = '.pdf,.doc,.docx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*';
            }
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
                    setShowUploadModal(false);
                }
            };
            input.click();
        }
    };
    

    const handleTextSubmit = () => {
        if (textSubmission.trim()) {
            toast.success('Text submitted successfully!');
            setShowTextModal(false);
            setTextSubmission('');
        } else {
            toast.error('Please enter some text before submitting.');
        }
    };

    const handleDownloadAttachment = () => {
        window.open(hackathon.file_attachment_url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-cyan-400">{hackathon.name}</h1>
                    <button
                        className={`flex items-center space-x-2 ${getButtonColor()} text-white px-4 py-2 rounded transition cursor-pointer ${status === "closed" || status === "submitted" ? "opacity-75 cursor-not-allowed" : ""}`}
                        onClick={handleButtonClick}
                        disabled={status === "closed" || status === "submitted"}
                    >
                        <span>{text}</span>
                        {icon}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Poster image */}
                    <div className="lg:col-span-1">
                        <img
                            src={hackathon.poster_image_url}
                            alt={`${hackathon.name} poster`}
                            className="w-full rounded-lg shadow-lg"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x600?text=Poster+Not+Available";
                            }}
                        />
                    </div>

                    {/* Right column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4">Hackathon Details</h2>
                            <p className="mb-6">{hackathon.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="font-semibold">Start Date:</p>
                                    <p>{hackathon.start_date}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">End Date:</p>
                                    <p>{hackathon.end_date}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Eligible Grades:</p>
                                    <p>{hackathon.grade_eligible}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Attachment:</p>
                                    <button
                                        onClick={handleDownloadAttachment}
                                        className="text-cyan-400 hover:text-cyan-300 flex items-center"
                                    >
                                        <FaDownload className="mr-1" /> Download
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-3">Problem Statement</h3>
                            <p>{hackathon.problem_statement}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
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
