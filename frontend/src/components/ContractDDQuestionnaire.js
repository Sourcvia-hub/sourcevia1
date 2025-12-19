import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Contract Due Diligence Questionnaire Component
 * Allows submission of DD questionnaire responses and document upload
 */
const ContractDDQuestionnaire = ({ contractId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [template, setTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchQuestionnaireTemplate();
  }, []);

  const fetchQuestionnaireTemplate = async () => {
    try {
      const response = await axios.get(`${API}/contract-governance/questionnaire-template`, { withCredentials: true });
      setTemplate(response.data);
      // Initialize responses
      const initialResponses = {};
      response.data.sections.forEach(section => {
        section.questions.forEach(q => {
          initialResponses[q.id] = { question_id: q.id, section: section.section, question_text: q.text, answer: '', notes: '' };
        });
      });
      setResponses(initialResponses);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer }
    }));
  };

  const handleNoteChange = (questionId, note) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes: note }
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.doc', '.xlsx', '.xls'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      alert(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    setUploadedFile(file);
  };

  const calculateProgress = () => {
    if (!template) return 0;
    const totalQuestions = template.total_questions;
    const answeredQuestions = Object.values(responses).filter(r => r.answer).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    const progress = calculateProgress();
    if (progress < 50) {
      if (!window.confirm('Less than 50% of questions are answered. Are you sure you want to submit?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const responseList = Object.values(responses).filter(r => r.answer);
      await axios.post(`${API}/contract-governance/contract-dd/${contractId}/submit`, {
        responses: responseList,
        notes: notes
      }, { withCredentials: true });

      alert('Due Diligence questionnaire submitted successfully');
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error submitting DD:', error);
      alert('Failed to submit DD: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>Failed to load questionnaire template</p>
      </div>
    );
  }

  const currentSection = template.sections[activeSection];
  const progress = calculateProgress();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> Contract Due Diligence Questionnaire
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {template.total_questions} questions across {template.sections.length} sections
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-2xl font-bold text-blue-600">{progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* File Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <span>📎</span> Upload DD Document (Optional)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload a completed DD questionnaire document to auto-extract answers
        </p>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploadedFile && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {uploadedFile.name} selected
          </p>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
        {template.sections.map((section, index) => {
          const sectionQuestions = section.questions.length;
          const sectionAnswered = section.questions.filter(q => responses[q.id]?.answer).length;
          return (
            <button
              key={section.section}
              onClick={() => setActiveSection(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.section}
              <span className="ml-1 text-xs opacity-70">
                ({sectionAnswered}/{sectionQuestions})
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Section Questions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentSection.section}
        </h3>

        {currentSection.questions.map((question, qIndex) => {
          const response = responses[question.id];
          const isTextType = question.type === 'text';

          return (
            <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center justify-center">
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-3">{question.text}</p>
                  
                  {isTextType ? (
                    <input
                      type="text"
                      value={response?.answer || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex gap-4">
                      {['yes', 'no'].map((val) => (
                        <label key={val} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={val}
                            checked={response?.answer === val}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{val}</span>
                        </label>
                      ))}
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value="n/a"
                          checked={response?.answer === 'n/a'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">N/A</span>
                      </label>
                    </div>
                  )}

                  {/* Optional notes */}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={response?.notes || ''}
                      onChange={(e) => handleNoteChange(question.id, e.target.value)}
                      placeholder="Add notes (optional)..."
                      className="w-full px-3 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation & Submit */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            onClick={() => setActiveSection(Math.min(template.sections.length - 1, activeSection + 1))}
            disabled={activeSection === template.sections.length - 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        <div className="flex gap-3">
          <div className="text-right mr-4">
            <label className="block text-xs text-gray-600 mb-1">Overall Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add submission notes..."
              className="px-3 py-1 border border-gray-300 rounded text-sm w-48"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit DD Questionnaire'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDDQuestionnaire;
