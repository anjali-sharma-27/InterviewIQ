import { Sparkles } from "lucide-react";
import {
  interviewTemplates,
  type InterviewTemplate,
} from "@/data/interviewTemplates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InterviewTemplatesProps {
  onSelect: (template: InterviewTemplate) => void;
}

export default function InterviewTemplates({
  onSelect,
}: InterviewTemplatesProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">Quick start templates</h2>
      </div>
      <p className="mb-6 text-sm text-zinc-400">
        Pick a preset to pre-fill your interview — customize before creating.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {interviewTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="text-left"
          >
            <Card className="h-full border-zinc-800 bg-zinc-900/80 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500">
                  {template.jobRole} · {template.experienceLevel}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
