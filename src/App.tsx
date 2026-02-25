import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AuthLayout from "./components/layout/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RequestAccess from "./pages/auth/RequestAccess";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyDevice from "./pages/auth/VerifyDevice";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Feed from "./pages/feed/Feed";
import Rooms from "./pages/rooms/Rooms";
import RoomPage from "./pages/rooms/RoomPage";
import Projects from "./pages/projects/Projects";
import ProjectDetail from "./pages/projects/ProjectDetail";
import CreateProject from "./pages/create/CreateProject";
import Profile from "./pages/profile/Profile";
import PublicProfile from "./pages/profile/PublicProfile";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import CreatePost from "./pages/create/CreatePost";
import Thread from "./pages/thread/Thread";
import Setup from "./pages/onboarding/Setup";
import Rules from "./pages/onboarding/Rules";
import RoomsOnboarding from "./pages/onboarding/Rooms";

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/welcome" element={<Welcome />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/request-access" element={<RequestAccess />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/verify-device" element={<VerifyDevice />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Onboarding Routes */}
        <Route path="/onboarding/setup" element={<Setup />} />
        <Route path="/onboarding/rules" element={<Rules />} />
        <Route path="/onboarding/rooms" element={<RoomsOnboarding />} />
      </Route>

      {/* Protected Routes - Main App */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/thread/:id" element={<Thread />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<RoomPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
          <Route path="/profile/me" element={<Profile />} />
          <Route path="/profile/:handle" element={<PublicProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth/welcome" replace />} />
    </Routes>
  );
}

export default App;
