import React from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const TenderDetail = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => navigate('/tenders')} className="text-blue-600 hover:text-blue-800">
          ← Back to Tenders
        </button>
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900">Tender Details</h1>
          <p className="text-gray-600 mt-2">Detailed tender view and proposal submission coming soon</p>
        </div>
      </div>
    </Layout>
  );
};

export default TenderDetail;
