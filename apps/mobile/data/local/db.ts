import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrateToV1 } from './migrations';

// ─── Constants ───────────────────────────────────────────────────────────────

const DB_NAME = 'debtmap.db';

/**
 * Increment this when a new migration is added.
 * Each version N must have a corresponding `migrateToVN(db)` call in
 * runMigrations() and an entry in MIGRATIONS below.
 */
const CURRENT_SCHEMA_VERSION = 1;

// ─── Migration registry ───────────────────────────────────────────────────────

/**
 * Ordered list of migration functions, indexed by target version (1-based).
 * Add new entries here as the schema evolves:
 *   MIGRATIONS[2] = migrateToV2;
 */
const MIGRATIONS: Record<number, (db: SQLiteDatabase) => Promise<void>> = {
  1: migrateToV1,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Read the current schema_version from app_metadata.
 * Returns 0 if the row does not yet exist (fresh install).
 */
async function getSchemaVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_metadata WHERE key = 'schema_version';`
  );
  return row ? parseInt(row.value, 10) : 0;
}

/**
 * Persist the new schema_version to app_metadata.
 * Uses INSERT OR REPLACE so it works for both first-write and updates.
 */
async function setSchemaVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('schema_version', ?);`,
    [String(version)]
  );
}

/**
 * Ensure the app_metadata table exists before any version reads/writes.
 * This is the only DDL that runs outside a migration transaction.
 */
async function ensureMetadataTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run all pending migrations from the current schema version up to
 * CURRENT_SCHEMA_VERSION.
 *
 * Each migration runs inside its own exclusive transaction so that a partial
 * failure leaves the schema at the last successfully applied version — never
 * in a half-applied state.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await ensureMetadataTable(db);

  const currentVersion = await getSchemaVersion(db);

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return; // Nothing to do
  }

  for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    const migrate = MIGRATIONS[version];

    if (!migrate) {
      throw new Error(
        `[DebtMap DB] No migration defined for schema version ${version}. ` +
        `Add an entry to MIGRATIONS in db.ts.`
      );
    }

    await db.withTransactionAsync(async () => {
      await migrate(db);
      await setSchemaVersion(db, version);
    });
  }
}

/**
 * Open the SQLite database and run all pending migrations.
 * Resolves with a ready-to-use SQLiteDatabase instance.
 *
 * Call this once at application startup (e.g. in the root _layout.tsx).
 * Internal callers should use getDB() instead.
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DB_NAME);

  // Enable WAL mode for better concurrent read performance and crash safety.
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Enforce foreign-key constraints (SQLite disables them by default).
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(db);

  return db;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

/**
 * Module-level promise that resolves to the single shared database connection.
 *
 * The promise is created once on first call and reused on every subsequent
 * call — equivalent to a lazy singleton. Callers that need the DB before
 * initDatabase() has completed will simply await this promise.
 */
let _dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Return the shared database instance, initializing it if this is the first
 * call.
 *
 * Usage (in any repository or service):
 *
 *   const db = await getDB();
 *   const rows = await db.getAllAsync<Debt>('SELECT * FROM debts;');
 */
export async function getDB(): Promise<SQLiteDatabase> {
  if (!_dbPromise) {
    _dbPromise = initDatabase().catch((err) => {
      // Reset so the next call retries instead of caching the rejection.
      _dbPromise = null;
      throw err;
    });
  }
  return _dbPromise;
}
