-- Create assessments table to store questions, responses, and results
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questions JSONB NOT NULL,
  responses JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since no auth yet)
CREATE POLICY "Allow public access to assessments" 
ON public.assessments 
FOR ALL 
USING (true);