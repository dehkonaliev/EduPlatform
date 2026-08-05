import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Navbar } from "./components/layout/Navbar";

// Replace with your real auth state (e.g. from a useAuth() hook in features/auth)
const demoUser = {
  name: "Aziz Karimov",
  avatarUrl: undefined,
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar user={demoUser} onLogout={() => console.log("logout")} />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-ink-600 dark:text-ink-300">
            Page content goes here. Ask for the next page whenever you're ready.
          </p>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}