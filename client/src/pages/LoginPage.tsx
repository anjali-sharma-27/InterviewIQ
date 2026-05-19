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
import { loginUser } from "@/api/user.api";
import { useNotification } from "../components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";

export function LoginPage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { addNotification } = useNotification();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const formData = { email, password };
    try {
      await loginUser(formData);
      await refreshUser();
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Login successful",
      } as Notification);
      navigate("/dashboard");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Login failed"}`,
      } as Notification);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = (result as { _tokenResponse?: { idToken?: string } })
        ._tokenResponse?.idToken;
      await loginUser({ firebaseUID: idToken });
      await refreshUser();
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Login successful",
      } as Notification);
      navigate("/dashboard");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Google sign-in failed"}`,
      } as Notification);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout variant="public" showFooter={false} mainClassName="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4">
      <div
        className={cn("w-full max-w-md", className)}
        {...props}
      >
        <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to continue your interview practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
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
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
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
              <Button
                type="button"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleLogin}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
                onClick={handleGoogleSignin}
              >
                Continue with Google
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-400 underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
