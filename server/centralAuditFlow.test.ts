import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
  const auditRows: Record<string, unknown>[] = [];
  const notes: Record<string, unknown>[] = [];
  const fakeDb = {
    select: () => {
      const builder: any = {
        from(table: unknown) {
          builder.table = table;
          return builder;
        },
        orderBy() {
          return builder;
        },
        limit() {
          return Promise.resolve(builder.result());
        },
        result() {
          if (builder.table === state.auditTable) return auditRows;
          if (builder.table === state.noteTable) return notes;
          if (builder.table === state.onlineStartTable)
            return [
              {
                effectiveAt: new Date(Date.now() - 1000),
                noBalanceCarry: 1,
                noOfflineImport: 1,
                configuredByUserId: 1,
                configuredAt: new Date(),
                note: null,
              },
            ];
          return [];
        },
        then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
          return Promise.resolve(builder.result()).then(resolve, reject);
        },
      };
      return builder;
    },
    insert: (table: unknown) => ({
      values: async (values: Record<string, unknown>) => {
        if (table === state.noteTable) {
          notes.push({ id: 9, ...values, status: "open" });
          return [{ insertId: 9 }];
        }
        auditRows.push({ id: auditRows.length + 1, ...values });
        return [{ insertId: auditRows.length }];
      },
    }),
  };
  return {
    auditRows,
    notes,
    fakeDb,
    auditTable: undefined as unknown,
    noteTable: undefined as unknown,
    onlineStartTable: undefined as unknown,
  };
});

vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => state.fakeDb }));

const { auditLogs, brokerGuidanceNotes, onlineStartSettings } = await import("../drizzle/schema");
state.auditTable = auditLogs;
state.noteTable = brokerGuidanceNotes;
state.onlineStartTable = onlineStartSettings;
process.env.DATABASE_URL = "mysql://test";
const { createBrokerGuidanceNote, listAudit } = await import("./db");

describe("central audit persistence flow", () => {
  it("persists a role-scoped central operation and lists the retained audit row", async () => {
    const id = await createBrokerGuidanceNote({
      subject: "general",
      summary: "İş akışı için anonim takip notu",
      actorUserId: 1,
    });
    expect(id).toBe(9);
    expect(state.auditRows).toHaveLength(1);
    expect(state.auditRows[0]).toMatchObject({
      actorUserId: 1,
      action: "broker_guidance_note_created",
      entityType: "brokerGuidanceNote",
      entityId: 9,
    });
    expect(await listAudit(true)).toEqual(state.auditRows);
    expect(await listAudit(false)).toEqual([]);
  });
});
