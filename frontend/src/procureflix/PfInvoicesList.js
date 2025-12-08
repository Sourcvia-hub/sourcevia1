import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices } from './api';

const PfInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices', err);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading invoices...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sourcevia invoices linked to vendors, purchase orders, and contracts.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Invoice #</th>
              <th className="px-4 py-2 text-left">Vendor ID</th>
              <th className="px-4 py-2 text-left">PO ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Due date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/pf/invoices/${inv.id}`)}
              >
                <td className="px-4 py-2 font-mono text-xs text-slate-600">{inv.invoice_number}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{inv.vendor_id}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{inv.po_id || '—'}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  {inv.status}
                </td>
                <td className="px-4 py-2 text-xs text-slate-700">
                  {inv.amount?.toLocaleString()} {inv.currency}
                </td>
                <td className="px-4 py-2 text-xs text-slate-700">
                  {new Date(inv.due_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-xs text-slate-500" colSpan={6}>
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PfInvoicesList;
