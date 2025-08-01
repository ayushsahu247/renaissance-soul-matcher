-- Create Results table for quiz data storage
CREATE TABLE public.results (
  id BIGSERIAL PRIMARY KEY,
  questions_and_responses JSONB NOT NULL,
  character_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security but allow public access for anonymous users
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert results (for anonymous quiz takers)
CREATE POLICY "Anyone can insert quiz results" 
ON public.results 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view results (if needed for analytics)
CREATE POLICY "Anyone can view quiz results" 
ON public.results 
FOR SELECT 
USING (true);