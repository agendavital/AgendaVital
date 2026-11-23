import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import MainLayout from "../layouts/MainLayout";
import PublicLayout from "../layouts/PublicLayout";
import AppointmentsPage from "../pages/AppointmentsPage";
import AuditPage from "../pages/AuditPage";
import AccessControlPage from "../pages/AccessControlPage";
import CandidatesPage from "../pages/CandidatesPage";
import CandidatePortalPage from "../pages/CandidatePortalPage";
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
import { MODULE_PERMISSIONS } from "../constants/navigation";
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
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.dashboard}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.candidates}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.candidates}>
              <CandidatesPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.processes}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.processes}>
              <ProcessesPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.examRequests}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.examRequests}>
              <ExamRequestsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.appointments}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.appointments}>
              <AppointmentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.clinicManagement}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.clinicManagement}>
              <ClinicManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.medicalStaff}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.medicalStaff}>
              <MedicalStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.audit}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.audit}>
              <AuditPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.documents}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.documents}>
              <DocumentsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.medicalResults}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.medicalResults}>
              <MedicalResultsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.reports}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.reports}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.notifications}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.notifications}>
              <NotificationsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.accessControl}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.accessControl}>
              <AccessControlPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.candidatePortal}
          element={
            <RoleRoute requiredPermission={MODULE_PERMISSIONS.candidatePortal}>
              <CandidatePortalPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
