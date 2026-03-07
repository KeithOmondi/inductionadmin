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
import JudgesReligion from "../pages/judge/JudgesReligion";
import AdminOath from "../pages/admin/AdminOath";
import ResetPassword from "../components/Login/ResetPassword";
import GuestLayout from "../components/guests/GuestLayout";
import GuestDashboardPage from "../pages/guests/GuestDashboard";
import GuestCourtInfoPage from "../pages/guests/GuestCourtInfo";
import { GuestMessagesPage } from "../pages/guests/GuestMessages";
import GuestNoticesPage from "../pages/guests/GuestNotices";
import GuestEventsPage from "../pages/guests/GuestEvents";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminGallery from "../pages/admin/AdminGallary";
import JudgeGallery from "../pages/judge/JudgesGallary";
import GuestGallery from "../pages/guests/GuestGallary";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
        <Route path="oath" element={<AdminOath />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="gallary" element={<AdminGallery />} />
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
        <Route path="oath" element={<JudgesReligion />} />
        <Route path="gallary" element={<JudgeGallery />} />

        {/* Default redirect for /judge */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route
      path="/guest"
      element={
          <ProtectedRoute allowedRoles={["guest"]}>
            <GuestLayout /> 
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<GuestDashboardPage />} />
        <Route path="info" element={<GuestCourtInfoPage />} />
        <Route path="messages" element={<GuestMessagesPage />} />
        <Route path="notices" element={<GuestNoticesPage />} />
        <Route path="event" element={<GuestEventsPage />} />
        <Route path="gallary" element={<GuestGallery />} />

      </Route>

      {/* 4. ROOT & FALLBACK ROUTES */}
      <Route path="/" element={<Navigate to="/judge/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/judge/dashboard" replace />} />
    </Routes>
  );
}
