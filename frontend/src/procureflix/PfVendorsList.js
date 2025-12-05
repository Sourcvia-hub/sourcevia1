import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVendors } from './api';

const riskBadgeClasses = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-orange-50 text-orange-700 border-orange-100',
  very_high: 'bg-red-50 text-red-700 border-red-100',
};

const PfVendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchVendors();
        setVendors(data);
      } catch (err) {
        console.error('Failed to load vendors', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading vendors...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Vendors</h2>
          <p className="text-sm text-slate-500 mt-1">
            Seeded ProcureFlix vendor records with risk & due diligence info.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Vendor #</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Risk</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/vendors/${v.id}`)}
              >
                <td className="px-4 py-2 font-mono text-xs text-slate-600">
                  {v.vendor_number || '—'}
                </td>
                <td className="px-4 py-2 text-slate-900 text-sm">{v.name_english}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      riskBadgeClasses[v.risk_category] || 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}
                  >
                    {v.risk_category?.replace('_', ' ') || 'unknown'}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {v.status}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfVendorsList;
