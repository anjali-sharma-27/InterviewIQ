import { editInterview, getInterviewByID } from "@/api/mockinterview.api";
import InterviewInterface from "@/components/InterviewInterface";
import Loader from "@/components/Loader/Loader";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { MockInterview, Notification } from "@/vite-env";
import { useNavigate, useParams } from "react-router-dom";
import { generateQuestions } from "@/api/gemini.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InterviewInstructions from "@/components/InterviewInterface/InterviewInstructionsComponent";

const InterviewInterfacePage = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [interviewData, setInterviewData] = useState<MockInterview>();
  const [isFullScreen, setIsFullScreen] = useState<boolean>(
    !!document.fullscreenElement
  );

  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const hasStartedRef = useRef(false);

  const interviewHasQuestions = (interview: MockInterview) => {
    const total =
      (interview.dsaQuestions?.length ?? 0) +
      (interview.technicalQuestions?.length ?? 0) +
      (interview.coreSubjectQuestions?.length ?? 0);
    return total > 0;
  };

  useEffect(() => {
    if (hasStartedRef.current || !id) return;
    hasStartedRef.current = true;

    const startInterview = async () => {
      try {
        const interviewData = await getInterviewByID(id);

        let dsaQuestions = interviewData.dsaQuestions ?? [];
        let coreSubjectQuestions = interviewData.coreSubjectQuestions ?? [];
        let technicalQuestions = interviewData.technicalQuestions ?? [];

        if (!interviewHasQuestions(interviewData)) {
          const response = await generateQuestions({ interviewID: id });
          const generated = response.data;
          dsaQuestions = generated.dsaQuestions ?? [];
          coreSubjectQuestions = generated.coreSubjectQuestions ?? [];
          technicalQuestions = generated.techStackQuestions ?? [];
        }

        interviewData.dsaQuestions = dsaQuestions;
        interviewData.coreSubjectQuestions = coreSubjectQuestions;
        interviewData.technicalQuestions = technicalQuestions;
        interviewData.overallRating = interviewData.overallRating ?? 0;
        interviewData.overallReview = interviewData.overallReview ?? "";

        const editedInterview = await editInterview(id, interviewData);
        setInterviewData(editedInterview);
        enterFullScreen();
        setLoading(false);
      } catch (error: unknown) {
        console.error(error);
        const apiMessage =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { error?: string } } })
            .response?.data?.error === "string"
            ? (error as { response: { data: { error: string } } }).response.data
                .error
            : null;
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "error",
          message:
            apiMessage ||
            "Could not start the interview. Check your connection and Gemini API settings on the server.",
        };
        addNotification(newNotification);
        setLoading(false);
        navigate("/dashboard");
      }
    };
    startInterview();
  }, [addNotification, id, navigate]);
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const handleStartInterview = () => {
    enterFullScreen();
    setIsInterviewStarted(true);
  };

  // useScreenMonitor();

  if (loading) return <Loader />;

  if (!isInterviewStarted)
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <InterviewInstructions onStartInterview={handleStartInterview} />
      </div>
    );

  return (

    <div>
      {!isFullScreen && (
        <div className="h-screen w-screen fixed top-0 z-50 flex justify-center items-center bg-black">
          <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[150px]">
            <h2 className="text-xl font-semibold text-white mb-4">
              You must enter fullscreen mode to proceed with the interview.
            </h2>
            <div className="w-full flex items-center justify-center">
              <Button
                onClick={enterFullScreen}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Enter FullScreen
              </Button>
            </div>
          </Card>
        </div>
      )}
      {!loading && interviewData && (
        <InterviewInterface interviewDetails={interviewData} />
      )}
    </div>
  );
};

export default InterviewInterfacePage;
