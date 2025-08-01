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

    const prompt = `As a historian and clinical psychologist aged 25 years, You are conducting a personality assessment to match someone with a historical figure.

Generate question ${questionNumber} of 9.

QUESTION TYPE:
${questionNumber === 1 ? 'LIFE PHILOSOPHY - Reveal worldview (beauty vs utility, knowledge vs action, idealism vs realism, etc.)' : ''}
${questionNumber === 2 ? 'CREATIVE APPROACH - Show how they build/create (systematic vs inspired, solo vs collaborative, perfection vs iteration, etc.)' : ''}
${questionNumber === 3 ? 'PERSONAL FULFILLMENT - What drives satisfaction (achievement vs harmony, recognition vs impact, legacy vs present, etc.)' : ''}
${questionNumber === 4 ? 'PROBLEM SOLVING - Approach to challenges (analytical vs intuitive, patient vs urgent, direct vs indirect, etc.)' : ''}
${questionNumber === 5 ? 'HUMAN CONNECTION - How they relate to others (inspire vs serve, lead vs follow, trust vs verify, etc.)' : ''}
${questionNumber === 6 ? 'MORAL FRAMEWORK - Ethical decision-making (justice vs mercy, truth vs harmony, individual vs collective, etc.)' : ''}
${questionNumber === 7 ? 'RELATIONSHIP WITH POWER - Authority orientation (seek power vs influence, centralize vs delegate, command vs persuade, etc.)' : ''}
${questionNumber === 8 ? 'RISK & CHANGE TOLERANCE - Innovation approach (revolutionary vs evolutionary, disrupt vs preserve, bold vs cautious, etc.)' : ''}
${questionNumber === 9 ? 'HANDLING ADVERSITY - Response to setbacks (fight vs adapt, persist vs pivot, blame vs accountability, etc.)' : ''}

REQUIREMENTS:
- 15-25 words maximum
- Provocative and direct, slightly open-ended
- Present genuine tension between two valid approaches
- No obvious "right" answer
- End with "Your move?" or "Your instinct?" or "Your take?"

TONE: Make them choose a side and reveal their true nature.

Format as JSON:
{
  "title": "Core Dimension",
  "question": "Direct provocative question",
  "placeholder": "Your honest take..."
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