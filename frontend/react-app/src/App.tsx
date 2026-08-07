import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { RequireAuth } from "./providers/RequireAuth";
import { ToastProvider } from "./providers/ToastProvider";
import HomePage from "./pages/Home";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
import ProfilePage from "./pages/Profile";
import CourseDetailPage from "./pages/CourseDetail";
import SettingsLayout from "./pages/settings/SettingsLayout";
import ProfileSection from "./pages/settings/ProfileSection";
import StudentSection from "./pages/settings/StudentSection";
import PreferencesSection from "./pages/settings/PreferencesSection";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <SettingsLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfileSection />} />
                <Route path="student" element={<StudentSection />} />
                <Route path="preferences" element={<PreferencesSection />} />
              </Route>
              {/* Add /my-learning, /courses/:slug, /certificates, etc. as those pages get built */}
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}