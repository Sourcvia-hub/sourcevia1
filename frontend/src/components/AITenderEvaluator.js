import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AITenderEvaluator = ({ tenderData, proposalData, onScoresGenerated }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAIAnalysis = async () => {
    if (!tenderData || !proposalData) {
      setError('Missing tender or proposal data.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API}/ai/analyze-tender-proposal`,
        {
          tender_data: tenderData,
          proposal_data: proposalData
        },
        { withCredentials: true }
      );
      
      setAiAnalysis(response.data);
      
      // Callback with generated scores
      if (onScoresGenerated) {
        onScoresGenerated(response.data);
      }
      
    } catch (err) {
      console.error('AI tender evaluation error:', err);
      setError('AI evaluation failed. Please try again or score manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-300';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-300';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      'Award': 'bg-green-100 text-green-800 border-green-400',
      'Reject': 'bg-red-100 text-red-800 border-red-400',
      'Further Review': 'bg-yellow-100 text-yellow-800 border-yellow-400'
    };
    return colors[rec] || colors['Further Review'];
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-emerald-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🤖 AI Tender Evaluation
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Get intelligent scoring suggestions for vendor proposals
          </p>
        </div>
        <button
          type="button"
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
          className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all ${
            isAnalyzing
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Evaluating...
            </span>
          ) : (
            '✨ Get AI Evaluation'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {!aiAnalysis && !isAnalyzing && (
        <div className="p-6 bg-white/70 backdrop-blur rounded-lg border border-emerald-200 text-center">
          <span className="text-5xl mb-3 block">📊</span>
          <p className="text-gray-600">
            Click "Get AI Evaluation" to receive intelligent scoring recommendations
          </p>
        </div>
      )}

      {aiAnalysis && (
        <div className="space-y-4 animate-fadeIn">
          {/* Score Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-5 rounded-lg border-2 ${getScoreColor(aiAnalysis.technical_score)}`}>
              <p className="text-sm font-medium opacity-80 mb-1">Technical Score</p>
              <p className="text-4xl font-bold">{aiAnalysis.technical_score}</p>
              <p className="text-xs opacity-80 mt-1">out of 100</p>
            </div>
            
            <div className={`p-5 rounded-lg border-2 ${getScoreColor(aiAnalysis.financial_score)}`}>
              <p className="text-sm font-medium opacity-80 mb-1">Financial Score</p>
              <p className="text-4xl font-bold">{aiAnalysis.financial_score}</p>
              <p className="text-xs opacity-80 mt-1">out of 100</p>
            </div>
            
            <div className={`p-5 rounded-lg border-2 ${getScoreColor(aiAnalysis.overall_score)}`}>
              <p className="text-sm font-medium opacity-80 mb-1">Overall Score</p>
              <p className="text-4xl font-bold">{aiAnalysis.overall_score}</p>
              <p className="text-xs opacity-80 mt-1">out of 100</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-5 rounded-lg border-2 ${getRecommendationColor(aiAnalysis.recommendation)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">🎯 AI Recommendation</p>
                <p className="text-2xl font-bold">{aiAnalysis.recommendation}</p>
              </div>
              <span className="text-5xl">
                {aiAnalysis.recommendation === 'Award' ? '✅' : 
                 aiAnalysis.recommendation === 'Reject' ? '❌' : '🤔'}
              </span>
            </div>
          </div>

          {/* Strengths */}
          {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
            <div className="p-5 bg-green-50 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                ✅ Strengths
              </h4>
              <ul className="space-y-2">
                {aiAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-500 font-bold mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0 && (
            <div className="p-5 bg-orange-50 rounded-lg border-2 border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                ⚠️ Weaknesses
              </h4>
              <ul className="space-y-2">
                {aiAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAIAnalysis}
              className="flex-1 px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
            >
              🔄 Re-evaluate
            </button>
            <button
              type="button"
              onClick={() => {
                if (onScoresGenerated) {
                  onScoresGenerated(aiAnalysis);
                }
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors"
            >
              ✅ Use These Scores
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITenderEvaluator;
