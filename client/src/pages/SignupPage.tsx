import { cn } from "@/utils/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase/firebase";
import { registerUser } from "@/api/user.api";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";

export function SignupPage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { refreshUser } = useAuth();

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = (result as { _tokenResponse?: { idToken?: string; displayName?: string; email?: string } })
        ._tokenResponse;
      await registerUser({
        name: token?.displayName ?? "User",
        email: token?.email ?? "",
        password: `${Math.random() * 1000000}`,
        firebaseUID: token?.idToken ?? "",
      });
      await refreshUser();
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Account created successfully",
      } as Notification);
      navigate("/dashboard");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Sign up failed"}`,
      } as Notification);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      addNotification({
        id: Date.now().toString(),
        type: "warning",
        message: "Passwords do not match",
      } as Notification);
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name, email, password, firebaseUID: "" });
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Account created — please sign in",
      } as Notification);
      navigate("/login");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Sign up failed"}`,
      } as Notification);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      variant="public"
      showFooter={false}
      mainClassName="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4"
    >
      <div className={cn("w-full max-w-md", className)} {...props}>
        <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create account</CardTitle>
            <CardDescription className="text-zinc-400">
              Start practicing with AI mock interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-300">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="border-zinc-700 bg-zinc-950 text-zinc-100"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="border-zinc-700 bg-zinc-950 text-zinc-100"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="border-zinc-700 bg-zinc-950 pr-10 text-zinc-100"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="border-zinc-700 bg-zinc-950 pr-10 text-zinc-100"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="button"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleSignup}
              >
                {loading ? "Creating account…" : "Sign up"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
                onClick={handleGoogleSignup}
              >
                Continue with Google
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
