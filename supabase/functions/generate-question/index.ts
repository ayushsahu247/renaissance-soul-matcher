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

Generate question ${questionNumber} of 7. Create a COMPLETELY DIFFERENT type of question from any previous ones.

DIVERSE QUESTION TYPES (pick ONE that hasn't been used):
- Casual scenario: Everyday situation that reveals character
- Value hierarchy: "What matters most to you between..." (no explanations needed)
- Abstract preference: Personal ideals and lifestyle choices
- Social observation: "What do you think about..." (controversial but gently framed)
- Philosophical choice: Simple either/or with brief reasoning
- Personal instinct: "Your natural reaction when..."
- Legacy thinking: How you want to be remembered
- Change perspective: Your approach to tradition vs innovation

Create a question that:
- Feels like a relaxed conversation over coffee
- Tests core values and natural instincts
- Reveals leadership style, moral priorities, and worldview
- Shows their relationship with power, people, and principles
- Under 35 words total
- Sounds natural and conversational - avoid "explain your reasoning"
- Touches on meaningful topics without being preachy or academic
- Has NO obvious connection to specific historical figures
- Is completely different from previous questions in style and content

For sensitive topics (race, gender, politics), frame them naturally:
- "Do you think men and women naturally excel at different things?"
- "What's your honest take on whether all cultures are equally valuable?"
- Keep it conversational, not confrontational

Format as JSON:
{
  "title": "2-3 Word Title", 
  "question": "Natural, conversational question that reveals their character",
  "placeholder": "Start typing..."
}

Make it feel like an interesting person asking a thoughtful question, not a psychology test.

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