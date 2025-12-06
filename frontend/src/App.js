/* full updated App.js with ProcureFlix routes including purchase-orders and invoices */
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { API_URL } from './config/api';

const API = API_URL;

// ... (rest of App.js unchanged up to ProcureFlix route definition)
import ProcureFlixLayout from './procureflix/Layout';
import PfDashboard from './procureflix/PfDashboard';
import PfVendorsList from './procureflix/PfVendorsList';
import PfVendorDetail from './procureflix/PfVendorDetail';
import PfTendersList from './procureflix/PfTendersList';
import PfTenderDetail from './procureflix/PfTenderDetail';
import PfContractsList from './procureflix/PfContractsList';
import PfContractDetail from './procureflix/PfContractDetail';
import PfPurchaseOrdersList from './procureflix/PfPurchaseOrdersList';
import PfPurchaseOrderDetail from './procureflix/PfPurchaseOrderDetail';
import PfInvoicesList from './procureflix/PfInvoicesList';
import PfInvoiceDetail from './procureflix/PfInvoiceDetail';

// ... inside AppRoutes return:
// ProcureFlix routes under /pf/...
<Route
  path="/pf"
  element={
    <ProtectedRoute>
      <ProcureFlixLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="/pf/dashboard" replace />} />
  <Route path="dashboard" element={<PfDashboard />} />
  <Route path="vendors" element={<PfVendorsList />} />
  <Route path="vendors/:id" element={<PfVendorDetail />} />
  <Route path="tenders" element={<PfTendersList />} />
  <Route path="tenders/:id" element={<PfTenderDetail />} />
  <Route path="contracts" element={<PfContractsList />} />
  <Route path="contracts/:id" element={<PfContractDetail />} />
  <Route path="purchase-orders" element={<PfPurchaseOrdersList />} />
  <Route path="purchase-orders/:id" element={<PfPurchaseOrderDetail />} />
  <Route path="invoices" element={<PfInvoicesList />} />
  <Route path="invoices/:id" element={<PfInvoiceDetail />} />
</Route>
