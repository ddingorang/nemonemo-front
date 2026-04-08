// Created: 2026-04-08 23:13:30
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/customer/HomePage.jsx'
import InquiryPage from './pages/customer/InquiryPage.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import UnitsPage from './pages/admin/UnitsPage.jsx'
import InquiriesPage from './pages/admin/InquiriesPage.jsx'
import ContractsPage from './pages/admin/ContractsPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="units" element={<UnitsPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="contracts" element={<ContractsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
