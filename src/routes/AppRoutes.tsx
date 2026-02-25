// AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin Imports
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminLayout from "../components/admin/AdminLayout";

// Judge Imports
import JudgeDashboardPage from "../pages/judge/JudgeDashboard";
import JudgeLayout from "../components/judge/JudgeLayout";
import JudgeGuestsPage from "../pages/judge/JudgeGuests";
import JudgeNoticesPages from "../pages/judge/JudgeNotices";
import JudgeEventsPage from "../pages/judge/JudgeEvents";
import CourtInformation from "../pages/judge/CourtInformation";
import AdminCourtInfo from "../pages/admin/AdminCourtInfo";
import AdminGuestList from "../pages/admin/AdminGuestList";
import AdminNoticesPage from "../pages/admin/AdminNoticesPage";
import AdminEventsPage from "../pages/admin/AdminEventsPage";
import JudgeMessagePage from "../pages/judge/JudgeMessage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout /> {/* Make sure AdminLayout has <Outlet /> */}
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="info" element={<AdminCourtInfo />} />
        <Route path="list" element={<AdminGuestList />} />
        <Route path="notice" element={<AdminNoticesPage />} />
        <Route path="event" element={<AdminEventsPage />} />
        {/* Default redirect for /admin */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 3. JUDGE / USER ROUTES */}
      <Route
        path="/judge"
        element={
          <ProtectedRoute allowedRoles={["judge"]}>
            <JudgeLayout /> {/* Make sure JudgeLayout has <Outlet /> */}
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<JudgeDashboardPage />} />
        <Route path="info" element={<CourtInformation />} />
        <Route path="guests" element={<JudgeGuestsPage />} />
        {/* You can add more judge routes here like messages, notices, events, settings */}
        <Route path="messages" element={<JudgeMessagePage />} />
        <Route path="notices" element={<JudgeNoticesPages />} />
        <Route path="events" element={<JudgeEventsPage />} />

        {/* Default redirect for /judge */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 4. ROOT & FALLBACK ROUTES */}
      <Route path="/" element={<Navigate to="/judge/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/judge/dashboard" replace />} />
    </Routes>
  );
}
