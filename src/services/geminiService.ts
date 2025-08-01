import { supabase } from "@/integrations/supabase/client";

export async function generateNextQuestion(
  questionNumber: number,
  previousResponses: string[]
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-question', {
      body: { questionNumber, previousResponses }
    });

    if (error) {
      console.error("Error calling generate-question function:", error);
      throw error;
    }

    return data.question;
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
  try {
    const { data, error } = await supabase.functions.invoke('generate-analysis', {
      body: { responses }
    });

    if (error) {
      console.error("Error calling generate-analysis function:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error generating analysis:", error);
    // Fallback analysis
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