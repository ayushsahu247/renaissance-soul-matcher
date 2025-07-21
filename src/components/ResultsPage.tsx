import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Share2, RotateCcw, Heart, Palette, Users, Trophy } from "lucide-react";
import lorenzoPortrait from "@/assets/lorenzo-portrait.jpg";
import { useToast } from "@/hooks/use-toast";

interface ResultsPageProps {
  onRestart: () => void;
}

export const ResultsPage = ({ onRestart }: ResultsPageProps) => {
  const [matchPercentage] = useState(Math.floor(Math.random() * 8) + 85); // 85-92%
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `I just discovered my Renaissance spirit! I'm a ${matchPercentage}% match with Lorenzo de' Medici "The Magnificent" - the legendary patron of arts and Renaissance leader. Take the assessment: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Renaissance Spirit Match',
          text: shareText,
        });
      } catch (err) {
        // Fall back to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const traits = [
    { icon: Palette, title: "Cultural Patron", description: "Nurtures artistic talent and creativity" },
    { icon: Heart, title: "Diplomatic Mind", description: "Solves problems through relationship building" },
    { icon: Users, title: "Joy Creator", description: "Brings celebration and harmony to communities" },
    { icon: Trophy, title: "Legacy Builder", description: "Values long-term impact over short-term gains" }
  ];

  return (
    <div className="min-h-screen bg-gradient-elegant px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 font-playfair">
            Your Renaissance Match
          </Badge>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-2">
            Lorenzo de' Medici
          </h1>
          <p className="text-xl font-playfair italic text-muted-foreground">
            "The Magnificent"
          </p>
        </div>

        {/* Match Percentage */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-gold mb-4 shadow-gold-glow">
            <span className="text-4xl font-playfair font-bold text-foreground">
              {matchPercentage}%
            </span>
          </div>
          <p className="text-lg font-crimson text-muted-foreground">
            Personality Match
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Portrait & Basic Info */}
          <Card className="shadow-renaissance border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <img 
                  src={lorenzoPortrait}
                  alt="Lorenzo de' Medici portrait"
                  className="w-48 h-48 mx-auto rounded-lg shadow-renaissance object-cover mb-4"
                />
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-5 w-5 text-renaissance-gold mr-2" />
                  <span className="font-playfair text-lg font-semibold">1449 - 1492</span>
                </div>
                <p className="font-crimson text-muted-foreground">Florence, Italy</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-playfair font-semibold text-lg text-center mb-4">Key Achievements</h3>
                <ul className="space-y-2 font-crimson text-sm">
                  <li>• Patron of Michelangelo, Botticelli, and other Renaissance masters</li>
                  <li>• Transformed Florence into the cultural capital of Europe</li>
                  <li>• Maintained peace through diplomatic excellence</li>
                  <li>• Founded the Platonic Academy of Florence</li>
                  <li>• Wrote poetry and supported humanist philosophy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Character Analysis */}
          <Card className="shadow-renaissance border-0">
            <CardContent className="p-6">
              <h3 className="font-playfair font-semibold text-xl mb-6 text-center">
                Why You Match Lorenzo
              </h3>
              
              <div className="space-y-4 mb-6">
                {traits.map((trait, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                      <trait.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-medium text-foreground">{trait.title}</h4>
                      <p className="font-crimson text-sm text-muted-foreground">{trait.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-crimson text-sm text-foreground/80 leading-relaxed">
                  Like Lorenzo, you understand that true leadership comes from nurturing others and creating 
                  environments where creativity and human potential can flourish. You value diplomacy over 
                  conflict, relationships over transactions, and lasting impact over immediate gains.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biography */}
        <Card className="shadow-renaissance border-0 mb-8">
          <CardContent className="p-6">
            <h3 className="font-playfair font-semibold text-xl mb-4 text-center">
              The Character of Lorenzo "The Magnificent"
            </h3>
            <div className="font-crimson text-foreground/80 leading-relaxed space-y-4">
              <p>
                Lorenzo de' Medici earned the title "The Magnificent" not through conquest or wealth alone, 
                but through his extraordinary ability to recognize and nurture human potential. As the de facto 
                ruler of Florence during the High Renaissance, he transformed his city into the cultural 
                beacon of Europe.
              </p>
              <p>
                What set Lorenzo apart was his understanding that true power comes from empowering others. 
                He discovered Michelangelo as a young artist and provided him with both resources and creative 
                freedom. He supported Botticelli, Poliziano, and countless other artists who would define the 
                Renaissance spirit.
              </p>
              <p>
                Lorenzo was a master diplomat who preferred negotiation to warfare, seeing conflict as an 
                opportunity for creative problem-solving. He believed that festivals, art, and celebration 
                were not luxuries but necessities for a thriving society. His approach to leadership was 
                fundamentally humanistic - he governed through inspiration rather than intimidation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleShare}
            variant="gold"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Your Results
          </Button>
          <Button 
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
};