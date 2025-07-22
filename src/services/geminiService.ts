const GEMINI_API_KEY = "AIzaSyBqITkrtJSAVMhzEgFES5UZd0WtBlbdNP0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function generateNextQuestion(
  questionNumber: number,
  previousResponses: string[]
): Promise<string> {
  const context = previousResponses.length > 0 
    ? `Previous responses: ${previousResponses.join("; ")}`
    : "This is the first question.";

  const prompt = `You are conducting a personality assessment to match someone with a historical figure. 

${context}

Generate question ${questionNumber} of 7 for this personality assessment. The question should:
- Be thoughtful and psychological in nature
- Build upon previous responses to dig deeper into personality traits
- Be designed to reveal character traits that could match historical figures
- Be open-ended to allow detailed responses
- Include a brief title (2-4 words) and the main question

Format your response as JSON:
{
  "title": "Brief Title",
  "question": "Your detailed question here?",
  "placeholder": "Suggested response starter..."
}

Only return the JSON, no other text.`;

  try {
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response
    const questionData = JSON.parse(text);
    return questionData.question;
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback question
    return "Tell me about a challenging situation you faced and how you handled it.";
  }
}

export async function generatePersonalityAnalysis(responses: string[]): Promise<{
  character: string;
  matchPercentage: number;
  description: string;
  achievements: string[];
  traits: Array<{ title: string; description: string }>;
}> {
  const prompt = `Based on these personality assessment responses, match this person to a historical figure and provide analysis.

Responses: ${responses.join("; ")}

Analyze the responses and match to the most suitable historical figure. Provide a detailed analysis in JSON format:

{
  "character": "Historical Figure Name",
  "matchPercentage": 85-95,
  "description": "2-3 sentence description of why they match this figure",
  "achievements": ["3-4 key achievements of the historical figure"],
  "traits": [
    {"title": "Trait Name", "description": "How this trait manifests in both the person and historical figure"},
    {"title": "Another Trait", "description": "Another matching trait"},
    {"title": "Third Trait", "description": "Third matching trait"}
  ]
}

Only return the JSON, no other text.`;

  try {
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating analysis:", error);
    // Fallback analysis
    return {
      character: "Lorenzo de' Medici",
      matchPercentage: 88,
      description: "A natural leader with vision and diplomatic skills.",
      achievements: [
        "Patron of Renaissance arts and culture",
        "Skilled diplomat and political strategist",
        "Economic innovator and banking pioneer"
      ],
      traits: [
        { title: "Visionary", description: "Ability to see beyond the present" },
        { title: "Diplomatic", description: "Skilled in negotiations and relationships" },
        { title: "Cultural", description: "Appreciation for arts and learning" }
      ]
    };
  }
}