import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const prompt = `Based on these personality assessment responses, conduct a comprehensive psychological analysis to match this person with a historical figure.

Responses: ${responses.join("; ")}

COMPREHENSIVE ANALYSIS PROCESS:

1. DECISION-MAKING PATTERNS:
Analyze how they approach choices - Are they intuitive or calculated? Risk-taking or cautious? Do they seek input or decide independently?

2. CORE VALUE SYSTEM:
Identify their fundamental beliefs - Do they prioritize idealism or pragmatism? Justice or mercy? Individual rights or collective benefit?

3. LEADERSHIP INSTINCTS:
Determine their natural leadership style - Are they inspirational or systematic? Collaborative or authoritative? Do they embrace change or preserve tradition?

4. RELATIONSHIP WITH POWER:
Assess their power motivation - Do they seek power for service or achievement? Are they naturally ambitious or reluctant leaders? Do they operate transparently or strategically?

5. ADVERSITY RESPONSE:
Evaluate how they handle setbacks - Are they adaptive or persistent? Confrontational or diplomatic? Do they take accountability or blame external factors?

Based on this psychological profile, match them to a WIDELY RECOGNIZED historical figure that shares these core personality patterns and decision-making frameworks.

HISTORICAL FIGURES POOL: Napoleon Bonaparte, Cleopatra VII, Leonardo da Vinci, Albert Einstein, Winston Churchill, Genghis Khan, Alexander the Great, Julius Caesar, Mahatma Gandhi, Joan of Arc, Benjamin Franklin, Elizabeth I, Confucius, Abraham Lincoln, Theodore Roosevelt, Catherine the Great, Otto von Bismarck, Hannibal Barca, Wolfgang Mozart, William Shakespeare, Marie Curie, Marcus Aurelius, Nelson Mandela, etc.

REQUIREMENTS:
- Match based on deep psychological patterns, not superficial similarities
- Choose figures known globally across cultures and education systems
- Provide thorough analysis connecting their responses to historical behavior patterns
- Avoid regional or lesser-known historical figures


Do not default to Otto von Bismarck unless the responses specifically indicate 19th-century German political patterns.

Return analysis in JSON format:

{
 "character": "Historical Figure Name",
 "matchPercentage": 70-95,
 "description": "2-3 sentences explaining the psychological and behavioral connections",
 "shortDescription": "3-7 word concise character description",
 "biography": "3-4 paragraph biography focusing on personality traits and leadership patterns that match the analysis",
 "birthYear": 100,
 "deathYear": 200,
 "location": "City, Country",
 "achievements": ["3-4 key historical achievements"],
 "traits": [
   {"title": "Primary Trait", "description": "How this psychological trait manifests in both the person and historical figure"},
   {"title": "Secondary Trait", "description": "Another matching personality pattern"},
   {"title": "Third Trait", "description": "Additional character similarity"}
 ]
}

Only return the JSON, no other text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    const analysisResult = JSON.parse(jsonString);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error generating analysis:", error);
    return new Response(JSON.stringify({
      character: "Marcus Aurelius",
      matchPercentage: 88,
      description: "A thoughtful leader who balances wisdom with action, prioritizing long-term thinking and principled decision-making.",
      shortDescription: "Philosopher Emperor and Stoic Leader",
      biography: "Marcus Aurelius stood as one of history's most unique figures - a philosopher who wielded absolute power yet remained grounded in wisdom and humility. As Roman Emperor from 161 to 180 CE, he faced constant military campaigns, plague, and political challenges, yet never abandoned his commitment to Stoic philosophy and self-improvement. His personal journal, 'Meditations,' reveals a leader constantly examining his own actions and motivations, striving to serve the greater good rather than personal ambition. Marcus Aurelius believed that true leadership came from inner discipline and rational thinking, approaching each crisis with measured consideration rather than emotional reaction. He demonstrated that power could be wielded with wisdom, compassion, and an unwavering commitment to duty over personal desires.",
      birthYear: 121,
      deathYear: 180,
      location: "Rome, Roman Empire",
      achievements: [
        "Successfully defended Roman Empire during multiple military campaigns",
        "Authored 'Meditations', one of history's greatest philosophical works",
        "Maintained stability during plague and internal conflicts",
        "Exemplified philosopher-king ideal in actual governance"
      ],
      traits: [
        { title: "Reflective", description: "Both you and Marcus value deep thinking and self-examination before making decisions" },
        { title: "Duty-Bound", description: "Strong sense of responsibility and commitment to serving something greater than yourself" },
        { title: "Balanced", description: "Ability to combine practical action with philosophical wisdom and long-term perspective" }
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});