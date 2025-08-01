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
    const { questionNumber, previousResponses } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

    const context = previousResponses.length > 0 
      ? `Previous responses: ${previousResponses.join("; ")}`
      : "This is the first question.";

    const prompt = `You are conducting a personality assessment to match someone with a historical figure.

${context}

Analyze the previous questions to avoid repetition. Generate question ${questionNumber} of 7 that presents a MORAL DILEMMA or VALUE CONFLICT that forces them to reveal their true nature.

CREATE A DILEMMA THAT EXPOSES:
- Core values when they conflict with each other
- How they handle competing loyalties  
- Their instinctive moral compass under pressure
- What they're willing to sacrifice for what they believe in
- Their biases about power, fairness, loyalty, truth
- Whether they prioritize individuals vs groups
- How they balance pragmatism vs principles

DILEMMA TYPES (pick one that hasn't been used):
- Loyalty vs justice: Choose between protecting someone you care about vs doing what's right
- Security vs freedom: Safety for many vs liberty for individuals  
- Truth vs harmony: Speaking up vs keeping peace
- Personal gain vs greater good: Success for you vs benefit for others
- Tradition vs progress: Preserving what works vs embracing change
- Mercy vs justice: Forgiveness vs consequences
- Individual vs collective: Personal rights vs community needs

FORMAT: Present a realistic scenario where they must choose between two compelling but conflicting values. Make it:
- Specific and relatable (not abstract)
- No clear "right" answer
- Forces them to prioritize what matters most
- Under 30 words
- Ends with "What do you do?" or "What's your instinct?"

Format as JSON:
{
  "title": "2-3 Word Dilemma Type",
  "question": "Realistic moral dilemma that forces a revealing choice",
  "placeholder": "I would..."
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
          temperature: 0.9,
          topK: 40,
          topP: 0.95
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

    const questionData = JSON.parse(jsonString);

    return new Response(JSON.stringify({ question: questionData.question }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error generating question:", error);
    return new Response(JSON.stringify({ 
      question: "Tell me about a challenging situation you faced and how you handled it."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});