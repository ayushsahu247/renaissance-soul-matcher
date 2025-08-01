import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { generateNextQuestion } from "@/services/geminiService";

interface Question {
  id: number;
  title: string;
  question: string;
  placeholder: string;
  options?: string[];
}

interface QuestionFlowProps {
  onComplete: (questions: string[], responses: string[]) => void;
  onBack: () => void;
}

export const QuestionFlow = ({ onComplete, onBack }: QuestionFlowProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const totalQuestions = 9;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = responses[currentQuestionIndex]?.trim().length > 10;

  useEffect(() => {
    loadQuestion();
  }, [currentQuestionIndex]);

  const loadQuestion = async () => {
    setIsLoading(true);
    setSelectedOption(null); // Reset selection for new question
    try {
      const questionData = await generateNextQuestion(
        currentQuestionIndex + 1,
        responses.slice(0, currentQuestionIndex)
      );
      
      console.log("Raw question data received:", questionData);
      
      // Store the question text
      const newQuestions = [...questions];
      newQuestions[currentQuestionIndex] = questionData.question;
      setQuestions(newQuestions);
      
      setCurrentQ({
        id: currentQuestionIndex + 1,
        title: `Question ${currentQuestionIndex + 1}`,
        question: questionData.question,
        placeholder: questionData.placeholder || "Select an option below or write your own...",
        options: questionData.options || []
      });
      
      console.log("Set currentQ with options:", questionData.options);
      console.log("Options length:", questionData.options?.length);
    } catch (error) {
      console.error("Error loading question:", error);
      const fallbackQuestion = "Tell me about yourself and what drives you.";
      
      // Store the fallback question
      const newQuestions = [...questions];
      newQuestions[currentQuestionIndex] = fallbackQuestion;
      setQuestions(newQuestions);
      
      setCurrentQ({
        id: currentQuestionIndex + 1,
        title: `Question ${currentQuestionIndex + 1}`,
        question: fallbackQuestion,
        placeholder: "Select an option below or write your own...",
        options: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number, optionText: string) => {
    setSelectedOption(optionIndex);
    handleResponseChange(optionText);
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
      const filteredResponses = responses.filter(response => response.trim() !== "");
      const correspondingQuestions = questions.slice(0, filteredResponses.length);
      onComplete(correspondingQuestions, filteredResponses);
    }
  };

  const handleSkip = () => {
    handleResponseChange("No clue");
    setTimeout(() => {
      handleNext();
    }, 0);
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
    <div className="min-h-screen bg-gradient-elegant px-4 py-2 sm:py-8">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Progress */}
        <div className="mb-4 sm:mb-6 flex-shrink-0">
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

        {/* Main Content Card - Mobile First */}
        <Card className="shadow-History border-0 bg-card/80 backdrop-blur-sm flex-1 flex flex-col min-h-0">
          <CardContent className="p-4 sm:p-6 flex flex-col h-full">
            {/* Question Header - Compact for mobile */}
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-playfair font-medium text-History-gold uppercase tracking-wider mb-1">
                {currentQ.title}
              </h3>
              <h2 className="text-lg sm:text-xl md:text-2xl font-playfair font-semibold text-foreground leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Text Input Area - Middle Position */}
            <div className="mb-4 flex-shrink-0">
              <Textarea
                value={responses[currentQuestionIndex] || ""}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="h-20 sm:h-24 font-crimson text-sm sm:text-base resize-none border-muted focus:border-History-gold"
              />
            </div>

            {/* Response Options - Mobile Optimized */}
            {currentQ.options && currentQ.options.length > 0 && (
              <div className="mb-0">
                <div className="space-y-2 h-full overflow-y-auto">
                  {currentQ.options.map((option, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all duration-200 min-h-[44px] ${
                        selectedOption === index 
                          ? 'bg-History-gold/10 border-History-gold shadow-md' 
                          : 'bg-background hover:bg-muted/50 border-muted'
                      }`}
                      onClick={() => handleOptionSelect(index, option)}
                    >
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                        <p className="text-sm sm:text-base font-crimson text-foreground leading-relaxed flex-1 pr-2">
                          {option}
                        </p>
                        {selectedOption === index && (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-History-gold flex-shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation - Right below options */}
            <div className="flex-shrink-0 mt-5">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePrevious}
                  variant="ghost"
                  size="sm"
                  className="font-crimson text-sm"
                >
                  <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {currentQuestionIndex === 0 ? "Back" : "Previous"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="sm"
                    className="font-crimson text-sm border-History-gold text-History-gold hover:bg-History-gold hover:text-foreground"
                  >
                    Skip
                  </Button>

                  <Button
                    onClick={handleNext}
                    variant="History"
                    size="sm"
                    disabled={!canProceed}
                    className="font-crimson text-sm"
                  >
                    {isLastQuestion ? "Complete" : "Next"}
                    <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};