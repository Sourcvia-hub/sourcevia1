import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchTenderById,
  fetchProposalsForTender,
  fetchTenderEvaluation,
  evaluateTenderNow,
  fetchTenderAISummary,
  fetchTenderAIEvaluationSuggestions,
} from './api';

const PfTenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiEval, setAiEval] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p] = await Promise.all([
          fetchTenderById(id),
          fetchProposalsForTender(id),
        ]);
        setTender(t);
        setProposals(p);
        try {
          const evalData = await fetchTenderEvaluation(id);
          setEvaluation(evalData);
        } catch (err) {
          // No evaluation yet or not found
          setEvaluation(null);
        }
      } catch (err) {
        console.error('Failed to load tender', err);
        setError('Failed to load tender or proposals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReevaluate = async () => {
    setEvalLoading(true);
    try {
      const result = await evaluateTenderNow(id);
      setEvaluation(result);
      // Also refresh tender status
      const t = await fetchTenderById(id);
      setTender(t);
    } catch (err) {
      console.error('Failed to evaluate tender', err);
      setError('Failed to evaluate tender');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleAISummary = async () => {
    setAiLoading(true);
    try {
      const result = await fetchTenderAISummary(id);
      setAiSummary(result);
    } catch (err) {
      console.error('Failed to fetch AI summary', err);
      setError('Failed to fetch AI summary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIEvaluationSuggestions = async () => {
    setAiLoading(true);
    try {
      const result = await fetchTenderAIEvaluationSuggestions(id);
      setAiEval(result);
    } catch (err) {
      console.error('Failed to fetch AI evaluation suggestions', err);
      setError('Failed to fetch AI evaluation suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading tender...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!tender) {
    return <p className="text-sm text-slate-500">Tender not found.</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/pf/tenders')}
        className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← Back to tenders
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{tender.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{tender.project_name}</p>
          <p className="text-xs text-slate-500 mt-1">
            Tender #: <span className="font-mono">{tender.tender_number || '—'}</span>
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Status: {tender.status}</div>
          <div>Method: {tender.evaluation_method}</div>
          <div>
            Weights: tech {tender.technical_weight}, fin {tender.financial_weight}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-white p-4 text-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Proposals</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Vendor ID</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Tech</th>
                  <th className="px-3 py-2 text-left">Fin</th>
                  <th className="px-3 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-1 font-mono text-[11px] text-slate-600">
                      {p.vendor_id}
                    </td>
                    <td className="px-3 py-1 text-slate-900 text-xs">{p.title}</td>
                    <td className="px-3 py-1 text-xs">{p.technical_score ?? '—'}</td>
                    <td className="px-3 py-1 text-xs">{p.financial_score ?? '—'}</td>
                    <td className="px-3 py-1 text-xs font-semibold">
                      {p.total_score != null ? p.total_score.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={5}>
                      No proposals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Evaluation summary</h3>
            <button
              onClick={handleReevaluate}
              disabled={evalLoading}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
            >
              {evalLoading ? 'Evaluating...' : 'Re-evaluate'}
            </button>
          </div>
          <div className="text-xs text-slate-700 space-y-1 min-h-[3rem]">
            {evaluation ? (
              <>
                <p>
                  <span className="text-slate-500">Method:</span> {evaluation.method}
                </p>
                <p>
                  <span className="text-slate-500">Recommended vendor ID:</span>{' '}
                  {evaluation.recommended_vendor_id}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">Ranking:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {evaluation.proposals?.map((p) => (
                    <li key={p.proposal_id}>
                      Vendor {p.vendor_id} – total {p.total_score?.toFixed(1)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <span className="text-slate-400">No evaluation yet.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">AI summary</h3>
            <button
              onClick={handleAISummary}
              disabled={aiLoading}
              className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:bg-slate-400"
            >
              {aiLoading ? 'Calling AI...' : 'Call summary AI'}
            </button>
          </div>
          <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700 min-h-[3rem]">
            {aiSummary ? (
              <pre className="whitespace-pre-wrap text-[11px]">
                {JSON.stringify(aiSummary, null, 2)}
              </pre>
            ) : (
              <span className="text-slate-400">No AI summary yet.</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">AI evaluation suggestions</h3>
            <button
              onClick={handleAIEvaluationSuggestions}
              disabled={aiLoading}
              className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:bg-slate-400"
            >
              {aiLoading ? 'Calling AI...' : 'Call evaluation AI'}
            </button>
          </div>
          <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700 min-h-[3rem]">
            {aiEval ? (
              <pre className="whitespace-pre-wrap text-[11px]">
                {JSON.stringify(aiEval, null, 2)}
              </pre>
            ) : (
              <span className="text-slate-400">No AI evaluation suggestions yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PfTenderDetail;
