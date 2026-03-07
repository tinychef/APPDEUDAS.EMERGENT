/**
 * debtsRepository.ts
 *
 * Offline-first CRUD for the `debts` table.
 *
 * Every write operation atomically:
 *   1. Mutates the `debts` row and refreshes `updated_at`.
 *   2. Upserts a `sync_metadata` entry marked 'pending' for that debt.
 *
 * Both steps run inside a single exclusive transaction so the database is
 * never left in a state where a debt row is updated but its sync record is not
 * (or vice-versa).
 *
 * NOTE: Domain types are declared here provisionally. They will be moved to
 * `frontend/domain/types.ts` in a later migration phase and replaced with an
 * import.
 *
 * Do NOT import Zustand or any API client from this file.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import type { SQLiteBindValue } from 'expo-sqlite/build/NativeStatement';
import { getDB } from '../db';

// ─── Domain types (provisional — will move to domain/types.ts) ───────────────

export type DebtStrategy = 'REDUCIR_PLAZO' | 'REDUCIR_CUOTA';
export type DebtTipo = 'HIPOTECARIO' | 'CONSUMO' | 'LIBRE_INVERSION';

export interface DebtSnapshot {
  saldoActual: number;
  plazoReal: number;
  cuotaActual: number;
  ahorroIntereses: number;
  mesesAhorrados: number;
  updatedAt: string;
}

export interface DashboardBlock {
  blockId: string;
  visible: boolean;
  order: number;
}

export interface Debt {
  id: string;
  userId: string | null;
  nombre: string;
  tipo: DebtTipo;
  entidad: string;
  monto: number;
  tasaEA: number;
  plazoMeses: number;
  fechaDesembolso: string;
  estrategia: DebtStrategy;
  snapshot?: DebtSnapshot;
  dashboardLayout: DashboardBlock[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fields accepted on insert. `createdAt` and `updatedAt` are set by the
 * repository and must not be supplied by the caller.
 */
export type InsertDebtParams = Omit<Debt, 'createdAt' | 'updatedAt'>;

/**
 * Fields that may be patched after creation. `id`, `userId`, and timestamps
 * are excluded — they must never be changed through a patch operation.
 */
export type UpdateDebtParams = Partial<
  Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

// ─── SQLite row shape (snake_case, raw types) ─────────────────────────────────

interface DebtRow {
  id: string;
  user_id: string | null;
  nombre: string;
  tipo: string;
  entidad: string;
  monto: number;
  tasa_ea: number;
  plazo_meses: number;
  fecha_desembolso: string;
  estrategia: string;
  snapshot: string | null;
  dashboard_layout: string | null;
  is_archived: number;           // SQLite stores booleans as 0 / 1
  created_at: string;
  updated_at: string;
}

// ─── Row ↔ Domain mappers ─────────────────────────────────────────────────────

function rowToDebt(row: DebtRow): Debt {
  return {
    id: row.id,
    userId: row.user_id,
    nombre: row.nombre,
    tipo: row.tipo as DebtTipo,
    entidad: row.entidad,
    monto: row.monto,
    tasaEA: row.tasa_ea,
    plazoMeses: row.plazo_meses,
    fechaDesembolso: row.fecha_desembolso,
    estrategia: row.estrategia as DebtStrategy,
    snapshot: row.snapshot
      ? (JSON.parse(row.snapshot) as DebtSnapshot)
      : undefined,
    dashboardLayout: row.dashboard_layout
      ? (JSON.parse(row.dashboard_layout) as DashboardBlock[])
      : [],
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Sync helper ──────────────────────────────────────────────────────────────

/**
 * Upsert a `sync_metadata` row for a debt, marking it as 'pending'.
 *
 * Must be called with the `db` object provided by `withTransactionAsync`
 * so it runs inside the same transaction as the debt mutation.
 *
 * The synthetic primary key `'debt_' + debtId` is deterministic, so repeated
 * upserts for the same debt accumulate no duplicate rows. The COALESCE
 * sub-select preserves the original `created_at` when the row already exists,
 * avoiding an ever-refreshing creation timestamp.
 */
async function markDebtPending(db: SQLiteDatabase, debtId: string): Promise<void> {
  const now = new Date().toISOString();
  const syncId = `debt_${debtId}`;

  await db.runAsync(
    `INSERT OR REPLACE INTO sync_metadata
       (id, entity_type, entity_id, sync_status, created_at, updated_at)
     VALUES (
       ?, 'debt', ?, 'pending',
       COALESCE(
         (SELECT created_at FROM sync_metadata
          WHERE entity_type = 'debt' AND entity_id = ?),
         ?
       ),
       ?
     );`,
    [syncId, debtId, debtId, now, now],
  );
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const debtsRepository = {
  /**
   * Return all non-archived debts for a given user, ordered by `updated_at`
   * descending (most recently changed first).
   */
  async getDebtsByUser(userId: string): Promise<Debt[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<DebtRow>(
      `SELECT *
       FROM   debts
       WHERE  user_id = ? AND is_archived = 0
       ORDER  BY updated_at DESC;`,
      [userId],
    );
    return rows.map(rowToDebt);
  },

  /**
   * Return a single debt by its primary key, regardless of archived state.
   * Returns `null` when not found.
   */
  async getDebtById(id: string): Promise<Debt | null> {
    const db = await getDB();
    const row = await db.getFirstAsync<DebtRow>(
      `SELECT * FROM debts WHERE id = ?;`,
      [id],
    );
    return row ? rowToDebt(row) : null;
  },

  /**
   * Insert a new debt and immediately mark it as pending sync.
   *
   * The caller is responsible for supplying a unique `id` (e.g. a UUID v4).
   * `createdAt` and `updatedAt` are set to the current UTC instant by this
   * function.
   *
   * Returns the fully hydrated `Debt` object that was written.
   */
  async insertDebt(params: InsertDebtParams): Promise<Debt> {
    const db = await getDB();
    const now = new Date().toISOString();

    const debt: Debt = { ...params, createdAt: now, updatedAt: now };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO debts (
           id, user_id, nombre, tipo, entidad,
           monto, tasa_ea, plazo_meses, fecha_desembolso, estrategia,
           snapshot, dashboard_layout, is_archived,
           created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          debt.id,
          debt.userId,
          debt.nombre,
          debt.tipo,
          debt.entidad,
          debt.monto,
          debt.tasaEA,
          debt.plazoMeses,
          debt.fechaDesembolso,
          debt.estrategia,
          debt.snapshot ? JSON.stringify(debt.snapshot) : null,
          debt.dashboardLayout.length > 0
            ? JSON.stringify(debt.dashboardLayout)
            : null,
          debt.isArchived ? 1 : 0,
          debt.createdAt,
          debt.updatedAt,
        ],
      );

      await markDebtPending(db, debt.id);
    });

    return debt;
  },

  /**
   * Apply a partial update to an existing debt.
   *
   * Only columns whose keys are present in `patch` are touched. The
   * `updated_at` column is always refreshed. A `sync_metadata` entry is always
   * upserted as 'pending', even when only `updated_at` changed.
   *
   * Returns the updated `Debt`, or `null` when no row with that `id` exists.
   */
  async updateDebt(id: string, patch: UpdateDebtParams): Promise<Debt | null> {
    const db = await getDB();
    const now = new Date().toISOString();

    // Build the SET clause dynamically so we only touch supplied fields.
    // `updated_at` is always included regardless of the patch contents.
    const setClauses: string[] = ['updated_at = ?'];
    const values: SQLiteBindValue[] = [now];

    const append = (column: string, value: SQLiteBindValue): void => {
      setClauses.push(`${column} = ?`);
      values.push(value);
    };

    if (patch.nombre !== undefined) append('nombre', patch.nombre);
    if (patch.tipo !== undefined) append('tipo', patch.tipo);
    if (patch.entidad !== undefined) append('entidad', patch.entidad);
    if (patch.monto !== undefined) append('monto', patch.monto);
    if (patch.tasaEA !== undefined) append('tasa_ea', patch.tasaEA);
    if (patch.plazoMeses !== undefined) append('plazo_meses', patch.plazoMeses);
    if (patch.fechaDesembolso !== undefined) append('fecha_desembolso', patch.fechaDesembolso);
    if (patch.estrategia !== undefined) append('estrategia', patch.estrategia);
    if (patch.isArchived !== undefined) append('is_archived', patch.isArchived ? 1 : 0);

    if (patch.snapshot !== undefined) {
      append('snapshot', patch.snapshot ? JSON.stringify(patch.snapshot) : null);
    }

    if (patch.dashboardLayout !== undefined) {
      append(
        'dashboard_layout',
        patch.dashboardLayout.length > 0
          ? JSON.stringify(patch.dashboardLayout)
          : null,
      );
    }

    // The WHERE binding is always the last positional parameter.
    values.push(id);

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE debts SET ${setClauses.join(', ')} WHERE id = ?;`,
        values,
      );
      await markDebtPending(db, id);
    });

    return this.getDebtById(id);
  },

  /**
   * Soft-delete a debt by setting `is_archived = 1`.
   *
   * The row is retained in the database so the sync service can propagate the
   * archival to the remote API and the amortization history is preserved for
   * audit purposes.
   *
   * Returns the updated `Debt`, or `null` when no row with that `id` exists.
   */
  async softDeleteDebt(id: string): Promise<Debt | null> {
    const db = await getDB();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE debts
         SET    is_archived = 1,
                updated_at  = ?
         WHERE  id = ?;`,
        [now, id],
      );
      await markDebtPending(db, id);
    });

    return this.getDebtById(id);
  },
};
