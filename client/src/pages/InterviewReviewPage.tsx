import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getInterviewByID } from "@/api/mockinterview.api";
import AppLayout from "@/components/layout/AppLayout";
import Loader from "@/components/Loader/Loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MockInterview, Question } from "@/vite-env";

type QuestionCategory = "Technical" | "Core Subject" | "DSA";

interface CategorizedQuestion {
  question: Question;
  category: QuestionCategory;
}

function formatInterviewDate(date?: Date | string): string {
  if (!date) return "Date unavailable";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function QuestionReviewCard({ item }: { item: CategorizedQuestion }) {
  const { question, category } = item;

  return (
    <Card className="border-zinc-800 bg-zinc-800/50">
      <CardHeader className="space-y-3 pb-3">
        <span className="w-fit rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
          {category}
        </span>
        <CardTitle className="text-base font-medium leading-relaxed text-white">
          {String(question.question)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Your answer
          </p>
          <p className="mt-1.5 text-sm text-zinc-300">
            {question.answer ? String(question.answer) : "No answer recorded"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90">
            AI review
          </p>
          <p className="mt-1.5 text-sm text-zinc-300">
            {question.review ? String(question.review) : "No review yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InterviewReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<MockInterview | null>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getInterviewByID(id);
        setInterview(data);
      } catch (error) {
        console.error(error);
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const categorizedQuestions = useMemo<CategorizedQuestion[]>(() => {
    if (!interview) return [];

    const technical: CategorizedQuestion[] = (
      interview.technicalQuestions ?? []
    ).map((q) => ({ question: q, category: "Technical" as const }));

    const coreSubject: CategorizedQuestion[] = (
      interview.coreSubjectQuestions ?? []
    ).map((q) => ({ question: q, category: "Core Subject" as const }));

    const dsa: CategorizedQuestion[] = (interview.dsaQuestions ?? []).map(
      (q) => ({ question: q, category: "DSA" as const })
    );

    return [...technical, ...coreSubject, ...dsa];
  }, [interview]);

  if (loading) {
    return (
      <AppLayout variant="app">
        <div className="flex min-h-[50vh] items-center justify-center bg-zinc-900">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (!interview) {
    return (
      <AppLayout variant="app">
        <div className="container mx-auto bg-zinc-900 px-4 py-16 text-center">
          <p className="text-zinc-400">Interview not found.</p>
          <Button
            variant="outline"
            className="mt-4 border-zinc-700"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout variant="app">
      <div className="min-h-screen bg-zinc-900">
        <div className="container mx-auto max-w-4xl px-4 pb-16 md:px-8">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 gap-2 text-zinc-400 hover:bg-transparent hover:text-emerald-400"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>

          <header className="mb-8 space-y-2">
            <p className="text-sm font-medium text-emerald-400">
              {interview.targetCompany}
            </p>
            <h1 className="text-3xl font-bold text-white">{interview.jobRole}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-lg bg-zinc-800 px-2.5 py-1 font-medium text-zinc-300">
                {interview.experienceLevel}
              </span>
              <span>{formatInterviewDate(interview.createdAt)}</span>
            </div>
          </header>

          <div className="mb-10 flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/60 px-6 py-8 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Overall rating
            </p>
            <p className="mt-2 text-6xl font-bold tabular-nums text-emerald-400 md:text-7xl">
              {interview.overallRating}
              <span className="text-3xl font-semibold text-zinc-500 md:text-4xl">
                /10
              </span>
            </p>
          </div>

          <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-800/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Overall review
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-300">
              {interview.overallReview ||
                "Complete the interview to receive AI feedback."}
            </p>
          </section>

          {categorizedQuestions.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Question-by-question feedback
              </h2>
              {categorizedQuestions.map((item, index) => (
                <QuestionReviewCard key={index} item={item} />
              ))}
            </section>
          ) : (
            <p className="text-center text-zinc-500">
              No questions recorded for this interview.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
