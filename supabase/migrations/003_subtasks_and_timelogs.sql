-- ============================================================
-- HubProject - Subtasks, Time Logs, and Task Enhancements
-- ============================================================

-- Add new columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags        text[]        DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours numeric(6,2);

-- subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid        REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title        text        NOT NULL,
  description  text,
  is_done      boolean     NOT NULL DEFAULT false,
  assigned_to  text,
  due_date     date,
  position     integer     NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- time_logs (only linked to subtasks)
CREATE TABLE IF NOT EXISTS time_logs (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id  uuid         REFERENCES subtasks(id) ON DELETE CASCADE NOT NULL,
  hours       numeric(6,2) NOT NULL CHECK (hours > 0),
  description text,
  log_date    date         NOT NULL DEFAULT CURRENT_DATE,
  logged_by   text,
  created_at  timestamptz  DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id     ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_subtask_id ON time_logs(subtask_id);

-- updated_at trigger for subtasks
CREATE TRIGGER trg_subtasks_updated_at
  BEFORE UPDATE ON subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE subtasks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- subtasks policies
CREATE POLICY "subtasks_select_authenticated"
  ON subtasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "subtasks_insert_admin_manager"
  ON subtasks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "subtasks_update_admin_manager"
  ON subtasks FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "subtasks_delete_admin_manager"
  ON subtasks FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

-- time_logs policies
CREATE POLICY "time_logs_select_authenticated"
  ON time_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "time_logs_insert_admin_manager"
  ON time_logs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "time_logs_delete_admin_manager"
  ON time_logs FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));
