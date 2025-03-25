import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonResults } from '../controllers/HackathonResults';
import { isAuthenticated } from '../utils/Cookie';
import { toast } from 'react-toastify';

function ViewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const authenticated = isAuthenticated();

  useEffect(() => {
    // Check if user is authenticated
    if (!authenticated) {
      toast.error("Please sign in to view results");
      navigate('/auth');
      return;
    }

    // Simulate fetching data
    setLoading(true);
    try {
      // Find the result that matches the id from the URL
      const foundResult = hackathonResults.find(item => item.id === parseInt(id));
      setResult(foundResult);
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setLoading(false);
    }
  }, [id, authenticated, navigate]);

  if (!authenticated) {
    return null; // Prevent any flash of content before redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Result Not Found</h1>
          <p className="mb-8">We couldn't find the result for this hackathon.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine the status color
  const getStatusColor = () => {
    switch (result.status.toLowerCase()) {
      case 'shortlisted':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-600';
      case 'pending':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-cyan-400">Hackathon Result</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            Back to Hackathon
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Your Submission Result</h2>
            <span className={`${getStatusColor()} px-4 py-2 rounded-full text-white font-medium`}>
              {result.status}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Reasons</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.reasons}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Strengths</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.strength}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Areas for Improvement</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.area_of_improvement}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Actionable Steps</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.actionable_steps}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Summary</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.summary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResult;
