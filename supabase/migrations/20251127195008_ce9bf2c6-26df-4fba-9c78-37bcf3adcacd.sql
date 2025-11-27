-- Create import_logs table to track all data imports
CREATE TABLE IF NOT EXISTS public.import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  import_type TEXT NOT NULL, -- 'csv', 'excel', 'api', 'sap', 'gotechnology'
  entity_type TEXT NOT NULL, -- 'itrs', 'tags', 'punch_items', 'preservation_tasks', 'systems', 'subsystems'
  project_id UUID REFERENCES public.projects(id),
  system_id UUID REFERENCES public.systems(id),
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_details JSONB,
  file_name TEXT,
  metadata JSONB
);

-- Enable RLS on import_logs
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own import logs, admins can view all
CREATE POLICY "Users can view their own import logs"
  ON public.import_logs FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Policy: Authenticated users can insert import logs
CREATE POLICY "Authenticated users can insert import logs"
  ON public.import_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for data tables to allow INSERT/UPDATE/DELETE for authenticated users

-- ITRs policies
CREATE POLICY "Authenticated users can insert ITRs"
  ON public.itrs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ITRs"
  ON public.itrs FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ITRs"
  ON public.itrs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Tags policies
CREATE POLICY "Authenticated users can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tags"
  ON public.tags FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tags"
  ON public.tags FOR DELETE
  USING (auth.role() = 'authenticated');

-- Punch Items policies
CREATE POLICY "Authenticated users can insert punch items"
  ON public.punch_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update punch items"
  ON public.punch_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete punch items"
  ON public.punch_items FOR DELETE
  USING (auth.role() = 'authenticated');

-- Preservation Tasks policies
CREATE POLICY "Authenticated users can insert preservation tasks"
  ON public.preservation_tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update preservation tasks"
  ON public.preservation_tasks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete preservation tasks"
  ON public.preservation_tasks FOR DELETE
  USING (auth.role() = 'authenticated');

-- Systems policies
CREATE POLICY "Authenticated users can insert systems"
  ON public.systems FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update systems"
  ON public.systems FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete systems"
  ON public.systems FOR DELETE
  USING (auth.role() = 'authenticated');

-- Subsystems policies
CREATE POLICY "Authenticated users can insert subsystems"
  ON public.subsystems FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subsystems"
  ON public.subsystems FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subsystems"
  ON public.subsystems FOR DELETE
  USING (auth.role() = 'authenticated');

-- Projects delete policy (was missing)
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  ));