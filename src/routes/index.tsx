import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout/DashboardLayout';
import { CitizenPortalLayout } from '../layouts/CitizenPortalLayout/CitizenPortalLayout';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute/ProtectedRoute';
import { ProtectedCitizenRoute } from '../components/Auth/ProtectedRoute/ProtectedCitizenRoute';
import { rolesWithPermission } from '@vsaas/types';

const LandingPage = lazy(() => import('../pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));
const PrivacyPage = lazy(() => import('../pages/Legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../pages/Legal/TermsPage').then(m => ({ default: m.TermsPage })));
const LoginPage = lazy(() => import('../pages/Login/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Register/RegisterPage').then(m => ({ default: m.RegisterPage })));
const AcceptInvitePage = lazy(() => import('../pages/AcceptInvite/AcceptInvitePage').then(m => ({ default: m.AcceptInvitePage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('../pages/Admin/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('../pages/Admin/Users/UsersPage').then(m => ({ default: m.UsersPage })));
const ProfilePage = lazy(() => import('../pages/Settings/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('../pages/Error/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('../pages/Error/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const PressReleasesPage = lazy(() => import('../pages/Domain/PressReleases/PressReleasesPage').then(m => ({ default: m.PressReleasesPage })));
const MediaContactsPage = lazy(() => import('../pages/Domain/MediaContacts/MediaContactsPage').then(m => ({ default: m.MediaContactsPage })));
const ClippingsPage = lazy(() => import('../pages/Domain/Clippings/ClippingsPage').then(m => ({ default: m.ClippingsPage })));
const EventsPage = lazy(() => import('../pages/Domain/Events/EventsPage').then(m => ({ default: m.EventsPage })));
const AppointmentsPage = lazy(() => import('../pages/Domain/Appointments/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })));
const CitizenPortalPage = lazy(() => import('../pages/Domain/CitizenPortal/CitizenPortalPage').then(m => ({ default: m.CitizenPortalPage })));
const SocialMediaPage = lazy(() => import('../pages/Domain/SocialMedia/SocialMediaPage').then(m => ({ default: m.SocialMediaPage })));
const CitizenPortalHomePage = lazy(() => import('../pages/CitizenPortal/CitizenPortalHomePage').then(m => ({ default: m.CitizenPortalHomePage })));
const CitizenLoginPage = lazy(() => import('../pages/CitizenPortal/CitizenLoginPage').then(m => ({ default: m.CitizenLoginPage })));
const CitizenRegisterPage = lazy(() => import('../pages/CitizenPortal/CitizenRegisterPage').then(m => ({ default: m.CitizenRegisterPage })));
const CitizenDashboardPage = lazy(() => import('../pages/CitizenPortal/CitizenDashboardPage').then(m => ({ default: m.CitizenDashboardPage })));
const CitizenProfilePage = lazy(() => import('../pages/CitizenPortal/CitizenProfilePage').then(m => ({ default: m.CitizenProfilePage })));

function LazyFallback() {
  return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Auth routes — with public header/footer */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={rolesWithPermission('users:read')}><UsersPage /></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/press-releases" element={<ProtectedRoute allowedRoles={rolesWithPermission('press-releases:read')}><PressReleasesPage /></ProtectedRoute>} />
          <Route path="/media-contacts" element={<ProtectedRoute allowedRoles={rolesWithPermission('media-contacts:read')}><MediaContactsPage /></ProtectedRoute>} />
          <Route path="/clippings" element={<ProtectedRoute allowedRoles={rolesWithPermission('clippings:read')}><ClippingsPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute allowedRoles={rolesWithPermission('events:read')}><EventsPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={rolesWithPermission('appointments:read')}><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/citizen-portal" element={<ProtectedRoute allowedRoles={rolesWithPermission('citizen-portal:read')}><CitizenPortalPage /></ProtectedRoute>} />
          <Route path="/social-media" element={<ProtectedRoute allowedRoles={rolesWithPermission('social-media:read')}><SocialMediaPage /></ProtectedRoute>} />
        </Route>

        {/* Citizen Portal */}
        <Route element={<CitizenPortalLayout />}>
          <Route path="/portal" element={<CitizenPortalHomePage />} />
          <Route path="/portal/login" element={<CitizenLoginPage />} />
          <Route path="/portal/register" element={<CitizenRegisterPage />} />
          <Route path="/portal/dashboard" element={<ProtectedCitizenRoute><CitizenDashboardPage /></ProtectedCitizenRoute>} />
          <Route path="/portal/profile" element={<ProtectedCitizenRoute><CitizenProfilePage /></ProtectedCitizenRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
