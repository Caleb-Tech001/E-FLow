-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries by session
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow public access for chat messages (using session_id for identification)
CREATE POLICY "Allow all operations on chat messages"
ON public.chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- Create table for uploaded file context (optional, for persisting file uploads)
CREATE TABLE public.chat_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for file lookups
CREATE INDEX idx_chat_files_session ON public.chat_files(session_id);

-- Enable RLS
ALTER TABLE public.chat_files ENABLE ROW LEVEL SECURITY;

-- Allow public access for chat files
CREATE POLICY "Allow all operations on chat files"
ON public.chat_files
FOR ALL
USING (true)
WITH CHECK (true);