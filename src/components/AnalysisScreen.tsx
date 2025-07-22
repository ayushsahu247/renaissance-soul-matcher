import { useEffect, useState } from "react";
import { Loader2, Crown, Palette, Book } from "lucide-react";
import { generatePersonalityAnalysis } from "@/services/geminiService";

interface AnalysisResult {
  character: string;
  matchPercentage: number;
  description: string;
  achievements: string[];
  traits: Array<{ title: string; description: string }>;
}

interface AnalysisScreenProps {
  responses: string[];
  onComplete: (result: AnalysisResult) => void;
}

const analysisMessages = [
  { icon: Book, text: "Analyzing your character traits..." },
  { icon: Crown, text: "Comparing with Renaissance leaders..." },
  { icon: Palette, text: "Evaluating your cultural affinity..." },
  { icon: Crown, text: "Examining your leadership style..." },
  { icon: Book, text: "Studying your values and principles..." },
  { icon: Palette, text: "Calculating historical compatibility..." },
  { icon: Crown, text: "Finalizing your Renaissance match..." }
];

export const AnalysisScreen = ({ responses, onComplete }: AnalysisScreenProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const runAnalysis = async () => {
      const totalDuration = 4000;
      const messageInterval = totalDuration / analysisMessages.length;
      
      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, totalDuration / 50);

      // Message cycling
      const messageTimer = setInterval(() => {
        setCurrentMessage(prev => {
          if (prev >= analysisMessages.length - 1) {
            clearInterval(messageTimer);
            return prev;
          }
          return prev + 1;
        });
      }, messageInterval);

      try {
        // Generate analysis while showing progress
        const result = await generatePersonalityAnalysis(responses);
        
        // Wait for animation to complete
        setTimeout(() => {
          clearInterval(progressInterval);
          clearInterval(messageTimer);
          onComplete(result);
        }, totalDuration + 500);
      } catch (error) {
        console.error("Analysis error:", error);
        setTimeout(() => {
          clearInterval(progressInterval);
          clearInterval(messageTimer);
          onComplete({
            character: "Lorenzo de' Medici",
            matchPercentage: 88,
            description: "A natural leader with vision and diplomatic skills.",
            achievements: [
              "Patron of Renaissance arts and culture",
              "Skilled diplomat and political strategist",
              "Economic innovator and banking pioneer"
            ],
            traits: [
              { title: "Visionary", description: "Ability to see beyond the present" },
              { title: "Diplomatic", description: "Skilled in negotiations and relationships" },
              { title: "Cultural", description: "Appreciation for arts and learning" }
            ]
          });
        }, totalDuration + 500);
      }
    };

    runAnalysis();
  }, [responses, onComplete]);

  const CurrentIcon = analysisMessages[currentMessage].icon;

  return (
    <div className="min-h-screen bg-gradient-elegant flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CurrentIcon className="h-12 w-12 text-renaissance-burgundy" />
            </div>
          </div>
          <Loader2 className="h-6 w-6 mx-auto text-renaissance-gold animate-spin" />
        </div>

        {/* Current Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Discovering Your Renaissance Spirit
          </h2>
          <p 
            key={currentMessage}
            className="text-lg font-crimson text-muted-foreground animate-fade-in"
          >
            {analysisMessages[currentMessage].text}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-gold transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-crimson text-muted-foreground mt-2">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-sm font-crimson text-muted-foreground/70 mt-8">
          Matching you with historical figures from the Italian Renaissance...
        </p>
      </div>
    </div>
  );
};