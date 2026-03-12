import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllergenToggleCard } from "./allergen-toggle-card";
import type { SpeciesProfile } from "@/types/species";

const mockSpecies: SpeciesProfile = {
  slug: "oak",
  name: "Oak",
  scientificName: "Quercus",
  category: "tree",
  description: "Oak pollen description",
  allergySeverity: "severe",
  bloomPeriod: { start: 3, end: 5 },
  peakMonths: [3, 4],
  crossReactivity: ["Birch"],
  prevalence: "Very common",
  grainSize: "20-30 micrometres",
  tips: ["Take antihistamines early."],
};

describe("AllergenToggleCard", () => {
  it("renders species name and severity", () => {
    render(
      <AllergenToggleCard
        species={mockSpecies}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Oak")).toBeInTheDocument();
    expect(screen.getByText("Severe")).toBeInTheDocument();
  });

  it("displays bloom period", () => {
    render(
      <AllergenToggleCard
        species={mockSpecies}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText(/Mar–May/)).toBeInTheDocument();
  });

  it("shows checked state when selected", () => {
    render(
      <AllergenToggleCard
        species={mockSpecies}
        selected={true}
        onToggle={vi.fn()}
      />
    );

    const button = screen.getByTestId("allergen-toggle-oak");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("shows unchecked state when not selected", () => {
    render(
      <AllergenToggleCard
        species={mockSpecies}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    const button = screen.getByTestId("allergen-toggle-oak");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onToggle with species slug when clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <AllergenToggleCard
        species={mockSpecies}
        selected={false}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByTestId("allergen-toggle-oak"));
    expect(onToggle).toHaveBeenCalledWith("oak");
  });

  it("renders moderate severity correctly", () => {
    const moderate = { ...mockSpecies, allergySeverity: "moderate" as const };
    render(
      <AllergenToggleCard
        species={moderate}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  it("renders mild severity correctly", () => {
    const mild = { ...mockSpecies, allergySeverity: "mild" as const };
    render(
      <AllergenToggleCard
        species={mild}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Mild")).toBeInTheDocument();
  });

  it("handles year-wrapping bloom periods", () => {
    const cedar = {
      ...mockSpecies,
      bloomPeriod: { start: 12, end: 3 },
    };
    render(
      <AllergenToggleCard
        species={cedar}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText(/Dec–Mar/)).toBeInTheDocument();
  });
});
