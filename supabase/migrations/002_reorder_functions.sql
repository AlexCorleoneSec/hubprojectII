-- ============================================================
-- HubProject - Reorder Task Functions
-- ============================================================

-- Moving a task down: shift tasks between old+1 and new position up by 1
CREATE OR REPLACE FUNCTION reorder_tasks_down(
  p_project_id uuid,
  p_old_position integer,
  p_new_position integer
)
RETURNS void AS $$
BEGIN
  UPDATE tasks
  SET position = position - 1
  WHERE project_id = p_project_id
    AND position > p_old_position
    AND position <= p_new_position
    AND is_suggestion = false;
END;
$$ LANGUAGE plpgsql;

-- Moving a task up: shift tasks between new position and old-1 down by 1
CREATE OR REPLACE FUNCTION reorder_tasks_up(
  p_project_id uuid,
  p_old_position integer,
  p_new_position integer
)
RETURNS void AS $$
BEGIN
  UPDATE tasks
  SET position = position + 1
  WHERE project_id = p_project_id
    AND position >= p_new_position
    AND position < p_old_position
    AND is_suggestion = false;
END;
$$ LANGUAGE plpgsql;
