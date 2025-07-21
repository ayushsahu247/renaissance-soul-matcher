import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { QuestionFlow } from "@/components/QuestionFlow";
import { AnalysisScreen } from "@/components/AnalysisScreen";
import { ResultsPage } from "@/components/ResultsPage";

type AppState = "landing" | "questions" | "analysis" | "results";

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [responses, setResponses] = useState<string[]>([]);

  const handleStart = () => {
    setCurrentState("questions");
  };

  const handleQuestionsComplete = (userResponses: string[]) => {
    setResponses(userResponses);
    setCurrentState("analysis");
  };

  const handleAnalysisComplete = () => {
    setCurrentState("results");
  };

  const handleRestart = () => {
    setCurrentState("landing");
    setResponses([]);
  };

  const handleBackToLanding = () => {
    setCurrentState("landing");
  };

  switch (currentState) {
    case "landing":
      return <LandingPage onStart={handleStart} />;
    case "questions":
      return (
        <QuestionFlow 
          onComplete={handleQuestionsComplete}
          onBack={handleBackToLanding}
        />
      );
    case "analysis":
      return <AnalysisScreen onComplete={handleAnalysisComplete} />;
    case "results":
      return <ResultsPage onRestart={handleRestart} />;
    default:
      return <LandingPage onStart={handleStart} />;
  }
};

export default Index;
