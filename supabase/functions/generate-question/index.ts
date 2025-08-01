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
CRITICAL: Analyze the questions and responses above and identify what topics, settings, and moral conflicts have already been used. Then deliberately create question ${questionNumber} of 7 that uses a COMPLETELY DIFFERENT scenario type.

MANDATORY TOPIC ROTATION (use the one that matches your question number):
Question 1: Loyalty to person vs loyalty to principle
Question 2: Security/stability vs freedom/risk
Question 3: Individual needs vs collective needs
Question 4: Immediate benefit vs long-term consequences
Question 5: Justice vs mercy
Question 6: Truth vs harmony
Question 7: Tradition vs progress

SCENARIO REQUIREMENTS:
- Create a realistic situation with TWO EQUALLY VALID moral positions
- Both choices must be genuinely defensible and reasonable
- No "obviously right" vs "obviously selfish" options
- Forces them to reveal which deeply-held value takes priority
- Must use DIFFERENT setting, characters, and stakes than ALL previous questions
- 25-35 words maximum

REVELATION TARGETS:
What's their instinctive hierarchy when two legitimate values conflict? Do they lean toward security or freedom? Individual or collective? Justice or compassion?

AVOID "MORAL TRAP" QUESTIONS:
- No individual ambition vs team success (team success seems "right")
- No personal gain vs helping others (helping seems "right") 
- No breaking rules vs following them (following seems "right")
- Create conflicts between two positive values, not good vs selfish

EXPLICIT AVOIDANCE:
Based on the context above, do NOT repeat any similar:
- Settings, character types, or moral conflict structures

Format as JSON:
{
  "title": "Core Conflict Type",
  "question": "Balanced dilemma with two legitimate choices ending with 'What do you do?'",
  "placeholder": "I would..."
}

Generate something with no obvious "correct" answer.

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