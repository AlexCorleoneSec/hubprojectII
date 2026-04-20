-- ============================================================
-- HubProject - Customers Entity + Project Association
-- ============================================================

-- customers table
CREATE TABLE customers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text,
  phone       text,
  company     text,
  notes       text,
  created_by  uuid        REFERENCES profiles(id) NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Associate projects to customers (nullable for backward compatibility)
ALTER TABLE projects
  ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_customers_created_by  ON customers(created_by);
CREATE INDEX idx_projects_customer_id  ON projects(customer_id);

-- updated_at trigger
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_authenticated"
  ON customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "customers_insert_admin_manager"
  ON customers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "customers_update_admin_manager"
  ON customers FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

CREATE POLICY "customers_delete_admin_manager"
  ON customers FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
  ));

-- ============================================================
-- SQL function: aggregate time logs by project
-- Uses RPC to avoid unreliable nested-filter syntax in PostgREST
-- ============================================================

CREATE OR REPLACE FUNCTION get_project_timelogs(
  p_project_id uuid,
  p_month      text DEFAULT NULL  -- 'YYYY-MM' or NULL for all time
)
RETURNS TABLE (
  id            uuid,
  hours         numeric,
  description   text,
  logged_by     text,
  log_date      date,
  subtask_id    uuid,
  subtask_title text,
  task_id       uuid,
  task_title    text
)
LANGUAGE sql STABLE AS $$
  SELECT
    tl.id,
    tl.hours,
    tl.description,
    tl.logged_by,
    tl.log_date,
    s.id    AS subtask_id,
    s.title AS subtask_title,
    t.id    AS task_id,
    t.title AS task_title
  FROM time_logs tl
  JOIN subtasks  s ON s.id = tl.subtask_id
  JOIN tasks     t ON t.id = s.task_id
  WHERE t.project_id = p_project_id
    AND (
      p_month IS NULL
      OR (
        tl.log_date >= (p_month || '-01')::date
        AND tl.log_date < ((p_month || '-01')::date + interval '1 month')::date
      )
    )
  ORDER BY tl.log_date ASC;
$$;
