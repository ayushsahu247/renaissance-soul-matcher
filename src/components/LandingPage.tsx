import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Palette, Heart } from "lucide-react";
import florencessBg from "@/assets/florence-background.jpg";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-elegant relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${florencessBg})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-12 w-12 text-History-gold mr-3" />
              <h1 className="text-5xl md:text-7xl font-playfair font-bold text-primary">
                History
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-playfair italic text-muted-foreground">
              Soul Matcher
            </h2>
          </div>

          {/* Description */}
          <div className="mb-12 max-w-2xl mx-auto">
            <p className="text-xl font-crimson text-foreground/80 leading-relaxed mb-6">
              Discover the History spirit within you through an elegant personality assessment. 
              Journey through thoughtful questions that reveal which historical figure mirrors your character.
            </p>
            <p className="text-lg font-crimson text-muted-foreground">
              This prototype focuses on matching you with <span className="font-semibold text-History-burgundy">Lorenzo "The Magnificent" de' Medici</span>, 
              the legendary patron of arts and History leader.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <Palette className="h-8 w-8 text-History-gold mx-auto mb-3" />
              <h3 className="font-playfair font-semibold text-lg mb-2">Cultural Insight</h3>
              <p className="font-crimson text-sm text-muted-foreground">
                Explore your artistic and cultural affinities
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-History-gold mx-auto mb-3" />
              <h3 className="font-playfair font-semibold text-lg mb-2">Character Analysis</h3>
              <p className="font-crimson text-sm text-muted-foreground">
                Deep dive into your values and decision-making
              </p>
            </div>
            <div className="text-center">
              <Crown className="h-8 w-8 text-History-gold mx-auto mb-3" />
              <h3 className="font-playfair font-semibold text-lg mb-2">Historical Match</h3>
              <p className="font-crimson text-sm text-muted-foreground">
                Connect with History History and wisdom
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              onClick={onStart}
              variant="History" 
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Begin Your History Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm font-crimson text-muted-foreground">
              Takes 5-7 minutes • Thoughtful questions • Beautiful results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};