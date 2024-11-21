import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";
import RightPanel from "./components/common/RightPanel";
import Sidebar from "./components/common/Sidebar";
import LoginPage from "./pages/auth/login/LoginPage";
import SignupPage from "./pages/auth/signup/SignupPage";
import HomePage from "./pages/home/HomePage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();

        if (data.error) return null;

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("AuthUser is here:", data);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      <Toaster />
      {authUser && <Sidebar />}

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        />
      </Routes>
      {authUser && <RightPanel />}
    </div>
  );
};

export default App;
