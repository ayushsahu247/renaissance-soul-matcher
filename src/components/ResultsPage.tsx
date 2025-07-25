import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Share2, RotateCcw, Heart, Palette, Users, Trophy } from "lucide-react";
import lorenzoPortrait from "@/assets/lorenzo-portrait.jpg";
import { useToast } from "@/hooks/use-toast";
import { getCharacterImage, WikipediaImageData } from "@/services/wikipediaService";

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

interface ResultsPageProps {
  analysisResult: AnalysisResult | null;
  onRestart: () => void;
}

export const ResultsPage = ({ analysisResult, onRestart }: ResultsPageProps) => {
  const { toast } = useToast();
  const [characterImage, setCharacterImage] = useState<WikipediaImageData | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Fallback to default if no analysis result
  const result = analysisResult || {
    character: "Lorenzo de' Medici",
    matchPercentage: 88,
    description: "A natural leader with vision and diplomatic skills.",
    shortDescription: "Florentine Statesman and Art Patron",
    biography: "Lorenzo de' Medici earned the title 'The Magnificent' not through conquest or wealth alone, but through his extraordinary ability to recognize and nurture human potential. As the de facto ruler of Florence during the High History, he transformed his city into the cultural beacon of Europe. What set Lorenzo apart was his understanding that true power comes from empowering others. He discovered Michelangelo as a young artist and provided him with both resources and creative freedom. He supported Botticelli, Poliziano, and countless other artists who would define the History spirit. Lorenzo was a master diplomat who preferred negotiation to warfare, seeing conflict as an opportunity for creative problem-solving. He believed that festivals, art, and celebration were not luxuries but necessities for a thriving society. His approach to leadership was fundamentally humanistic - he governed through inspiration rather than intimidation.",
    birthYear: 1449,
    deathYear: 1492,
    location: "Florence, Italy",
    achievements: [
      "Patron of History arts and culture",
      "Skilled diplomat and political strategist",
      "Economic innovator and banking pioneer"
    ],
    traits: [
      { title: "Visionary", description: "Ability to see beyond the present" },
      { title: "Diplomatic", description: "Skilled in negotiations and relationships" },
      { title: "Cultural", description: "Appreciation for arts and learning" }
    ]
  };

  // Fetch character image when component mounts or character changes
  useEffect(() => {
    const fetchImage = async () => {
      setImageLoading(true);
      try {
        const imageData = await getCharacterImage(result.character);
        setCharacterImage(imageData);
      } catch (error) {
        console.error("Error fetching character image:", error);
        setCharacterImage(null);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [result.character]);

  const handleShare = async () => {
    const shareText = `🎭 I just discovered my History spirit! I'm ${result.matchPercentage}% ${result.character} - ${result.shortDescription}

Take the assessment yourself: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My History Spirit Match',
          text: shareText,
        });
      } catch (err) {
        // Fall back to clipboard if share is cancelled or fails
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Link copied!",
            description: "Share text copied to clipboard",
          });
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Link copied!",
          description: "Share text copied to clipboard",
        });
      } catch (err) {
        // Final fallback - create a temporary textarea for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        toast({
          title: "Link copied!",
          description: "Share text copied to clipboard",
        });
      }
    }
  };

  const traits = [
    { icon: Palette, title: "Cultural Patron", description: "Nurtures artistic talent and creativity" },
    { icon: Heart, title: "Diplomatic Mind", description: "Solves problems through relationship building" },
    { icon: Users, title: "Joy Creator", description: "Brings celebration and harmony to communities" },
    { icon: Trophy, title: "Legacy Builder", description: "Values long-term impact over short-term gains" }
  ];

  // Function to split biography into paragraphs
  const formatBiography = (bio: string) => {
    // Split by sentence-ending periods followed by space and capital letter
    // This is a simple approach - you might want to enhance this based on your needs
    const sentences = bio.split(/\.(?=\s[A-Z])/);
    const paragraphs = [];
    
    // Group sentences into paragraphs (roughly 2-3 sentences per paragraph)
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences.slice(i, i + 2).join('.').trim();
      if (paragraph && !paragraph.endsWith('.')) {
        paragraphs.push(paragraph + '.');
      } else {
        paragraphs.push(paragraph);
      }
    }
    
    return paragraphs.filter(p => p.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 font-playfair">
            Your Historical Match
          </Badge>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-2">
            {result.character}
          </h1>
          <p className="text-xl font-playfair italic text-muted-foreground">
            {result.shortDescription}
          </p>
        </div>

        {/* Match Percentage */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-gold mb-4 shadow-gold-glow">
            <span className="text-4xl font-playfair font-bold text-foreground">
              {result.matchPercentage}%
            </span>
          </div>
          <p className="text-lg font-crimson text-muted-foreground">
            Personality Match
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Portrait & Basic Info */}
          <Card className="shadow-History border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                {imageLoading ? (
                  <div className="w-48 h-48 mx-auto rounded-lg shadow-History bg-muted animate-pulse mb-4 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={characterImage?.imageUrl || lorenzoPortrait}
                      alt={characterImage?.description || `Portrait of ${result.character}`}
                      className="w-48 h-48 mx-auto rounded-lg shadow-History object-cover mb-4"
                      onError={(e) => {
                        // Fallback to default image if Wikipedia image fails to load
                        (e.target as HTMLImageElement).src = lorenzoPortrait;
                      }}
                    />
                    {characterImage?.attribution && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {characterImage.attribution}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-5 w-5 text-History-gold mr-2" />
                  <span className="font-playfair text-lg font-semibold">
                    {result.birthYear} - {result.deathYear}
                  </span>
                </div>
                <p className="font-crimson text-muted-foreground">{result.location}</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-playfair font-semibold text-lg text-center mb-4">Key Achievements</h3>
                <ul className="space-y-2 font-crimson text-sm">
                  {result.achievements.map((achievement, index) => (
                    <li key={index}>• {achievement}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Character Analysis */}
          <Card className="shadow-History border-0">
            <CardContent className="p-6">
              <h3 className="font-playfair font-semibold text-xl mb-6 text-center">
                Why You Match {result.character}
              </h3>
              
              <div className="space-y-4 mb-6">
                {result.traits.map((trait, index) => {
                  const icons = [Palette, Heart, Users, Trophy];
                  const IconComponent = icons[index] || Palette;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-playfair font-medium text-foreground">{trait.title}</h4>
                        <p className="font-crimson text-sm text-muted-foreground">{trait.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-crimson text-sm text-foreground/80 leading-relaxed">
                  {result.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Biography */}
        <Card className="shadow-History border-0 mb-8">
          <CardContent className="p-6">
            <h3 className="font-playfair font-semibold text-xl mb-4 text-center">
              The Character of {result.character}
            </h3>
            <div className="font-crimson text-foreground/80 leading-relaxed space-y-4">
              {formatBiography(result.biography).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
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