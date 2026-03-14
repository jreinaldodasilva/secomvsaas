import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout/DashboardLayout';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute/ProtectedRoute';
import { LandingPage } from '../pages/Landing/LandingPage';
import { LoginPage } from '../pages/Login/LoginPage';
import { RegisterPage } from '../pages/Register/RegisterPage';
import { AcceptInvitePage } from '../pages/AcceptInvite/AcceptInvitePage';
import { ForgotPasswordPage } from '../pages/ForgotPassword/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPassword/ResetPasswordPage';
import { DashboardPage } from '../pages/Admin/Dashboard/DashboardPage';
import { UsersPage } from '../pages/Admin/Users/UsersPage';
import { ProfilePage } from '../pages/Settings/ProfilePage';
import { NotFoundPage } from '../pages/Error/NotFoundPage';
import { UnauthorizedPage } from '../pages/Error/UnauthorizedPage';
import { PressReleasesPage } from '../pages/Domain/PressReleases/PressReleasesPage';
import { MediaContactsPage } from '../pages/Domain/MediaContacts/MediaContactsPage';
import { ClippingsPage } from '../pages/Domain/Clippings/ClippingsPage';
import { EventsPage } from '../pages/Domain/Events/EventsPage';
import { AppointmentsPage } from '../pages/Domain/Appointments/AppointmentsPage';
import { CitizenPortalPage } from '../pages/Domain/CitizenPortal/CitizenPortalPage';
import { SocialMediaPage } from '../pages/Domain/SocialMedia/SocialMediaPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/press-releases" element={<PressReleasesPage />} />
        <Route path="/media-contacts" element={<MediaContactsPage />} />
        <Route path="/clippings" element={<ClippingsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/citizen-portal" element={<CitizenPortalPage />} />
        <Route path="/social-media" element={<SocialMediaPage />} />
      </Route>

      {/* Fallback */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
