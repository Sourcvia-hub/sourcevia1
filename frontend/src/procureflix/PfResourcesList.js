import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchResources } from './api';

const PfResourcesList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResources();
        setResources(data);
      } catch (err) {
        console.error('Failed to load resources', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading resources...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Resources</h2>
          <p className="text-sm text-slate-500 mt-1">
            ProcureFlix resources linked to vendors and contracts.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Vendor ID</th>
              <th className="px-4 py-2 text-left">Contract ID</th>
              <th className="px-4 py-2 text-left">Project</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/resources/${r.id}`)}
              >
                <td className="px-4 py-2 text-slate-900 text-sm">{r.name}</td>
                <td className="px-4 py-2 text-xs text-slate-700">{r.role}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{r.vendor_id}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                  {r.contract_id || '—'}
                </td>
                <td className="px-4 py-2 text-xs text-slate-700">{r.assigned_to_project || '—'}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {r.status}
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={6}>
                  No resources found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfResourcesList;
