-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities2 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activities2_pkey PRIMARY KEY (id),
  CONSTRAINT activities2_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT activities2_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.discussions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT discussions_pkey PRIMARY KEY (id),
  CONSTRAINT discussions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.issues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'Open'::text CHECK (status = ANY (ARRAY['Open'::text, 'In Progress'::text, 'Closed'::text, 'Resolved'::text])),
  priority text DEFAULT 'Medium'::text CHECK (priority = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text, 'Critical'::text])),
  labels ARRAY DEFAULT '{}'::text[],
  created_by uuid NOT NULL,
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT issues_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);
CREATE TABLE public.project_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  filled_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_roles_pkey PRIMARY KEY (id),
  CONSTRAINT project_roles_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT fk_project_roles_filled_by FOREIGN KEY (filled_by) REFERENCES public.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  github_url text,
  tech_stack ARRAY DEFAULT '{}'::text[],
  roles_needed ARRAY DEFAULT '{}'::text[],
  is_public boolean DEFAULT true,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.task_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_activities_pkey PRIMARY KEY (id),
  CONSTRAINT task_activities_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.task_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_comments_pkey PRIMARY KEY (id),
  CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'Not Started'::text CHECK (status = ANY (ARRAY['Not Started'::text, 'In Progress'::text, 'In Review'::text, 'Completed'::text, 'Blocked'::text])),
  priority text DEFAULT 'Medium'::text CHECK (priority = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text])),
  assigned_to uuid,
  created_by uuid NOT NULL,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  github_id text,
  google_id text,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url text,
  github_token text,
  google_token text,
  github_username text,
  username text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);