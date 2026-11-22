import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import MainLayout from "../layouts/MainLayout";
import PublicLayout from "../layouts/PublicLayout";
import AppointmentsPage from "../pages/AppointmentsPage";
import AuditPage from "../pages/AuditPage";
import CandidatesPage from "../pages/CandidatesPage";
import ClinicManagementPage from "../pages/ClinicManagementPage";
import DashboardPage from "../pages/DashboardPage";
import DocumentsPage from "../pages/DocumentsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import MedicalResultsPage from "../pages/MedicalResultsPage";
import MedicalStaffPage from "../pages/MedicalStaffPage";
import NotificationsPage from "../pages/NotificationsPage";
import ReportsPage from "../pages/ReportsPage";
import ProcessesPage from "../pages/ProcessesPage";
import ExamRequestsPage from "../pages/ExamRequestsPage";
import { MODULE_ROLES } from "../constants/navigation";
import { ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import LegalPage from "../pages/LegalPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path={ROUTES.privacy} element={<LegalPage />} />
      <Route path={ROUTES.terms} element={<LegalPage />} />
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
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
            <RoleRoute allowedRoles={MODULE_ROLES.dashboard}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.candidates}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.candidates}>
              <CandidatesPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.processes}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.processes}>
              <ProcessesPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.examRequests}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.examRequests}>
              <ExamRequestsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.appointments}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.appointments}>
              <AppointmentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.clinicManagement}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.clinicManagement}>
              <ClinicManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.medicalStaff}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <MedicalStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.audit}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.audit}>
              <AuditPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.documents}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.documents}>
              <DocumentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.medicalResults}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.medicalResults}>
              <MedicalResultsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.reports}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.reports}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.notifications}
          element={
            <RoleRoute allowedRoles={MODULE_ROLES.notifications}>
              <NotificationsPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
