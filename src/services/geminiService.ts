// --- Security Best Practice ---
// The API key should be stored securely as an environment variable (e.g., process.env.GEMINI_API_KEY)
// and not hardcoded directly in the source code.
const GEMINI_API_KEY = "AIzaSyBqITkrtJSAVMhzEgFES5UZd0WtBlbdNP0"; // Replace with your actual key, preferably from an environment variable.

// FIX: Updated the model name to a current, supported version.
// The old 'gemini-pro' model name caused the 404 error.
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

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
        // Log the detailed error from the API for better debugging
        const errorData = await response.json();
        console.error("Gemini API error details:", errorData);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // FIX: Added robust JSON parsing to handle markdown wrappers.
    // This extracts the JSON object from the potentially messy string from the model.
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonString = text.substring(startIndex, endIndex + 1);

    const questionData = JSON.parse(jsonString);
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
  shortDescription: string;
  biography: string;
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
  "shortDescription": "3-7 word concise description of the character's role/identity (e.g., 'Florentine Statesman and Art Patron')",
  "biography": "3-4 paragraph biography about this historical figure, focusing on their character, leadership style, and what made them unique",
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
        // Log the detailed error from the API for better debugging
        const errorData = await response.json();
        console.error("Gemini API error details:", errorData);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // FIX: Added robust JSON parsing to handle markdown wrappers.
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating analysis:", error);
    // Fallback analysis
    return {
      character: "Lorenzo de' Medici",
      matchPercentage: 88,
      description: "A natural leader with vision and diplomatic skills.",
      shortDescription: "Florentine Statesman and Art Patron",
      biography: "Lorenzo de' Medici earned the title 'The Magnificent' not through conquest or wealth alone, but through his extraordinary ability to recognize and nurture human potential. As the de facto ruler of Florence during the High Renaissance, he transformed his city into the cultural beacon of Europe. What set Lorenzo apart was his understanding that true power comes from empowering others. He discovered Michelangelo as a young artist and provided him with both resources and creative freedom. He supported Botticelli, Poliziano, and countless other artists who would define the Renaissance spirit. Lorenzo was a master diplomat who preferred negotiation to warfare, seeing conflict as an opportunity for creative problem-solving. He believed that festivals, art, and celebration were not luxuries but necessities for a thriving society. His approach to leadership was fundamentally humanistic - he governed through inspiration rather than intimidation.",
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