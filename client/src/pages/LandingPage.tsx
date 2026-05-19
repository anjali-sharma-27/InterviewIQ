import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Calendar,
  Mic,
  Monitor,
  ClipboardList,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  RefreshCw,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_SHORT } from "@/constants/brand";
import { useScrollToSectionOnLoad } from "@/utils/hooks/useScrollToSectionOnLoad";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useScrollToSectionOnLoad();

  const features = [
    {
      title: "AI-Powered Mock Interviews",
      description:
        "Real-world scenarios tailored to your role, stack, and experience level.",
      icon: Brain,
    },
    {
      title: "Flexible Practice",
      description:
        "Create interviews on demand and revisit sessions anytime from your dashboard.",
      icon: Calendar,
    },
    {
      title: "Browser Voice Input",
      description:
        "Answer with your microphone using Web Speech API—no paid STT required.",
      icon: Mic,
    },
    {
      title: "Screen Recording",
      description:
        "Record your session locally to review performance and body language.",
      icon: Monitor,
    },
    {
      title: "Structured Reviews",
      description:
        "Gemini evaluates each answer and produces an overall score and summary.",
      icon: ClipboardList,
    },
    {
      title: "Actionable Feedback",
      description:
        "Per-question reviews highlight strengths and gaps before the real interview.",
      icon: MessageSquare,
    },
  ];

  const stats = [
    { value: "500+", label: "Mock sessions completed" },
    { value: "50+", label: "Job roles supported" },
    { value: "3", label: "Question categories" },
    { value: "100%", label: "AI-powered feedback" },
  ];

  const careerStages = [
    {
      title: "Fresh graduates",
      description:
        "No experience? No problem. Practice role-specific questions and walk into your first interview with confidence.",
      icon: GraduationCap,
    },
    {
      title: "Career switchers",
      description:
        "Transitioning into tech? Prepare for the exact questions hiring managers ask in your target role.",
      icon: RefreshCw,
    },
    {
      title: "Experienced devs",
      description:
        "Targeting a top company? Sharpen your DSA, system design, and core subject answers with AI feedback.",
      icon: Target,
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create your profile",
      text: "Set role, experience, skills, and target company—or use a quick template.",
    },
    {
      step: "02",
      title: "Run the mock interview",
      text: "Voice answers, optional camera, code editor, and screen recording in one flow.",
    },
    {
      step: "03",
      title: "Review AI feedback",
      text: "See per-question scores, overall rating, and what to improve next time.",
    },
  ];

  const faqs = [
    {
      question: "Is InterviewIQ free to use?",
      answer:
        "Yes, InterviewIQ is completely free. Create an account and start practicing immediately.",
    },
    {
      question: "What tech stacks and roles are supported?",
      answer:
        "We support all major software roles including frontend, backend, full stack, data science, and more. You can enter any skills and job role when creating your session.",
    },
    {
      question: "How is the AI feedback generated?",
      answer:
        "Your answers are evaluated by Google Gemini, which scores each response and provides specific suggestions on what to improve before your real interview.",
    },
    {
      question: "Do I need a microphone?",
      answer:
        "A microphone is recommended for the best experience, but you can also type your answers manually. Voice input uses the browser's built-in Web Speech API — no extra setup needed.",
    },
    {
      question: "Is my interview data private?",
      answer:
        "Yes. Your sessions are private to your account and are never shared with anyone.",
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((current) => (current === index ? null : index));
  };

  return (
    <AppLayout variant="public">
      <section className="relative overflow-hidden px-4 pb-16 md:px-8">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300">
            {APP_SHORT}
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            mock interviews
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Get AI-powered feedback on your interview answers in under 5 minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-emerald-500 px-8 text-lg hover:bg-emerald-600"
              onClick={() =>
                navigate(isAuthenticated ? "/dashboard" : "/signup")
              }
            >
              {isAuthenticated ? "Go to dashboard" : "Practice your first interview free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </div>
        </div>
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 z-0 rounded-2xl border-2 border-emerald-500/40 animate-pulse"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-2 z-0 rounded-[1.125rem] border border-emerald-500/20 animate-ping opacity-60"
            />
            <span className="absolute left-4 top-4 z-10 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md ring-1 ring-emerald-400/50">
              Live demo
            </span>
            <img
              src="/interface.png"
              className="relative z-[1] rounded-2xl border border-zinc-800 shadow-2xl"
              alt={`${APP_NAME} interview interface`}
            />
          </div>
        </div>
      </section>

      <section
        aria-label="Platform statistics"
        className="border-y border-zinc-800 bg-zinc-900 py-12"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-emerald-500/60"
                  aria-hidden
                />
                <p className="text-3xl font-bold text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Built for every stage of your career
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {careerStages.map((stage) => (
              <Card
                key={stage.title}
                className="border-zinc-800 bg-zinc-900/80 text-white transition hover:border-emerald-500/30"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <stage.icon className="h-6 w-6 text-emerald-400" />
                    <CardTitle className="text-lg">{stage.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    {stage.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-28 border-t border-zinc-800 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Features
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
            Everything you need to simulate a technical interview—from voice to
            code to post-session review.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-zinc-800 bg-zinc-900/80 text-white transition hover:border-emerald-500/30"
              >
                <CardHeader>
                  <div className="p-3 rounded-xl bg-emerald-500/10 mb-4">
                    <feature.icon className="h-10 w-10 text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 border-t border-zinc-800 bg-zinc-900/30 py-20"
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            How it works
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center"
              >
                <span className="text-3xl font-bold text-emerald-500/80">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-28 border-t border-zinc-800 py-20"
      >
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/80">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-800/50"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Ready to practice?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-400">
            Join {APP_NAME} and turn every session into measurable progress.
          </p>
          <Button
            className="mt-8 bg-emerald-500 hover:bg-emerald-600"
            size="lg"
            onClick={() =>
              navigate(isAuthenticated ? "/dashboard" : "/signup")
            }
          >
            Start practicing
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default LandingPage;
