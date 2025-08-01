import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { GuessScreen } from "@/components/GuessScreen";
import { QuestionFlow } from "@/components/QuestionFlow";
import { AnalysisScreen } from "@/components/AnalysisScreen";
import { ResultsPage } from "@/components/ResultsPage";

type AppState = "landing" | "guess" | "questions" | "analysis" | "results";

interface AnalysisResult {
  character: string;
  matchPercentage: number;
  description: string;
  shortDescription: string;
  biography: string;
  birthYear: number;
  deathYear: number;
  location: string;
  achievements: string[];
  traits: Array<{ title: string; description: string }>;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [userGuesses, setUserGuesses] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => {
    setCurrentState("guess");
  };

  const handleGuessComplete = (guesses: string[]) => {
    setUserGuesses(guesses);
    setCurrentState("questions");
  };

  const handleBackToGuess = () => {
    setCurrentState("guess");
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
    setUserGuesses([]);
    setResponses([]);
    setAnalysisResult(null);
  };

  const handleBackToLanding = () => {
    setCurrentState("landing");
  };

  switch (currentState) {
    case "landing":
      return <LandingPage onStart={handleStart} />;
    case "guess":
      return (
        <GuessScreen 
          onComplete={handleGuessComplete}
          onBack={handleBackToLanding}
        />
      );
    case "questions":
      return (
        <QuestionFlow 
          onComplete={handleQuestionsComplete}
          onBack={handleBackToGuess}
        />
      );
    case "analysis":
      return <AnalysisScreen responses={responses} onComplete={handleAnalysisComplete} />;
    case "results":
      return <ResultsPage analysisResult={analysisResult} userGuesses={userGuesses} onRestart={handleRestart} />;
    default:
      return <LandingPage onStart={handleStart} />;
  }
};

export default Index;
