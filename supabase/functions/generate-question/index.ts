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
---
${context}
---
CRITICAL: Analyze the questions above and identify what topics, settings, and moral conflicts have already been used. Then deliberately create question ${questionNumber} of 7 that uses a COMPLETELY DIFFERENT scenario type.

LEADERSHIP DILEMMA TYPES (use one that matches your question number):
Question 1: Pragmatic effectiveness vs moral purity  
Question 2: Centralized control vs distributed power
Question 3: Rapid transformation vs gradual stability
Question 4: Popular approval vs unpopular necessity
Question 5: Cultural preservation vs cultural integration  
Question 6: Personal relationships vs institutional loyalty
Question 7: Risk everything for greatness vs secure steady progress

SCENARIO REQUIREMENTS:
- Present a leadership/influence decision that reveals governing philosophy
- Both choices represent different but valid approaches to power and responsibility
- Shows whether they prioritize results vs methods, control vs freedom, legacy vs immediate needs
- Must reveal their instinct about human nature, change, and authority
- Different setting/context than ALL previous questions
- 30-40 words maximum

DECISION ARCHETYPES TO REVEAL:
- The unifier vs the conqueror mentality
- The pragmatist vs the idealist approach  
- The centralizer vs the liberator instinct
- The reformer vs the traditionalist tendency
- The diplomat vs the warrior response

AVOID OBVIOUS MORAL CHOICES:
Create dilemmas between two legitimate leadership philosophies, not right vs wrong.

EXPLICIT AVOIDANCE:
Based on context, use completely different settings and character dynamics.

Format as JSON:
{
  "title": "Leadership Philosophy",
  "question": "Power/influence dilemma ending with 'What's your approach?'",
  "placeholder": "I would..."
}

Create scenarios that would differentiate between great historical leadership styles.

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