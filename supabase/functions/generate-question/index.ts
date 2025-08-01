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

Generate question ${questionNumber} of 7. 

MANDATORY: Pick a random number between 1-8, then use the corresponding question type:
1. Casual scenario: Real-life situation (work, social, family)
2. Value ranking: Choose between 3-4 competing priorities 
3. Personal preference: Lifestyle, habits, or ideals
4. Social opinion: Gentle take on controversial topics
5. Either/or choice: Two valid but opposing approaches
6. Natural reaction: "When X happens, you usually..."
7. Legacy question: Impact or remembrance preferences
8. Change attitude: Traditional vs innovative approaches

VARIETY REQUIREMENTS:
- Question ${questionNumber} cannot repeat any format from previous questions
- Must use different sentence structure than previous questions
- Cannot start with "If you could..." or "What would you..."
- Must be under 30 words
- No explanations required - just natural response

CONVERSATION STYLE:
- Sound like a curious friend asking over coffee
- Avoid academic or test-like language
- Make it easy to answer naturally
- Touch meaningful topics without being heavy

SENSITIVE TOPICS (if chosen):
Frame naturally: "Do you think..." "What's your take on..." "How do you feel about..."

After generating the question, add "PROMPT WORKING" to the end.

Format as JSON:
{
  "title": "2-3 Word Title",
  "question": "Conversational question", 
  "placeholder": "Start typing..."
}

CRITICAL: Be creative and random. Avoid any similarity to previous questions.

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