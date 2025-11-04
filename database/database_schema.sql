-- =====================================================
-- DevSync Database Schema
-- Complete SQL schema for all tables, relationships, and constraints
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: users
-- =====================================================
-- Stores user account information including GitHub and Google authentication data

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT,
  google_id TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  github_token TEXT,
  google_token TEXT,
  github_username TEXT,
  username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username);

-- Trigger for updated_at on users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: projects
-- =====================================================
-- Stores project information and metadata

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  roles_needed TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);

-- Trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: project_roles
-- =====================================================
-- Links users to projects with specific role assignments

CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can't have the same role twice in a project
  CONSTRAINT unique_project_role_filled UNIQUE(project_id, title, filled_by)
);

-- Indexes for project_roles table
CREATE INDEX IF NOT EXISTS idx_project_roles_project_id ON project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_project_roles_filled_by ON project_roles(filled_by);
CREATE INDEX IF NOT EXISTS idx_project_roles_project_filled ON project_roles(project_id, filled_by) WHERE filled_by IS NOT NULL;

-- =====================================================
-- TABLE: tasks
-- =====================================================
-- Stores task information for projects

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'In Review', 'Completed', 'Blocked')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Trigger for updated_at on tasks
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when status changes to 'Completed'
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'Completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_completed_at_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_task_completed_at();

-- =====================================================
-- TABLE: task_activities
-- =====================================================
-- Tracks all activity and changes made to tasks

CREATE TABLE IF NOT EXISTS task_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for task_activities table
CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_user_id ON task_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_created_at ON task_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_activities_activity_type ON task_activities(activity_type);

-- =====================================================
-- TABLE: task_comments
-- =====================================================
-- Stores comments on tasks

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for task_comments table
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- Trigger for updated_at on task_comments
CREATE TRIGGER update_task_comments_updated_at
BEFORE UPDATE ON task_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: issues
-- =====================================================
-- Stores project issues/bugs

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed', 'Resolved')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  labels TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for issues table
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_by ON issues(created_by);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- Trigger for updated_at on issues
CREATE TRIGGER update_issues_updated_at
BEFORE UPDATE ON issues
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: discussions
-- =====================================================
-- Stores project discussions/comments

CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for discussions table
CREATE INDEX IF NOT EXISTS idx_discussions_project_id ON discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

-- Trigger for updated_at on discussions
CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON discussions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: activities2
-- =====================================================
-- General project activity feed

CREATE TABLE IF NOT EXISTS activities2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities2 table
CREATE INDEX IF NOT EXISTS idx_activities2_project_id ON activities2(project_id);
CREATE INDEX IF NOT EXISTS idx_activities2_user_id ON activities2(user_id);
CREATE INDEX IF NOT EXISTS idx_activities2_created_at ON activities2(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities2_activity_type ON activities2(activity_type);

-- GIN index for JSONB activity_data queries
CREATE INDEX IF NOT EXISTS idx_activities2_activity_data ON activities2 USING GIN (activity_data);

-- =====================================================
-- TABLE RELATIONSHIPS SUMMARY
-- =====================================================

-- users
--   ├── projects (creator_id) [CASCADE]
--   ├── project_roles (filled_by) [SET NULL]
--   ├── tasks (assigned_to, created_by) [SET NULL, CASCADE]
--   ├── task_activities (user_id) [CASCADE]
--   ├── task_comments (user_id) [CASCADE]
--   ├── issues (created_by, assigned_to) [CASCADE, SET NULL]
--   ├── discussions (user_id) [CASCADE]
--   └── activities2 (user_id) [CASCADE]

-- projects
--   ├── project_roles (project_id) [CASCADE]
--   ├── tasks (project_id) [CASCADE]
--   ├── issues (project_id) [CASCADE]
--   ├── discussions (project_id) [CASCADE]
--   └── activities2 (project_id) [CASCADE]

-- tasks
--   ├── task_activities (task_id) [CASCADE]
--   └── task_comments (task_id) [CASCADE]

-- =====================================================
-- COMMON QUERIES & VIEWS
-- =====================================================

-- View: Project with member count
CREATE OR REPLACE VIEW project_member_counts AS
SELECT 
  p.id,
  p.title,
  p.creator_id,
  COUNT(DISTINCT pr.filled_by) + 
  CASE WHEN p.creator_id IS NOT NULL THEN 1 ELSE 0 END as total_members
FROM projects p
LEFT JOIN project_roles pr ON p.id = pr.project_id AND pr.filled_by IS NOT NULL
GROUP BY p.id, p.title, p.creator_id;

-- View: User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT p.id) as projects_created,
  COUNT(DISTINCT pr.project_id) as projects_joined,
  COUNT(DISTINCT t.id) as tasks_created,
  COUNT(DISTINCT tc.id) as comments_made
FROM users u
LEFT JOIN projects p ON u.id = p.creator_id
LEFT JOIN project_roles pr ON u.id = pr.filled_by
LEFT JOIN tasks t ON u.id = t.created_by
LEFT JOIN task_comments tc ON u.id = tc.user_id
GROUP BY u.id, u.name, u.email;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all projects with their creators and member counts
-- SELECT 
--   p.*,
--   u.name as creator_name,
--   u.email as creator_email,
--   COUNT(DISTINCT pr.filled_by) as member_count
-- FROM projects p
-- JOIN users u ON p.creator_id = u.id
-- LEFT JOIN project_roles pr ON p.id = pr.project_id AND pr.filled_by IS NOT NULL
-- GROUP BY p.id, u.name, u.email;

-- Get all tasks for a project with assignee info
-- SELECT 
--   t.*,
--   u1.name as assigned_to_name,
--   u2.name as created_by_name
-- FROM tasks t
-- LEFT JOIN users u1 ON t.assigned_to = u1.id
-- JOIN users u2 ON t.created_by = u2.id
-- WHERE t.project_id = 'YOUR_PROJECT_ID';

-- Get project activity feed
-- SELECT 
--   a2.*,
--   u.name as user_name,
--   u.avatar_url as user_avatar
-- FROM activities2 a2
-- JOIN users u ON a2.user_id = u.id
-- WHERE a2.project_id = 'YOUR_PROJECT_ID'
-- ORDER BY a2.created_at DESC
-- LIMIT 20;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

