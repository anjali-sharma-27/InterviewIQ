import { createInterview } from "@/api/mockinterview.api";
import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ExperienceLevel } from "@/vite-env";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { isAxiosError } from "axios";
import { X } from "lucide-react";

export interface FormInitialValues {
  jobProfile?: string;
  experienceLevel?: ExperienceLevel;
  tags?: string[];
  targetCompany?: string;
}

interface FormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  initialValues?: FormInitialValues;
}

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30";

const Form = ({ onSuccess, onClose, initialValues }: FormProps) => {
  const { addNotification } = useNotification();
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobProfile, setJobProfile] = useState(initialValues?.jobProfile ?? "");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialValues?.experienceLevel ?? "Fresher"
  );
  const [targetCompany, setTargetCompany] = useState(
    initialValues?.targetCompany ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialValues) return;
    setJobProfile(initialValues.jobProfile ?? "");
    setExperienceLevel(initialValues.experienceLevel ?? "Fresher");
    setTags(initialValues.tags ?? []);
    setTargetCompany(initialValues.targetCompany ?? "");
  }, [initialValues]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      setTags([...tags, input.trim()]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      const poppedTag = newTags.pop();
      setTags(newTags);
      setInput(poppedTag || "");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const handleCreateInterview = async () => {
    if (submitting) return;

    if (jobProfile === "" || tags.length === 0 || targetCompany === "") {
      addNotification({
        id: Date.now().toString(),
        type: "warning",
        message: "Please fill all fields (press Enter to add each skill)",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createInterview({
        jobRole: jobProfile,
        experienceLevel,
        skills: tags,
        targetCompany,
        overallReview: "",
        overallRating: 0,
        dsaQuestions: [],
        technicalQuestions: [],
        coreSubjectQuestions: [],
      });
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Interview created successfully",
      });
      onClose?.();
      onSuccess?.();
    } catch (error) {
      let message = "Error creating interview";
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        if (typeof data?.message === "string") {
          message = data.message;
        } else if (error.response?.status === 401) {
          message = "Please sign in again";
        }
      }
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="rounded-t-2xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-center">
          <h2 className="text-xl font-semibold text-white">New mock interview</h2>
          <p className="mt-1 text-sm text-emerald-100/80">
            Gemini will generate questions from your profile
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Job profile
            </label>
            <input
              type="text"
              value={jobProfile}
              onChange={(e) => setJobProfile(e.target.value)}
              className={inputClass}
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Experience level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(e.target.value as ExperienceLevel)
              }
              className={inputClass}
            >
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Skills
            </label>
            <div className="flex min-h-[42px] flex-wrap gap-2 rounded-lg border border-zinc-700 bg-zinc-950 p-2">
              {tags.map((tag, index) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-emerald-400/80 hover:text-emerald-200"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-w-[80px] flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder={tags.length === 0 ? "Type skill, press Enter" : ""}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Target company
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className={inputClass}
              placeholder="e.g. Google, Amazon"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateInterview}
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create interview"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
