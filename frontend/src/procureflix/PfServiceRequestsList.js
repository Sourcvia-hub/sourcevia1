import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchServiceRequests } from './api';

const PfServiceRequestsList = () => {
  const [srs, setSrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchServiceRequests();
        setSrs(data);
      } catch (err) {
        console.error('Failed to load service requests', err);
        setError('Failed to load service requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading service requests...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Service Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Operational service requests linked to vendors, contracts, and assets.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Vendor ID</th>
              <th className="px-4 py-2 text-left">Contract ID</th>
              <th className="px-4 py-2 text-left">Asset ID</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {srs.map((sr) => (
              <tr
                key={sr.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/service-requests/${sr.id}`)}
              >
                <td className="px-4 py-2 text-slate-900 text-sm">{sr.title}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{sr.vendor_id}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                  {sr.contract_id || '—'}
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                  {sr.asset_id || '—'}
                </td>
                <td className="px-4 py-2 text-xs text-slate-700">{sr.priority}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {sr.status}
                </td>
              </tr>
            ))}
            {srs.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={6}>
                  No service requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfServiceRequestsList;
