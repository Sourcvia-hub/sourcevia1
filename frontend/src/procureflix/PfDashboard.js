import React from 'react';

const PfDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">ProcureFlix Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          High-level view of ProcureFlix vendors and tenders (placeholder for now).
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Module</p>
          <p className="text-base font-semibold text-slate-900">Vendors</p>
          <p className="text-xs text-slate-500 mt-1">Seeded in-memory data for demos.</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Module</p>
          <p className="text-base font-semibold text-slate-900">Tenders</p>
          <p className="text-xs text-slate-500 mt-1">Includes proposals & evaluation.</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Data source</p>
          <p className="text-base font-semibold text-slate-900">In-memory + JSON seed</p>
          <p className="text-xs text-slate-500 mt-1">Ready to swap with SharePoint later.</p>
        </div>
      </div>
    </div>
  );
};

export default PfDashboard;
