import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/MobileCompanion.tsx"),
  "utf8"
);

describe("MobileCompanion kira müşteri hizmeti", () => {
  it("sunucunun rol kapsamlı hizmet görevi listesini yeniler", () => {
    expect(pageSource).toContain("activeRentals.serviceTasks.list.useQuery");
    expect(pageSource).toContain("rentalServiceTasks.refetch()");
    expect(pageSource).toContain("listPersonalRentalServiceTasks");
  });

  it("broker veya danışman görünümünü rol bilgisiyle ayrı render-testli görev bileşenine bağlar", () => {
    expect(pageSource).toContain("RentalServiceTaskMobilePanel");
    expect(pageSource).toContain("isManager={Boolean(isManager)}");
    expect(pageSource).toContain('state={rentalServiceTasks.isLoading ? "loading" : rentalServiceTasks.isError ? "error" : "ready"}');
    expect(pageSource).toContain("personalTasks={personalServiceTasks}");
  });
});
