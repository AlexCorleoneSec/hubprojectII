-- ============================================================
-- HubProject - Make company the primary field for customers
-- ============================================================

-- Backfill: ensure no existing row has company = NULL
UPDATE customers SET company = name WHERE company IS NULL OR company = '';

-- Empresa is now the required identifier
ALTER TABLE customers ALTER COLUMN company SET NOT NULL;

-- Contact name (PF) is now optional
ALTER TABLE customers ALTER COLUMN name DROP NOT NULL;
