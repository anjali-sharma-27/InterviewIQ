"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWebSpeech } from "@/utils/hooks/useWebSpeech";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Camera,
  SquareMIcon as MicSquare,
  Power,
  Video,
  VideoOff,
} from "lucide-react";
import { Timer } from "./InterviewInterface/Timer";
import { ExitButton } from "./InterviewInterface/ExitButton";
import { ScreenRecorder } from "./InterviewInterface/ScreenRecorder";
import { useNavigate } from "react-router-dom";
import AudioVisualizer from "@/components/InterviewInterface/AudioVisualizer";
import { MockInterview, Question } from "@/vite-env";
import CodeEditor from "./CodeEdior/CodeEditor";
import Loader from "./Loader/Loader";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import { generateReview } from "@/api/gemini.api";

interface InterviewInterfaceProps {
  interviewDetails: MockInterview;
}

interface QuestionWithType extends Question {
  type: "coreSubjectQuestions" | "technicalQuestions" | "dsaQuestions";
}

const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  interviewDetails,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isInterviewStarted, setIsInterviewStarted] = useState(!false);
  const [showDialog, setShowDialog] = useState(!true);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [Questions, setQuestions] = useState<QuestionWithType[]>([]);
  const maxQuestions = Questions.length || 0;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCurrentAnswerSaved, setIsCurrentAnswerSaved] = useState(false);

  const [transcript, setTranscript] = useState(
    "Your spoken answer will appear here. Click Record to start."
  );

  const {
    isSupported: isSpeechSupported,
    partialTranscript,
    error: speechError,
    startRecognition,
    stopRecognition,
  } = useWebSpeech("en-US");

  const [codeResponse, setCodeResponse] = useState("");
  const [savedInterviewData, setSavedInterviewData] =
    useState<MockInterview>(interviewDetails);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  const handleSetNextQuestion = async () => {
    if (isCurrentAnswerSaved) {
      if (currentQuestion < maxQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        // console.log(interviewDetails);
        setTranscript("");
        setIsCurrentAnswerSaved(false);
      } else {
        // console.log(interviewDetails);
        try {
          setLoading(true);
          const generateReviewResponse = await generateReview({
            InterviewDetailsObject: savedInterviewData,
          });
          if (generateReviewResponse) {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error(error);
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: "error",
            message: "Failed to generate review",
          };
          addNotification(newNotification);
        }
      }
    } else {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: "Saved Current Response to move to next Question",
      };
      addNotification(newNotification);
    }
  };

  // const handleSetPreviousQuestion = () => {
  //   if (currentQuestion > 0) {
  //     setCurrentQuestion(currentQuestion - 1);
  //   }
  // };

  const handleRecording = () => {
    if (!isRecording) {
      if (!isSpeechSupported) {
        addNotification({
          id: Date.now().toString(),
          type: "warning",
          message:
            "Speech recognition is not supported in this browser. Use Chrome or Edge, or type your answer manually.",
        });
        return;
      }

      setIsCurrentAnswerSaved(false);
      setTranscript("");
      const started = startRecognition((finalText) => {
        setIsCurrentAnswerSaved(false);
        setTranscript((prev) => {
          const base =
            prev === "Your spoken answer will appear here. Click Record to start."
              ? ""
              : prev;
          return `${base} ${finalText}`.trim();
        });
      });

      if (started) setIsRecording(true);
    } else {
      setIsRecording(false);
      stopRecognition();
    }
  };

  useEffect(() => {
    return () => stopRecognition();
  }, [stopRecognition]);

  const handleEditorOpen = () => {
    setIsEditorOpen(!isEditorOpen);
  };

  useEffect(() => {
    const handleQuestions = async () => {
      const coreSubjectQuestions =
        interviewDetails.coreSubjectQuestions?.map((q) => ({
          ...q,
          type: "coreSubjectQuestions" as const,
        })) || [];

      const technicalQuestions =
        interviewDetails.technicalQuestions?.map((q) => ({
          ...q,
          type: "technicalQuestions" as const,
        })) || [];

      const dsaQuestions =
        interviewDetails.dsaQuestions?.map((q) => ({
          ...q,
          type: "dsaQuestions" as const,
        })) || [];

      const allQuestions: QuestionWithType[] = [
        ...technicalQuestions,
        ...coreSubjectQuestions,
        ...dsaQuestions,
      ];

      // console.log(allQuestions);
      setQuestions(allQuestions);
      setLoading(false);
    };

    handleQuestions();
  }, [interviewDetails]);

  const handleSaveResponse = () => {
    if (maxQuestions === 0 || !Questions[currentQuestion]) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message:
          "No questions available. Return to the dashboard and start a new interview.",
      });
      return;
    }

    const allResponse = `Text Response: ${transcript}\nCode Response: ${codeResponse}`;
    const currentQuestionObj = Questions[currentQuestion];
    const category = currentQuestionObj.type;

    if (category === "technicalQuestions") {
      const updatedTechnicalQuestions = (
        savedInterviewData as any
      ).technicalQuestions.map((q: Question) => {
        if (q.question === currentQuestionObj.question) {
          return { ...q, answer: allResponse };
        }
        return q;
      });

      setSavedInterviewData((prevDetails) => ({
        ...prevDetails,
        technicalQuestions: updatedTechnicalQuestions,
      }));
    } else if (category === "coreSubjectQuestions") {
      const updatedCoreSubjectQuestions = (
        savedInterviewData as any
      ).coreSubjectQuestions.map((q: Question) => {
        if (q.question === currentQuestionObj.question) {
          return { ...q, answer: allResponse };
        }
        return q;
      });

      setSavedInterviewData((prevDetails) => ({
        ...prevDetails,
        coreSubjectQuestions: updatedCoreSubjectQuestions,
      }));
    } else if (category === "dsaQuestions") {
      const updatedDsaQuestions = (savedInterviewData as any).dsaQuestions.map(
        (q: Question) => {
          if (q.question === currentQuestionObj.question) {
            return { ...q, answer: allResponse };
          }
          return q;
        }
      );

      setSavedInterviewData((prevDetails) => ({
        ...prevDetails,
        dsaQuestions: updatedDsaQuestions,
      }));
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "info",
      message: "Saved Successfully",
    };
    addNotification(newNotification);
    setIsCurrentAnswerSaved(true);
    // Optionally, you can add a notification or log to confirm the save
    // console.log(`Response saved for ${category}`);
    // console.log(savedInterviewData);
  };

  if (!isInterviewStarted)
    return (
      <div className="">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Interview</DialogTitle>
            </DialogHeader>
            <p>Do you want to start the interview?</p>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => navigate("/dashboard")}
              >
                No
              </Button>
              <Button
                onClick={() => {
                  console.log("Interview is started");
                  setIsInterviewStarted(true);
                  setShowDialog(false);
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (loading)
    return (
      <div className="">
        <Loader />
      </div>
    );
  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-zinc-800/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-[#4AE087] via-[#84B7D4] to-[#9D7AEA] bg-clip-text text-transparent">
            AI-Powered
          </span>
          <span className="text-white"> Mock Interview</span>
        </h1>
        <div className="flex items-center">
          <ScreenRecorder />
          <Button
            className="h-[35px] border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            onClick={handleEditorOpen}
          >{`${
            isEditorOpen ? "Close Code Editor" : "Open Code Editor"
          }`}</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Question and Response Area */}
        <div className="space-y-6">
          <Card className="p-6 bg-zinc-800/50 border-zinc-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Question {currentQuestion + 1} of {maxQuestions}
              {Questions[currentQuestion]?.type && (
                <span className="ml-2 text-sm font-normal text-emerald-400 capitalize">
                  · {Questions[currentQuestion].type.replace(/Questions$/, "")}
                </span>
              )}
            </h2>
            <p className="text-zinc-300">
              {Questions.length > 0
                ? Questions[currentQuestion]?.question
                : "No questions were generated. This usually means the Gemini API key or model is misconfigured on the server. Go back to the dashboard and try again after fixing server/.env."}
            </p>
            <div className="w-full mt-1 flex justify-end">
              {/* <Button
                onClick={handleSetPreviousQuestion}
                className={`mt-2 ${
                  currentQuestion === 0 ? "bg-gray-700" : "bg-blue-600"
                } hover:bg-blue-800`}
              >
                Previous
              </Button> */}
              <div className=" gap-2 ">
                <Button
                  onClick={handleSaveResponse}
                  className={`mt-2 ${isCurrentAnswerSaved ? "bg-amber-900" : "bg-amber-600"} mr-2`}
                >
                  {isCurrentAnswerSaved ? "Saved" : "Save Response"}
                </Button>
                <Button
                  onClick={handleSetNextQuestion}
                  className={`mt-2 ${
                    currentQuestion === maxQuestions - 1
                      ? "bg-gray-700"
                      : "bg-green-600"
                  } hover:bg-green-800`}
                >
                  {`${
                    currentQuestion === maxQuestions - 1 ? "Submit" : "Next"
                  }`}
                </Button>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[300px]">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Text Response
            </h2>
            <textarea
              value={transcript}
              onChange={(e) => {
                setIsCurrentAnswerSaved(false);
                setTranscript(e.target.value);
              }}
              placeholder="Type your answer or click Record to use voice input"
              className="w-full min-h-[200px] bg-zinc-900 text-zinc-200 p-3 border border-zinc-700 rounded-md resize-y"
            />
          </Card>
          <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[200px]">
            <h2 className="text-xl font-semibold text-white mb-4">
              Code Submission
            </h2>
            <div className="">
              <textarea
                value={codeResponse}
                onChange={(e) => {
                  setIsCurrentAnswerSaved(false);
                  setCodeResponse(e.target.value);
                }}
                placeholder="Type code here, or use Open Code Editor in the header for Monaco + run"
                className="w-full min-h-[120px] bg-zinc-800 text-white p-2 placeholder:text-zinc-500 placeholder:italic border border-zinc-700 rounded-md"
              />
            </div>
          </Card>
        </div>

        {/* Right Side - Camera and Controls */}
        <div className="space-y-4">
          <Card className="aspect-video relative bg-zinc-800/50 border-zinc-700 overflow-hidden">
            {isCameraOn && hasPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                {hasPermission === false ? (
                  <p className="text-red-500">Camera permission denied</p>
                ) : (
                  <Camera className="w-16 h-16 text-zinc-600" />
                )}
              </div>
            )}
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant={isCameraOn ? "default" : "destructive"}
              size="lg"
              onClick={toggleCamera}
              className="w-40"
            >
              {isCameraOn ? (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Camera On
                </>
              ) : (
                <>
                  <VideoOff className="mr-2 h-4 w-4" />
                  Camera Off
                </>
              )}
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={handleRecording}
              className={`w-40 ${
                !isRecording
                  ? "border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                  : ""
              }`}
            >
              {isRecording ? (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <MicSquare className="mr-2 h-4 w-4" />
                  Record
                </>
              )}
            </Button>
          </div>
          <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[70px]">
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
              Live transcript
            </p>
            <div className="text-zinc-400 italic min-h-[1.5rem]">
              {partialTranscript || (isRecording ? "Listening…" : "—")}
            </div>
            {speechError && (
              <p className="text-amber-400 text-sm mt-2">{speechError}</p>
            )}
            {!isSpeechSupported && (
              <p className="text-amber-400 text-sm mt-2">
                Browser speech recognition unavailable. Type or paste your answer
                manually.
              </p>
            )}
          </Card>
          <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[70px]">
            {isRecording && <AudioVisualizer />}
          </Card>
        </div>
      </div>
      <Timer />
      <ExitButton />
      {isEditorOpen && (
        <CodeEditor
          code={codeResponse}
          onChange={(value) => {
            setIsCurrentAnswerSaved(false);
            setCodeResponse(value);
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default InterviewInterface;
