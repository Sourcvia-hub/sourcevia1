import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTenders } from './api';

const PfTendersList = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTenders();
        setTenders(data);
      } catch (err) {
        console.error('Failed to load tenders', err);
        setError('Failed to load tenders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading tenders...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tenders</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sourcevia tenders with proposals & evaluation.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Tender #</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Project</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Evaluation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenders.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/tenders/${t.id}`)}
              >
                <td className="px-4 py-2 font-mono text-xs text-slate-600">
                  {t.tender_number || '—'}
                </td>
                <td className="px-4 py-2 text-slate-900 text-sm">{t.title}</td>
                <td className="px-4 py-2 text-xs text-slate-700">{t.project_name}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {t.status}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">{t.evaluation_method}</td>
              </tr>
            ))}
            {tenders.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={5}>
                  No tenders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfTendersList;
