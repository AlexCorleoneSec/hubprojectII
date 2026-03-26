-- ============================================================
-- HubProject - Initial Database Schema
-- ============================================================

-- =========================
-- ENUMS
-- =========================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done', 'overdue');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_quadrant AS ENUM ('quick_win', 'big_project', 'thankless', 'avoid');
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

-- =========================
-- TABLES
-- =========================

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text        NOT NULL,
  email      text        NOT NULL UNIQUE,
  role       user_role   NOT NULL DEFAULT 'viewer',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- projects
CREATE TABLE projects (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text           NOT NULL,
  description     text,
  status          project_status NOT NULL DEFAULT 'active',
  client_token    text           NOT NULL UNIQUE,
  client_pin_hash text           NOT NULL,
  created_by      uuid           REFERENCES profiles(id) NOT NULL,
  created_at      timestamptz    DEFAULT now(),
  updated_at      timestamptz    DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         uuid            REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title              text            NOT NULL,
  description        text,
  status             task_status     NOT NULL DEFAULT 'backlog',
  priority           task_priority   NOT NULL DEFAULT 'medium',
  quadrant           task_quadrant,
  start_date         timestamptz,
  due_date           timestamptz,
  assigned_to        uuid            REFERENCES profiles(id),
  is_suggestion      boolean         NOT NULL DEFAULT false,
  suggested_by_name  text,
  suggested_by_email text,
  suggestion_status  suggestion_status,
  position           integer         NOT NULL DEFAULT 0,
  created_at         timestamptz     DEFAULT now(),
  updated_at         timestamptz     DEFAULT now()
);

-- invites
CREATE TABLE invites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  role        user_role   NOT NULL DEFAULT 'viewer',
  invited_by  uuid        REFERENCES profiles(id) NOT NULL,
  accepted_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_due_date   ON tasks(due_date) WHERE status != 'done';
CREATE INDEX idx_projects_client_token ON projects(client_token);
CREATE INDEX idx_invites_email    ON invites(email);

-- =========================
-- FUNCTIONS & TRIGGERS
-- =========================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on projects
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger on tasks
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to mark overdue tasks
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE tasks
  SET    status = 'overdue'
  WHERE  due_date < (NOW() AT TIME ZONE 'America/Sao_Paulo')
    AND  status NOT IN ('done', 'overdue');
END;
$$ LANGUAGE plpgsql;

-- =========================
-- ROW LEVEL SECURITY
-- =========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites  ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---- projects ----

CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "projects_insert_admin_manager"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "projects_update_admin_manager"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "projects_delete_admin_manager"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

-- ---- tasks ----

CREATE POLICY "tasks_select_authenticated"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tasks_insert_admin_manager"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "tasks_update_admin_manager"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "tasks_delete_admin_manager"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

-- ---- invites ----

CREATE POLICY "invites_select_own"
  ON invites FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "invites_insert_admin"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "invites_update_admin"
  ON invites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "invites_delete_admin"
  ON invites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- =========================
-- REALTIME
-- =========================

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
