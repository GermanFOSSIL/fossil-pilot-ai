-- Create enum types
CREATE TYPE project_status AS ENUM ('PLANNING', 'EXECUTION', 'COMPLETIONS', 'CLOSED');
CREATE TYPE system_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_ENERGIZATION', 'ENERGIZED');
CREATE TYPE criticality AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE discipline AS ENUM ('MECH', 'ELEC', 'INST', 'CIVIL', 'PIPE', 'OTHER');
CREATE TYPE itr_type AS ENUM ('A', 'B');
CREATE TYPE itr_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
CREATE TYPE punch_category AS ENUM ('A', 'B', 'C');
CREATE TYPE punch_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE preservation_status AS ENUM ('OK', 'OVERDUE');
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'QAQC', 'PRECOM', 'VIEWER');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  status project_status DEFAULT 'PLANNING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create systems table
CREATE TABLE public.systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  criticality criticality DEFAULT 'MEDIUM',
  status system_status DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, code)
);

-- Create subsystems table
CREATE TABLE public.subsystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  status system_status DEFAULT 'NOT_STARTED',
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(system_id, code)
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem_id UUID NOT NULL REFERENCES public.subsystems(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL UNIQUE,
  description TEXT,
  discipline discipline NOT NULL,
  device_type TEXT,
  criticality criticality DEFAULT 'MEDIUM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ITRs table
CREATE TABLE public.itrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  subsystem_id UUID REFERENCES public.subsystems(id) ON DELETE CASCADE,
  itr_code TEXT NOT NULL UNIQUE,
  itr_type itr_type NOT NULL,
  discipline discipline NOT NULL,
  status itr_status DEFAULT 'NOT_STARTED',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create punch_items table
CREATE TABLE public.punch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem_id UUID NOT NULL REFERENCES public.subsystems(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category punch_category NOT NULL,
  status punch_status DEFAULT 'OPEN',
  raised_by TEXT,
  due_date DATE,
  closed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create preservation_tasks table
CREATE TABLE public.preservation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  last_done_date DATE,
  next_due_date DATE NOT NULL,
  status preservation_status DEFAULT 'OK',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  system_id UUID REFERENCES public.systems(id) ON DELETE CASCADE,
  subsystem_id UUID REFERENCES public.subsystems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'VIEWER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preservation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Allow authenticated users to read all data
CREATE POLICY "Allow authenticated users to read projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read systems"
  ON public.systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read subsystems"
  ON public.subsystems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read tags"
  ON public.tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read ITRs"
  ON public.itrs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read punch items"
  ON public.punch_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read preservation tasks"
  ON public.preservation_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read AI insights"
  ON public.ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to read their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow ADMIN users to modify data
CREATE POLICY "Allow admins to insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Allow admins to update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_systems_updated_at
  BEFORE UPDATE ON public.systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subsystems_updated_at
  BEFORE UPDATE ON public.subsystems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itrs_updated_at
  BEFORE UPDATE ON public.itrs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_punch_items_updated_at
  BEFORE UPDATE ON public.punch_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preservation_tasks_updated_at
  BEFORE UPDATE ON public.preservation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'VIEWER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();