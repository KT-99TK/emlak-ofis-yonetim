// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoleSuggestionCard } from "./RoleSuggestionCard";

describe("RoleSuggestionCard", () => {
  it("broker manager için ekip özetine yönlendirir", () => {
    const onOpenPath = vi.fn();
    render(<RoleSuggestionCard isManager onOpenPath={onOpenPath} />);
    expect(screen.getByText("Önce müdahale bekleyen işleri kontrol edin")).toBeTruthy();
    expect(screen.getByText(/Ekip onayları/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Ekip özetine git/i }));
    expect(onOpenPath).toHaveBeenCalledWith("/team");
  });

  it("danışman için müşteri akışına yönlendirir", () => {
    const onOpenPath = vi.fn();
    render(<RoleSuggestionCard isManager={false} onOpenPath={onOpenPath} />);
    expect(screen.getByText("Bugünkü planınızı kayıtlarla ilişkilendirin")).toBeTruthy();
    expect(screen.getByText(/Açık görevinizi/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Müşterilerime git/i }));
    expect(onOpenPath).toHaveBeenCalledWith("/clients");
  });
});
