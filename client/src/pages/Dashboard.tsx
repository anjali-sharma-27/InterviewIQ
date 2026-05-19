import React, { lazy, Suspense, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import InterviewCard from "../components/InterviewCard";
import Loader from "../components/Loader/Loader";
import { getAllInterviews } from "@/api/mockinterview.api";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { useNavigate } from "react-router-dom";
import { Interview } from "@/types/global";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "@/components/DashboardStats";
import InterviewTemplates from "@/components/InterviewTemplates";

const ProgressChart = lazy(() => import("@/components/ProgressChart"));
import Form, { type FormInitialValues } from "@/components/Form";
import type { InterviewTemplate } from "@/data/interviewTemplates";
import { Button } from "@/components/ui/button";
import { useScrollToSectionOnLoad } from "@/utils/hooks/useScrollToSectionOnLoad";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formPreset, setFormPreset] = useState<FormInitialValues | undefined>();
  const { addNotification } = useNotification();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useScrollToSectionOnLoad();

  const loadInterviews = async () => {
    const response = await getAllInterviews();
    setInterviews(response);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const authed = await refreshUser();
        if (!authed) {
          navigate("/login");
          return;
        }
        await loadInterviews();
      } catch {
        addNotification({
          id: Date.now().toString(),
          type: "error",
          message: "Please sign in to continue",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [addNotification, navigate, refreshUser]);

  const openForm = (preset?: FormInitialValues) => {
    setFormPreset(preset);
    setFormOpen(true);
  };

  const handleTemplateSelect = (template: InterviewTemplate) => {
    openForm({
      jobProfile: template.jobRole,
      experienceLevel: template.experienceLevel,
      targetCompany: template.targetCompany,
      tags: [...template.skills],
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader />
      </div>
    );
  }

  return (
    <AppLayout variant="app">
      {formOpen && (
        <Form
          key={formPreset ? JSON.stringify(formPreset) : "blank"}
          initialValues={formPreset}
          onClose={() => {
            setFormOpen(false);
            setFormPreset(undefined);
          }}
          onSuccess={async () => {
            setFormOpen(false);
            setFormPreset(undefined);
            try {
              await loadInterviews();
            } catch {
              addNotification({
                id: Date.now().toString(),
                type: "error",
                message: "Interview created but failed to refresh the list",
              });
            }
          }}
        />
      )}

      <div className="container mx-auto px-4 pb-16 md:px-8">
        <section className="mb-10">
          <p className="text-sm font-medium text-emerald-400">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Your interview hub
              </h1>
              <p className="mt-2 max-w-xl text-zinc-400">
                Create sessions, practice with voice and code, and review AI
                feedback.
              </p>
            </div>
            <Button
              className="btn-emerald-action shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={() => openForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New interview
            </Button>
          </div>
        </section>

        <DashboardStats interviews={interviews} />

        <section className="mt-10">
          <Suspense
            fallback={
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
                <h3 className="text-lg font-semibold text-white">Your progress</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Overall rating across completed sessions
                </p>
                <div className="mt-6 h-[260px] animate-pulse rounded-lg bg-zinc-800/60" />
              </div>
            }
          >
            <ProgressChart interviews={interviews} />
          </Suspense>
        </section>

        <section id="templates" className="mt-12 scroll-mt-28">
          <InterviewTemplates onSelect={handleTemplateSelect} />
        </section>

        <section id="history" className="mt-16 scroll-mt-28">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Past interviews
              </h2>
              <p className="text-sm text-zinc-400">
                {interviews.length} session{interviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {interviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
              <p className="text-lg font-medium text-zinc-300">
                No interviews yet
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Pick a template above or create a custom session to get started.
              </p>
              <Button
                className="mt-6 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => openForm()}
              >
                Create your first interview
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onRetake={openForm}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
