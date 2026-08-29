import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("onlineStart status contract", () => {
  it("boş merkezi ayarı tRPC’nin undefined hatasına düşürmeden null olarak döndürür", () => {
    const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const functionBody = source.match(
      /export async function getOnlineStartSetting[\s\S]*?\n}\n/
    )?.[0];

    expect(functionBody).toBeTruthy();
    expect(functionBody).toContain("OnlineStartSetting | null");
    expect(functionBody).toContain("if (!db) return null;");
    expect(functionBody).toContain(": null;");
    expect(functionBody).not.toContain("return undefined");
  });
});

it("onlineStart status router’ı yardımcı sözleşmeyi kullanır", () => {
  const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  expect(source).toContain("status: protectedProcedure.query(() => getOnlineStartSetting())");
});

it("Genel Bakış çevrimiçi başlangıç sorgusunu retry kapalı ve güvenli veriyle kullanır", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  expect(source).toContain("trpc.onlineStart.status.useQuery(undefined, {");
  expect(source).toContain("const onlineStart = onlineStartQuery.data;");
});
