import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonDetails } from '../controllers/HackathonData';
import { FaPlus, FaUpload, FaLock, FaTrophy, FaCheck, FaDownload } from 'react-icons/fa';

function ViewHackathon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hackathon = hackathonDetails[id];

    if (!hackathon) {
        return <div>Hackathon not found</div>;
    }


    const getCurrentStatus = (hackathondates, user) => {
        const currentDate = new Date(); // Current date
        const startDate = new Date(hackathondates.start_date);
        const endDate = new Date(hackathondates.end_date);

        // User details (these would typically come from user state or API)
        const hasJoined = user.hasJoined;
        const hasSubmitted = user.hasSubmitted;

        // Assuming results are out 5 days after the hackathon ends
        const resultsOut = new Date(endDate);
        resultsOut.setDate(resultsOut.getDate() + 5);

        // 1️⃣ Before Hackathon Starts → No "Join" before start date
        if (currentDate < startDate) {
            return { status: "upcoming", text: "Upcoming", icon: <FaLock /> };
        }

        // 2️⃣ Hackathon Running → Allow "Join" or "Submit"
        if (currentDate >= startDate && currentDate <= endDate) {
            if (!hasJoined) {
                return { status: "join", text: "Join", icon: <FaPlus /> };
            }
            if (!hasSubmitted) {
                return { status: "submit", text: "Submit", icon: <FaUpload /> };
            }
            return { status: "submitted", text: "Submitted", icon: <FaCheck /> }; // Already submitted
        }

        // 3️⃣ Hackathon Ended → Check result status
        if (currentDate > endDate) {
            if (currentDate < resultsOut) {
                return { status: "closed", text: "Closed", icon: <FaLock /> };
            }
            return { status: "result", text: "Results", icon: <FaTrophy /> };
        }

        // Default (Fallback)
        return { status: "join", text: "Join", icon: <FaPlus /> };
    };

    // Example usage
    const hackathondates = { start_date: "2024-10-20", end_date: "2024-10-25" };
    const user = { hasJoined: true, hasSubmitted: true };
    const { status, text, icon } = getCurrentStatus(hackathondates, user);


    // Button color based on status
    const getButtonColor = () => {
        switch (status) {
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
            case "join":
                console.log("Join hackathon");
                break;
            case "submit":
                console.log("Submit project");
                break;
            case "result":
                navigate(`/view-result/${id}`); // Modified to redirect to view-result page with id
                break;
            default:
                break;
        }
    };

    const handleDownloadAttachment = () => {
        window.open(hackathon.file_attachment_url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800 p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-cyan-400">EduHack</h1>
                    </div>
                    <button
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition cursor-pointer"
                        onClick={() => navigate('/my-hackathons')}
                    >
                        My Hackathons
                    </button>
                </div>
            </nav>

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
                            <p className="mb-6">{hackathon.problem_statement}</p>

                            <h3 className="text-xl font-semibold mb-3">Content</h3>
                            <p>{hackathon.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewHackathon;
