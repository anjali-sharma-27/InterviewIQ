import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, User } from "lucide-react";
import { APP_NAME } from "@/constants/brand";

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout variant="app">
      <div className="container mx-auto max-w-2xl px-4 pb-16 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Profile</h1>
        <p className="mb-8 text-zinc-400">Your account details</p>

        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
            <CardDescription className="text-zinc-500">
              Signed in to {APP_NAME}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <User className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-500">Name</p>
                <p className="font-medium text-zinc-100">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <Mail className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="font-medium text-zinc-100">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
