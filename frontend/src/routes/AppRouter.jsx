import { Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import MainLayout from "../layouts/MainLayout";
import PublicLayout from "../layouts/PublicLayout";
import AppointmentsPage from "../pages/AppointmentsPage";
import CandidatesPage from "../pages/CandidatesPage";
import DashboardPage from "../pages/DashboardPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
