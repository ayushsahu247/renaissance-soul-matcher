import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { QuestionFlow } from "@/components/QuestionFlow";
import { AnalysisScreen } from "@/components/AnalysisScreen";
import { ResultsPage } from "@/components/ResultsPage";

type AppState = "landing" | "questions" | "analysis" | "results";

interface AnalysisResult {
  character: string;
  matchPercentage: number;
  description: string;
  achievements: string[];
  traits: Array<{ title: string; description: string }>;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [responses, setResponses] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => {
    setCurrentState("questions");
  };

  const handleQuestionsComplete = (userResponses: string[]) => {
    setResponses(userResponses);
    setCurrentState("analysis");
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentState("results");
  };

  const handleRestart = () => {
    setCurrentState("landing");
    setResponses([]);
    setAnalysisResult(null);
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
      return <AnalysisScreen responses={responses} onComplete={handleAnalysisComplete} />;
    case "results":
      return <ResultsPage analysisResult={analysisResult} onRestart={handleRestart} />;
    default:
      return <LandingPage onStart={handleStart} />;
  }
};

export default Index;
