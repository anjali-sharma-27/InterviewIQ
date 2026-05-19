import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
  return (
    <AppLayout variant="public" showFooter={false} mainClassName="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4">
      <div className="space-y-8 text-center">
        <div className="animate-bounce">
          <Ghost className="mx-auto h-24 w-24 text-emerald-400" />
        </div>
        <h1 className="bg-gradient-to-r from-emerald-400 via-violet-500 to-white bg-clip-text text-6xl font-bold text-transparent">
          404
        </h1>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Page not found</h2>
          <p className="mx-auto max-w-md text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>
        <Button
          asChild
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </AppLayout>
  );
}
