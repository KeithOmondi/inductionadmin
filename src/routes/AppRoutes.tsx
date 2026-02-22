import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../components/AdminLayout";
import AdminMessages from "../pages/AdminMessages";
import AdminFiles from "../pages/AdminFiles";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes Wrapper */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* Placeholder Routes for future expansion */}
        <Route
          path="/messages"
          element={
            <AdminMessages />
          }
        />
        <Route
          path="/files"
          element={
            <AdminFiles />
          }
        />
        <Route
          path="/users"
          element={
            <div className="font-serif text-[#355E3B] font-bold">
              Personnel Ledger
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="font-serif text-[#355E3B] font-bold">
              System Configuration
            </div>
          }
        />
      </Route>

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
