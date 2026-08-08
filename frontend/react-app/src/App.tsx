import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { RequireAuth } from "./providers/RequireAuth";
import { ToastProvider } from "./providers/ToastProvider";
import HomePage from "./pages/Home";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
import PasswordResetPage from "./pages/auth/PasswordReset";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import ProfilePage from "./pages/Profile";
import CourseDetailPage from "./pages/CourseDetail";
import MyLearningPage from "./pages/MyLearning";
import LessonPage from "./pages/Lesson";
import SettingsLayout from "./pages/settings/SettingsLayout";
import ProfileSection from "./pages/settings/ProfileSection";
import StudentSection from "./pages/settings/StudentSection";
import PreferencesSection from "./pages/settings/PreferencesSection";
import PasswordSection from "./pages/settings/PasswordSection";
import AccountSection from "./pages/settings/AccountSection";
import SubscriptionsPage from "./pages/Subscriptions";
import TransactionsPage from "./pages/Transactions";
import MyPurchasesPage from "./pages/MyPurchases";
import SearchCoursesPage from "./pages/SearchCourses";
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/password-reset" element={<PasswordResetPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/courses" element={<SearchCoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route
                path="/my-learning"
                element={
                  <RequireAuth>
                    <MyLearningPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/learn/:lessonId"
                element={
                  <RequireAuth>
                    <LessonPage />
                  </RequireAuth>
                }
              />
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
                <Route path="passwords" element={<PasswordSection />} />
                <Route path="account" element={<AccountSection />} />
              </Route>
              <Route
                path="/subscriptions"
                element={
                  <RequireAuth>
                    <SubscriptionsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/transactions"
                element={
                  <RequireAuth>
                    <TransactionsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/purchases"
                element={
                  <RequireAuth>
                    <MyPurchasesPage />
                  </RequireAuth>
                }
              />
              {/* Add /my-learning, /courses/:slug, /certificates, etc. as those pages get built */}
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}