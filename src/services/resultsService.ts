import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface QuestionResponse {
  question: string;
  response: string;
}

export const saveQuizResult = async (
  questions: string[],
  responses: string[],
  characterResult: string
) => {
  try {
    // Format questions and responses into the required JSON structure
    const questionsAndResponses: QuestionResponse[] = questions.map((question, index) => ({
      question,
      response: responses[index] || ""
    }));

    const { data, error } = await supabase
      .from('results')
      .insert({
        questions_and_responses: questionsAndResponses as unknown as Json,
        character_result: characterResult
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }

    console.log('Quiz result saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to save quiz result:', error);
    throw error;
  }
};