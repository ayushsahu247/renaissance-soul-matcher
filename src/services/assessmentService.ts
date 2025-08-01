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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to save assessment');
    }

    const { data, error } = await supabase
      .from('assessments')
      .upsert({
        user_id: user.id,
        questions: assessmentData.questions,
        responses: assessmentData.responses,
        result: assessmentData.result,
        character_name: assessmentData.result.character
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

export const getUserAssessment = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to retrieve assessment');
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error retrieving assessment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to retrieve assessment:', error);
    throw error;
  }
};