import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: number;
  title: string;
  question: string;
  placeholder: string;
}

const questions: Question[] = [
  {
    id: 1,
    title: "Conflict Resolution",
    question: "Describe how you handle conflict and disagreements with others.",
    placeholder: "When faced with conflict, I tend to..."
  },
  {
    id: 2,
    title: "Arts & Creativity",
    question: "What role do arts, creativity, and beauty play in your life?",
    placeholder: "Art and creativity in my life are..."
  },
  {
    id: 3,
    title: "Building Relationships", 
    question: "How do you approach building and maintaining relationships?",
    placeholder: "In relationships, I believe in..."
  },
  {
    id: 4,
    title: "Leadership Style",
    question: "Describe your approach to leadership and influencing others.",
    placeholder: "My leadership style involves..."
  },
  {
    id: 5,
    title: "Values & Priorities",
    question: "What are your core values and how do they guide your decisions?",
    placeholder: "My core values include..."
  },
  {
    id: 6,
    title: "Legacy & Impact",
    question: "What kind of legacy or impact do you hope to leave behind?",
    placeholder: "I hope to be remembered for..."
  },
  {
    id: 7,
    title: "Joy & Celebration",
    question: "How do you create joy and celebration in your community or circle?",
    placeholder: "I bring joy to others by..."
  }
];

interface QuestionFlowProps {
  onComplete: (responses: string[]) => void;
  onBack: () => void;
}

export const QuestionFlow = ({ onComplete, onBack }: QuestionFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>(new Array(questions.length).fill(""));

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = responses[currentQuestion].trim().length > 10;

  return (
    <div className="min-h-screen bg-gradient-elegant px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-crimson text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-crimson text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-renaissance border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Question Header */}
            <div className="mb-6">
              <h3 className="text-sm font-playfair font-medium text-renaissance-gold uppercase tracking-wider mb-2">
                {currentQ.title}
              </h3>
              <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-foreground leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Response Area */}
            <div className="mb-6">
              <Textarea
                value={responses[currentQuestion]}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[150px] font-crimson text-base resize-none border-muted focus:border-renaissance-gold"
              />
              <p className="text-xs text-muted-foreground mt-2 font-crimson">
                Please write at least a few sentences to continue.
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
                {currentQuestion === 0 ? "Back to Start" : "Previous"}
              </Button>

              <Button
                onClick={handleNext}
                variant="renaissance"
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