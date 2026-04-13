// Created: 2026-04-08 23:13:30
import { useEffect, useState } from 'react'
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
import ErrorModal from './components/ErrorModal.jsx'

export default function App() {
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const handler = (e) => setErrorMessage(e.detail)
    window.addEventListener('app:error', handler)
    return () => window.removeEventListener('app:error', handler)
  }, [])

  return (
    <BrowserRouter>
      {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
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
