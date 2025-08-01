import { supabase } from "@/integrations/supabase/client";

interface AssessmentData {
  questions: string[];
  responses: string[];
  result: {
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
  };
}

export const saveAssessment = async (assessmentData: AssessmentData) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        questions: assessmentData.questions,
        responses: assessmentData.responses,
        result: assessmentData.result
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }

    console.log('Assessment saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to save assessment:', error);
    throw error;
  }
};