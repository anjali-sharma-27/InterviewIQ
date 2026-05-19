import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import NotificationCard from "./components/Notifications/NotificationCard";
import Loader from "./components/Loader/Loader";
import InterviewReviewPage from "@/pages/InterviewReviewPage";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((m) => ({ default: m.SignupPage }))
);
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InterviewInterfacePage = lazy(
  () => import("./pages/InterviewInterfacePage")
);
const InterviewDetails = lazy(() =>
  import("./pages/InterviewDetails").then((m) => ({
    default: m.InterviewDetails,
  }))
);
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <NotificationCard />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/interviewinterface/:id"
            element={<InterviewInterfacePage />}
          />
          <Route path="/interviewdetails/:id" element={<InterviewDetails />} />
          <Route
            path="/interview/:id/review"
            element={
              <ProtectedRoute>
                <InterviewReviewPage />
              </ProtectedRoute>
            }
          />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
