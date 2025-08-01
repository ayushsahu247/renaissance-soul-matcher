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

CRITICAL: Analyze the questions above and identify what topics, settings, and moral conflicts have already been used. Then deliberately create question ${questionNumber} of 7 that uses a COMPLETELY DIFFERENT scenario type.

LEADERSHIP PHILOSOPHY TYPES (use one that matches your question number):
Question 1: Pragmatic power vs moral idealism (Machiavellian ethics)
Question 2: Cultural unity vs cultural diversity (Role of tradition/identity)
Question 3: Religious/moral authority vs secular effectiveness (Faith vs pragmatism)  
Question 4: Meritocracy vs loyalty-based systems (Napoleonic organizational principles)
Question 5: Rapid systematic change vs organic evolution (Revolutionary vs gradual)
Question 6: Centralized vision vs decentralized autonomy (Control vs freedom)
Question 7: Personal honor vs strategic necessity (Individual integrity vs collective benefit)

SCENARIO REQUIREMENTS:
- Present situations involving cultural values, religious considerations, or strategic ethics
- Reveal their instinct about: tradition vs progress, ends vs means, merit vs loyalty
- Show whether they see culture/religion as tools for unity or sources of division
- Test their comfort with morally ambiguous but effective strategies
- Different setting/context than ALL previous questions
- 15-25 words maximum

AVOID OBVIOUS MORAL CHOICES:
Create conflicts between legitimate philosophical approaches to power, culture, and ethics.

EXPLICIT AVOIDANCE:
Based on context, use completely different settings and character dynamics.

Format as JSON:
{
  "title": "Core Philosophy",
  "question": "Cultural/ethical/strategic dilemma ending with 'Your approach?'",
  "placeholder": "I believe..."
}

Create scenarios that reveal deep philosophical differences about power, culture, and ethics.

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