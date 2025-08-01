import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { QuestionFlow } from "@/components/QuestionFlow";
import { AnalysisScreen } from "@/components/AnalysisScreen";
import { ResultsPage } from "@/components/ResultsPage";
import { saveQuizResult } from "@/services/resultsService";

type AppState = "landing" | "questions" | "analysis" | "results";

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
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => {
    setCurrentState("questions");
  };

  const handleQuestionsComplete = (userQuestions: string[], userResponses: string[]) => {
    setQuestions(userQuestions);
    setResponses(userResponses);
    setCurrentState("analysis");
  };

  const handleAnalysisComplete = async (result: AnalysisResult) => {
    setAnalysisResult(result);
    
    // Save the quiz result to the database only if not already saved
    if (currentState === "analysis") {
      try {
        console.log('Saving quiz result to database...');
        await saveQuizResult(questions, responses, result.character);
        console.log('Quiz result saved successfully');
      } catch (error) {
        console.error('Failed to save quiz result:', error);
      }
    }
    
    setCurrentState("results");
  };

  const handleRestart = () => {
    setCurrentState("landing");
    setQuestions([]);
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
