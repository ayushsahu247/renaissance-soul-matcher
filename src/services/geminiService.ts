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

Generate question ${questionNumber} of 7. Create a COMPLETELY DIFFERENT type of scenario from any previous questions.

DIVERSE SCENARIO TYPES (pick ONE that hasn't been used):
- Leadership crisis: Leading a team through unexpected disaster
- Creative challenge: Balancing innovation with practical constraints
- Resource allocation: Distributing limited resources among competing needs
- Social conflict: Mediating between opposing groups with valid concerns
- Personal sacrifice: Choosing between personal gain and greater good
- Knowledge vs action: Having information others don't - when to act/speak
- Legacy building: How to be remembered vs immediate impact
- Change vs tradition: Reforming established systems people depend on

Create a realistic scenario that:
- Tests core values, decision-making patterns, and natural instincts
- Reveals leadership style, risk tolerance, and moral priorities
- Shows whether they're driven by logic, emotion, duty, or personal conviction
- Exposes their relationship with power, influence, and responsibility
- Under 45 words total
- Has NO obvious "correct" answer - requires revealing personal philosophy
- Is completely different from previous questions in both topic and approach

Format as JSON:
{
  "title": "2-3 Word Title",
  "question": "Engaging scenario that forces them to reveal their true nature and decision-making process",
  "placeholder": "Brief response starter..."
}

Make it thought-provoking and personal. Focus on revealing character essence, not just moral choices.

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
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95
        }
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
  birthYear: number;
  deathYear: number;
  location: string;
  achievements: string[];
  traits: Array<{ title: string; description: string }>;
}> {
  const prompt = `Based on these personality assessment responses, match this person to a historical figure and provide analysis.

Responses: ${responses.join("; ")}

Match to a WIDELY RECOGNIZED historical figure that most educated people would know - someone taught in world history classes with widespread cultural recognition. Focus on "household names" of history across all cultures and time periods.

EXAMPLES OF APPROPRIATE FIGURES: Napoleon Bonaparte, Cleopatra VII, Leonardo da Vinci, Albert Einstein, Winston Churchill, Genghis Khan, Alexander the Great, Julius Caesar, Gandhi, Joan of Arc, Benjamin Franklin, Marie Curie, Theodore Roosevelt, Elizabeth I, Confucius, Hannibal, Catherine the Great, Abraham Lincoln, Mozart, Shakespeare, etc.

AVOID: Obscure regional figures, lesser-known nobles, niche personalities, random chieftains, or anyone people would need to Google to recognize.

Analyze responses and match based on personality patterns, decision-making style, moral framework, leadership approach, and core motivations. Provide detailed analysis in JSON format:

{
  "character": "Historical Figure Name",
  "matchPercentage": 85-95,
  "description": "2-3 sentence description of why they match this figure",
  "shortDescription": "3-7 word concise description of the character's role/identity",
  "biography": "3-4 paragraph biography about this historical figure, focusing on their character, leadership style, and what made them unique",
  "birthYear": 100,
  "deathYear": 200,
  "location": "City, Country",
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
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9
        }
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
    // Fallback analysis - Changed to someone different to reduce Lorenzo bias
    return {
      character: "Marcus Aurelius",
      matchPercentage: 88,
      description: "A thoughtful leader who balances wisdom with action, prioritizing long-term thinking and principled decision-making.",
      shortDescription: "Philosopher Emperor and Stoic Leader",
      biography: "Marcus Aurelius stood as one of history's most unique figures - a philosopher who wielded absolute power yet remained grounded in wisdom and humility. As Roman Emperor from 161 to 180 CE, he faced constant military campaigns, plague, and political challenges, yet never abandoned his commitment to Stoic philosophy and self-improvement. His personal journal, 'Meditations,' reveals a leader constantly examining his own actions and motivations, striving to serve the greater good rather than personal ambition. Marcus Aurelius believed that true leadership came from inner discipline and rational thinking, approaching each crisis with measured consideration rather than emotional reaction. He demonstrated that power could be wielded with wisdom, compassion, and an unwavering commitment to duty over personal desires.",
      birthYear: 121,
      deathYear: 180,
      location: "Rome, Roman Empire",
      achievements: [
        "Successfully defended Roman Empire during multiple military campaigns",
        "Authored 'Meditations', one of history's greatest philosophical works",
        "Maintained stability during plague and internal conflicts",
        "Exemplified philosopher-king ideal in actual governance"
      ],
      traits: [
        { title: "Reflective", description: "Both you and Marcus value deep thinking and self-examination before making decisions" },
        { title: "Duty-Bound", description: "Strong sense of responsibility and commitment to serving something greater than yourself" },
        { title: "Balanced", description: "Ability to combine practical action with philosophical wisdom and long-term perspective" }
      ]
    };
  }
}