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

CATEGORY FOR THIS QUESTION (use creative variety within the theme):
${questionNumber === 1 ? `ETHICAL DILEMMAS & MORAL CHOICES - Create scenarios involving:
• Leadership crises requiring difficult decisions
• Resource allocation under scarcity
• Competing loyalties or conflicting duties
• Justice vs mercy situations
• Individual rights vs collective good
• Power and corruption temptations
• Truth vs diplomacy dilemmas` : ''}${questionNumber === 2 ? `INNER DRIVES & LIFE PHILOSOPHY - Explore topics like:
• What motivates them in challenging times
• Their relationship with power, fame, or legacy
• How they define success and fulfillment
• Their approach to work-life balance
• What they do when no one is watching
• Their deepest fears or greatest aspirations
• How they want to be remembered` : ''}${questionNumber === 3 ? `CORE VALUES & BELIEF SYSTEMS - Investigate areas such as:
• Tradition vs innovation conflicts
• Individual freedom vs social order
• Idealism vs pragmatism in action
• Faith/spirituality vs rational thinking
• Loyalty vs honesty when they conflict
• Equality vs merit-based systems
• Risk vs security orientations` : ''}${questionNumber === 4 ? `ADVERSITY & RESILIENCE PATTERNS - Focus on scenarios like:
• Major failures or public embarrassments
• Betrayal by trusted allies or friends
• Financial ruin or loss of status
• Health crises or physical limitations
• Unexpected opposition or criticism
• Being misunderstood or isolated
• Having to start over from scratch` : ''}${questionNumber === 5 ? `SOCIAL DYNAMICS & LEADERSHIP STYLE - Consider situations involving:
• Building consensus among disagreeing parties
• Dealing with incompetent but loyal followers
• Managing talented but difficult personalities
• Choosing between popular and right decisions
• Handling competition and rivalry
• Inspiring others during dark times
• Balancing transparency with strategy` : ''}

CREATIVE GUIDELINES:
- Vary the setting: historical, modern, hypothetical, personal, professional
- Mix question formats: scenarios, preferences, reactions, choices
- Include emotional and intellectual challenges
- Range from intimate personal moments to grand public decisions
- Draw inspiration from real historical situations but make them relatable
- Ensure each option reflects distinctly different personality archetypes

REVEAL DIFFERENT PATTERNS:
- Intuitive vs analytical decision-making
- Collaborative vs independent approaches  
- Idealistic vs pragmatic worldviews
- Immediate action vs strategic patience
- Compassionate vs firm leadership styles
- Innovation vs tradition preferences

QUESTION MUST BE BETWEEN 20-30 WORDS.

Format as JSON:
{
  "title": "Scenario Type",
  "question": "Brief scenario description",
  "options": {
    "A": "First approach option",
    "B": "Second approach option", 
    "C": "Third approach option"
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