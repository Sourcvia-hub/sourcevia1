/* ProcureFlix routes snippet */
// ...imports above
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
import PfResourcesList from './procureflix/PfResourcesList';
import PfResourceDetail from './procureflix/PfResourceDetail';
import PfServiceRequestsList from './procureflix/PfServiceRequestsList';
import PfServiceRequestDetail from './procureflix/PfServiceRequestDetail';

// ... inside AppRoutes
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
  <Route path="resources" element={<PfResourcesList />} />
  <Route path="resources/:id" element={<PfResourceDetail />} />
  <Route path="service-requests" element={<PfServiceRequestsList />} />
  <Route path="service-requests/:id" element={<PfServiceRequestDetail />} />
</Route>
