import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { CitizenPortalLayout } from '@/layouts/CitizenPortalLayout/CitizenPortalLayout';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute/ProtectedRoute';
import { ProtectedCitizenRoute } from '@/components/Auth/ProtectedRoute/ProtectedCitizenRoute';
import { LoadingScreen } from '@/components/UI/Loading/Loading';
import { STAFF_ROLES, rolesWithPermission } from '@vsaas/types';

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
const CitizenRecordsPage = lazy(() => import('../pages/Domain/CitizenRecords/CitizenRecordsPage').then(m => ({ default: m.CitizenRecordsPage })));
const SocialMediaPage = lazy(() => import('../pages/Domain/SocialMedia/SocialMediaPage').then(m => ({ default: m.SocialMediaPage })));
const CitizenPortalHomePage = lazy(() => import('../pages/CitizenPortal/CitizenPortalHomePage').then(m => ({ default: m.CitizenPortalHomePage })));
const CitizenLoginPage = lazy(() => import('../pages/CitizenPortal/CitizenLoginPage').then(m => ({ default: m.CitizenLoginPage })));
const CitizenRegisterPage = lazy(() => import('../pages/CitizenPortal/CitizenRegisterPage').then(m => ({ default: m.CitizenRegisterPage })));
const CitizenEventsPage = lazy(() => import('../pages/CitizenPortal/CitizenEventsPage').then(m => ({ default: m.CitizenEventsPage })));
const CitizenEventRegistrationPage = lazy(() => import('../pages/CitizenPortal/CitizenEventRegistrationPage').then(m => ({ default: m.CitizenEventRegistrationPage })));
const CitizenDashboardPage = lazy(() => import('../pages/CitizenPortal/CitizenDashboardPage').then(m => ({ default: m.CitizenDashboardPage })));
const CitizenProfilePage = lazy(() => import('../pages/CitizenPortal/CitizenProfilePage').then(m => ({ default: m.CitizenProfilePage })));
const CitizenAppointmentsPage = lazy(() => import('../pages/CitizenPortal/CitizenAppointmentsPage').then(m => ({ default: m.CitizenAppointmentsPage })));

export function AppRoutes() {
  return (
    <Routes>
      {/* Public site + Auth routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Suspense fallback={<LoadingScreen />}><LandingPage /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<LoadingScreen />}><PrivacyPage /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<LoadingScreen />}><TermsPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<LoadingScreen />}><RegisterPage /></Suspense>} />
        <Route path="/accept-invite" element={<Suspense fallback={<LoadingScreen />}><AcceptInvitePage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<LoadingScreen />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<LoadingScreen />}><ResetPasswordPage /></Suspense>} />
      </Route>

      {/* Protected dashboard routes — staff only (excludes citizen role) */}
      <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES}><DashboardLayout /></ProtectedRoute>}>
        {/* No inner guard — accessible to all STAFF_ROLES by design */}
        <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingScreen />}><DashboardPage /></Suspense>} />
        <Route path="/admin/users" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('users:read')}><UsersPage /></ProtectedRoute></Suspense>} />
        {/* No inner guard — accessible to all STAFF_ROLES by design */}
        <Route path="/settings/profile" element={<Suspense fallback={<LoadingScreen />}><ProfilePage /></Suspense>} />
        <Route path="/press-releases" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('press-releases:read')}><PressReleasesPage /></ProtectedRoute></Suspense>} />
        <Route path="/media-contacts" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('media-contacts:read')}><MediaContactsPage /></ProtectedRoute></Suspense>} />
        <Route path="/clippings" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('clippings:read')}><ClippingsPage /></ProtectedRoute></Suspense>} />
        <Route path="/events" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('events:read')}><EventsPage /></ProtectedRoute></Suspense>} />
        <Route path="/appointments" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('appointments:read')}><AppointmentsPage /></ProtectedRoute></Suspense>} />
        <Route path="/citizen-portal" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('citizen-portal:read')}><CitizenRecordsPage /></ProtectedRoute></Suspense>} />
        <Route path="/social-media" element={<Suspense fallback={<LoadingScreen />}><ProtectedRoute allowedRoles={rolesWithPermission('social-media:read')}><SocialMediaPage /></ProtectedRoute></Suspense>} />
      </Route>

      {/* Citizen Portal */}
      {/* Public citizen routes — no auth guard */}
      <Route element={<CitizenPortalLayout />}>
        <Route path="/portal" element={<Suspense fallback={<LoadingScreen />}><CitizenPortalHomePage /></Suspense>} />
        <Route path="/portal/login" element={<Suspense fallback={<LoadingScreen />}><CitizenLoginPage /></Suspense>} />
        <Route path="/portal/register" element={<Suspense fallback={<LoadingScreen />}><CitizenRegisterPage /></Suspense>} />
        <Route path="/portal/events" element={<Suspense fallback={<LoadingScreen />}><CitizenEventsPage /></Suspense>} />
        <Route path="/portal/events/:id" element={<Suspense fallback={<LoadingScreen />}><CitizenEventRegistrationPage /></Suspense>} />
        {/* Protected citizen routes — explicit layout-level guard; mirrors the two-layer staff pattern */}
        <Route element={<ProtectedCitizenRoute><Outlet /></ProtectedCitizenRoute>}>
          <Route path="/portal/dashboard" element={<Suspense fallback={<LoadingScreen />}><CitizenDashboardPage /></Suspense>} />
          <Route path="/portal/profile" element={<Suspense fallback={<LoadingScreen />}><CitizenProfilePage /></Suspense>} />
          <Route path="/portal/appointments" element={<Suspense fallback={<LoadingScreen />}><CitizenAppointmentsPage /></Suspense>} />
        </Route>
      </Route>

      {/* Fallback — wrapped in PublicLayout for consistent header/footer context */}
      <Route element={<PublicLayout />}>
        <Route path="/unauthorized" element={<Suspense fallback={<LoadingScreen />}><UnauthorizedPage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<LoadingScreen />}><NotFoundPage /></Suspense>} />
      </Route>
    </Routes>
  );
}
