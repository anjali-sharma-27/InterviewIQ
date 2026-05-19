import React from "react";
import Rating from "./Rating";
import { Interview } from "../types/global";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { FormInitialValues } from "@/components/Form";

interface InterviewCardProps {
  interview: Interview;
  onRetake?: (preset: FormInitialValues) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onRetake }) => {
  const navigate = useNavigate();
  const isIncomplete = interview.overallRating === 0;

  const handleRetakeSetup = () => {
    onRetake?.({
      jobProfile: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      targetCompany: interview.targetCompany,
      tags: interview.skills || [],
    });
  };

  return (
    <Card className="group overflow-hidden border-zinc-800 bg-zinc-900/80 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="relative h-40 overflow-hidden">
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src="/interview1.png"
          alt={`${interview.jobRole} interview`}
        />
        {isIncomplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
            <p className="mb-3 text-sm font-medium text-white">
              Interview not completed
            </p>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => navigate(`/interviewinterface/${interview._id}`)}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Start interview
            </Button>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
          {interview.targetCompany}
        </p>
        <h3 className="text-xl font-semibold text-white">{interview.jobRole}</h3>
        <p className="line-clamp-2 text-sm text-zinc-400">
          {interview.overallReview || "Complete this session to receive AI feedback."}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <Rating
          experienceLevel={interview.experienceLevel}
          rating={interview.overallRating}
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-zinc-700 bg-transparent hover:bg-zinc-800"
            onClick={() => navigate(`/interviewdetails/${interview._id}`)}
          >
            Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {onRetake && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              onClick={handleRetakeSetup}
            >
              Retake
            </Button>
          )}
          <Button
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => navigate(`/interviewinterface/${interview._id}`)}
          >
            {isIncomplete ? "Continue" : "Retake"}
          </Button>
        </div>
        {!isIncomplete && (
          <Button
            variant="ghost"
            className="w-full border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={() => navigate(`/interview/${interview._id}/review`)}
          >
            View Feedback
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
