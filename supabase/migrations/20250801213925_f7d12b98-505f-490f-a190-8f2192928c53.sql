-- Add user_id and character_name columns to assessments table
ALTER TABLE public.assessments 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN character_name TEXT;

-- Add unique constraint to ensure one assessment per user
ALTER TABLE public.assessments 
ADD CONSTRAINT unique_user_assessment UNIQUE (user_id);

-- Drop the existing public access policy
DROP POLICY IF EXISTS "Allow public access to assessments" ON public.assessments;

-- Create user-specific RLS policies
CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = user_id);