// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tasks: [] as Array<Record<string, unknown>>,
  refetch: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    personalTasks: {
      list: { useQuery: () => ({ data: mocks.tasks, isLoading: false, isError: false, refetch: mocks.refetch }) },
      create: { useMutation: () => ({ mutate: mocks.create, isPending: false }) },
      update: { useMutation: () => ({ mutate: mocks.update, isPending: false }) },
      cancel: { useMutation: () => ({ mutate: mocks.cancel, isPending: false }) },
    },
  },
}));

import { PersonalTaskPanel } from "./PersonalTaskPanel";

afterEach(() => {
  cleanup();
  mocks.tasks = [];
  mocks.refetch.mockClear();
  mocks.create.mockClear();
  mocks.update.mockClear();
  mocks.cancel.mockClear();
});

const task = {
  id: 7,
  title: "Kiracı ile tekrar görüş",
  notes: "Eksik belgeyi sor",
  priority: "normal",
  status: "open",
  dueAt: "2026-09-15T10:00:00.000Z",
  reminderAt: "2026-09-14T10:00:00.000Z",
  linkedLabel: "KRS-2026-014",
  linkedPath: "/contracts",
};

describe("PersonalTaskPanel gerçek kullanıcı akışları", () => {
  it("yeni görev oluşturma formunu gerçek mutation girdisiyle çalıştırır", () => {
    render(<PersonalTaskPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Yeni görev/i }));
    fireEvent.change(screen.getByLabelText("Görev"), { target: { value: "Tapu randevusunu kontrol et" } });
    fireEvent.click(screen.getByRole("button", { name: "Görevi kaydet" }));
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      title: "Tapu randevusunu kontrol et",
      priority: "normal",
      dueAt: null,
      reminderAt: null,
    }));
  });

  it("mevcut görevi düzenleyip update mutation'ına yeni değerleri gönderir", async () => {
    mocks.tasks = [task];
    render(<PersonalTaskPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Kiracı ile tekrar görüş görevini düzenle/i }));
    await waitFor(() => expect((screen.getByLabelText("Görev") as HTMLInputElement).value).toBe("Kiracı ile tekrar görüş"));
    const titleInput = screen.getByLabelText("Görev") as HTMLInputElement;
    fireEvent.input(titleInput, { target: { value: "Kiracı ile yeniden görüş" } });
    expect(titleInput.value).toBe("Kiracı ile yeniden görüş");
    fireEvent.click(screen.getByRole("button", { name: "Değişiklikleri kaydet" }));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      taskId: 7,
      title: "Kiracı ile yeniden görüş",
      notes: "Eksik belgeyi sor",
      priority: "normal",
    }));
  });

  it("görevi tamamlar ve iptal etme akışını kullanıcı düğmeleriyle çağırır", () => {
    mocks.tasks = [task];
    render(<PersonalTaskPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Kiracı ile tekrar görüş görevini tamamla/i }));
    fireEvent.click(screen.getByRole("button", { name: /Kiracı ile tekrar görüş görevini iptal et/i }));
    expect(mocks.update).toHaveBeenCalledWith({ taskId: 7, status: "done" });
    expect(mocks.cancel).toHaveBeenCalledWith({ taskId: 7 });
  });
});
