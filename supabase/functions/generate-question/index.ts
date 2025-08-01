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

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const context = previousResponses.length > 0 
      ? `Previous responses: ${previousResponses.join("; ")}`
      : "This is the first question.";

    const prompt = `You are conducting a personality assessment to match someone with a historical figure.

Generate question ${questionNumber} of 5.

MANDATORY CATEGORY ROTATION (use the category that matches your question number):
Question 1: Hypothetical Scenarios & Ethical Dilemmas - Present a high-stakes situation with 3 distinct approaches
Question 2: Inner Desires & Motivations - Reveal what they truly want from life or how they spend personal time
Question 3: Personal Values & Beliefs - Uncover core principles when values conflict
Question 4: Reactions to Adversity & Failure - Test resilience and how they handle setbacks
Question 5: Relationships & Social Dynamics - Explore how they interact with others and build teams

QUESTION STRUCTURE:
- Present the scenario/situation in 15-25 words
- Provide 5 distinct response options (A, B, C, D, E)
- Each option reveals different leadership archetypes
- No obviously "right" or "wrong" answers
- All options should be reasonable approaches

REVEAL DIFFERENT PATTERNS:
- Decision-making under pressure vs careful planning
- Individual action vs collaborative approaches  
- Pragmatic vs idealistic worldviews
- Short-term crisis management vs long-term vision
- Mercy vs justice orientations
- Risk-taking vs cautious approaches

Format as JSON:
{
  "title": "Scenario Type",
  "question": "Brief scenario description",
  "options": {
    "A": "First approach option",
    "B": "Second approach option", 
    "C": "Third approach option",
    "D": "Fourth approach option",
    "E": "Fifth approach option"
  },
  "placeholder": "Select your instinct..."
}

Create scenarios that differentiate between historical leadership styles and personality types.

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

    return new Response(JSON.stringify(questionData), {
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