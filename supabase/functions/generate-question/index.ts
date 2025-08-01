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

Generate question ${questionNumber} of 5 as a focused, provocative question that reveals core beliefs and instincts.

CATEGORY FOR THIS QUESTION:
${questionNumber === 1 ? `ETHICAL DILEMMAS & MORAL CHOICES - Create pointed questions about moral instincts:
- Tough choices between competing loyalties
- When ends justify means vs when they don't
- Justice vs mercy in real situations
- Truth vs diplomacy trade-offs
- Individual rights vs collective good tensions` : ''}${questionNumber === 2 ? `INNER DRIVES & LIFE PHILOSOPHY - Probe what really motivates them:
- What they're willing to sacrifice for success
- How they handle power and recognition
- What drives them when things get tough
- Their honest relationship with ambition
- What they fear most about failure` : ''}${questionNumber === 3 ? `CORE VALUES & BELIEF SYSTEMS - Challenge their fundamental beliefs:
- Tradition vs innovation tensions
- Freedom vs order trade-offs
- Idealism vs pragmatism conflicts
- Merit vs loyalty decisions
- Fairness vs effectiveness choices` : ''}${questionNumber === 4 ? `ADVERSITY & RESILIENCE PATTERNS - Test their response to setbacks:
- How they handle betrayal or disappointment
- Their instinct when facing major failure
- Response to criticism and opposition
- What they do when isolated or misunderstood
- How they rebuild after losing everything` : ''}${questionNumber === 5 ? `SOCIAL DYNAMICS & LEADERSHIP STYLE - Reveal their social instincts:
- How they handle difficult personalities
- When they choose principles over popularity
- Their approach to competition and rivalry
- How they inspire others during crisis
- Balance between openness and strategy` : ''}

QUESTION STYLE:
- Make them take a stance or reveal their instincts
- Present scenarios with tension or conflict
- Ask "What's your honest take on..." or "How do you really handle..."
- Force them to choose between two valid but competing approaches
- Make it slightly uncomfortable - probe their real beliefs
- 15-30 words maximum
- End with "Your move?" or "What's your instinct?" or "Your honest take?"

PROVOCATIVE FORMATS:
- "What's your real opinion on..."
- "When push comes to shove, do you..."
- "Be honest - how do you actually handle..."
- "What's your gut reaction when..."
- "Which bothers you more..."

Format as JSON:
{
  "title": "Core Theme",
  "question": "Provocative question that forces them to reveal their true nature",
  "placeholder": "Your honest response..."
}

Make them think "Damn, that's a good question" and reveal something real about themselves.

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