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

Generate question ${questionNumber} of 5 as an open-ended, subjective question that encourages detailed personal reflection.

CATEGORY FOR THIS QUESTION (use creative variety within the theme):
${questionNumber === 1 ? `ETHICAL DILEMMAS & MORAL CHOICES - Create reflective prompts about:
• How they handle difficult moral decisions
• Their approach to competing loyalties or duties
• Personal experiences with justice vs mercy
• Times they've faced ethical temptations
• Balancing individual rights vs collective good
• How they navigate truth vs diplomacy` : ''}${questionNumber === 2 ? `INNER DRIVES & LIFE PHILOSOPHY - Explore personal topics like:
• What truly motivates them during challenges
• Their relationship with power, recognition, or legacy
• How they personally define success and fulfillment
• Their approach to balance in life
• Personal values when no one is watching
• Their deepest fears or greatest aspirations` : ''}${questionNumber === 3 ? `CORE VALUES & BELIEF SYSTEMS - Investigate personal beliefs about:
• Their stance on tradition vs innovation
• Personal views on freedom vs order
• How they balance idealism with pragmatism
• Their spiritual or philosophical foundation
• Personal conflicts between loyalty and honesty
• Their views on fairness and merit` : ''}${questionNumber === 4 ? `ADVERSITY & RESILIENCE PATTERNS - Focus on personal experiences with:
• How they've handled major failures or setbacks
• Times they've faced betrayal or disappointment
• Personal experiences with loss of status or resources
• How they cope with criticism or opposition
• Times they've felt misunderstood or isolated
• Experiences starting over or rebuilding` : ''}${questionNumber === 5 ? `SOCIAL DYNAMICS & LEADERSHIP STYLE - Explore their approach to:
• How they build consensus in difficult situations
• Their style of managing difficult personalities
• Times they've chosen principles over popularity
• How they handle competition or rivalry
• Their approach to inspiring others during hardship
• Balancing openness with strategic thinking` : ''}

QUESTION GUIDELINES:
- Create thoughtful, reflective prompts that encourage storytelling
- Ask about personal experiences, beliefs, or approaches
- Frame scenarios that allow for nuanced, detailed responses
- Encourage examples from their own life or hypothetical situations
- Make questions that reveal personality patterns and values
- Use engaging, conversational language
- Questions should be 20-40 words

QUESTION FORMATS TO VARY:
- "Describe a time when..."
- "How do you typically handle..."
- "What's your approach to..."
- "Tell me about your experience with..."
- "When faced with [scenario], how do you..."
- "What drives you when..."

Format as JSON:
{
  "title": "Question Category",
  "question": "Open-ended reflective question that encourages detailed personal response",
  "placeholder": "Share your thoughts, experiences, and perspective..."
}

Create questions that differentiate between historical leadership styles and personality types through personal reflection.

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