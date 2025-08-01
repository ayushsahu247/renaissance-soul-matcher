import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Crown, ChevronLeft } from "lucide-react";

interface GuessScreenProps {
  onComplete: (guesses: string[]) => void;
  onBack: () => void;
}

export const GuessScreen = ({ onComplete, onBack }: GuessScreenProps) => {
  const [guesses, setGuesses] = useState<string[]>(["", "", ""]);

  const handleInputChange = (index: number, value: string) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  const handleContinue = () => {
    const validGuesses = guesses.filter(guess => guess.trim() !== "");
    onComplete(validGuesses);
  };

  const filledGuesses = guesses.filter(guess => guess.trim() !== "").length;
  const hasAnyGuess = filledGuesses > 0;

  return (
    <div className="min-h-screen bg-gradient-elegant relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-History-gold mr-3" />
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary">
                Your Intuition
              </h1>
            </div>
            <p className="text-xl font-crimson text-muted-foreground max-w-xl mx-auto">
              Before we begin our thoughtful assessment, who do you believe embodies your spirit? 
              Write up to three historical figures that resonate with your character.
            </p>
          </div>

          {/* Input Fields */}
          <Card className="shadow-History border-0 mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                {guesses.map((guess, index) => (
                  <div key={index} className="space-y-2">
                    <Label 
                      htmlFor={`guess-${index}`} 
                      className="font-playfair font-medium text-foreground"
                    >
                      {index === 0 ? "First guess" : index === 1 ? "Second guess (optional)" : "Third guess (optional)"}
                    </Label>
                    <Input
                      id={`guess-${index}`}
                      value={guess}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder="e.g., Leonardo da Vinci"
                      className="font-crimson text-lg h-12 border-muted focus:border-History-gold"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm font-crimson text-muted-foreground">
                  {filledGuesses === 0 
                    ? "Enter at least one historical figure"
                    : `${filledGuesses} guess${filledGuesses !== 1 ? 'es' : ''} entered`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!hasAnyGuess}
              variant="History"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Continue to Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm font-crimson text-muted-foreground mt-4">
              {!hasAnyGuess 
                ? "Share your intuition to continue"
                : "Your intuition is noted. Let us discover the truth."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};