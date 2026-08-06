import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { AppNavbar } from "./AppNavbar";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";

function HomePage() {
  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-ink-600 dark:text-ink-300">
          Page content goes here. Ask for the next page whenever you're ready.
        </p>
      </main>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Add /signup, /my-learning, etc. as those pages get built */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}