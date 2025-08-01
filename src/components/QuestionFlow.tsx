import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { generateNextQuestion } from "@/services/geminiService";

interface Question {
  id: number;
  title: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  placeholder: string;
}

interface QuestionFlowProps {
  onComplete: (responses: string[]) => void;
  onBack: () => void;
}

export const QuestionFlow = ({ onComplete, onBack }: QuestionFlowProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalQuestions = 5;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = responses[currentQuestionIndex]?.length > 0;

  useEffect(() => {
    loadQuestion();
  }, [currentQuestionIndex]);

  const loadQuestion = async () => {
    setIsLoading(true);
    try {
      const questionData = await generateNextQuestion(
        currentQuestionIndex + 1,
        responses.slice(0, currentQuestionIndex)
      );
      
      // Parse the questionData if it's a string
      const parsedData = typeof questionData === 'string' ? JSON.parse(questionData) : questionData;
      
      setCurrentQ({
        id: currentQuestionIndex + 1,
        title: parsedData.title || `Question ${currentQuestionIndex + 1}`,
        question: parsedData.question,
        options: parsedData.options || { A: "Option A", B: "Option B", C: "Option C" },
        placeholder: parsedData.placeholder || "Select your instinct..."
      });
    } catch (error) {
      console.error("Error loading question:", error);
      setCurrentQ({
        id: currentQuestionIndex + 1,
        title: `Question ${currentQuestionIndex + 1}`,
        question: "Tell me about yourself and what drives you.",
        options: { A: "I focus on my goals", B: "I help others succeed", C: "I seek new experiences" },
        placeholder: "Select your instinct..."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses.filter(response => response.trim() !== ""));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  if (isLoading || !currentQ) {
    return (
      <div className="min-h-screen bg-gradient-elegant px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-History border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-crimson">Generating your next question...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-crimson text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-crimson text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-History border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Question Header */}
            <div className="mb-6">
              <h3 className="text-sm font-playfair font-medium text-History-gold uppercase tracking-wider mb-2">
                {currentQ.title}
              </h3>
              <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-foreground leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Response Area */}
            <div className="mb-6">
              <RadioGroup
                value={responses[currentQuestionIndex] || ""}
                onValueChange={handleResponseChange}
                className="space-y-4"
              >
                {Object.entries(currentQ.options).map(([key, option]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border border-muted hover:border-History-gold transition-colors">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <Label htmlFor={key} className="flex-1 font-crimson text-base cursor-pointer leading-relaxed">
                      <span className="font-semibold text-History-gold mr-2">{key}.</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-4 font-crimson">
                {currentQ.placeholder}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                className="font-crimson"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentQuestionIndex === 0 ? "Back to Start" : "Previous"}
              </Button>

              <Button
                onClick={handleNext}
                variant="History"
                disabled={!canProceed}
                className="font-crimson"
              >
                {isLastQuestion ? "Complete Assessment" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom spacing for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
};