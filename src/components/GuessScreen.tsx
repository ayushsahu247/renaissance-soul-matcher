import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Crown, ChevronLeft } from "lucide-react";

interface GuessScreenProps {
  onComplete: (guesses: string[]) => void;
  onBack: () => void;
}

const historicalFigures = [
  "Napoleon Bonaparte",
  "Cleopatra VII", 
  "Leonardo da Vinci",
  "Albert Einstein",
  "Winston Churchill",
  "Joan of Arc",
  "Julius Caesar",
  "Marie Curie",
  "Alexander the Great",
  "Gandhi",
  "Elizabeth I",
  "Benjamin Franklin",
  "Theodore Roosevelt",
  "Catherine the Great",
  "Abraham Lincoln",
  "Mozart",
  "Shakespeare",
  "Confucius",
  "Genghis Khan",
  "Hannibal"
];

export const GuessScreen = ({ onComplete, onBack }: GuessScreenProps) => {
  const [selectedGuesses, setSelectedGuesses] = useState<string[]>([]);

  const handleFigureClick = (figure: string) => {
    if (selectedGuesses.includes(figure)) {
      setSelectedGuesses(selectedGuesses.filter(f => f !== figure));
    } else if (selectedGuesses.length < 3) {
      setSelectedGuesses([...selectedGuesses, figure]);
    }
  };

  const handleContinue = () => {
    onComplete(selectedGuesses);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
            <p className="text-xl font-crimson text-muted-foreground max-w-2xl mx-auto">
              Before we begin our thoughtful assessment, who do you believe embodies your spirit? 
              Select up to three historical figures that resonate with your character.
            </p>
          </div>

          {/* Selection Progress */}
          <div className="text-center mb-8">
            <p className="font-crimson text-foreground/70">
              Selected: {selectedGuesses.length} of 3
            </p>
            <div className="flex justify-center mt-2 space-x-1">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedGuesses.length >= num ? 'bg-History-gold' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Historical Figures Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {historicalFigures.map((figure) => {
              const isSelected = selectedGuesses.includes(figure);
              const selectionIndex = selectedGuesses.indexOf(figure);
              
              return (
                <Card
                  key={figure}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                    isSelected 
                      ? 'bg-History-gold/10 border-History-gold shadow-md' 
                      : 'hover:border-History-gold/50'
                  }`}
                  onClick={() => handleFigureClick(figure)}
                >
                  <CardContent className="p-4 text-center">
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-History-gold rounded-full flex items-center justify-center text-xs font-bold text-History-brown">
                        {selectionIndex + 1}
                      </div>
                    )}
                    <p className="font-crimson text-sm font-medium text-foreground">
                      {figure}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={selectedGuesses.length === 0}
              variant="History"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Continue to Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm font-crimson text-muted-foreground mt-4">
              {selectedGuesses.length === 0 
                ? "Select at least one figure to continue"
                : "Your intuition is noted. Let us discover the truth."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};