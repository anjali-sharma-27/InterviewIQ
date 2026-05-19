import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { Question, Interview } from "../types/global";
import Rating from "../components/Rating";
import Loader from "../components/Loader/Loader";
import { getInterviewByID } from "@/api/mockinterview.api";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QuestionList: React.FC<{ title: string; questions: Question[] }> = ({
  title,
  questions,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!questions.length) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-2">
        {questions.map((q, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-zinc-800"
          >
            <button
              type="button"
              className="w-full bg-zinc-900/80 p-4 text-left text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {q.question}
            </button>
            {openIndex === index && (
              <div className="space-y-3 border-t border-zinc-800 bg-zinc-950/50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Your answer
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {q.answer || "No answer recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                    AI review
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {q.review || "No review yet"}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function InterviewDetails() {
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<Interview>();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await getInterviewByID(id || "");
        setInterview(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewData();
  }, [id]);

  if (loading) {
    return (
      <AppLayout variant="app">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (!interview) {
    return (
      <AppLayout variant="app">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-zinc-400">Interview not found.</p>
          <Button asChild variant="outline" className="mt-4 border-zinc-700">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isIncomplete = interview.overallRating === 0;

  return (
    <AppLayout variant="app">
      <div className="container mx-auto max-w-4xl px-4 pb-16 md:px-8">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  {interview.targetCompany}
                </p>
                <CardTitle className="text-2xl text-white">
                  {interview.jobRole}
                </CardTitle>
                <span className="mt-2 inline-block rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300">
                  {interview.experienceLevel}
                </span>
              </div>
              <Rating
                experienceLevel={interview.experienceLevel}
                rating={interview.overallRating}
              />
            </div>

            {isIncomplete && (
              <Button
                className="w-fit bg-emerald-500 hover:bg-emerald-600"
                onClick={() => navigate(`/interviewinterface/${interview._id}`)}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue interview
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Overall review
              </h3>
              <p className="mt-2 text-zinc-300">
                {interview.overallReview ||
                  "Complete the interview to receive AI feedback."}
              </p>
            </div>

            <QuestionList
              title="DSA questions"
              questions={interview.dsaQuestions ?? []}
            />
            <QuestionList
              title="Technical questions"
              questions={interview.technicalQuestions ?? []}
            />
            <QuestionList
              title="Core subject questions"
              questions={interview.coreSubjectQuestions ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
