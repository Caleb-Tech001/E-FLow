-- Create table for analysis runs
CREATE TABLE public.analysis_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enriching', 'analyzing', 'completed', 'failed')),
  emails_count INTEGER NOT NULL DEFAULT 0,
  enriched_data JSONB,
  segments JSONB,
  actions JSONB,
  settings JSONB,
  error_message TEXT
);

-- Enable RLS (but allow anonymous access for MVP)
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (MVP - no auth required)
CREATE POLICY "Allow anonymous access to analysis runs"
ON public.analysis_runs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analysis_runs_updated_at
BEFORE UPDATE ON public.analysis_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();