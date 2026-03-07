import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * V1 migration — establishes the full local schema.
 *
 * Tables created:
 *   debts          — mirrors the Debt domain type (JSON blobs for nested fields)
 *   events         — mirrors FinancialEvent; soft-delete via deleted_at
 *   preferences    — single row per user for UI/app preferences
 *   sync_metadata  — tracks offline→server sync state per entity
 *
 * All IDs are TEXT (UUID v4 from the server or locally generated).
 * Booleans are stored as INTEGER (0/1) — SQLite has no BOOLEAN type.
 * JSON objects are stored as TEXT and parsed at the repository layer.
 * Dates are stored as ISO-8601 TEXT strings.
 */
export async function migrateToV1(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS debts (
      id                TEXT    PRIMARY KEY NOT NULL,
      user_id           TEXT,
      nombre            TEXT    NOT NULL,
      tipo              TEXT    NOT NULL DEFAULT 'HIPOTECARIO',
      entidad           TEXT    NOT NULL DEFAULT '',
      monto             REAL    NOT NULL,
      tasa_ea           REAL    NOT NULL,
      plazo_meses       INTEGER NOT NULL,
      fecha_desembolso  TEXT    NOT NULL,
      estrategia        TEXT    NOT NULL DEFAULT 'REDUCIR_PLAZO',
      snapshot          TEXT,
      dashboard_layout  TEXT,
      is_archived       INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT    NOT NULL,
      updated_at        TEXT    NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS events (
      id            TEXT    PRIMARY KEY NOT NULL,
      debt_id       TEXT    NOT NULL,
      user_id       TEXT,
      tipo          TEXT    NOT NULL,
      cuota_numero  INTEGER NOT NULL,
      fecha         TEXT    NOT NULL,
      monto         REAL    NOT NULL,
      descripcion   TEXT,
      es_recurrente INTEGER NOT NULL DEFAULT 0,
      recurrencia   TEXT,
      created_at    TEXT    NOT NULL,
      updated_at    TEXT    NOT NULL,
      deleted_at    TEXT,
      FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS preferences (
      id                       INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id                  TEXT    UNIQUE,
      theme                    TEXT    NOT NULL DEFAULT 'light',
      locale                   TEXT    NOT NULL DEFAULT 'es-CO',
      default_dashboard_layout TEXT,
      updated_at               TEXT    NOT NULL
    );
  `);

  /**
   * sync_metadata tracks every local entity that needs to be pushed to or
   * reconciled with the remote API.
   *
   * sync_status values:
   *   'pending'   — local change not yet sent to server
   *   'synced'    — server acknowledged this version
   *   'conflict'  — server and local diverged; requires user resolution
   *
   * The composite (entity_type, entity_id) is unique so upserts are safe.
   */
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      id              TEXT PRIMARY KEY NOT NULL,
      entity_type     TEXT NOT NULL,
      entity_id       TEXT NOT NULL,
      sync_status     TEXT NOT NULL DEFAULT 'pending',
      last_synced_at  TEXT,
      server_version  TEXT,
      local_checksum  TEXT,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL,
      UNIQUE (entity_type, entity_id)
    );
  `);

  // ─── Indexes ─────────────────────────────────────────────────────────────

  // Primary query: load all events for a given debt (abonos screen, engine)
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_events_debt_id
      ON events (debt_id);
  `);

  // Sync query: find events modified after a given timestamp
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_events_updated_at
      ON events (updated_at);
  `);

  // Primary query: load all debts belonging to a user
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_debts_user_id
      ON debts (user_id);
  `);

  // Sync queries: find pending/conflicted entities by type
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_sync_metadata_status
      ON sync_metadata (entity_type, sync_status);
  `);
}
