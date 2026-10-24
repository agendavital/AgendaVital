import { Route, Routes } from "react-router-dom";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import MainLayout from "../layouts/MainLayout";
import PublicLayout from "../layouts/PublicLayout";
import AppointmentsPage from "../pages/AppointmentsPage";
import AuditPage from "../pages/AuditPage";
import CandidatesPage from "../pages/CandidatesPage";
import DashboardPage from "../pages/DashboardPage";
import DocumentsPage from "../pages/DocumentsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import MedicalResultsPage from "../pages/MedicalResultsPage";
import NotFoundPage from "../pages/NotFoundPage";
import NotificationsPage from "../pages/NotificationsPage";
import ReportsPage from "../pages/ReportsPage";
import UsersPage from "../pages/UsersPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.dashboard}
          element={
            <RoleRoute allowedRoles={Object.values(ROLES)}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.candidates}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.CLINIC]}>
              <CandidatesPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.appointments}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.CLINIC, ROLES.DOCTOR]}>
              <AppointmentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.users}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.documents}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.CLINIC, ROLES.DOCTOR]}>
              <DocumentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.medicalResults}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.CLINIC, ROLES.DOCTOR]}>
              <MedicalResultsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.reports}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.HR]}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.notifications}
          element={
            <RoleRoute allowedRoles={Object.values(ROLES)}>
              <NotificationsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.audit}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AuditPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
