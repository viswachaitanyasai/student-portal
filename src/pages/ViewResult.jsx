import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthCookie } from '../utils/Cookie';
import { toast } from 'react-toastify';

function ViewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) {
      toast.error("Please sign in to view results");
      navigate('/auth');
      return;
    }

    const fetchResult = async () => {
      setLoading(true);
      try {
        const token = getAuthCookie("authToken");
        const response = await fetch(`https://team13-aajv.onrender.com/api/students/results/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch evaluation result");
        }

        const data = await response.json();
        // Destructure the required fields from the response
        const {
          evaluation_category,
          improvement,
          actionable_steps,
          strengths,
          overall_reason,
          summary,
        } = data;

        setResult({
          evaluation_category,
          improvement,
          actionable_steps,
          strengths,
          overall_reason,
          summary,
        });
      } catch (error) {
        console.error("Error fetching result:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, authenticated, navigate]);

  if (!authenticated) {
    return null; // Prevent flash of content before redirect
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

  // Define dynamic styles for the evaluation category
  const categoryStyles = {
    shortlisted: "bg-green-600 border-green-700",
    rejected: "bg-red-600 border-red-700",
    revisit: "bg-yellow-600 border-yellow-700"
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
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span
                className={`border px-4 py-2 rounded-full text-white font-medium mr-4 ${
                  categoryStyles[result.evaluation_category] || "bg-gray-700 border-gray-600"
                }`}
              >
                {result.evaluation_category}
              </span>
              <h2 className="text-2xl font-semibold">Your Submission Result</h2>
            </div>
            <div className="h-1 w-full bg-gray-700"></div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Reasons</h3>
              <p className="bg-gray-700 p-4 rounded-lg">{result.overall_reason}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Improvements</h3>
              {result.improvement && result.improvement.length > 0 ? (
                <ul className="bg-gray-700 p-4 rounded-lg list-disc pl-10">
                  {result.improvement.map((item, index) => (
                    <li key={index} className="mb-2">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="bg-gray-700 p-4 rounded-lg">No improvements provided.</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Actionable Steps</h3>
              {result.actionable_steps && result.actionable_steps.length > 0 ? (
                <ul className="bg-gray-700 p-4 rounded-lg list-disc pl-10">
                  {result.actionable_steps.map((item, index) => (
                    <li key={index} className="mb-2">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="bg-gray-700 p-4 rounded-lg">No actionable steps provided.</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Strengths</h3>
              {result.strengths && result.strengths.length > 0 ? (
                <ul className="bg-gray-700 p-4 rounded-lg list-disc pl-10">
                  {result.strengths.map((item, index) => (
                    <li key={index} className="mb-2">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="bg-gray-700 p-4 rounded-lg">No strengths provided.</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Summary</h3>
              {result.summary && result.summary.length > 0 ? (
                <ul className="bg-gray-700 p-4 rounded-lg list-disc pl-10">
                  {result.summary.map((item, index) => (
                    <li key={index} className="mb-2">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="bg-gray-700 p-4 rounded-lg">No summary provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResult;
