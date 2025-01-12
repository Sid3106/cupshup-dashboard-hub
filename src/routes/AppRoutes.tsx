import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import DashboardPage from "@/pages/dashboard/Index";
import AuthPage from "@/pages/auth/Index";
import AuthCallbackPage from "@/pages/auth/callback";
import UsersPage from "@/pages/dashboard/users/Index";
import UserDetailPage from "@/pages/dashboard/users/[id]";
import VendorsPage from "@/pages/dashboard/vendors/Index";
import VendorDetailPage from "@/pages/dashboard/vendors/[id]";
import ClientsPage from "@/pages/dashboard/clients/Index";
import ActivitiesPage from "@/pages/dashboard/activities/Index";
import MyActivitiesPage from "@/pages/dashboard/my-activities/Index";
import MappedActivitiesPage from "@/pages/dashboard/mapped-activities/Index";
import ProfilePage from "@/pages/dashboard/profile/Index";
import SettingsPage from "@/pages/dashboard/settings/Index";
import TestPage from "@/pages/dashboard/test/Index";
import ActivityDetailPage from "@/pages/dashboard/my-activities/[id]";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/users/:id"
        element={
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/vendors"
        element={
          <ProtectedRoute>
            <VendorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/vendors/:id"
        element={
          <ProtectedRoute>
            <VendorDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/activities"
        element={
          <ProtectedRoute>
            <ActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-activities"
        element={
          <ProtectedRoute>
            <MyActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-activities/:id"
        element={
          <ProtectedRoute>
            <ActivityDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mapped-activities"
        element={
          <ProtectedRoute>
            <MappedActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/test"
        element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}