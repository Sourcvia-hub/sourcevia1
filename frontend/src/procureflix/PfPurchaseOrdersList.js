import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPurchaseOrders } from './api';

const PfPurchaseOrdersList = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPurchaseOrders();
        setPos(data);
      } catch (err) {
        console.error('Failed to load purchase orders', err);
        setError('Failed to load purchase orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading purchase orders...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Purchase Orders</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sourcevia purchase orders linked to vendors and contracts.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">PO #</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Vendor ID</th>
              <th className="px-4 py-2 text-left">Contract ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pos.map((po) => (
              <tr
                key={po.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/purchase-orders/${po.id}`)}
              >
                <td className="px-4 py-2 font-mono text-xs text-slate-600">{po.po_number}</td>
                <td className="px-4 py-2 text-slate-900 text-sm">{po.description}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{po.vendor_id}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                  {po.contract_id || '—'}
                </td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {po.status}
                </td>
                <td className="px-4 py-2 text-xs text-slate-700">
                  {po.amount?.toLocaleString()} {po.currency}
                </td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={6}>
                  No purchase orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfPurchaseOrdersList;
